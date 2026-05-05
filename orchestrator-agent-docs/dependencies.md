# Dependencies

## Core Dependencies

### CLI Framework

```toml
[dependencies]
# CLI framework with derive macros, subcommands, and help generation
clap = { version = "4.5", features = ["derive", "cargo", "env"] }
```

**Purpose**: Command-line argument parsing, subcommand handling, automatic help generation, shell completion support.

**Why clap**: Industry standard for Rust CLIs, derive macros reduce boilerplate, excellent documentation.

### Serialization

```toml
[dependencies]
# JSON/YAML serialization framework
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
serde_yaml = "0.9"
```

**Purpose**: Structured output formatting (JSON/YAML), configuration file parsing.

**Why serde**: De facto standard for Rust serialization, zero-cost abstractions, extensive ecosystem.

### Serial Communication

```toml
[dependencies]
# Async serial port communication
tokio-serial = "5.4"

# Alternative: synchronous serial (backup option)
serialport = "4.3"
```

**Purpose**: Serial port I/O for USB CDC/UART communication with VESC.

**Why tokio-serial**: Async support integrates with tokio runtime, non-blocking I/O for real-time operations.

### Async Runtime

```toml
[dependencies]
# Async runtime with full features
tokio = { version = "1.35", features = ["full"] }
tokio-util = "0.7"
```

**Purpose**: Async/await support, timeouts, channels for streaming data.

**Why tokio**: Most popular Rust async runtime, excellent performance, rich ecosystem.

### Output Formatting

```toml
[dependencies]
# Table formatting for human-readable output
tabled = "0.14"

# Terminal color support
colored = "2.1"

# TTY detection for auto-format
atty = "0.2"
```

**Purpose**: Human-friendly table output, colored terminal output, automatic JSON detection when piped.

### Error Handling

```toml
[dependencies]
# Flexible error handling with context
anyhow = "1.0"

# Structured error types with thiserror derive
thiserror = "1.0"
```

**Purpose**: Application-level error handling (`anyhow`), library error types (`thiserror`).

**Why**: `anyhow` for easy error propagation in application code, `thiserror` for defining rich error types in libraries.

### CRC Calculation

```toml
[dependencies]
# CRC calculation for packet validation
crc = "3.0"
```

**Purpose**: IBM SDLC CRC16 calculation for VESC packet framing.

### XML Parsing

```toml
[dependencies]
# XML serialization/deserialization for config files
quick-xml = { version = "0.31", features = ["serialize"] }
```

**Purpose**: Reading/writing VESC configuration XML files.

### Logging

```toml
[dependencies]
# Structured logging
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
```

**Purpose**: Debug logging, structured traces for troubleshooting.

## Development Dependencies

```toml
[dev-dependencies]
# CLI testing framework
assert_cmd = "2.0"

# Predicate assertions for testing
predicates = "3.1"

# Temporary file/directory management
tempfile = "3.9"

# Pretty assertions for better test output
pretty_assertions = "1.4"
```

## Optional Dependencies (Future)

```toml
[dependencies]
# Bluetooth support (optional feature)
# btleplug = "0.11"

# USB HID support for direct USB (optional feature)
# hidapi = "2.4"

# TCP/UDP networking for TCP hub (optional feature)
# tokio-tungstenite = "0.21"  # WebSocket

# Configuration file support (optional)
# config = "0.14"
# dirs = "5.0"  # Platform-appropriate config directories

# Progress bars for long operations (optional)
# indicatif = "0.17"
```

## Complete Cargo.toml Example

```toml
[package]
name = "vesc-cli"
version = "0.1.0"
edition = "2021"
authors = ["Your Name <email@example.com>"]
license = "GPL-3.0"
description = "CLI for VESC motor controllers"
repository = "https://github.com/yourusername/vesc-cli"
keywords = ["vesc", "motor", "cli", "embedded"]
categories = ["command-line-utilities", "hardware-support"]
rust-version = "1.70"

[[bin]]
name = "vesc-cli"
path = "src/main.rs"

[dependencies]
# CLI
clap = { version = "4.5", features = ["derive", "cargo", "env"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
serde_yaml = "0.9"

# Async runtime
tokio = { version = "1.35", features = ["full"] }
tokio-util = "0.7"

# Serial communication
tokio-serial = "5.4"

# Output formatting
tabled = "0.14"
colored = "2.1"
atty = "0.2"

# Error handling
anyhow = "1.0"
thiserror = "1.0"

# CRC calculation
crc = "3.0"

# XML parsing
quick-xml = { version = "0.31", features = ["serialize"] }

# Logging
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }

[dev-dependencies]
assert_cmd = "2.0"
predicates = "3.1"
tempfile = "3.9"
pretty_assertions = "1.4"

[features]
default = []
# usb-direct = ["hidapi"]  # Future: direct USB HID support
# bluetooth = ["btleplug"]  # Future: BLE support

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = true
panic = "abort"

[profile.dev]
opt-level = 0
debug = true
```

## Version Constraints

| Crate | Min Version | Notes |
|-------|-------------|-------|
| clap | 4.5 | Derive macros stable |
| serde | 1.0 | Stable API |
| tokio | 1.35 | Full features needed |
| tokio-serial | 5.4 | Async serial stable |
| crc | 3.0 | Latest API |
| quick-xml | 0.31 | Serialize feature needed |

## Feature Flags

Future optional features:

```rust
// In code
#[cfg(feature = "bluetooth")]
pub mod bluetooth;

#[cfg(feature = "usb-direct")]
pub mod usb_hid;
```

## Security Considerations

All dependencies are:
- **Widely used**: Popular crates with large user bases
- **Actively maintained**: Recent releases within last 6 months
- **Audited**: Available on crates.io with downloads/versions tracked

Run `cargo audit` regularly to check for security advisories.
