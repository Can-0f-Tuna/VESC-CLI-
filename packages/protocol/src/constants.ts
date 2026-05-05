/// VESC Binary Protocol Constants

/** Start byte for short packets (payload length ≤ 255 bytes) */
export const START_BYTE_SHORT = 0x02;

/** Start byte for long packets (payload length > 255 bytes) */
export const START_BYTE_LONG = 0x03;

/** Stop byte marking end of packet */
export const STOP_BYTE = 0x03;

/** Maximum payload length (u16 max) */
export const MAX_PAYLOAD_LEN = 65535;

/** Maximum packet buffer size (worst case: start + 2-byte len + payload + CRC + stop) */
export const MAX_PACKET_SIZE = 65541; // 1 + 2 + 65535 + 2 + 1 = 65541
