import { describe, test, expect } from "bun:test";
import {
  // Commands
  Command,
  commandToU8,
  commandFromU8,
  getAllCommands,
  // Constants
  START_BYTE_SHORT,
  START_BYTE_LONG,
  STOP_BYTE,
  MAX_PAYLOAD_LEN,
  // CRC
  calculateCrc,
  calculateCrcFromArray,
  // Packet
  createPacketBuffer,
  clearPacketBuffer,
  getPacketBufferSlice,
  encodePacket,
  encodePacketToArray,
  decodePacket,
  decodePacketLenient,
  findPacketStart,
  expectedPacketSize,
  hasCompletePacket,
  parseFirmwareVersion,
  createDecodedPacket,
  // Types
  formatUuidHex,
  // Errors
  ProtocolError,
} from "./index";

// ============================================================================
// Command Enum Tests
// ============================================================================

describe("Command Enum", () => {
  test("command enum roundtrip - all 160 commands", () => {
    const commands = getAllCommands();

    expect(commands).toHaveLength(160);

    for (const cmd of commands) {
      const byte = commandToU8(cmd);
      const roundtrip = commandFromU8(byte);
      expect(roundtrip).toBe(cmd);
    }
  });

  test("command from_u8 invalid values", () => {
    expect(commandFromU8(160)).toBeUndefined();
    expect(commandFromU8(200)).toBeUndefined();
    expect(commandFromU8(255)).toBeUndefined();
  });

  test("command from_u8 all valid", () => {
    for (let i = 0; i <= 159; i++) {
      const cmd = commandFromU8(i);
      expect(cmd).toBeDefined();
      expect(commandToU8(cmd!)).toBe(i);
    }
  });

  test("command enum values are correct", () => {
    expect(Command.CommFwVersion).toBe(0);
    expect(Command.CommJumpToBootloader).toBe(1);
    expect(Command.CommGetValues).toBe(4);
    expect(Command.CommSetDuty).toBe(5);
    expect(Command.CommSetCurrent).toBe(6);
    expect(Command.CommSetRpm).toBe(8);
    expect(Command.CommReboot).toBe(29);
    expect(Command.CommAlive).toBe(30);
    expect(Command.CommLogDataF32).toBe(148);
  });
});

// ============================================================================
// Packet Encoding Tests
// ============================================================================

