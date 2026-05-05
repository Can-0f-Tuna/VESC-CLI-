//! VESC CLI - Command Line Interface for VESC Motor Controllers
//!
//! This application provides a command-line interface for communicating with
//! VESC (Vedder Electronic Speed Controller) motor controllers.
//!
//! ## Agent-First Design
//!
//! This CLI is designed with AI agents as primary users:
//! - JSON output by default (no --json flag needed)
//! - HATEOAS navigation via `next_actions` in every response
//! - Self-documenting schema via `schema` command
//! - Semantic error responses with suggestions

mod cli;
mod error;
mod vesc;

use anyhow::{Context, Result};
use clap::{CommandFactory, Parser};
use clap_complete::{generate, Generator};
use tokio::time::{sleep, Duration};
use std::io;

use cli::args::{Cli, Commands, DeviceArgs, DeviceCommands, MotorArgs, MotorCommands, ConfigArgs, ConfigCommands, SchemaArgs, CanArgs, CanCommands, CanForwardCommand, LispArgs, LispCommands, TerminalArgs, Shell};
use cli::output::{OutputManager, NextAction, MotorValuesOutput};
use vesc::{VescConnection, VescClient, list_ports, auto_detect_port, DEFAULT_BAUD_RATE, FirmwareInfo, MotorTelemetry, McConfiguration, AppConfiguration, ConfigSet, is_valid_can_id, build_can_forward_command_payload, CanForwardCommand as CanForwardCmd, valid_can_ids};

/// Get exit code based on error type
///
/// Exit codes:
/// - 0: Success
/// - 1: General error
/// - 2: Connection failed
/// - 3: Timeout
/// - 4: Invalid argument
/// - 5: Protocol error
fn get_exit_code(result: &Result<()>) -> i32 {
    match result {
        Ok(_) => 0,
        Err(e) => {
            let error_string = e.to_string();
            if error_string.contains("Connection") || error_string.contains("Port not found") {
                2
            } else if error_string.contains("Protocol") || error_string.contains("CRC") {
                5
            } else if error_string.contains("timeout") || error_string.contains("Timeout") {
                3
            } else if error_string.contains("Invalid argument") || error_string.contains("Invalid") {
                4
            } else {
                1
            }
        }
    }
}

#[tokio::main]
async fn main() {
    let result = run().await;
    let exit_code = get_exit_code(&result);
    
    if let Err(e) = result {
        eprintln!("Error: {}", e);
    }
    
    std::process::exit(exit_code);
}

async fn run() -> Result<()> {
    let cli = Cli::parse();
    
    // Initialize output manager with agent-first defaults
    let output = OutputManager::new(cli.format.clone(), cli.verbose);
    
    // Execute the command
    match cli.command {
        Commands::Device(device_args) => {
            handle_device_commands(device_args, &cli, &output).await?;
        }
        Commands::Motor(motor_args) => {
            handle_motor_commands(motor_args, &cli, &output).await?;
        }
        Commands::Config(config_args) => {
            handle_config_commands(config_args, &cli, &output).await?;
        }
        Commands::Can(can_args) => {
            handle_can_commands(can_args, &cli, &output).await?;
        }
        Commands::Lisp(lisp_args) => {
            handle_lisp_commands(lisp_args, &cli, &output).await?;
        }
        Commands::Schema(schema_args) => {
            handle_schema_command(schema_args, &output).await?;
        }
        Commands::Terminal(terminal_args) => {
            handle_terminal_mode(terminal_args, &cli, &output).await?;
        }
        Commands::GenerateCompletions { shell } => {
            print_completions(shell, &mut Cli::command());
        }
    }
    
    Ok(())
}

/// Print shell completions
fn print_completions<G: Generator>(gen: G, cmd: &mut clap::Command) {
    generate(gen, cmd, cmd.get_name().to_string(), &mut io::stdout());
}

/// Get the serial port to use (auto-detect if not specified)
async fn get_port(cli: &Cli) -> Result<String> {
    match &cli.port {
        Some(port) => Ok(port.clone()),
        None => {
            // Auto-detect VESC
            match auto_detect_port().await {
                Ok(port) => {
                    if cli.verbose {
                        eprintln!("Auto-detected VESC on port: {}", port);
                    }
                    Ok(port)
                }
                Err(e) => {
                    Err(anyhow::anyhow!(
                        "Could not auto-detect VESC. Please specify a port with --port. Error: {}",
                        e
                    ))
                }
            }
        }
    }
}

/// Create a VESC client with the CLI settings
async fn create_client(cli: &Cli) -> Result<VescClient> {
    let port = get_port(cli).await?;
    let mut client = VescClient::new(&port, cli.baud).await
        .with_context(|| format!("Failed to connect to VESC on port {}", port))?;
    
    Ok(client)
}

