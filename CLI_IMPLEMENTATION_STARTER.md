# VESC CLI Implementation Starter

This document provides concrete code examples to start the VESC CLI implementation in Rust.

## Project Setup

### 1. Create Rust Project
```bash
cargo new vesc-cli --bin
cd vesc-cli
```

### 2. Add Dependencies (Cargo.toml)
```toml
[package]
name = "vesc-cli"
version = "0.1.0"
edition = "2021"

[dependencies]
# CLI framework
clap = { version = "4.5", features = ["derive", "cargo"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
serde_yaml = "0.9"

# Serial communication
tokio-serial = "5.4"
serialport = "4.3"

# Async runtime
tokio = { version = "1.35", features = ["full"] }

# Output formatting
tabled = "0.14"
colored = "2.1"

# Error handling
anyhow = "1.0"
thiserror = "1.0"

# CRC calculation
crc = "3.0"

# XML parsing for configs
quick-xml = { version = "0.31", features = ["serialize"] }

# Timeouts and duration
tokio-util = "0.7"

[dev-dependencies]
assert_cmd = "2.0"
predicates = "3.1"
```

## Core Protocol Implementation

### src/vesc/protocol.rs
```rust
//! VESC Protocol Implementation
//! 
//! Implements the VESC binary packet protocol:
//! - Short packet: [0x02] [len:1] [payload:N] [CRC16:2] [0x03]
//! - Long packet: [0x03] [len:2] [payload:N] [CRC16:2] [0x03]

use crc::{Crc, CRC_16_IBM_SDLC};
use thiserror::Error;

const CRC16: Crc<u16> = Crc::<u16, &[u8]>::new(&CRC_16_IBM_SDLC);
const PACKET_MAX_PL_LEN: usize = 512;
const START_BYTE_SHORT: u8 = 0x02;
const START_BYTE_LONG: u8 = 0x03;
const STOP_BYTE: u8 = 0x03;

#[derive(Debug, Error)]
pub enum ProtocolError {
    #[error("Packet too large: {0} bytes (max {1})")]
    PacketTooLarge(usize, usize),
    #[error("Invalid start byte: {0}")]
    InvalidStartByte(u8),
    #[error("CRC mismatch: expected {expected}, got {actual}")]
    CrcMismatch { expected: u16, actual: u16 },
    #[error("Incomplete packet")]
    IncompletePacket,
    #[error("Invalid length: {0}")]
    InvalidLength(u16),
}

/// VESC Packet structure
#[derive(Debug, Clone, PartialEq)]
pub struct Packet {
    pub payload: Vec<u8>,
}

impl Packet {
    /// Create a new packet with the given payload
    pub fn new(payload: Vec<u8>) -> Result<Self, ProtocolError> {
        if payload.len() > PACKET_MAX_PL_LEN {
            return Err(ProtocolError::PacketTooLarge(payload.len(), PACKET_MAX_PL_LEN));
        }
        Ok(Self { payload })
    }
    
    /// Create packet from command ID and data
    pub fn from_command(command_id: u8, data: &[u8]) -> Result<Self, ProtocolError> {
        let mut payload = vec![command_id];
        payload.extend_from_slice(data);
        Self::new(payload)
    }
    
    /// Encode packet to bytes for transmission
    pub fn encode(&self) -> Vec<u8> {
        let len = self.payload.len();
        let mut frame = Vec::with_capacity(len + 6);
        
        if len <= 255 {
            // Short packet
            frame.push(START_BYTE_SHORT);
            frame.push(len as u8);
        } else {
            // Long packet
            frame.push(START_BYTE_LONG);
            frame.extend_from_slice(&(len as u16).to_be_bytes());
        }
        
        // Payload
        frame.extend_from_slice(&self.payload);
        
        // CRC16 (big-endian)
        let crc = CRC16.checksum(&self.payload);
        frame.extend_from_slice(&crc.to_be_bytes());
        
        // Stop byte
        frame.push(STOP_BYTE);
        
        frame
    }
    
    /// Decode packet from received bytes
    /// Returns (packet, bytes_consumed) or None if incomplete
    pub fn decode(data: &[u8]) -> Result<Option<(Self, usize)>, ProtocolError> {
        if data.is_empty() {
            return Ok(None);
        }
        
        let start_byte = data[0];
        let (length, header_len): (usize, usize) = match start_byte {
            START_BYTE_SHORT => {
                if data.len() < 2 {
                    return Ok(None); // Need more data
                }
                (data[1] as usize, 2)
            }
            START_BYTE_LONG => {
                if data.len() < 3 {
                    return Ok(None); // Need more data
                }
                let len = u16::from_be_bytes([data[1], data[2]]) as usize;
                (len, 3)
            }
            _ => return Err(ProtocolError::InvalidStartByte(start_byte)),
        };
        
        // Check if we have complete packet
        let total_len = header_len + length + 3; // header + payload + CRC + stop
        if data.len() < total_len {
            return Ok(None); // Need more data
        }
        
        // Extract payload
        let payload_start = header_len;
        let payload_end = payload_start + length;
        let payload = data[payload_start..payload_end].to_vec();
        
        // Verify CRC
        let crc_start = payload_end;
        let expected_crc = u16::from_be_bytes([data[crc_start], data[crc_start + 1]]);
        let actual_crc = CRC16.checksum(&payload);
        if expected_crc != actual_crc {
            return Err(ProtocolError::CrcMismatch {
                expected: expected_crc,
                actual: actual_crc,
            });
        }
        
        // Verify stop byte
        let stop_byte = data[crc_start + 2];
        if stop_byte != STOP_BYTE {
            // Some implementations may not strictly require this
            // but it's good to check
        }
        
        Ok(Some((Packet::new(payload)?, total_len)))
    }
    
    /// Get command ID from payload
    pub fn command_id(&self) -> Option<u8> {
        self.payload.first().copied()
    }
    
    /// Get data portion (excluding command ID)
    pub fn data(&self) -> &[u8] {
        if self.payload.len() > 1 {
            &self.payload[1..]
        } else {
            &[]
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_encode_decode_short() {
        let payload = vec![0x04]; // COMM_GET_VALUES
        let packet = Packet::new(payload.clone()).unwrap();
        let encoded = packet.encode();
        
        assert_eq!(encoded[0], START_BYTE_SHORT);
        assert_eq!(encoded[1], 1); // length
        assert_eq!(encoded[2], 0x04); // command
        assert_eq!(encoded.last(), Some(&STOP_BYTE));
        
        // Decode
        let (decoded, consumed) = Packet::decode(&encoded).unwrap().unwrap();
        assert_eq!(consumed, encoded.len());
        assert_eq!(decoded.payload, payload);
    }
    
    #[test]
    fn test_encode_decode_with_data() {
        let command_id = 0x06; // COMM_SET_CURRENT
        let current = 10.5f32;
        let current_scaled = (current * 1000.0) as i32;
        let data = current_scaled.to_be_bytes();
        
        let packet = Packet::from_command(command_id, &data).unwrap();
        let encoded = packet.encode();
        
        let (decoded, _) = Packet::decode(&encoded).unwrap().unwrap();
        assert_eq!(decoded.command_id(), Some(command_id));
        assert_eq!(decoded.data(), &data);
    }
}
```