describe("Packet Encoding", () => {
  test("encode short packet", () => {
    const buffer = createPacketBuffer();
    const packet = encodePacket(buffer, Command.CommGetValues);
    
    // Structure: [0x02] [len=1] [cmd=0x04] [CRC:2] [0x03]
    expect(packet[0]).toBe(START_BYTE_SHORT);
    expect(packet[1]).toBe(1); // length = 1 (command byte only)
    expect(packet[2]).toBe(0x04); // COMM_GET_VALUES
    
    // Last byte should be stop byte
    expect(packet[packet.length - 1]).toBe(STOP_BYTE);
    
    // Total length: 2 (header) + 1 (payload) + 2 (CRC) + 1 (stop) = 6
    expect(packet.length).toBe(6);
  });
  
  test("encode with payload", () => {
    const buffer = createPacketBuffer();
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = encodePacket(buffer, Command.CommSetDuty, payload);
    
    // Structure: [0x02] [len=4] [cmd=0x05] [0x01 0x02 0x03] [CRC:2] [0x03]
    expect(packet[0]).toBe(START_BYTE_SHORT);
    expect(packet[1]).toBe(4); // length = 1 (cmd) + 3 (payload)
    expect(packet[2]).toBe(0x05); // COMM_SET_DUTY
    expect(packet.slice(3, 6)).toEqual(new Uint8Array([0x01, 0x02, 0x03]));
  });
  
  test("encode decode roundtrip", () => {
    const payload = new Uint8Array([0xAB, 0xCD, 0xEF]);
    const encoded = encodePacketToArray(Command.CommSetCurrent, payload);
    
    const decoded = decodePacket(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.command).toBe(Command.CommSetCurrent);
    expect(decoded!.payload).toEqual(payload);
  });
  
  test("empty payload all commands", () => {
    const commands = getAllCommands();
    
    for (const cmd of commands) {
      const encoded = encodePacketToArray(cmd);
      const decoded = decodePacket(encoded);
      
      expect(decoded).not.toBeNull();
      expect(decoded!.command).toBe(cmd);
      expect(decoded!.payload.length).toBe(0);
    }
  });
  
  test("short packet various sizes", () => {
    const testSizes = [0, 1, 10, 100, 200, 254];
    
    for (const size of testSizes) {
      const payload = new Uint8Array(size).fill(0xAB);
      const encoded = encodePacketToArray(Command.CommCustomAppData, payload);
      
      // Verify short packet format
      expect(encoded[0]).toBe(START_BYTE_SHORT);
      expect(encoded[1]).toBe(1 + size);
      expect(encoded[encoded.length - 1]).toBe(STOP_BYTE);
      
      // Verify roundtrip
      const decoded = decodePacket(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded!.command).toBe(Command.CommCustomAppData);
      expect(decoded!.payload).toEqual(payload);
    }
  });
  
  test("long packet encode decode", () => {
    // Create a payload that requires long packet format (>254 bytes total payload)
    const largePayload = new Uint8Array(300).fill(0xAA);
    const encoded = encodePacketToArray(Command.CommCustomAppData, largePayload);
    
    // Should use long packet format
    expect(encoded[0]).toBe(START_BYTE_LONG);
    
    // Decode and verify
    const decoded = decodePacket(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.command).toBe(Command.CommCustomAppData);
    expect(decoded!.payload).toEqual(largePayload);
  });
  
  test("long packet various sizes", () => {
    const testSizes = [255, 256, 300, 1000, 5000, 10000];
    
    for (const size of testSizes) {
      const payload = new Uint8Array(size).fill(0xCD);
      const encoded = encodePacketToArray(Command.CommCustomAppData, payload);
      
      // Verify long packet format
      expect(encoded[0]).toBe(START_BYTE_LONG);
      
      // Verify length encoding (big-endian u16)
      const len = (encoded[1] << 8) | encoded[2];
      expect(len).toBe(1 + size);
      expect(encoded[encoded.length - 1]).toBe(STOP_BYTE);
      
      // Verify roundtrip
      const decoded = decodePacket(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded!.command).toBe(Command.CommCustomAppData);
      expect(decoded!.payload.length).toBe(size);
      expect(decoded!.payload).toEqual(payload);
    }
  });
  
  test("maximum payload size", () => {
    // Maximum payload is 65535 bytes (u16 max)
    const maxPayload = new Uint8Array(MAX_PAYLOAD_LEN - 1).fill(0xEF);
    
    const encoded = encodePacketToArray(Command.CommCustomAppData, maxPayload);
    expect(encoded[0]).toBe(START_BYTE_LONG);
    
    const decoded = decodePacket(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.payload.length).toBe(MAX_PAYLOAD_LEN - 1);
  });
  
  test("payload too long error", () => {
    // Payload exceeding MAX_PAYLOAD_LEN should fail
    const hugePayload = new Uint8Array(MAX_PAYLOAD_LEN + 1);
    
    expect(() => {
      encodePacketToArray(Command.CommCustomAppData, hugePayload);
    }).toThrow(ProtocolError);
  });
});

// ============================================================================
// Packet Decoding Tests
// ============================================================================

