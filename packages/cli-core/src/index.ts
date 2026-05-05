/**
 * CLI Core - Shared utilities for VESC CLI
 * 
 * Provides:
 * - Output formatting (JSON/YAML/Table)
 * - Error handling with structured responses
 * - Schema introspection
 * - Terminal utilities (spinners, colors)
 */

import chalk from 'chalk';
import ora from 'ora';
import { z } from 'zod';

// ============================================================================
// Output Formatting
// ============================================================================

export type OutputFormat = 'auto' | 'json' | 'yaml' | 'table';

export interface OutputOptions {
  format: OutputFormat;
  isTTY: boolean;
}

export function detectFormat(requested: OutputFormat, isTTY: boolean): OutputFormat {
  if (requested === 'auto') {
    return isTTY ? 'table' : 'json';
  }
  return requested;
}

export function formatOutput(data: unknown, format: OutputFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    
    case 'yaml':
      // Simple YAML-like output for now
      return convertToYaml(data);
    
    case 'table':
      return formatAsTable(data);
    
    default:
      return JSON.stringify(data, null, 2);
  }
}

function convertToYaml(data: unknown, indent = 0): string {
  if (data === null) return 'null';
  if (data === undefined) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'number') return String(data);
  if (typeof data === 'boolean') return String(data);
  
  if (Array.isArray(data)) {
    if (data.length === 0) return '[]';
    return data
      .map(item => `${' '.repeat(indent)}- ${convertToYaml(item, indent + 2).trimStart()}`)
      .join('\n');
  }
  
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    return Object.entries(obj)
      .map(([key, value]) => {
        const val = convertToYaml(value, indent + 2);
        if (val.includes('\n')) {
          return `${' '.repeat(indent)}${key}:\n${val}`;
        }
        return `${' '.repeat(indent)}${key}: ${val}`;
      })
      .join('\n');
  }
  
  return String(data);
}

function formatAsTable(data: unknown): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return 'No data';
    
    // Array of objects
    if (typeof data[0] === 'object' && data[0] !== null) {
      const keys = Object.keys(data[0]);
      const rows = data.map(item => {
        const obj = item as Record<string, unknown>;
        return keys.map(k => String(obj[k] ?? ''));
      });
      
      return formatTable(keys, rows);
    }
    
    // Simple array
    return data.map((item, i) => `${i}: ${item}`).join('\n');
  }
  
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    return Object.entries(obj)
      .map(([key, value]) => `${chalk.cyan(key)}: ${formatValue(value)}`)
      .join('\n');
  }
  
  return String(data);
}

function formatTable(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((h, i) => {
    const cellWidths = rows.map(r => r[i]?.length ?? 0);
    return Math.max(h.length, ...cellWidths) + 2;
  });
  
  const separator = '+-' + colWidths.map(w => '-'.repeat(w)).join('-+-') + '-+';
  
  const formatRow = (cells: string[]) => {
    return '| ' + cells.map((c, i) => c.padEnd(colWidths[i] - 1)).join('| ') + '|';
  };
  
  const lines = [
    separator,
    formatRow(headers.map(h => chalk.bold(h))),
    separator,
    ...rows.map(r => formatRow(r)),
    separator
  ];
  
  return lines.join('\n');
}

function formatValue(value: unknown): string {
  if (value === null) return chalk.gray('null');
  if (value === undefined) return chalk.gray('undefined');
  if (typeof value === 'number') return chalk.yellow(String(value));
  if (typeof value === 'boolean') return chalk.magenta(String(value));
  if (typeof value === 'string') return chalk.green(`"${value}"`);
  return String(value);
}

// ============================================================================
// Error Handling
// ============================================================================

export enum ExitCode {
  SUCCESS = 0,
  GENERAL_ERROR = 1,
  INVALID_ARGUMENTS = 2,
  CONNECTION_FAILED = 3,
  TIMEOUT = 4,
  PROTOCOL_ERROR = 5,
  NOT_FOUND = 6,
  PERMISSION_DENIED = 7,
  DRY_RUN_SUCCESS = 10
}

