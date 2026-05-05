/**
 * Serial Port Communication for VESC
 * 
 * Provides async serial communication using serialport library
 * Compatible with Bun runtime
 */

// Export VescClient - the high-level API
export { VescClient, VescCommand } from './client.js';

// Export VescConnection - the low-level connection
export { VescConnection } from './connection.js';

// Export detection utilities
export {
  listPorts,
  filterVescPorts,
  autoDetectPort,
  autoDetectPortWithTimeout,
  isVescPort,
} from './detection.js';

// Export types
export type {
  PortInfo,
  FirmwareInfo,
  MotorTelemetry,
  McConfiguration,
  AppConfiguration,
  ConnectionConfig,
} from './types.js';

// Export error types
export {
  ConnectionError,
  type ConnectionErrorKind,
  serialError,
  protocolError,
  timeoutError,
  noResponseError,
  portNotFoundError,
  notConnectedError,
  ioError,
} from './errors.js';

// Export FaultCode enum
export { FaultCode, DEFAULT_BAUD_RATE, DEFAULT_TIMEOUT_MS } from './types.js';

// Re-export protocol types for convenience
export type { DecodedPacket } from '@veac/protocol';

// Export serialport for advanced usage
export { SerialPort } from 'serialport';