describe("Packet Decoding", () => {
  test("decode incomplete packet - just start byte", () => {
    const result = decodePacket(new Uint8Array([START_BYTE_SHORT]));
    expect(result).toBeNull();
  });
  
  test("decode incomplete packet - start + length", () => {
    const result = decodePacket(new Uint8Array([START_BYTE_SHORT, 0x01]));
    expect(result).toBeNull();
  });
  
  test("decode incomplete packet - header + partial payload", () => {
    const result = decodePacket(new Uint8Array([START_BYTE_SHORT, 0x05, 0x04]));
    expect(result).toBeNull();
  });
  
  test("decode invalid start byte", () => {
    expect(() => {
      decodePacket(new Uint8Array([0xFF]));
    }).toThrow(ProtocolError);
    
    try {
      decodePacket(new Uint8Array([0xFF]));
    } catch (e) {
      expect(e).toBeInstanceOf(ProtocolError);
      expect((e as ProtocolError).kind).toBe("InvalidStartByte");
    }
  });
  
  test("decode invalid stop byte", () => {
    // Create a valid packet but modify the stop byte
    const encoded = encodePacketToArray(Command.CommAlive);
    const corrupted = new Uint8Array(encoded);
    corrupted[corrupted.length - 1] = 0xFF;
    
    expect(() => {
      decodePacket(corrupted);
    }).toThrow(ProtocolError);
    
    try {
      decodePacket(corrupted);
    } catch (e) {
      expect(e).toBeInstanceOf(ProtocolError);
      expect((e as ProtocolError).kind).toBe("InvalidStopByte");
    }
  });
  
  test("decode crc mismatch - payload corruption", () => {
    // Create a valid packet but corrupt a payload byte
    const encoded = encodePacketToArray(Command.CommGetValues);
    const corrupted = new Uint8Array(encoded);
    corrupted[2] = 0xFF; // Corrupt command byte
    
    expect(() => {
      decodePacket(corrupted);
    }).toThrow(ProtocolError);
    
    try {
      decodePacket(corrupted);
    } catch (e) {
      expect(e).toBeInstanceOf(ProtocolError);
      expect((e as ProtocolError).kind).toBe("CrcMismatch");
    }
  });
  
  test("decode crc mismatch - crc corruption", () => {
    const encoded = encodePacketToArray(Command.CommGetValues, new Uint8Array([0x01, 0x02, 0x03]));
    const corrupted = new Uint8Array(encoded);
    const crcIdx = encoded.length - 3;
    corrupted[crcIdx] ^= 0xFF; // Corrupt CRC byte
    
    expect(() => {
      decodePacket(corrupted);
    }).toThrow(ProtocolError);
    
    try {
      decodePacket(corrupted);
    } catch (e) {
      expect(e).toBeInstanceOf(ProtocolError);
      expect((e as ProtocolError).kind).toBe("CrcMismatch");
    }
  });
  
  test("decode lenient skips stop byte", () => {
    // Create a packet with wrong stop byte
    const encoded = encodePacketToArray(Command.CommAlive);
    const corrupted = new Uint8Array(encoded);
    corrupted[corrupted.length - 1] = 0xFF;
    
    // Lenient decode should succeed
    const decoded = decodePacketLenient(corrupted);
    expect(decoded).not.toBeNull();
    expect(decoded!.command).toBe(Command.CommAlive);
  });
  
  test("decode empty payload", () => {
    const encoded = encodePacketToArray(Command.CommReboot);
    const decoded = decodePacket(encoded);
    
    expect(decoded).not.toBeNull();
    expect(decoded!.command).toBe(Command.CommReboot);
    expect(decoded!.payload.length).toBe(0);
  });
  
  test("decode unknown command", () => {
    // Manually construct a packet with invalid command byte (200)
    const buffer = createPacketBuffer();
    const validPacket = encodePacket(buffer, Command.CommAlive);

    // Modify the command byte position
    const modified = new Uint8Array(validPacket);
    modified[2] = 200; // Unknown command (>159)

    // Recalculate CRC for the modified payload
    const payload = new Uint8Array([200]);
    const crc = calculateCrc(payload);
    const crcPos = validPacket.length - 3;
    modified[crcPos] = (crc >>> 8) & 0xFF;
    modified[crcPos + 1] = crc & 0xFF;

    expect(() => {
      decodePacket(modified);
    }).toThrow(ProtocolError);

    try {
      decodePacket(modified);
    } catch (e) {
      expect(e).toBeInstanceOf(ProtocolError);
      expect((e as ProtocolError).kind).toBe("UnknownCommand");
    }
  });
  
  test("decode incomplete packet detection", () => {
    const packet = encodePacketToArray(Command.CommGetValues, new Uint8Array([0x01, 0x02, 0x03]));
    
    // Test various partial lengths
    for (let i = 1; i < packet.length; i++) {
      const partial = packet.slice(0, i);
      const result = decodePacket(partial);
      
      // All partial packets should return null - need more data
      expect(result).toBeNull();
    }
    
    // Full packet should decode successfully
    const result = decodePacket(packet);
    expect(result).not.toBeNull();
  });
  
  test("decode lenient mode", () => {
    // Create packet with valid data but wrong stop byte
    const encoded = encodePacketToArray(Command.CommAlive);
    const packet = new Uint8Array(encoded);
    packet[packet.length - 1] = 0xFF;
    
    // Strict decode should fail
    expect(() => decodePacket(packet)).toThrow(ProtocolError);
    
    // Lenient decode should succeed
    const lenientResult = decodePacketLenient(packet);
    expect(lenientResult).not.toBeNull();
    expect(lenientResult!.command).toBe(Command.CommAlive);
  });
});

