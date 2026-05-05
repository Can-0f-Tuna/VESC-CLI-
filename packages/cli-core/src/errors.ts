/**
 * CLI Error Types and Utilities
 * 
 * Provides error kinds, exit codes, and error creation utilities
 * compatible with the agent-first design.
 */

import type { ErrorResponse, NextAction } from './types';

// ============================================================================
// Exit Codes (matching Rust implementation)
// ============================================================================

export enum ExitCode {
  /** Success */
  SUCCESS = 0,
  /** General error */
  GENERAL_ERROR = 1,
  /** Invalid arguments */
  INVALID_ARGUMENTS = 2,
  /** Connection failed */
  CONNECTION_FAILED = 3,
  /** Timeout */
  TIMEOUT = 4,
  /** Protocol error */
  PROTOCOL_ERROR = 5,
  /** Resource not found */
  NOT_FOUND = 6,
  /** Permission denied */
  PERMISSION_DENIED = 7,
  /** Dry run success (used for --dry-run operations) */
  DRY_RUN_SUCCESS = 10,
}

// ============================================================================
// Error Kinds
// ============================================================================

export enum ErrorKind {
  /** Connection failed - retryable */
  CONNECTION = 'connection',
  /** Command timed out - retryable */
  TIMEOUT = 'timeout',
  /** Protocol error - not retryable */
  PROTOCOL = 'protocol',
  /** Invalid arguments - not retryable */
  INVALID_ARGUMENT = 'invalid_argument',
  /** Resource not found - not retryable */
  NOT_FOUND = 'not_found',
  /** Permission denied - not retryable */
  PERMISSION = 'permission',
  /** Validation failed - not retryable */
  VALIDATION = 'validation',
  /** Unknown error */
  UNKNOWN = 'unknown',
}

/**
 * Check if an error kind is retryable
 */
export function isRetryableError(kind: ErrorKind): boolean {
  return kind === ErrorKind.CONNECTION || kind === ErrorKind.TIMEOUT;
}

/**
 * Get description for an error kind
 */
export function getErrorKindDescription(kind: ErrorKind): string {
  const descriptions: Record<ErrorKind, string> = {
    [ErrorKind.CONNECTION]: 'Connection failed',
    [ErrorKind.TIMEOUT]: 'Command timed out',
    [ErrorKind.PROTOCOL]: 'Protocol error',
    [ErrorKind.INVALID_ARGUMENT]: 'Invalid argument',
    [ErrorKind.NOT_FOUND]: 'Resource not found',
    [ErrorKind.PERMISSION]: 'Permission denied',
    [ErrorKind.VALIDATION]: 'Validation failed',
    [ErrorKind.UNKNOWN]: 'Unknown error',
  };
  return descriptions[kind];
}

/**
 * Get exit code for an error kind
 */
export function getExitCodeForError(kind: ErrorKind): ExitCode {
  const exitCodes: Record<ErrorKind, ExitCode> = {
    [ErrorKind.CONNECTION]: ExitCode.CONNECTION_FAILED,
    [ErrorKind.TIMEOUT]: ExitCode.TIMEOUT,
    [ErrorKind.PROTOCOL]: ExitCode.PROTOCOL_ERROR,
    [ErrorKind.INVALID_ARGUMENT]: ExitCode.INVALID_ARGUMENTS,
    [ErrorKind.NOT_FOUND]: ExitCode.NOT_FOUND,
    [ErrorKind.PERMISSION]: ExitCode.PERMISSION_DENIED,
    [ErrorKind.VALIDATION]: ExitCode.INVALID_ARGUMENTS,
    [ErrorKind.UNKNOWN]: ExitCode.GENERAL_ERROR,
  };
  return exitCodes[kind];
}

// ============================================================================
// Standard Recovery Actions
// ============================================================================

/**
 * Get standard next actions for error recovery
 */
export function getStandardRecoveryActions(): NextAction[] {
  return [
    {
      command: 'device list-ports',
      description: 'List available serial ports',
    },
    {
      command: 'device ping',
      description: 'Check VESC connectivity',
    },
  ];
}

/**
 * Get connection-specific recovery actions
 */
export function getConnectionRecoveryActions(port?: string): NextAction[] {
  const actions: NextAction[] = [
    {
      command: 'device list-ports',
      description: 'List available serial ports',
    },
  ];
  
  if (port) {
    actions.push({
      command: 'device connect',
      description: 'Attempt to reconnect to the device',
      params: { port },
    });
  }
  
  actions.push({
    command: 'device ping',
    description: 'Check if VESC is responsive',
  });
  
  return actions;
}

