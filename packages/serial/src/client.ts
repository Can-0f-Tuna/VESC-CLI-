/**
 * VESC Client
 * 
 * High-level client for VESC motor controllers providing
 * easy-to-use methods for motor control and telemetry.
 * Migrated from Rust to TypeScript.
 */

import { Command, encodePacketToArray } from "@veac/protocol";
import { VescConnection } from "./connection.js";
import {
  DEFAULT_BAUD_RATE,
  type FirmwareInfo,
  type MotorTelemetry,
  type McConfiguration,
  type AppConfiguration,
  FaultCode,
} from "./types.js";
import { autoDetectPort } from "./detection.js";
import { ConnectionError, notConnectedError, protocolError } from "./errors.js";

/**
 * Represents a VESC command that can be executed
 */
export enum VescCommand {
  /** Get firmware version */
  GetVersion = "GetVersion",
  /** Get real-time values */
  GetValues = "GetValues",
  /** Set motor duty cycle (-1.0 to 1.0) */
  SetDuty = "SetDuty",
  /** Set motor current in Amperes */
  SetCurrent = "SetCurrent",
  /** Set motor current brake */
  SetCurrentBrake = "SetCurrentBrake",
  /** Set motor RPM */
  SetRpm = "SetRpm",
  /** Set motor position (in degrees) */
  SetPos = "SetPos",
  /** Set handbrake current */
  SetHandbrake = "SetHandbrake",
  /** Reboot the VESC */
  Reboot = "Reboot",
  /** Send keep-alive signal */
  Alive = "Alive",
}

/**
 * High-level VESC client for sending commands
 * 
 * This class provides a user-friendly API for controlling VESC motor controllers.
 * It wraps the lower-level VescConnection and provides methods for common operations
 * like setting RPM, current, duty cycle, and retrieving telemetry.
 * 
 * @example
 * ```typescript
 * const client = new VescClient('/dev/ttyUSB0');
 * await client.connect();
 * 
 * // Get telemetry
 * const values = await client.getValues();
 * console.log(`RPM: ${values.rpm}, Current: ${values.currentMotor}`);
 * 
 * // Set motor speed
 * await client.setRpm(1000);
 * 
 * // Stop and disconnect
 * await client.stop();
 * await client.disconnect();
 * ```
 */
export class VescClient {
  private connection: VescConnection | null = null;
  private portName: string;
  private baudRate: number;

  /**
   * Create a new VESC client
   * 
   * Note: This only creates the client instance. Call `connect()` to establish
   * the serial connection to the VESC.
   * 
   * @param port - Serial port name (e.g., "COM3" or "/dev/ttyUSB0")
   * @param baudRate - Baud rate (default: 115200)
   */
  constructor(port: string, baudRate: number = DEFAULT_BAUD_RATE) {
    this.portName = port;
    this.baudRate = baudRate;
  }

  /**
   * Auto-detect VESC and create a connected client
   * 
   * Scans available serial ports and connects to the first VESC found.
   * 
   * @param baudRate - Baud rate for communication (default: 115200)
   * @returns A connected VescClient instance
   * @throws ConnectionError if no VESC is found or connection fails
   */
  static async autoDetect(baudRate: number = DEFAULT_BAUD_RATE): Promise<VescClient> {
    const port = await autoDetectPort();
    if (!port) {
      throw new ConnectionError(
        "No VESC port found. Please check connection and try again.",
        "PortNotFound"
      );
    }
    const client = new VescClient(port, baudRate);
    await client.connect();
    return client;
  }

  /**
   * Connect to the VESC controller
   * 
   * Establishes the serial connection using the port and baud rate
   * specified in the constructor.
   * 
   * @throws ConnectionError if connection fails
   */
  async connect(): Promise<void> {
    if (this.connection?.isOpen()) {
      throw new ConnectionError("Already connected", "NotConnected");
    }
    this.connection = await VescConnection.open(this.portName, this.baudRate);
  }

