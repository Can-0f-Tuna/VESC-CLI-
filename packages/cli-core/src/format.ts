/**
 * Formatting Utilities
 * 
 * Provides JSON, YAML, and Table formatting for CLI output
 * with TTY detection and agent-first design.
 */

import YAML from 'yaml';
import Table from 'cli-table3';
import { shouldUseColor, formatValueWithColor, colors } from './colors';

// ============================================================================
// Format Types and Detection
// ============================================================================

export type OutputFormat = 'json' | 'table' | 'yaml';

export interface FormatOptions {
  format: OutputFormat;
  isTTY: boolean;
  verbose?: boolean;
  maxPayloadSize?: number;
}

/** Maximum payload size before truncation warning */
export const MAX_PAYLOAD_SIZE = 10000;

/**
 * Detect the appropriate format based on environment
 * JSON is default for non-TTY (agent-first design)
 */
export function detectFormat(requested: OutputFormat | 'auto', isTTY: boolean): OutputFormat {
  if (requested === 'auto') {
    // Agent-first: JSON is default, table only for interactive TTY
    return isTTY ? 'table' : 'json';
  }
  return requested;
}

/**
 * Check if we're running in a TTY
 */
export function isTTY(): boolean {
  return process.stdout.isTTY ?? false;
}

// ============================================================================
// JSON Formatting
// ============================================================================

/**
 * Format data as JSON
 */
export function formatAsJSON(data: unknown, pretty = true): string {
  if (pretty) {
    const json = JSON.stringify(data, null, 2);
    
    // Check payload size
    if (json.length > MAX_PAYLOAD_SIZE) {
      console.warn(`Warning: Large output (${json.length} bytes)`);
    }
    
    return json;
  }
  return JSON.stringify(data);
}

/**
 * Safely serialize data to JSON
 * Handles circular references and BigInt
 */
export function safeJSONStringify(data: unknown, pretty = true): string {
  const seen = new WeakSet();
  
  const replacer = (_key: string, value: unknown): unknown => {
    // Handle BigInt
    if (typeof value === 'bigint') {
      return value.toString();
    }
    
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    
    // Handle Uint8Array (e.g., UUIDs)
    if (value instanceof Uint8Array) {
      return Array.from(value).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    return value;
  };
  
  try {
    return JSON.stringify(data, replacer, pretty ? 2 : undefined);
  } catch (error) {
    return `{"error": "Failed to serialize: ${error instanceof Error ? error.message : String(error)}"}`;
  }
}

// ============================================================================
// YAML Formatting
// ============================================================================

/**
 * Format data as YAML
 */
export function formatAsYAML(data: unknown): string {
  try {
    return YAML.stringify(data);
  } catch (error) {
    // Fallback to JSON if YAML fails
    return formatAsJSON(data);
  }
}

// ============================================================================
// Table Formatting
// ============================================================================

/**
 * Format an array of objects as a table
 */
export function formatObjectsAsTable(objects: Record<string, unknown>[]): string {
  if (objects.length === 0) {
    return 'No data';
  }
  
  const keys = Object.keys(objects[0]);
  
  const table = new Table({
    head: keys.map(k => shouldUseColor() ? colors.header(k) : k),
    style: {
      head: [],
      border: [],
    },
  });
  
  for (const obj of objects) {
    const row = keys.map(key => {
      const value = obj[key];
      if (value === null || value === undefined) return '';
      return String(value);
    });
    table.push(row);
  }
  
  return table.toString();
}

/**
 * Format a single object as a key-value table
 */
export function formatObjectAsTable(obj: Record<string, unknown>): string {
  const table = new Table({
    colWidths: [30, 50],
    style: {
      head: [],
      border: [],
    },
  });
  
  for (const [key, value] of Object.entries(obj)) {
    const formattedValue = shouldUseColor() 
      ? formatValueWithColor(value)
      : String(value ?? '');
    table.push([shouldUseColor() ? colors.label(key) : key, formattedValue]);
  }
  
  return table.toString();
}

/**
 * Format hierarchical data as nested tables
 */
export function formatHierarchicalAsTable(
  data: Record<string, Record<string, unknown>>
): string {
  const sections: string[] = [];
  
  for (const [sectionName, sectionData] of Object.entries(data)) {
    if (shouldUseColor()) {
      sections.push(colors.header(sectionName));
    } else {
      sections.push(`[${sectionName}]`);
    }
    
    const table = new Table({
      colWidths: [25, 50],
      style: {
        head: [],
        border: [],
      },
    });
    
    for (const [key, value] of Object.entries(sectionData)) {
      const formattedValue = shouldUseColor()
        ? formatValueWithColor(value)
        : String(value ?? '');
      table.push([shouldUseColor() ? colors.label(key) : key, formattedValue]);
    }
    
    sections.push(table.toString());
    sections.push('');
  }
  
  return sections.join('\n');
}

/**
 * Generic table formatter that handles different data shapes
 */
export function formatAsTable(data: unknown): string {
  if (data === null || data === undefined) {
    return 'No data';
  }
  
  // Array of objects
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return 'Empty array';
    }
    
    if (typeof data[0] === 'object' && data[0] !== null) {
      return formatObjectsAsTable(data as Record<string, unknown>[]);
    }
    
    // Simple array - list format
    return data.map((item, i) => `${i}: ${item}`).join('\n');
  }
  
  // Nested object (hierarchical data like motor telemetry)
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    
    // Check if it's a nested structure (values are objects)
    const values = Object.values(obj);
    const isNested = values.length > 0 && values.every(
      v => typeof v === 'object' && v !== null && !Array.isArray(v)
    );
    
    if (isNested) {
      return formatHierarchicalAsTable(obj as Record<string, Record<string, unknown>>);
    }
    
    return formatObjectAsTable(obj);
  }
  
  return String(data);
}

