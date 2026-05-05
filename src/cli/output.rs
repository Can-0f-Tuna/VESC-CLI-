//! Output Formatting
//!
//! This module handles output formatting with agent-first design:
//! - JSON is the default output format (no --json flag needed)
//! - HATEOAS - every response includes `next_actions` for discoverability
//! - Self-documenting schema available via `schema` command
//! - Context-protecting output truncation for large data

use anyhow::Result;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use crate::cli::args::OutputFormat;
use crate::vesc::connection::{FirmwareInfo, PortInfo};
use crate::vesc::telemetry::{MotorTelemetry, FaultCode};
use crate::vesc::config::{McConfiguration, AppConfiguration, ConfigSet};
use std::path::Path;

/// Maximum payload size before truncation warning
const MAX_PAYLOAD_SIZE: usize = 10000;

/// CLI response structure with HATEOAS support
/// 
/// This structure follows agent-first design principles:
/// - `ok` indicates success/failure
/// - `command` shows which command was executed
/// - `result` contains the actual data
/// - `next_actions` provides discoverable next steps
#[derive(Serialize, Debug, Clone)]
pub struct CliResponse<T> {
    /// Whether the command succeeded
    pub ok: bool,
    /// The command that was executed
    pub command: String,
    /// The result data
    pub result: T,
    /// Suggested next actions (HATEOAS)
    pub next_actions: Vec<NextAction>,
}

/// Represents a possible next action for HATEOAS navigation
#[derive(Serialize, Debug, Clone)]
pub struct NextAction {
    /// Command string to execute
    pub command: String,
    /// Human-readable description
    pub description: String,
    /// Optional parameters as JSON value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<Value>,
}

impl NextAction {
    /// Create a new next action without parameters
    pub fn new(command: &str, description: &str) -> Self {
        Self {
            command: command.to_string(),
            description: description.to_string(),
            params: None,
        }
    }
    
    /// Create a new next action with parameters
    pub fn with_params(command: &str, description: &str, params: Value) -> Self {
        Self {
            command: command.to_string(),
            description: description.to_string(),
            params: Some(params),
        }
    }
}

/// Error response structure
#[derive(Serialize, Debug, Clone)]
pub struct ErrorResponse {
    /// Whether the operation succeeded (always false for errors)
    pub ok: bool,
    /// The command that failed
    pub command: String,
    /// Error message
    pub error: String,
    /// Error kind for programmatic handling
    pub error_kind: String,
    /// Suggested fix
    #[serde(skip_serializing_if = "Option::is_none")]
    pub suggestion: Option<String>,
    /// Next actions to recover
    pub next_actions: Vec<NextAction>,
}

/// Port information for serialization
#[derive(Serialize, Debug, Clone)]
pub struct PortOutput {
    pub name: String,
    pub description: Option<String>,
    pub manufacturer: Option<String>,
    pub serial_number: Option<String>,
}

/// Connection status output
#[derive(Serialize, Debug, Clone)]
pub struct ConnectionStatus {
    pub connected: bool,
    pub port: String,
    pub baud_rate: u32,
}

/// Firmware info output
#[derive(Serialize, Debug, Clone)]
pub struct FirmwareOutput {
    pub version_major: u8,
    pub version_minor: u8,
    pub name: String,
    pub hardware_name: String,
    pub uuid: String,
    pub compile_date: String,
}

/// Motor values output (simplified for now)
#[derive(Serialize, Debug, Clone, Default)]
pub struct MotorValuesOutput {
    pub rpm: f64,
    pub current_motor: f64,
    pub current_in: f64,
    pub duty_now: f64,
    pub v_in: f64,
    pub temp_mos: f64,
    pub temp_motor: f64,
    pub amp_hours: f64,
    pub watt_hours: f64,
    pub tachometer: i32,
    pub fault_code: u8,
}

/// Command schema entry for agent discovery
#[derive(Serialize, Debug, Clone)]
pub struct CommandSchema {
    pub name: String,
    pub description: String,
    pub path: Vec<String>,
    pub args: Vec<ArgSchema>,
    pub output_fields: Vec<OutputFieldSchema>,
    pub mutating: bool,
}

/// Argument schema
#[derive(Serialize, Debug, Clone)]
pub struct ArgSchema {
    pub name: String,
    pub description: String,
    pub required: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_value: Option<Value>,
    pub arg_type: String,
}