// ============================================================================
// CRC Tests
// ============================================================================

describe("CRC Calculation", () => {
  test("crc edge cases", () => {
    // Test CRC with empty data - should be 0 for CRC-16/USB
    const crcEmpty = calculateCrc(new Uint8Array(0));
    expect(crcEmpty).toBe(0x0000);
    
    // Test CRC with single byte
    const crcSingle = calculateCrc(new Uint8Array([0x00]));
    expect(crcSingle).not.toBe(0);
    
    // Test CRC with all zeros
    const zeros = new Uint8Array(100).fill(0x00);
    const crcZeros = calculateCrc(zeros);
    expect(crcZeros).not.toBe(0);
    
    // Test CRC with all ones
    const ones = new Uint8Array(100).fill(0xFF);
    const crcOnes = calculateCrc(ones);
    expect(crcOnes).not.toBe(0);
  });
  
  test("crc various corruptions", () => {
    const original = encodePacketToArray(Command.CommGetValues, new Uint8Array([0x01, 0x02, 0x03]));
    
    // Corrupt first payload byte
    const corrupted1 = new Uint8Array(original);
    corrupted1[2] ^= 0xFF; // XOR to flip all bits
    expect(() => decodePacket(corrupted1)).toThrow(ProtocolError);
    
    // Corrupt CRC byte
    const corrupted2 = new Uint8Array(original);
    const crcIdx = original.length - 3;
    corrupted2[crcIdx] ^= 0xFF;
    expect(() => decodePacket(corrupted2)).toThrow(ProtocolError);
  });
  
  test("crc from array function", () => {
    const data = [0x01, 0x02, 0x03, 0x04];
    const crc1 = calculateCrcFromArray(data);
    const crc2 = calculateCrc(new Uint8Array(data));
    expect(crc1).toBe(crc2);
  });
});

// ============================================================================
// Packet Boundary Tests
// ============================================================================

