# Conventions

## Rust Coding Standards

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Modules | `snake_case` | `vesc_protocol`, `motor_commands` |
| Types (structs/enums) | `PascalCase` | `VescConnection`, `CommandId` |
| Traits | `PascalCase` | `Serializable`, `Connectable` |
| Functions | `snake_case` | `encode_packet`, `get_values` |
| Variables | `snake_case` | `port_name`, `baud_rate` |
| Constants | `SCREAMING_SNAKE_CASE` | `PACKET_MAX_LEN`, `DEFAULT_BAUD` |
| Static variables | `SCREAMING_SNAKE_CASE` | `CRC_TABLE` |
| Enum variants | `PascalCase` | `GetValues`, `SetRpm` |
| Type parameters | `PascalCase`, short | `T`, `K`, `V` |
| Lifetimes | `snake_case`, short | `'a`, `'b`, `'conn` |
| Features | `snake_case` | `async-runtime`, `usb-support` |

### Code Organization

```rust
// 1. Module documentation
//! VESC Protocol Implementation
//!
//! Handles packet framing, CRC calculation, and command serialization.

// 2. Imports (grouped: std, external, crate, super)
use std::io;
use std::time::Duration;

use tokio::io::{AsyncReadExt, AsyncWriteExt};
use anyhow::{Result, Context};

use crate::error::VescError;
use super::commands::Command;

// 3. Constants
const PACKET_MAX_LEN: usize = 512;
const DEFAULT_BAUD: u32 = 115200;

// 4. Type definitions
pub type PacketData = Vec<u8>;

// 5. Struct definitions with derives
#[derive(Debug, Clone, PartialEq)]
pub struct Packet {
    payload: Vec<u8>,
}

// 6. Trait implementations
impl Default for Packet {
    fn default() -> Self {
        Self { payload: Vec::new() }
    }
}

// 7. Inherent implementations
impl Packet {
    /// Create a new packet with the given payload.
    ///
    /// # Errors
    /// Returns `ProtocolError::PacketTooLarge` if payload exceeds 512 bytes.
    pub fn new(payload: Vec<u8>) -> Result<Self, ProtocolError> {
        if payload.len() > PACKET_MAX_LEN {
            return Err(ProtocolError::PacketTooLarge(payload.len()));
        }
        Ok(Self { payload })
    }

    /// Encode packet into framed bytes.
    pub fn encode(&self) -> Vec<u8> {
        // Implementation
    }
}

// 8. Functions
fn calculate_crc(data: &[u8]) -> u16 {
    // Implementation
}

// 9. Tests
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_packet_encode() {
        // Test implementation
    }
}
```

### Documentation Style

```rust
/// Brief description of the item.
///
/// Longer description with more context, explaining what the function does,
/// when to use it, and any important edge cases.
///
/// # Arguments
///
/// * `param1` - Description of first parameter
/// * `param2` - Description of second parameter
///
/// # Returns
///
/// Description of the return value.
///
/// # Errors
///
/// Description of error conditions and when they occur.
///
/// # Examples
///
/// ```rust
/// let result = my_function(42, "hello");
/// assert_eq!(result, expected);
/// ```
///
/// # Panics
///
/// Description of panic conditions (if applicable).
pub fn my_function(param1: i32, param2: &str) -> Result<String, MyError> {
    // Implementation
}
```

### Error Handling

```rust
// Use thiserror for error types
use thiserror::Error;

#[derive(Error, Debug)]
pub enum VescError {
    #[error("Connection failed to {port}: {source}")]
    ConnectionFailed {
        port: String,
        #[source]
        source: io::Error,
    },

    #[error("Command timed out after {timeout_ms}ms")]
    Timeout { timeout_ms: u64 },