/// Output field schema
#[derive(Serialize, Debug, Clone)]
pub struct OutputFieldSchema {
    pub name: String,
    pub field_type: String,
    pub description: String,
}

/// Output manager for handling different output formats
pub struct OutputManager {
    format: OutputFormat,
    verbose: bool,
}

impl OutputManager {
    /// Create a new output manager
    pub fn new(format: OutputFormat, verbose: bool) -> Self {
        Self { format, verbose }
    }
    
    /// Print a successful response with result data
    pub fn print_response<T: Serialize>(&self, command: &str, result: T, next_actions: Vec<NextAction>) {
        let response = CliResponse {
            ok: true,
            command: command.to_string(),
            result,
            next_actions,
        };
        
        self.print_json(&response);
    }
    
    /// Print an error response
    pub fn print_error(&self, command: &str, error: &str, error_kind: &str, suggestion: Option<&str>) {
        let next_actions = vec![
            NextAction::new("device list-ports", "List available serial ports"),
            NextAction::new("device ping", "Check VESC connectivity"),
        ];
        
        let response = ErrorResponse {
            ok: false,
            command: command.to_string(),
            error: error.to_string(),
            error_kind: error_kind.to_string(),
            suggestion: suggestion.map(|s| s.to_string()),
            next_actions,
        };
        
        self.print_json(&response);
    }
    
    /// Print available serial ports
    pub fn print_ports(&self, ports: &[PortInfo]) -> Result<()> {
        let port_outputs: Vec<PortOutput> = ports.iter().map(|p| PortOutput {
            name: p.name.clone(),
            description: p.description.clone(),
            manufacturer: p.manufacturer.clone(),
            serial_number: p.serial_number.clone(),
        }).collect();
        
        let next_actions = if let Some(first_port) = ports.first() {
            vec![
                NextAction::with_params(
                    "device connect",
                    "Connect to a VESC on a specific port",
                    serde_json::json!({"port": first_port.name.clone()})
                ),
                NextAction::with_params(
                    "device info",
                    "Get device information",
                    serde_json::json!({"port": first_port.name.clone()})
                ),
            ]
        } else {
            vec![
                NextAction::new("device list-ports", "Refresh port list"),
            ]
        };
        
        self.print_response("device list-ports", port_outputs, next_actions);
        Ok(())
    }
    
    /// Print connection status
    pub fn print_connection_status(&self, port: &str, baud_rate: u32, connected: bool, firmware: Option<&FirmwareOutput>) {
        let status = serde_json::json!({
            "connected": connected,
            "port": port,
            "baud_rate": baud_rate,
            "firmware": firmware,
        });
        
        let mut next_actions = vec![
            NextAction::with_params(
                "device info",
                "Get detailed device information",
                serde_json::json!({"port": port})
            ),
            NextAction::with_params(
                "device ping",
                "Verify connectivity",
                serde_json::json!({"port": port})
            ),
        ];
        
        if connected {
            next_actions.push(NextAction::with_params(
                "motor get-values",
                "Read motor telemetry",
                serde_json::json!({"port": port})
            ));
        }
        
        self.print_response("device connect", status, next_actions);
    }
    
    /// Print firmware information
    pub fn print_firmware_info(&self, info: &FirmwareInfo, port: &str, baud_rate: u32) {
        let output = serde_json::json!({
            "firmware": {
                "version_major": info.version_major,
                "version_minor": info.version_minor,
                "name": info.name,
                "hardware_name": info.hardware_name,
                "uuid": format!("{:02x}", info.uuid.iter().map(|b| *b).collect::<Vec<_>>().as_slice()),
                "compile_date": info.compile_date,
            },
            "connection": {
                "port": port,
                "baud_rate": baud_rate,
                "status": "connected"
            }
        });
        
        let next_actions = vec![
            NextAction::with_params(
                "motor get-values",
                "Get real-time motor telemetry",
                serde_json::json!({"port": port})
            ),
            NextAction::with_params(
                "device ping",
                "Check connectivity",
                serde_json::json!({"port": port})
            ),
            NextAction::with_params(
                "motor stop",
                "Stop the motor",
                serde_json::json!({"port": port})
            ),
        ];
        
        self.print_response("device info", output, next_actions);
    }
    
    /// Print motor values (telemetry)
    pub fn print_motor_values(&self, values: &MotorValuesOutput) {
        let next_actions = vec![
            NextAction::with_params(
                "motor set-rpm",
                "Set motor to a specific RPM",
                serde_json::json!({"rpm": 0})
            ),
            NextAction::new("motor stop", "Stop the motor immediately"),
            NextAction::new("device info", "Get device information"),
        ];
        
        self.print_response("motor get-values", values, next_actions);
    }

