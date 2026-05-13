# VESC CLI Agent Guide

## ⚠️ Implementation Status

This guide documents the full intended API. All planned commands are now implemented, with a few noted caveats:

- **[Implemented]** — Working in current build
- **[Partial]** — Basic functionality exists but may have limitations
- **[Missing]** — Not yet implemented

> **Scope Note:** The VESC protocol supports 160+ packet IDs, but this CLI currently exposes approximately 40 commands.

## Quick Reference for AI Agents

### Connection

```bash
# Auto-detect and connect
veac device connect                                [Implemented]

# Connect to specific port
veac device connect --port /dev/ttyACM0            [Implemented]

# List available ports
veac device list-ports                             [Implemented]

# Disconnect from current device
veac device disconnect                             [Implemented]

# Get device info
veac device info                                   [Implemented]

# Ping device
veac device ping                                   [Implemented]
```

### Motor Control

```bash
# Get telemetry
veac motor get-values                              [Implemented]

# Set RPM
veac motor set-rpm 1000                            [Implemented]

# Set current
veac motor set-current 5.0                         [Implemented]

# Set duty cycle
veac motor set-duty 0.5                            [Implemented]

# Stop motor
veac motor stop                                    [Implemented]

# Apply brake
veac motor set-current-brake 2.0                   [Implemented]

# Detect motor parameters
veac motor detect                                  [Implemented]

# Stream telemetry continuously
veac motor stream                                  [Implemented]
```

### CAN Bus Operations

```bash
# Set CAN ID for this VESC
veac can set-id 1                                  [Implemented]

# Scan for VESCs on CAN bus
veac can scan                                      [Partial]

# Get CAN bus status
veac can status                                    [Partial]

# Forward command to another VESC on CAN bus
veac can forward 2 set-rpm 1000                    [Implemented]
veac can forward 2 get-values                      [Implemented]
```

> **CAN Bus Caveats:** `can scan` currently uses naive polling rather than the proper `COMM_PING_CAN` protocol command. `can status` returns general telemetry data, not actual CAN bus statistics.

### LispBM Scripting

```bash
# Upload Lisp script
veac lisp upload script.lisp                       [Implemented]

# Start Lisp execution
veac lisp start                                    [Implemented]

# Stop Lisp execution
veac lisp stop                                     [Implemented]

# Get Lisp statistics
veac lisp get-stats                                [Implemented]

# Execute REPL command
veac lisp repl "(+ 1 2 3)"                         [Implemented]

# Read Lisp memory
veac lisp read --address 0x20000000 --length 64  [Implemented]

# Write Lisp memory
veac lisp write 0x20000000 "DEADBEEF"              [Implemented]

# Erase Lisp program
veac lisp erase                                    [Implemented]

# Reload Lisp code
veac lisp reload                                   [Implemented]
```

### Configuration

```bash
# Read motor configuration
veac config get-mc                                 [Implemented]
veac config get-mc --output mc-config.json         [Implemented]

# Write motor configuration
veac config set-mc mc-config.json                  [Implemented]

# Read app configuration
veac config get-app                                [Implemented]
veac config get-app --output app-config.json       [Implemented]

# Write app configuration
veac config set-app app-config.json                [Implemented]

# Backup all configurations (output is optional, has default)
veac config backup                                 [Implemented]
veac config backup --output my-backup.json         [Implemented]

# Restore from backup
veac config restore my-backup.json                  [Implemented]
```

> **Config Notes:** `config backup` now works without `--output` using a sensible default filename. `--dry-run` on config commands returns a placeholder response and does not show real diffs or validate against current device settings.

### Terminal/REPL Mode

```bash
# Interactive REPL mode
veac terminal --repl                               [Implemented]

# Execute single command
veac terminal --command "motor set-rpm 1000"       [Implemented]
```

### Firmware Management

```bash
# Get firmware info
veac firmware info                                 [Implemented]

# Update firmware
veac firmware update                               [Implemented]
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Connection failed |
| 4 | Timeout |
| 5 | Protocol error |
| 6 | Not found |
| 7 | Permission denied |
| 10 | Dry run success |

### Schema Introspection

```bash
# Get full schema
veac schema                                        [Implemented]

# Get schema for specific command
veac schema motor                                  [Implemented]