  /**
   * Disconnect from the VESC controller
   * 
   * Closes the serial connection and releases resources.
   * Safe to call even if not connected.
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  /**
   * Check if the client is connected to the VESC
   * 
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    return this.connection?.isOpen() ?? false;
  }

  /**
   * Execute a command (fire and forget)
   * 
   * @param command - The VESC command to execute
   * @param payload - Optional payload data
   * @throws ConnectionError if not connected
   */
  private async executeCommand(
    command: Command,
    payload?: Uint8Array
  ): Promise<void> {
    if (!this.connection) {
      throw notConnectedError();
    }
    await this.connection.send(command, payload);
  }



  /**
   * Get firmware version from VESC
   * 
   * Sends COMM_FW_VERSION and parses the response to extract
   * firmware version information including hardware name, UUID, and compile date.
   * 
   * @returns FirmwareInfo containing version, name, hardware info, UUID, and compile date
   * @throws ConnectionError if not connected or response is invalid
   */
  async getVersion(): Promise<FirmwareInfo> {
    if (!this.connection) {
      throw notConnectedError();
    }
    return this.connection.getFirmwareVersion();
  }

  /**
   * Ping the VESC to check if it's responsive
   * 
   * Sends a COMM_ALIVE command and measures the response time.
   * This is useful for connection health checks and latency measurement.
   * 
   * @returns Latency in milliseconds, or -1 if no response
   * @throws ConnectionError for non-timeout errors
   */
  async ping(): Promise<number> {
    if (!this.connection) {
      throw notConnectedError();
    }

    const startTime = Date.now();
    const originalTimeout = this.connection.getTimeout();
    this.connection.setTimeout(1000);

    try {
      await this.connection.request(Command.CommAlive);
      return Date.now() - startTime;
    } catch (error) {
      if ((error as ConnectionError).kind === "Timeout") {
        return -1;
      }
      throw error;
    } finally {
      this.connection.setTimeout(originalTimeout);
    }
  }

  /**
   * Get real-time motor telemetry values from VESC
   * 
   * Sends COMM_GET_VALUES and returns a structured MotorTelemetry object
   * containing all motor data including voltages, currents, temperatures,
   * RPM, duty cycle, energy consumption, and fault status.
   * 
   * @returns MotorTelemetry with all telemetry fields populated
   * @throws ConnectionError if not connected or response is invalid
   */
  async getValues(): Promise<MotorTelemetry> {
    if (!this.connection) {
      throw notConnectedError();
    }
    return this.connection.getValues();
  }

  /**
   * Set motor RPM
   * 
   * Sends COMM_SET_RPM with the specified RPM value.
   * Positive values rotate in one direction, negative values rotate in the opposite direction.
   * 
   * RPM is sent as a 4-byte signed integer (big-endian)
   * 
   * @param rpm - RPM value (positive or negative for direction)
   * @throws ConnectionError if not connected
   */
  async setRpm(rpm: number): Promise<void> {
    // RPM is sent as a 4-byte signed integer (big-endian)
    const payload = new Uint8Array(4);
    const view = new DataView(payload.buffer);
    view.setInt32(0, rpm, false); // false = big-endian
    await this.executeCommand(Command.CommSetRpm, payload);
  }

  /**
   * Set motor current
   * 
   * Sends COMM_SET_CURRENT with the specified current value.
   * Positive current accelerates, negative current regenerative brakes.
   * 
   * Current is sent as a 4-byte signed integer (current * 1000, big-endian)
   * 
   * @param amps - Current in Amperes
   * @throws ConnectionError if not connected
   */
  async setCurrent(amps: number): Promise<void> {
    // Current is sent as a 4-byte signed integer (current * 1000)
    const value = Math.round(amps * 1000);
    const payload = new Uint8Array(4);
    const view = new DataView(payload.buffer);
    view.setInt32(0, value, false); // false = big-endian
    await this.executeCommand(Command.CommSetCurrent, payload);
  }

  /**
   * Set duty cycle
   * 
   * Sends COMM_SET_DUTY with the specified duty cycle.
   * Duty cycle controls motor power as a percentage of maximum.
   * 
   * Duty cycle is sent as a 4-byte signed integer (duty * 100000, big-endian)
   * 
   * @param duty - Duty cycle (-1.0 to 1.0, where 1.0 = 100%)
   * @throws ConnectionError if not connected
   */
  async setDuty(duty: number): Promise<void> {
    // Duty cycle is sent as a 4-byte signed integer (duty * 100000)
    const value = Math.round(duty * 100_000);
    const payload = new Uint8Array(4);
    const view = new DataView(payload.buffer);
    view.setInt32(0, value, false); // false = big-endian
    await this.executeCommand(Command.CommSetDuty, payload);
  }

