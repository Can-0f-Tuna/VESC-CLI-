// Main exports from the VESC protocol package

// Constants
export {
  START_BYTE_SHORT,
  START_BYTE_LONG,
  STOP_BYTE,
  MAX_PAYLOAD_LEN,
  MAX_PACKET_SIZE,
} from "./constants";

// Commands
export {
  Command,
  commandToU8,
  commandFromU8,
  getAllCommands,
  validateCommandPayload,
} from "./commands";

// CRC
export {
  calculateCrc,
  calculateCrcFromArray,
  verifyCrc,
  updateCrc,
  finalizeCrc,
} from "./crc";

// Types
export type {
  FirmwareVersion,
  DecodedPacket,
  PacketBuffer,
  ProtocolStats,
  EncodeOptions,
  DecodeOptions,
  EncodeResult,
  DecodeResult,
} from "./types";

export {
  formatUuidHex,
  parseNullTerminatedString,
  parseUuid,
} from "./types";

// Errors
export {
  ProtocolError,
  type ProtocolErrorKind,
  invalidStartByte,
  invalidStopByte,
  crcMismatch,
  payloadTooLong,
  bufferTooSmall,
  incompletePacket,
  unknownCommand,
} from "./errors";

// Packet encoding/decoding
export {
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
} from "./packet";