describe("Packet Boundaries", () => {
  test("find packet start", () => {
    expect(findPacketStart(new Uint8Array([START_BYTE_SHORT, 0x01]))).toBe(0);
    expect(findPacketStart(new Uint8Array([START_BYTE_LONG, 0x00, 0x01]))).toBe(0);
    expect(findPacketStart(new Uint8Array([0xFF, 0xFE, START_BYTE_SHORT]))).toBe(2);
    expect(findPacketStart(new Uint8Array([0xFF, 0xFE, 0xFD]))).toBeNull();
  });
  
  test("find packet start patterns", () => {
    // Valid short packet start at beginning
    expect(findPacketStart(new Uint8Array([START_BYTE_SHORT, 0x01]))).toBe(0);
    
    // Valid long packet start at beginning
    expect(findPacketStart(new Uint8Array([START_BYTE_LONG, 0x00, 0x01]))).toBe(0);
    
    // Start byte in middle of garbage
    expect(findPacketStart(new Uint8Array([0xFF, 0xFE, START_BYTE_SHORT, 0x01]))).toBe(2);
    expect(findPacketStart(new Uint8Array([0xFF, 0xFE, 0xFD, START_BYTE_LONG, 0x00, 0x01]))).toBe(3);
    
    // Multiple start bytes - should find first
    expect(findPacketStart(new Uint8Array([START_BYTE_SHORT, START_BYTE_LONG, 0x00, 0x01]))).toBe(0);
    
    // No valid start byte
    expect(findPacketStart(new Uint8Array([0xFF, 0xFE, 0xFD]))).toBeNull();
    
    // Empty slice
    expect(findPacketStart(new Uint8Array([]))).toBeNull();
  });
  
  test("expected packet size", () => {
    // Short packet with length
    expect(expectedPacketSize(new Uint8Array([START_BYTE_SHORT, 0x05]))).toBe(2 + 5 + 3);
    
    // Long packet with length
    expect(expectedPacketSize(new Uint8Array([START_BYTE_LONG, 0x01, 0x2C]))).toBe(3 + 300 + 3);
    
    // Incomplete
    expect(expectedPacketSize(new Uint8Array([START_BYTE_SHORT]))).toBeNull();
    expect(expectedPacketSize(new Uint8Array([START_BYTE_LONG, 0x01]))).toBeNull();
    
    // Invalid start byte
    expect(expectedPacketSize(new Uint8Array([0xFF]))).toBeNull();
  });
  
  test("expected packet size scenarios", () => {
    // Short packet with length
    expect(expectedPacketSize(new Uint8Array([START_BYTE_SHORT, 0x05]))).toBe(2 + 5 + 3);
    
    // Long packet with length
    expect(expectedPacketSize(new Uint8Array([START_BYTE_LONG, 0x01, 0x2C]))).toBe(3 + 300 + 3);
    
    // Incomplete short packet header
    expect(expectedPacketSize(new Uint8Array([START_BYTE_SHORT]))).toBeNull();
    
    // Incomplete long packet header
    expect(expectedPacketSize(new Uint8Array([START_BYTE_LONG, 0x01]))).toBeNull();
    
    // Invalid start byte
    expect(expectedPacketSize(new Uint8Array([0xFF]))).toBeNull();
  });
  
  test("has complete packet", () => {
    // Empty buffer
    expect(hasCompletePacket(new Uint8Array([]))).toBe(false);
    
    // Incomplete packet
    expect(hasCompletePacket(new Uint8Array([START_BYTE_SHORT, 0x05]))).toBe(false);
    
    // Complete short packet
    const shortPacket = encodePacketToArray(Command.CommAlive);
    expect(hasCompletePacket(shortPacket)).toBe(true);
    
    // Complete long packet
    const largePayload = new Uint8Array(300);
    const longPacket = encodePacketToArray(Command.CommCustomAppData, largePayload);
    expect(hasCompletePacket(longPacket)).toBe(true);
    
    // Partial packet
    expect(hasCompletePacket(longPacket.slice(0, 10))).toBe(false);
  });
  
  test("has complete packet states", () => {
    // Empty buffer
    expect(hasCompletePacket(new Uint8Array([]))).toBe(false);
    
    // Incomplete packet
    expect(hasCompletePacket(new Uint8Array([START_BYTE_SHORT, 0x05]))).toBe(false);
    
    // Complete short packet
    const shortPacket = encodePacketToArray(Command.CommAlive);
    expect(hasCompletePacket(shortPacket)).toBe(true);
    
    // Complete long packet
    const largePayload = new Uint8Array(300);
    const longPacket = encodePacketToArray(Command.CommCustomAppData, largePayload);
    expect(hasCompletePacket(longPacket)).toBe(true);
    
    // Partial packet
    expect(hasCompletePacket(longPacket.slice(0, 10))).toBe(false);
  });
});

// ============================================================================
// Packet Buffer Tests
// ============================================================================

