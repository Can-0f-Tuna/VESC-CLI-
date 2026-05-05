# VESC CLI Troubleshooting Guide

Solutions for common problems and debugging techniques.

---

## Connection Issues

### Problem: "Connection failed" or "No device found"

**Symptoms:**
```
Error: Connection failed
Error kind: connection
Suggestion: Check port and try again
```

**Diagnosis Steps:**

1. **Check physical connection**
   ```bash
   # Verify cable is firmly connected
   # Try a different USB cable
   # Check for loose connections
   ```

2. **List available ports**
   ```bash
   veac device list-ports
   
   # On Linux, also check:
   ls -la /dev/ttyACM* /dev/ttyUSB*
   
   # On macOS:
   ls -la /dev/tty.* /dev/cu.*
   
   # On Windows (PowerShell):
   Get-PnpDevice -Class "Ports"
   ```

3. **Check permissions (Linux/macOS)**
   ```bash
   # Add user to dialout group
   sudo usermod -a -G dialout $USER
   
   # Or run with sudo (temporary)
   sudo veac device connect --port /dev/ttyACM0
   
   # Alternative: set device permissions
   sudo chmod 666 /dev/ttyACM0
   ```

4. **Check if port is in use**
   ```bash
   # Linux
   lsof /dev/ttyACM0
   
   # macOS
   lsof | grep tty.usb
   
   # If in use, kill the process or disconnect other software
   ```

5. **Verify VESC is powered**
   ```bash
   # Check VESC LEDs
   # - Power LED should be on
   # - Activity LED should blink when connected
   ```

**Solutions:**

| Cause | Solution |
|-------|----------|
| Wrong port | Use `veac device list-ports` to find correct port |
| No permissions | Add user to `dialout` group (Linux) |
| Port in use | Close other software using the port |
| Cable issue | Try different USB cable |
| Driver issue | Install CH340/CP2102/FTDI drivers |

### Problem: "Timeout waiting for response"

**Symptoms:**
```
Error: Timeout
Error kind: timeout
```

**Solutions:**

1. **Increase timeout**
   ```bash
   veac device connect --timeout 10000
   veac motor get-values --timeout 10000
   ```

2. **Check baud rate**
   ```bash
   # Standard VESC baud rate
   veac device connect --baud 115200
   
   # Some custom firmware may use different rates
   veac device connect --baud 921600
   ```

3. **Reset VESC**
   ```bash
   # Power cycle the VESC
   # Wait 5 seconds after power on before connecting
   ```

### Problem: Intermittent connection drops

**Symptoms:**
- Random disconnections
- Commands sometimes fail
- "Connection lost" errors

**Solutions:**

1. **Check USB cable quality**
   - Use high-quality, shielded USB cable
   - Keep cable away from motor wires
   - Maximum cable length: 3 meters

2. **Add ferrite beads**
   ```bash
   # Install ferrite beads on USB cable
   # This helps with EMI from motor PWM
   ```

3. **Use USB isolator**
   ```bash
   # For high-power applications
   # USB isolator prevents ground loops
   ```

---

## Protocol Errors

### Problem: "Protocol error" or "Invalid response"

**Symptoms:**
```
Error: Protocol error
Error kind: protocol
```

**Diagnosis:**

1. **Check firmware compatibility**
   ```bash
   veac device info --format json
   
   # Verify firmware version matches veac version
   # Check: https://github.com/vedderb/vesc_tool/releases
   ```

2. **Update VESC firmware**
   ```bash
   # Use VESC Tool to update firmware
   # veac does not support firmware flashing
   ```

3. **Check packet corruption**
   ```bash
   # Enable verbose mode
   veac device connect --verbose
   
   # Look for CRC errors or malformed packets
   ```

### Problem: "Unknown command" or "Command not supported"

**Symptoms:**
```
Error: Command not supported
Error kind: protocol
```

**Solutions:**

1. **Check command availability**
   ```bash
   # Get available commands
   veac schema
   
   # Check specific command
   veac schema motor
   ```

2. **Verify firmware version**
   ```bash
   veac device info
   
   # Some commands require specific firmware
   # e.g., LispBM requires 6.0+
   ```

---

## Motor Won't Spin

### Problem: Motor doesn't respond to commands

**Symptoms:**
```
veac motor set-rpm 1000
# No response, motor stationary
# No errors reported
```

**Diagnosis Steps:**

