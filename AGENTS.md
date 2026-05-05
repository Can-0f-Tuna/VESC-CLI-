# VESC CLI Agent Guide

## Quick Reference for AI Agents

### Connection

```bash
# Auto-detect and connect
veac device connect

# Connect to specific port
veac device connect --port /dev/ttyACM0

# List available ports
veac device list-ports
```

### Motor Control

```bash
# Get telemetry
veac motor get-values

# Set RPM
veac motor set-rpm 1000

# Set current
veac motor set-current 5.0

# Set duty cycle
veac motor set-duty 0.5

# Stop motor
veac motor stop

# Apply brake
veac motor set-current-brake 2.0
```

### CAN Bus Operations

```bash
# Set CAN ID for this VESC
veac can set-id 1

# Scan for VESCs on CAN bus
veac can scan

# Get CAN bus status
veac can status

# Forward command to another VESC on CAN bus
veac can forward 2 set-rpm 1000
veac can forward 2 get-values
```

### LispBM Scripting

```bash
# Upload Lisp script
veac lisp upload script.lisp

# Start Lisp execution
veac lisp start

# Stop Lisp execution
veac lisp stop

# Get Lisp statistics
veac lisp get-stats

# Execute REPL command
veac lisp repl "(+ 1 2 3)"

# Read Lisp memory
veac lisp read --address 0x20000000 --length 64

# Write Lisp memory
veac lisp write 0x20000000 "DEADBEEF"

# Erase Lisp program
veac lisp erase

# Reload Lisp code
veac lisp reload
```

### Configuration

```bash
# Read motor configuration
veac config get-mc
veac config get-mc --output mc-config.json

# Write motor configuration
veac config set-mc mc-config.json

# Read app configuration
veac config get-app
veac config get-app --output app-config.json

# Write app configuration
veac config set-app app-config.json

# Backup all configurations
veac config backup --output my-backup.json

# Restore from backup
veac config restore my-backup.json
```

### Terminal/REPL Mode

```bash
# Interactive REPL mode
veac terminal --repl

# Execute single command
veac terminal --command "motor set-rpm 1000"
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Connection failed |
| 3 | Timeout |
| 4 | Invalid argument |
| 5 | Protocol error |

### Schema Introspection

```bash
# Get full schema
veac schema

# Get schema for specific command
veac schema motor

# Get schema for specific subcommand
veac schema motor set-rpm
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
- Use `--dry-run` to preview changes without executing
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

This is useful for:
- Validating configuration files
- Understanding what a command would do
- Testing agent workflows

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

### Generating Shell Completions

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
