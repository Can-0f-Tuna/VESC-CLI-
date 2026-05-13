# VESC CLI Command Reference

Complete reference for all `veac` commands organized by category.

## Command Status Legend

- **[Implemented]** — Working in current build
- **[Partial]** — Works but has known limitations (documented)
- **[Stub]** — Command exists but functionality is minimal/placeholder
- **[Missing]** — Not implemented (will return "command not found" or error)

## Device Commands

Connection and device management.

### `veac device connect [--port PORT]` [Implemented]

Connect to VESC on specified or auto-detected port.

**Options:**
- `--port, -p <path>` - Serial port path (e.g., `/dev/ttyACM0`, `COM3`)

**Examples:**
```bash
veac device connect
veac device connect --port /dev/ttyACM0
veac device connect --port COM3
```

### `veac device list-ports` [Implemented]

List available serial ports.

**Output:** Table of ports with device descriptions.

### `veac device disconnect` [Implemented]

Disconnect from current VESC.

### `veac device ping` [Implemented]

Check connection status. Returns device info if connected.

### `veac device info` [Implemented]

Get comprehensive device information (firmware version, hardware, UUID).

## Motor Commands

Motor control, telemetry, and diagnostics.

### `veac motor get-values [--format json|table]` [Implemented]

Get real-time telemetry data.

**Returns:**
- RPM, current (motor/battery), voltage
- Temperature (motor/controller)
- Duty cycle, wattage, fault codes

**Examples:**
```bash
veac motor get-values
veac motor get-values --format json
```

### `veac motor set-rpm <rpm> [--duration SECONDS]` [Implemented]

Set target RPM for velocity control mode.

**Parameters:**
- `rpm` - Target RPM (positive/negative for direction)
- `--duration` - Optional auto-stop after seconds

**Examples:**
```bash
veac motor set-rpm 1000
veac motor set-rpm -500
veac motor set-rpm 2000 --duration 10
```

### `veac motor set-current <amperes>` [Implemented]

Set motor current in amperes (torque control mode).

**Parameters:**
- `amperes` - Current value (positive = drive, negative = regen)

**Examples:**
```bash
veac motor set-current 5.0
veac motor set-current -2.0
```

### `veac motor set-duty <0.0-1.0>` [Implemented]

Set duty cycle (0.0 to 1.0 = 0% to 100%).

**Parameters:**
- `duty` - Duty cycle value (0.0 - 1.0)

**Examples:**
```bash
veac motor set-duty 0.5
veac motor set-duty 0.25
```

### `veac motor set-current-brake <amperes>` [Implemented]

Apply current-based braking.

**Parameters:**
- `amperes` - Brake current in amperes

**Examples:**
```bash
veac motor set-current-brake 2.0
```

### `veac motor stop` [Implemented]

Stop the motor immediately (sets all control values to 0).

### `veac motor detect [--current A] [--min-rpm RPM] [--low-duty DUTY]` [Implemented]

Auto-detect motor parameters (resistance, inductance, pole pairs).

**Status:** [Implemented] — Working in current build.

**Options:**
- `--current` - Detection current in amperes
- `--min-rpm` - Minimum RPM for detection
- `--low-duty` - Low duty cycle for detection

**Examples:**
```bash
veac motor detect
veac motor detect --current 5.0 --min-rpm 100
```

### `veac motor stream [--fields FIELDS] [--rate HZ] [--duration SECONDS]` [Implemented]

Stream telemetry data continuously.

**Status:** [Implemented] — Working in current build.

**Options:**
- `--fields` - Comma-separated field list (e.g., "rpm,temp_motor,voltage")
- `--rate` - Update rate in Hz (default: 10)
- `--duration` - Stream duration in seconds

**Examples:**
```bash
veac motor stream
veac motor stream --fields rpm,current_motor --rate 50
veac motor stream --duration 60
```

## CAN Bus Commands

Multi-device control via CAN bus.