    /// Print motor telemetry with HATEOAS navigation
    ///
    /// Formats the complete MotorTelemetry struct into a hierarchical JSON response
    /// with semantic grouping of related telemetry fields.
    pub fn print_motor_telemetry(&self, telemetry: &MotorTelemetry, port: &str) {
        // Build a hierarchical result structure
        let result = serde_json::json!({
            "input": {
                "voltage": telemetry.v_in,
                "current": telemetry.current_in,
                "power": telemetry.power_in,
            },
            "motor": {
                "current": telemetry.current_motor,
                "rpm": telemetry.rpm,
                "duty_cycle": telemetry.duty_cycle,
                "duty_percentage": telemetry.duty_percentage(),
            },
            "temperatures": {
                "mosfet": telemetry.temp_mos,
                "motor": telemetry.temp_motor,
            },
            "foc_currents": {
                "id": telemetry.current_id,
                "iq": telemetry.current_iq,
            },
            "energy": {
                "amp_hours": telemetry.amp_hours,
                "amp_hours_charged": telemetry.amp_hours_charged,
                "watt_hours": telemetry.watt_hours,
                "watt_hours_charged": telemetry.watt_hours_charged,
                "net_amp_hours": telemetry.net_amp_hours(),
                "net_watt_hours": telemetry.net_watt_hours(),
            },
            "position": {
                "tachometer": telemetry.tachometer,
                "tachometer_abs": telemetry.tachometer_abs,
                "encoder": telemetry.encoder_position,
            },
            "fault": {
                "code": telemetry.fault_code as u8,
                "name": format!("{:?}", telemetry.fault_code),
                "description": telemetry.fault_str,
                "active": telemetry.has_fault(),
                "critical": telemetry.fault_code.is_critical(),
            },
            "summary": {
                "has_fault": telemetry.has_fault(),
                "operational": !telemetry.has_fault() && telemetry.v_in > 10.0,
            }
        });

        // Build contextual next actions based on telemetry state
        let mut next_actions = vec![
            NextAction::with_params(
                "motor stop",
                "Stop the motor",
                serde_json::json!({"port": port})
            ),
            NextAction::with_params(
                "motor get-values",
                "Refresh telemetry",
                serde_json::json!({"port": port})
            ),
        ];

        // Add RPM control if motor is operational
        if !telemetry.has_fault() {
            next_actions.push(NextAction::with_params(
                "motor set-rpm",
                "Set motor to specific RPM",
                serde_json::json!({"port": port, "rpm": 1000})
            ));
            next_actions.push(NextAction::with_params(
                "motor set-current",
                "Set motor current",
                serde_json::json!({"port": port, "current": 5.0})
            ));
        }

        // Add fault-specific suggestions if a fault is active
        if telemetry.has_fault() {
            next_actions.push(NextAction::new(
                "device info",
                "Check device status"
            ));
        }

        self.print_response("motor get-values", result, next_actions);
    }
    
    /// Print ping result with latency
    pub fn print_ping_result(&self, port: &str, responsive: bool, latency_ms: Option<u64>) {
        let result = if responsive {
            serde_json::json!({
                "responsive": true,
                "port": port,
                "latency_ms": latency_ms,
            })
        } else {
            serde_json::json!({
                "responsive": false,
                "port": port,
            })
        };
        
        let next_actions = if responsive {
            vec![
                NextAction::with_params(
                    "device info",
                    "Get device information",
                    serde_json::json!({"port": port})
                ),
                NextAction::with_params(
                    "motor get-values",
                    "Read motor telemetry",
                    serde_json::json!({"port": port})
                ),
            ]
        } else {
            vec![
                NextAction::with_params(
                    "device connect",
                    "Attempt to reconnect",
                    serde_json::json!({"port": port})
                ),
                NextAction::new("device list-ports", "List available ports"),
            ]
        };
        
        self.print_response("device ping", result, next_actions);
    }

    /// Print motor command confirmation
    pub fn print_motor_command(&self, command: &str, params: Value) {
        let next_actions = vec![
            NextAction::new("motor get-values", "Check current motor status"),
            NextAction::new("motor stop", "Stop the motor"),
        ];
        
        self.print_response(command, params, next_actions);
    }

    // ==================== CONFIG OUTPUT METHODS ====================

