# VESC Tool CLI Transformation Plan

## Executive Summary

This document outlines the strategy to transform the VESC Tool (a Qt-based GUI application) into a modern, AI-agent-controllable CLI that follows industry best practices for automation and programmatic control.

---

## Current State Analysis

### What We Have
1. **VESC Tool** - A Qt-based GUI application for configuring VESC motor controllers
2. **Partial CLI** - Basic command-line capabilities in `main.cpp`:
   - `--getMcConf`, `--setMcConf` - Motor configuration
   - `--getAppConf`, `--setAppConf` - Application configuration  
   - `--uploadLisp`, `--eraseLisp` - LispBM script management
   - `--uploadFirmware` - Firmware updates
   - `--queryDeviceFwParams` - Device information
   - `--vescPort [port]` - Serial port connection
   - `--canFwd [id]` - CAN bus forwarding

### Current Limitations
1. **Qt Dependency** - CLI requires QCoreApplication (heavyweight)
2. **No Structured Output** - Text-only output, not machine-readable
3. **No Schema Introspection** - Agents cannot discover capabilities programmatically
4. **No TTY Detection** - Doesn't adapt behavior for automation
5. **Limited Error Handling** - No semantic exit codes or structured errors
6. **Mixed Concerns** - CLI logic embedded in GUI codebase

---

## Target Architecture

### Design Principles (Based on CLI Spec & Agent-CLI Guide)

1. **Structured Output** - JSON by default when piped, human-friendly in TTY
2. **Schema Introspection** - `vesc-cli schema` command for capability discovery
3. **Noun-Verb Commands** - `vesc-cli motor get-values`, `vesc-cli config set-mc`
4. **Non-Interactive by Default** - Never block without TTY
5. **Idempotent Operations** - Safe to retry commands
6. **Semantic Exit Codes** - Documented, machine-readable status codes
7. **Dry-Run Support** - Preview changes before applying
8. **TTY-Aware Behavior** - Auto-detect terminal vs. automation context

### Command Structure

```
vesc-cli [global-options] <noun> <verb> [options]

Nouns (Resources):
  device       - VESC device operations (connect, disconnect, info)
  motor        - Motor control (start, stop, set-rpm, set-current, etc.)
  config       - Configuration management (mcconf, appconf, custom)
  firmware     - Firmware operations (update, backup, restore)
  lisp         - LispBM scripts (upload, erase, run)
  bms          - Battery Management System operations
  can          - CAN bus operations (ping, forward, config)
  log          - Data logging and statistics
  terminal     - Interactive terminal/debug access
  file         - SD card file operations

Verbs (Actions):
  list         - List resources
  get          - Get/read resource
  set          - Set/write resource
  delete       - Remove resource
  upload       - Upload data/file
  download     - Download data/file
  start        - Start operation
  stop         - Stop operation
  detect       - Run detection routines
  monitor      - Stream real-time data
  status       - Get current status

Global Options:
  --port, -p           Serial port (auto-detect if not specified)
  --can-id, -c         CAN bus ID for forwarding
  --baud, -b           Baud rate (default: 115200)
  --format, -f         Output format: json|yaml|table (auto: tty=json)
  --timeout, -t        Command timeout in ms (default: 5000)
  --dry-run, -n        Preview changes without applying
  --yes, -y            Skip confirmations
  --verbose, -v        Enable verbose output
  --version            Show version
  --help, -h           Show help
  schema               Output JSON schema of all commands
```

### Example Commands

