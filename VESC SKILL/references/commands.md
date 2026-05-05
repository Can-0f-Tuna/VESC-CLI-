# VESC CLI Command Reference

Complete reference for all `veac` commands, organized by category.

---

## Device Commands

### `veac device connect`

Connect to a VESC controller.

**Syntax:**
```bash
veac device connect [OPTIONS]
```

**Options:**
| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--port <path>` | `-p` | Serial port path | Auto-detect |
| `--baud <rate>` | `-b` | Baud rate | 115200 |
| `--timeout <ms>` | `-t` | Connection timeout | 5000 |
| `--verbose` | `-v` | Verbose output | false |

**Examples:**
```bash
# Auto-detect
veac device connect

# Specific port
veac device connect --port /dev/ttyACM0
veac device connect --port COM3
veac device connect -p /dev/ttyUSB0 -b 115200

# With verbose output
veac device connect --port /dev/ttyACM0 --verbose
```

**Response:**
```json
{
  "ok": true,
  "command": "device connect",
  "result": {
    "port": "/dev/ttyACM0",
    "baud": 115200,
    "connected": true,
    "vesc_version": "6.02"
  },
  "next_actions": [...]
}
```

---

### `veac device list-ports`

List available serial ports.

**Syntax:**
```bash
veac device list-ports [OPTIONS]
```

**Options:**
| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--format <format>` | `-f` | Output format: json, yaml, table | table |

**Examples:**
```bash
# Default table format
veac device list-ports

# JSON for scripting
veac device list-ports --format json

# YAML format
veac device list-ports -f yaml
```

**Response (table):**
```
Port        Description        Status
/dev/ttyACM0  VESC - USB  Connected
/dev/ttyUSB0  USB-Serial   Available
```

**Response (JSON):**
```json
{
  "ok": true,
  "command": "device list-ports",
  "result": {
    "ports": [
      {
        "path": "/dev/ttyACM0",
        "description": "VESC - USB",
        "status": "connected"
      }
    ]
  }
}
```

---

### `veac device disconnect`

Disconnect from the VESC.

**Syntax:**
```bash
veac device disconnect
```

**Example:**
```bash
veac device disconnect
```

---

### `veac device ping`

Check connection status.

**Syntax:**
```bash
veac device ping [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--format <format>` | Output format |

**Example:**
```bash
veac device ping
veac device ping --format json
```

**Response:**
```json
{
  "ok": true,
  "command": "device ping",
  "result": {
    "connected": true,
    "latency_ms": 12
  }
}
```

---

### `veac device info`

Get detailed device information.

**Syntax:**
```bash
veac device info [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--format <format>` | Output format |

**Example:**
```bash
veac device info
veac device info --format json
```

**Response:**
```json
{
  "ok": true,
  "command": "device info",
  "result": {
    "firmware_version": "6.02",
    "hardware_version": "60",
    "uuid": "a1b2c3d4...",
    "custom_name": "My VESC",
    "compiler": "gcc 10.2.1"
  }
}
```

---

## Motor Commands

### `veac motor get-values`

Get real-time motor telemetry.

**Syntax:**
```bash
veac motor get-values [OPTIONS]
```

**Options:**
| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--format <format>` | `-f` | Output format: json, yaml, table | table |

**Output Fields:**
| Field | Description | Unit |
|-------|-------------|------|
| `rpm` | Motor RPM | rev/min |
| `current_motor` | Motor current | A |
| `current_in` | Battery current | A |
| `duty_cycle` | PWM duty cycle | 0.0-1.0 |
| `v_in` | Input voltage | V |
| `amp_hours` | Amp hours consumed | Ah |
| `amp_hours_charged` | Amp hours charged | Ah |
| `watt_hours` | Watt hours consumed | Wh |
| `watt_hours_charged` | Watt hours charged | Wh |
| `tachometer` | Position counter | counts |
| `tachometer_abs` | Absolute position | counts |
| `temp_mos` | MOSFET temperature | °C |
| `temp_motor` | Motor temperature | °C |
| `fault_code` | Fault code | integer |

**Examples:**
```bash
# Table format (default)
veac motor get-values

# JSON for parsing
veac motor get-values --format json