### src/vesc/commands.rs
```rust
//! VESC Command Definitions
//! 
//! Defines all VESC commands from datatypes.h

use crate::vesc::protocol::Packet;

// Command IDs from datatypes.h
#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum CommandId {
    CommFwVersion = 0,
    CommJumpToBootloader = 1,
    CommEraseNewApp = 2,
    CommWriteNewAppData = 3,
    CommGetValues = 4,
    CommSetDuty = 5,
    CommSetCurrent = 6,
    CommSetCurrentBrake = 7,
    CommSetRpm = 8,
    CommSetPos = 9,
    CommSetHandbrake = 10,
    CommSetDetect = 11,
    CommSetServoPos = 12,
    CommSetMcconf = 13,
    CommGetMcconf = 14,
    CommGetMcconfDefault = 15,
    CommSetAppConf = 16,
    CommGetAppConf = 17,
    CommGetAppConfDefault = 18,
    CommSamplePrint = 19,
    CommTerminalCmd = 20,
    CommPrint = 21,
    CommReboot = 29,
    CommAlive = 30,
    // ... add more as needed
}

/// High-level command definitions
#[derive(Debug, Clone)]
pub enum Command {
    // Info commands
    GetFwVersion,
    GetValues,
    
    // Motor control
    SetDuty(f64),           // -1.0 to 1.0
    SetCurrent(f64),        // Amperes
    SetCurrentBrake(f64),   // Amperes
    SetRpm(i32),            // ERPM
    SetPos(f64),            // Position in degrees
    SetHandbrake(f64),      // Current in amperes
    Stop,
    
    // Config
    GetMcConf,
    SetMcConf(Vec<u8>),     // Serialized config
    GetAppConf,
    SetAppConf(Vec<u8>),    // Serialized config
    
    // System
    Reboot,
    SendAlive,
    TerminalCmd(String),
}

impl Command {
    /// Convert command to packet
    pub fn to_packet(&self) -> Packet {
        match self {
            Command::GetFwVersion => {
                Packet::from_command(CommandId::CommFwVersion as u8, &[]).unwrap()
            }
            Command::GetValues => {
                Packet::from_command(CommandId::CommGetValues as u8, &[]).unwrap()
            }
            Command::SetDuty(duty) => {
                let scaled = (*duty * 100000.0) as i32;
                Packet::from_command(
                    CommandId::CommSetDuty as u8,
                    &scaled.to_be_bytes()
                ).unwrap()
            }
            Command::SetCurrent(current) => {
                let scaled = (*current * 1000.0) as i32;
                Packet::from_command(
                    CommandId::CommSetCurrent as u8,
                    &scaled.to_be_bytes()
                ).unwrap()
            }
            Command::SetCurrentBrake(current) => {
                let scaled = (*current * 1000.0) as i32;
                Packet::from_command(
                    CommandId::CommSetCurrentBrake as u8,
                    &scaled.to_be_bytes()
                ).unwrap()
            }
            Command::SetRpm(rpm) => {
                Packet::from_command(
                    CommandId::CommSetRpm as u8,
                    &rpm.to_be_bytes()
                ).unwrap()
            }
            Command::Stop => {
                // Set current to 0
                Packet::from_command(
                    CommandId::CommSetCurrent as u8,
                    &0i32.to_be_bytes()
                ).unwrap()
            }
            Command::Reboot => {
                Packet::from_command(CommandId::CommReboot as u8, &[]).unwrap()
            }
            Command::SendAlive => {
                Packet::from_command(CommandId::CommAlive as u8, &[]).unwrap()
            }
            Command::TerminalCmd(cmd) => {
                let mut data = cmd.as_bytes().to_vec();
                data.push(0); // Null terminator
                Packet::from_command(CommandId::CommTerminalCmd as u8, &data).unwrap()
            }
            _ => unimplemented!(),
        }
    }
}

/// Response types
#[derive(Debug, Clone)]
pub enum Response {
    FwVersion {
        major: u8,
        minor: u8,
        name: String,
        hw_name: String,
        uuid: Vec<u8>,
    },
    Values(McValues),
    McConf(Vec<u8>),
    AppConf(Vec<u8>),
    Ack(String),
    Print(String),
    Error(String),
}

/// Motor controller values (from MC_VALUES in datatypes.h)
#[derive(Debug, Clone, Default)]
pub struct McValues {
    pub v_in: f64,
    pub temp_mos: f64,
    pub temp_mos_1: f64,
    pub temp_mos_2: f64,
    pub temp_mos_3: f64,
    pub temp_motor: f64,
    pub current_motor: f64,
    pub current_in: f64,
    pub id: f64,
    pub iq: f64,
    pub rpm: f64,
    pub duty_now: f64,
    pub amp_hours: f64,
    pub amp_hours_charged: f64,
    pub watt_hours: f64,
    pub watt_hours_charged: f64,
    pub tachometer: i32,
    pub tachometer_abs: i32,
    pub position: f64,
    pub fault_code: u8,
    pub vesc_id: u8,
    pub vd: f64,
    pub vq: f64,
}

impl McValues {
    /// Parse MC_VALUES from response packet data
    pub fn from_bytes(data: &[u8]) -> Option<Self> {
        // This is a simplified parser - full implementation would parse
        // the binary format as defined in the VESC protocol
        // For now, returning default
        Some(Self::default())
    }
}
```