```bash
# Device operations
vesc-cli device list-ports                    # List available serial ports
vesc-cli device connect --port /dev/ttyACM0   # Connect to specific port
vesc-cli device info                          # Get firmware version and HW info
vesc-cli device ping                          # Check if device responds

# Motor control
vesc-cli motor get-values                     # Get motor telemetry (JSON)
vesc-cli motor set-rpm 5000                   # Set motor to 5000 RPM
vesc-cli motor set-current 10.5               # Set current to 10.5A
vesc-cli motor set-duty 0.5                   # Set 50% duty cycle
vesc-cli motor stop                           # Stop motor
vesc-cli motor detect --current 5             # Run motor detection

# Configuration
vesc-cli config get-mc --output mcconf.xml    # Read motor config to file
vesc-cli config set-mc --input mcconf.xml     # Write motor config from file
vesc-cli config get-app --output appconf.xml  # Read app config
vesc-cli config set-app --input appconf.xml   # Write app config
vesc-cli config backup --output backup.zip    # Backup all configs
vesc-cli config restore --input backup.zip    # Restore from backup

# Firmware
vesc-cli firmware update --file firmware.bin  # Upload new firmware
vesc-cli firmware info                        # Get current firmware info

# CAN bus operations
vesc-cli can ping                             # Ping all CAN devices
vesc-cli can list                             # List discovered CAN devices
vesc-cli can forward --id 1 device info       # Forward command via CAN ID 1

# Real-time monitoring
vesc-cli motor monitor --fields rpm,current,voltage --duration 30
vesc-cli log stream --rate 10hz --output data.jsonl

# Terminal/debug
vesc-cli terminal exec "help"                 # Execute single terminal command
vesc-cli terminal interactive                 # Interactive terminal session

# LispBM
vesc-cli lisp upload --file script.lisp       # Upload Lisp script
vesc-cli lisp erase                           # Erase Lisp from VESC
vesc-cli lisp status                          # Get Lisp runtime status

# Schema introspection (for AI agents)
vesc-cli schema                               # Full command schema
vesc-cli schema motor set-rpm                 # Schema for specific command
```

---

## Technical Implementation Strategy

### Phase 1: Core Architecture (Foundation)

#### 1.1 Project Structure
```
veac-cli/
├── Cargo.toml              # Rust project manifest
├── src/
│   ├── main.rs            # CLI entry point, argument parsing
│   ├── cli/               # CLI framework integration
│   │   ├── mod.rs
│   │   ├── args.rs        # Command-line argument definitions
│   │   ├── commands.rs    # Command dispatch
│   │   ├── output.rs      # Output formatting (JSON/YAML/Table)
│   │   └── schema.rs      # Schema introspection generation
│   ├── vesc/              # VESC communication protocol
│   │   ├── mod.rs
│   │   ├── protocol.rs    # Packet framing, CRC, serialization
│   │   ├── commands.rs    # VESC command implementations
│   │   ├── connection.rs    # Serial/USB connection management
│   │   ├── datatypes.rs   # Rust equivalents of datatypes.h
│   │   └── responses.rs   # Response parsing
│   ├── commands/          # CLI command implementations
│   │   ├── mod.rs
│   │   ├── device.rs
│   │   ├── motor.rs
│   │   ├── config.rs
│   │   ├── firmware.rs
│   │   ├── can.rs
│   │   ├── lisp.rs
│   │   ├── bms.rs
│   │   ├── log.rs
│   │   └── terminal.rs
│   └── error.rs           # Error handling and exit codes
├── tests/                 # Integration tests
├── docs/
│   ├── AGENTS.md         # AI agent usage guide
│   ├── CONTEXT.md        # Context for AI agents
│   └── PROTOCOL.md       # VESC protocol documentation
└── examples/              # Usage examples
```

#### 1.2 Technology Stack
- **Language**: Rust (fast, safe, single binary, excellent CLI ecosystem)
- **CLI Framework**: `clap` (derive macros, schema generation, completions)
- **Serialization**: `serde` (JSON, YAML output)
- **Serial Communication**: `tokio-serial` (async serial port)
- **Output Formatting**: `tabled` (human-readable tables)
- **Async Runtime**: `tokio` (non-blocking I/O)

#### 1.3 VESC Protocol Implementation

The VESC protocol uses framed binary packets:

```rust
// Packet structure
pub struct Packet {
    pub payload: Vec<u8>,    // Command ID + data
}

// Frame format (short packet ≤255 bytes):
// [0x02] [length:1] [payload:N] [CRC16:2] [0x03]
// Frame format (long packet 256-512 bytes):
// [0x03] [length:2] [payload:N] [CRC16:2] [0x03]

pub fn encode_packet(payload: &[u8]) -> Vec<u8> {
    let mut frame = Vec::new();
    let len = payload.len();
    
    if len <= 255 {
        frame.push(0x02);           // Short packet start
        frame.push(len as u8);      // Single byte length
    } else {
        frame.push(0x03);           // Long packet start
        frame.extend_from_slice(&(len as u16).to_be_bytes()); // 2-byte length
    }
    
    frame.extend_from_slice(payload);
    let crc = crc16(&payload);
    frame.extend_from_slice(&crc.to_be_bytes());
    frame.push(0x03);               // Stop byte
    
    frame
}
```

