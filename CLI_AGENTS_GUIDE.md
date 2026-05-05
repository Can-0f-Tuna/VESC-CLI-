# VESC CLI - Quick Reference for AI Agents

## Installation
```bash
# Via cargo (Rust package manager)
cargo install vesc-cli

# Or download pre-built binary from releases
```

## Getting Started

### 1. Discover Capabilities
```bash
# Get full command schema
vesc-cli schema --format json

# Get help for specific command
vesc-cli motor set-rpm --help
```

### 2. Connect to Device
```bash
# List available ports
vesc-cli device list-ports --format json

# Connect to specific port
vesc-cli device connect --port /dev/ttyACM0

# Get device info
vesc-cli device info --format json
```

### 3. Control Motor
```bash
# Get current values
vesc-cli motor get-values --format json

# Set RPM (returns immediately, motor keeps running)
vesc-cli motor set-rpm 5000

# Set current
vesc-cli motor set-current 10.5

# Stop motor
vesc-cli motor stop

# Run for specific duration
vesc-cli motor set-rpm 3000 --duration 10
```

## Common Workflows

### Motor Configuration
```bash
# 1. Read current config
vesc-cli config get-mc --output current_mc.xml

# 2. (Modify XML file as needed)

# 3. Apply new config (dry-run first)
vesc-cli config set-mc --input new_mc.xml --dry-run

# 4. Apply for real
vesc-cli config set-mc --input new_mc.xml
```

### Motor Detection (Auto-Configure)
```bash
# Detect motor parameters
vesc-cli motor detect \
  --current 5.0 \
  --min-rpm 100 \
  --low-duty 0.1 \
  --format json
```

### Real-time Monitoring
```bash
# Stream motor values for 60 seconds
vesc-cli motor stream \
  --fields rpm,current_motor,v_in,temp_mos \
  --rate 10hz \
  --duration 60 \
  --format json
```

### Firmware Update
```bash
# Check current firmware
vesc-cli firmware info --format json

# Update (dry-run first)
vesc-cli firmware update --file firmware.bin --dry-run

# Update for real
vesc-cli firmware update --file firmware.bin
```

## Output Formats

All commands support `--format` flag:
- `json` (default in non-TTY) - Machine-readable
- `yaml` - Human-readable structured
- `table` (default in TTY) - Human-readable table

## Exit Codes

| Code | Meaning | Agent Action |
|------|---------|--------------|
| 0 | Success | Continue |
| 1 | General Error | Check stderr |
| 2 | Invalid Arguments | Fix command |
| 3 | Connection Failed | Retry or check port |
| 4 | Timeout | Retry with longer timeout |
| 5 | Protocol Error | Check VESC state |
| 6 | Not Found | Resource doesn't exist |
| 10 | Dry Run Success | Safe to execute |

## Global Options

Available on all commands:
- `--port, -p` - Serial port path
- `--can-id, -c` - CAN bus device ID for forwarding
- `--baud, -b` - Baud rate (default: 115200)
- `--timeout, -t` - Timeout in ms (default: 5000)
- `--format, -f` - Output format
- `--dry-run, -n` - Preview without executing
- `--yes, -y` - Skip confirmations
- `--verbose, -v` - Verbose logging (to stderr)

## Safety Best Practices

1. **Always use --dry-run first** for config changes
2. **Check fault codes** after motor operations
3. **Use --duration** for motor commands in scripts
4. **Verify connection** with `device ping` before critical operations
5. **Handle exit codes** appropriately in automation

## Troubleshooting

### Connection Issues
```bash
# Check if VESC is detected
vesc-cli device list-ports

# Try with explicit port and verbose output
vesc-cli device connect --port /dev/ttyACM0 --verbose
```

### Protocol Errors
```bash
# Check firmware version compatibility
vesc-cli device info

# Reset connection
vesc-cli device disconnect && vesc-cli device connect
```

### Script Debugging
```bash
# Use verbose mode to see protocol traffic
vesc-cli motor get-values --verbose 2>debug.log

# Check JSON output validity
vesc-cli motor get-values --format json | jq .
```

## Example Agent Script

```python
#!/usr/bin/env python3
"""Example AI agent using VESC CLI."""

import subprocess
import json
import sys

def run_vesc_cli(args):
    """Run vesc-cli command and return parsed result."""
    cmd = ["vesc-cli"] + args + ["--format", "json"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        error = json.loads(result.stderr) if result.stderr else {"error": "unknown"}
        raise Exception(f"VESC CLI error: {error}")
    
    return json.loads(result.stdout)

def main():
    # Connect to VESC
    print("Connecting to VESC...")
    result = run_vesc_cli(["device", "connect", "--port", "/dev/ttyACM0"])
    print(f"Connected: {result}")
    
    # Get current values
    print("\nGetting motor values...")
    values = run_vesc_cli(["motor", "get-values"])
    print(f"RPM: {values['rpm']}, Current: {values['current_motor']}A")
    
    # Check for faults
    if values['fault_code'] != 'FAULT_CODE_NONE':
        print(f"WARNING: Fault detected: {values['fault_str']}")
        sys.exit(1)
    
    # Run motor test
    print("\nRunning motor test at 1000 RPM for 5 seconds...")
    run_vesc_cli(["motor", "set-rpm", "1000", "--duration", "5"])
    
    # Check results
    values = run_vesc_cli(["motor", "get-values"])
    print(f"Test complete. Final RPM: {values['rpm']}")
    
    # Stop motor
    print("\nStopping motor...")
    run_vesc_cli(["motor", "stop"])
    
    print("\nAll operations completed successfully!")

if __name__ == "__main__":
    main()
```