    #[error("Protocol error: {0}")]
    Protocol(#[from] ProtocolError),

    #[error("Invalid argument: {0}")]
    InvalidArgument(String),
}

// Use anyhow for application-level error handling
use anyhow::{Result, Context};

pub async fn connect(port: &str) -> Result<VescConnection> {
    let stream = tokio_serial::new(port, 115200)
        .open_native_async()
        .with_context(|| format!("Failed to open serial port {}", port))?;

    Ok(VescConnection::new(stream))
}
```

### Async Patterns

```rust
// Prefer async/await over manual futures
pub async fn send_command(&mut self, cmd: Command) -> Result<Response> {
    let packet = cmd.to_packet();
    self.stream.write_all(&packet.encode()).await?;
    self.stream.flush().await?;
    
    // Use timeout for operations that may hang
    let response = tokio::time::timeout(
        Duration::from_millis(self.timeout_ms),
        self.read_response()
    ).await??;
    
    Ok(response)
}

// Use channels for streaming data
use tokio::sync::mpsc;

pub async fn stream_values(
    &mut self,
    tx: mpsc::Sender<McValues>,
) -> Result<()> {
    loop {
        let values = self.get_values().await?;
        if tx.send(values).await.is_err() {
            break; // Receiver dropped
        }
    }
    Ok(())
}
```

### Clap Argument Definitions

```rust
use clap::{Parser, Subcommand, Args};

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

    /// Output format
    #[arg(short, long, global = true, default_value = "auto")]
    pub format: OutputFormat,
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
}

#[derive(Args)]
pub struct SetRpmArgs {
    /// Target RPM
    pub rpm: i32,

    /// Duration in seconds (optional)
    #[arg(short, long)]
    pub duration: Option<u64>,
}
```

### Test Conventions

```rust
#[cfg(test)]
mod tests {
    use super::*;

    // Unit tests
    #[test]
    fn test_packet_encode_decode() {
        let payload = vec![0x04];
        let packet = Packet::new(payload.clone()).unwrap();
        let encoded = packet.encode();
        let (decoded, _) = Packet::decode(&encoded).unwrap().unwrap();
        assert_eq!(decoded.payload, payload);
    }

    // Test error cases
    #[test]
    fn test_packet_too_large() {
        let payload = vec![0u8; 1024];
        let result = Packet::new(payload);
        assert!(matches!(result, Err(ProtocolError::PacketTooLarge(_, _))));
    }

    // Async tests
    #[tokio::test]
    async fn test_connection() {
        let mut conn = VescConnection::new("/dev/null".to_string(), 115200);
        // Test implementation
    }
}

// Integration tests in tests/ directory
#[test]
fn test_cli_help() {
    let mut cmd = Command::cargo_bin("vesc-cli").unwrap();
    cmd.arg("--help");
    cmd.assert()
        .success()
        .stdout(predicate::str::contains("VESC"));
}
```

### Logging and Output

```rust
// Use tracing for structured logging
use tracing::{info, warn, error, debug};

pub async fn connect(&mut self) -> Result<()> {
    info!(port = %self.port_name, baud = self.baud_rate, "Connecting to VESC");
    
    match self.try_connect().await {
        Ok(()) => {
            info!("Connected successfully");
            Ok(())
        }
        Err(e) => {
            error!(error = %e, "Connection failed");
            Err(e)
        }
    }
}

// CLI output goes to stdout/stderr, not logging
pub fn print_json<T: Serialize>(data: &T) {
    println!("{}", serde_json::to_string_pretty(data).unwrap());
}

pub fn eprint_error(err: &VescError) {
    eprintln!("Error: {}", err);
}
```

### Import Ordering

```rust
// 1. Standard library
use std::collections::HashMap;
use std::io;
use std::time::Duration;

// 2. External crates (alphabetical)
use anyhow::{Context, Result};
use clap::Parser;
use serde::{Deserialize, Serialize};
use tokio::time::timeout;
use tokio_serial::SerialStream;

// 3. Internal modules (alphabetical)
use crate::commands::motor::MotorCommands;
use crate::error::VescError;
use crate::vesc::connection::VescConnection;

// 4. Super module (if in submodule)
use super::protocol::Packet;
```

### File Headers

All source files should include:
- Module documentation comment
- License header (SPDX identifier)

```rust
//! VESC Protocol Implementation
//!
//! Implements packet framing and CRC for VESC communication.
//!
//! SPDX-License-Identifier: GPL-3.0

// ... imports and code
```

## Git Conventions

### Commit Messages

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/tooling changes

Examples:
```
feat(protocol): add support for long packets (>255 bytes)

fix(connection): handle serial port disconnect during read

docs(readme): update installation instructions

test(motor): add integration tests for set-rpm command
```