1. **Check for faults**
   ```bash
   veac motor get-values --format json | jq '.result.fault_code'
   # Should be 0
   
   # Check all values
   veac motor get-values
   ```

2. **Verify configuration**
   ```bash
   # Check motor type is set
   veac config get-mc --format json | jq '.motor_type'
   
   # Should be 0 (FOC) or 1 (BLDC), not 2 (DC)
   ```

3. **Check detection status**
   ```bash
   # Run detection if not done
   veac motor detect --current 5.0
   
   # Save detection results
   ```

4. **Verify wiring**
   ```bash
   # Check phase wires (A, B, C)
   # Check hall sensor wires if used
   # Verify correct phase order
   ```

**Common Causes:**

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| No faults, no movement | Motor not detected | Run `veac motor detect` |
| Fault code 3 (DRV8302) | Hardware fault | Check wiring, replace VESC |
| Fault code 4 | Over-current | Check for shorts, reduce current limit |
| High current, no RPM | Wrong motor type | Set correct motor type in config |
| Jerky movement | Wrong phase order | Swap any two phase wires |

### Problem: Motor spins but reports wrong values

**Symptoms:**
- RPM doesn't match set value
- Current readings incorrect
- Tachometer wrong

**Solutions:**

1. **Check pole pair count**
   ```bash
   veac config get-mc --format json | jq '.si_motor_poles'
   
   # Calculate: pole_pairs = motor_poles / 2
   # Common values: 7 (14 pole motor), 4 (8 pole motor)
   ```

2. **Recalibrate encoder/hall sensors**
   ```bash
   veac motor detect --current 5.0
   ```

3. **Verify gear ratio (if applicable)**
   ```bash
   # si_gear_ratio in config
   veac config get-mc --format json | jq '.si_gear_ratio'
   ```

---

## CAN Bus Problems

### Problem: "CAN scan finds no devices"

**Symptoms:**
```bash
veac can scan
# Returns empty list or timeout
```

**Diagnosis:**

1. **Verify CAN wiring**
   ```bash
   # Check:
   # - CAN_H and CAN_L wires connected
   # - 120Ω termination resistors at both ends
   # - Common ground between VESCs
   ```

2. **Check CAN ID configuration**
   ```bash
   # On each VESC
   veac can set-id 1  # First VESC
   veac can set-id 2  # Second VESC
   ```

3. **Verify CAN status**
   ```bash
   veac can status --format json
   ```

**Solutions:**

| Cause | Solution |
|-------|----------|
| No termination | Add 120Ω resistor at each end |
| Wrong IDs | Set unique IDs with `veac can set-id` |
| Bad wiring | Check continuity with multimeter |
| No common ground | Connect GND between all VESCs |
| CAN disabled | Enable CAN in app configuration |

### Problem: "CAN forward command fails"

**Symptoms:**
```bash
veac can forward 2 motor set-rpm 1000
# Error or no response from target VESC
```

**Solutions:**

1. **Verify target ID exists**
   ```bash
   veac can scan --format json
   # Confirm target ID is in list
   ```

2. **Check forwarding syntax**
   ```bash
   # Correct syntax
   veac can forward <can-id> <command> [args...]
   
   # Example
   veac can forward 2 motor set-rpm 1000
   ```

3. **Increase timeout for CAN**
   ```bash
   # CAN operations need more time
   veac can scan --timeout 10000
   veac can forward 2 motor get-values --timeout 10000
   ```

---

## Configuration Errors

### Problem: "Invalid configuration file"

**Symptoms:**
```bash
veac config set-mc bad-config.json
# Error: Invalid configuration
```

**Solutions:**

1. **Validate JSON syntax**
   ```bash
   # Use jq to validate
   jq . bad-config.json
   
   # Or python
   python3 -c "import json; json.load(open('bad-config.json'))"
   ```

2. **Check required fields**
   ```bash
   # Get current valid config as reference
   veac config get-mc --output reference.json
   
   # Compare with your file
   diff reference.json bad-config.json
   ```

3. **Use dry-run to identify issues**
   ```bash
   veac config set-mc bad-config.json --dry-run
   # This will show validation errors
   ```

### Problem: "Configuration write fails"

**Symptoms:**
```bash
veac config set-mc my-config.json
# Error: Failed to write configuration
```

**Solutions:**

1. **Stop motor first**
   ```bash
   veac motor stop
   # Wait 2 seconds
   veac config set-mc my-config.json
   ```