### `veac can set-id <id>` [Implemented]

Set CAN ID for this VESC.

**Status:** [Implemented] — Working in current build.

**Parameters:**
- `id` - CAN bus ID (1-255)

**Examples:**
```bash
veac can set-id 1
veac can set-id 5
```

### `veac can scan` [Partial]

Scan for VESCs on CAN bus. Returns list of detected devices.

**Note:** Uses a naive polling approach, not proper `COMM_PING_CAN`.

**Output:** List of CAN IDs with device info.

### `veac can status` [Partial]

Get CAN bus status (error counters, bus state).

**Note:** Returns telemetry data, not actual CAN bus statistics.

### `veac can forward <can-id> <command...>` [Implemented]

Forward command to another VESC on CAN bus.

**Status:** [Implemented] — Working in current build.

**Parameters:**
- `can-id` - Target VESC CAN ID
- `command...` - Command to forward

**Examples:**
```bash
veac can forward 2 set-rpm 1000
veac can forward 3 get-values
veac can forward 1 stop
```

## LispBM Commands

Embedded Lisp scripting support.

### `veac lisp upload <file.lisp>` [Implemented]

Upload Lisp script to VESC.

**Parameters:**
- `file.lisp` - Path to Lisp source file

**Examples:**
```bash
veac lisp upload my-script.lisp
```

### `veac lisp start` [Implemented]

Start Lisp execution.

**Status:** [Implemented] — Working in current build.

### `veac lisp stop` [Implemented]

Stop Lisp execution.

**Status:** [Implemented] — Working in current build.

### `veac lisp get-stats` [Implemented]

Get Lisp interpreter statistics (memory usage, execution state).

**Status:** [Implemented] — Working in current build.

### `veac lisp repl "<code>"` [Implemented]

Execute REPL command.

**Parameters:**
- `code` - Lisp expression to evaluate

**Examples:**
```bash
veac lisp repl "(+ 1 2 3)"
veac lisp repl "(print \"Hello from Lisp\")"
```

### `veac lisp read --address ADDR --length BYTES` [Implemented]

Read Lisp memory at address.

**Status:** [Implemented] — Working in current build.

**Options:**
- `--address` - Memory address (hex or decimal)
- `--length` - Number of bytes to read

**Examples:**
```bash
veac lisp read --address 0x20000000 --length 64
```

### `veac lisp write <address> <data>` [Implemented]

Write data to Lisp memory.

**Status:** [Implemented] — Working in current build.

**Parameters:**
- `address` - Memory address
- `data` - Hex data string

**Examples:**
```bash
veac lisp write 0x20000000 "DEADBEEF"
```

### `veac lisp erase` [Implemented]

Erase Lisp program from memory.

### `veac lisp reload` [Implemented]

Reload Lisp code (re-upload from buffer).

**Status:** [Implemented] — Working in current build.

## Configuration Commands

Motor and app configuration management.

### `veac config get-mc [--output FILE]` [Implemented]

Read motor configuration.

**Options:**
- `--output, -o <file>` - Save to JSON file

**Examples:**
```bash
veac config get-mc
veac config get-mc --output motor-config.json
```

### `veac config set-mc <file>` [Implemented]

Write motor configuration.

**Parameters:**
- `file` - Path to motor config JSON file

**Examples:**
```bash
veac config set-mc motor-config.json
```

### `veac config get-app [--output FILE]` [Implemented]

Read app configuration.

**Options:**
- `--output, -o <file>` - Save to JSON file

### `veac config set-app <file>` [Implemented]

Write app configuration.

**Parameters:**
- `file` - Path to app config JSON file

### `veac config backup [--output FILE]` [Implemented]

Backup all configurations (motor + app).

**Options:**
- `--output, -o <file>` - Backup file path (optional; defaults to a generated filename if omitted)

**Examples:**
```bash
veac config backup
veac config backup --output backup-$(date +%Y%m%d).json
```

### `veac config restore <file>` [Implemented]