    /// Print MC configuration
    pub fn print_mc_config(&self, config: &McConfiguration, port: &str, dry_run: bool) -> Result<()> {
        let result = serde_json::json!({
            "dry_run": dry_run,
            "config_type": "MC",
            "limits": {
                "current_motor": config.limits.current_limit,
                "current_in": config.limits.current_limit_in,
                "voltage_min": config.limits.voltage_limit_min,
                "voltage_max": config.limits.voltage_limit_max,
                "temp_fet_start": config.limits.temp_limit_fet_start,
                "temp_fet_end": config.limits.temp_limit_fet_end,
                "temp_motor_start": config.limits.temp_limit_motor_start,
                "temp_motor_end": config.limits.temp_limit_motor_end,
            },
            "motor": {
                "type": config.motor.motor_type,
                "type_description": config.motor.motor_type.description(),
                "pole_pairs": config.motor.pole_pairs,
                "flux_linkage": config.motor.flux_linkage,
                "inductance": config.motor.inductance,
                "resistance": config.motor.resistance,
                "detected": config.is_motor_detected(),
            },
            "foc": {
                "observer_gain": config.foc.observer_gain,
                "current_kp": config.foc.current_kp,
                "current_ki": config.foc.current_ki,
            },
            "sensors": {
                "mode": config.sensors.sensor_mode,
                "mode_description": config.sensors.sensor_mode.description(),
                "encoder_counts": config.sensors.encoder_counts,
            },
            "advanced": {
                "pwm_mode": config.advanced.pwm_mode,
                "comm_mode": config.advanced.comm_mode,
            },
            "connection": {
                "port": port,
            }
        });

        let mut next_actions = vec![
            NextAction::with_params(
                "config backup",
                "Backup this configuration",
                serde_json::json!({"port": port})
            ),
        ];

        if dry_run {
            next_actions.push(NextAction::new("config set-mc", "Apply configuration (remove --dry-run)"));
        } else {
            next_actions.push(NextAction::with_params(
                "config set-mc",
                "Write new MC configuration",
                serde_json::json!({"port": port})
            ));
            next_actions.push(NextAction::with_params(
                "config get-app",
                "Read application configuration",
                serde_json::json!({"port": port})
            ));
        }

        self.print_response("config get-mc", result, next_actions);
        Ok(())
    }

    /// Print APP configuration
    pub fn print_app_config(&self, config: &AppConfiguration, port: &str, dry_run: bool) -> Result<()> {
        let result = serde_json::json!({
            "dry_run": dry_run,
            "config_type": "APP",
            "app": {
                "type": config.app_to_use,
                "type_description": config.app_to_use.description(),
                "controller_id": config.controller_id,
            },
            "ppm": {
                "enabled": config.app_to_use.uses_ppm(),
                "control_type": config.ppm.control_type,
                "pulse_center": config.ppm.pulse_center,
                "pulse_width": config.ppm.pulse_width,
                "pulse_start": config.ppm.pulse_start,
                "median_filter": config.ppm.median_filter,
            },
            "adc": {
                "enabled": config.app_to_use.uses_adc(),
                "control_type": config.adc.control_type,
                "voltage_min": config.adc.voltage_min,
                "voltage_max": config.adc.voltage_max,
                "center_deadband": config.adc.center_deadband,
            },
            "uart": {
                "enabled": config.app_to_use.uses_uart(),
                "baud_rate": config.uart.baud_rate,
            },
            "can": {
                "status_rate_hz": config.can.status_rate_hz,
                "baud_rate": config.can.baud_rate,
            },
            "nunchuk": {
                "control_type": config.nunchuk.control_type,
                "z_button_brake": config.nunchuk.z_button_brake,
                "c_button_brake": config.nunchuk.c_button_brake,
            },
            "nrf": {
                "enabled": config.nrf.enabled,
                "channel": config.nrf.channel,
                "data_rate": config.nrf.data_rate,
            },
            "connection": {
                "port": port,
            }
        });

        let mut next_actions = vec![
            NextAction::with_params(
                "config backup",
                "Backup all configurations",
                serde_json::json!({"port": port})
            ),
        ];

        if dry_run {
            next_actions.push(NextAction::new("config set-app", "Apply configuration (remove --dry-run)"));
        } else {
            next_actions.push(NextAction::with_params(
                "config set-app",
                "Write new APP configuration",
                serde_json::json!({"port": port})
            ));
            next_actions.push(NextAction::with_params(
                "config get-mc",
                "Read motor configuration",
                serde_json::json!({"port": port})
            ));
        }

        self.print_response("config get-app", result, next_actions);
        Ok(())
    }