2. **Check write protection**
   ```bash
   # Some VESCs have write protection
   # Check VESC Tool for unlock option
   ```

3. **Backup and reset**
   ```bash
   # Backup current config
   veac config backup --output pre-reset.json
   
   # Revert to default if available
   # Or reload from known-good backup
   ```

---

## LispBM Issues

### Problem: "Lisp upload fails"

**Symptoms:**
```bash
veac lisp upload script.lisp
# Error or timeout
```

**Solutions:**

1. **Check Lisp syntax**
   ```bash
   # Test in REPL first
   veac lisp repl "(print \"test\")"
   
   # Check for unbalanced parentheses
   # Check for undefined symbols
   ```

2. **Reduce file size**
   ```bash
   # VESC has limited Lisp memory
   # Check current usage
   veac lisp get-stats
   
   # If near limit, simplify code
   ```

3. **Clear existing code**
   ```bash
   # Erase first if having issues
   veac lisp erase --yes
   veac lisp upload script.lisp
   ```

### Problem: "Lisp code runs but produces wrong results"

**Solutions:**

1. **Check memory usage**
   ```bash
   veac lisp get-stats --format json
   # Check memory_used vs memory_total
   ```

2. **Use REPL for debugging**
   ```bash
   # Test expressions individually
   veac lisp repl "(get-vin)"
   veac lisp repl "(get-rpm)"
   veac lisp repl "(set-rpm 1000)"
   ```

3. **Add print statements**
   ```lisp
   ; In your Lisp code
   (print "Debug: starting function")
   (print (concatenate "Value: " (str-s my-var)))
   ```

---

## Firmware Issues

### Problem: "Version mismatch" warnings

**Symptoms:**
```
Warning: Firmware version mismatch
veac: 6.02, VESC: 5.03
```

**Solutions:**

1. **Update veac tool**
   ```bash
   # Download latest veac
   # Check: https://github.com/vedderb/vesc_cli/releases
   ```

2. **Update VESC firmware**
   ```bash
   # Use VESC Tool to flash firmware
   # veac cannot flash firmware
   ```

3. **Use compatible versions**
   ```bash
   # Check version compatibility matrix
   # Usually: veac version >= VESC firmware version
   ```

### Problem: "Feature not available in firmware"

**Symptoms:**
```bash
veac lisp repl "(some-function)"
# Error: Function not available
```

**Solutions:**

1. **Check firmware version**
   ```bash
   veac device info --format json | jq '.firmware_version'
   ```

2. **Update firmware**
   ```bash
   # Some features require latest firmware
   # Flash with VESC Tool
   ```

3. **Check feature availability**
   ```bash
   veac schema lisp repl
   # Shows available Lisp functions
   ```

---

## Performance Issues

### Problem: "Slow response times"

**Symptoms:**
- Commands take >5 seconds
- Streaming data is choppy

**Solutions:**

1. **Check USB connection**
   ```bash
   # Use USB 2.0 or better
   # Avoid USB hubs when possible
   # Try different USB port
   ```

2. **Reduce data volume**
   ```bash
   # Request only needed fields
   veac motor get-values --format json | \
     jq '{rpm: .result.rpm, current: .result.current_motor}'
   ```

3. **Optimize streaming**
   ```bash
   # Lower rate for smoother data
   veac motor stream --rate 5  # Instead of 50
   ```

### Problem: "High CPU usage on host"

**Solutions:**

1. **Reduce polling frequency**
   ```bash
   # Instead of tight loop
   # Use interval of 100ms or more
   ```

2. **Use streaming instead of polling**
   ```bash
   # Efficient:
   veac motor stream --rate 10
   
   # Less efficient:
   while true; do veac motor get-values; done
   ```

---

## Debugging Techniques

### Enable Verbose Mode

```bash
# Get detailed output
veac device connect --verbose
veac motor get-values --verbose

# Redirect stderr to file
veac motor get-values --verbose 2>debug.log
```

### Check Exit Codes

```bash
#!/bin/bash
# Debug script with exit code checking

veac motor set-rpm 1000
EXIT_CODE=$?

case $EXIT_CODE in
    0) echo "✅ Success" ;;
    1) echo "❌ General error" ;;
    2) echo "❌ Connection failed" ;;
    3) echo "❌ Timeout" ;;
    4) echo "❌ Invalid argument" ;;
    5) echo "❌ Protocol error" ;;
    *) echo "❌ Unknown error: $EXIT_CODE" ;;
esac
```

