import { START_BYTE_SHORT, START_BYTE_LONG, MAX_PAYLOAD_LEN } from "./constants";

/**
 * Protocol error types for VESC communication
 */
export class ProtocolError extends Error {
  constructor(
    message: string,
    public readonly kind: ProtocolErrorKind,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ProtocolError";
  }
}

/**
 * Specific error kinds for protocol errors
 */
export type ProtocolErrorKind =
  | "InvalidStartByte"
  | "InvalidStopByte"
  | "CrcMismatch"
  | "PayloadTooLong"
  | "BufferTooSmall"
  | "IncompletePacket"
  | "UnknownCommand";

/**
 * Create an invalid start byte error
 */
export function invalidStartByte(byte: number): ProtocolError {
  return new ProtocolError(
    `Invalid start byte: expected 0x${START_BYTE_SHORT.toString(16).padStart(2, "0")} or 0x${START_BYTE_LONG.toString(16).padStart(2, "0")}, got 0x${byte.toString(16).padStart(2, "0")}`,
    "InvalidStartByte",
    { received: byte, expectedShort: START_BYTE_SHORT, expectedLong: START_BYTE_LONG }
  );
}

/**
 * Create an invalid stop byte error
 */
export function invalidStopByte(byte: number): ProtocolError {
  return new ProtocolError(
    `Invalid stop byte: expected 0x${START_BYTE_LONG.toString(16).padStart(2, "0")}, got 0x${byte.toString(16).padStart(2, "0")}`,
    "InvalidStopByte",
    { received: byte, expected: START_BYTE_LONG }
  );
}

/**
 * Create a CRC mismatch error
 */
export function crcMismatch(calculated: number, received: number): ProtocolError {
  return new ProtocolError(
    `CRC mismatch: calculated 0x${calculated.toString(16).padStart(4, "0")}, received 0x${received.toString(16).padStart(4, "0")}`,
    "CrcMismatch",
    { calculated, received }
  );
}

/**
 * Create a payload too long error
 */
export function payloadTooLong(length: number): ProtocolError {
  return new ProtocolError(
    `Payload too long: ${length} bytes (max ${MAX_PAYLOAD_LEN})`,
    "PayloadTooLong",
    { length, max: MAX_PAYLOAD_LEN }
  );
}

/**
 * Create a buffer too small error
 */
export function bufferTooSmall(required: number, available: number): ProtocolError {
  return new ProtocolError(
    `Buffer too small: need ${required}, have ${available}`,
    "BufferTooSmall",
    { required, available }
  );
}

/**
 * Create an incomplete packet error
 */
export function incompletePacket(expected: number, actual: number): ProtocolError {
  return new ProtocolError(
    `Incomplete packet: expected ${expected} bytes, have ${actual}`,
    "IncompletePacket",
    { expected, actual }
  );
}

/**
 * Create an unknown command error
 */
export function unknownCommand(command: number): ProtocolError {
  return new ProtocolError(
    `Unknown command: ${command}`,
    "UnknownCommand",
    { command }
  );
}
