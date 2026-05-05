//! CLI Arguments
//!
//! This module defines the command-line argument structure using clap derive macros.
//! Follows a noun-verb pattern for command organization.

use clap::{Parser, Subcommand, Args, ValueEnum};
use std::path::PathBuf;

/// VESC AI-Controllable CLI
#[derive(Parser, Debug)]
#[command(name = "veac")]
#[command(about = "VESC AI-Controllable CLI")]
#[command(version = "0.1.0")]
#[command(propagate_version = true)]
pub struct Cli {
    /// Serial port path (auto-detect if not specified)
    #[arg(short, long, global = true)]
    pub port: Option<String>,
    
    /// Baud rate for serial communication
    #[arg(short, long, global = true, default_value = "115200")]
    pub baud: u32,
    
    /// Output format
    #[arg(short, long, global = true, default_value = "json")]
    pub format: OutputFormat,
    
    /// Dry run - preview without executing
    #[arg(long, global = true)]
    pub dry_run: bool,
    
    /// Enable verbose output
    #[arg(short, long, global = true)]
    pub verbose: bool,
    
    /// Command timeout in milliseconds
    #[arg(short, long, global = true, default_value = "5000")]
    pub timeout: u64,
    
    /// CAN bus device ID for forwarding
    #[arg(short = 'c', long, global = true)]
    pub can_id: Option<u8>,
    
    /// Command to execute
    #[command(subcommand)]
    pub command: Commands,
}

/// Available output formats
#[derive(ValueEnum, Clone, Debug, Default, PartialEq, Eq)]
pub enum OutputFormat {
    /// JSON output (default for non-TTY)
    #[default]
    Json,
    /// Human-readable table format
    Table,
    /// YAML format
    Yaml,
}

/// Available commands following noun-verb pattern
#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Device management commands
    Device(DeviceArgs),
    /// Motor control commands
    Motor(MotorArgs),
    /// Configuration commands
    Config(ConfigArgs),
    /// CAN bus operations for multi-VESC networks
    Can(CanArgs),
    /// LispBM scripting operations
    Lisp(LispArgs),
    /// Show command schema for agent discovery
    Schema(SchemaArgs),
    /// Interactive terminal mode
    Terminal(TerminalArgs),
    /// Generate shell completion scripts
    GenerateCompletions {
        /// Target shell
        #[arg(value_enum)]
        shell: Shell,
    },
}

// ==================== DEVICE COMMANDS ====================

/// Device subcommands
#[derive(Args, Debug)]
pub struct DeviceArgs {
    #[command(subcommand)]
    pub command: DeviceCommands,
}

/// Device command variants
#[derive(Subcommand, Debug)]
pub enum DeviceCommands {
    /// List available serial ports
    ListPorts,
    /// Connect and verify VESC
    Connect,
    /// Get device information (firmware version)
    Info,
    /// Ping VESC to check connectivity
    Ping,
}

// ==================== MOTOR COMMANDS ====================

/// Motor subcommands
#[derive(Args, Debug)]
pub struct MotorArgs {
    #[command(subcommand)]
    pub command: MotorCommands,
}

/// Motor command variants
#[derive(Subcommand, Debug)]
pub enum MotorCommands {
    /// Get real-time motor values (rpm, current, temp, etc.)
    GetValues,
    /// Set motor RPM
    SetRpm {
        /// Target RPM value
        rpm: i32,
        /// Duration in seconds (optional)
        #[arg(short, long)]
        duration: Option<u64>,
    },
    /// Set duty cycle (-1.0 to 1.0)
    SetDuty {
        /// Duty cycle ratio (-1.0 to 1.0)
        duty: f32,
        /// Duration in seconds (optional)
        #[arg(short, long)]
        duration: Option<u64>,
    },
    /// Set motor current in Amps
    SetCurrent {
        /// Current in amperes
        current: f32,
        /// Duration in seconds (optional)
        #[arg(short, long)]
        duration: Option<u64>,
    },
    /// Apply current brake
    SetCurrentBrake {
        /// Brake current in amperes
        current: f32,
        /// Duration in seconds (optional)
        #[arg(short, long)]
        duration: Option<u64>,
    },
    /// Set position (for servo mode)
    SetPos {
        /// Position in degrees
        pos: f32,
    },
    /// Stop motor (set current to 0)
    Stop,
}

// ==================== CONFIG COMMANDS ====================

/// Config subcommands
#[derive(Args, Debug)]
pub struct ConfigArgs {
    #[command(subcommand)]
    pub command: ConfigCommands,
}

