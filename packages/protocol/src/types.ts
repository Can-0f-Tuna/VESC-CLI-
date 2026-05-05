import { Command } from "./commands";

/**
 * Firmware version information parsed from COMM_FW_VERSION response
 */
export interface FirmwareVersion {
  versionMajor: number;
  versionMinor: number;
  name: string;
  hardwareName: string;
  uuid: Uint8Array; // 16 bytes
  compileDate: string;
}

/**
 * Decoded packet structure
 */
export interface DecodedPacket {
  /** The decoded command */
  command: Command;
  /** The payload data (excluding command byte) */
  payload: Uint8Array;
}

/**
 * Packet buffer for encoding packets with fixed capacity
 */
export interface PacketBuffer {
  /** The underlying buffer */
  data: Uint8Array;
  /** Current length of valid data in buffer */
  length: number;
}

/**
 * Protocol statistics for debugging
 */
export interface ProtocolStats {
  packetsEncoded: number;
  packetsDecoded: number;
  crcErrors: number;
  incompletePackets: number;
}

/**
 * Options for packet encoding
 */
export interface EncodeOptions {
  /** Command to encode */
  command: Command;
  /** Optional payload data */
  payload?: Uint8Array;
}

/**
 * Options for packet decoding
 */
export interface DecodeOptions {
  /** Whether to validate the stop byte (default: true) */
  validateStopByte?: boolean;
}

/**
 * Helper type for encoding result
 */
export type EncodeResult = Uint8Array;

/**
 * Helper type for decoding result
 */
export type DecodeResult = DecodedPacket | null;

/**
 * Format UUID as hex string
 */
export function formatUuidHex(uuid: Uint8Array): string {
  return Array.from(uuid)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Parse null-terminated string from byte array starting at index
 * Returns the parsed string and the index after the null terminator
 */
export function parseNullTerminatedString(
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
 * Parse UUID (16 bytes) from byte array
 */
export function parseUuid(data: Uint8Array, startIndex: number): Uint8Array | null {
  if (startIndex + 16 > data.length) {
    return null;
  }
  return data.slice(startIndex, startIndex + 16);
}