  /**
   * Set motor brake current
   * 
   * Sends COMM_SET_CURRENT_BRAKE with the specified brake current.
   * This applies regenerative braking with the specified current limit.
   * 
   * Brake current is sent as a 4-byte signed integer (current * 1000, big-endian)
   * 
   * @param amps - Brake current in Amperes (positive value)
   * @throws ConnectionError if not connected
   */
  async setCurrentBrake(amps: number): Promise<void> {
    // Brake current is sent as a 4-byte signed integer (current * 1000)
    const value = Math.round(amps * 1000);
    const payload = new Uint8Array(4);
    const view = new DataView(payload.buffer);
    view.setInt32(0, value, false); // false = big-endian
    await this.executeCommand(Command.CommSetCurrentBrake, payload);
  }

  /**
   * Set motor position
   * 
   * Sends COMM_SET_POS with the specified position in degrees.
   * Requires encoder or hall sensor for position feedback.
   * 
   * Position is sent as a 4-byte signed integer (degrees * 1000000, big-endian)
   * 
   * @param degrees - Position in degrees
   * @throws ConnectionError if not connected
   */
  async setPosition(degrees: number): Promise<void> {
    // Position is sent as a 4-byte signed integer (degrees * 1000000)
    const value = Math.round(degrees * 1_000_000);
    const payload = new Uint8Array(4);
    const view = new DataView(payload.buffer);
    view.setInt32(0, value, false); // false = big-endian
    await this.executeCommand(Command.CommSetPos, payload);
  }

  /**
   * Set handbrake
   * 
   * Sends COMM_SET_HANDBRAKE with the specified handbrake current.
   * This holds the motor in position with the specified current.
   * 
   * Handbrake current is sent as a 4-byte signed integer (current * 1000, big-endian)
   * 
   * @param current - Handbrake current in Amperes
   * @throws ConnectionError if not connected
   */
  async setHandbrake(current: number): Promise<void> {
    // Handbrake current is sent as a 4-byte signed integer (current * 1000)
    const value = Math.round(current * 1000);
    const payload = new Uint8Array(4);
    const view = new DataView(payload.buffer);
    view.setInt32(0, value, false); // false = big-endian
    await this.executeCommand(Command.CommSetHandbrake, payload);
  }

  /**
   * Stop the motor
   * 
   * Sets duty cycle to 0, effectively stopping the motor.
   * This is a convenience method equivalent to `setDuty(0)`.
   * 
   * @throws ConnectionError if not connected
   */
  async stop(): Promise<void> {
    await this.setDuty(0);
  }

  /**
   * Get MC (Motor Controller) configuration from VESC
   * 
   * Retrieves the motor controller configuration as raw bytes.
   * Note: Binary parsing is not fully implemented yet.
   * 
   * @returns McConfiguration with raw bytes
   * @throws ConnectionError if not connected
   */
  async getMcConfig(): Promise<McConfiguration> {
    if (!this.connection) {
      throw notConnectedError();
    }
    const raw = await this.connection.getMcConfig();
    return { raw };
  }

  /**
   * Set MC (Motor Controller) configuration on VESC
   * 
   * Writes the motor controller configuration to the VESC.
   * Note: Configuration must be in VESC binary format.
   * 
   * @param config - MC configuration to write
   * @throws ConnectionError if not connected or config is invalid
   */
  async setMcConfig(config: McConfiguration): Promise<void> {
    if (!this.connection) {
      throw notConnectedError();
    }
    if (!config.raw) {
      throw protocolError("MC configuration has no raw data");
    }
    await this.connection.setMcConfig(config.raw);
  }

  /**
   * Get APP (Application) configuration from VESC
   * 
   * Retrieves the application configuration as raw bytes.
   * 
   * @returns AppConfiguration with raw bytes
   * @throws ConnectionError if not connected
   */
  async getAppConfig(): Promise<AppConfiguration> {
    if (!this.connection) {
      throw notConnectedError();
    }
    const raw = await this.connection.getAppConfig();
    return { raw };
  }