### src/vesc/connection.rs
```rust
//! VESC Serial Connection

use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio_serial::{SerialPortBuilderExt, SerialStream};
use tokio::time::{timeout, Duration};
use anyhow::{Result, Context};

use crate::vesc::protocol::{Packet, ProtocolError};
use crate::vesc::commands::{Command, Response};

pub struct VescConnection {
    port_name: String,
    baud_rate: u32,
    stream: Option<SerialStream>,
    read_buffer: Vec<u8>,
}

impl VescConnection {
    pub fn new(port_name: String, baud_rate: u32) -> Self {
        Self {
            port_name,
            baud_rate,
            stream: None,
            read_buffer: Vec::with_capacity(1024),
        }
    }
    
    pub async fn connect(&mut self) -> Result<()> {
        let stream = tokio_serial::new(&self.port_name, self.baud_rate)
            .open_native_async()
            .with_context(|| format!("Failed to open serial port {}", self.port_name))?;
        
        self.stream = Some(stream);
        Ok(())
    }
    
    pub fn is_connected(&self) -> bool {
        self.stream.is_some()
    }
    
    pub async fn disconnect(&mut self) -> Result<()> {
        self.stream = None;
        Ok(())
    }
    
    /// Send command and wait for response
    pub async fn send_command(
        &mut self,
        cmd: Command,
        timeout_ms: u64
    ) -> Result<Response> {
        let stream = self.stream.as_mut()
            .context("Not connected")?;
        
        // Encode and send packet
        let packet = cmd.to_packet();
        let data = packet.encode();
        
        stream.write_all(&data).await
            .context("Failed to write to serial port")?;
        stream.flush().await
            .context("Failed to flush serial port")?;
        
        // Wait for response with timeout
        let response = timeout(
            Duration::from_millis(timeout_ms),
            self.read_response()
        ).await
            .context("Command timed out")??;
        
        Ok(response)
    }
    
    async fn read_response(&mut self) -> Result<Response> {
        let stream = self.stream.as_mut()
            .context("Not connected")?;
        
        loop {
            // Try to parse existing buffer
            match Packet::decode(&self.read_buffer) {
                Ok(Some((packet, consumed))) => {
                    self.read_buffer.drain(0..consumed);
                    return self.parse_response(packet);
                }
                Ok(None) => {
                    // Need more data
                }
                Err(e) => {
                    // Protocol error - clear buffer and retry
                    eprintln!("Protocol error: {}, clearing buffer", e);
                    self.read_buffer.clear();
                }
            }
            
            // Read more data
            let mut temp_buf = [0u8; 256];
            let n = stream.read(&mut temp_buf).await
                .context("Failed to read from serial port")?;
            
            if n == 0 {
                return Err(anyhow::anyhow!("Serial port closed"));
            }
            
            self.read_buffer.extend_from_slice(&temp_buf[..n]);
        }
    }
    
    fn parse_response(&self, packet: Packet) -> Result<Response> {
        let cmd_id = packet.command_id()
            .context("Empty packet")?;
        let data = packet.data();
        
        match cmd_id {
            0 => {
                // COMM_FW_VERSION response
                if data.len() < 3 {
                    return Err(anyhow::anyhow!("Incomplete FW version response"));
                }
                Ok(Response::FwVersion {
                    major: data[0],
                    minor: data[1],
                    name: String::new(), // Parse from remaining data
                    hw_name: String::new(),
                    uuid: vec![],
                })
            }
            4 => {
                // COMM_GET_VALUES response
                McValues::from_bytes(data)
                    .map(Response::Values)
                    .context("Failed to parse MC_VALUES")
            }
            _ => {
                Ok(Response::Ack(format!("Command {} acknowledged", cmd_id)))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    // Integration tests would go here with a mock VESC
}
```

