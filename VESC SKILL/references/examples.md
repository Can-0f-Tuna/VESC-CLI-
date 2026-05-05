# VESC CLI Examples

Practical examples for common use cases and automation scenarios.

---

## Python Script Example

Automate VESC operations using Python with the `veac` CLI:

```python
#!/usr/bin/env python3
"""
VESC Automation Example
Demonstrates motor testing and monitoring automation.
"""

import subprocess
import json
import time
import sys

def run_veac_command(cmd):
    """Execute a veac command and return parsed JSON output."""
    full_cmd = f"veac {cmd} --format json"
    
    try:
        result = subprocess.run(
            full_cmd.split(),
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            print(f"Command failed: {result.stderr}")
            return None
            
        return json.loads(result.stdout)
    except Exception as e:
        print(f"Error: {e}")
        return None

def motor_test_sequence():
    """Run a safe motor testing sequence."""
    
    # 1. Connect and verify
    print("🔌 Connecting to VESC...")
    result = run_veac_command("device connect")
    if not result or not result.get("ok"):
        print("❌ Failed to connect")
        return False
    print("✅ Connected")
    
    # 2. Check current status
    print("\n📊 Getting initial status...")
    result = run_veac_command("motor get-values")
    if result and result.get("ok"):
        data = result["result"]
        print(f"  Voltage: {data['v_in']}V")
        print(f"  MOSFET temp: {data['temp_mos']}°C")
        print(f"  Motor temp: {data['temp_motor']}°C")
        print(f"  Fault code: {data['fault_code']}")
        
        if data['fault_code'] != 0:
            print("⚠️  Warning: Faults detected!")
            return False
    
    # 3. Test at low current
    print("\n🔄 Testing at 2A current...")
    result = run_veac_command("motor set-current 2.0")
    if not result or not result.get("ok"):
        print("❌ Failed to set current")
        return False
    
    time.sleep(3)
    
    # 4. Check values
    result = run_veac_command("motor get-values")
    if result and result.get("ok"):
        data = result["result"]
        print(f"  RPM: {data['rpm']}")
        print(f"  Current: {data['current_motor']}A")
    
    # 5. Stop and verify
    print("\n🛑 Stopping motor...")
    run_veac_command("motor stop")
    time.sleep(1)
    
    result = run_veac_command("motor get-values")
    if result and result.get("ok"):
        data = result["result"]
        print(f"  Final RPM: {data['rpm']}")
        print(f"  Final fault code: {data['fault_code']}")
    
    print("\n✅ Test sequence complete")
    return True

def monitor_motor(duration_seconds=60, interval=1):
    """Monitor motor telemetry for a specified duration."""
    
    print(f"📈 Monitoring motor for {duration_seconds}s...")
    print("Press Ctrl+C to stop\n")
    
    print(f"{'Time':>6} {'RPM':>8} {'Current':>8} {'Voltage':>8} {'MOS Temp':>10}")
    print("-" * 50)
    
    start_time = time.time()
    
    try:
        while time.time() - start_time < duration_seconds:
            result = run_veac_command("motor get-values")
            
            if result and result.get("ok"):
                data = result["result"]
                elapsed = time.time() - start_time
                
                print(f"{elapsed:>6.1f} {data['rpm']:>8} "
                      f"{data['current_motor']:>8.2f} "
                      f"{data['v_in']:>8.2f} {data['temp_mos']:>10.1f}")
                
                # Check for faults
                if data['fault_code'] != 0:
                    print(f"⚠️  FAULT DETECTED: {data['fault_code']}")
                    run_veac_command("motor stop")
                    break
            
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Monitoring stopped by user")
        run_veac_command("motor stop")

def backup_all_configs():
    """Backup all VESC configurations with timestamp."""
    
    from datetime import datetime
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"vesc_backup_{timestamp}.json"
    
    print(f"💾 Creating backup: {filename}")
    
    result = run_veac_command(f"config backup --output {filename}")
    
    if result and result.get("ok"):
        print(f"✅ Backup saved: {filename}")
        return filename
    else:
        print("❌ Backup failed")
        return None

if __name__ == "__main__":
    # Example usage
    if len(sys.argv) < 2:
        print("Usage: python vesc_automation.py [test|monitor|backup]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "test":
        motor_test_sequence()
    elif command == "monitor":
        duration = int(sys.argv[2]) if len(sys.argv) > 2 else 60
        monitor_motor(duration)
    elif command == "backup":
        backup_all_configs()
    else:
        print(f"Unknown command: {command}")
```

