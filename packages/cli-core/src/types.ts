/**
 * Output Types - TypeScript equivalents of Rust output.rs types
 * 
 * This module defines all the response types and interfaces for the CLI output system,
 * preserving the agent-first design from the Rust implementation.
 */

// ============================================================================
// Output Format Types
// ============================================================================

export type OutputFormat = 'json' | 'table' | 'yaml';

// ============================================================================
// HATEOAS Navigation Types
// ============================================================================

/**
 * Represents a possible next action for HATEOAS navigation
 * Equivalent to Rust NextAction struct
 */
export interface NextAction {
  /** Command string to execute */
  command: string;
  /** Human-readable description */
  description: string;
  /** Optional parameters */
  params?: Record<string, unknown>;
}

export interface NextActionWithParams extends NextAction {
  params: Record<string, unknown>;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * CLI response structure with HATEOAS support
 * Equivalent to Rust CliResponse<T>
 */
export interface CliResponse<T = unknown> {
  /** Whether the command succeeded */
  ok: true;
  /** The command that was executed */
  command: string;
  /** The result data */
  result: T;
  /** Suggested next actions (HATEOAS) */
  next_actions: NextAction[];
}

/**
 * Error response structure
 * Equivalent to Rust ErrorResponse
 */
export interface ErrorResponse {
  /** Whether the operation succeeded (always false for errors) */
  ok: false;
  /** The command that failed */
  command: string;
  /** Error message */
  error: string;
  /** Error kind for programmatic handling */
  error_kind: string;
  /** Suggested fix */
  suggestion?: string;
  /** Next actions to recover */
  next_actions: NextAction[];
}

/** Union type for all CLI responses */
export type CLIResponse<T = unknown> = CliResponse<T> | ErrorResponse;

// ============================================================================
// Port Information Types
// ============================================================================

/**
 * Port information from serial port listing
 * Equivalent to Rust PortInfo
 */
export interface PortInfo {
  name: string;
  description?: string;
  manufacturer?: string;
  serialNumber?: string;
}

/**
 * Port output for serialization
 * Equivalent to Rust PortOutput
 */
export interface PortOutput {
  name: string;
  description?: string;
  manufacturer?: string;
  serial_number?: string;
}

// ============================================================================
// Connection Status Types
// ============================================================================

/**
 * Connection status output
 * Equivalent to Rust ConnectionStatus
 */
export interface ConnectionStatus {
  connected: boolean;
  port: string;
  baud_rate: number;
}

// ============================================================================
// Firmware Information Types
// ============================================================================

/**
 * Firmware info output
 * Equivalent to Rust FirmwareOutput
 */
export interface FirmwareOutput {
  version_major: number;
  version_minor: number;
  name: string;
  hardware_name: string;
  uuid: string;
  compile_date: string;
}

// ============================================================================
// Motor Values Types
// ============================================================================

/**
 * Motor values output (simplified telemetry)
 * Equivalent to Rust MotorValuesOutput
 */
export interface MotorValuesOutput {
  rpm: number;
  current_motor: number;
  current_in: number;
  duty_now: number;
  v_in: number;
  temp_mos: number;
  temp_motor: number;
  amp_hours: number;
  watt_hours: number;
  tachometer: number;
  fault_code: number;
}

// ============================================================================
// Motor Telemetry Types (Extended)
// ============================================================================

/**
 * Hierarchical motor telemetry for detailed output
 * Equivalent to the structure in print_motor_telemetry()
 */
export interface MotorTelemetryInput {
  voltage: number;
  current: number;
  power: number;
}

export interface MotorTelemetryMotor {
  current: number;
  rpm: number;
  duty_cycle: number;
  duty_percentage: number;
}

export interface MotorTelemetryTemperatures {
  mosfet: number;
  motor: number;
}

export interface MotorTelemetryFocCurrents {
  id: number;
  iq: number;
}

export interface MotorTelemetryEnergy {
  amp_hours: number;
  amp_hours_charged: number;
  watt_hours: number;
  watt_hours_charged: number;
  net_amp_hours: number;
  net_watt_hours: number;
}

export interface MotorTelemetryPosition {
  tachometer: number;
  tachometer_abs: number;
  encoder: number;
}

export interface MotorTelemetryFault {
  code: number;
  name: string;
  description: string;
  active: boolean;
  critical: boolean;
}

export interface MotorTelemetrySummary {
  has_fault: boolean;
  operational: boolean;
}

export interface MotorTelemetryHierarchical {
  input: MotorTelemetryInput;
  motor: MotorTelemetryMotor;
  temperatures: MotorTelemetryTemperatures;
  foc_currents: MotorTelemetryFocCurrents;
  energy: MotorTelemetryEnergy;
  position: MotorTelemetryPosition;
  fault: MotorTelemetryFault;
  summary: MotorTelemetrySummary;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Motor configuration output
 * Equivalent to Rust MCConfiguration
 */
export interface McConfiguration {
  limits: {
    current_limit: number;
    current_limit_in: number;
    voltage_limit_min: number;
    voltage_limit_max: number;
    temp_limit_fet_start: number;
    temp_limit_fet_end: number;
    temp_limit_motor_start: number;
    temp_limit_motor_end: number;
  };
  motor: {
    motor_type: number;
    motor_type_description: string;
    pole_pairs: number;
    flux_linkage: number;
    inductance: number;
    resistance: number;
    detected: boolean;
  };
  foc: {
    observer_gain: number;
    current_kp: number;
    current_ki: number;
  };
  sensors: {
    sensor_mode: number;
    sensor_mode_description: string;
    encoder_counts: number;
  };
  advanced: {
    pwm_mode: number;
    comm_mode: number;
  };
}

/**
 * App configuration output
 * Equivalent to Rust AppConfiguration
 */
export interface AppConfiguration {
  app: {
    type: number;
    type_description: string;
    controller_id: number;
  };
  ppm: {
    enabled: boolean;
    control_type: number;
    pulse_center: number;
    pulse_width: number;
    pulse_start: number;
    median_filter: boolean;
  };
  adc: {
    enabled: boolean;
    control_type: number;
    voltage_min: number;
    voltage_max: number;
    center_deadband: number;
  };
  uart: {
    enabled: boolean;
    baud_rate: number;
  };
  can: {
    status_rate_hz: number;
    baud_rate: number;
  };
  nunchuk: {
    control_type: number;
    z_button_brake: boolean;
    c_button_brake: boolean;
  };
  nrf: {
    enabled: boolean;
    channel: number;
    data_rate: number;
  };
}

/**
 * Config set for backup/restore
 * Equivalent to Rust ConfigSet
 */
export interface ConfigSet {
  schema_version: string;
  timestamp: string;
  tool_version: string;
  notes?: string;
  mc: McConfiguration;
  app: AppConfiguration;
}

// ============================================================================
// Ping Result Types
// ============================================================================

export interface PingResult {
  responsive: boolean;
  port: string;
  latency_ms?: number;
}

// ============================================================================
// Configuration Operation Types
// ============================================================================

export interface ConfigSavedResult {
  saved: boolean;
  config_type: string;
  file: string;
}

export interface ConfigAppliedResult {
  applied: boolean;
  config_type: string;
  file: string;
  port: string;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  error_count: number;
}

export interface BackupCreatedResult {
  backup_created: boolean;
  file: string;
  schema_version: string;
  timestamp: string;
  tool_version: string;
  notes?: string;
  summary: {
    motor_type: number;
    app_type: number;
    controller_id: number;
  };
}

export interface ConfigRestoredResult {
  restored: boolean;
  file: string;
  port: string;
  note: string;
}

export interface DryRunResult {
  dry_run: boolean;
  action: string;
  file?: string;
  output?: string;
}

// ============================================================================
// Schema Types
// ============================================================================

/**
 * Command schema entry for agent discovery
 * Equivalent to Rust CommandSchema
 */
export interface CommandSchema {
  name: string;
  description: string;
  path: string[];
  mutating: boolean;
  args: ArgSchema[];
  options?: OptionSchema[];
  output_fields: OutputFieldSchema[];
}

/**
 * Argument schema
 * Equivalent to Rust ArgSchema
 */
export interface ArgSchema {
  name: string;
  description: string;
  required: boolean;
  default_value?: unknown;
  arg_type: string;
}

/**
 * Option schema
 */
export interface OptionSchema {
  name: string;
  alias?: string;
  description: string;
  type: string;
  required?: boolean;
  default?: unknown;
}

/**
 * Output field schema
 * Equivalent to Rust OutputFieldSchema
 */
export interface OutputFieldSchema {
  name: string;
  field_type: string;
  description: string;
}

/**
 * Error kind schema
 */
export interface ErrorKindSchema {
  kind: string;
  retryable: boolean;
  description: string;
}

/**
 * Full schema structure
 */
export interface FullSchema {
  name: string;
  version: string;
  description: string;
  commands: CommandSchema[];
  error_kinds: ErrorKindSchema[];
  global_args: OptionSchema[];
}