  /**
   * Set APP (Application) configuration on VESC
   * 
   * Writes the application configuration to the VESC.
   * 
   * @param config - APP configuration to write
   * @throws ConnectionError if not connected or config is invalid
   */
  async setAppConfig(config: AppConfiguration): Promise<void> {
    if (!this.connection) {
      throw notConnectedError();
    }
    if (!config.raw) {
      throw protocolError("APP configuration has no raw data");
    }
    await this.connection.setAppConfig(config.raw);
  }

  /**
   * Forward a command to another VESC on the CAN bus
   * 
   * Sends COMM_FORWARD_CAN to forward a command to a VESC with the specified
   * CAN ID. This allows controlling multiple VESCs over a single serial connection.
   * 
   * The CAN packet format is:
   * - Byte 0: Target CAN ID (1-255)
   * - Byte 1-n: Command packet data
   * 
   * @param targetId - Target VESC CAN ID (1-255)
   * @param command - VESC command to forward
   * @param payload - Optional payload data for the command
   * @throws ConnectionError if not connected
   */
  async canForward(
    targetId: number,
    command: Command,
    payload?: Uint8Array
  ): Promise<void> {
    if (!this.connection) {
      throw notConnectedError();
    }

    if (targetId < 1 || targetId > 255) {
      throw protocolError("CAN target ID must be between 1 and 255");
    }

    // Build the forwarded packet: [targetId] [command] [payload...]
    const forwardedPacket = encodePacketToArray(command, payload);
    
    // Build CAN forward payload: targetId + forwarded packet
    const canPayload = new Uint8Array(1 + forwardedPacket.length);
    canPayload[0] = targetId;
    canPayload.set(forwardedPacket, 1);

    await this.executeCommand(Command.CommForwardCan, canPayload);
  }

  /**
   * Ping a VESC on the CAN bus
   * 
   * Sends COMM_FORWARD_CAN with COMM_ALIVE to check if a VESC with the
   * specified CAN ID is responsive.
   * 
   * @param targetId - Target VESC CAN ID (1-255)
   * @returns true if the VESC responded, false otherwise
   * @throws ConnectionError if not connected
   */
  async canPing(targetId: number): Promise<boolean> {
    if (!this.connection) {
      throw notConnectedError();
    }

    const originalTimeout = this.connection.getTimeout();
    this.connection.setTimeout(1000);

    try {
      // Forward alive command to target
      const alivePacket = encodePacketToArray(Command.CommAlive);
      const canPayload = new Uint8Array(1 + alivePacket.length);
      canPayload[0] = targetId;
      canPayload.set(alivePacket, 1);

      await this.connection.request(Command.CommForwardCan, canPayload);
      return true;
    } catch (error) {
      if ((error as ConnectionError).kind === "Timeout") {
        return false;
      }
      throw error;
    } finally {
      this.connection.setTimeout(originalTimeout);
    }
  }

  /**
   * Upload Lisp code to the VESC
   * 
   * Sends COMM_LISP_WRITE with the Lisp code to be stored on the VESC.
   * The code is uploaded in chunks if it exceeds the maximum packet size.
   * 
   * @param code - Lisp code as a string
   * @throws ConnectionError if not connected or upload fails
   */
  async lispUpload(code: string): Promise<void> {
    if (!this.connection) {
      throw notConnectedError();
    }

    // Convert string to bytes
    const encoder = new TextEncoder();
    const codeBytes = encoder.encode(code);

    // Upload in chunks
    const MAX_CHUNK_SIZE = 400; // Leave room for command and overhead
    let offset = 0;

    while (offset < codeBytes.length) {
      const chunk = codeBytes.slice(offset, offset + MAX_CHUNK_SIZE);
      const isLastChunk = offset + chunk.length >= codeBytes.length;

      // Build chunk payload: [is_last: u8] [data_len: u16 BE] [data...]
      const chunkPayload = new Uint8Array(1 + 2 + chunk.length);
      chunkPayload[0] = isLastChunk ? 1 : 0;
      chunkPayload[1] = (chunk.length >> 8) & 0xFF;
      chunkPayload[2] = chunk.length & 0xFF;
      chunkPayload.set(chunk, 3);

      await this.connection.request(Command.CommLispWrite, chunkPayload);
      offset += chunk.length;
    }
  }

