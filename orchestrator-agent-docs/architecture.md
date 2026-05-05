# Architecture

## System Overview

The VESC CLI is structured as a layered architecture with clear separation between protocol handling, command execution, and user interface concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLI Layer (clap)                        │
│  - Argument parsing, subcommands, help generation            │
│  - Output formatting (JSON/Table/YAML)                       │
│  - Schema generation for AI agents                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Command Layer                              │
│  - Device commands (connect, info, ping)                     │
│  - Motor commands (set-rpm, set-current, stop)               │
│  - Config commands (get-mc, set-mc, backup)                │
│  - Firmware, CAN, Lisp, BMS, Log, Terminal commands          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                VESC Protocol Layer                            │
│  - Packet encoding/decoding (framing, CRC)                   │
│  - Command serialization                                     │
│  - Response parsing                                          │
│  - Connection management                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Transport Layer                                │
│  - Serial port I/O (tokio-serial)                            │
│  - USB CDC (virtual serial)                                  │
│  - CAN bus forwarding                                        │
└─────────────────────────────────────────────────────────────┘
```

## VESC Protocol

### Communication Interface

- **Physical Layer**: USB CDC (virtual serial port) or UART
- **Default Baud Rate**: 115200 bps
- **Data Format**: 8N1 (8 data bits, no parity, 1 stop bit)
- **Flow Control**: None

### Packet Framing

VESC uses a framed binary protocol with CRC16 validation:

#### Short Packet (payload ≤ 255 bytes)
```
[0x02] [length:1] [payload:N] [CRC16:2] [0x03]
```

#### Long Packet (payload 256-512 bytes)
```
[0x03] [length:2] [payload:N] [CRC16:2] [0x03]
```

Where:
- `0x02` / `0x03` = Start byte (indicates short/long)
- `length` = Payload length in bytes
- `payload` = Command ID (1 byte) + command data
- `CRC16` = IBM SDLC CRC (big-endian)
- `0x03` = Stop byte

### Command IDs (Key Commands)

```rust
// From datatypes.h - partial list of most important commands
COMM_FW_VERSION = 0           // Get firmware version
COMM_GET_VALUES = 4           // Get motor telemetry
COMM_SET_DUTY = 5             // Set duty cycle (-1.0 to 1.0)
COMM_SET_CURRENT = 6          // Set current (amperes)
COMM_SET_CURRENT_BRAKE = 7    // Set braking current
COMM_SET_RPM = 8              // Set RPM
COMM_SET_POS = 9              // Set position (degrees)
COMM_SET_HANDBRAKE = 10       // Set handbrake current
COMM_SET_DETECT = 11          // Run motor detection
COMM_SET_MCCONF = 13          // Set motor configuration
COMM_GET_MCCONF = 14          // Get motor configuration
COMM_SET_APPCONF = 16         // Set app configuration
COMM_GET_APPCONF = 17         // Get app configuration
COMM_TERMINAL_CMD = 20        // Execute terminal command
COMM_REBOOT = 29              // Reboot VESC
COMM_ALIVE = 30               // Keepalive signal
// ... 160+ total commands
```

### Data Scaling

| Parameter | Scaling Factor | Example |
|-----------|---------------|---------|
| Current | × 1000 | 10.5A → 10500 |
| Duty Cycle | × 100000 | 0.5 → 50000 |
| RPM | No scaling | 5000 → 5000 |
| Temperature | × 10 | 25.5°C → 255 |

## CLI Command Structure

### Noun-Verb Pattern

Commands follow a consistent `noun verb` structure:

```
vesc-cli [global-options] <noun> <verb> [options]
```

#### Nouns (Resources)

| Noun | Purpose | Example Commands |
|------|---------|------------------|
| `device` | VESC device operations | `connect`, `info`, `ping`, `list-ports` |
| `motor` | Motor control | `set-rpm`, `set-current`, `stop`, `detect` |
| `config` | Configuration management | `get-mc`, `set-mc`, `backup`, `restore` |
| `firmware` | Firmware operations | `update`, `info`, `backup` |
| `can` | CAN bus operations | `ping`, `list`, `forward` |
| `lisp` | LispBM script management | `upload`, `erase`, `status` |
| `bms` | Battery Management System | `status`, `config` |
| `log` | Data logging | `read`, `stream`, `stats` |
| `terminal` | Debug terminal access | `exec`, `interactive` |
| `file` | SD card file operations | `upload`, `download`, `list` |

#### Verbs (Actions)

| Verb | Meaning | Example |
|------|---------|---------|
| `list` | List resources | `device list-ports` |
| `get` | Read resource | `config get-mc` |
| `set` | Write resource | `config set-mc` |
| `delete` | Remove resource | `lisp erase` |
| `upload` | Upload data/file | `firmware update` |
| `download` | Download data/file | `config get-mc --output file.xml` |
| `start` | Begin operation | `motor start` |
| `stop` | End operation | `motor stop` |
| `detect` | Run detection | `motor detect` |
| `monitor` | Stream real-time data | `motor monitor` |
| `status` | Get current status | `device status` |

### Global Options

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--port` | `-p` | Auto-detect | Serial port path |
| `--can-id` | `-c` | None | CAN bus device ID |
| `--baud` | `-b` | 115200 | Baud rate |
| `--format` | `-f` | auto | Output: auto/json/yaml/table |
| `--timeout` | `-t` | 5000 | Command timeout (ms) |
| `--dry-run` | `-n` | false | Preview changes |
| `--yes` | `-y` | false | Skip confirmations |
| `--verbose` | `-v` | false | Verbose output |
| `--version` | | | Show version |
| `--help` | `-h` | | Show help |

