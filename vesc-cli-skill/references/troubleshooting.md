# VESC CLI Troubleshooting

Common issues and solutions when working with VESC CLI.

## Connection Issues

### Cannot Connect to VESC

**Symptom:** `veac device connect` fails with "Connection failed"

**Causes & Solutions:**

1. **Wrong port**
   - List available ports: `veac device list-ports`
   - Try each port: `veac device connect --port /dev/ttyACM1`
   - On Windows, check Device Manager for COM ports

2. **Port permissions (Linux/Mac)**
   - Add user to dialout group: `sudo usermod -a -G dialout $USER`
   - Or use sudo: `sudo veac device connect`
   - Log out and back in for group changes

3. **Another program using port**
   - Check for VESC Tool, Arduino IDE, etc.
   - Close other serial applications
   - Use: `lsof | grep ttyACM` (Linux/Mac) to find processes

4. **Wrong baud rate**
   - Try different rates: `veac device connect --baud 921600`
   - Default is 115200

5. **USB cable/connection**
   - Try different USB cable (some are power-only)
   - Try different USB port
   - Check for loose connections

### Connection Drops Intermittently

**Symptom:** Connection works briefly then fails

**Solutions:**

1. **Increase timeout**
   ```bash
   veac device connect --timeout 10000
   ```

2. **Check USB power**
   - Ensure VESC is powered sufficiently
   - Try powered USB hub

3. **Disable USB power saving**
   - Linux: Check power management settings
   - Windows: Device Manager → USB → Power Management

4. **Update firmware**
   - Older firmware may have USB issues
   - Update to latest VESC firmware

### No Serial Ports Found

**Symptom:** `veac device list-ports` returns empty

**Solutions:**

1. **Driver issues (Windows)**
   - Install STM32 Virtual COM Port driver
   - Check Windows Update for driver updates

2. **VESC not powered**
   - Verify VESC has power (LED indicators)
   - Check battery/power supply connections

3. **Firmware not running**
   - VESC may be in bootloader mode
   - Flash firmware if needed

4. **USB enumeration issues**
   - Unplug and reconnect VESC
   - Try different USB port
   - Reboot computer

## Motor Control Issues

### Motor Does Not Respond

**Symptom:** Commands succeed but motor doesn't move

**Check:**

