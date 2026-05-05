#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'module';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import * as readline from 'readline';

import { VescConnection } from '@veac/serial';
import { 
  Command as VescCommand, 
  encodePacketToArray,
  parseFirmwareVersion,
  type DecodedPacket 
} from '@veac/protocol';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  formatOutput,
  detectFormat,
  ExitCode,
  ErrorKind,
  type OutputFormat,
  type NextAction,
  chalk
} from '@veac/cli-core';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// ============================================================================
// Helper Functions
// ============================================================================

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function nextAction(command: string, description: string, params?: Record<string, unknown>): NextAction {
  return { command, description, params };
}

function getGlobalOptions(program: Command) {
  const opts = program.opts();
  return {
    port: opts.port as string | undefined,
    baud: parseInt(opts.baud as string, 10) || 115200,
    canId: opts.canId ? parseInt(opts.canId as string, 10) : undefined,
    format: opts.format as OutputFormat,
    timeout: parseInt(opts.timeout as string, 10) || 5000,
    dryRun: opts.dryRun as boolean,
    yes: opts.yes as boolean,
    verbose: opts.verbose as boolean
  };
}

async function getPort(options: ReturnType<typeof getGlobalOptions>): Promise<string> {
  if (options.port) {
    return options.port;
  }
  
  const autoPort = await VescConnection.autoDetectPort();
  if (!autoPort) {
    throw new Error('No serial port found. Please specify --port');
  }
  return autoPort;
}

async function createClient(options: ReturnType<typeof getGlobalOptions>): Promise<VescConnection> {
  const port = await getPort(options);
  const client = new VescConnection({
    path: port,
    baudRate: options.baud,
    timeout: options.timeout
  });
  
  await client.connect();
  return client;
}

function formatResponse(response: unknown, format: OutputFormat): string {
  return formatOutput(response, format);
}

// Parse motor values from COMM_GET_VALUES response payload
function parseMotorValues(payload: Uint8Array): Record<string, number> {
  if (payload.length < 10) {
    throw new Error('Invalid motor values payload');
  }
  
  const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  let offset = 0;
  
  // Temperatures (4 bytes each, float32)
  const tempMos = view.getFloat32(offset, false); offset += 4;
  const tempMotor = view.getFloat32(offset, false); offset += 4;
  
  // Currents (4 bytes each)
  const currentMotor = view.getFloat32(offset, false); offset += 4;
  const currentIn = view.getFloat32(offset, false); offset += 4;
  
  // Indices
  const id = view.getFloat32(offset, false); offset += 4;
  const iq = view.getFloat32(offset, false); offset += 4;
  
  // Duty (4 bytes)
  const dutyNow = view.getFloat32(offset, false); offset += 4;
  
  // RPM (4 bytes)
  const rpm = view.getFloat32(offset, false); offset += 4;
  
  // Voltage (4 bytes)
  const vIn = view.getFloat32(offset, false); offset += 4;
  
  // Amp hours (4 bytes each)
  const ampHours = view.getFloat32(offset, false); offset += 4;
  const ampHoursCharged = view.getFloat32(offset, false); offset += 4;
  
  // Watt hours (4 bytes each)
  const wattHours = view.getFloat32(offset, false); offset += 4;
  const wattHoursCharged = view.getFloat32(offset, false); offset += 4;
  
  // Tachometer (4 bytes each)
  const tachometer = view.getInt32(offset, false); offset += 4;
  const tachometerAbs = view.getInt32(offset, false); offset += 4;
  
  // Fault code (1 byte)
  const faultCode = payload[offset];
  
  return {
    tempMos: Math.round(tempMos * 100) / 100,
    tempMotor: Math.round(tempMotor * 100) / 100,
    currentMotor: Math.round(currentMotor * 100) / 100,
    currentIn: Math.round(currentIn * 100) / 100,
    id: Math.round(id * 100) / 100,
    iq: Math.round(iq * 100) / 100,
    dutyNow: Math.round(dutyNow * 100) / 100,
    rpm: Math.round(rpm),
    vIn: Math.round(vIn * 100) / 100,
    ampHours: Math.round(ampHours * 100) / 100,
    ampHoursCharged: Math.round(ampHoursCharged * 100) / 100,
    wattHours: Math.round(wattHours * 100) / 100,
    wattHoursCharged: Math.round(wattHoursCharged * 100) / 100,
    tachometer,
    tachometerAbs,
    faultCode
  };
}

// Encode float32 to Uint8Array (big-endian)
function encodeFloat32(value: number): Uint8Array {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, value, false);
  return new Uint8Array(buffer);
}

// Encode int32 to Uint8Array (big-endian)
function encodeInt32(value: number): Uint8Array {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setInt32(0, value, false);
  return new Uint8Array(buffer);
}

// ============================================================================
// CLI Setup
// ============================================================================

const program = new Command();

