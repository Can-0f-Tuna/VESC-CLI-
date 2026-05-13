---
name: vesc-skill
displayName: VESC CLI (veac)
description: "Comprehensive guidance for controlling VESC motor controllers via the veac CLI. Use for BLDC/FOC motor control, CAN bus, LispBM scripting, and VESC automation."
---

# VESC CLI (veac) Skill

## Description

This skill provides comprehensive guidance for controlling VESC (Vedder Electronic Speed Controller) motor controllers via the `veac` command-line interface. Use this skill when working with BLDC/FOC motor control, CAN bus communication, LispBM scripting, motor configuration, or any VESC-related automation tasks.

## Triggers

This skill should be loaded when users mention:
- VESC, veac, vedder
- Motor controller, BLDC, FOC, brushless motor
- CAN bus, CAN communication
- LispBM, Lisp scripting
- Motor configuration, MC configuration
- Real-time telemetry, motor monitoring

---

## Quick Start

### Connect to VESC

```bash
# Auto-detect and connect
veac device connect

# Connect to specific port
veac device connect --port /dev/ttyACM0        # Linux
veac device connect --port COM3                # Windows

# List available ports
veac device list-ports
```

### Basic Motor Control

```bash
# Get real-time telemetry
veac motor get-values

# Set RPM
veac motor set-rpm 1000

# Set current (amps)
veac motor set-current 5.0

# Stop motor
veac motor stop
```

---

## Command Categories

### Device Operations

Commands for connecting and managing the VESC connection:

| Command | Description |
|---------|-------------|
| `veac device connect [--port PORT]` | Connect to VESC |
| `veac device list-ports` | List available serial ports |
| `veac device disconnect` | Disconnect from VESC |
| `veac device ping` | Check connection status |
| `veac device info` | Get device information |

### Motor Control

Commands for controlling the motor:

| Command | Description |
|---------|-------------|
| `veac motor get-values` | Get telemetry (RPM, current, voltage, temp, faults) |
| `veac motor set-rpm <rpm>` | Set target RPM |
| `veac motor set-current <amperes>` | Set motor current |
| `veac motor set-duty <0.0-1.0>` | Set duty cycle |
| `veac motor set-current-brake <amperes>` | Apply current brake |
| `veac motor stop` | Stop the motor |
| `veac motor detect` | Auto-detect motor parameters |
| `veac motor stream` | Stream telemetry data |

### CAN Bus Operations

Commands for CAN bus communication:

| Command | Description |
|---------|-------------|
| `veac can set-id <id>` | Set CAN ID for this VESC |
| `veac can scan` | Scan for VESCs on CAN bus |
| `veac can status` | Get CAN bus status |
| `veac can forward <id> <command...>` | Forward command to another VESC |

### LispBM Scripting

Commands for LispBM programming:

| Command | Description |
|---------|-------------|
| `veac lisp upload <file.lisp>` | Upload Lisp script |
| `veac lisp start` | Start Lisp execution |
| `veac lisp stop` | Stop Lisp execution |
| `veac lisp get-stats` | Get Lisp statistics |
| `veac lisp repl "<code>"` | Execute REPL command |
| `veac lisp read --address ADDR --length BYTES` | Read Lisp memory |
| `veac lisp write <address> <data>` | Write Lisp memory |
| `veac lisp erase` | Erase Lisp program |
| `veac lisp reload` | Reload Lisp code |

### Configuration

Commands for managing VESC configuration:

| Command | Description |
|---------|-------------|
| `veac config get-mc` | Read motor configuration |
| `veac config get-mc --output mc.json` | Save motor config to file |
| `veac config set-mc <file>` | Write motor configuration |
| `veac config get-app` | Read app configuration |
| `veac config get-app --output app.json` | Save app config to file |
| `veac config set-app <file>` | Write app configuration |
| `veac config backup --output file.json` | Backup all configurations |
| `veac config restore <file>` | Restore from backup |

### Schema & Introspection

Commands for discovering available commands:

| Command | Description |
|---------|-------------|
| `veac schema` | Get full command schema |
| `veac schema motor` | Get motor command schema |
| `veac schema motor set-rpm` | Get specific command schema |

---

## Global Options

Available on all commands:

| Option | Description | Example |
|--------|-------------|---------|
| `--port, -p <path>` | Serial port path | `--port /dev/ttyACM0` |
| `--baud, -b <rate>` | Baud rate (default: 115200) | `--baud 115200` |
| `--can-id, -c <id>` | CAN device ID | `--can-id 1` |
| `--timeout, -t <ms>` | Timeout in milliseconds (default: 5000) | `--timeout 10000` |
| `--format, -f <format>` | Output format: `json`, `yaml`, `table` | `--format json` |
| `--dry-run, -n` | Preview without executing | `--dry-run` |
| `--yes, -y` | Skip confirmations | `--yes` |
| `--verbose, -v` | Verbose output to stderr | `--verbose` |

---

## Environment Variables

Set defaults to avoid typing common options:

```bash
# Default serial port
export VEAC_PORT=/dev/ttyACM0

# Default baud rate
export VEAC_BAUD=115200

# Default CAN ID
export VEAC_CAN_ID=1
```

**On Windows (PowerShell):**
```powershell
$env:VEAC_PORT = "COM3"
$env:VEAC_BAUD = "115200"
$env:VEAC_CAN_ID = "1"
```

---

## Exit Codes

| Code | Meaning | When to Check |
|------|---------|---------------|
| 0 | Success | Command executed successfully |
| 1 | General error | Check error message for details |
| 2 | Connection failed | Verify port and VESC is powered |
| 3 | Timeout | Increase timeout or check connection |
| 4 | Invalid argument | Check command syntax and parameters |
| 5 | Protocol error | Check VESC firmware compatibility |

