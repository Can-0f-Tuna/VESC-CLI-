# VESC CLI Project

## Overview

A modern, AI-agent-controllable CLI tool for VESC (Vedder Electronic Speed Controller) motor controllers. This project transforms the existing Qt-based GUI VESC Tool into a lightweight, programmatic interface optimized for automation and AI agent integration.

## Project Goal

Create a command-line interface that:
- Provides structured output (JSON/YAML) for programmatic control
- Supports schema introspection for AI agent capability discovery
- Eliminates Qt dependency for CLI operations
- Follows industry best practices for automation-friendly tools
- Maintains single-binary distribution for easy deployment

## Target Users

1. **Human Users** - Engineers and developers configuring VESC motor controllers
2. **AI Agents** - Automated systems controlling motors programmatically
3. **CI/CD Pipelines** - Automated testing and configuration validation

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Language | **Rust** | Fast, safe, single-binary output |
| CLI Framework | **clap** | Argument parsing, subcommands, help generation |
| Serialization | **serde** | JSON/YAML output formatting |
| Serial Communication | **tokio-serial** | Async serial port I/O |
| Async Runtime | **tokio** | Non-blocking operations |
| Output Formatting | **tabled** | Human-readable table output |
| Error Handling | **anyhow** / **thiserror** | Structured error management |

## Why Rust?

- **Single static binary** - No runtime dependencies, easy distribution
- **~1ms startup time** - Fast command execution for automation
- **Memory safety** - No crashes from protocol errors or buffer issues
- **Excellent async support** - Built for real-time streaming and monitoring
- **Cross-platform** - Native builds for Windows, macOS, Linux

## Quick Start

```bash
# Build the project
cargo build --release

# Run the CLI
./target/release/vesc-cli --help

# Connect to a VESC
vesc-cli device connect --port /dev/ttyACM0

# Get motor telemetry
vesc-cli motor get-values --format json
```

## Project Status

🟡 **Phase: Planning Complete** → Ready for implementation

See [state.md](./state.md) for detailed progress tracking.

## Documentation Structure

| Document | Purpose |
|----------|---------|
| [architecture.md](./architecture.md) | System design and VESC protocol details |
| [file-structure.md](./file-structure.md) | Planned directory layout |
| [conventions.md](./conventions.md) | Rust coding standards and naming |
| [commands.md](./commands.md) | Build, test, and development commands |
| [dependencies.md](./dependencies.md) | Required crates and versions |
| [state.md](./state.md) | Current implementation status |
| [modules/](./modules/) | Module-specific documentation |

## External References

- **VESC Project**: https://vesc-project.com/
- **VESC Firmware**: https://github.com/vedderb/bldc
- **VESC Documentation**: https://vedderb-bldc.mintlify.app/
- **VESC Tool (existing)**: https://github.com/vedderb/vesc_tool

## License

GPL v3 - Following VESC project licensing