## CLI Structure

### src/cli/args.rs
```rust
//! CLI Argument Definitions

use clap::{Parser, Subcommand, ValueEnum};

#[derive(Parser)]
#[command(name = "vesc-cli")]
#[command(about = "VESC Motor Controller CLI")]
#[command(version = "0.1.0")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
    
    /// Serial port path (auto-detect if not specified)
    #[arg(short, long, global = true)]
    pub port: Option<String>,
    
    /// CAN bus device ID for forwarding
    #[arg(short = 'c', long, global = true)]
    pub can_id: Option<u8>,
    
    /// Baud rate
    #[arg(short, long, global = true, default_value = "115200")]
    pub baud: u32,
    
    /// Command timeout in milliseconds
    #[arg(short, long, global = true, default_value = "5000")]
    pub timeout: u64,
    
    /// Output format
    #[arg(short, long, global = true, default_value = "auto")]
    pub format: OutputFormat,
    
    /// Dry run - preview without executing
    #[arg(short = 'n', long, global = true)]
    pub dry_run: bool,
    
    /// Skip confirmations
    #[arg(short = 'y', long, global = true)]
    pub yes: bool,
    
    /// Verbose output
    #[arg(short, long, global = true)]
    pub verbose: bool,
}

#[derive(ValueEnum, Clone, Debug, Default)]
pub enum OutputFormat {
    #[default]
    Auto,
    Json,
    Yaml,
    Table,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Device operations
    Device {
        #[command(subcommand)]
        command: DeviceCommands,
    },
    
    /// Motor control
    Motor {
        #[command(subcommand)]
        command: MotorCommands,
    },
    
    /// Configuration management
    Config {
        #[command(subcommand)]
        command: ConfigCommands,
    },
    
    /// Output command schema for AI agents
    Schema {
        /// Command to get schema for (omit for full schema)
        command_path: Option<Vec<String>>,
        
        /// Output format
        #[arg(short, long, default_value = "json")]
        format: OutputFormat,
    },
}

#[derive(Subcommand)]
pub enum DeviceCommands {
    /// List available serial ports
    ListPorts,
    
    /// Connect to VESC
    Connect,
    
    /// Disconnect from VESC
    Disconnect,
    
    /// Get device information
    Info,
    
    /// Ping device to check connectivity
    Ping,
}

#[derive(Subcommand)]
pub enum MotorCommands {
    /// Get motor values (telemetry)
    GetValues,
    
    /// Set motor RPM
    SetRpm {
        /// Target RPM
        rpm: i32,
        
        /// Duration in seconds (optional)
        #[arg(short, long)]
        duration: Option<u64>,
    },
    
    /// Set motor current
    SetCurrent {
        /// Current in amperes
        current: f64,
        
        /// Duration in seconds (optional)
        #[arg(short, long)]
        duration: Option<u64>,
    },
    
    /// Set duty cycle
    SetDuty {
        /// Duty cycle ratio (-1.0 to 1.0)
        duty: f64,
        
        /// Duration in seconds (optional)
        #[arg(short, long)]
        duration: Option<u64>,
    },
    
    /// Stop motor
    Stop,
    
    /// Run motor detection
    Detect {
        /// Detection current in amperes
        #[arg(short, long, default_value = "5.0")]
        current: f64,
        
        /// Minimum RPM
        #[arg(short, long, default_value = "100")]
        min_rpm: f64,
        
        /// Low duty cycle
        #[arg(short, long, default_value = "0.1")]
        low_duty: f64,
    },
}

#[derive(Subcommand)]
pub enum ConfigCommands {
    /// Get motor configuration
    GetMc {
        /// Output file path
        #[arg(short, long)]
        output: Option<String>,
    },
    
    /// Set motor configuration
    SetMc {
        /// Input file path
        #[arg(short, long)]
        input: String,
    },
    
    /// Get application configuration
    GetApp {
        /// Output file path
        #[arg(short, long)]
        output: Option<String>,
    },
    
    /// Set application configuration
    SetApp {
        /// Input file path
        #[arg(short, long)]
        input: String,
    },
    
    /// Backup all configurations
    Backup {
        /// Output file path
        #[arg(short, long, default_value = "vesc-backup.zip")]
        output: String,
    },
    
    /// Restore configurations from backup
    Restore {
        /// Input file path
        #[arg(short, long)]
        input: String,
    },
}
```