Restore configurations from backup.

**Parameters:**
- `file` - Path to backup JSON file

**Examples:**
```bash
veac config restore backup-20260115.json
```

## Firmware Commands

Firmware management.

### `veac firmware info` [Implemented]

Get firmware information (version, hardware target).

**Status:** [Implemented] — Working in current build.

### `veac firmware update --file <firmware.bin>` [Implemented]

Update VESC firmware.

**Status:** [Implemented] — Working in current build.

**Options:**
- `--file, -f <path>` - Path to firmware binary

**Examples:**
```bash
veac firmware update --file VESC_6_00.bin
```

## Terminal/REPL Commands

Interactive terminal mode.

### `veac terminal --repl` [Implemented]

Enter interactive REPL mode for direct VESC communication.

**Status:** [Implemented] — Working in current build.

### `veac terminal --command "<cmd>"` [Implemented]

Execute single terminal command.

**Status:** [Implemented] — Working in current build.

**Examples:**
```bash
veac terminal --command "ping"
veac terminal --command "firmware_version"
```

## Schema Commands

Command introspection for AI agents.

### `veac schema` [Implemented]

Get full command schema (all commands with parameters).

### `veac schema <command>` [Implemented]

Get schema for specific command.

**Examples:**
```bash
veac schema motor
veac schema can
```

### `veac schema <command> <subcommand>` [Implemented]

Get schema for specific subcommand.

**Examples:**
```bash
veac schema motor set-rpm
veac schema config get-mc
```

## Utility Commands

### `veac generate-completions <shell>` [Implemented]

Generate shell completion scripts.

**Parameters:**
- `shell` - One of: bash, zsh, fish, powershell

**Examples:**
```bash
veac generate-completions bash > /etc/bash_completion.d/veac
veac generate-completions zsh > ~/.zsh/completions/_veac
veac generate-completions fish > ~/.config/fish/completions/veac.fish
veac generate-completions powershell | Out-String | Invoke-Expression
```

## Parameter Reference

### Common Data Types

| Type | Format | Example |
|------|--------|---------|
| RPM | Integer | `1000`, `-500` |
| Current | Float (A) | `5.0`, `-2.5` |
| Duty | Float (0.0-1.0) | `0.5`, `0.25` |
| CAN ID | Integer (1-255) | `1`, `5`, `10` |
| Address | Hex or decimal | `0x20000000`, `536870912` |
| Port | String | `/dev/ttyACM0`, `COM3` |
| Timeout | Integer (ms) | `5000`, `10000` |
| Baud | Integer | `115200`, `921600` |

### Telemetry Fields (motor get-values)

| Field | Unit | Description |
|-------|------|-------------|
| rpm | RPM | Motor speed |
| current_motor | A | Motor phase current |
| current_battery | A | Battery current |
| voltage | V | Battery voltage |
| temp_motor | °C | Motor temperature |
| temp_controller | °C | Controller temperature |
| duty_cycle | 0-1 | PWM duty cycle |
| wattage | W | Power consumption |
| fault_code | Integer | Fault code (0 = none) |

### Fault Codes

| Code | Meaning |
|------|---------|
| 0 | None |
| 1 | Overcurrent (phase) |
| 2 | Overvoltage |
| 3 | Undervoltage |
| 4 | Motor stalled |
| 5 | Overcurrent (ABS) |
| 6 | Timeout |
| 7 | Encoder error |
| 8 | Precharge error |
| 9 | HW error |
| 10 | Sensor error |

Always check fault codes with `veac motor get-values` after motor operations.

### Notes

**--dry-run:**
Note: `--dry-run` returns a placeholder response for most commands and does not show real configuration diffs.

**Platform Compatibility:**
Bash examples in this document use `$(date +%Y%m%d)` and `sleep`, which are Linux/macOS specific.
- Windows PowerShell equivalents: `Get-Date -Format "yyyyMMdd"` and `Start-Sleep -Seconds 5`