# Get schema for specific subcommand
veac schema motor set-rpm                          [Implemented]
```

### Error Handling

All commands return JSON. Check `ok` field:
- `ok: true` - Success, use `result`
- `ok: false` - Failure, check `error` and `fix`

Example success response:
```json
{
  "ok": true,
  "command": "motor set-rpm",
  "result": {"rpm": 1000},
  "next_actions": [...]
}
```

Example error response:
```json
{
  "ok": false,
  "command": "motor set-rpm",
  "error": "Connection failed",
  "error_kind": "connection",
  "suggestion": "Check port and try again",
  "next_actions": [...]
}
```

### HATEOAS Navigation

Every response includes `next_actions` - an array of suggested next commands:

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

Use these to guide agent workflow and provide context-aware suggestions.

### Safety Considerations

- Always check fault codes after motor operations
- Use `--dry-run` to preview changes without executing (see caveats above)
- Monitor temperature with `motor get-values`
- Stop motor before disconnecting or changing configurations
- Verify CAN bus wiring before scanning

### Common Workflows

**Motor Tuning:**
```bash
# 1. Check current status
veac motor get-values

# 2. Set low current for testing
veac motor set-current 2.0

# 3. Test at different RPMs
veac motor set-rpm 500
veac motor set-rpm 1000
veac motor set-rpm 2000

# 4. Stop and verify
veac motor stop
veac motor get-values
```

**Configuration Backup:**
```bash
# 1. Backup current settings
veac config backup --output backup-$(date +%Y%m%d).json

# 2. Modify settings as needed
veac config get-mc --output mc-temp.json
# Edit mc-temp.json

# 3. Apply changes
veac config set-mc mc-temp.json

# 4. Verify changes
veac motor get-values
```

**Multi-VESC Setup:**
> **Note:** The `can scan` step is [Partial] (uses naive polling). `can status` is also [Partial] (returns telemetry, not true CAN statistics).

```bash
# 1. Set unique CAN IDs for each VESC
veac can set-id 1 --port /dev/ttyACM0
veac can set-id 2 --port /dev/ttyACM1

# 2. Connect via CAN bus

# 3. Scan for all devices
veac can scan

# 4. Control specific VESCs
veac can forward 1 set-rpm 1000
veac can forward 2 set-rpm 1000
```

### Environment Variables

```bash
# Default serial port
export VEAC_PORT=/dev/ttyACM0

# Default baud rate
export VEAC_BAUD=115200

# Default CAN ID
export VEAC_CAN_ID=1
```

### Dry Run Mode

Use `--dry-run` to preview operations without executing:

```bash
# Preview motor command
veac motor set-rpm 1000 --dry-run

# Preview config write
veac config set-mc config.json --dry-run
```

> **Dry Run Honesty:** For most commands, `--dry-run` returns a placeholder response showing the command structure and intended target. It does **not** perform real validation against current device settings, show actual configuration diffs, or verify file contents against the device. It is useful for:
> - Understanding what a command would do structurally
> - Testing agent workflows
> - But **not** for deep validation or diff previews

### Debugging

```bash
# Verbose output
veac device connect --verbose

# Extended timeout
veac motor get-values --timeout 10000

# Check specific error
veac device ping
veac device info
```

### Platform Notes

The bash examples in this guide assume Linux/macOS syntax:

| Feature | Linux/macOS | Windows PowerShell |
|---------|-------------|-------------------|
| Serial port path | `/dev/ttyACM0` | `COM3` (or actual COM port) |
| Environment variables | `export VAR=value` | `$env:VAR = "value"` |
| Date expansion | `$(date +%Y%m%d)` | `$(Get-Date -Format "yyyyMMdd")` |
| Redirect to file | `> file` | `\| Out-File file` |

The CLI itself works identically across platforms; only the shell syntax differs.

### JSON Output Structure

All responses follow this structure:

```typescript
interface SuccessResponse {
  ok: true;
  command: string;
  result: object;
  next_actions: NextAction[];
}

interface ErrorResponse {
  ok: false;
  command: string;
  error: string;
  error_kind: string;
  suggestion?: string;
  next_actions: NextAction[];
}

interface NextAction {
  command: string;
  description: string;
  params?: object;
}
```

### Generating Shell Completions [Implemented]

```bash
# Bash
veac generate-completions bash > /etc/bash_completion.d/veac

# Zsh
veac generate-completions zsh > /usr/share/zsh/site-functions/_veac

# Fish
veac generate-completions fish > ~/.config/fish/completions/veac.fish

# PowerShell
veac generate-completions powershell | Out-String | Invoke-Expression
```
