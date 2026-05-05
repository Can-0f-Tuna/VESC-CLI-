/**
 * Error types for VESC serial communication
 */

export type ConnectionErrorKind =
  | "Serial"
  | "Protocol"
  | "Timeout"
  | "NoResponse"
  | "PortNotFound"
  | "NotConnected"
  | "Io";

export class ConnectionError extends Error {
  constructor(
    message: string,
    public readonly kind: ConnectionErrorKind,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ConnectionError";
  }
}

export function serialError(message: string, inner?: Error): ConnectionError {
  return new ConnectionError(
    `Serial error: ${message}${inner ? ` (${inner.message})` : ""}`,
    "Serial",
    inner ? { innerError: inner.message } : undefined
  );
}

export function protocolError(message: string, inner?: Error): ConnectionError {
  return new ConnectionError(
    `Protocol error: ${message}${inner ? ` (${inner.message})` : ""}`,
    "Protocol",
    inner ? { innerError: inner.message } : undefined
  );
}

export function timeoutError(durationMs: number): ConnectionError {
  return new ConnectionError(
    `Timeout after ${durationMs}ms`,
    "Timeout",
    { durationMs }
  );
}

export function noResponseError(): ConnectionError {
  return new ConnectionError(
    "No response from VESC",
    "NoResponse"
  );
}

export function portNotFoundError(portName: string): ConnectionError {
  return new ConnectionError(
    `Port not found: ${portName}`,
    "PortNotFound",
    { portName }
  );
}

export function notConnectedError(): ConnectionError {
  return new ConnectionError(
    "Not connected",
    "NotConnected"
  );
}

export function ioError(message: string, inner?: Error): ConnectionError {
  return new ConnectionError(
    `IO error: ${message}${inner ? ` (${inner.message})` : ""}`,
    "Io",
    inner ? { innerError: inner.message } : undefined
  );
}