### Phase 2: Communication Layer

#### 2.1 Connection Management
```rust
pub struct VescConnection {
    port: String,
    baud_rate: u32,
    timeout_ms: u64,
    stream: Option<SerialStream>,
}

impl VescConnection {
    pub async fn connect(&mut self) -> Result<()> {
        // Open serial port with tokio-serial
        // Configure: 8N1, no flow control
    }
    
    pub async fn send_command(&mut self, cmd: Command) -> Result<Response> {
        // Encode command, send, wait for response
    }
    
    pub async fn ping(&mut self) -> Result<bool> {
        // Quick connectivity check
    }
}
```

#### 2.2 Command Implementations
Reimplement all 160+ VESC commands as typed Rust functions:

```rust
pub enum Command {
    GetValues,
    SetDuty(f64),
    SetCurrent(f64),
    SetRpm(i32),
    GetMcConf,
    SetMcConf(McConfiguration),
    // ... all others
}

pub enum Response {
    Values(McValues),
    McConf(McConfiguration),
    Ack(String),
    Error(String),
    // ...
}
```

### Phase 3: CLI Commands

#### 3.1 Device Commands
```bash
vesc-cli device list-ports [--format json]
vesc-cli device connect [--port /dev/ttyACM0] [--baud 115200]
vesc-cli device disconnect
vesc-cli device info [--format json]
vesc-cli device ping
vesc-cli device monitor [--fields field1,field2] [--duration 30]
```

#### 3.2 Motor Commands
```bash
vesc-cli motor get-values [--format json]
vesc-cli motor set-rpm <rpm> [--duration 10]
vesc-cli motor set-current <amperes> [--duration 10]
vesc-cli motor set-duty <ratio> [--duration 10]
vesc-cli motor set-brake <amperes> [--duration 10]
vesc-cli motor stop
vesc-cli motor detect --current <a> --min-rpm <rpm> --low-duty <ratio>
vesc-cli motor status [--format json]
vesc-cli motor stream [--fields f1,f2] [--rate 10hz] [--duration 60]
```

#### 3.3 Config Commands
```bash
vesc-cli config get-mc [--output file.xml]
vesc-cli config set-mc [--input file.xml] [--dry-run]
vesc-cli config get-app [--output file.xml]
vesc-cli config set-app [--input file.xml] [--dry-run]
vesc-cli config get-custom <index> [--output file.xml]
vesc-cli config set-custom <index> [--input file.xml]
vesc-cli config backup [--output backup.zip]
vesc-cli config restore [--input backup.zip] [--dry-run]
vesc-cli config diff [--local file.xml] [--remote]
```

#### 3.4 Firmware Commands
```bash
vesc-cli firmware info [--format json]
vesc-cli firmware update --file firmware.bin [--dry-run]
vesc-cli firmware backup --output firmware-backup.bin
vesc-cli firmware bootloader-upload
```

#### 3.5 CAN Commands
```bash
vesc-cli can ping [--timeout 2000]
vesc-cli can list [--format json]
vesc-cli can status <id> [--format json]
vesc-cli can forward <id> <command...>
vesc-cli can config [--baud 500000]
```

#### 3.6 Lisp Commands
```bash
vesc-cli lisp upload --file script.lisp [--reduce]
vesc-cli lisp erase [--force]
vesc-cli lisp status [--format json]
vesc-cli lisp stream-logs [--follow]
vesc-cli lisp repl  # Interactive REPL
```

#### 3.7 Log Commands
```bash
vesc-cli log read [--output file.csv] [--duration 60]
vesc-cli log stats [--format json]
vesc-cli log reset
vesc-cli log stream --fields rpm,current,voltage [--rate 50hz]
```