describe("Packet Buffer", () => {
  test("packet buffer clear and reuse", () => {
    const buffer = createPacketBuffer();
    
    // Encode first packet
    const packet1 = encodePacket(buffer, Command.CommGetValues);
    const packet1Copy = new Uint8Array(packet1);
    
    // Clear and encode second packet
    clearPacketBuffer(buffer);
    const payload2 = new Uint8Array([0x01, 0x02, 0x03]);
    const packet2 = encodePacket(buffer, Command.CommSetDuty, payload2);
    const packet2Copy = new Uint8Array(packet2);
    
    // Verify they're different
    expect(packet1Copy).not.toEqual(packet2Copy);
    
    // Both should decode correctly
    const decoded1 = decodePacket(packet1Copy);
    expect(decoded1).not.toBeNull();
    expect(decoded1!.command).toBe(Command.CommGetValues);
    
    const decoded2 = decodePacket(packet2Copy);
    expect(decoded2).not.toBeNull();
    expect(decoded2!.command).toBe(Command.CommSetDuty);
    expect(decoded2!.payload).toEqual(payload2);
  });
  
  test("packet buffer as slice", () => {
    const buffer = createPacketBuffer();
    
    // Empty buffer should return empty slice
    expect(getPacketBufferSlice(buffer).length).toBe(0);
    
    // After encoding, should return valid data
    encodePacket(buffer, Command.CommGetValues);
    const slice = getPacketBufferSlice(buffer);
    expect(slice.length).toBeGreaterThan(0);
    expect(slice[0]).toBe(START_BYTE_SHORT);
  });
  
  test("packet buffer overflow protection", () => {
    const buffer = createPacketBuffer();
    
    // Try to encode maximum allowed payload
    const maxPayload = new Uint8Array(MAX_PAYLOAD_LEN - 1);
    const result = encodePacket(buffer, Command.CommCustomAppData, maxPayload);
    expect(result).toBeDefined();
    
    // Try to encode payload exceeding maximum
    const hugePayload = new Uint8Array(MAX_PAYLOAD_LEN + 100);
    expect(() => {
      encodePacketToArray(Command.CommCustomAppData, hugePayload);
    }).toThrow(ProtocolError);
  });
});

// ============================================================================
// Firmware Version Parsing Tests
// ============================================================================

describe("Firmware Version Parsing", () => {
  test("parse firmware version", () => {
    // Build a firmware version payload: [major] [minor] [name\0] [hw_name\0] [uuid:16] [compile_date]
    const name = new TextEncoder().encode("VESC Firmware\0");
    const hwName = new TextEncoder().encode("VESC 100_250\0");
    const uuid = new Uint8Array([0xa1, 0xb2, 0xc3, 0xd4, 0xe5, 0xf6, 0x00, 0x01,
                                 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]);
    const compileDate = new TextEncoder().encode("Jan 15 2024");
    
    const payload = new Uint8Array(2 + name.length + hwName.length + uuid.length + compileDate.length);
    let offset = 0;
    payload[offset++] = 6; // major
    payload[offset++] = 2; // minor
    payload.set(name, offset);
    offset += name.length;
    payload.set(hwName, offset);
    offset += hwName.length;
    payload.set(uuid, offset);
    offset += uuid.length;
    payload.set(compileDate, offset);
    
    const packet = createDecodedPacket(Command.CommFwVersion, payload);
    const version = parseFirmwareVersion(packet);
    
    expect(version.versionMajor).toBe(6);
    expect(version.versionMinor).toBe(2);
    expect(version.name).toBe("VESC Firmware");
    expect(version.hardwareName).toBe("VESC 100_250");
    expect(version.uuid).toEqual(uuid);
    expect(version.compileDate).toBe("Jan 15 2024");
    
    // Test UUID hex formatting
    const uuidHex = formatUuidHex(version.uuid);
    expect(uuidHex.length).toBe(32); // 16 bytes * 2 hex chars
    expect(uuidHex).toContain("a1");
    expect(uuidHex).toContain("b2");
  });
  
  test("parse firmware version minimal", () => {
    // Minimal payload with just major/minor
    const payload = new Uint8Array([5, 3]);
    const packet = createDecodedPacket(Command.CommFwVersion, payload);
    const version = parseFirmwareVersion(packet);
    
    expect(version.versionMajor).toBe(5);
    expect(version.versionMinor).toBe(3);
    expect(version.name).toBe("");
    expect(version.hardwareName).toBe("");
    expect(version.uuid).toEqual(new Uint8Array(16));
    expect(version.compileDate).toBe("");
  });
  
  test("parse firmware version incomplete", () => {
    // Empty payload should fail
    const packet1 = createDecodedPacket(Command.CommFwVersion, new Uint8Array(0));
    expect(() => parseFirmwareVersion(packet1)).toThrow(ProtocolError);
    
    // Single byte payload should fail
    const packet2 = createDecodedPacket(Command.CommFwVersion, new Uint8Array([6]));
    expect(() => parseFirmwareVersion(packet2)).toThrow(ProtocolError);
  });
  
  test("format uuid hex", () => {
    const uuid = new Uint8Array([0xa1, 0xb2, 0xc3, 0xd4, 0xe5, 0xf6, 0x00, 0x01,
                                0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]);
    const hex = formatUuidHex(uuid);
    expect(hex).toBe("a1b2c3d4e5f600010203040506070809");
  });
});

