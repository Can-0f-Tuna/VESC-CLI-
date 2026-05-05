/**
 * VESC Protocol Integration Tests
 * 
 * High-level integration tests for the protocol implementation.
 * For comprehensive unit tests, see protocol.test.ts
 */
import { describe, it, expect } from 'bun:test';
import {
  // Commands
  Command,
  commandToU8,
  // Constants
  START_BYTE_SHORT,
  START_BYTE_LONG,
  STOP_BYTE,
  // CRC
  calculateCrc,
  // Packet
  encodePacketToArray,
  decodePacket,
  createPacketBuffer,
  encodePacket,
  // Types
  DecodedPacket,
} from './index';

/**
 * Helper function to build a command packet (convenience wrapper)
 */
function buildCommandPacket(command: Command, payload?: Uint8Array): { command: Command; payload: Uint8Array } {
  return {
    command,
    payload: payload ?? new Uint8Array(0),
  };
}

/**
 * Helper to build a GetValues packet
 */
function buildGetValuesPacket(): { command: Command; payload: Uint8Array } {
  return buildCommandPacket(Command.CommGetValues);
}

/**
 * Helper to build a SetRpm packet
 */
function buildSetRpmPacket(rpm: number): { command: Command; payload: Uint8Array } {
  // RPM is a 4-byte signed integer in big-endian
  const payload = new Uint8Array(4);
  const view = new DataView(payload.buffer);
  view.setInt32(0, rpm, false); // Big-endian
  return buildCommandPacket(Command.CommSetRpm, payload);
}

/**
 * Helper to build a SetCurrent packet
 */
function buildSetCurrentPacket(current: number): { command: Command; payload: Uint8Array } {
  // Current is a 4-byte float in big-endian
  const payload = new Uint8Array(4);
  const view = new DataView(payload.buffer);
  view.setFloat32(0, current, false); // Big-endian
  return buildCommandPacket(Command.CommSetCurrent, payload);
}

/**
 * Helper to build a Stop packet (set current to 0)
 */
function buildStopPacket(): { command: Command; payload: Uint8Array } {
  return buildSetCurrentPacket(0);
}

/**
 * Decode multiple packets from a buffer
 * Returns array of decoded packets and bytes consumed for each
 */
function decodePackets(data: Uint8Array): Array<{ packet: DecodedPacket; bytesConsumed: number }> {
  const results: Array<{ packet: DecodedPacket; bytesConsumed: number }> = [];
  let offset = 0;
  
  while (offset < data.length) {
    const remaining = data.slice(offset);
    const packet = decodePacket(remaining);
    
    if (packet === null) {
      // Incomplete packet, stop processing
      break;
    }
    
    // Calculate bytes consumed based on packet structure
    const payloadLen = 1 + packet.payload.length; // command byte + payload
    let headerLen: number;
    let isShort: boolean;
    
    if (remaining[0] === START_BYTE_SHORT) {
      headerLen = 2;
      isShort = true;
    } else if (remaining[0] === START_BYTE_LONG) {
      headerLen = 3;
      isShort = false;
    } else {
      // Invalid start byte, skip one byte and continue
      offset++;
      continue;
    }
    
    const bytesConsumed = headerLen + payloadLen + 3; // header + payload + CRC + stop
    
    results.push({ packet, bytesConsumed });
    offset += bytesConsumed;
  }
  
  return results;
}