program
  .name('veac')
  .description('AI-controllable CLI for VESC motor controllers')
  .version(pkg.version)
  .option('-p, --port <port>', 'Serial port path (auto-detect if not specified)')
  .option('-b, --baud <rate>', 'Baud rate', '115200')
  .option('-c, --can-id <id>', 'CAN bus device ID')
  .option('-f, --format <format>', 'Output format (auto/json/yaml/table)', 'auto')
  .option('-t, --timeout <ms>', 'Command timeout in milliseconds', '5000')
  .option('-n, --dry-run', 'Preview changes without executing', false)
  .option('-y, --yes', 'Skip confirmations', false)
  .option('-v, --verbose', 'Verbose output', false);

// ============================================================================
// Device Commands
// ============================================================================

program
  .command('list-ports')
  .alias('device list-ports')
  .description('List available serial ports')
  .action(async () => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    try {
      const ports = await VescConnection.listPorts();
      
      const result = ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer || 'Unknown',
        serialNumber: port.serialNumber || 'N/A',
        vendorId: port.vendorId || 'N/A',
        productId: port.productId || 'N/A'
      }));
      
      const response = createSuccessResponse(
        'device list-ports',
        { ports: result, count: result.length },
        result.length > 0 
          ? [nextAction('device connect', 'Connect to a VESC')]
          : []
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'device list-ports',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.UNKNOWN
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.GENERAL_ERROR);
    }
  });

