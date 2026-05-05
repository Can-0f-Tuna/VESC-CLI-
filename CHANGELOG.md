# Changelog

All notable changes to the VESC CLI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-05-05

### Added

#### Core Features
- **Device Management**
  - Auto-detect VESC on available serial ports
  - List available serial ports with USB device information
  - Connect and verify VESC communication
  - Get firmware version and device information
  - Ping VESC to check connectivity with latency measurement

- **Motor Control**
  - Get real-time motor telemetry (18 fields)
  - Set motor RPM
  - Set duty cycle (-1.0 to 1.0)
  - Set motor current in Amperes
  - Apply current brake
  - Set motor position (for servo mode)
  - Stop motor immediately
  - Support for command duration (auto-stop after specified time)

- **Telemetry Fields**
  - Input voltage and current
  - Motor current, RPM, and duty cycle
  - MOSFET and motor temperatures
  - FOC currents (Id, Iq)
  - Energy consumption (Ah, Wh)
  - Position tracking (tachometer, encoder)
  - Fault code detection (34 fault codes supported)

- **Configuration Management**
  - Read motor controller (MC) configuration
  - Write MC configuration from JSON
  - Read application (APP) configuration
  - Write APP configuration from JSON
  - Backup all configurations to JSON
  - Restore configurations from backup
  - Configuration validation with detailed error messages

- **CAN Bus Operations**
  - Set CAN ID for VESC
  - Scan for VESCs on CAN bus
  - Get CAN bus status
  - Forward commands to specific VESCs on CAN bus
  - Support for CAN ID range 1-253

- **LispBM Scripting**
  - Upload Lisp scripts to VESC
  - Start/stop Lisp script execution
  - Get Lisp runtime statistics
  - Execute REPL commands
  - Read Lisp memory
  - Write Lisp memory
  - Erase Lisp programs
  - Reload Lisp code

- **Terminal/REPL Mode**
  - Interactive REPL mode with command prompt
  - Single command execution mode
  - Exit-on-error option for scripting

- **Schema Introspection**
  - Full command schema for agent discovery
  - Per-command schema queries
  - Output field documentation
  - Argument schema with types and descriptions

- **Agent-First Design**
  - JSON output by default (no --json flag needed)
  - HATEOAS navigation via `next_actions` in every response
  - Context-aware suggestions based on command results
  - Error responses with `fix` field for recovery
  - Dry-run mode for safe operation preview

- **Shell Completions**
  - Generate completions for Bash
  - Generate completions for Zsh
  - Generate completions for Fish
  - Generate completions for PowerShell
  - Generate completions for Elvish

### Technical Details

#### Protocol Support
- Full VESC binary protocol implementation
- Short and long packet support
- CRC16 validation
- Automatic packet framing
- 58 VESC commands supported

#### Error Handling
- Structured error responses with error kinds
- Exit codes: 0 (success), 1 (general), 2 (connection), 3 (timeout), 4 (invalid argument), 5 (protocol)
- Suggested fixes for common errors
- Connection error recovery suggestions

#### Safety Features
- Dry-run mode for all mutating commands
- Fault code monitoring with critical fault detection
- Temperature monitoring
- Current limit validation
- Voltage range validation

### Documentation
- Comprehensive AGENTS.md guide for AI agents
- Shell completion scripts
- Example scripts for common workflows
- CI/CD configuration for automated testing

### Known Limitations
- Binary configuration read/write is partially implemented (returns defaults)
- Full CAN bus scanning requires additional VESC protocol implementation
- Interactive REPL mode is simplified (proper line editing not yet implemented)
- LispBM memory operations are placeholders

[0.1.0]: https://github.com/yourusername/veac/releases/tag/v0.1.0
