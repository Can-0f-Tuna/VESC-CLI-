# File Structure

## Planned Directory Tree

```
veac/
├── Cargo.toml                      # Rust project manifest
├── Cargo.lock                      # Dependency lock file
├── README.md                       # User-facing project README
├── LICENSE                         # GPL v3 license
├── .gitignore                      # Git ignore patterns
│
├── src/                            # Source code
│   ├── main.rs                     # CLI entry point
│   ├── lib.rs                      # Library exports (optional)
│   ├── error.rs                    # Error types and exit codes
│   │
│   ├── cli/                        # CLI layer
│   │   ├── mod.rs                  # CLI module exports
│   │   ├── args.rs                 # Clap argument definitions
│   │   ├── commands.rs             # Command dispatch logic
│   │   ├── output.rs               # Output formatting (JSON/Table/YAML)
│   │   └── schema.rs               # Schema introspection generation
│   │
│   ├── vesc/                       # VESC protocol layer
│   │   ├── mod.rs                  # VESC module exports
│   │   ├── protocol.rs             # Packet framing, CRC, encoding/decoding
│   │   ├── commands.rs             # VESC command definitions & serialization
│   │   ├── connection.rs           # Serial connection management
│   │   ├── datatypes.rs            # Rust equivalents of datatypes.h
│   │   ├── responses.rs            # Response parsing
│   │   └── crc.rs                  # CRC16 implementation (if needed)
│   │
│   ├── commands/                   # CLI command implementations
│   │   ├── mod.rs                  # Command module exports
│   │   ├── device.rs               # Device commands (connect, info, ping)
│   │   ├── motor.rs                # Motor commands (set-rpm, set-current)
│   │   ├── config.rs               # Configuration commands
│   │   ├── firmware.rs             # Firmware update commands
│   │   ├── can.rs                  # CAN bus commands
│   │   ├── lisp.rs                 # LispBM script commands
│   │   ├── bms.rs                  # BMS commands
│   │   ├── log.rs                  # Data logging commands
│   │   └── terminal.rs             # Terminal/debug commands
│   │
│   └── utils/                      # Utility modules
│       ├── mod.rs                  # Utils module exports
│       ├── xml.rs                  # XML serialization for configs
│       └── format.rs               # Output formatting utilities
│
├── tests/                          # Integration tests
│   ├── integration_test.rs         # Main integration test suite
│   ├── protocol_test.rs            # Protocol encoding/decoding tests
│   └── mock_vesc.rs                # Mock VESC for testing
│
├── examples/                       # Usage examples
│   ├── basic_usage.rs              # Basic CLI usage examples
│   ├── motor_control.rs            # Motor control examples
│   └── config_backup.rs            # Configuration management examples
│
├── docs/                           # Documentation (for end users)
│   ├── AGENTS.md                   # AI agent usage guide
│   ├── CONTEXT.md                  # Context for AI agents
│   ├── PROTOCOL.md                 # VESC protocol documentation
│   └── USAGE.md                    # Human user manual
│
└── orchestrator-agent-docs/        # Agent orchestration docs (this dir)
    ├── README.md                   # Project overview
    ├── architecture.md             # System architecture
    ├── file-structure.md           # This file
    ├── conventions.md              # Coding standards
    ├── commands.md                 # Build/test commands
    ├── dependencies.md             # Crate dependencies
    ├── state.md                    # Implementation status
    └── modules/                    # Module-specific docs (future)
```

## Module Responsibilities

### `src/cli/`

Handles all user-facing CLI concerns:
- **args.rs**: Define CLI structure using clap derive macros
- **commands.rs**: Dispatch parsed arguments to appropriate handlers
- **output.rs**: Format output based on `--format` flag
- **schema.rs**: Generate machine-readable command schema

### `src/vesc/`

Implements the VESC communication protocol:
- **protocol.rs**: Low-level packet encoding/decoding, CRC calculation
- **commands.rs**: High-level command enum and serialization
- **connection.rs**: Serial port management with tokio-serial
- **datatypes.rs**: Rust structs matching VESC datatypes.h
- **responses.rs**: Parse binary responses into typed structures

### `src/commands/`

Implements each command category:
- **device.rs**: Port discovery, connection, device info
- **motor.rs**: Motor control (RPM, current, duty, detection)
- **config.rs**: MCConf/AppConf read/write, backup/restore
- **firmware.rs**: Firmware updates and version info
- **can.rs**: CAN bus operations and forwarding
- **lisp.rs**: LispBM script upload/erase/status
- **bms.rs**: Battery management system operations
- **log.rs**: Data logging and real-time streaming
- **terminal.rs**: Terminal command execution

### `src/utils/`

Shared utilities:
- **xml.rs**: XML serialization for VESC configuration files
- **format.rs**: Common formatting utilities

## Test Structure

```
tests/
├── integration_test.rs     # End-to-end CLI tests using assert_cmd
├── protocol_test.rs        # Unit tests for packet encoding/decoding
└── mock_vesc.rs            # Mock VESC device for testing without hardware
```

## Configuration Files

### Cargo.toml

```toml
[package]
name = "vesc-cli"
version = "0.1.0"
edition = "2021"
authors = ["..."]
license = "GPL-3.0"
description = "CLI for VESC motor controllers"
repository = "..."

[[bin]]
name = "vesc-cli"
path = "src/main.rs"

[dependencies]
# See dependencies.md for full list

[dev-dependencies]
assert_cmd = "2.0"
predicates = "3.1"
```

### .gitignore

```
/target
Cargo.lock
*.log
*.xml
*.bin
*.zip
.DS_Store
```

## Build Output

After `cargo build --release`:

```
target/
├── debug/                  # Debug build artifacts
│   ├── vesc-cli.exe        # Windows debug binary
│   └── ...
└── release/                # Release build artifacts
    ├── vesc-cli.exe        # Windows release binary
    ├── vesc-cli            # Linux/macOS release binary
    └── ...
```

## Future Extensions

Potential future additions:

```
├── completions/            # Shell completion scripts
│   ├── vesc-cli.bash
│   ├── vesc-cli.zsh
│   └── vesc-cli.fish
├── man/                    # Man pages
│   └── vesc-cli.1
├── packaging/              # Distribution packaging
│   ├── debian/
│   ├── homebrew/
│   └── windows/
└── benchmarks/             # Performance benchmarks
```