#### 3.8 Terminal Commands
```bash
vesc-cli terminal exec "command"
vesc-cli terminal batch --file commands.txt
vesc-cli terminal interactive
```

### Phase 4: AI-Agent Features

#### 4.1 Schema Introspection
```bash
vesc-cli schema                          # Full schema
vesc-cli schema --format yaml            # YAML format
vesc-cli schema motor set-rpm            # Specific command
```

Output:
```json
{
  "name": "vesc-cli",
  "version": "1.0.0",
  "commands": [
    {
      "name": "motor set-rpm",
      "description": "Set motor RPM",
      "mutating": true,
      "args": [
        {"name": "rpm", "type": "integer", "required": true, "description": "Target RPM"},
        {"name": "duration", "type": "integer", "required": false, "default": null, "description": "Duration in seconds"},
        {"name": "can-id", "type": "integer", "required": false, "description": "CAN bus device ID"}
      ],
      "output_fields": [
        {"name": "success", "type": "boolean"},
        {"name": "actual_rpm", "type": "integer"},
        {"name": "error", "type": "string | null"}
      ]
    }
  ],
  "error_kinds": [
    {"kind": "connection", "retryable": true, "description": "Connection failed"},
    {"kind": "timeout", "retryable": true, "description": "Command timed out"},
    {"kind": "invalid_param", "retryable": false, "description": "Invalid parameter"},
    {"kind": "not_supported", "retryable": false, "description": "Feature not supported"}
  ]
}
```

#### 4.2 Context Files for AI Agents

**docs/CONTEXT.md**:
```markdown
# VESC CLI Context for AI Agents

## Overview
VESC (Vedder Electronic Speed Controller) is an open-source motor controller 
for electric vehicles, robots, and industrial applications.

## Common Workflows

### Motor Setup
1. Connect to VESC: `vesc-cli device connect`
2. Get device info: `vesc-cli device info`
3. Detect motor: `vesc-cli motor detect --current 5.0`
4. Set config: `vesc-cli config set-mc --input motor_config.xml`

### Monitoring
1. Stream values: `vesc-cli motor stream --fields rpm,current,voltage`

## Safety Considerations
- Always verify connections before applying power
- Use --dry-run for destructive operations
- Start with low currents for motor detection
- Emergency stop: `vesc-cli motor stop`
```

**docs/AGENTS.md**:
```markdown
# Using VESC CLI with AI Agents

## Best Practices
1. Always use --format json for scripted operations
2. Use schema command to discover capabilities
3. Handle exit codes: 0=success, 1=error, 2=invalid args, 3=timeout
4. Use --dry-run before destructive operations

## Example Agent Workflow
```
# Get schema first
schema = run("vesc-cli schema")

# Connect to device
result = run("vesc-cli device connect --port /dev/ttyACM0 --format json")
if result.exit_code != 0:
    handle_error(result)

# Get motor values
values = run("vesc-cli motor get-values --format json")
data = parse_json(values.stdout)
if data.fault_code != "FAULT_CODE_NONE":
    alert_user(data.fault_str)
```
```

### Phase 5: Integration and Testing

#### 5.1 Exit Codes
| Code | Meaning | Description |
|------|---------|-------------|
| 0 | Success | Command executed successfully |
| 1 | General Error | Unspecified error occurred |
| 2 | Invalid Arguments | Command-line parsing error |
| 3 | Connection Failed | Could not connect to VESC |
| 4 | Timeout | Command timed out |
| 5 | Protocol Error | VESC protocol error |
| 6 | Not Found | Resource not found |
| 7 | Permission Denied | Access denied |
| 10 | Dry Run Success | --dry-run completed successfully |

#### 5.2 Testing Strategy
1. **Unit Tests**: Protocol encoding/decoding, command parsing
2. **Integration Tests**: Mock VESC device, command sequences
3. **Hardware Tests**: Real VESC hardware validation
4. **AI Agent Tests**: Validate schema, test with example agents

---

## Migration Strategy

### Option 1: Complete Rewrite (Recommended)
Build new Rust CLI from scratch, independent of Qt code.
- Pros: Clean architecture, optimal performance, single binary
- Cons: Significant effort to reimplement protocol