    /// Print MC configuration dry-run preview
    pub fn print_mc_config_dry_run(&self, config: &McConfiguration, file: &Path) -> Result<()> {
        let result = serde_json::json!({
            "dry_run": true,
            "action": "config set-mc",
            "file": file.to_string_lossy().to_string(),
            "summary": {
                "motor_type": config.motor.motor_type,
                "current_limit": config.limits.current_limit,
                "voltage_range": format!("{:.1}V - {:.1}V", config.limits.voltage_limit_min, config.limits.voltage_limit_max),
            }
        });

        let next_actions = vec![
            NextAction::new("config get-mc", "Verify current configuration first"),
            NextAction::new(&format!("config set-mc {} --yes", file.display()), "Apply this configuration"),
        ];

        self.print_response("config set-mc", result, next_actions);
        Ok(())
    }

    /// Print APP configuration dry-run preview
    pub fn print_app_config_dry_run(&self, config: &AppConfiguration, file: &Path) -> Result<()> {
        let result = serde_json::json!({
            "dry_run": true,
            "action": "config set-app",
            "file": file.to_string_lossy().to_string(),
            "summary": {
                "app_type": config.app_to_use,
                "controller_id": config.controller_id,
                "uses_ppm": config.app_to_use.uses_ppm(),
                "uses_adc": config.app_to_use.uses_adc(),
                "uses_uart": config.app_to_use.uses_uart(),
            }
        });

        let next_actions = vec![
            NextAction::new("config get-app", "Verify current configuration first"),
            NextAction::new(&format!("config set-app {} --yes", file.display()), "Apply this configuration"),
        ];

        self.print_response("config set-app", result, next_actions);
        Ok(())
    }

    /// Print configuration validation errors
    pub fn print_config_validation_errors(&self, errors: &[String]) -> Result<()> {
        let result = serde_json::json!({
            "valid": false,
            "errors": errors,
            "error_count": errors.len(),
        });

        let next_actions = vec![
            NextAction::new("config get-mc", "Read current MC configuration"),
            NextAction::new("config get-app", "Read current APP configuration"),
        ];

        self.print_response("config validation", result, next_actions);
        Ok(())
    }

    /// Print configuration saved confirmation
    pub fn print_config_saved(&self, path: &Path, config_type: &str) -> Result<()> {
        let result = serde_json::json!({
            "saved": true,
            "config_type": config_type,
            "file": path.to_string_lossy().to_string(),
        });

        let next_actions = vec![
            NextAction::new(&format!("config set-{} {}", config_type.to_lowercase(), path.display()), 
                &format!("Write this {} configuration to VESC", config_type)),
            NextAction::new("config backup", "Create complete backup"),
        ];

        self.print_response(&format!("config get-{}", config_type.to_lowercase()), result, next_actions);
        Ok(())
    }

    /// Print configuration applied confirmation
    pub fn print_config_applied(&self, file: &Path, port: &str, config_type: &str) -> Result<()> {
        let result = serde_json::json!({
            "applied": true,
            "config_type": config_type,
            "file": file.to_string_lossy().to_string(),
            "port": port,
        });

        let next_actions = vec![
            NextAction::with_params(
                &format!("config get-{}", config_type.to_lowercase()),
                &format!("Verify {} configuration was written", config_type),
                serde_json::json!({"port": port})
            ),
            NextAction::with_params(
                "config backup",
                "Backup new configuration",
                serde_json::json!({"port": port})
            ),
        ];

        self.print_response(&format!("config set-{}", config_type.to_lowercase()), result, next_actions);
        Ok(())
    }

    /// Print backup created confirmation
    pub fn print_backup_created(&self, path: &Path, config_set: &ConfigSet) -> Result<()> {
        let result = serde_json::json!({
            "backup_created": true,
            "file": path.to_string_lossy().to_string(),
            "schema_version": config_set.schema_version,
            "timestamp": config_set.timestamp,
            "tool_version": config_set.tool_version,
            "notes": config_set.notes,
            "summary": {
                "motor_type": config_set.mc.motor.motor_type,
                "app_type": config_set.app.app_to_use,
                "controller_id": config_set.app.controller_id,
            }
        });

        let next_actions = vec![
            NextAction::with_params(
                "config restore",
                "Restore from this backup",
                serde_json::json!({"file": path.to_string_lossy().to_string()})
            ),
            NextAction::new("device info", "Verify VESC connection"),
        ];

        self.print_response("config backup", result, next_actions);
        Ok(())
    }