// ============================================================================
// Decoded Packet Tests
// ============================================================================

describe("Decoded Packet", () => {
  test("decoded packet getters", () => {
    const packet = createDecodedPacket(Command.CommGetValues, new Uint8Array([0x01, 0x02]));
    expect(packet.command).toBe(Command.CommGetValues);
    expect(packet.payload).toEqual(new Uint8Array([0x01, 0x02]));
  });
  
  test("create decoded packet with empty payload", () => {
    const packet = createDecodedPacket(Command.CommAlive);
    expect(packet.command).toBe(Command.CommAlive);
    expect(packet.payload.length).toBe(0);
  });
  
  test("create decoded packet with custom payload", () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]);
    const packet = createDecodedPacket(Command.CommSetDuty, payload);
    expect(packet.command).toBe(Command.CommSetDuty);
    expect(packet.payload).toEqual(payload);
  });
});

// ============================================================================
// Error Handling Tests
// ============================================================================

describe("Error Handling", () => {
  test("invalid start bytes", () => {
    const invalidBytes = [0x00, 0x01, 0x04, 0xFF, 0xAA, 0x55];
    
    for (const byte of invalidBytes) {
      const data = new Uint8Array([byte, 0x01, 0x00, 0x00, 0x03]);
      expect(() => decodePacket(data)).toThrow(ProtocolError);
      
      try {
        decodePacket(data);
      } catch (e) {
        expect((e as ProtocolError).kind).toBe("InvalidStartByte");
        expect((e as ProtocolError).details?.received).toBe(byte);
      }
    }
  });
  
  test("invalid stop bytes", () => {
    const payload = encodePacketToArray(Command.CommAlive);
    
    for (const invalidStop of [0x00, 0x02, 0x04, 0xFF]) {
      const corrupted = new Uint8Array(payload);
      corrupted[corrupted.length - 1] = invalidStop;
      
      expect(() => decodePacket(corrupted)).toThrow(ProtocolError);
      
      try {
        decodePacket(corrupted);
      } catch (e) {
        expect((e as ProtocolError).kind).toBe("InvalidStopByte");
        expect((e as ProtocolError).details?.received).toBe(invalidStop);
      }
    }
  });
  
  test("protocol error properties", () => {
    try {
      decodePacket(new Uint8Array([0xFF]));
    } catch (e) {
      const error = e as ProtocolError;
      expect(error.name).toBe("ProtocolError");
      expect(error.kind).toBeDefined();
      expect(error.details).toBeDefined();
      expect(error.message).toContain("Invalid start byte");
    }
  });
  
  test("unknown command detection", () => {
    // Manually construct a packet with invalid command byte (200)
    const buffer = createPacketBuffer();
    const validPacket = encodePacket(buffer, Command.CommAlive);

    // Modify command byte to invalid value
    const modified = new Uint8Array(validPacket);
    modified[2] = 200; // Unknown command (>159)

    // Recalculate CRC for the modified payload
    const payload = new Uint8Array([200]);
    const crc = calculateCrc(payload);
    const crcPos = validPacket.length - 3;
    modified[crcPos] = (crc >>> 8) & 0xFF;
    modified[crcPos + 1] = crc & 0xFF;

    expect(() => decodePacket(modified)).toThrow(ProtocolError);

    try {
      decodePacket(modified);
    } catch (e) {
      expect((e as ProtocolError).kind).toBe("UnknownCommand");
      expect((e as ProtocolError).details?.command).toBe(200);
    }
  });
  
  test("crc mismatch error details", () => {
    const encoded = encodePacketToArray(Command.CommGetValues);
    const corrupted = new Uint8Array(encoded);
    corrupted[2] = 0xFF;
    
    try {
      decodePacket(corrupted);
    } catch (e) {
      const error = e as ProtocolError;
      expect(error.kind).toBe("CrcMismatch");
      expect(error.details).toHaveProperty("calculated");
      expect(error.details).toHaveProperty("received");
    }
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("Integration", () => {
  test("full encode-decode cycle for all commands", () => {
    const commands = getAllCommands();
    
    for (const cmd of commands) {
      // Test with empty payload
      const encodedEmpty = encodePacketToArray(cmd);
      const decodedEmpty = decodePacket(encodedEmpty);
      expect(decodedEmpty!.command).toBe(cmd);
      expect(decodedEmpty!.payload.length).toBe(0);
      
      // Test with small payload
      const smallPayload = new Uint8Array([0x01, 0x02, 0x03]);
      const encodedSmall = encodePacketToArray(cmd, smallPayload);
      const decodedSmall = decodePacket(encodedSmall);
      expect(decodedSmall!.command).toBe(cmd);
      expect(decodedSmall!.payload).toEqual(smallPayload);
    }
  });
  
  test("stream synchronization scenario", () => {
    // Simulate receiving data with garbage before valid packet
    const validPacket = encodePacketToArray(Command.CommGetValues);
    const garbage = new Uint8Array([0xFF, 0xFE, 0xFD, 0xFC]);
    const streamData = new Uint8Array([...garbage, ...validPacket]);
    
    // Find packet start
    const startIdx = findPacketStart(streamData);
    expect(startIdx).toBe(garbage.length);
    
    // Extract and decode packet
    const packetData = streamData.slice(startIdx!);
    const decoded = decodePacket(packetData);
    expect(decoded).not.toBeNull();
    expect(decoded!.command).toBe(Command.CommGetValues);
  });
  
  test("multiple packets in buffer", () => {
    const packet1 = encodePacketToArray(Command.CommGetValues);
    const packet2 = encodePacketToArray(Command.CommAlive);
    const combined = new Uint8Array([...packet1, ...packet2]);
    
    // Should be able to decode first packet
    const decoded1 = decodePacket(combined);
    expect(decoded1).not.toBeNull();
    expect(decoded1!.command).toBe(Command.CommGetValues);
    
    // Calculate where second packet starts
    const expectedSize1 = expectedPacketSize(packet1);
    const secondPacketStart = expectedSize1!;
    
    // Decode second packet
    const decoded2 = decodePacket(combined.slice(secondPacketStart));
    expect(decoded2).not.toBeNull();
    expect(decoded2!.command).toBe(Command.CommAlive);
  });
  
  test("edge case payload sizes", () => {
    // Test boundary conditions
    const sizes = [0, 1, 254, 255, 256, 257, 1000, 10000];
    
    for (const size of sizes) {
      const payload = new Uint8Array(size).fill(0xAB);
      const encoded = encodePacketToArray(Command.CommCustomAppData, payload);
      
      // Should decode successfully
      const decoded = decodePacket(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded!.payload.length).toBe(size);
    }
  });
});
