/**
 * Serial port detection and listing functions
 */

import { SerialPort } from "serialport";
import { PortInfo, DEFAULT_BAUD_RATE } from "./types.js";
import { serialError, portNotFoundError } from "./errors.js";
import { VescConnection } from "./connection.js";

/**
 * List all available serial ports
 * 
 * Returns a list of PortInfo objects containing information
 * about each available serial port.
 */
export async function listPorts(): Promise<PortInfo[]> {
  try {
    const ports = await SerialPort.list();
    
    return ports.map((port) => ({
      name: port.path,
      description: port.manufacturer,
      manufacturer: port.manufacturer,
      serialNumber: port.serialNumber,
      vendorId: port.vendorId,
      productId: port.productId,
      locationId: port.locationId,
      pnpId: port.pnpId,
    }));
  } catch (error) {
    throw serialError("Failed to list serial ports", error as Error);
  }
}

/**
 * Filter ports that might be VESC devices based on vendor/product IDs
 * 
 * Common VESC USB-to-Serial chip IDs:
 * - STM32: 0483
 * - OpenOCD: 1d50
 * - Raspberry Pi: 2e8a
 * - FTDI: 0403
 * - Silicon Labs CP210x: 10c4
 */
export function filterVescPorts(ports: PortInfo[]): PortInfo[] {
  const vescVendors = ["0483", "1d50", "2e8a", "0403", "10c4", "067b", "1a86"];
  
  return ports.filter((port) => {
    // Check vendor ID
    if (port.vendorId && vescVendors.includes(port.vendorId.toLowerCase())) {
      return true;
    }
    
    // Check common port name patterns
    const lowerName = port.name.toLowerCase();
    if (
      lowerName.includes("ttyacm") ||
      lowerName.includes("ttyusb") ||
      lowerName.includes("cu.usbmodem") ||
      lowerName.includes("cu.usbserial") ||
      lowerName.includes("com")
    ) {
      return true;
    }
    
    return false;
  });
}

/**
 * Auto-detect VESC by trying COMM_FW_VERSION on each port
 * 
 * This function:
 * 1. Lists all available serial ports
 * 2. Tries to open each port at the default baud rate
 * 3. Sends COMM_FW_VERSION command with a 1-second timeout
 * 4. Returns the first port that responds successfully
 * 
 * @returns The name of the detected port
 * @throws ConnectionError if no VESC was found
 */
export async function autoDetectPort(): Promise<string> {
  const ports = await listPorts();

  if (ports.length === 0) {
    throw portNotFoundError("No serial ports available");
  }

  // First try filtered VESC-like ports
  const vescPorts = filterVescPorts(ports);
  const portsToTry = vescPorts.length > 0 ? vescPorts : ports;

  for (const portInfo of portsToTry) {
    // Try to open the port
    let conn: VescConnection | null = null;
    try {
      conn = await VescConnection.open(portInfo.name, DEFAULT_BAUD_RATE);

      // Try to get firmware version with a short timeout
      conn.setTimeout(1000);

      await conn.getFirmwareVersion();
      
      // Found a VESC!
      await conn.close();
      return portInfo.name;
    } catch {
      // Not a VESC or not responding, try next port
      if (conn) {
        try {
          await conn.close();
        } catch {
          // Ignore close errors
        }
      }
      continue;
    }
  }

  throw portNotFoundError("No VESC detected on any serial port");
}

/**
 * Auto-detect VESC with specific timeout per port
 * 
 * Similar to `autoDetectPort` but allows specifying a custom
 * timeout for each port attempt.
 * 
 * @param perPortTimeoutMs - Timeout in milliseconds for each port attempt
 * @returns The name of the detected port
 * @throws ConnectionError if no VESC was found
 */
export async function autoDetectPortWithTimeout(
  perPortTimeoutMs: number
): Promise<string> {
  const ports = await listPorts();

  if (ports.length === 0) {
    throw portNotFoundError("No serial ports available");
  }

  // First try filtered VESC-like ports
  const vescPorts = filterVescPorts(ports);
  const portsToTry = vescPorts.length > 0 ? vescPorts : ports;

  for (const portInfo of portsToTry) {
    let conn: VescConnection | null = null;
    try {
      conn = await VescConnection.open(portInfo.name, DEFAULT_BAUD_RATE);
      conn.setTimeout(perPortTimeoutMs);

      await conn.getFirmwareVersion();
      
      await conn.close();
      return portInfo.name;
    } catch {
      if (conn) {
        try {
          await conn.close();
        } catch {
          // Ignore close errors
        }
      }
      continue;
    }
  }

  throw portNotFoundError("No VESC detected on any serial port");
}

/**
 * Check if a specific port is a VESC device
 * 
 * @param portName - Serial port name to check
 * @param timeoutMs - Timeout in milliseconds (default: 1000)
 * @returns True if the port responds to VESC firmware version request
 */
export async function isVescPort(
  portName: string,
  timeoutMs = 1000
): Promise<boolean> {
  let conn: VescConnection | null = null;
  try {
    conn = await VescConnection.open(portName, DEFAULT_BAUD_RATE);
    conn.setTimeout(timeoutMs);

    await conn.getFirmwareVersion();
    
    await conn.close();
    return true;
  } catch {
    if (conn) {
      try {
        await conn.close();
      } catch {
        // Ignore close errors
      }
    }
    return false;
  }
}