---

## Motor Tuning Workflow

Complete workflow for tuning a new motor:

```bash
#!/bin/bash
# Motor Tuning Script
# Usage: ./tune_motor.sh

set -e  # Exit on error

echo "======================================"
echo "🔧 VESC Motor Tuning Workflow"
echo "======================================"

# 1. Connect
echo ""
echo "1️⃣  Connecting to VESC..."
veac device connect --port /dev/ttyACM0
echo "✅ Connected"

# 2. Initial status
echo ""
echo "2️⃣  Checking initial status..."
veac motor get-values

# 3. Motor detection (first time setup)
echo ""
echo "3️⃣  Running motor detection..."
echo "⚠️  Ensure motor can spin freely!"
read -p "Press Enter to continue..."
veac motor detect --current 5.0 --min-rpm 100
echo "✅ Detection complete"

# 4. Low current test
echo ""
echo "4️⃣  Testing at low current (2A)..."
veac motor set-current 2.0 --duration 3
echo "✅ Test complete"

# 5. Check for faults
echo ""
echo "5️⃣  Checking for faults..."
FAULT=$(veac motor get-values --format json | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['fault_code'])")
if [ "$FAULT" != "0" ]; then
    echo "❌ FAULT DETECTED: $FAULT"
    exit 1
fi
echo "✅ No faults"

# 6. RPM test at low speeds
echo ""
echo "6️⃣  Testing RPM control..."
for rpm in 500 1000 2000; do
    echo "   Testing ${rpm} RPM..."
    veac motor set-rpm $rpm --duration 2
done
echo "✅ RPM tests complete"

# 7. Temperature check
echo ""
echo "7️⃣  Checking temperatures..."
veac motor get-values --format json | python3 -c "
import sys, json
data = json.load(sys.stdin)['result']
print(f\"   MOSFET: {data['temp_mos']}°C\")
print(f\"   Motor: {data['temp_motor']}°C\")
if data['temp_mos'] > 80:
    print('⚠️  Warning: MOSFET temperature high!')
"

# 8. Final stop
echo ""
echo "8️⃣  Final stop..."
veac motor stop
echo "✅ Motor stopped"

echo ""
echo "======================================"
echo "✅ Tuning workflow complete!"
echo "======================================"
```

---

## Configuration Backup and Restore

Example of safe configuration management:

```bash
#!/bin/bash
# Safe Configuration Management

CONFIG_DIR="$HOME/vesc_configs"
mkdir -p "$CONFIG_DIR"

# Function to create timestamped backup
create_backup() {
    local name=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local filename="${CONFIG_DIR}/${name}_${timestamp}.json"
    
    echo "💾 Creating backup: $filename"
    veac config backup --output "$filename"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup created: $filename"
        echo "$filename"
    else
        echo "❌ Backup failed"
        return 1
    fi
}

# Function to restore with safety checks
restore_config() {
    local filename=$1
    
    if [ ! -f "$filename" ]; then
        echo "❌ File not found: $filename"
        return 1
    fi
    
    # Create backup of current config first
    echo "📋 Backing up current config before restore..."
    create_backup "pre_restore"
    
    # Preview changes
    echo ""
    echo "🔍 Previewing changes..."
    veac config restore "$filename" --dry-run
    
    echo ""
    read -p "Apply these changes? (y/N): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        veac config restore "$filename"
        echo "✅ Configuration restored"
        
        # Verify
        echo ""
        echo "🔍 Verifying configuration..."
        veac motor get-values
    else
        echo "❌ Restore cancelled"
    fi
}

# Function to edit configuration
edit_config() {
    local type=$1  # 'mc' or 'app'
    local temp_file="/tmp/vesc_${type}_edit.json"
    
    # Get current config
    if [ "$type" == "mc" ]; then
        veac config get-mc --output "$temp_file"
    else
        veac config get-app --output "$temp_file"
    fi
    
    # Open in editor
    ${EDITOR:-nano} "$temp_file"
    
    # Preview changes
    echo ""
    echo "🔍 Previewing changes..."
    if [ "$type" == "mc" ]; then
        veac config set-mc "$temp_file" --dry-run
    else
        veac config set-app "$temp_file" --dry-run
    fi
    
    echo ""
    read -p "Apply these changes? (y/N): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        if [ "$type" == "mc" ]; then
            veac config set-mc "$temp_file"
        else
            veac config set-app "$temp_file"
        fi
        echo "✅ Configuration updated"
    else
        echo "❌ Changes discarded"
    fi
    
    # Clean up
    rm "$temp_file"
}

# Main menu
case "${1:-menu}" in
    backup)
        create_backup "${2:-manual}"
        ;;
    restore)
        if [ -z "$2" ]; then
            echo "Usage: $0 restore <filename>"
            exit 1
        fi
        restore_config "$2"
        ;;
    edit-mc)
        edit_config mc
        ;;
    edit-app)
        edit_config app
        ;;
    list)
        echo "Available backups:"
        ls -la "$CONFIG_DIR"
        ;;
    *)
        echo "VESC Configuration Manager"
        echo ""
        echo "Usage:"
        echo "  $0 backup [name]     - Create backup"
        echo "  $0 restore <file>    - Restore from backup"
        echo "  $0 edit-mc          - Edit motor config"
        echo "  $0 edit-app         - Edit app config"
        echo "  $0 list             - List backups"
        ;;
esac
```

---

## Multi-VESC CAN Setup

Example for setting up multiple VESCs on CAN bus:

```bash
#!/bin/bash
# Multi-VESC CAN Setup

echo "======================================"
echo "🔗 Multi-VESC CAN Setup"
echo "======================================"

# Detect available ports
echo ""
echo "📋 Available ports:"
veac device list-ports

# Configuration
VESC_PORTS=("/dev/ttyACM0" "/dev/ttyACM1" "/dev/ttyACM2")
VESC_IDS=(1 2 3)

# Assign CAN IDs
echo ""
echo "1️⃣  Assigning CAN IDs..."
for i in "${!VESC_PORTS[@]}"; do
    port="${VESC_PORTS[$i]}"
    id="${VESC_IDS[$i]}"
    
    echo "   Configuring VESC on $port with CAN ID $id..."
    veac device connect --port "$port"
    veac can set-id "$id"
    echo "   ✅ VESC $id configured"
done

# Connect to first VESC and scan
echo ""
echo "2️⃣  Scanning CAN bus..."
veac device connect --port "${VESC_PORTS[0]}"
veac can scan
echo "✅ CAN scan complete"

# Example: Control all VESCs
echo ""
echo "3️⃣  Testing control of all VESCs..."
echo "   Starting all motors at 500 RPM..."
for id in "${VESC_IDS[@]}"; do
    veac can forward "$id" motor set-rpm 500
done

sleep 3

echo "   Stopping all motors..."
for id in "${VESC_IDS[@]}"; do
    veac can forward "$id" motor stop
done

echo ""
echo "======================================"
echo "✅ Multi-VESC setup complete!"
echo ""
echo "Usage examples:"
echo "  veac can forward 1 motor set-rpm 1000"
echo "  veac can forward 2 motor get-values"
echo "  veac can forward 3 config get-mc"
echo "======================================"
```

---

## Real-Time Monitoring Dashboard

Simple real-time monitoring using shell:

```bash
#!/bin/bash
# Real-time VESC Monitor
# Usage: ./monitor.sh [duration_seconds]

DURATION=${1:-60}
INTERVAL=${2:-1}

echo "======================================"
echo "📊 VESC Real-Time Monitor"
echo "Duration: ${DURATION}s, Interval: ${INTERVAL}s"
echo "Press Ctrl+C to stop"
echo "======================================"
echo ""

# Header
printf "%-8s %-8s %-10s %-8s %-10s %-10s\n" \
    "Time" "RPM" "Current" "Voltage" "MOS Temp" "Fault"
printf "%-8s %-8s %-10s %-8s %-10s %-10s\n" \
    "----" "---" "-------" "-------" "--------" "-----"

# Monitor loop
SECONDS=0
while [ $SECONDS -lt $DURATION ]; do
    # Get values
    DATA=$(veac motor get-values --format json 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        # Parse JSON (requires jq)
        RPM=$(echo "$DATA" | jq -r '.result.rpm // 0')
        CURRENT=$(echo "$DATA" | jq -r '.result.current_motor // 0')
        VOLTAGE=$(echo "$DATA" | jq -r '.result.v_in // 0')
        TEMP=$(echo "$DATA" | jq -r '.result.temp_mos // 0')
        FAULT=$(echo "$DATA" | jq -r '.result.fault_code // 0')
        
        # Display
        printf "%-8d %-8d %-10.2f %-8.2f %-10.1f %-10s\n" \
            $SECONDS $RPM $CURRENT $VOLTAGE $TEMP $FAULT
        
        # Alert on fault
        if [ "$FAULT" != "0" ]; then
            echo ""
            echo "⚠️  FAULT DETECTED: $FAULT"
            veac motor stop
            break
        fi
    else
        echo "Error reading values"
    fi
    
    sleep $INTERVAL
done

echo ""
echo "======================================"
echo "✅ Monitoring complete"
echo "======================================"
```

---

## Firmware Update Workflow

Example firmware update process:

```bash
#!/bin/bash
# Firmware Update Helper

FIRMWARE_FILE="${1:-}"

if [ -z "$FIRMWARE_FILE" ]; then
    echo "Usage: $0 <firmware.bin>"
    exit 1
fi

if [ ! -f "$FIRMWARE_FILE" ]; then
    echo "❌ Firmware file not found: $FIRMWARE_FILE"
    exit 1
fi

echo "======================================"
echo "🔌 VESC Firmware Update"
echo "======================================"
echo ""

# 1. Pre-update backup
echo "1️⃣  Creating backup..."
BACKUP_FILE="pre_firmware_$(date +%Y%m%d_%H%M%S).json"
veac config backup --output "$BACKUP_FILE"
echo "   ✅ Backup: $BACKUP_FILE"

# 2. Stop motor
echo ""
echo "2️⃣  Stopping motor..."
veac motor stop

# 3. Get current info
echo ""
echo "3️⃣  Current firmware info:"
veac device info

# 4. Confirm update
echo ""
echo "4️⃣  Ready to flash: $FIRMWARE_FILE"
read -p "Proceed with firmware update? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Update cancelled"
    exit 1
fi

# 5. Flash firmware (if veac supports it, or use VESC Tool)
echo ""
echo "5️⃣  Flashing firmware..."
echo "   ⚠️  Do not disconnect power!"
echo "   ⏳  This may take 30-60 seconds..."

# Note: Firmware flashing might require VESC Tool
# This is a placeholder for the actual flash command
# veac device flash "$FIRMWARE_FILE"

echo "   ✅ Firmware flashed (simulated)"

# 6. Verify
echo ""
echo "6️⃣  Verifying update..."
sleep 5
veac device connect
veac device info
echo "   ✅ Verification complete"

# 7. Restore config if needed
echo ""
echo "7️⃣  Checking configuration..."
read -p "Restore previous configuration? (y/N): " restore
if [[ $restore =~ ^[Yy]$ ]]; then
    veac config restore "$BACKUP_FILE"
    echo "   ✅ Configuration restored"
fi

echo ""
echo "======================================"
echo "✅ Firmware update complete!"
echo "======================================"
```