describe('VESC Protocol Integration', () => {
  describe('CRC calculation', () => {
    it('should calculate CRC correctly', () => {
      const data = new Uint8Array([0x04]); // COMM_GET_VALUES
      const crc = calculateCrc(data);
      expect(crc).toBeGreaterThan(0);
    });
    
    it('should calculate CRC consistently', () => {
      const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const crc1 = calculateCrc(data);
      const crc2 = calculateCrc(data);
      expect(crc1).toBe(crc2);
    });
  });

  describe('Packet encoding', () => {
    it('should encode short packet correctly', () => {
      const packet = buildCommandPacket(Command.CommGetValues);
      const encoded = encodePacketToArray(packet.command, packet.payload);
      
      expect(encoded[0]).toBe(START_BYTE_SHORT);
      expect(encoded[1]).toBe(1); // payload length
      expect(encoded[2]).toBe(commandToU8(Command.CommGetValues));
      expect(encoded[encoded.length - 1]).toBe(STOP_BYTE);
    });

    it('should encode set RPM packet', () => {
      const packet = buildSetRpmPacket(1000);
      const encoded = encodePacketToArray(packet.command, packet.payload);
      
      expect(encoded[0]).toBe(START_BYTE_SHORT);
      expect(encoded[1]).toBe(5); // command + 4 bytes
      expect(encoded[2]).toBe(commandToU8(Command.CommSetRpm));
    });
    
    it('should encode set current packet', () => {
      const packet = buildSetCurrentPacket(5.0);
      const encoded = encodePacketToArray(packet.command, packet.payload);
      
      expect(encoded[0]).toBe(START_BYTE_SHORT);
      expect(encoded[1]).toBe(5); // command + 4 bytes
      expect(encoded[2]).toBe(commandToU8(Command.CommSetCurrent));
    });
    
    it('should use long packet format for large payloads', () => {
      const largePayload = new Uint8Array(300).fill(0xAA);
      const packet = buildCommandPacket(Command.CommCustomAppData, largePayload);
      const encoded = encodePacketToArray(packet.command, packet.payload);
      
      expect(encoded[0]).toBe(START_BYTE_LONG);
    });
  });

  describe('Packet decoding', () => {
    it('should decode a valid packet', () => {
      const packet = buildCommandPacket(Command.CommGetValues);
      const encoded = encodePacketToArray(packet.command, packet.payload);
      
      const decoded = decodePackets(encoded);
      
      expect(decoded).toHaveLength(1);
      expect(decoded[0].packet.command).toBe(Command.CommGetValues);
      expect(decoded[0].bytesConsumed).toBe(encoded.length);
    });

    it('should handle multiple packets in buffer', () => {
      const packet1 = buildGetValuesPacket();
      const packet2 = buildStopPacket();
      
      const encoded1 = encodePacketToArray(packet1.command, packet1.payload);
      const encoded2 = encodePacketToArray(packet2.command, packet2.payload);
      
      const combined = new Uint8Array(encoded1.length + encoded2.length);
      combined.set(encoded1, 0);
      combined.set(encoded2, encoded1.length);
      
      const decoded = decodePackets(combined);
      
      expect(decoded).toHaveLength(2);
      expect(decoded[0].packet.command).toBe(Command.CommGetValues);
      expect(decoded[1].packet.command).toBe(Command.CommSetCurrent);
    });
    
    it('should decode packet with payload', () => {
      const packet = buildSetRpmPacket(5000);
      const encoded = encodePacketToArray(packet.command, packet.payload);
      
      const decoded = decodePacket(encoded);
      
      expect(decoded).not.toBeNull();
      expect(decoded!.command).toBe(Command.CommSetRpm);
      expect(decoded!.payload.length).toBe(4);
      
      // Verify RPM value
      const view = new DataView(decoded!.payload.buffer);
      expect(view.getInt32(0, false)).toBe(5000);
    });
  });
  
  describe('Roundtrip tests', () => {
    it('should roundtrip all commands with empty payload', () => {
      for (let i = 0; i <= 57; i++) {
        const cmd = i as Command;
        const packet = buildCommandPacket(cmd);
        const encoded = encodePacketToArray(packet.command, packet.payload);
        const decoded = decodePacket(encoded);
        
        expect(decoded).not.toBeNull();
        expect(decoded!.command).toBe(cmd);
        expect(decoded!.payload.length).toBe(0);
      }
    });
    
    it('should roundtrip packets with various payload sizes', () => {
      const sizes = [0, 1, 10, 100, 254, 255, 256, 1000];
      
      for (const size of sizes) {
        const payload = new Uint8Array(size).fill(size % 256);
        const packet = buildCommandPacket(Command.CommCustomAppData, payload);
        const encoded = encodePacketToArray(packet.command, packet.payload);
        const decoded = decodePacket(encoded);
        
        expect(decoded).not.toBeNull();
        expect(decoded!.command).toBe(Command.CommCustomAppData);
        expect(decoded!.payload.length).toBe(size);
        expect(decoded!.payload).toEqual(payload);
      }
    });
  });
  
  describe('Packet buffer reuse', () => {
    it('should allow buffer reuse for multiple packets', () => {
      const buffer = createPacketBuffer();
      
      // Encode first packet
      const packet1 = buildCommandPacket(Command.CommGetValues);
      const encoded1 = encodePacket(buffer, packet1.command, packet1.payload);
      const encoded1Copy = new Uint8Array(encoded1);
      
      // Encode second packet (buffer should be cleared automatically)
      const packet2 = buildCommandPacket(Command.CommAlive);
      const encoded2 = encodePacket(buffer, packet2.command, packet2.payload);
      
      // Should be different encodings
      expect(encoded1Copy).not.toEqual(encoded2);
      
      // Both should decode correctly
      const decoded1 = decodePacket(encoded1Copy);
      const decoded2 = decodePacket(encoded2);
      
      expect(decoded1!.command).toBe(Command.CommGetValues);
      expect(decoded2!.command).toBe(Command.CommAlive);
    });
  });
});