1. **Fault codes**
   ```bash
   veac motor get-values --format json | jq '.fault_code'
   ```
   - If fault_code != 0, check [Fault Code Reference](../commands.md#fault-codes)

2. **Motor detection**
   - Run detection if not done: `veac motor detect`
   - Verify motor parameters in config

3. **Phase connections**
   - Check all three phase wires connected
   - Verify no loose connections
   - Check for damaged wires

4. **Sensor issues**
   - If using sensors (hall/encoder), verify connections
   - Check sensor cable integrity

5. **Current limits**
   - Check motor current limits in config
   - Verify command isn't being limited

### Motor Stutters or Jerks

**Symptom:** Motor movement is not smooth

**Solutions:**

1. **Low current**
   - Increase current: `veac motor set-current 5.0`
   - Check current limits in config

2. **PID tuning**
   - Adjust PID parameters for velocity control
   - Try different control modes

3. **Sensor alignment**
   - Run motor detection again
   - Check sensor offset parameters

4. **Mechanical issues**
   - Check for mechanical binding
   - Verify couplings and bearings

### Unexpected Direction

**Symptom:** Motor spins opposite to expected

**Solutions:**

1. **Swap any two phase wires** - Reverses motor direction
2. **Invert in software** - Check motor configuration
3. **Use negative values** - `veac motor set-rpm -1000`

### Motor Overheats

**Symptom:** Motor temperature rises quickly

**Check:**

1. **Current limits**
   - Reduce motor current in config
   - Use lower current commands

2. **Cooling**
   - Verify motor cooling is adequate
   - Add fan/heat sink if needed

3. **Mechanical load**
   - Check for excessive load
   - Verify gearing ratios

4. **Ambient temperature**
   - Reduce operating time in hot environments

### Controller Overheats

**Symptom:** VESC temperature rises quickly

**Check:**

1. **Current limits**
   - Reduce battery current limit
   - Check for phase current imbalance

2. **Cooling**
   - Ensure heatsink/fan attached
   - Check airflow around controller

3. **Switching frequency**
   - Lower PWM frequency reduces heat
   - Check motor configuration

## CAN Bus Issues

### No Devices Found in Scan

**Symptom:** `veac can scan` returns empty

**Solutions:**

1. **Wiring**
   - Check CAN_H and CAN_L connections
   - Verify 120Ω termination resistors at both ends
   - Check for loose connections

2. **Baud rate**
   - Ensure all devices use same baud rate
   - Common rates: 125K, 250K, 500K, 1M

3. **CAN IDs**
   - Verify devices have unique IDs
   - Check for ID conflicts

4. **Ground reference**
   - Ensure common ground between all CAN nodes
   - Ground loops can cause issues

### CAN Forward Fails

**Symptom:** Forwarded commands don't work

**Solutions:**

1. **Verify target exists**
   ```bash
   veac can scan
   ```

2. **Check CAN ID**
   ```bash
   veac can forward <id> ping
   ```

3. **Bus errors**
   ```bash
   veac can status
   ```

## Configuration Issues

### Config Write Fails

**Symptom:** `veac config set-mc` returns error

**Solutions:**

1. **Invalid JSON**
   - Validate JSON syntax
   - Check for missing commas or brackets
   - Use: `cat config.json | jq .` to validate

2. **Wrong parameter values**
   - Check parameter ranges
   - Verify units (A vs mA, etc.)

3. **Write protection**
   - Some firmware versions protect certain values
   - Update firmware if needed

4. **Use dry-run first**
   ```bash
   veac config set-mc config.json --dry-run
   ```

### Config Changes Don't Take Effect

**Symptom:** Motor behaves same after config change

**Solutions:**

1. **Reboot required**
   - Some changes need VESC restart
   - Power cycle the controller

2. **Wrong config section**
   - Motor config vs app config
   - Use `get-mc` vs `get-app`

3. **Verify write succeeded**
   ```bash
   veac config get-mc --output verify.json
   diff config.json verify.json
   ```

### Restore Fails

**Symptom:** `veac config restore` doesn't work

**Solutions:**

1. **File format**
   - Ensure backup file format matches
   - Check for firmware version compatibility

2. **Corrupted backup**
   - Validate JSON: `cat backup.json | jq .`

3. **Partial restore**
   - Try restoring motor config separately
   - Try restoring app config separately

## LispBM Issues

### Script Upload Fails

**Symptom:** `veac lisp upload` returns error

**Solutions:**

1. **File not found**
   - Verify file path is correct
   - Use absolute path: `veac lisp upload /path/to/script.lisp`

2. **Syntax errors**
   - Check Lisp syntax in script
   - Common issues: unbalanced parentheses, undefined symbols

3. **Memory full**
   - Erase existing program: `veac lisp erase`
   - Then upload new script

### Script Doesn't Run

**Symptom:** Upload succeeds but no effect

**Solutions:**

1. **Start execution**
   ```bash
   veac lisp start
   ```

2. **Check status**
   ```bash
   veac lisp get-stats
   ```

3. **REPL test**
   ```bash
   veac lisp repl "(print \"Hello\")"
   ```

### REPL Returns Error

**Symptom:** Lisp expressions fail

**Common errors:**

1. **Quote escaping**
   - Use proper shell escaping
   - Double quotes inside need escaping: `\"`
   - Or use single quotes: `'(print "Hello")'`

2. **Undefined symbols**
   - Check VESC Lisp documentation for available functions
   - Some functions may not be available in your firmware

## Firmware Issues

### Update Fails

**Symptom:** `veac firmware update` fails

**Solutions:**

1. **Wrong firmware file**
   - Verify firmware matches hardware version
   - Check VESC model (4, 6, 75/300, etc.)

2. **Connection lost during update**
   - Don't disconnect during update
   - Ensure stable power supply

3. **Bootloader mode**
   - May need to enter bootloader manually
   - Short bootloader pins on VESC

### Version Mismatch

**Symptom:** Features not available

**Solutions:**

1. **Check version**
   ```bash
   veac firmware info
   ```

2. **Update firmware**
   - Download latest from vesc-project.com
   - Follow update procedure

## Performance Issues

### Slow Response

**Symptom:** Commands take long to execute

**Solutions:**

1. **High latency connection**
   - Try different USB port/cable
   - Reduce USB hub chain length

2. **Verbose logging**
   - Avoid `--verbose` unless debugging
   - Verbose mode slows operations

3. **High CPU load**
   - Check system resources
   - Close unnecessary applications

### Streaming Drops Data

**Symptom:** `veac motor stream` misses updates

**Solutions:**

1. **Reduce rate**
   ```bash
   veac motor stream --rate 10
   ```

2. **Limit fields**
   ```bash
   veac motor stream --fields rpm,voltage
   ```

3. **Check USB quality**
   - Use shorter, higher quality cable
   - Avoid USB hubs if possible

## JSON Output Issues

### Invalid JSON

**Symptom:** Can't parse veac output

**Solutions:**

1. **Check format flag**
   ```bash
   veac motor get-values --format json
   ```

2. **Parse errors to stderr**
   - Errors go to stderr, not stdout
   - Redirect: `veac cmd 2>/dev/null`

3. **Use jq for validation**
   ```bash
   veac motor get-values --format json | jq .
   ```

## General Debugging

### Enable Verbose Mode

```bash
veac device connect --verbose
veac motor get-values --verbose
```

### Check Exit Codes

```bash
veac motor get-values
echo $?  # Print exit code
```

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Connection failed |
| 3 | Timeout |
| 4 | Invalid argument |
| 5 | Protocol error |

### Check Schema

```bash
# Get command schema
veac schema motor get-values

# Check available options
veac schema motor
```

### Log Output

```bash
# Save to file for analysis
veac motor get-values --format json > debug-$(date +%Y%m%d-%H%M%S).json
```

## Getting Help

If issues persist:

1. **Check documentation**
   - VESC Project wiki
   - veac --help
   - veac schema

2. **Gather information**
   - Firmware version: `veac firmware info`
   - Device info: `veac device info`
   - Error logs

3. **Try minimal reproduction**
   - Single command that fails
   - Fresh VESC power cycle
   - Simple configuration

4. **Check hardware**
   - Verify VESC powers on correctly
   - Check for visible damage
   - Test with known-good setup