export enum ErrorKind {
  CONNECTION = 'connection',
  TIMEOUT = 'timeout',
  PROTOCOL = 'protocol',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

export interface ErrorResponse {
  ok: false;
  command: string;
  error: string;
  errorKind: ErrorKind;
  suggestion?: string;
  nextActions: NextAction[];
}

export interface SuccessResponse<T = unknown> {
  ok: true;
  command: string;
  result: T;
  nextActions: NextAction[];
}

export type CLIResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export interface NextAction {
  command: string;
  description: string;
  params?: Record<string, unknown>;
}

export function createSuccessResponse<T>(
  command: string,
  result: T,
  nextActions: NextAction[] = []
): SuccessResponse<T> {
  return {
    ok: true,
    command,
    result,
    nextActions
  };
}

export function createErrorResponse(
  command: string,
  error: string,
  errorKind: ErrorKind = ErrorKind.UNKNOWN,
  suggestion?: string,
  nextActions: NextAction[] = []
): ErrorResponse {
  return {
    ok: false,
    command,
    error,
    errorKind,
    suggestion,
    nextActions
  };
}

export function formatResponse(response: CLIResponse, format: OutputFormat): string {
  return formatOutput(response, format);
}

// ============================================================================
// Spinner Utilities
// ============================================================================

export function createSpinner(text: string) {
  return ora({
    text,
    spinner: 'dots',
    color: 'cyan'
  });
}

export function withSpinner<T>(
  text: string,
  fn: () => Promise<T>
): Promise<T> {
  const spinner = createSpinner(text);
  spinner.start();
  
  return fn()
    .then(result => {
      spinner.succeed();
      return result;
    })
    .catch(error => {
      spinner.fail(error.message);
      throw error;
    });
}

// ============================================================================
// Schema Introspection
// ============================================================================

export interface CommandSchema {
  name: string;
  description: string;
  mutating: boolean;
  args: ArgSchema[];
  options: OptionSchema[];
  outputFields: OutputFieldSchema[];
}

export interface ArgSchema {
  name: string;
  type: 'string' | 'number' | 'integer' | 'boolean';
  required: boolean;
  description: string;
  default?: unknown;
}

export interface OptionSchema {
  name: string;
  alias?: string;
  type: 'string' | 'number' | 'integer' | 'boolean';
  description: string;
  default?: unknown;
}

export interface OutputFieldSchema {
  name: string;
  type: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array';
  description: string;
}

export interface ErrorKindSchema {
  kind: ErrorKind;
  retryable: boolean;
  description: string;
}

export interface Schema {
  name: string;
  version: string;
  commands: CommandSchema[];
  errorKinds: ErrorKindSchema[];
}

export function defineCommandSchema(schema: CommandSchema): CommandSchema {
  return schema;
}

export function generateFullSchema(
  name: string,
  version: string,
  commands: CommandSchema[]
): Schema {
  return {
    name,
    version,
    commands,
    errorKinds: [
      { kind: ErrorKind.CONNECTION, retryable: true, description: 'Connection failed' },
      { kind: ErrorKind.TIMEOUT, retryable: true, description: 'Command timed out' },
      { kind: ErrorKind.PROTOCOL, retryable: false, description: 'VESC protocol error' },
      { kind: ErrorKind.VALIDATION, retryable: false, description: 'Invalid arguments' },
      { kind: ErrorKind.NOT_FOUND, retryable: false, description: 'Resource not found' },
      { kind: ErrorKind.PERMISSION, retryable: false, description: 'Access denied' },
      { kind: ErrorKind.UNKNOWN, retryable: false, description: 'Unknown error' }
    ]
  };
}

// ============================================================================
// Environment Detection
// ============================================================================

export function isRunningInCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.BUILD_NUMBER ||
    process.env.TRAVIS ||
    process.env.GITHUB_ACTIONS
  );
}

export function shouldUseColor(): boolean {
  if (isRunningInCI()) return false;
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return process.stdout.isTTY;
}

export { chalk, ora, z };
