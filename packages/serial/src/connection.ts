/**
 * VESC Serial Connection
 * 
 * Async serial connection with packet streaming and response handling.
 * Migrated from Rust/tokio-serial to TypeScript/serialport.
 */

import { SerialPort } from "serialport";
import {
  Command,
  encodePacketToArray,
  decodePacket,
  findPacketStart,
  expectedPacketSize,
  type DecodedPacket,
} from "@veac/protocol";
import {
  DEFAULT_BAUD_RATE,
  DEFAULT_TIMEOUT_MS,
  type FirmwareInfo,
  type MotorTelemetry,
  FaultCode,
} from "./types.js";
import {
  ConnectionError,
  serialError,
  protocolError,
  timeoutError,
  notConnectedError,
  ioError,
} from "./errors.js";

/**
 * VESC serial connection manager
 * 
 * This class manages a serial connection to a VESC motor controller,
 * handling packet encoding/decoding, timeouts, and read buffering.
 */
export class VescConnection {
  private port: SerialPort | null = null;
  private portName: string;
  private baudRate: number;
  private readBuffer: Uint8Array;
  private timeoutMs: number;
  private dataHandler: ((data: Buffer) => void) | null = null;
  private errorHandler: ((err: Error) => void) | null = null;

  /**
   * List available serial ports
   * 
   * @returns Array of port information objects
   */
  static async listPorts(): Promise<Array<{ path: string; manufacturer?: string; serialNumber?: string; vendorId?: string; productId?: string }>> {
    const ports = await SerialPort.list();
    return ports.map(port => ({
      path: port.path,
      manufacturer: port.manufacturer,
      serialNumber: port.serialNumber,
      vendorId: port.vendorId,
      productId: port.productId,
    }));
  }

  /**
   * Auto-detect a VESC port from available serial ports
   * 
   * @returns The path of the detected port, or null if none found
   */
  static async autoDetectPort(): Promise<string | null> {
    const ports = await this.listPorts();
    
    // Look for common VESC USB-to-Serial chip patterns
    const vescPatterns = [
      { vendorId: '0483', productId: '5740' }, // STM32 Virtual COM
      { vendorId: '1d50' }, // OpenOCD
      { vendorId: '2e8a' }, // Raspberry Pi
    ];
    
    for (const port of ports) {
      // Check vendor/product IDs
      for (const pattern of vescPatterns) {
        if (port.vendorId?.toLowerCase() === pattern.vendorId) {
          if (!pattern.productId || port.productId?.toLowerCase() === pattern.productId) {
            return port.path;
          }
        }
      }
      
      // Check common port name patterns
      const lowerPath = port.path.toLowerCase();
      if (lowerPath.includes('ttyacm') || 
          lowerPath.includes('ttyusb') || 
          lowerPath.includes('cu.usbmodem') ||
          (lowerPath.startsWith('com') && /^com\d+$/.test(lowerPath))) {
        return port.path;
      }
    }
    
    // Return first available port if no specific match
    return ports.length > 0 ? ports[0].path : null;
  }

  /**
   * Open a new connection to a VESC controller
   * 
   * @param portName - Serial port name (e.g., "COM3" on Windows or "/dev/ttyUSB0" on Linux)
   * @param baudRate - Baud rate for communication (typically 115200)
   * @returns A new VescConnection instance
   */
  static async open(
    portName: string,
    baudRate: number = DEFAULT_BAUD_RATE
  ): Promise<VescConnection> {
    const connection = new VescConnection({ path: portName, baudRate });
    await connection.connect();
    return connection;
  }

