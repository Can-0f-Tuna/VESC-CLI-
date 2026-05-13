import {
  START_BYTE_SHORT,
  START_BYTE_LONG,
  STOP_BYTE,
  MAX_PACKET_SIZE,
} from "./constants";
import { Command, commandToU8, commandFromU8, validateCommandPayload } from "./commands";
import { calculateCrc } from "./crc";
import {
  DecodedPacket,
  PacketBuffer,
  FirmwareVersion,
  parseNullTerminatedString,
} from "./types";
import {
  invalidStartByte,
  invalidStopByte,
  crcMismatch,
  incompletePacket,
  unknownCommand,
} from "./errors";

/**
 * Create a new empty packet buffer
 */
export function createPacketBuffer(): PacketBuffer {
  return {
    data: new Uint8Array(MAX_PACKET_SIZE),
    length: 0,
  };
}

/**
 * Clear the packet buffer
 */
export function clearPacketBuffer(buffer: PacketBuffer): void {
  buffer.length = 0;
}

/**
 * Get the current data in the buffer as a slice
 */
export function getPacketBufferSlice(buffer: PacketBuffer): Uint8Array {
  return buffer.data.slice(0, buffer.length);
}

/**
 * Encode a packet with given command and payload
 * 
 * Returns the encoded packet as a Uint8Array.
 * 
 * Protocol format:
 * - Short packet (≤255 bytes payload): [0x02] [len:u8] [payload] [CRC16:u16 BE] [0x03]
 * - Long packet (>255 bytes payload): [0x03] [len:u16 BE] [payload] [CRC16:u16 BE] [0x03]
 * 
 * @throws {ProtocolError} If payload exceeds MAX_PAYLOAD_LEN
 */
export function encodePacket(
  buffer: PacketBuffer,
  command: Command,
  payload: Uint8Array = new Uint8Array(0)
): Uint8Array {
  clearPacketBuffer(buffer);
  
  // Validate total payload length
  validateCommandPayload(command, payload);
  
  const totalLen = 1 + payload.length; // 1 byte for command + payload
  
  if (totalLen <= 255) {
    // Short packet: 0x02 [len:u8] [payload] [CRC:u16] 0x03
    buffer.data[0] = START_BYTE_SHORT;
    buffer.data[1] = totalLen;
    buffer.data[2] = commandToU8(command);
    
    if (payload.length > 0) {
      buffer.data.set(payload, 3);
    }
    
    // Calculate CRC over command + payload
    const payloadSlice = buffer.data.slice(2, 2 + totalLen);
    const crc = calculateCrc(payloadSlice);
    
    const crcStart = 2 + totalLen;
    buffer.data[crcStart] = (crc >>> 8) & 0xFF; // High byte (big-endian)
    buffer.data[crcStart + 1] = crc & 0xFF; // Low byte
    buffer.data[crcStart + 2] = STOP_BYTE;
    
    buffer.length = crcStart + 3;
  } else {
    // Long packet: 0x03 [len:u16 BE] [payload] [CRC:u16] 0x03
    buffer.data[0] = START_BYTE_LONG;
    buffer.data[1] = (totalLen >>> 8) & 0xFF; // High byte
    buffer.data[2] = totalLen & 0xFF; // Low byte
    buffer.data[3] = commandToU8(command);
    
    if (payload.length > 0) {
      buffer.data.set(payload, 4);
    }
    
    // Calculate CRC over command + payload
    const payloadSlice = buffer.data.slice(3, 3 + totalLen);
    const crc = calculateCrc(payloadSlice);
    
    const crcStart = 3 + totalLen;
    buffer.data[crcStart] = (crc >>> 8) & 0xFF; // High byte
    buffer.data[crcStart + 1] = crc & 0xFF; // Low byte
    buffer.data[crcStart + 2] = STOP_BYTE;
    
    buffer.length = crcStart + 3;
  }
  
  return getPacketBufferSlice(buffer);
}

/**
 * Convenience function to encode a packet to a new Uint8Array
 * 
 * Creates a new buffer containing the encoded packet.
 * For repeated encoding, use PacketBuffer for better performance.
 */
export function encodePacketToArray(
  command: Command,
  payload: Uint8Array = new Uint8Array(0)
): Uint8Array {
  const buffer = createPacketBuffer();
  return encodePacket(buffer, command, payload);
}

/**
 * Decode packet from bytes
 * 
 * Attempts to decode a VESC packet from the provided data.
 * 
 * Returns:
 * - DecodedPacket if a complete valid packet was found
 * - null if more data is needed (incomplete packet)
 * - Throws ProtocolError if data is invalid
 */
export function decodePacket(
  data: Uint8Array,
  validateStopByte: boolean = true
): DecodedPacket | null {
  return decodePacketInternal(data, validateStopByte);
}

/**
 * Decode packet with option to skip stop byte validation
 * 
 * This is useful for compatibility with non-standard implementations
 * that may not include the stop byte.
 */
export function decodePacketLenient(data: Uint8Array): DecodedPacket | null {
  return decodePacketInternal(data, false);
}

