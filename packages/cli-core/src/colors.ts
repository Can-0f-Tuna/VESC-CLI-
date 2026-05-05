/**
 * Terminal Color Utilities
 * 
 * Provides consistent color scheme for CLI output with automatic
 * detection of color support and CI environment.
 */

import chalk from 'chalk';

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Check if running in a CI environment
 */
export function isRunningInCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.BUILD_NUMBER ||
    process.env.TRAVIS ||
    process.env.GITHUB_ACTIONS
  );
}

/**
 * Check if we should use colors in output
 * Respects NO_COLOR and FORCE_COLOR environment variables
 */
export function shouldUseColor(): boolean {
  if (isRunningInCI()) return false;
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return process.stdout.isTTY ?? false;
}

// ============================================================================
// Color Palette
// ============================================================================

export const colors = {
  // Primary colors
  primary: chalk.cyan,
  secondary: chalk.magenta,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  
  // Data type colors (consistent with Rust implementation)
  string: chalk.green,
  number: chalk.yellow,
  boolean: chalk.magenta,
  null: chalk.gray,
  undefined: chalk.gray,
  
  // Semantic colors
  header: chalk.bold.cyan,
  label: chalk.cyan,
  value: chalk.white,
  dim: chalk.gray,
  highlight: chalk.bold.white,
  
  // Status colors
  ok: chalk.green,
  fail: chalk.red,
  info: chalk.blue,
  
  // Special
  port: chalk.yellow,
  rpm: chalk.green,
  voltage: chalk.yellow,
  current: chalk.cyan,
  temperature: chalk.red,
};

// ============================================================================
// Conditional Coloring
// ============================================================================

/**
 * Apply color only if colors are enabled
 */
export function conditionalColor(text: string, colorFn: (text: string) => string): string {
  return shouldUseColor() ? colorFn(text) : text;
}

/**
 * Format a value with appropriate color based on type
 */
export function formatValueWithColor(value: unknown): string {
  if (value === null) return colors.null('null');
  if (value === undefined) return colors.undefined('undefined');
  if (typeof value === 'number') return colors.number(String(value));
  if (typeof value === 'boolean') return colors.boolean(String(value));
  if (typeof value === 'string') return colors.string(`"${value}"`);
  return String(value);
}

// ============================================================================
// Styled Output Helpers
// ============================================================================

/**
 * Create a success message
 */
export function success(text: string): string {
  return shouldUseColor() 
    ? `${chalk.green('✓')} ${text}`
    : `[OK] ${text}`;
}

/**
 * Create an error message
 */
export function error(text: string): string {
  return shouldUseColor()
    ? `${chalk.red('✗')} ${text}`
    : `[ERROR] ${text}`;
}

/**
 * Create a warning message
 */
export function warning(text: string): string {
  return shouldUseColor()
    ? `${chalk.yellow('⚠')} ${text}`
    : `[WARN] ${text}`;
}

/**
 * Create an info message
 */
export function info(text: string): string {
  return shouldUseColor()
    ? `${chalk.blue('ℹ')} ${text}`
    : `[INFO] ${text}`;
}

/**
 * Create a section header
 */
export function sectionHeader(text: string): string {
  return shouldUseColor()
    ? chalk.bold.cyan(`
${'='.repeat(text.length + 4)}
  ${text}
${'='.repeat(text.length + 4)}`)
    : `\n=== ${text} ===`;
}

/**
 * Create a subsection header
 */
export function subHeader(text: string): string {
  return shouldUseColor()
    ? chalk.cyan(`\n── ${text} ──`)
    : `\n-- ${text} --`;
}

// ============================================================================
// Key-Value Formatting
// ============================================================================

/**
 * Format a key-value pair with color
 */
export function formatKeyValue(key: string, value: unknown): string {
  const formattedValue = formatValueWithColor(value);
  return shouldUseColor()
    ? `${colors.label(key)}: ${formattedValue}`
    : `${key}: ${value}`;
}

/**
 * Format a list of key-value pairs
 */
export function formatKeyValuePairs(pairs: Record<string, unknown>): string {
  return Object.entries(pairs)
    .map(([key, value]) => formatKeyValue(key, value))
    .join('\n');
}

// ============================================================================
// Semantic Formatting
// ============================================================================

/**
 * Format a motor RPM value
 */
export function formatRpm(rpm: number): string {
  return shouldUseColor()
    ? colors.rpm(`${rpm.toFixed(0)} RPM`)
    : `${rpm.toFixed(0)} RPM`;
}

/**
 * Format a voltage value
 */
export function formatVoltage(voltage: number): string {
  return shouldUseColor()
    ? colors.voltage(`${voltage.toFixed(2)}V`)
    : `${voltage.toFixed(2)}V`;
}

/**
 * Format a current value
 */
export function formatCurrent(current: number): string {
  return shouldUseColor()
    ? colors.current(`${current.toFixed(2)}A`)
    : `${current.toFixed(2)}A`;
}

/**
 * Format a temperature value
 */
export function formatTemperature(temp: number): string {
  const formatted = `${temp.toFixed(1)}°C`;
  if (!shouldUseColor()) return formatted;
  
  // Color based on temperature range
  if (temp > 80) return chalk.red(formatted);
  if (temp > 60) return chalk.yellow(formatted);
  return chalk.green(formatted);
}

/**
 * Format a duty cycle value
 */
export function formatDutyCycle(duty: number): string {
  const percentage = Math.abs(duty * 100).toFixed(1);
  return shouldUseColor()
    ? colors.number(`${percentage}%`)
    : `${percentage}%`;
}

/**
 * Format a port name
 */
export function formatPort(port: string): string {
  return shouldUseColor()
    ? colors.port(port)
    : port;
}

// ============================================================================
// Re-export chalk for advanced usage
// ============================================================================

export { chalk };