  /**
   * Erase Lisp code from the VESC
   * 
   * Sends COMM_LISP_ERASE to clear all Lisp code from the VESC memory.
   * 
   * @throws ConnectionError if not connected
   */
  async lispErase(): Promise<void> {
    await this.executeCommand(Command.CommLispErase);
  }

  /**
   * Start Lisp execution
   * 
   * Sends COMM_LISP_SET_RUNNING with running=true to start executing
   * the uploaded Lisp code.
   * 
   * @throws ConnectionError if not connected
   */
  async lispStart(): Promise<void> {
    // Payload: [running: u8] (1 = running, 0 = stopped)
    const payload = new Uint8Array([1]);
    await this.executeCommand(Command.CommLispSetRunning, payload);
  }

  /**
   * Stop Lisp execution
   * 
   * Sends COMM_LISP_SET_RUNNING with running=false to stop executing
   * the Lisp code.
   * 
   * @throws ConnectionError if not connected
   */
  async lispStop(): Promise<void> {
    // Payload: [running: u8] (1 = running, 0 = stopped)
    const payload = new Uint8Array([0]);
    await this.executeCommand(Command.CommLispSetRunning, payload);
  }

  /**
   * Execute a Lisp REPL command
   * 
   * Sends COMM_LISP_REPL_CMD to execute a command in the Lisp REPL.
   * Returns the output from the command.
   * 
   * @param command - Lisp command to execute
   * @returns Output from the REPL as a string
   * @throws ConnectionError if not connected
   */
  async lispRepl(command: string): Promise<string> {
    if (!this.connection) {
      throw notConnectedError();
    }

    // Convert command to bytes with null terminator
    const encoder = new TextEncoder();
    const commandBytes = encoder.encode(command + '\0');

    // Send REPL command
    const response = await this.connection.request(Command.CommLispReplCmd, commandBytes);

    // Decode response as string
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(response);
  }

  /**
   * Get the underlying connection for advanced operations
   * 
   * @returns The VescConnection instance
   * @throws ConnectionError if not connected
   */
  getConnection(): VescConnection {
    if (!this.connection) {
      throw notConnectedError();
    }
    return this.connection;
  }

  /**
   * Get the port name
   * 
   * @returns The connected port name
   */
  getPortName(): string {
    return this.portName;
  }

  /**
   * Get the baud rate
   * 
   * @returns The current baud rate
   */
  getBaudRate(): number {
    return this.baudRate;
  }

  /**
   * Get both MC and APP configurations (complete backup)
   * 
   * Retrieves both configurations for backup and restore operations.
   * 
   * @returns Object containing both MC and APP configurations
   * @throws ConnectionError if not connected
   */
  async getConfigSet(): Promise<{ mc: McConfiguration; app: AppConfiguration }> {
    const [mc, app] = await Promise.all([
      this.getMcConfig(),
      this.getAppConfig(),
    ]);
    return { mc, app };
  }

  /**
   * Set both MC and APP configurations (complete restore)
   * 
   * Writes both configurations to the VESC.
   * 
   * @param configSet - Object containing both MC and APP configurations
   * @throws ConnectionError if not connected or config is invalid
   */
  async setConfigSet(configSet: {
    mc: McConfiguration;
    app: AppConfiguration;
  }): Promise<void> {
    await this.setMcConfig(configSet.mc);
    await this.setAppConfig(configSet.app);
  }

  /**
   * Reboot the VESC
   * 
   * Sends COMM_REBOOT to restart the VESC controller.
   * 
   * @throws ConnectionError if not connected
   */
  async reboot(): Promise<void> {
    await this.executeCommand(Command.CommReboot);
  }

  /**
   * Send keep-alive signal
   * 
   * Sends COMM_ALIVE to prevent the VESC from timing out.
   * 
   * @throws ConnectionError if not connected
   */
  async alive(): Promise<void> {
    await this.executeCommand(Command.CommAlive);
  }
}

// Re-export types for convenience
export type { FirmwareInfo, MotorTelemetry, McConfiguration, AppConfiguration };
export { FaultCode };
export { ConnectionError, type ConnectionErrorKind } from "./errors.js";