### src/main.rs (Starter)
```rust
mod cli;
mod vesc;
mod error;

use clap::Parser;
use anyhow::Result;

use cli::args::{Cli, Commands, OutputFormat};
use vesc::connection::VescConnection;

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    
    // Determine output format
    let use_json = match cli.format {
        OutputFormat::Auto => !atty::is(atty::Stream::Stdout),
        OutputFormat::Json => true,
        OutputFormat::Yaml => false,
        OutputFormat::Table => false,
    };
    
    match cli.command {
        Commands::Schema { command_path, format } => {
            generate_schema(command_path, format)?;
        }
        Commands::Device { command } => {
            handle_device_command(command, cli, use_json).await?;
        }
        Commands::Motor { command } => {
            handle_motor_command(command, cli, use_json).await?;
        }
        Commands::Config { command } => {
            handle_config_command(command, cli, use_json).await?;
        }
    }
    
    Ok(())
}

async fn handle_device_command(
    cmd: cli::args::DeviceCommands,
    cli: Cli,
    use_json: bool
) -> Result<()> {
    match cmd {
        cli::args::DeviceCommands::ListPorts => {
            // List serial ports
            let ports = serialport::available_ports()?;
            if use_json {
                println!("{}", serde_json::to_string_pretty(&ports)?);
            } else {
                for port in ports {
                    println!("{} - {:?}", port.port_name, port.port_type);
                }
            }
        }
        cli::args::DeviceCommands::Connect => {
            let port = cli.port.context("Port required for connect")?;
            let mut conn = VescConnection::new(port, cli.baud);
            conn.connect().await?;
            
            if use_json {
                println!("{{\"connected\": true}}");
            } else {
                println!("Connected to VESC");
            }
        }
        cli::args::DeviceCommands::Info => {
            // Connect and get FW version
            let port = cli.port.context("Port required")?;
            let mut conn = VescConnection::new(port, cli.baud);
            conn.connect().await?;
            
            let response = conn.send_command(
                vesc::commands::Command::GetFwVersion,
                cli.timeout
            ).await?;
            
            if use_json {
                // Serialize response to JSON
                println!("{{\"info\": \"{:?}\"}}", response);
            } else {
                println!("{:?}", response);
            }
        }
        _ => {
            println!("Command not yet implemented");
        }
    }
    
    Ok(())
}

async fn handle_motor_command(
    cmd: cli::args::MotorCommands,
    cli: Cli,
    use_json: bool
) -> Result<()> {
    let port = cli.port.context("Port required for motor commands")?;
    let mut conn = VescConnection::new(port, cli.baud);
    conn.connect().await?;
    
    match cmd {
        cli::args::MotorCommands::GetValues => {
            let response = conn.send_command(
                vesc::commands::Command::GetValues,
                cli.timeout
            ).await?;
            
            if use_json {
                println!("{{\"values\": \"{:?}\"}}", response);
            } else {
                println!("{:?}", response);
            }
        }
        cli::args::MotorCommands::SetRpm { rpm, duration } => {
            if cli.dry_run {
                println!("Would set RPM to {}", rpm);
                return Ok(());
            }
            
            conn.send_command(
                vesc::commands::Command::SetRpm(rpm),
                cli.timeout
            ).await?;
            
            if let Some(dur) = duration {
                tokio::time::sleep(tokio::time::Duration::from_secs(dur)).await;
                conn.send_command(vesc::commands::Command::Stop, cli.timeout).await?;
            }
            
            if use_json {
                println!("{{\"success\": true, \"rpm\": {}}}", rpm);
            } else {
                println!("Motor set to {} RPM", rpm);
            }
        }
        cli::args::MotorCommands::Stop => {
            conn.send_command(vesc::commands::Command::Stop, cli.timeout).await?;
            if use_json {
                println!("{{\"stopped\": true}}");
            } else {
                println!("Motor stopped");
            }
        }
        _ => {
            println!("Motor command not yet implemented");
        }
    }
    
    Ok(())
}

async fn handle_config_command(
    cmd: cli::args::ConfigCommands,
    cli: Cli,
    use_json: bool
) -> Result<()> {
    // Implementation for config commands
    println!("Config commands - implementation pending");
    Ok(())
}

fn generate_schema(
    _command_path: Option<Vec<String>>,
    _format: OutputFormat
) -> Result<()> {
    // Generate and output command schema
    let schema = serde_json::json!({
        "name": "vesc-cli",
        "version": "0.1.0",
        "description": "CLI for VESC motor controllers",
        "commands": [
            {
                "name": "device list-ports",
                "description": "List available serial ports",
                "mutating": false,
                "args": [],
                "output_fields": [
                    {"name": "port_name", "type": "string"},
                    {"name": "port_type", "type": "string"}
                ]
            },
            {
                "name": "motor set-rpm",
                "description": "Set motor RPM",
                "mutating": true,
                "args": [
                    {"name": "rpm", "type": "integer", "required": true},
                    {"name": "duration", "type": "integer", "required": false}
                ],
                "output_fields": [
                    {"name": "success", "type": "boolean"},
                    {"name": "rpm", "type": "integer"}
                ]
            }
        ]
    });
    
    println!("{}", serde_json::to_string_pretty(&schema)?);
    Ok(())
}
```