// ============================================================================
// Error Creation
// ============================================================================

/**
 * Create an error response object
 */
export function createErrorResponse(
  command: string,
  error: string,
  errorKind: ErrorKind = ErrorKind.UNKNOWN,
  suggestion?: string,
  nextActions: NextAction[] = getStandardRecoveryActions()
): ErrorResponse {
  return {
    ok: false,
    command,
    error,
    error_kind: errorKind,
    suggestion,
    next_actions: nextActions,
  };
}

/**
 * Create a connection error
 */
export function createConnectionError(
  command: string,
  port?: string,
  details?: string
): ErrorResponse {
  const error = details 
    ? `Connection failed${port ? ` on ${port}` : ''}: ${details}`
    : `Connection failed${port ? ` on ${port}` : ''}`;
  
  return createErrorResponse(
    command,
    error,
    ErrorKind.CONNECTION,
    port 
      ? `Check that the VESC is connected to ${port} and powered on`
      : 'Check VESC connection and power',
    getConnectionRecoveryActions(port)
  );
}

/**
 * Create a timeout error
 */
export function createTimeoutError(
  command: string,
  timeoutMs: number,
  port?: string
): ErrorResponse {
  return createErrorResponse(
    command,
    `Command timed out after ${timeoutMs}ms`,
    ErrorKind.TIMEOUT,
    'Try increasing the timeout with --timeout or check if the VESC is responsive',
    getConnectionRecoveryActions(port)
  );
}

/**
 * Create a protocol error
 */
export function createProtocolError(
  command: string,
  details?: string
): ErrorResponse {
  return createErrorResponse(
    command,
    details ? `Protocol error: ${details}` : 'Protocol error',
    ErrorKind.PROTOCOL,
    'Check VESC firmware version and try again',
    getStandardRecoveryActions()
  );
}

/**
 * Create a validation error
 */
export function createValidationError(
  command: string,
  details: string
): ErrorResponse {
  return createErrorResponse(
    command,
    `Validation error: ${details}`,
    ErrorKind.VALIDATION,
    'Check your input and try again',
    [
      {
        command: 'schema',
        description: 'Show command schema for reference',
      },
    ]
  );
}

/**
 * Create a not found error
 */
export function createNotFoundError(
  command: string,
  resource: string
): ErrorResponse {
  return createErrorResponse(
    command,
    `Not found: ${resource}`,
    ErrorKind.NOT_FOUND,
    `Verify the ${resource} exists and is accessible`,
    [
      {
        command: 'device list-ports',
        description: 'List available serial ports',
      },
    ]
  );
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Classify an unknown error into an ErrorKind
 */
export function classifyError(error: unknown): ErrorKind {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) return ErrorKind.TIMEOUT;
    if (message.includes('connect') || message.includes('enoent') || message.includes('econnrefused')) {
      return ErrorKind.CONNECTION;
    }
    if (message.includes('permission') || message.includes('eacces')) {
      return ErrorKind.PERMISSION;
    }
    if (message.includes('not found') || message.includes('enoent')) {
      return ErrorKind.NOT_FOUND;
    }
    if (message.includes('protocol') || message.includes('invalid') || message.includes('parse')) {
      return ErrorKind.PROTOCOL;
    }
  }
  
  return ErrorKind.UNKNOWN;
}

/**
 * Convert any error to an ErrorResponse
 */
export function errorToResponse(
  command: string,
  error: unknown,
  suggestion?: string
): ErrorResponse {
  const errorKind = classifyError(error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return createErrorResponse(
    command,
    errorMessage,
    errorKind,
    suggestion,
    isRetryableError(errorKind) ? getStandardRecoveryActions() : []
  );
}

// ============================================================================
// Error Output
// ============================================================================

/**
 * Format an error for console output (non-JSON)
 */
export function formatErrorForConsole(response: ErrorResponse): string {
  const lines: string[] = [
    `Error: ${response.error}`,
  ];
  
  if (response.error_kind) {
    lines.push(`Kind: ${response.error_kind}`);
  }
  
  if (response.suggestion) {
    lines.push(`Suggestion: ${response.suggestion}`);
  }
  
  if (response.next_actions.length > 0) {
    lines.push('');
    lines.push('Try one of these commands:');
    for (const action of response.next_actions.slice(0, 3)) {
      lines.push(`  ${action.command} - ${action.description}`);
    }
  }
  
  return lines.join('\n');
}
