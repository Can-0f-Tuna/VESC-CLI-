//! Error Handling
//!
//! This module defines custom error types for the VESC CLI application.

use thiserror::Error;

/// VESC CLI error types
#[derive(Error, Debug)]
pub enum VescError {
    /// Serial communication error
    #[error("Serial communication error: {0}")]
    SerialError(String),

    /// Protocol error (invalid packet, CRC mismatch, etc.)
    #[error("Protocol error: {0}")]
    ProtocolError(String),

    /// Connection error
    #[error("Connection error: {0}")]
    ConnectionError(String),

    /// Command error (invalid command, execution failed)
    #[error("Command error: {0}")]
    CommandError(String),

    /// Timeout error
    #[error("Operation timed out")]
    Timeout,

    /// Invalid argument
    #[error("Invalid argument: {0}")]
    InvalidArgument(String),
}

/// Result type alias for VESC operations
pub type VescResult<T> = Result<T, VescError>;

/// Convert serialport errors to VescError
impl From<tokio_serial::Error> for VescError {
    fn from(err: tokio_serial::Error) -> Self {
        VescError::SerialError(err.to_string())
    }
}
