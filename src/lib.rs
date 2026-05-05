//! VESC AI-Controllable CLI Library
//!
//! This library provides programmatic access to VESC motor controller
//! communication via serial port.
//!
//! ## Features
//!
//! - **Protocol Implementation**: Binary packet framing with CRC16
//! - **Async Serial Communication**: Non-blocking I/O with Tokio
//! - **Command Interface**: High-level VESC commands (RPM, current, duty cycle)
//! - **Auto-Detection**: Automatic VESC discovery on available ports
//! - **CLI Module**: Agent-first CLI design with HATEOAS

pub mod cli;
pub mod error;
pub mod vesc;

// Re-export commonly used types for convenience
pub use vesc::{
    VescClient,
    VescConnection,
    VescCommand,
    ConnectionError,
    FirmwareInfo,
    PortInfo,
    FirmwareVersion,
    list_ports,
    auto_detect_port,
    auto_detect_port_with_timeout,
    DEFAULT_BAUD_RATE,
    DEFAULT_TIMEOUT,
};

pub use cli::{
    Cli,
    Commands,
    DeviceArgs,
    DeviceCommands,
    MotorArgs,
    MotorCommands,
    ConfigArgs,
    ConfigCommands,
    OutputFormat,
    OutputManager,
    NextAction,
};