## Testing

### tests/integration_test.rs
```rust
use assert_cmd::Command;
use predicates::prelude::*;

#[test]
fn test_cli_help() {
    let mut cmd = Command::cargo_bin("vesc-cli").unwrap();
    cmd.arg("--help");
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("VESC Motor Controller CLI"));
}

#[test]
fn test_schema_command() {
    let mut cmd = Command::cargo_bin("vesc-cli").unwrap();
    cmd.arg("schema").arg("--format").arg("json");
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("vesc-cli"));
}

#[test]
fn test_device_list_ports() {
    let mut cmd = Command::cargo_bin("vesc-cli").unwrap();
    cmd.arg("device").arg("list-ports");
    // Should succeed (may return empty list but should not error)
    cmd.assert().success();
}
```

## Next Steps

1. **Set up project**: Run `cargo build` to verify dependencies
2. **Implement protocol tests**: Write unit tests for packet encoding/decoding
3. **Test with real hardware**: Connect to VESC and verify basic commands
4. **Expand command coverage**: Add all 160+ VESC commands
5. **Add config serialization**: Implement XML parsing for configurations
6. **Add motor detection**: Implement parameter detection workflows
7. **Add streaming**: Implement real-time value monitoring
8. **Add CAN support**: Implement CAN bus operations

## Resources

- VESC Protocol: https://vedderb-bldc.mintlify.app/communication/uart-protocol
- Rust Serial: https://docs.rs/tokio-serial/latest/tokio_serial/
- Clap CLI: https://docs.rs/clap/latest/clap/