    /// Print backup dry-run preview
    pub fn print_backup_dry_run(&self, path: &Path, config_set: &ConfigSet) -> Result<()> {
        let result = serde_json::json!({
            "dry_run": true,
            "action": "config backup",
            "output": path.to_string_lossy().to_string(),
            "would_backup": {
                "motor_type": config_set.mc.motor.motor_type,
                "app_type": config_set.app.app_to_use,
                "controller_id": config_set.app.controller_id,
            }
        });

        let next_actions = vec![
            NextAction::new(&format!("config backup --output {}", path.display()), "Create backup (remove --dry-run)"),
        ];

        self.print_response("config backup", result, next_actions);
        Ok(())
    }

    /// Print configuration restored confirmation
    pub fn print_config_restored(&self, file: &Path, port: &str) -> Result<()> {
        let result = serde_json::json!({
            "restored": true,
            "file": file.to_string_lossy().to_string(),
            "port": port,
            "note": "Configuration restored. Power cycle VESC if needed.",
        });

        let next_actions = vec![
            NextAction::with_params(
                "config get-mc",
                "Verify motor configuration",
                serde_json::json!({"port": port})
            ),
            NextAction::with_params(
                "config get-app",
                "Verify app configuration",
                serde_json::json!({"port": port})
            ),
            NextAction::with_params(
                "motor get-values",
                "Check motor telemetry",
                serde_json::json!({"port": port})
            ),
        ];

        self.print_response("config restore", result, next_actions);
        Ok(())
    }

    /// Print restore dry-run preview
    pub fn print_restore_dry_run(&self, file: &Path, config_set: &ConfigSet) -> Result<()> {
        let result = serde_json::json!({
            "dry_run": true,
            "action": "config restore",
            "file": file.to_string_lossy().to_string(),
            "backup_info": {
                "schema_version": config_set.schema_version,
                "timestamp": config_set.timestamp,
                "tool_version": config_set.tool_version,
                "notes": config_set.notes,
            },
            "would_restore": {
                "motor_type": config_set.mc.motor.motor_type,
                "app_type": config_set.app.app_to_use,
                "controller_id": config_set.app.controller_id,
            }
        });

        let next_actions = vec![
            NextAction::new(&format!("config restore {} --yes", file.display()), "Restore backup (remove --dry-run)"),
            NextAction::with_params(
                "config backup",
                "Create backup of current config first",
                serde_json::json!({"output": "pre-restore-backup.json"})
            ),
        ];

        self.print_response("config restore", result, next_actions);
        Ok(())
    }
    
    /// Print schema information
    pub fn print_schema(&self, command_path: Option<&[String]>) -> Result<()> {
        let schema = if let Some(path) = command_path {
            // Return specific command schema
            self.get_command_schema(path)
        } else {
            // Return full schema
            self.get_full_schema()
        };
        
        match serde_json::to_string_pretty(&schema) {
            Ok(json) => {
                // Check if payload is too large
                if json.len() > MAX_PAYLOAD_SIZE {
                    eprintln!("Warning: Large schema output ({} bytes)", json.len());
                }
                println!("{}", json);
            }
            Err(e) => {
                eprintln!("Error serializing schema: {}", e);
            }
        }
        
        Ok(())
    }
    
    /// Print plain text (fallback for non-JSON output)
    fn print_json<T: Serialize>(&self, data: &T) {
        match self.format {
            OutputFormat::Json => {
                match serde_json::to_string_pretty(data) {
                    Ok(json) => {
                        // Check payload size
                        if json.len() > MAX_PAYLOAD_SIZE {
                            eprintln!("Warning: Large output ({} bytes)", json.len());
                        }
                        println!("{}", json);
                    }
                    Err(e) => {
                        eprintln!("Error serializing output: {}", e);
                    }
                }
            }
            OutputFormat::Table => {
                // For table output, we still use JSON for now
                // TODO: Implement actual table formatting
                self.print_json(data);
            }
            OutputFormat::Yaml => {
                match serde_yaml::to_string(data) {
                    Ok(yaml) => println!("{}", yaml),
                    Err(e) => {
                        eprintln!("Error serializing output: {}", e);
                        self.print_json(data);
                    }
                }
            }
        }
    }
    