  constructor(options: { path: string; baudRate?: number; timeout?: number }) {
    this.portName = options.path;
    this.baudRate = options.baudRate ?? DEFAULT_BAUD_RATE;
    this.readBuffer = new Uint8Array(0);
    this.timeoutMs = options.timeout ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * Set the timeout duration for operations
   */
  setTimeout(timeoutMs: number): void {
    this.timeoutMs = timeoutMs;
  }

  /**
   * Get the current timeout duration in milliseconds
   */
  getTimeout(): number {
    return this.timeoutMs;
  }

  /**
   * Get the port name
   */
  getPortName(): string {
    return this.portName;
  }

  /**
   * Get the baud rate
   */
  getBaudRate(): number {
    return this.baudRate;
  }

  /**
   * Check if the connection is open
   */
  isOpen(): boolean {
    return this.port?.isOpen ?? false;
  }

  /**
   * Get connection status
   *
   * @returns Object with port path, baud rate, and open status
   */
  getStatus(): { path: string; baudRate: number; open: boolean } {
    return {
      path: this.portName,
      baudRate: this.baudRate,
      open: this.isOpen(),
    };
  }

  /**
   * Open the serial connection
   */
  public async connect(): Promise<void> {
    if (this.port?.isOpen) {
      throw serialError("Connection already open");
    }

    return new Promise((resolve, reject) => {
      this.port = new SerialPort({
        path: this.portName,
        baudRate: this.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        autoOpen: false,
      });

      this.port.open((err) => {
        if (err) {
          reject(serialError(`Failed to open port ${this.portName}`, err));
          return;
        }

        // Set up data handler
        this.dataHandler = (data: Buffer) => {
          const newData = new Uint8Array(data);
          const combined = new Uint8Array(this.readBuffer.length + newData.length);
          combined.set(this.readBuffer, 0);
          combined.set(newData, this.readBuffer.length);
          this.readBuffer = combined;
        };

        this.port!.on("data", this.dataHandler);

        // Set up error handler
        this.errorHandler = (err: Error) => {
          console.error("Serial port error:", err);
        };

        this.port!.on("error", this.errorHandler);

        resolve();
      });
    });
  }

  /**
   * Clear the read buffer
   */
  private clearBuffer(): void {
    this.readBuffer = new Uint8Array(0);
  }

  /**
   * Send a pre-encoded packet (fire and forget)
   *
   * @param packet - Pre-encoded packet bytes
   */
  async sendRaw(packet: Uint8Array): Promise<void> {
    if (!this.port?.isOpen) {
      throw notConnectedError();
    }

    return new Promise((resolve, reject) => {
      this.port!.write(Buffer.from(packet), (err) => {
        if (err) {
          reject(ioError("Failed to write to port", err));
          return;
        }

        this.port!.drain((err) => {
          if (err) {
            reject(ioError("Failed to drain port", err));
            return;
          }
          resolve();
        });
      });
    });
  }

  /**
   * Send a command (fire and forget)
   *
   * @param command - The VESC command to send
   * @param payload - Optional payload data
   */
  async send(command: Command, payload?: Uint8Array): Promise<void> {
    if (!this.port?.isOpen) {
      throw notConnectedError();
    }

    try {
      const packet = encodePacketToArray(command, payload);
      await this.sendRaw(packet);
    } catch (error) {
      throw protocolError("Failed to encode packet", error as Error);
    }
  }

  /**
   * Try to decode a packet from the current buffer
   * 
   * Returns the packet if found, or null if more data is needed
   */
  private tryDecodePacket(): DecodedPacket | null {
    while (true) {
      if (this.readBuffer.length === 0) {
        return null;
      }

      // Find packet start
      const startIdx = findPacketStart(this.readBuffer);
      
      if (startIdx !== null) {
        // Remove any garbage before the packet start
        if (startIdx > 0) {
          this.readBuffer = this.readBuffer.slice(startIdx);
        }

        // Try to decode
        try {
          const packet = decodePacket(this.readBuffer, true);
          if (packet) {
            // Remove the processed packet from buffer
            const expectedLen = expectedPacketSize(this.readBuffer);
            if (expectedLen !== null && this.readBuffer.length >= expectedLen) {
              this.readBuffer = this.readBuffer.slice(expectedLen);
            }
            return packet;
          }
          // Need more data
          return null;
        } catch (error) {
          const errorMsg = (error as Error).message;
          
          if (
            errorMsg.includes("Invalid start byte") ||
            errorMsg.includes("Invalid stop byte") ||
            errorMsg.includes("CRC mismatch")
          ) {
            // Packet framing error - remove start byte and continue searching
            this.readBuffer = this.readBuffer.slice(1);
            continue;
          }
          
          throw error;
        }
      } else {
        // No valid start byte found - clear buffer
        this.readBuffer = new Uint8Array(0);
        return null;
      }
    }
  }

  /**
   * Wait for and decode a packet with timeout
   * 
   * This method continuously reads from the port until a valid packet
   * is received or the timeout expires.
   */
  private async receivePacket(): Promise<DecodedPacket> {
    const deadline = Date.now() + this.timeoutMs;

    return new Promise((resolve, reject) => {
      const checkForPacket = () => {
        // Check if we've timed out
        if (Date.now() >= deadline) {
          reject(timeoutError(this.timeoutMs));
          return;
        }

        // Try to decode any existing data first
        try {
          const packet = this.tryDecodePacket();
          if (packet) {
            resolve(packet);
            return;
          }
        } catch (error) {
          reject(protocolError("Failed to decode packet", error as Error));
          return;
        }

        // Check again after a short delay
        setTimeout(checkForPacket, 10);
      };

      checkForPacket();
    });
  }

  /**
   * Decode and return all currently buffered packets
   *
   * @returns Array of decoded packets from the read buffer
   */
  receive(): DecodedPacket[] {
    const packets: DecodedPacket[] = [];
    while (true) {
      try {
        const packet = this.tryDecodePacket();
        if (!packet) break;
        packets.push(packet);
      } catch {
        break;
      }
    }
    return packets;
  }

  /**
   * Send command and wait for response
   * 
   * This method:
   * 1. Clears the read buffer
   * 2. Sends the command
   * 3. Reads and decodes the response packet
   * 4. Returns the payload bytes
   * 
   * @param command - The VESC command to send
   * @param payload - Optional payload data
   * @returns The response payload
   */
  async request(command: Command, payload?: Uint8Array): Promise<Uint8Array> {
    if (!this.port?.isOpen) {
      throw notConnectedError();
    }

    // Clear any pending data in the buffer
    this.clearBuffer();

    // Also try to drain any pending data from the port (non-blocking)
    await this.drainPort(10);

    // Send the command
    await this.send(command, payload);

    // Wait for response
    const response = await this.receivePacket();

    return response.payload;
  }

  /**
   * Send a pre-encoded packet and collect all responses within a timeout
   *
   * @param packet - Pre-encoded packet bytes
   * @param timeoutMs - Timeout in milliseconds (uses default if not specified)
   * @returns Array of decoded packets received within the timeout
   */
  async sendAndReceive(packet: Uint8Array, timeoutMs?: number): Promise<DecodedPacket[]> {
    if (!this.port?.isOpen) {
      throw notConnectedError();
    }

    const timeout = timeoutMs ?? this.timeoutMs;

    // Clear any pending data
    this.clearBuffer();
    await this.drainPort(10);

    // Send the packet
    await this.sendRaw(packet);

    // Collect all packets within timeout
    const deadline = Date.now() + timeout;
    const packets: DecodedPacket[] = [];

    return new Promise((resolve, reject) => {
      const checkForPackets = () => {
        if (Date.now() >= deadline) {
          resolve(packets);
          return;
        }

        try {
          while (true) {
            const pkt = this.tryDecodePacket();
            if (!pkt) break;
            packets.push(pkt);
          }
        } catch (error) {
          reject(protocolError("Failed to decode packet", error as Error));
          return;
        }

        setTimeout(checkForPackets, 10);
      };

      checkForPackets();
    });
  }

  /**
   * Drain any pending data from the port (non-blocking attempt)
   */
  private async drainPort(timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    
    while (Date.now() < deadline) {
      const startLen = this.readBuffer.length;
      await new Promise((resolve) => setTimeout(resolve, 5));
      
      // If no new data arrived, we're done
      if (this.readBuffer.length === startLen) {
        break;
      }
    }
    
    this.clearBuffer();
  }

  /**
   * Ping VESC (COMM_ALIVE)
   * 
   * Sends a COMM_ALIVE command and checks if the VESC responds.
   * This is useful for connection health checks.
   * 
   * @returns true if the VESC responded, false otherwise
   */
  async ping(): Promise<boolean> {
    const originalTimeout = this.timeoutMs;
    this.setTimeout(1000);

    try {
      await this.request(Command.CommAlive);
      return true;
    } catch (error) {
      if ((error as ConnectionError).kind === "Timeout") {
        return false;
      }
      throw error;
    } finally {
      this.setTimeout(originalTimeout);
    }
  }

  /**
   * Get firmware version from VESC
   * 
   * Sends COMM_FW_VERSION and parses the response to extract
   * firmware version information including hardware name, UUID, and compile date.
   * 
   * @returns FirmwareInfo containing version, name, hardware info, UUID, and compile date
   */
  async getFirmwareVersion(): Promise<FirmwareInfo> {
    const payload = await this.request(Command.CommFwVersion);

    if (payload.length < 2) {
      throw protocolError("Firmware version payload too short");
    }

    const versionMajor = payload[0];
    const versionMinor = payload[1];

    // Parse null-terminated strings
    let idx = 2;

    // Parse firmware name
    const nameResult = parseNullTerminatedString(payload, idx);
    const name = nameResult.value;
    idx = nameResult.nextIndex;

    // Parse hardware name
    const hwNameResult = parseNullTerminatedString(payload, idx);
    const hardwareName = hwNameResult.value;
    idx = hwNameResult.nextIndex;

    // Parse UUID (16 bytes)
    let uuid = new Uint8Array(16);
    if (idx + 16 <= payload.length) {
      uuid = payload.slice(idx, idx + 16);
      idx += 16;
    }

    // Parse compile date (remaining bytes)
    let compileDate = "";
    if (idx < payload.length) {
      const dateResult = parseNullTerminatedString(payload, idx);
      compileDate = dateResult.value;
    }

    return {
      versionMajor,
      versionMinor,
      name,
      hardwareName,
      uuid,
      compileDate,
    };
  }

  /**
   * Get real-time motor telemetry values
   * 
   * Sends COMM_GET_VALUES and parses the response to extract
   * complete motor telemetry including voltages, currents, temperatures,
   * RPM, and fault status.
   * 
   * @returns MotorTelemetry containing all motor data
   */
  async getValues(): Promise<MotorTelemetry> {
    const payload = await this.request(Command.CommGetValues);

    // Parse MC_VALUES from payload
    // The payload structure (all values in little-endian):
    // - v_in: f32 (4 bytes)
    // - temp_mos: f32 (4 bytes)
    // - temp_motor: f32 (4 bytes)
    // - current_motor: f32 (4 bytes)
    // - current_in: f32 (4 bytes)
    // - id: f32 (4 bytes)
    // - iq: f32 (4 bytes)
    // - rpm: f32 (4 bytes) - sent as float but represents integer
    // - duty_now: f32 (4 bytes)
    // - amp_hours: f32 (4 bytes)
    // - amp_hours_charged: f32 (4 bytes)
    // - watt_hours: f32 (4 bytes)
    // - watt_hours_charged: f32 (4 bytes)
    // - tachometer: i32 (4 bytes)
    // - tachometer_abs: i32 (4 bytes)
    // - position: f32 (4 bytes)
    // - fault_code: u8 (1 byte)
    // Total: 73 bytes minimum

    const MIN_SIZE = 73;

    if (payload.length < MIN_SIZE) {
      throw protocolError(
        `Telemetry payload too small: expected at least ${MIN_SIZE} bytes, got ${payload.length}`
      );
    }

    let offset = 0;

    // Parse all float values (little-endian)
    const vIn = readF32Le(payload, offset);
    offset += 4;
    const tempMos = readF32Le(payload, offset);
    offset += 4;
    const tempMotor = readF32Le(payload, offset);
    offset += 4;
    const currentMotor = readF32Le(payload, offset);
    offset += 4;
    const currentIn = readF32Le(payload, offset);
    offset += 4;
    const currentId = readF32Le(payload, offset);
    offset += 4;
    const currentIq = readF32Le(payload, offset);
    offset += 4;
    const rpmF32 = readF32Le(payload, offset);
    offset += 4;
    const dutyCycle = readF32Le(payload, offset);
    offset += 4;
    const ampHours = readF32Le(payload, offset);
    offset += 4;
    const ampHoursCharged = readF32Le(payload, offset);
    offset += 4;
    const wattHours = readF32Le(payload, offset);
    offset += 4;
    const wattHoursCharged = readF32Le(payload, offset);
    offset += 4;

    // Parse integer values (little-endian)
    const tachometer = readI32Le(payload, offset);
    offset += 4;
    const tachometerAbs = readI32Le(payload, offset);
    offset += 4;

    // Parse encoder position
    const encoderPosition = readF32Le(payload, offset);
    offset += 4;

    // Parse fault code (single byte)
    const faultCodeByte = payload[offset] ?? 0;
    const faultCode = FaultCode.fromU8(faultCodeByte);
    const faultStr = FaultCode.description(faultCode);

    // RPM is sent as float but represents integer value
    const rpm = Math.round(rpmF32);

    return {
      vIn,
      currentIn,
      powerIn: vIn * currentIn,
      currentMotor,
      rpm,
      dutyCycle,
      tempMos,
      tempMotor,
      currentId,
      currentIq,
      ampHours,
      ampHoursCharged,
      wattHours,
      wattHoursCharged,
      tachometer,
      tachometerAbs,
      encoderPosition,
      faultCode,
      faultStr,
    };
  }

  /**
   * Get MC configuration from VESC
   * 
   * Sends COMM_GET_MCCONF and receives the binary configuration data.
   * Note: Full binary parsing is complex and varies by firmware version.
   * This method returns the raw bytes for further processing.
   * 
   * @returns Raw MC configuration bytes
   */
  async getMcConfig(): Promise<Uint8Array> {
    return this.request(Command.CommGetMcConf);
  }

  /**
   * Set MC configuration on VESC
   * 
   * Sends COMM_SET_MCCONF with the configuration data.
   * Note: The configuration data must be in the VESC binary format.
   * 
   * @param configData - Binary configuration data
   */
  async setMcConfig(configData: Uint8Array): Promise<void> {
    await this.request(Command.CommSetMcConf, configData);
  }

  /**
   * Get APP configuration from VESC
   * 
   * Sends COMM_GET_APPCONF and receives the binary configuration data.
   * 
   * @returns Raw APP configuration bytes
   */
  async getAppConfig(): Promise<Uint8Array> {
    return this.request(Command.CommGetAppConf);
  }

  /**
   * Set APP configuration on VESC
   * 
   * Sends COMM_SET_APPCONF with the configuration data.
   * 
   * @param configData - Binary configuration data
   */
  async setAppConfig(configData: Uint8Array): Promise<void> {
    await this.request(Command.CommSetAppConf, configData);
  }

  /**
   * Close the connection
   * 
   * The serial port is closed and resources are released.
   */
  async close(): Promise<void> {
    if (!this.port) {
      return;
    }

    // Remove event handlers
    if (this.dataHandler) {
      this.port.off("data", this.dataHandler);
      this.dataHandler = null;
    }
    if (this.errorHandler) {
      this.port.off("error", this.errorHandler);
      this.errorHandler = null;
    }

    return new Promise((resolve, reject) => {
      this.port!.close((err) => {
        if (err) {
          reject(serialError("Failed to close port", err));
          return;
        }
        this.port = null;
        resolve();
      });
    });
  }

  /**
   * Disconnect from the VESC (alias for close)
   */
  async disconnect(): Promise<void> {
    return this.close();
  }
}

/**
 * Parse null-terminated string from byte array starting at index
 * Returns the parsed string and the index after the null terminator
 */
function parseNullTerminatedString(
  data: Uint8Array,
  startIndex: number
): { value: string; nextIndex: number } {
  let idx = startIndex;

  // Find null terminator
  while (idx < data.length && data[idx] !== 0) {
    idx++;
  }

  // Extract string bytes
  const strBytes = data.slice(startIndex, idx);

  // Skip null terminator if present
  if (idx < data.length && data[idx] === 0) {
    idx++;
  }

  // Decode using TextDecoder (handles UTF-8)
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const value = decoder.decode(strBytes);

  return { value, nextIndex: idx };
}

/**
 * Read a little-endian f32 from the data buffer
 */
function readF32Le(data: Uint8Array, offset: number): number {
  const bytes = data.slice(offset, offset + 4);
  const buffer = bytes.buffer;
  const view = new DataView(buffer);
  return view.getFloat32(0, true); // true = little-endian
}

/**
 * Read a little-endian i32 from the data buffer
 */
function readI32Le(data: Uint8Array, offset: number): number {
  const bytes = data.slice(offset, offset + 4);
  const buffer = bytes.buffer;
  const view = new DataView(buffer);
  return view.getInt32(0, true); // true = little-endian
}