### Log All Commands

```bash
#!/bin/bash
# Debug wrapper script

LOGFILE="vesc_debug_$(date +%Y%m%d_%H%M%S).log"

echo "=== VESC Debug Log ===" >> "$LOGFILE"
echo "Date: $(date)" >> "$LOGFILE"
echo "" >> "$LOGFILE"

run_cmd() {
    echo ">>> Command: veac $*" >> "$LOGFILE"
    
    OUTPUT=$(veac "$@" --format json 2>&1)
    EXIT_CODE=$?
    
    echo "Exit code: $EXIT_CODE" >> "$LOGFILE"
    echo "Output: $OUTPUT" >> "$LOGFILE"
    echo "" >> "$LOGFILE"
    
    echo "$OUTPUT"
    return $EXIT_CODE
}

# Use wrapper
run_cmd device connect
run_cmd motor get-values
```

### Test Individual Components

```bash
#!/bin/bash
# Component isolation test

echo "1. Testing connection..."
veac device ping || exit 1

echo "2. Reading info..."
veac device info || exit 1

echo "3. Reading config..."
veac config get-mc > /dev/null || exit 1

echo "4. Reading motor values..."
veac motor get-values || exit 1

echo "5. Testing low current..."
veac motor set-current 1.0 --duration 1 || exit 1

echo "✅ All components working"
```

### Network/CAN Packet Capture

```bash
# For advanced debugging
# Use CAN adapter with packet capture

# candump (Linux with SocketCAN)
candump can0

# Or use VESC Tool's CAN analyzer
```

---

## Getting Help

### Gather Information

Before asking for help, collect:

```bash
#!/bin/bash
# Collect debug info

echo "=== VESC Debug Report ==="
echo "Date: $(date)"
echo ""

echo "--- Version Info ---"
veac --version 2>/dev/null || echo "veac version unknown"
echo ""

echo "--- Device Info ---"
veac device info --format json 2>/dev/null || echo "Failed to get device info"
echo ""

echo "--- Motor Values ---"
veac motor get-values --format json 2>/dev/null || echo "Failed to get motor values"
echo ""

echo "--- Config Summary ---"
veac config get-mc --format json 2>/dev/null | jq '{
    motor_type,
    l_current_max,
    l_current_min,
    l_in_current_max,
    l_in_current_min,
    l_abs_current_max,
    l_min_vin,
    l_max_vin,
    si_motor_poles
}' 2>/dev/null || echo "Failed to get config"
echo ""

echo "--- Connection Test ---"
veac device ping --format json 2>/dev/null || echo "Ping failed"
echo ""

echo "--- End Report ---"
```

### Support Resources

1. **VESC Project Forum**: https://vesc-project.com
2. **GitHub Issues**: Report bugs with debug info
3. **Discord**: Real-time help from community
4. **Documentation**: Check for updates

### What to Include in Bug Reports

```
1. veac version: veac --version
2. VESC firmware version: veac device info
3. Operating system and version
4. Exact command that failed
5. Full error output (with --verbose)
6. Steps to reproduce
7. Debug report from script above
```

---

## Quick Reference: Common Fixes

| Problem | Quick Fix |
|---------|-----------|
| Connection refused | Check port permissions, try `sudo` |
| Timeout | Increase timeout, check baud rate |
| Motor won't spin | Run `veac motor detect`, check faults |
| CAN not working | Check termination resistors, IDs |
| Config write fails | Stop motor first, use `--dry-run` |
| Lisp won't upload | Check syntax, clear memory first |
| Protocol error | Update firmware and veac version |
| High temps | Reduce current, add cooling |
| Jerky motion | Wrong phase order, redo detection |
| Wrong RPM | Check pole pair count |

---

## Diagnostic Flowchart

```
Problem?
│
├─ Connection issues?
│  └─ List ports → Check permissions → Try different cable
│
├─ Commands timeout?
│  └─ Increase timeout → Check baud rate → Power cycle VESC
│
├─ Motor won't spin?
│  └─ Check faults → Run detection → Verify wiring
│
├─ CAN problems?
│  └─ Check termination → Verify IDs → Check wiring
│
├─ Config errors?
│  └─ Validate JSON → Stop motor → Use dry-run
│
└─ Lisp issues?
   └─ Check syntax → Test in REPL → Clear memory
```

---

*Last updated: Check for the latest troubleshooting information at https://github.com/vedderb/vesc_cli*