/// Config command variants
#[derive(Subcommand, Debug)]
pub enum ConfigCommands {
    /// Read motor configuration
    GetMc {
        /// Output file path
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
    /// Write motor configuration
    SetMc {
        /// Input file path
        file: PathBuf,
    },
    /// Read app configuration
    GetApp {
        /// Output file path
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
    /// Write app configuration
    SetApp {
        /// Input file path
        file: PathBuf,
    },
    /// Backup all configs to file
    Backup {
        /// Output file path
        #[arg(short, long, default_value = "vesc-backup.zip")]
        output: PathBuf,
    },
    /// Restore configs from file
    Restore {
        /// Input file path
        file: PathBuf,
    },
}

// ==================== CAN COMMANDS ====================

/// CAN subcommands
#[derive(Args, Debug)]
pub struct CanArgs {
    #[command(subcommand)]
    pub command: CanCommands,
}

/// CAN command variants
#[derive(Subcommand, Debug)]
pub enum CanCommands {
    /// Set CAN ID for this VESC
    SetId { id: u8 },
    /// Send command to another VESC on CAN bus
    Forward {
        /// Target VESC CAN ID (1-253)
        target_id: u8,
        /// Forward command type
        #[command(subcommand)]
        command: CanForwardCommand,
    },
    /// Scan for VESCs on CAN bus
    Scan,
    /// Get CAN bus status
    Status,
}

/// CAN forward command variants
#[derive(Subcommand, Debug, Clone)]
pub enum CanForwardCommand {
    /// Set motor RPM on target VESC
    SetRpm { 
        /// Target RPM value
        rpm: i32 
    },
    /// Set duty cycle on target VESC
    SetDuty { 
        /// Duty cycle (-1.0 to 1.0)
        duty: f32 
    },
    /// Set current on target VESC
    SetCurrent { 
        /// Current in Amperes
        current: f32 
    },
    /// Apply current brake on target VESC
    SetCurrentBrake { 
        /// Brake current in Amperes
        current: f32 
    },
    /// Get telemetry from target VESC
    GetValues,
    /// Ping target VESC
    Ping,
    /// Reboot target VESC
    Reboot,
}

// ==================== LISP COMMANDS ====================

/// Lisp subcommands
#[derive(Args, Debug)]
pub struct LispArgs {
    #[command(subcommand)]
    pub command: LispCommands,
}

/// Lisp command variants
#[derive(Subcommand, Debug)]
pub enum LispCommands {
    /// Upload Lisp script to VESC
    Upload { file: PathBuf },
    /// Start Lisp script execution
    Start,
    /// Stop Lisp script execution
    Stop,
    /// Get Lisp runtime statistics
    GetStats,
    /// Execute REPL command
    Repl { command: String },
    /// Read Lisp memory
    Read {
        /// Memory address
        address: u32,
        /// Number of bytes to read
        #[arg(short, long, default_value = "64")]
        length: u32,
    },
    /// Write Lisp memory
    Write {
        /// Memory address
        address: u32,
        /// Data to write (hex string, e.g., "DEADBEEF")
        data: String,
    },
    /// Erase Lisp program
    Erase,
    /// Reload Lisp code
    Reload,
}

// ==================== TERMINAL COMMANDS ====================

/// Terminal mode arguments
#[derive(Args, Debug)]
pub struct TerminalArgs {
    /// Run in REPL mode with prompt
    #[arg(short, long)]
    pub repl: bool,
    /// Execute single command and exit
    #[arg(short, long)]
    pub command: Option<String>,
    /// Exit on first error (for scripts)
    #[arg(long)]
    pub exit_on_error: bool,
}

// ==================== SHELL COMPLETION ====================

/// Supported shells for completion generation
#[derive(Debug, Clone, Copy, PartialEq, Eq, ValueEnum)]
pub enum Shell {
    /// Bash shell
    Bash,
    /// Zsh shell
    Zsh,
    /// Fish shell
    Fish,
    /// PowerShell
    PowerShell,
    /// Elvish shell
    Elvish,
}

// ==================== SCHEMA COMMANDS ====================

/// Schema subcommands
#[derive(Args, Debug)]
pub struct SchemaArgs {
    /// Command path to get schema for (e.g., "motor set-rpm")
    pub command_path: Option<Vec<String>>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::CommandFactory;

    #[test]
    fn test_cli_parses() {
        // Verify the CLI structure is valid
        Cli::command().debug_assert();
    }

    #[test]
    fn test_output_format_default() {
        let format = OutputFormat::default();
        assert!(matches!(format, OutputFormat::Json));
    }

    #[test]
    fn test_output_format_variants() {
        assert!(matches!(OutputFormat::Json, OutputFormat::Json));
        assert!(matches!(OutputFormat::Table, OutputFormat::Table));
        assert!(matches!(OutputFormat::Yaml, OutputFormat::Yaml));
    }
}