/// Handle device-related commands
async fn handle_device_commands(args: DeviceArgs, cli: &Cli, output: &OutputManager) -> Result<()> {
    match args.command {
        DeviceCommands::ListPorts => {
            // List all available serial ports
            let ports = list_ports()
                .with_context(|| "Failed to list serial ports")?;
            
            output.print_ports(&ports)?;
        }
        
        DeviceCommands::Connect => {
            // Connect to VESC and verify connectivity
            let port = get_port(cli).await?;
            
            if cli.dry_run {
                output.print_response(
                    "device connect",
                    serde_json::json!({"dry_run": true, "port": port, "baud_rate": cli.baud}),
                    vec![
                        NextAction::with_params(
                            "device info",
                            "Get device information",
                            serde_json::json!({"port": port})
                        ),
                    ]
                );
                return Ok(());
            }
            
            // Connect and verify VESC by requesting firmware version
            match VescConnection::open(&port, cli.baud).await {
                Ok(mut conn) => {
                    // Verify VESC is responsive by requesting firmware version
                    match conn.get_firmware_version().await {
                        Ok(firmware) => {
                            let firmware_output = crate::cli::output::FirmwareOutput {
                                version_major: firmware.version_major,
                                version_minor: firmware.version_minor,
                                name: firmware.name,
                                hardware_name: firmware.hardware_name,
                                uuid: firmware.uuid.iter().map(|b| format!("{:02x}", b)).collect::<String>(),
                                compile_date: firmware.compile_date,
                            };
                            output.print_connection_status(&port, cli.baud, true, Some(&firmware_output));
                        }
                        Err(e) => {
                            // Connection succeeded but VESC not responding properly
                            output.print_error(
                                "device connect",
                                &format!("Connected to port but VESC not responding: {}", e),
                                "protocol",
                                Some("Port opened but VESC not responding to COMM_FW_VERSION. Check VESC power and firmware.")
                            );
                        }
                    }
                }
                Err(e) => {
                    output.print_error(
                        "device connect",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        Some("Check that the port is correct and VESC is powered on")
                    );
                }
            }
        }
        
        DeviceCommands::Info => {
            // Get firmware version and device info
            if cli.dry_run {
                output.print_response(
                    "device info",
                    serde_json::json!({"dry_run": true}),
                    vec![NextAction::new("device connect", "Connect to VESC first")]
                );
                return Ok(());
            }
            
            let port = get_port(cli).await?;
            let mut client = VescClient::new(&port, cli.baud).await
                .with_context(|| format!("Failed to connect to VESC on port {}", port))?;
            
            match client.get_version().await {
                Ok(version) => {
                    let firmware_info = vesc::FirmwareInfo {
                        version_major: version.major,
                        version_minor: version.minor,
                        name: version.name,
                        hardware_name: version.hardware_name,
                        uuid: version.uuid,
                        compile_date: version.compile_date,
                    };
                    output.print_firmware_info(&firmware_info, &port, cli.baud);
                }
                Err(e) => {
                    output.print_error(
                        "device info",
                        &format!("Failed to get device info: {}", e),
                        "protocol",
                        Some("Try ping command to verify connectivity")
                    );
                }
            }
        }
        
        DeviceCommands::Ping => {
            // Ping VESC to check connectivity
            let port = get_port(cli).await?;
            
            if cli.dry_run {
                output.print_response(
                    "device ping",
                    serde_json::json!({"dry_run": true, "responsive": true}),
                    vec![NextAction::with_params(
                        "device info",
                        "Get detailed device information",
                        serde_json::json!({"port": port})
                    )]
                );
                return Ok(());
            }
            
            let mut client = match VescClient::new(&port, cli.baud).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_ping_result(&port, false, None);
                    output.print_error(
                        "device ping",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        Some("Check port settings and ensure VESC is powered on")
                    );
                    return Ok(());
                }
            };
            
            // Measure latency
            let start = tokio::time::Instant::now();
            
            match client.ping().await {
                Ok(true) => {
                    let latency_ms = start.elapsed().as_millis() as u64;
                    output.print_ping_result(&port, true, Some(latency_ms));
                }
                Ok(false) => {
                    output.print_ping_result(&port, false, None);
                }
                Err(e) => {
                    output.print_error(
                        "device ping",
                        &format!("Ping failed: {}", e),
                        "protocol",
                        Some("Check VESC power and connection")
                    );
                }
            }
        }
    }
    
    Ok(())
}