# YAML format
veac motor get-values -f yaml
```

**Response (JSON):**
```json
{
  "ok": true,
  "command": "motor get-values",
  "result": {
    "rpm": 0,
    "current_motor": 0.0,
    "current_in": 0.0,
    "duty_cycle": 0.0,
    "v_in": 24.5,
    "amp_hours": 0.0,
    "amp_hours_charged": 0.0,
    "watt_hours": 0.0,
    "watt_hours_charged": 0.0,
    "tachometer": 0,
    "tachometer_abs": 0,
    "temp_mos": 35.2,
    "temp_motor": 28.5,
    "fault_code": 0
  }
}
```

---

### `veac motor set-rpm`

Set motor RPM.

**Syntax:**
```bash
veac motor set-rpm <rpm> [OPTIONS]
```

**Arguments:**
| Argument | Description | Range |
|------------|-------------|-------|
| `rpm` | Target RPM | -100000 to 100000 |

**Options:**
| Option | Short | Description |
|--------|-------|-------------|
| `--duration <seconds>` | | Auto-stop after N seconds |
| `--dry-run` | `-n` | Preview only |
| `--yes` | `-y` | Skip confirmation |

**Examples:**
```bash
# Set positive RPM
veac motor set-rpm 1000

# Set negative RPM (reverse)
veac motor set-rpm -1000

# Run for 5 seconds then stop
veac motor set-rpm 1000 --duration 5

# Preview only
veac motor set-rpm 1000 --dry-run
```

---

### `veac motor set-current`

Set motor current.

**Syntax:**
```bash
veac motor set-current <amperes> [OPTIONS]
```

**Arguments:**
| Argument | Description | Range |
|------------|-------------|-------|
| `amperes` | Current in amperes | -200 to 200 |

**Options:**
| Option | Description |
|--------|-------------|
| `--duration <seconds>` | Auto-stop after N seconds |
| `--dry-run` | Preview only |
| `--yes` | Skip confirmation |

**Examples:**
```bash
# Set 5A current
veac motor set-current 5.0

# Regenerative braking (negative current)
veac motor set-current -2.0

# Run for 3 seconds
veac motor set-current 3.0 --duration 3
```

---

### `veac motor set-duty`

Set PWM duty cycle.

**Syntax:**
```bash
veac motor set-duty <duty> [OPTIONS]
```

**Arguments:**
| Argument | Description | Range |
|------------|-------------|-------|
| `duty` | Duty cycle | -1.0 to 1.0 |

**Options:**
| Option | Description |
|--------|-------------|
| `--duration <seconds>` | Auto-stop after N seconds |
| `--dry-run` | Preview only |
| `--yes` | Skip confirmation |

**Examples:**
```bash
# 50% duty cycle
veac motor set-duty 0.5

# Reverse
veac motor set-duty -0.3
```

---

### `veac motor set-current-brake`

Apply current-based braking.

**Syntax:**
```bash
veac motor set-current-brake <amperes> [OPTIONS]
```

**Arguments:**
| Argument | Description | Range |
|------------|-------------|-------|
| `amperes` | Brake current | 0 to 200 |

**Options:**
| Option | Description |
|--------|-------------|
| `--duration <seconds>` | Auto-release after N seconds |

**Examples:**
```bash
# Light brake
veac motor set-current-brake 2.0

# Strong brake
veac motor set-current-brake 10.0