---

## Error Handling Example

Robust error handling in scripts:

```bash
#!/bin/bash
# Error Handling Example

set -e  # Exit on error

# Error handler
error_handler() {
    local line_no=$1
    local error_code=$2
    echo ""
    echo "❌ ERROR on line $line_no (exit code: $error_code)"
    
    # Try to stop motor on error
    echo "🛑 Attempting emergency stop..."
    veac motor stop 2>/dev/null || true
    
    exit $error_code
}

trap 'error_handler ${LINENO} $?' ERR

# Function to check command result
check_result() {
    local result=$1
    local message=$2
    
    if [ -z "$result" ]; then
        echo "❌ $message: No result"
        return 1
    fi
    
    local ok=$(echo "$result" | jq -r '.ok // false')
    
    if [ "$ok" != "true" ]; then
        local error=$(echo "$result" | jq -r '.error // "Unknown error"')
        echo "❌ $message: $error"
        return 1
    fi
    
    return 0
}

# Safe motor command with retry
safe_motor_command() {
    local cmd="$1"
    local max_retries=3
    local retry=0
    
    while [ $retry -lt $max_retries ]; do
        echo "   Attempt $((retry + 1))/$max_retries..."
        
        result=$(veac $cmd --format json 2>&1)
        
        if check_result "$result" "$cmd"; then
            echo "   ✅ Success"
            return 0
        fi
        
        retry=$((retry + 1))
        sleep 1
    done
    
    echo "   ❌ Failed after $max_retries attempts"
    return 1
}

# Main script
echo "======================================"
echo "🧪 Error Handling Demo"
echo "======================================"

# Connect with retry
if ! safe_motor_command "device connect"; then
    echo "❌ Could not connect to VESC"
    exit 1
fi

# Get values
result=$(veac motor get-values --format json)
if ! check_result "$result" "Get values"; then
    exit 1
fi

# Check temperature before operation
temp_mos=$(echo "$result" | jq -r '.result.temp_mos // 0')
if (( $(echo "$temp_mos > 80" | bc -l) )); then
    echo "⚠️  Temperature too high: ${temp_mos}°C"
    exit 1
fi

# Safe motor test
if safe_motor_command "motor set-rpm 500"; then
    sleep 2
    safe_motor_command "motor stop"
fi

echo ""
echo "======================================"
echo "✅ Demo complete"
echo "======================================"
```

---

## Integration with CI/CD

Example GitHub Actions workflow for testing:

```yaml
# .github/workflows/vesc-test.yml
name: VESC Hardware Tests

on:
  workflow_dispatch:
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday

jobs:
  hardware-test:
    runs-on: self-hosted  # Requires runner with VESC connected
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Install veac
      run: |
        curl -L https://github.com/vedderb/vesc_cli/releases/latest/download/veac-linux -o veac
        chmod +x veac
        sudo mv veac /usr/local/bin/
    
    - name: Connect to VESC
      run: |
        veac device connect --port /dev/ttyACM0
        veac device ping
    
    - name: Run motor test sequence
      run: |
        # Get initial status
        veac motor get-values
        
        # Test at low current
        veac motor set-current 1.0 --duration 3
        
        # Check for faults
        FAULT=$(veac motor get-values --format json | jq '.result.fault_code')
        if [ "$FAULT" != "0" ]; then
          echo "Fault detected: $FAULT"
          exit 1
        fi
        
        # Test RPM control
        veac motor set-rpm 500 --duration 3
        veac motor stop
    
    - name: Run LispBM tests
      run: |
        veac lisp upload test.lisp
        veac lisp start
        sleep 5
        veac lisp get-stats
        veac lisp stop
    
    - name: Generate report
      if: always()
      run: |
        veac motor get-values --format json > test_report.json
    
    - name: Upload report
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-report
        path: test_report.json
```