    /// Get schema for a specific command path
    fn get_command_schema(&self, path: &[String]) -> Value {
        // Build schema for the specified command path
        let full_schema = self.get_full_schema();
        
        if path.is_empty() {
            return full_schema;
        }
        
        // Look for the specific command in the schema
        if let Some(commands) = full_schema.get("commands").and_then(|c| c.as_array()) {
            let path_str = path.join(" ");
            for cmd in commands {
                if let Some(name) = cmd.get("name").and_then(|n| n.as_str()) {
                    if name == path_str {
                        return cmd.clone();
                    }
                }
            }
        }
        
        serde_json::json!({
            "error": "Command not found",
            "requested_path": path,
        })
    }
    
    /// Get the full command schema
    fn get_full_schema(&self) -> Value {
        serde_json::json!({
            "name": "veac",
            "version": "0.1.0",
            "description": "VESC AI-Controllable CLI",
            "commands": [
                {
                    "name": "device list-ports",
                    "description": "List available serial ports",
                    "path": ["device", "list-ports"],
                    "mutating": false,
                    "args": [],
                    "output_fields": [
                        {"name": "name", "type": "string", "description": "Port name (e.g., COM3)"},
                        {"name": "description", "type": "string", "description": "Port description"},
                        {"name": "manufacturer", "type": "string", "description": "Device manufacturer"}
                    ]
                },
                {
                    "name": "device connect",
                    "description": "Connect to VESC on specified port",
                    "path": ["device", "connect"],
                    "mutating": false,
                    "args": [],
                    "output_fields": [
                        {"name": "connected", "type": "boolean"},
                        {"name": "port", "type": "string"},
                        {"name": "baud_rate", "type": "integer"}
                    ]
                },
                {
                    "name": "device info",
                    "description": "Get firmware version and device info",
                    "path": ["device", "info"],
                    "mutating": false,
                    "args": [],
                    "output_fields": [
                        {"name": "version", "type": "string"},
                        {"name": "name", "type": "string"}
                    ]
                },
                {
                    "name": "device ping",
                    "description": "Ping VESC to check connectivity",
                    "path": ["device", "ping"],
                    "mutating": false,
                    "args": [],
                    "output_fields": [
                        {"name": "responsive", "type": "boolean"}
                    ]
                },
                {
                    "name": "motor get-values",
                    "description": "Get real-time motor telemetry",
                    "path": ["motor", "get-values"],
                    "mutating": false,
                    "args": [],
                    "output_fields": [
                        {"name": "rpm", "type": "number"},
                        {"name": "current_motor", "type": "number"},
                        {"name": "current_in", "type": "number"},
                        {"name": "duty_now", "type": "number"},
                        {"name": "v_in", "type": "number"},
                        {"name": "temp_mos", "type": "number"},
                        {"name": "temp_motor", "type": "number"}
                    ]
                },
                {
                    "name": "motor set-rpm",
                    "description": "Set motor RPM",
                    "path": ["motor", "set-rpm"],
                    "mutating": true,
                    "args": [
                        {"name": "rpm", "type": "integer", "required": true, "description": "Target RPM"},
                        {"name": "duration", "type": "integer", "required": false, "description": "Duration in seconds"}
                    ],
                    "output_fields": [
                        {"name": "success", "type": "boolean"},
                        {"name": "rpm", "type": "integer"}
                    ]
                },
                {
                    "name": "motor set-duty",
                    "description": "Set duty cycle",
                    "path": ["motor", "set-duty"],
                    "mutating": true,
                    "args": [
                        {"name": "duty", "type": "number", "required": true, "description": "Duty cycle (-1.0 to 1.0)"},
                        {"name": "duration", "type": "integer", "required": false, "description": "Duration in seconds"}
                    ],
                    "output_fields": [
                        {"name": "success", "type": "boolean"},
                        {"name": "duty", "type": "number"}
                    ]
                },
                {
                    "name": "motor set-current",
                    "description": "Set motor current",
                    "path": ["motor", "set-current"],
                    "mutating": true,
                    "args": [
                        {"name": "current", "type": "number", "required": true, "description": "Current in Amperes"},
                        {"name": "duration", "type": "integer", "required": false, "description": "Duration in seconds"}
                    ],
                    "output_fields": [
                        {"name": "success", "type": "boolean"},
                        {"name": "current", "type": "number"}
                    ]
                },
                {
                    "name": "motor set-current-brake",
                    "description": "Apply current brake",
                    "path": ["motor", "set-current-brake"],
                    "mutating": true,
                    "args": [
                        {"name": "current", "type": "number", "required": true, "description": "Brake current in Amperes"},
                        {"name": "duration", "type": "integer", "required": false, "description": "Duration in seconds"}
                    ],
                    "output_fields": [
                        {"name": "success", "type": "boolean"},
                        {"name": "current", "type": "number"}
                    ]
                },
                {
                    "name": "motor stop",
                    "description": "Stop motor immediately",
                    "path": ["motor", "stop"],
                    "mutating": true,
                    "args": [],
                    "output_fields": [
                        {"name": "stopped", "type": "boolean"}
                    ]
                },
                {
                    "name": "config get-mc",
                    "description": "Read motor configuration",
                    "path": ["config", "get-mc"],
                    "mutating": false,
                    "args": [
                        {"name": "output", "type": "string", "required": false, "description": "Output file path"}
                    ],
                    "output_fields": [
                        {"name": "configuration", "type": "object"}
                    ]
                },
                {
                    "name": "config set-mc",
                    "description": "Write motor configuration",
                    "path": ["config", "set-mc"],
                    "mutating": true,
                    "args": [
                        {"name": "file", "type": "string", "required": true, "description": "Input XML file path"}
                    ],
                    "output_fields": [
                        {"name": "success", "type": "boolean"}
                    ]
                },
                {
                    "name": "schema",
                    "description": "Show command schema for agent discovery",
                    "path": ["schema"],
                    "mutating": false,
                    "args": [
                        {"name": "command_path", "type": "array", "required": false, "description": "Command path to get schema for"}
                    ],
                    "output_fields": [
                        {"name": "schema", "type": "object"}
                    ]
                }
            ],
            "error_kinds": [
                {"kind": "connection", "retryable": true, "description": "Connection failed"},
                {"kind": "timeout", "retryable": true, "description": "Command timed out"},
                {"kind": "protocol", "retryable": false, "description": "Protocol error"},
                {"kind": "invalid_argument", "retryable": false, "description": "Invalid argument"}
            ],
            "global_args": [
                {"name": "port", "short": "p", "type": "string", "description": "Serial port path"},
                {"name": "baud", "short": "b", "type": "integer", "default": "115200", "description": "Baud rate"},
                {"name": "format", "short": "f", "type": "string", "default": "json", "description": "Output format (json/table/yaml)"},
                {"name": "dry-run", "long": "dry-run", "type": "boolean", "description": "Preview without executing"},
                {"name": "verbose", "short": "v", "type": "boolean", "description": "Verbose output"},
                {"name": "timeout", "short": "t", "type": "integer", "default": "5000", "description": "Command timeout (ms)"},
                {"name": "can-id", "short": "c", "type": "integer", "description": "CAN bus device ID"}
            ]
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_next_action_new() {
        let action = NextAction::new("device list-ports", "List serial ports");
        assert_eq!(action.command, "device list-ports");
        assert_eq!(action.description, "List serial ports");
        assert!(action.params.is_none());
    }

    #[test]
    fn test_next_action_with_params() {
        let params = serde_json::json!({"rpm": 1000});
        let action = NextAction::with_params("motor set-rpm", "Set RPM", params.clone());
        assert_eq!(action.command, "motor set-rpm");
        assert_eq!(action.params, Some(params));
    }

    #[test]
    fn test_cli_response_serialization() {
        let response = CliResponse {
            ok: true,
            command: "device ping".to_string(),
            result: serde_json::json!({"responsive": true}),
            next_actions: vec![
                NextAction::new("device info", "Get device info"),
            ],
        };
        
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"ok\":true"));
        assert!(json.contains("device ping"));
        assert!(json.contains("device info"));
    }

    #[test]
    fn test_error_response_serialization() {
        let response = ErrorResponse {
            ok: false,
            command: "motor set-rpm".to_string(),
            error: "Connection failed".to_string(),
            error_kind: "connection".to_string(),
            suggestion: Some("Check port and try again".to_string()),
            next_actions: vec![
                NextAction::new("device list-ports", "List available ports"),
            ],
        };
        
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"ok\":false"));
        assert!(json.contains("Connection failed"));
        assert!(json.contains("connection"));
    }

    #[test]
    fn test_output_manager_new() {
        let manager = OutputManager::new(OutputFormat::Json, false);
        // Just verify it creates without panicking
        let _ = manager;
    }
}