### Option 2: Hybrid Approach
Create CLI that wraps existing C++ core:
- Extract protocol code from existing codebase
- Build new CLI around extracted core
- Pros: Reuse working protocol implementation
- Cons: Still requires Qt for some operations

### Option 3: Python Bridge
Create Python CLI using PyVESC library:
- Use existing PyVESC for protocol
- Build CLI with Click/Typer
- Pros: Rapid development, familiar Python
- Cons: Requires Python runtime, slower performance

**Recommendation**: Option 1 (Rust) for production-quality CLI that AI agents can rely on.

---

## Implementation Roadmap

### Sprint 1: Foundation (Weeks 1-2)
- [ ] Set up Rust project structure
- [ ] Implement VESC protocol (packet framing, CRC)
- [ ] Implement basic serial connection
- [ ] Add device discovery (list-ports)
- [ ] Implement COMM_FW_VERSION command

### Sprint 2: Core Commands (Weeks 3-4)
- [ ] Device commands (connect, info, ping)
- [ ] Motor commands (get-values, set-rpm, set-current, stop)
- [ ] Output formatting (JSON, table)
- [ ] TTY detection
- [ ] Schema generation

### Sprint 3: Configuration (Weeks 5-6)
- [ ] Config read/write (MC conf, APP conf)
- [ ] XML serialization/deserialization
- [ ] Backup/restore functionality
- [ ] Dry-run support

### Sprint 4: Advanced Features (Weeks 7-8)
- [ ] Motor detection commands
- [ ] CAN bus operations
- [ ] Firmware updates
- [ ] LispBM support
- [ ] Terminal commands

### Sprint 5: Polish & AI-Agent Ready (Weeks 9-10)
- [ ] Comprehensive error handling
- [ ] Exit code standardization
- [ ] Schema introspection complete
- [ ] AGENTS.md and CONTEXT.md documentation
- [ ] Integration tests
- [ ] Shell completions
- [ ] Packaging (cargo install, homebrew, etc.)

---

## Usage Examples

### Human Interactive Usage
```bash
# Connect and get info
$ vesc-cli device connect
Connected to /dev/ttyACM0 (VESC 6 MkV)

$ vesc-cli device info
FW: V6.00, HW: VESC 6 MkV
UUID: 12345678-1234-1234-1234-123456789ABC

# Start motor
$ vesc-cli motor set-rpm 1000 --duration 10
Motor running at 1000 RPM for 10 seconds... Done.
```

### AI Agent Usage
```bash
# Schema discovery
$ vesc-cli schema motor set-rpm
{
  "name": "motor set-rpm",
  "description": "Set motor RPM",
  "args": [...],
  "output_fields": [...]
}

# Automated motor test
$ vesc-cli device connect --port /dev/ttyACM0 --format json
{"connected": true, "port": "/dev/ttyACM0", "baud": 115200}

$ vesc-cli motor get-values --format json
{
  "rpm": 0,
  "current_motor": 0.0,
  "v_in": 48.2,
  "fault_code": "FAULT_CODE_NONE"
}

$ vesc-cli motor set-rpm 500 --duration 5 --format json
{"success": true, "command": "set_rpm", "target_rpm": 500}

$ vesc-cli motor get-values --format json | jq '.rpm'
500
```

### CI/CD Pipeline
```yaml
# .github/workflows/test-motor.yml
steps:
  - name: Install VESC CLI
    run: cargo install vesc-cli

  - name: Detect Motor
    run: |
      vesc-cli device connect --port /dev/ttyACM0
      vesc-cli motor detect --current 5.0 --format json > motor_params.json

  - name: Run Motor Test
    run: |
      vesc-cli motor set-rpm 1000 --duration 30
      vesc-cli motor get-values --format json | jq '.fault_code' | grep -q "FAULT_CODE_NONE"
```

---

## Conclusion

This transformation will create a modern, AI-agent-controllable CLI for VESC that:
1. Follows industry best practices for CLI design
2. Provides structured output for automation
3. Includes schema introspection for AI agents
4. Maintains backward compatibility with existing workflows
5. Is built on a solid, type-safe foundation (Rust)

The result will be a tool that humans can use interactively while also serving as a reliable interface for AI agents to configure and control VESC motor controllers programmatically.