# Brake for 5 seconds
veac motor set-current-brake 5.0 --duration 5
```

---

### `veac motor stop`

Stop the motor immediately.

**Syntax:**
```bash
veac motor stop [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--format <format>` | Output format |

**Examples:**
```bash
veac motor stop
veac motor stop --format json
```

---

### `veac motor detect`

Auto-detect motor parameters.

**Syntax:**
```bash
veac motor detect [OPTIONS]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--current <A>` | Detection current | 5.0 |
| `--min-rpm <rpm>` | Minimum RPM | 100 |
| `--low-duty <duty>` | Low duty cycle | 0.1 |

**Examples:**
```bash
# Default detection
veac motor detect

# Custom parameters
veac motor detect --current 3.0 --min-rpm 50 --low-duty 0.05
```

---

### `veac motor stream`

Stream telemetry data continuously.

**Syntax:**
```bash
veac motor stream [OPTIONS]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--fields <fields>` | Comma-separated field list | all |
| `--rate <hz>` | Update rate in Hz | 10 |
| `--duration <seconds>` | Stream duration | unlimited |
| `--format <format>` | Output format | json |

**Examples:**
```bash
# Stream all fields at 10Hz
veac motor stream

# Stream specific fields
veac motor stream --fields "rpm,v_in,current_motor"

# 1Hz for 60 seconds
veac motor stream --rate 1 --duration 60

# CSV-like output
veac motor stream --rate 5 --format csv
```

---

## CAN Bus Commands

### `veac can set-id`

Set the CAN ID for this VESC.

**Syntax:**
```bash
veac can set-id <id> [OPTIONS]
```

**Arguments:**
| Argument | Description | Range |
|------------|-------------|-------|
| `id` | CAN ID | 1 to 254 |

**Options:**
| Option | Description |
|--------|-------------|
| `--dry-run` | Preview only |

**Examples:**
```bash
# Set CAN ID to 1
veac can set-id 1

# Set CAN ID to 2 (for second VESC)
veac can set-id 2
```

---

### `veac can scan`

Scan for VESCs on the CAN bus.

**Syntax:**
```bash
veac can scan [OPTIONS]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--format <format>` | Output format | table |

**Examples:**
```bash
veac can scan
veac can scan --format json
```

**Response:**
```json
{
  "ok": true,
  "command": "can scan",
  "result": {
    "devices": [
      {"id": 1, "status": "online", "voltage": 24.5},
      {"id": 2, "status": "online", "voltage": 24.5}
    ]
  }
}
```

---

### `veac can status`

Get CAN bus status.

**Syntax:**
```bash
veac can status [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--format <format>` | Output format |

**Examples:**
```bash
veac can status
veac can status --format json
```

---

### `veac can forward`

Forward a command to another VESC on the CAN bus.

**Syntax:**
```bash
veac can forward <can-id> <command...>
```

**Arguments:**
| Argument | Description |
|------------|-------------|
| `can-id` | Target VESC CAN ID |
| `command...` | Command to forward |

**Examples:**
```bash
# Forward motor command to VESC with CAN ID 2
veac can forward 2 motor set-rpm 1000
veac can forward 2 motor get-values
veac can forward 2 motor stop

# Forward configuration read
veac can forward 1 config get-mc --output vesc1-mc.json
```

---

## LispBM Commands

### `veac lisp upload`

Upload a LispBM script to the VESC.

**Syntax:**
```bash
veac lisp upload <file> [OPTIONS]
```

**Arguments:**
| Argument | Description |
|------------|-------------|
| `file` | Path to .lisp file |

**Options:**
| Option | Description |
|--------|-------------|
| `--start` | Auto-start after upload |
| `--yes` | Skip confirmation |

**Examples:**
```bash
# Upload only
veac lisp upload myscript.lisp

# Upload and start
veac lisp upload myscript.lisp --start
```

---

### `veac lisp start`

Start LispBM execution.

**Syntax:**
```bash
veac lisp start [OPTIONS]
```

**Examples:**
```bash
veac lisp start
```

---

### `veac lisp stop`

Stop LispBM execution.

**Syntax:**
```bash
veac lisp stop [OPTIONS]
```

**Examples:**
```bash
veac lisp stop
```

---

### `veac lisp get-stats`

Get LispBM runtime statistics.

**Syntax:**
```bash
veac lisp get-stats [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--format <format>` | Output format |

**Examples:**
```bash
veac lisp get-stats
veac lisp get-stats --format json
```

**Response:**
```json
{
  "ok": true,
  "command": "lisp get-stats",
  "result": {
    "memory_used": 1024,
    "memory_total": 8192,
    "stack_depth": 5,
    "running": true
  }
}
```

---

### `veac lisp repl`

Execute a REPL command.

**Syntax:**
```bash
veac lisp repl "<code>" [OPTIONS]
```

**Arguments:**
| Argument | Description |
|------------|-------------|
| `code` | Lisp expression to evaluate |

**Examples:**
```bash
# Simple math
veac lisp repl "(+ 1 2 3)"

# Get VESC values
veac lisp repl "(get-vin)"

# Define variable
veac lisp repl "(defvar my-rpm 1000)"

# Set motor RPM from Lisp
veac lisp repl "(set-rpm 1000)"
```

---

### `veac lisp read`

Read LispBM memory.

**Syntax:**
```bash
veac lisp read --address <addr> --length <bytes> [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--address <addr>` | Memory address (hex) |
| `--length <bytes>` | Bytes to read |
| `--format <format>` | Output format |

**Examples:**
```bash
# Read 64 bytes from address 0x20000000
veac lisp read --address 0x20000000 --length 64
```

---

### `veac lisp write`

Write data to LispBM memory.

**Syntax:**
```bash
veac lisp write <address> <data> [OPTIONS]
```

**Arguments:**
| Argument | Description |
|------------|-------------|
| `address` | Memory address (hex) |
| `data` | Hex data to write |

**Examples:**
```bash
# Write DEADBEEF to address 0x20000000
veac lisp write 0x20000000 "DEADBEEF"
```

---

### `veac lisp erase`

Erase the LispBM program.

**Syntax:**
```bash
veac lisp erase [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--yes` | Skip confirmation |

**Examples:**
```bash
veac lisp erase
veac lisp erase --yes
```

---

### `veac lisp reload`

Reload LispBM code.

**Syntax:**
```bash
veac lisp reload [OPTIONS]
```

**Examples:**
```bash
veac lisp reload
```

---

## Configuration Commands

### `veac config get-mc`

Read motor configuration.

**Syntax:**
```bash
veac config get-mc [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--output <file>` | Save to file |
| `--format <format>` | Output format |

**Examples:**
```bash
# Display to stdout
veac config get-mc

# Save to file
veac config get-mc --output motor-config.json

# JSON format
veac config get-mc --format json
```

---

### `veac config set-mc`

Write motor configuration.

**Syntax:**
```bash
veac config set-mc <file> [OPTIONS]
```

**Arguments:**
| Argument | Description |
|------------|-------------|
| `file` | Path to configuration file |

**Options:**
| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes |
| `--yes` | Skip confirmation |

**Examples:**
```bash
# Preview changes
veac config set-mc new-config.json --dry-run

# Apply configuration
veac config set-mc new-config.json

# Force apply
veac config set-mc new-config.json --yes
```

---

### `veac config get-app`

Read app configuration.

**Syntax:**
```bash
veac config get-app [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--output <file>` | Save to file |
| `--format <format>` | Output format |

**Examples:**
```bash
veac config get-app
veac config get-app --output app-config.json
```

---

### `veac config set-app`

Write app configuration.

**Syntax:**
```bash
veac config set-app <file> [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes |
| `--yes` | Skip confirmation |

**Examples:**
```bash
veac config set-app app-config.json --dry-run
veac config set-app app-config.json
```

---

### `veac config backup`

Backup all configurations.

**Syntax:**
```bash
veac config backup [OPTIONS]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--output <file>` | Output file | backup.json |

**Examples:**
```bash
# Default backup name
veac config backup

# Custom filename
veac config backup --output my-backup.json

# With timestamp
veac config backup --output backup-$(date +%Y%m%d).json
```

---

### `veac config restore`

Restore from backup.

**Syntax:**
```bash
veac config restore <file> [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes |
| `--yes` | Skip confirmation |

**Examples:**
```bash
veac config restore backup.json --dry-run
veac config restore backup.json
```

---

## Schema Commands

### `veac schema`

Get command schema information.

**Syntax:**
```bash
veac schema [command] [subcommand] [OPTIONS]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--format <format>` | Output format |

**Examples:**
```bash
# Full schema
veac schema

# Motor command schema
veac schema motor

# Specific subcommand
veac schema motor set-rpm

# JSON output
veac schema --format json
```

---

## Terminal Commands

### `veac terminal --repl`

Start interactive REPL mode.

**Syntax:**
```bash
veac terminal --repl [OPTIONS]
```

**Examples:**
```bash
# Start REPL
veac terminal --repl

# REPL with specific port
veac terminal --repl --port /dev/ttyACM0
```

---

### `veac terminal --command`

Execute a single terminal command.

**Syntax:**
```bash
veac terminal --command "<cmd>" [OPTIONS]
```

**Examples:**
```bash
veac terminal --command "motor set-rpm 1000"
veac terminal --command "can scan"
```

---

## Utility Commands

### `veac generate-completions`

Generate shell completion scripts.

**Syntax:**
```bash
veac generate-completions <shell>
```

**Arguments:**
| Argument | Description |
|------------|-------------|
| `shell` | Shell: bash, zsh, fish, powershell |

**Examples:**
```bash
# Bash
veac generate-completions bash > /etc/bash_completion.d/veac

# Zsh
veac generate-completions zsh > ~/.zsh/completions/_veac

# Fish
veac generate-completions fish > ~/.config/fish/completions/veac.fish

# PowerShell
veac generate-completions powershell | Out-String | Invoke-Expression
```

---

## Global Options Summary

Available on all commands:

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--port <path>` | `-p` | Serial port | Auto-detect |
| `--baud <rate>` | `-b` | Baud rate | 115200 |
| `--can-id <id>` | `-c` | CAN device ID | None |
| `--timeout <ms>` | `-t` | Timeout | 5000 |
| `--format <fmt>` | `-f` | Output format | table |
| `--dry-run` | `-n` | Preview only | false |
| `--yes` | `-y` | Skip prompts | false |
| `--verbose` | `-v` | Verbose output | false |
| `--help` | `-h` | Show help | - |
| `--version` | `-V` | Show version | - |