---

## JSON Response Format

All commands return structured JSON. Check the `ok` field to determine success:

### Success Response

```json
{
  "ok": true,
  "command": "motor set-rpm",
  "result": {
    "rpm": 1000,
    "current_motor": 5.2,
    "v_in": 24.5,
    "temp_mos": 35.2,
    "temp_motor": 28.5,
    "fault_code": 0
  },
  "next_actions": [
    {
      "command": "motor stop",
      "description": "Stop the motor"
    },
    {
      "command": "motor get-values",
      "description": "Check motor status"
    }
  ]
}
```

### Error Response

```json
{
  "ok": false,
  "command": "motor set-rpm",
  "error": "Connection failed",
  "error_kind": "connection",
  "suggestion": "Check port and try again",
  "next_actions": [
    {
      "command": "device connect",
      "description": "Connect to VESC"
    },
    {
      "command": "device list-ports",
      "description": "List available ports"
    }
  ]
}
```

---

## HATEOAS Navigation

Every response includes `next_actions` - suggested next commands based on context:

```json
{
  "next_actions": [
    {
      "command": "motor stop",
      "description": "Stop the motor"
    },
    {
      "command": "motor get-values",
      "description": "Check motor status"
    }
  ]
}
```

Use these to:
- Guide agent workflow
- Provide context-aware suggestions
- Build automated sequences

---

## Safety Best Practices

⚠️ **CRITICAL: Motor controllers can cause serious injury**

### 1. Physical Safety
- **Always disconnect power** before working on motors or wiring
- **Secure rotating parts** - motors can start unexpectedly
- **Use appropriate PPE** - safety glasses, gloves when handling high current
- **Clear the work area** of loose clothing, jewelry, or tools

### 2. Pre-Operation Checks
```bash
# Check connection and status before any motor operation
veac device ping
veac motor get-values

# Monitor temperature before running
# Safe operating temp: MOSFET < 80°C, Motor < 100°C
```

### 3. Safe Testing Protocol
```bash
# 1. Use dry-run first
veac motor set-rpm 1000 --dry-run

# 2. Start with low values
veac motor set-current 1.0

# 3. Verify before increasing
veac motor get-values

# 4. Always be ready to stop
veac motor stop
```

### 4. Configuration Safety
```bash
# Backup before any changes
veac config backup --output pre-change-backup.json

# Preview changes with dry-run
veac config set-mc new-config.json --dry-run

# Verify after applying
veac motor get-values
```

### 5. Fault Monitoring
```bash
# Check for faults after operations
veac motor get-values | grep fault_code

# Common fault codes:
# 0 = No fault
# 1 = Over-voltage
# 2 = Under-voltage
# 3 = DRV8302
# 4 = ABS_OVER_CURRENT
# 5 = OVER_TEMP_FET
# 6 = OVER_TEMP_MOTOR
```

---

## Common Workflows

### Motor Testing Workflow

```bash
# 1. Connect and verify
veac device connect
veac device ping

# 2. Check current status
veac motor get-values

# 3. Test with low current first
veac motor set-current 2.0
sleep 3

# 4. Stop and check for faults
veac motor stop
veac motor get-values

# 5. If no faults, test RPM control
veac motor set-rpm 500
sleep 3
veac motor set-rpm 1000
sleep 3
veac motor stop
```

### Configuration Backup & Restore

```bash
# Backup all configurations
veac config backup --output backup-$(date +%Y%m%d).json

# Modify specific config
veac config get-mc --output mc-temp.json
# Edit mc-temp.json manually

# Preview changes
veac config set-mc mc-temp.json --dry-run

# Apply if preview looks correct
veac config set-mc mc-temp.json

# Verify
veac motor get-values
```

### Multi-VESC CAN Setup

```bash
# Set up first VESC (via USB)
veac device connect --port /dev/ttyACM0
veac can set-id 1

# Set up second VESC
veac device connect --port /dev/ttyACM1
veac can set-id 2

# Now control via CAN bus
veac device connect --port /dev/ttyACM0  # Connect to any VESC on the bus
veac can scan  # Should see both VESCs

# Control specific VESC
veac can forward 1 set-rpm 1000
veac can forward 2 set-rpm 1000
veac can forward 1 motor get-values
```

### Real-time Monitoring

```bash
# Stream telemetry at 10Hz for 30 seconds
veac motor stream --fields "rpm,v_in,current_motor,temp_mos" --rate 10 --duration 30

# Or using shell loop
while true; do
  veac motor get-values --format json
  sleep 1
done
```

---

## Reference Files

| File | Contents |
|------|----------|
| `commands.md` | Complete command reference with all options |
| `examples.md` | Practical code examples and automation scripts |
| `safety.md` | Detailed safety guidelines and warnings |
| `troubleshooting.md` | Problem solving and debugging |

---

## Tips for AI Agents

### When to Use This Skill

✅ **Use when:**
- User asks about VESC, motor controllers, or BLDC motors
- Task involves CAN bus communication with VESCs
- User needs to upload or run LispBM scripts
- Configuration backup/restore is needed
- Real-time motor monitoring is required

❌ **Don't use when:**
- User is asking about generic motor theory (not VESC-specific)
- Task involves non-VESC hardware
- Pure electronics questions without CLI context

### Response Patterns

1. **Always include safety warnings** for motor control commands
2. **Suggest dry-run first** for configuration changes
3. **Include HATEOAS context** - what to do next
4. **Reference JSON structure** when discussing output
5. **Check exit codes** in automation scenarios

### Command Construction Tips

- Use `--format json` when parsing output programmatically
- Set environment variables to simplify commands
- Use `--dry-run` to validate before executing
- Chain commands with `&&` for dependent operations