/**
 * Internal decode implementation
 */
function decodePacketInternal(
  data: Uint8Array,
  validateStopByte: boolean
): DecodedPacket | null {
  if (data.length === 0) {
    return null;
  }
  
  const startByte = data[0];
  
  // Determine packet type and length
  let payloadLen: number;
  let headerLen: number;
  switch (startByte) {
    case START_BYTE_SHORT: {
      // Short packet: 0x02 [len:u8] [payload:N] [CRC:u16] 0x03
      if (data.length < 2) {
        return null; // Need more data for length byte
      }
      payloadLen = data[1];
      headerLen = 2;
      break;
    }
    case START_BYTE_LONG: {
      // Long packet: 0x03 [len:u16 BE] [payload:N] [CRC:u16] 0x03
      if (data.length < 3) {
        return null; // Need more data for length bytes
      }
      payloadLen = ((data[1] << 8) | data[2]) >>> 0; // Ensure unsigned
      headerLen = 3;
      break;
    }
    default:
      throw invalidStartByte(startByte);
  }
  
  // Calculate total packet length
  // header + payload + CRC (2 bytes) + stop (1 byte)
  const totalLen = headerLen + payloadLen + 3;
  
  if (data.length < totalLen) {
    return null; // Need more data
  }
  
  // Validate stop byte if requested
  if (validateStopByte) {
    const stopByte = data[totalLen - 1];
    if (stopByte !== STOP_BYTE) {
      throw invalidStopByte(stopByte);
    }
  }
  
  // Extract payload (includes command byte)
  const payloadStart = headerLen;
  const payloadEnd = payloadStart + payloadLen;
  const payload = data.slice(payloadStart, payloadEnd);
  
  // Verify CRC
  const crcStart = payloadEnd;
  const receivedCrc = ((data[crcStart] << 8) | data[crcStart + 1]) >>> 0;
  const calculatedCrc = calculateCrc(payload);
  
  if (receivedCrc !== calculatedCrc) {
    throw crcMismatch(calculatedCrc, receivedCrc);
  }
  
  // Extract command from payload
  if (payload.length === 0) {
    throw incompletePacket(1, 0);
  }
  
  const commandByte = payload[0];
  const command = commandFromU8(commandByte);
  
  if (command === undefined) {
    throw unknownCommand(commandByte);
  }
  
  // Rest of payload is command data
  const payloadData = payload.length > 1 ? payload.slice(1) : new Uint8Array(0);
  
  return {
    command,
    payload: payloadData,
  };
}

/**
 * Find packet boundaries in a byte stream
 * 
 * Scans through data looking for valid packet start bytes.
 * Returns the index of the first potential packet start, or null if no start byte found.
 * 
 * This is useful for resynchronization when parsing a continuous stream.
 */
export function findPacketStart(data: Uint8Array): number | null {
  for (let i = 0; i < data.length; i++) {
    if (data[i] === START_BYTE_SHORT || data[i] === START_BYTE_LONG) {
      return i;
    }
  }
  return null;
}

/**
 * Calculate the expected packet size from header bytes
 * 
 * Returns the expected size if enough data is present to determine size,
 * null otherwise.
 */
export function expectedPacketSize(data: Uint8Array): number | null {
  if (data.length === 0) {
    return null;
  }
  
  switch (data[0]) {
    case START_BYTE_SHORT: {
      if (data.length < 2) {
        return null;
      }
      const payloadLen = data[1];
      return 2 + payloadLen + 3; // header + payload + CRC + stop
    }
    case START_BYTE_LONG: {
      if (data.length < 3) {
        return null;
      }
      const payloadLen = ((data[1] << 8) | data[2]) >>> 0;
      return 3 + payloadLen + 3; // header + payload + CRC + stop
    }
    default:
      return null;
  }
}

/**
 * Check if data contains at least one complete packet
 * 
 * Returns true if the data buffer contains enough bytes for a complete packet.
 */
export function hasCompletePacket(data: Uint8Array): boolean {
  const expected = expectedPacketSize(data);
  return expected !== null && data.length >= expected;
}

/**
 * Parse firmware version from COMM_FW_VERSION response
 * 
 * Format: [version_major:u8] [version_minor:u8] [name:str] [0x00] [hw_name:str] [0x00] [uuid:16bytes] [compile_date:str]
 * 
 * @throws {ProtocolError} If payload is too short
 */
export function parseFirmwareVersion(
  packet: DecodedPacket
): FirmwareVersion {
  const payload = packet.payload;
  
  if (payload.length < 2) {
    throw incompletePacket(2, payload.length);
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
    // Try to parse as null-terminated string first
    const dateResult = parseNullTerminatedString(payload, idx);
    compileDate = dateResult.value;
    // Don't advance idx - we're done anyway
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
 * Create a decoded packet from command and payload
 */
export function createDecodedPacket(
  command: Command,
  payload: Uint8Array = new Uint8Array(0)
): DecodedPacket {
  return { command, payload };
}