// ============================================================================
// Main Format Function
// ============================================================================

/**
 * Format data according to the specified format
 */
export function formatOutput(data: unknown, format: OutputFormat): string {
  switch (format) {
    case 'json':
      return formatAsJSON(data);
    
    case 'yaml':
      return formatAsYAML(data);
    
    case 'table':
      return formatAsTable(data);
    
    default:
      return formatAsJSON(data);
  }
}

/**
 * Format with automatic format detection
 */
export function formatOutputAuto(
  data: unknown, 
  requestedFormat: OutputFormat | 'auto' = 'auto',
  isTTYEnv: boolean = isTTY()
): string {
  const format = detectFormat(requestedFormat, isTTYEnv);
  return formatOutput(data, format);
}

// ============================================================================
// Specialized Formatters
// ============================================================================

/**
 * Format a list of ports for display
 */
export function formatPortList(ports: Array<{ name: string; description?: string; manufacturer?: string }>): string {
  if (ports.length === 0) {
    return 'No serial ports found';
  }
  
  const table = new Table({
    head: shouldUseColor() 
      ? [colors.header('Port'), colors.header('Description'), colors.header('Manufacturer')]
      : ['Port', 'Description', 'Manufacturer'],
    style: {
      head: [],
      border: [],
    },
  });
  
  for (const port of ports) {
    table.push([
      shouldUseColor() ? colors.port(port.name) : port.name,
      port.description || '',
      port.manufacturer || '',
    ]);
  }
  
  return table.toString();
}

/**
 * Format motor telemetry for table display
 */
export function formatMotorTelemetryTable(telemetry: {
  input?: { voltage?: number; current?: number; power?: number };
  motor?: { rpm?: number; current?: number; duty_cycle?: number };
  temperatures?: { mosfet?: number; motor?: number };
  fault?: { active?: boolean; name?: string; description?: string };
}): string {
  const sections: string[] = [];
  
  if (telemetry.input) {
    sections.push(formatSubsectionTable('Input', telemetry.input));
  }
  
  if (telemetry.motor) {
    sections.push(formatSubsectionTable('Motor', telemetry.motor));
  }
  
  if (telemetry.temperatures) {
    sections.push(formatSubsectionTable('Temperatures', telemetry.temperatures));
  }
  
  if (telemetry.fault?.active) {
    sections.push(shouldUseColor() 
      ? colors.error(`⚠ FAULT: ${telemetry.fault.name} - ${telemetry.fault.description}`)
      : `FAULT: ${telemetry.fault.name} - ${telemetry.fault.description}`
    );
  }
  
  return sections.join('\n\n');
}

function formatSubsectionTable(name: string, data: Record<string, unknown>): string {
  const header = shouldUseColor() ? colors.header(name) : `[${name}]`;
  const table = new Table({
    colWidths: [20, 30],
    style: {
      head: [],
      border: [],
    },
  });
  
  for (const [key, value] of Object.entries(data)) {
    table.push([
      shouldUseColor() ? colors.label(key) : key,
      String(value ?? ''),
    ]);
  }
  
  return `${header}\n${table.toString()}`;
}

// ============================================================================
// Output Size Management
// ============================================================================

/**
 * Check if output would be too large and return a warning message if so
 */
export function checkPayloadSize(data: string): string | null {
  if (data.length > MAX_PAYLOAD_SIZE) {
    return `Warning: Large output (${data.length} bytes)`;
  }
  return null;
}

/**
 * Truncate output if it exceeds maximum size
 */
export function truncateIfNeeded(data: string, maxSize = MAX_PAYLOAD_SIZE): string {
  if (data.length <= maxSize) {
    return data;
  }
  
  const truncation = '\n... [output truncated]';
  return data.slice(0, maxSize - truncation.length) + truncation;
}