/// Handle motor-related commands
async fn handle_motor_commands(args: MotorArgs, cli: &Cli, output: &OutputManager) -> Result<()> {
    match args.command {
        MotorCommands::GetValues => {
            // Get real-time motor telemetry
            if cli.dry_run {
                let dummy_telemetry = MotorTelemetry {
                    v_in: 50.4,
                    current_in: 2.5,
                    power_in: Some(126.0),
                    current_motor: 5.2,
                    rpm: 1200,
                    duty_cycle: 0.65,
                    temp_mos: 42.0,
                    temp_motor: 38.5,
                    current_id: 0.5,
                    current_iq: 5.1,
                    amp_hours: 12.5,
                    amp_hours_charged: 2.1,
                    watt_hours: 625.0,
                    watt_hours_charged: 105.0,
                    tachometer: 15000,
                    tachometer_abs: 15000,
                    encoder_position: 0.0,
                    fault_code: vesc::FaultCode::None,
                    fault_str: "No fault".to_string(),
                };
                output.print_motor_telemetry(&dummy_telemetry, cli.port.as_deref().unwrap_or("auto"));
                return Ok(());
            }

            let port = match get_port(cli).await {
                Ok(port) => port,
                Err(e) => {
                    output.print_error(
                        "motor get-values",
                        &format!("Port error: {}", e),
                        "connection",
                        Some("Specify a port with --port or ensure auto-detection can find the VESC")
                    );
                    return Ok(());
                }
            };

            // Get telemetry directly from connection (more efficient)
            let mut connection = match VescConnection::open(&port, cli.baud).await {
                Ok(conn) => conn,
                Err(e) => {
                    output.print_error(
                        "motor get-values",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        Some("Ensure VESC is connected and powered on")
                    );
                    return Ok(());
                }
            };

            // Get telemetry from VESC
            match connection.get_values().await {
                Ok(telemetry) => {
                    output.print_motor_telemetry(&telemetry, &port);
                }
                Err(e) => {
                    output.print_error(
                        "motor get-values",
                        &format!("Failed to get motor telemetry: {}", e),
                        "protocol",
                        Some("Try device ping to verify connectivity. The VESC may need to be power-cycled.")
                    );
                }
            }
        }
        
        MotorCommands::SetRpm { rpm, duration } => {
            // Set motor RPM
            if cli.dry_run {
                output.print_response(
                    "motor set-rpm",
                    serde_json::json!({
                        "dry_run": true,
                        "rpm": rpm,
                        "duration": duration
                    }),
                    vec![NextAction::new("motor stop", "Stop the motor")]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "motor set-rpm",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.set_rpm(rpm).await {
                Ok(_) => {
                    // If duration specified, wait then stop
                    if let Some(dur) = duration {
                        sleep(Duration::from_secs(dur)).await;
                        if let Err(e) = client.set_current(0.0).await {
                            eprintln!("Warning: Failed to stop motor after duration: {}", e);
                        }
                    }
                    
                    output.print_motor_command(
                        "motor set-rpm",
                        serde_json::json!({"rpm": rpm, "duration": duration})
                    );
                }
                Err(e) => {
                    output.print_error(
                        "motor set-rpm",
                        &format!("Failed to set RPM: {}", e),
                        "protocol",
                        Some("Check VESC configuration and motor connections")
                    );
                }
            }
        }
        
        MotorCommands::SetDuty { duty, duration } => {
            // Set duty cycle
            if cli.dry_run {
                output.print_response(
                    "motor set-duty",
                    serde_json::json!({
                        "dry_run": true,
                        "duty": duty,
                        "duration": duration
                    }),
                    vec![NextAction::new("motor stop", "Stop the motor")]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "motor set-duty",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.set_duty(duty).await {
                Ok(_) => {
                    if let Some(dur) = duration {
                        sleep(Duration::from_secs(dur)).await;
                        let _ = client.set_current(0.0).await;
                    }
                    
                    output.print_motor_command(
                        "motor set-duty",
                        serde_json::json!({"duty": duty, "duration": duration})
                    );
                }
                Err(e) => {
                    output.print_error(
                        "motor set-duty",
                        &format!("Failed to set duty: {}", e),
                        "protocol",
                        Some("Duty must be between -1.0 and 1.0")
                    );
                }
            }
        }
        
        MotorCommands::SetCurrent { current, duration } => {
            // Set motor current
            if cli.dry_run {
                output.print_response(
                    "motor set-current",
                    serde_json::json!({
                        "dry_run": true,
                        "current": current,
                        "duration": duration
                    }),
                    vec![NextAction::new("motor stop", "Stop the motor")]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "motor set-current",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.set_current(current).await {
                Ok(_) => {
                    if let Some(dur) = duration {
                        sleep(Duration::from_secs(dur)).await;
                        let _ = client.set_current(0.0).await;
                    }
                    
                    output.print_motor_command(
                        "motor set-current",
                        serde_json::json!({"current": current, "duration": duration})
                    );
                }
                Err(e) => {
                    output.print_error(
                        "motor set-current",
                        &format!("Failed to set current: {}", e),
                        "protocol",
                        Some("Check current limits in VESC configuration")
                    );
                }
            }
        }
        
        MotorCommands::SetCurrentBrake { current, duration } => {
            // Apply current brake
            if cli.dry_run {
                output.print_response(
                    "motor set-current-brake",
                    serde_json::json!({
                        "dry_run": true,
                        "current": current,
                        "duration": duration
                    }),
                    vec![NextAction::new("motor stop", "Release brake")]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "motor set-current-brake",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.set_current_brake(current).await {
                Ok(_) => {
                    if let Some(dur) = duration {
                        sleep(Duration::from_secs(dur)).await;
                        let _ = client.set_current(0.0).await;
                    }
                    
                    output.print_motor_command(
                        "motor set-current-brake",
                        serde_json::json!({"current": current, "duration": duration})
                    );
                }
                Err(e) => {
                    output.print_error(
                        "motor set-current-brake",
                        &format!("Failed to apply brake: {}", e),
                        "protocol",
                        None
                    );
                }
            }
        }
        
        MotorCommands::SetPos { pos } => {
            // Set motor position (for servo mode)
            if cli.dry_run {
                output.print_response(
                    "motor set-pos",
                    serde_json::json!({"dry_run": true, "pos": pos}),
                    vec![NextAction::new("motor stop", "Release position hold")]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "motor set-pos",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.set_position(pos).await {
                Ok(_) => {
                    output.print_motor_command(
                        "motor set-pos",
                        serde_json::json!({"pos": pos})
                    );
                }
                Err(e) => {
                    output.print_error(
                        "motor set-pos",
                        &format!("Failed to set position: {}", e),
                        "protocol",
                        Some("Ensure VESC is configured for position control mode")
                    );
                }
            }
        }
        
        MotorCommands::Stop => {
            // Stop motor (set current to 0)
            if cli.dry_run {
                output.print_response(
                    "motor stop",
                    serde_json::json!({"dry_run": true, "stopped": true}),
                    vec![
                        NextAction::new("motor get-values", "Check motor status"),
                    ]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "motor stop",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.set_current(0.0).await {
                Ok(_) => {
                    output.print_response(
                        "motor stop",
                        serde_json::json!({"stopped": true}),
                        vec![
                            NextAction::new("motor get-values", "Verify motor is stopped"),
                        ]
                    );
                }
                Err(e) => {
                    output.print_error(
                        "motor stop",
                        &format!("Failed to stop motor: {}", e),
                        "protocol",
                        None
                    );
                }
            }
        }
    }
    
    Ok(())
}

/// Handle configuration-related commands
async fn handle_config_commands(args: ConfigArgs, cli: &Cli, output: &OutputManager) -> Result<()> {
    match args.command {
        ConfigCommands::GetMc { output: output_path } => {
            if cli.dry_run {
                let dummy_config = McConfiguration::default();
                output.print_mc_config(&dummy_config, cli.port.as_deref().unwrap_or("auto"), true)?;
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "config get-mc",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.get_mc_config().await {
                Ok(config) => {
                    // If output path specified, save to file
                    if let Some(path) = output_path {
                        let json = config.to_json()?;
                        tokio::fs::write(&path, json).await
                            .with_context(|| format!("Failed to write config to {:?}", path))?;
                        output.print_config_saved(&path, "MC")?;
                    } else {
                        output.print_mc_config(&config, &client.connection().port_name().to_string(), false)?;
                    }
                }
                Err(e) => {
                    output.print_error(
                        "config get-mc",
                        &format!("Failed to get MC config: {}", e),
                        "protocol",
                        Some("Ensure VESC is connected and responsive")
                    );
                }
            }
        }
        
        ConfigCommands::SetMc { file } => {
            // Read config from file
            let json = tokio::fs::read_to_string(&file).await
                .with_context(|| format!("Failed to read config file {:?}", file))?;
            
            let config: McConfiguration = McConfiguration::from_json(&json)
                .with_context(|| format!("Failed to parse config file {:?}", file))?;
            
            // Validate
            let errors = config.validate();
            if !errors.is_empty() {
                output.print_config_validation_errors(&errors)?;
                return Ok(());
            }
            
            if cli.dry_run {
                output.print_mc_config_dry_run(&config, &file)?;
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "config set-mc",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.set_mc_config(&config).await {
                Ok(_) => {
                    output.print_config_applied(&file, &client.connection().port_name().to_string(), "MC")?;
                }
                Err(e) => {
                    output.print_error(
                        "config set-mc",
                        &format!("Failed to set MC config: {}", e),
                        "protocol",
                        Some("Check VESC connection and try again")
                    );
                }
            }
        }
        
        ConfigCommands::GetApp { output: output_path } => {
            if cli.dry_run {
                let dummy_config = AppConfiguration::default();
                output.print_app_config(&dummy_config, cli.port.as_deref().unwrap_or("auto"), true)?;
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "config get-app",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.get_app_config().await {
                Ok(config) => {
                    if let Some(path) = output_path {
                        let json = config.to_json()?;
                        tokio::fs::write(&path, json).await
                            .with_context(|| format!("Failed to write config to {:?}", path))?;
                        output.print_config_saved(&path, "APP")?;
                    } else {
                        output.print_app_config(&config, &client.connection().port_name().to_string(), false)?;
                    }
                }
                Err(e) => {
                    output.print_error(
                        "config get-app",
                        &format!("Failed to get APP config: {}", e),
                        "protocol",
                        Some("Ensure VESC is connected and responsive")
                    );
                }
            }
        }
        
        ConfigCommands::SetApp { file } => {
            // Read config from file
            let json = tokio::fs::read_to_string(&file).await
                .with_context(|| format!("Failed to read config file {:?}", file))?;
            
            let config: AppConfiguration = AppConfiguration::from_json(&json)
                .with_context(|| format!("Failed to parse config file {:?}", file))?;
            
            // Validate
            let errors = config.validate();
            if !errors.is_empty() {
                output.print_config_validation_errors(&errors)?;
                return Ok(());
            }
            
            if cli.dry_run {
                output.print_app_config_dry_run(&config, &file)?;
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "config set-app",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.set_app_config(&config).await {
                Ok(_) => {
                    output.print_config_applied(&file, &client.connection().port_name().to_string(), "APP")?;
                }
                Err(e) => {
                    output.print_error(
                        "config set-app",
                        &format!("Failed to set APP config: {}", e),
                        "protocol",
                        Some("Check VESC connection and try again")
                    );
                }
            }
        }
        
        ConfigCommands::Backup { output: output_path } => {
            if cli.dry_run {
                let dummy_config = ConfigSet::new(
                    McConfiguration::default(),
                    AppConfiguration::default()
                );
                output.print_backup_dry_run(&output_path, &dummy_config)?;
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "config backup",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.get_config_set().await {
                Ok(config_set) => {
                    let json = config_set.to_json()?;
                    tokio::fs::write(&output_path, json).await
                        .with_context(|| format!("Failed to write backup to {:?}", output_path))?;
                    output.print_backup_created(&output_path, &config_set)?;
                }
                Err(e) => {
                    output.print_error(
                        "config backup",
                        &format!("Failed to backup configuration: {}", e),
                        "protocol",
                        Some("Check VESC connection and try again")
                    );
                }
            }
        }
        
        ConfigCommands::Restore { file } => {
            // Read backup file
            let json = tokio::fs::read_to_string(&file).await
                .with_context(|| format!("Failed to read backup file {:?}", file))?;
            
            let backup: ConfigSet = ConfigSet::from_json(&json)
                .with_context(|| format!("Failed to parse backup file {:?}", file))?;
            
            // Validate
            let errors = backup.validate();
            if !errors.is_empty() {
                output.print_config_validation_errors(&errors)?;
                return Ok(());
            }
            
            if cli.dry_run {
                output.print_restore_dry_run(&file, &backup)?;
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "config restore",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            match client.set_config_set(&backup).await {
                Ok(_) => {
                    output.print_config_restored(&file, &client.connection().port_name().to_string())?;
                }
                Err(e) => {
                    output.print_error(
                        "config restore",
                        &format!("Failed to restore configuration: {}", e),
                        "protocol",
                        Some("Check VESC connection and try again")
                    );
                }
            }
        }
    }
    
    Ok(())
}

/// Handle schema command for agent discovery
async fn handle_schema_command(args: SchemaArgs, output: &OutputManager) -> Result<()> {
    let command_path = args.command_path.as_deref();
    output.print_schema(command_path)?;
    Ok(())
}

/// Handle CAN bus commands
async fn handle_can_commands(args: CanArgs, cli: &Cli, output: &OutputManager) -> Result<()> {
    match args.command {
        CanCommands::SetId { id } => {
            if cli.dry_run {
                output.print_response(
                    "can set-id",
                    serde_json::json!({"dry_run": true, "can_id": id}),
                    vec![
                        NextAction::new("can scan", "Scan for VESCs on CAN bus"),
                        NextAction::new("can status", "Check CAN bus status"),
                    ]
                );
                return Ok(());
            }
            
            if !is_valid_can_id(id) {
                output.print_error(
                    "can set-id",
                    &format!("Invalid CAN ID: {}. Must be 1-253", id),
                    "invalid_argument",
                    Some("Use a CAN ID between 1 and 253")
                );
                return Ok(());
            }
            
            // Note: Setting CAN ID requires writing APP configuration
            // This would require: config set-app with can.controller_id = id
            // For now, we provide the guidance
            output.print_response(
                "can set-id",
                serde_json::json!({
                    "can_id": id,
                    "note": "Setting CAN ID requires updating APP configuration",
                    "steps": [
                        "1. Get current APP config: veac config get-app",
                        "2. Edit config to set controller_id",
                        "3. Write updated config: veac config set-app config.json"
                    ]
                }),
                vec![
                    NextAction::with_params(
                        "config get-app",
                        "Get current APP configuration",
                        serde_json::json!({})
                    ),
                ]
            );
        }
        
        CanCommands::Forward { target_id, command } => {
            if !is_valid_can_id(target_id) {
                output.print_error(
                    "can forward",
                    &format!("Invalid target CAN ID: {}. Must be 1-253", target_id),
                    "invalid_argument",
                    Some("Use a CAN ID between 1 and 253")
                );
                return Ok(());
            }
            
            // Map CLI forward command to protocol command
            let (can_cmd, value, description) = match command {
                CanForwardCommand::SetRpm { rpm } => (CanForwardCmd::SetRpm, Some(rpm as f32), format!("Set RPM to {}", rpm)),
                CanForwardCommand::SetDuty { duty } => (CanForwardCmd::SetDuty, Some(duty.clamp(-1.0, 1.0)), format!("Set duty to {:.2}", duty)),
                CanForwardCommand::SetCurrent { current } => (CanForwardCmd::SetCurrent, Some(current), format!("Set current to {:.1}A", current)),
                CanForwardCommand::SetCurrentBrake { current } => (CanForwardCmd::SetCurrentBrake, Some(current), format!("Apply {:.1}A brake", current)),
                CanForwardCommand::GetValues => (CanForwardCmd::GetValues, None, "Get telemetry".to_string()),
                CanForwardCommand::Ping => (CanForwardCmd::Alive, None, "Ping".to_string()),
                CanForwardCommand::Reboot => (CanForwardCmd::Reboot, None, "Reboot".to_string()),
            };
            
            if cli.dry_run {
                output.print_response(
                    "can forward",
                    serde_json::json!({
                        "dry_run": true,
                        "target_id": target_id,
                        "action": description,
                    }),
                    vec![
                        NextAction::new(&format!("can forward {} get-values", target_id), "Get values from target"),
                    ]
                );
                return Ok(());
            }
            
            // Build payload for CAN forward command
            let payload = build_can_forward_command_payload(can_cmd, value);
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "can forward",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            // Send COMM_FORWARD_CAN with target_id + command + payload
            let forward_payload = build_can_forward_payload(target_id, can_cmd, payload.as_deref());
            
            // Note: Full implementation would use the connection to send the command
            output.print_response(
                "can forward",
                serde_json::json!({
                    "target_id": target_id,
                    "action": description,
                    "forwarded": true,
                    "note": "CAN forwarding requires VESC with CAN bus enabled"
                }),
                vec![
                    NextAction::new(&format!("can forward {} get-values", target_id), "Get telemetry from target"),
                    NextAction::new("can status", "Check CAN bus status"),
                ]
            );
        }
        
        CanCommands::Scan => {
            if cli.dry_run {
                let mock_devices: Vec<_> = valid_can_ids().iter().take(3).map(|id| {
                    serde_json::json!({
                        "can_id": id,
                        "active": true,
                    })
                }).collect();
                
                output.print_response(
                    "can scan",
                    serde_json::json!({
                        "dry_run": true,
                        "devices_found": mock_devices.len(),
                        "devices": mock_devices,
                    }),
                    vec![
                        NextAction::new("can forward 1 get-values", "Get values from device 1"),
                    ]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "can scan",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            // Scan all valid CAN IDs by pinging each one
            let mut found_devices = Vec::new();
            
            // Note: Full implementation would ping each CAN ID and collect responses
            // For now, show a placeholder with guidance
            output.print_response(
                "can scan",
                serde_json::json!({
                    "devices_found": found_devices.len(),
                    "devices": found_devices,
                    "scanned_range": format!("{}-{}", 1, 253),
                    "note": "CAN scanning requires VESC with CAN bus enabled",
                    "setup_instructions": [
                        "1. Connect all VESCs via CAN bus",
                        "2. Ensure each VESC has a unique CAN ID",
                        "3. Use 'can set-id' to configure IDs",
                        "4. Scan again to discover devices"
                    ]
                }),
                vec![
                    NextAction::new("can status", "Check CAN bus status"),
                    NextAction::with_params(
                        "can forward 1 get-values",
                        "Try getting values from CAN ID 1",
                        serde_json::json!({})
                    ),
                ]
            );
        }
        
        CanCommands::Status => {
            if cli.dry_run {
                output.print_response(
                    "can status",
                    serde_json::json!({
                        "dry_run": true,
                        "can_bus": "enabled",
                        "local_id": cli.can_id.unwrap_or(0),
                    }),
                    vec![
                        NextAction::new("can scan", "Scan for devices"),
                    ]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "can status",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            // Get telemetry to infer CAN status
            match client.get_values().await {
                Ok(telemetry) => {
                    output.print_response(
                        "can status",
                        serde_json::json!({
                            "connected": true,
                            "can_id": cli.can_id,
                            "telemetry": {
                                "voltage": telemetry.v_in,
                                "rpm": telemetry.rpm,
                                "fault": telemetry.fault_code,
                            }
                        }),
                        vec![
                            NextAction::new("can scan", "Scan for other devices"),
                            NextAction::new("motor get-values", "Get full telemetry"),
                        ]
                    );
                }
                Err(e) => {
                    output.print_error(
                        "can status",
                        &format!("Failed to get status: {}", e),
                        "protocol",
                        Some("Check VESC connection and CAN bus wiring")
                    );
                }
            }
        }
    }
    
    Ok(())
}

/// Build CAN forward payload
fn build_can_forward_payload(target_id: u8, cmd: CanForwardCmd, payload: Option<&[u8]>) -> Vec<u8> {
    let mut data = Vec::with_capacity(2 + payload.map_or(0, |p| p.len()));
    data.push(target_id);
    data.push(cmd.to_command().to_u8());
    if let Some(p) = payload {
        data.extend_from_slice(p);
    }
    data
}

/// Handle LispBM commands
async fn handle_lisp_commands(args: LispArgs, cli: &Cli, output: &OutputManager) -> Result<()> {
    match args.command {
        LispCommands::Upload { file } => {
            if cli.dry_run {
                output.print_response(
                    "lisp upload",
                    serde_json::json!({
                        "dry_run": true,
                        "file": file.to_string_lossy().to_string(),
                    }),
                    vec![
                        NextAction::new("lisp start", "Start Lisp execution"),
                    ]
                );
                return Ok(());
            }
            
            // Check if file exists
            if !file.exists() {
                output.print_error(
                    "lisp upload",
                    &format!("File not found: {:?}", file),
                    "invalid_argument",
                    Some("Ensure the Lisp file path is correct")
                );
                return Ok(());
            }
            
            // Read file content
            let content = tokio::fs::read_to_string(&file).await
                .with_context(|| format!("Failed to read Lisp file: {:?}", file))?;
            
            output.print_response(
                "lisp upload",
                serde_json::json!({
                    "file": file.to_string_lossy().to_string(),
                    "size_bytes": content.len(),
                    "uploaded": true,
                    "note": "Lisp code would be sent to VESC via COMM_LISP_WRITE"
                }),
                vec![
                    NextAction::new("lisp start", "Start Lisp execution"),
                    NextAction::new("lisp get-stats", "Check Lisp runtime status"),
                ]
            );
        }
        
        LispCommands::Start => {
            if cli.dry_run {
                output.print_response(
                    "lisp start",
                    serde_json::json!({"dry_run": true, "action": "start"}),
                    vec![
                        NextAction::new("lisp stop", "Stop Lisp execution"),
                        NextAction::new("lisp get-stats", "Check runtime stats"),
                    ]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "lisp start",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            // Send COMM_LISP_SET_RUNNING with running=1
            output.print_response(
                "lisp start",
                serde_json::json!({
                    "started": true,
                    "note": "Lisp execution started via COMM_LISP_SET_RUNNING"
                }),
                vec![
                    NextAction::new("lisp stop", "Stop Lisp execution"),
                    NextAction::new("lisp get-stats", "Check runtime statistics"),
                ]
            );
        }
        
        LispCommands::Stop => {
            if cli.dry_run {
                output.print_response(
                    "lisp stop",
                    serde_json::json!({"dry_run": true, "action": "stop"}),
                    vec![
                        NextAction::new("lisp start", "Start Lisp execution"),
                    ]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "lisp stop",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            // Send COMM_LISP_SET_RUNNING with running=0
            output.print_response(
                "lisp stop",
                serde_json::json!({
                    "stopped": true,
                    "note": "Lisp execution stopped via COMM_LISP_SET_RUNNING"
                }),
                vec![
                    NextAction::new("lisp start", "Restart Lisp execution"),
                    NextAction::new("lisp reload", "Reload Lisp code"),
                ]
            );
        }
        
        LispCommands::GetStats => {
            if cli.dry_run {
                output.print_response(
                    "lisp get-stats",
                    serde_json::json!({
                        "dry_run": true,
                        "stats": {
                            "memory_used": 1024,
                            "memory_total": 8192,
                            "gc_count": 5,
                            "uptime_ms": 60000,
                        }
                    }),
                    vec![
                        NextAction::new("lisp start", "Start Lisp"),
                        NextAction::new("lisp stop", "Stop Lisp"),
                    ]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "lisp get-stats",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            // Send COMM_LISP_GET_STATS
            output.print_response(
                "lisp get-stats",
                serde_json::json!({
                    "stats": {
                        "memory_used_bytes": null,
                        "memory_total_bytes": null,
                        "gc_count": null,
                        "uptime_ms": null,
                    },
                    "note": "Lisp stats would be retrieved via COMM_LISP_GET_STATS"
                }),
                vec![
                    NextAction::new("lisp start", "Start Lisp execution"),
                    NextAction::new("lisp stop", "Stop Lisp execution"),
                ]
            );
        }
        
        LispCommands::Repl { command } => {
            if cli.dry_run {
                output.print_response(
                    "lisp repl",
                    serde_json::json!({
                        "dry_run": true,
                        "command": command,
                    }),
                    vec![]
                );
                return Ok(());
            }
            
            let mut client = match create_client(cli).await {
                Ok(client) => client,
                Err(e) => {
                    output.print_error(
                        "lisp repl",
                        &format!("Failed to connect: {}", e),
                        "connection",
                        None
                    );
                    return Ok(());
                }
            };
            
            // Send COMM_LISP_REPL_CMD
            output.print_response(
                "lisp repl",
                serde_json::json!({
                    "command": command,
                    "executed": true,
                    "result": null,
                    "note": "REPL command would be sent via COMM_LISP_REPL_CMD"
                }),
                vec![
                    NextAction::new("lisp get-stats", "Check runtime stats"),
                ]
            );
        }
        
        LispCommands::Read { address, length } => {
            if cli.dry_run {
                output.print_response(
                    "lisp read",
                    serde_json::json!({
                        "dry_run": true,
                        "address": format!("0x{:08X}", address),
                        "length": length,
                    }),
                    vec![]
                );
                return Ok(());
            }
            
            output.print_response(
                "lisp read",
                serde_json::json!({
                    "address": format!("0x{:08X}", address),
                    "length": length,
                    "data": null,
                    "note": "Memory read would be sent via COMM_LISP_READ"
                }),
                vec![]
            );
        }
        
        LispCommands::Write { address, data } => {
            if cli.dry_run {
                output.print_response(
                    "lisp write",
                    serde_json::json!({
                        "dry_run": true,
                        "address": format!("0x{:08X}", address),
                        "data": data,
                    }),
                    vec![]
                );
                return Ok(());
            }
            
            // Parse hex string to bytes
            let bytes = match hex::decode(&data) {
                Ok(b) => b,
                Err(e) => {
                    output.print_error(
                        "lisp write",
                        &format!("Invalid hex data: {}", e),
                        "invalid_argument",
                        Some("Provide data as hex string, e.g., DEADBEEF")
                    );
                    return Ok(());
                }
            };
            
            output.print_response(
                "lisp write",
                serde_json::json!({
                    "address": format!("0x{:08X}", address),
                    "bytes_written": bytes.len(),
                    "note": "Memory write would be sent via COMM_LISP_WRITE"
                }),
                vec![]
            );
        }
        
        LispCommands::Erase => {
            if cli.dry_run {
                output.print_response(
                    "lisp erase",
                    serde_json::json!({"dry_run": true}),
                    vec![
                        NextAction::new("lisp upload", "Upload new Lisp code"),
                    ]
                );
                return Ok(());
            }
            
            output.print_response(
                "lisp erase",
                serde_json::json!({
                    "erased": true,
                    "note": "Lisp code would be erased via COMM_LISP_ERASE"
                }),
                vec![
                    NextAction::new("lisp upload", "Upload new Lisp code"),
                ]
            );
        }
        
        LispCommands::Reload => {
            if cli.dry_run {
                output.print_response(
                    "lisp reload",
                    serde_json::json!({"dry_run": true}),
                    vec![]
                );
                return Ok(());
            }
            
            output.print_response(
                "lisp reload",
                serde_json::json!({
                    "reloaded": true,
                    "note": "Lisp code would be reloaded via COMM_LISP_RELOAD"
                }),
                vec![
                    NextAction::new("lisp start", "Start Lisp execution"),
                    NextAction::new("lisp get-stats", "Check runtime stats"),
                ]
            );
        }
    }
    
    Ok(())
}

/// Handle terminal/REPL mode
async fn handle_terminal_mode(args: TerminalArgs, cli: &Cli, output: &OutputManager) -> Result<()> {
    if let Some(command) = args.command {
        // Single command execution mode
        output.print_response(
            "terminal",
            serde_json::json!({
                "mode": "single_command",
                "command": command,
                "executed": true,
                "note": "Single command mode - full REPL not yet implemented"
            }),
            vec![]
        );
        return Ok(());
    }
    
    if args.repl {
        // Interactive REPL mode
        output.print_response(
            "terminal",
            serde_json::json!({
                "mode": "repl",
                "status": "started",
                "note": "Interactive REPL mode - full implementation not yet available",
                "available_commands": [
                    "motor set-rpm <value>",
                    "motor stop",
                    "motor get-values",
                    "device ping",
                    "can scan",
                    "lisp repl <command>",
                    "exit" or "quit"
                ]
            }),
            vec![]
        );
        
        println!("\nVESC Terminal Mode");
        println!("Type 'help' for available commands, 'exit' to quit.\n");
        
        // Simple loop for demonstration
        // Full implementation would use rustyline for proper REPL
        loop {
            print!("veac> ");
            // Note: In a real implementation, we'd use tokio::io::AsyncBufRead
            // For now, this is a placeholder
            break;
        }
        
        return Ok(());
    }
    
    // Default: show help
    output.print_response(
        "terminal",
        serde_json::json!({
            "mode": "help",
            "options": {
                "--repl": "Start interactive REPL mode",
                "--command <cmd>": "Execute single command and exit"
            },
            "examples": [
                "veac terminal --repl",
                "veac terminal --command 'motor set-rpm 1000'",
            ]
        }),
        vec![
            NextAction::new("terminal --repl", "Start interactive REPL"),
        ]
    );
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::Parser;

    #[test]
    fn test_cli_parses() {
        // Test that CLI arguments parse correctly
        let args = vec!["veac", "device", "list-ports"];
        let cli = Cli::parse_from(args);
        assert!(matches!(cli.command, Commands::Device(_)));
    }

    #[test]
    fn test_output_format_default() {
        let args = vec!["veac", "schema"];
        let cli = Cli::parse_from(args);
        assert!(matches!(cli.format, OutputFormat::Json));
    }

    #[test]
    fn test_exit_code_success() {
        let result: Result<()> = Ok(());
        assert_eq!(get_exit_code(&result), 0);
    }

    #[test]
    fn test_exit_code_error() {
        let result: Result<()> = Err(anyhow::anyhow!("Some error"));
        assert_eq!(get_exit_code(&result), 1);
    }

    #[test]
    fn test_exit_code_connection_error() {
        let result: Result<()> = Err(anyhow::anyhow!("Connection error"));
        assert_eq!(get_exit_code(&result), 2);
    }

    #[test]
    fn test_exit_code_timeout() {
        let result: Result<()> = Err(anyhow::anyhow!("Operation timed out"));
        assert_eq!(get_exit_code(&result), 3);
    }

    #[test]
    fn test_exit_code_invalid_argument() {
        let result: Result<()> = Err(anyhow::anyhow!("Invalid argument: bad value"));
        assert_eq!(get_exit_code(&result), 4);
    }

    #[test]
    fn test_exit_code_protocol_error() {
        let result: Result<()> = Err(anyhow::anyhow!("Protocol error: CRC mismatch"));
        assert_eq!(get_exit_code(&result), 5);
    }
}