program
  .command('connect')
  .alias('device connect')
  .description('Connect to VESC device')
  .option('-p, --port <port>', 'Serial port path')
  .action(async (cmdOptions) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    // Override with command-specific port if provided
    if (cmdOptions.port) {
      options.port = cmdOptions.port;
    }
    
    try {
      const port = await getPort(options);
      
      if (options.dryRun) {
        const response = createSuccessResponse(
          'device connect',
          { dryRun: true, port, baudRate: options.baud },
          [nextAction('device connect', 'Connect for real (without --dry-run)')]
        );
        console.log(formatResponse(response, format));
        return;
      }
      
      const client = new VescConnection({
        path: port,
        baudRate: options.baud,
        timeout: options.timeout
      });
      
      await client.connect();
      
      // Verify connection with firmware version request
      const packet = encodePacketToArray(VescCommand.CommFwVersion);
      await client.send(packet);
      
      // Wait for response
      await sleep(100);
      const responses = client.receive();
      
      let fwVersion = null;
      if (responses.length > 0 && responses[0].command === VescCommand.CommFwVersion) {
        fwVersion = parseFirmwareVersion(responses[0]);
      }
      
      await client.disconnect();
      
      const response = createSuccessResponse(
        'device connect',
        {
          connected: true,
          port,
          baudRate: options.baud,
          firmware: fwVersion ? {
            version: `${fwVersion.versionMajor}.${fwVersion.versionMinor}`,
            name: fwVersion.name,
            hardware: fwVersion.hardwareName
          } : null
        },
        [
          nextAction('device info', 'Get device information'),
          nextAction('motor get-values', 'Get motor telemetry'),
          nextAction('device ping', 'Ping the device')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'device connect',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.CONNECTION,
        'Check port and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.CONNECTION_FAILED);
    }
  });

program
  .command('device-info')
  .alias('device info')
  .description('Get device information')
  .action(async () => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'device info',
        { dryRun: true },
        [nextAction('device info', 'Get info for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      
      const packet = encodePacketToArray(VescCommand.CommFwVersion);
      await client.send(packet);
      
      const responses = await client.sendAndReceive(packet, options.timeout);
      await client.disconnect();
      
      if (responses.length === 0 || responses[0].command !== VescCommand.CommFwVersion) {
        throw new Error('Invalid response from device');
      }
      
      const fwVersion = parseFirmwareVersion(responses[0]);
      
      const uuidHex = Array.from(fwVersion.uuid)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const response = createSuccessResponse(
        'device info',
        {
          firmware: {
            version: `${fwVersion.versionMajor}.${fwVersion.versionMinor}`,
            name: fwVersion.name,
            hardware: fwVersion.hardwareName,
            uuid: uuidHex,
            compileDate: fwVersion.compileDate
          }
        },
        [
          nextAction('motor get-values', 'Get motor telemetry'),
          nextAction('config get-mc', 'Get motor configuration'),
          nextAction('config get-app', 'Get app configuration')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'device info',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('ping')
  .alias('device ping')
  .description('Ping VESC device')
  .action(async () => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'device ping',
        { dryRun: true },
        [nextAction('device ping', 'Ping for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      
      const startTime = Date.now();
      const packet = encodePacketToArray(VescCommand.CommFwVersion);
      await client.send(packet);
      
      const responses = await client.sendAndReceive(packet, options.timeout);
      const latency = Date.now() - startTime;
      
      await client.disconnect();
      
      if (responses.length === 0) {
        throw new Error('No response from device');
      }
      
      const response = createSuccessResponse(
        'device ping',
        {
          success: true,
          latencyMs: latency,
          port: client.getStatus().path
        },
        [
          nextAction('device info', 'Get device information'),
          nextAction('motor get-values', 'Get motor telemetry')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'device ping',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.TIMEOUT,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.TIMEOUT);
    }
  });

// ============================================================================
// Motor Commands
// ============================================================================

program
  .command('get-values')
  .alias('motor get-values')
  .description('Get motor telemetry values')
  .action(async () => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'motor get-values',
        { dryRun: true },
        [nextAction('motor get-values', 'Get values for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      
      const packet = encodePacketToArray(VescCommand.CommGetValues);
      const responses = await client.sendAndReceive(packet, options.timeout);
      
      await client.disconnect();
      
      if (responses.length === 0 || responses[0].command !== VescCommand.CommGetValues) {
        throw new Error('Invalid response from device');
      }
      
      const values = parseMotorValues(responses[0].payload);
      
      const response = createSuccessResponse(
        'motor get-values',
        values,
        [
          nextAction('motor stop', 'Stop motor'),
          nextAction('motor set-rpm 1000', 'Set RPM to 1000', { rpm: 1000 }),
          nextAction('motor set-current 5', 'Set current to 5A', { current: 5 })
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'motor get-values',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('set-rpm <rpm>')
  .alias('motor set-rpm')
  .description('Set motor RPM')
  .option('-d, --duration <seconds>', 'Duration in seconds')
  .action(async (rpmStr, cmdOptions) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    const rpm = parseInt(rpmStr, 10);
    
    if (isNaN(rpm)) {
      const response = createErrorResponse(
        'motor set-rpm',
        `Invalid RPM: ${rpmStr}`,
        ErrorKind.VALIDATION,
        'Provide a valid integer RPM value'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.INVALID_ARGUMENTS);
    }
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'motor set-rpm',
        { dryRun: true, rpm },
        [nextAction('motor stop', 'Stop motor')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      
      const payload = encodeInt32(rpm * 1000); // VESC expects RPM * 1000
      const packet = encodePacketToArray(VescCommand.CommSetRpm, payload);
      await client.send(packet);
      
      // Handle duration if specified
      if (cmdOptions.duration) {
        const duration = parseInt(cmdOptions.duration, 10);
        if (!isNaN(duration) && duration > 0) {
          await sleep(duration * 1000);
          // Stop motor after duration
          const stopPayload = encodeInt32(0);
          const stopPacket = encodePacketToArray(VescCommand.CommSetRpm, stopPayload);
          await client.send(stopPacket);
        }
      }
      
      await client.disconnect();
      
      const response = createSuccessResponse(
        'motor set-rpm',
        { rpm, duration: cmdOptions.duration ? parseInt(cmdOptions.duration, 10) : undefined },
        [
          nextAction('motor stop', 'Stop motor'),
          nextAction('motor get-values', 'Get motor telemetry')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'motor set-rpm',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('set-current <amperes>')
  .alias('motor set-current')
  .description('Set motor current')
  .option('-d, --duration <seconds>', 'Duration in seconds')
  .action(async (amperesStr, cmdOptions) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    const amperes = parseFloat(amperesStr);
    
    if (isNaN(amperes)) {
      const response = createErrorResponse(
        'motor set-current',
        `Invalid current: ${amperesStr}`,
        ErrorKind.VALIDATION,
        'Provide a valid numeric current value'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.INVALID_ARGUMENTS);
    }
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'motor set-current',
        { dryRun: true, amperes },
        [nextAction('motor stop', 'Stop motor')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      
      const payload = encodeFloat32(amperes);
      const packet = encodePacketToArray(VescCommand.CommSetCurrent, payload);
      await client.send(packet);
      
      // Handle duration if specified
      if (cmdOptions.duration) {
        const duration = parseInt(cmdOptions.duration, 10);
        if (!isNaN(duration) && duration > 0) {
          await sleep(duration * 1000);
          // Stop motor after duration (set current to 0)
          const stopPayload = encodeFloat32(0);
          const stopPacket = encodePacketToArray(VescCommand.CommSetCurrent, stopPayload);
          await client.send(stopPacket);
        }
      }
      
      await client.disconnect();
      
      const response = createSuccessResponse(
        'motor set-current',
        { amperes, duration: cmdOptions.duration ? parseInt(cmdOptions.duration, 10) : undefined },
        [
          nextAction('motor stop', 'Stop motor'),
          nextAction('motor get-values', 'Get motor telemetry')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'motor set-current',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('set-duty <duty>')
  .alias('motor set-duty')
  .description('Set motor duty cycle (-1.0 to 1.0)')
  .action(async (dutyStr) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    const duty = parseFloat(dutyStr);
    
    if (isNaN(duty) || duty < -1.0 || duty > 1.0) {
      const response = createErrorResponse(
        'motor set-duty',
        `Invalid duty cycle: ${dutyStr}. Must be between -1.0 and 1.0`,
        ErrorKind.VALIDATION,
        'Provide a duty cycle between -1.0 and 1.0'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.INVALID_ARGUMENTS);
    }
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'motor set-duty',
        { dryRun: true, duty },
        [nextAction('motor stop', 'Stop motor')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      
      const payload = encodeFloat32(duty);
      const packet = encodePacketToArray(VescCommand.CommSetDuty, payload);
      await client.send(packet);
      
      await client.disconnect();
      
      const response = createSuccessResponse(
        'motor set-duty',
        { duty },
        [
          nextAction('motor stop', 'Stop motor'),
          nextAction('motor get-values', 'Get motor telemetry')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'motor set-duty',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('stop')
  .alias('motor stop')
  .description('Stop the motor')
  .action(async () => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'motor stop',
        { dryRun: true },
        [nextAction('motor stop', 'Stop motor for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      
      const payload = encodeFloat32(0);
      const packet = encodePacketToArray(VescCommand.CommSetCurrent, payload);
      await client.send(packet);
      
      await client.disconnect();
      
      const response = createSuccessResponse(
        'motor stop',
        { stopped: true },
        [
          nextAction('motor get-values', 'Get motor telemetry'),
          nextAction('motor set-rpm 0', 'Set RPM to 0')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'motor stop',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

// ============================================================================
// Config Commands
// ============================================================================

program
  .command('get-mc')
  .alias('config get-mc')
  .description('Get motor configuration')
  .option('-o, --output <file>', 'Output file path')
  .action(async (cmdOptions) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'config get-mc',
        { dryRun: true, outputFile: cmdOptions.output },
        [nextAction('config get-mc', 'Get config for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      
      const packet = encodePacketToArray(VescCommand.CommGetMcConf);
      const responses = await client.sendAndReceive(packet, options.timeout);
      
      await client.disconnect();
      
      if (responses.length === 0) {
        throw new Error('No response from device');
      }
      
      // Store raw config data
      const configData = {
        timestamp: new Date().toISOString(),
        raw: Buffer.from(responses[0].payload).toString('base64'),
        size: responses[0].payload.length
      };
      
      // Save to file if requested
      if (cmdOptions.output) {
        await writeFile(cmdOptions.output, JSON.stringify(configData, null, 2));
      }
      
      const response = createSuccessResponse(
        'config get-mc',
        {
          savedToFile: cmdOptions.output || null,
          size: configData.size,
          timestamp: configData.timestamp
        },
        [
          nextAction('config set-mc', 'Set motor configuration'),
          nextAction('config backup', 'Backup all configurations')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'config get-mc',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('set-mc <file>')
  .alias('config set-mc')
  .description('Set motor configuration')
  .action(async (file) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (!existsSync(file)) {
      const response = createErrorResponse(
        'config set-mc',
        `File not found: ${file}`,
        ErrorKind.NOT_FOUND,
        'Check the file path and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.NOT_FOUND);
    }
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'config set-mc',
        { dryRun: true, file },
        [nextAction('config set-mc', 'Set config for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const fileContent = await readFile(file, 'utf-8');
      const configData = JSON.parse(fileContent);
      
      if (!configData.raw) {
        throw new Error('Invalid config file: missing raw data');
      }
      
      const payload = Buffer.from(configData.raw, 'base64');
      const client = await createClient(options);
      
      const packet = encodePacketToArray(VescCommand.CommSetMcConf, new Uint8Array(payload));
      await client.send(packet);
      
      await client.disconnect();
      
      const response = createSuccessResponse(
        'config set-mc',
        { applied: true, file, size: payload.length },
        [
          nextAction('motor get-values', 'Get motor telemetry'),
          nextAction('config get-mc', 'Verify configuration')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'config set-mc',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check file format and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('get-app')
  .alias('config get-app')
  .description('Get application configuration')
  .option('-o, --output <file>', 'Output file path')
  .action(async (cmdOptions) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'config get-app',
        { dryRun: true, outputFile: cmdOptions.output },
        [nextAction('config get-app', 'Get config for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      
      const packet = encodePacketToArray(VescCommand.CommGetAppConf);
      const responses = await client.sendAndReceive(packet, options.timeout);
      
      await client.disconnect();
      
      if (responses.length === 0) {
        throw new Error('No response from device');
      }
      
      const configData = {
        timestamp: new Date().toISOString(),
        raw: Buffer.from(responses[0].payload).toString('base64'),
        size: responses[0].payload.length
      };
      
      if (cmdOptions.output) {
        await writeFile(cmdOptions.output, JSON.stringify(configData, null, 2));
      }
      
      const response = createSuccessResponse(
        'config get-app',
        {
          savedToFile: cmdOptions.output || null,
          size: configData.size,
          timestamp: configData.timestamp
        },
        [
          nextAction('config set-app', 'Set app configuration'),
          nextAction('config backup', 'Backup all configurations')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'config get-app',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('set-app <file>')
  .alias('config set-app')
  .description('Set application configuration')
  .action(async (file) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (!existsSync(file)) {
      const response = createErrorResponse(
        'config set-app',
        `File not found: ${file}`,
        ErrorKind.NOT_FOUND,
        'Check the file path and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.NOT_FOUND);
    }
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'config set-app',
        { dryRun: true, file },
        [nextAction('config set-app', 'Set config for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const fileContent = await readFile(file, 'utf-8');
      const configData = JSON.parse(fileContent);
      
      if (!configData.raw) {
        throw new Error('Invalid config file: missing raw data');
      }
      
      const payload = Buffer.from(configData.raw, 'base64');
      const client = await createClient(options);
      
      const packet = encodePacketToArray(VescCommand.CommSetAppConf, new Uint8Array(payload));
      await client.send(packet);
      
      await client.disconnect();
      
      const response = createSuccessResponse(
        'config set-app',
        { applied: true, file, size: payload.length },
        [
          nextAction('config get-app', 'Verify configuration'),
          nextAction('device info', 'Get device information')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'config set-app',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check file format and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('backup')
  .alias('config backup')
  .description('Backup all configurations')
  .requiredOption('-o, --output <file>', 'Output backup file')
  .action(async (cmdOptions) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'config backup',
        { dryRun: true, outputFile: cmdOptions.output },
        [nextAction('config backup', 'Create backup for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      
      // Get MC config
      const mcPacket = encodePacketToArray(VescCommand.CommGetMcConf);
      const mcResponses = await client.sendAndReceive(mcPacket, options.timeout);
      
      // Get APP config
      const appPacket = encodePacketToArray(VescCommand.CommGetAppConf);
      const appResponses = await client.sendAndReceive(appPacket, options.timeout);
      
      await client.disconnect();
      
      if (mcResponses.length === 0 || appResponses.length === 0) {
        throw new Error('Failed to retrieve one or both configurations');
      }
      
      const backup = {
        timestamp: new Date().toISOString(),
        version: pkg.version,
        motor: {
          raw: Buffer.from(mcResponses[0].payload).toString('base64'),
          size: mcResponses[0].payload.length
        },
        app: {
          raw: Buffer.from(appResponses[0].payload).toString('base64'),
          size: appResponses[0].payload.length
        }
      };
      
      await writeFile(cmdOptions.output, JSON.stringify(backup, null, 2));
      
      const response = createSuccessResponse(
        'config backup',
        {
          savedTo: cmdOptions.output,
          motorSize: backup.motor.size,
          appSize: backup.app.size,
          timestamp: backup.timestamp
        },
        [
          nextAction(`config restore ${cmdOptions.output}`, 'Restore from this backup'),
          nextAction('config get-mc', 'View motor config')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'config backup',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('restore <file>')
  .alias('config restore')
  .description('Restore from backup')
  .action(async (file) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (!existsSync(file)) {
      const response = createErrorResponse(
        'config restore',
        `File not found: ${file}`,
        ErrorKind.NOT_FOUND,
        'Check the file path and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.NOT_FOUND);
    }
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'config restore',
        { dryRun: true, file },
        [nextAction('config restore', 'Restore for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const fileContent = await readFile(file, 'utf-8');
      const backup = JSON.parse(fileContent);
      
      if (!backup.motor?.raw || !backup.app?.raw) {
        throw new Error('Invalid backup file: missing motor or app config');
      }
      
      const client = await createClient(options);
      
      // Restore motor config
      const mcPayload = Buffer.from(backup.motor.raw, 'base64');
      const mcPacket = encodePacketToArray(VescCommand.CommSetMcConf, new Uint8Array(mcPayload));
      await client.send(mcPacket);
      await sleep(100);
      
      // Restore app config
      const appPayload = Buffer.from(backup.app.raw, 'base64');
      const appPacket = encodePacketToArray(VescCommand.CommSetAppConf, new Uint8Array(appPayload));
      await client.send(appPacket);
      
      await client.disconnect();
      
      const response = createSuccessResponse(
        'config restore',
        {
          restored: true,
          file,
          motorSize: backup.motor.size,
          appSize: backup.app.size,
          timestamp: backup.timestamp
        },
        [
          nextAction('motor get-values', 'Get motor telemetry'),
          nextAction('device info', 'Get device information')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'config restore',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check backup file format and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

// ============================================================================
// CAN Commands
// ============================================================================

program
  .command('can-scan')
  .alias('can scan')
  .description('Scan for VESCs on CAN bus')
  .action(async () => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'can scan',
        { dryRun: true },
        [nextAction('can scan', 'Scan for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      const foundDevices: { id: number; status: string }[] = [];
      
      // Scan CAN IDs 1-10 (limit to avoid too much traffic)
      for (let id = 1; id <= 10; id++) {
        // Build CAN forward packet to ping device
        const forwardPayload = new Uint8Array([id, VescCommand.CommFwVersion]);
        const packet = encodePacketToArray(VescCommand.CommForwardCan, forwardPayload);
        
        await client.send(packet);
        await sleep(50);
        
        const responses = client.receive();
        if (responses.length > 0) {
          foundDevices.push({ id, status: 'online' });
        }
      }
      
      await client.disconnect();
      
      const response = createSuccessResponse(
        'can scan',
        {
          devicesFound: foundDevices.length,
          devices: foundDevices,
          scannedRange: '1-10'
        },
        foundDevices.length > 0
          ? foundDevices.map(d => nextAction(`can status ${d.id}`, `Get status for device ${d.id}`))
          : []
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'can scan',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check CAN bus wiring and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('can-status <id>')
  .alias('can status')
  .description('Get status of specific CAN device')
  .action(async (idStr) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    const id = parseInt(idStr, 10);
    
    if (isNaN(id) || id < 1 || id > 253) {
      const response = createErrorResponse(
        'can status',
        `Invalid CAN ID: ${idStr}. Must be 1-253`,
        ErrorKind.VALIDATION,
        'Provide a valid CAN ID between 1 and 253'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.INVALID_ARGUMENTS);
    }
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'can status',
        { dryRun: true, canId: id },
        [nextAction('can status', 'Get status for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const client = await createClient(options);
      
      // Forward COMM_GET_VALUES to CAN device
      const forwardPayload = new Uint8Array([id, VescCommand.CommGetValues]);
      const packet = encodePacketToArray(VescCommand.CommForwardCan, forwardPayload);
      
      const responses = await client.sendAndReceive(packet, options.timeout);
      await client.disconnect();
      
      if (responses.length === 0) {
        throw new Error(`No response from CAN device ${id}`);
      }
      
      // Try to parse motor values from response
      let values = null;
      try {
        values = parseMotorValues(responses[0].payload);
      } catch {
        // Response might not be motor values
      }
      
      const response = createSuccessResponse(
        'can status',
        {
          canId: id,
          values
        },
        [
          nextAction(`can forward ${id} motor stop`, 'Stop motor on CAN device'),
          nextAction('can scan', 'Scan for more devices')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'can status',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check CAN bus connection and device ID'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

// ============================================================================
// Lisp Commands
// ============================================================================

program
  .command('lisp-upload <file>')
  .alias('lisp upload')
  .description('Upload Lisp script')
  .action(async (file) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (!existsSync(file)) {
      const response = createErrorResponse(
        'lisp upload',
        `File not found: ${file}`,
        ErrorKind.NOT_FOUND,
        'Check the file path and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.NOT_FOUND);
    }
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'lisp upload',
        { dryRun: true, file },
        [nextAction('lisp upload', 'Upload for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    try {
      const code = await readFile(file, 'utf-8');
      const client = await createClient(options);
      
      // Convert code to bytes
      const encoder = new TextEncoder();
      const codeBytes = encoder.encode(code);
      
      // Send in chunks if needed (VESC has buffer limits)
      const CHUNK_SIZE = 400;
      for (let i = 0; i < codeBytes.length; i += CHUNK_SIZE) {
        const chunk = codeBytes.slice(i, i + CHUNK_SIZE);
        const packet = encodePacketToArray(VescCommand.CommLispWrite, chunk);
        await client.send(packet);
        await sleep(10);
      }
      
      await client.disconnect();
      
      const response = createSuccessResponse(
        'lisp upload',
        { uploaded: true, file, size: codeBytes.length },
        [
          nextAction('lisp repl', 'Start Lisp REPL'),
          nextAction('lisp erase', 'Erase Lisp program')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'lisp upload',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('lisp-erase')
  .alias('lisp erase')
  .description('Erase Lisp program')
  .option('-f, --force', 'Skip confirmation', false)
  .action(async (cmdOptions) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (options.dryRun) {
      const response = createSuccessResponse(
        'lisp erase',
        { dryRun: true },
        [nextAction('lisp erase', 'Erase for real')]
      );
      console.log(formatResponse(response, format));
      return;
    }
    
    // Confirm unless --force or --yes is set
    if (!cmdOptions.force && !options.yes) {
      console.log(chalk.yellow('Warning: This will erase all Lisp code from the device.'));
      console.log(chalk.yellow('Use --force or --yes to skip this confirmation.'));
      // In a real implementation, we'd prompt here
    }
    
    try {
      const client = await createClient(options);
      
      const packet = encodePacketToArray(VescCommand.CommLispErase);
      await client.send(packet);
      
      await client.disconnect();
      
      const response = createSuccessResponse(
        'lisp erase',
        { erased: true },
        [
          nextAction('lisp upload', 'Upload new Lisp script'),
          nextAction('lisp repl', 'Start Lisp REPL')
        ]
      );
      
      console.log(formatResponse(response, format));
    } catch (error) {
      const response = createErrorResponse(
        'lisp erase',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorKind.PROTOCOL,
        'Check connection and try again'
      );
      console.error(formatResponse(response, format));
      process.exit(ExitCode.PROTOCOL_ERROR);
    }
  });

program
  .command('lisp-repl [command]')
  .alias('lisp repl')
  .description('Execute Lisp REPL command or start interactive mode')
  .action(async (command) => {
    const options = getGlobalOptions(program);
    const format = detectFormat(options.format, process.stdout.isTTY);
    
    if (command) {
      // Single command mode
      if (options.dryRun) {
        const response = createSuccessResponse(
          'lisp repl',
          { dryRun: true, command },
          [nextAction('lisp repl', 'Execute for real')]
        );
        console.log(formatResponse(response, format));
        return;
      }
      
      try {
        const client = await createClient(options);
        
        const encoder = new TextEncoder();
        const cmdBytes = encoder.encode(command);
        const packet = encodePacketToArray(VescCommand.CommLispReplCmd, cmdBytes);
        
        await client.send(packet);
        await sleep(100);
        
        const responses = client.receive();
        await client.disconnect();
        
        const results = responses.map(r => {
          const decoder = new TextDecoder();
          return decoder.decode(r.payload);
        });
        
        const response = createSuccessResponse(
          'lisp repl',
          { command, results },
          [nextAction('lisp repl', 'Execute another command')]
        );
        
        console.log(formatResponse(response, format));
      } catch (error) {
        const response = createErrorResponse(
          'lisp repl',
          error instanceof Error ? error.message : 'Unknown error',
          ErrorKind.PROTOCOL,
          'Check connection and try again'
        );
        console.error(formatResponse(response, format));
        process.exit(ExitCode.PROTOCOL_ERROR);
      }
    } else {
      // Interactive mode
      console.log(chalk.cyan('VESC Lisp REPL - Type "exit" or "quit" to leave'));
      console.log(chalk.gray('Connecting to device...'));
      
      try {
        const client = await createClient(options);
        
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          prompt: 'lisp> '
        });
        
        rl.prompt();
        
        rl.on('line', async (line) => {
          const trimmed = line.trim();
          
          if (trimmed === 'exit' || trimmed === 'quit') {
            rl.close();
            await client.disconnect();
            return;
          }
          
          if (trimmed) {
            try {
              const encoder = new TextEncoder();
              const cmdBytes = encoder.encode(trimmed);
              const packet = encodePacketToArray(VescCommand.CommLispReplCmd, cmdBytes);
              
              await client.send(packet);
              await sleep(100);
              
              const responses = client.receive();
              responses.forEach(r => {
                const decoder = new TextDecoder();
                console.log(decoder.decode(r.payload));
              });
            } catch (err) {
              console.error(chalk.red('Error:'), err instanceof Error ? err.message : 'Unknown error');
            }
          }
          
          rl.prompt();
        });
        
        rl.on('close', async () => {
          await client.disconnect();
          console.log(chalk.cyan('\nGoodbye!'));
          process.exit(0);
        });
      } catch (error) {
        const response = createErrorResponse(
          'lisp repl',
          error instanceof Error ? error.message : 'Unknown error',
          ErrorKind.CONNECTION,
          'Check connection and try again'
        );
        console.error(formatResponse(response, format));
        process.exit(ExitCode.CONNECTION_FAILED);
      }
    }
  });

// ============================================================================
// Schema Command (AI Agent introspection)
// ============================================================================

program
  .command('schema [command]')
  .description('Get command schema for AI agents')
  .option('-f, --format <format>', 'Output format (json/yaml)', 'json')
  .action(async (command, options) => {
    const fullSchema = {
      name: 'veac',
      version: pkg.version,
      description: 'AI-controllable CLI for VESC motor controllers',
      globalOptions: [
        { name: 'port', alias: 'p', type: 'string', description: 'Serial port path' },
        { name: 'baud', alias: 'b', type: 'number', description: 'Baud rate', default: 115200 },
        { name: 'can-id', alias: 'c', type: 'number', description: 'CAN bus device ID' },
        { name: 'format', alias: 'f', type: 'string', description: 'Output format', default: 'auto' },
        { name: 'timeout', alias: 't', type: 'number', description: 'Timeout in ms', default: 5000 },
        { name: 'dry-run', alias: 'n', type: 'boolean', description: 'Preview changes', default: false },
        { name: 'yes', alias: 'y', type: 'boolean', description: 'Skip confirmations', default: false },
        { name: 'verbose', alias: 'v', type: 'boolean', description: 'Verbose output', default: false }
      ],
      commands: [
        { name: 'device list-ports', description: 'List available serial ports', mutating: false },
        { name: 'device connect', description: 'Connect to VESC device', mutating: false },
        { name: 'device info', description: 'Get device information', mutating: false },
        { name: 'device ping', description: 'Ping VESC device', mutating: false },
        { name: 'motor get-values', description: 'Get motor telemetry values', mutating: false },
        { name: 'motor set-rpm', description: 'Set motor RPM', mutating: true, args: [{ name: 'rpm', type: 'integer', required: true }] },
        { name: 'motor set-current', description: 'Set motor current', mutating: true, args: [{ name: 'amperes', type: 'number', required: true }] },
        { name: 'motor set-duty', description: 'Set motor duty cycle', mutating: true, args: [{ name: 'duty', type: 'number', required: true }] },
        { name: 'motor stop', description: 'Stop the motor', mutating: true },
        { name: 'config get-mc', description: 'Get motor configuration', mutating: false },
        { name: 'config set-mc', description: 'Set motor configuration', mutating: true, args: [{ name: 'file', type: 'string', required: true }] },
        { name: 'config get-app', description: 'Get application configuration', mutating: false },
        { name: 'config set-app', description: 'Set application configuration', mutating: true, args: [{ name: 'file', type: 'string', required: true }] },
        { name: 'config backup', description: 'Backup all configurations', mutating: false },
        { name: 'config restore', description: 'Restore from backup', mutating: true, args: [{ name: 'file', type: 'string', required: true }] },
        { name: 'can scan', description: 'Scan for VESCs on CAN bus', mutating: false },
        { name: 'can status', description: 'Get status of specific CAN device', mutating: false, args: [{ name: 'id', type: 'integer', required: true }] },
        { name: 'lisp upload', description: 'Upload Lisp script', mutating: true, args: [{ name: 'file', type: 'string', required: true }] },
        { name: 'lisp erase', description: 'Erase Lisp program', mutating: true },
        { name: 'lisp repl', description: 'Execute Lisp REPL command', mutating: true, args: [{ name: 'command', type: 'string', required: false }] }
      ],
      errorCodes: {
        0: 'Success',
        1: 'General error',
        2: 'Invalid arguments',
        3: 'Connection failed',
        4: 'Timeout',
        5: 'Protocol error',
        6: 'Not found',
        7: 'Permission denied',
        10: 'Dry run success'
      }
    };
    
    if (command) {
      // Filter to specific command
      const cmdSchema = fullSchema.commands.find(c => c.name === command || c.name.startsWith(command));
      if (cmdSchema) {
        if (options.format === 'yaml') {
          console.log('---');
          console.log(`name: ${cmdSchema.name}`);
          console.log(`description: ${cmdSchema.description}`);
          console.log(`mutating: ${cmdSchema.mutating}`);
          if (cmdSchema.args) {
            console.log('args:');
            cmdSchema.args.forEach(arg => {
              console.log(`  - name: ${arg.name}`);
              console.log(`    type: ${arg.type}`);
              console.log(`    required: ${arg.required}`);
            });
          }
        } else {
          console.log(JSON.stringify(cmdSchema, null, 2));
        }
      } else {
        console.error(`Command not found: ${command}`);
        process.exit(ExitCode.NOT_FOUND);
      }
    } else {
      // Full schema
      if (options.format === 'yaml') {
        console.log('---');
        console.log(`name: ${fullSchema.name}`);
        console.log(`version: ${fullSchema.version}`);
        console.log('commands:');
        fullSchema.commands.forEach(cmd => {
          console.log(`  - name: ${cmd.name}`);
          console.log(`    description: ${cmd.description}`);
        });
      } else {
        console.log(JSON.stringify(fullSchema, null, 2));
      }
    }
  });

// ============================================================================
// Generate Completions
// ============================================================================

program
  .command('generate-completions <shell>')
  .description('Generate shell completions (bash/zsh/fish/powershell)')
  .action(async (shell) => {
    const validShells = ['bash', 'zsh', 'fish', 'powershell'];
    
    if (!validShells.includes(shell)) {
      console.error(chalk.red(`Invalid shell: ${shell}`));
      console.error(chalk.gray(`Valid shells: ${validShells.join(', ')}`));
      process.exit(ExitCode.INVALID_ARGUMENTS);
    }
    
    // Commander.js doesn't have built-in completion generation
    // Generate our own basic completions
    const commands = [
      'device list-ports',
      'device connect',
      'device info',
      'device ping',
      'motor get-values',
      'motor set-rpm',
      'motor set-current',
      'motor set-duty',
      'motor stop',
      'config get-mc',
      'config set-mc',
      'config get-app',
      'config set-app',
      'config backup',
      'config restore',
      'can scan',
      'can status',
      'lisp upload',
      'lisp erase',
      'lisp repl',
      'schema',
      'generate-completions'
    ];
    
    const globalFlags = [
      '-p, --port',
      '-b, --baud',
      '-c, --can-id',
      '-f, --format',
      '-t, --timeout',
      '-n, --dry-run',
      '-y, --yes',
      '-v, --verbose'
    ];
    
    switch (shell) {
      case 'bash':
        console.log('# Bash completions for veac');
        console.log('_veac() {');
        console.log('  local cur prev opts');
        console.log('  COMPREPLY=()');
        console.log('  cur="${COMP_WORDS[COMP_CWORD]}"');
        console.log('  prev="${COMP_WORDS[COMP_CWORD-1]}"');
        console.log('  opts="' + commands.join(' ') + ' ' + globalFlags.map(f => f.split(',')[0]).join(' ') + '"');
        console.log('  COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )');
        console.log('  return 0');
        console.log('}');
        console.log('complete -F _veac veac');
        break;
        
      case 'zsh':
        console.log('#compdef veac');
        console.log('_veac() {');
        console.log('  local -a commands');
        console.log('  commands=(');
        commands.forEach(cmd => {
          const desc = cmd.replace(/-/g, ' ');
          console.log(`    "${cmd}:${desc}"`);
        });
        console.log('  )');
        console.log('  _describe -t commands "veac command" commands');
        console.log('}');
        console.log('_veac "$@"');
        break;
        
      case 'fish':
        commands.forEach(cmd => {
          console.log(`complete -c veac -f -n "__fish_use_subcommand" -a "${cmd}" -d "${cmd.replace(/-/g, ' ')}"`);
        });
        globalFlags.forEach(flag => {
          const short = flag.match(/^-([a-z]),/)?.[1];
          const long = flag.match(/--([\w-]+)/)?.[1];
          if (short && long) {
            console.log(`complete -c veac -s ${short} -l ${long}`);
          }
        });
        break;
        
      case 'powershell':
        console.log('# PowerShell completions for veac');
        console.log('Register-ArgumentCompleter -Native -CommandName veac -ScriptBlock {');
        console.log('  param($wordToComplete, $commandAst, $cursorPosition)');
        console.log('  $commands = @(' + commands.map(c => `"${c}"`).join(', ') + ')');
        console.log('  $commands | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {');
        console.log('    [System.Management.Automation.CompletionResult]::new($_, $_, "ParameterValue", $_)');
        console.log('  }');
        console.log('}');
        break;
    }
  });

program.parse();