## Core Data Structures

### Connection

```rust
pub struct VescConnection {
    port_name: String,
    baud_rate: u32,
    stream: Option<SerialStream>,
    read_buffer: Vec<u8>,
}
```

### Packet

```rust
pub struct Packet {
    pub payload: Vec<u8>,  // Command ID + data
}

impl Packet {
    pub fn encode(&self) -> Vec<u8> { /* framing + CRC */ }
    pub fn decode(data: &[u8]) -> Result<Option<(Self, usize)>, ProtocolError> { }
}
```

### Command Enum

```rust
pub enum Command {
    GetFwVersion,
    GetValues,
    SetDuty(f64),
    SetCurrent(f64),
    SetCurrentBrake(f64),
    SetRpm(i32),
    SetPos(f64),
    Stop,
    GetMcConf,
    SetMcConf(Vec<u8>),
    // ... 160+ variants
}
```

### Response Types

```rust
pub enum Response {
    FwVersion { major: u8, minor: u8, name: String, ... },
    Values(McValues),
    McConf(Vec<u8>),
    AppConf(Vec<u8>),
    Ack(String),
    Error(String),
}

pub struct McValues {
    pub v_in: f64,
    pub temp_mos: f64,
    pub temp_motor: f64,
    pub current_motor: f64,
    pub current_in: f64,
    pub rpm: f64,
    pub duty_now: f64,
    pub fault_code: u8,
    // ... 20+ fields
}
```

## Schema Introspection

The CLI provides machine-readable schema for AI agent capability discovery:

```bash
vesc-cli schema                    # Full command schema
vesc-cli schema motor set-rpm      # Schema for specific command
```

Schema output format:

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
        {"name": "duration", "type": "integer", "required": false, "default": null}
      ],
      "output_fields": [
        {"name": "success", "type": "boolean"},
        {"name": "actual_rpm", "type": "integer"}
      ]
    }
  ],
  "error_kinds": [
    {"kind": "connection", "retryable": true, "description": "Connection failed"},
    {"kind": "timeout", "retryable": true, "description": "Command timed out"}
  ]
}
```

## Exit Codes

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
| 10 | Dry Run Success | --dry-run completed |

## AI-Agent Design Principles

1. **Discoverability**: `schema` command provides complete capability map
2. **Structured Output**: JSON by default when not in TTY
3. **Semantic Exit Codes**: Agents can determine success/failure programmatically
4. **Non-Interactive**: No prompts in automation contexts
5. **Dry-Run Support**: Preview destructive operations
6. **Idempotent Operations**: Safe to retry commands
