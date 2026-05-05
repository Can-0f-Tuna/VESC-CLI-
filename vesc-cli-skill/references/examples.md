# VESC CLI Usage Examples

Practical examples for common VESC CLI workflows.

## Basic Motor Control

### Test Motor Connection
```bash
# Verify connection
veac device ping

# Get initial telemetry
veac motor get-values

# Check for faults
veac motor get-values --format json | grep fault_code
```

### Simple RPM Control
```bash
# Start motor at 500 RPM
veac motor set-rpm 500

# Check status
veac motor get-values

# Stop motor
veac motor stop
```

### Current Control (Torque Mode)
```bash
# Apply 2A current
veac motor set-current 2.0

# Reverse with negative current
veac motor set-current -1.5

# Stop
veac motor stop
```

### Duty Cycle Control
```bash
# Run at 50% duty
veac motor set-duty 0.5

# Reduce to 25%
veac motor set-duty 0.25

# Coast to stop
veac motor set-duty 0.0
```

## Testing and Validation

### Motor Detection
```bash
# Run motor detection with custom parameters
veac motor detect --current 5.0 --min-rpm 100

# Check results
veac motor get-values
```

### RPM Sweep Test
```bash
# Gradually increase RPM
veac motor set-rpm 500
sleep 2
veac motor set-rpm 1000
sleep 2
veac motor set-rpm 1500
sleep 2

# Check temperature
veac motor get-values

# Stop
veac motor stop
```

### Continuous Monitoring
```bash
# Stream telemetry for 60 seconds
veac motor stream --duration 60

# Stream specific fields at high rate
veac motor stream --fields rpm,temp_motor --rate 50 --duration 30
```

## Multi-VESC CAN Bus Setup

### Assign CAN IDs
```bash
# Connect to first VESC and set ID
veac device connect --port /dev/ttyACM0
veac can set-id 1

# Connect to second VESC and set ID
veac device connect --port /dev/ttyACM1
veac can set-id 2
```

### Scan and Verify
```bash
# Scan for all VESCs on CAN bus
veac can scan

# Check CAN bus status
veac can status
```

### Control Multiple VESCs
```bash
# Control VESC 1 directly
veac motor set-rpm 1000

# Forward command to VESC 2 via CAN
veac can forward 2 set-rpm 1000

# Get telemetry from VESC 2
veac can forward 2 get-values

# Stop both
veac motor stop
veac can forward 2 stop
```

## Configuration Management

### Backup Current Settings
```bash
# Create timestamped backup
veac config backup --output backup-$(date +%Y%m%d-%H%M%S).json

# Verify backup file
ls -la backup-*.json
```

### Modify and Apply Configuration
```bash
# Export motor config
veac config get-mc --output motor-original.json

# Edit the file (use external editor)
# nano motor-original.json

# Apply modified config
veac config set-mc motor-modified.json

# Verify changes
veac motor get-values
```

### Restore from Backup
```bash
# List available backups
ls backup-*.json | sort -r | head -5

# Restore specific backup
veac config restore backup-20260115-120000.json

# Verify restoration
veac motor get-values
```

## LispBM Scripting

### Upload and Run Script
```bash
# Upload Lisp file
veac lisp upload motor-control.lisp

# Start execution
veac lisp start

# Check status
veac lisp get-stats

# Stop execution
veac lisp stop
```

### Interactive REPL
```bash
# Execute single expressions
veac lisp repl "(defun square (x) (* x x))"
veac lisp repl "(square 5)"

# Check memory
veac lisp get-stats
```

### Memory Operations
```bash
# Read memory
veac lisp read --address 0x20000000 --length 64

# Write data
veac lisp write 0x20000000 "DEADBEEF"

# Erase program
veac lisp erase
```

## Safety and Monitoring

### Pre-Flight Check
```bash
# Connection check
veac device ping || echo "Connection failed"

# Temperature baseline
veac motor get-values --format json | jq '{temp_motor, temp_controller}'

# Fault check
veac motor get-values --format json | jq '.fault_code'
```

### Temperature Monitoring
```bash
# Stream temperatures during operation
veac motor stream --fields temp_motor,temp_controller --rate 1 --duration 300 &

# Run motor test
veac motor set-rpm 2000
sleep 60
veac motor stop
```

### Emergency Stop Pattern
```bash
# Set up trap for clean shutdown
trap 'veac motor stop; exit' INT TERM

# Run motor
veac motor set-rpm 1500

# Ctrl+C will trigger motor stop
```

## Advanced Workflows

### RPM with Auto-Stop
```bash
# Run for 10 seconds then auto-stop
veac motor set-rpm 1000 --duration 10

# Verify stopped
veac motor get-values
```

### Dry Run Testing
```bash
# Preview config write without applying
veac config set-mc test-config.json --dry-run

# Preview motor command
veac motor set-rpm 5000 --dry-run
```

### Scripted Test Sequence
```bash
#!/bin/bash
# test-sequence.sh

set -e

echo "Connecting..."
veac device connect

echo "Checking status..."
veac motor get-values

echo "Test 1: Low RPM"
veac motor set-rpm 500
sleep 3
veac motor stop
sleep 1

echo "Test 2: Medium RPM"
veac motor set-rpm 1000
sleep 3
veac motor stop
sleep 1

echo "Test 3: Current mode"
veac motor set-current 2.0
sleep 3
veac motor stop

echo "All tests complete"
```

### Automated Benchmark
```bash
#!/bin/bash
# benchmark.sh

LOG="benchmark-$(date +%Y%m%d-%H%M%S).json"

echo "Starting benchmark..."

for rpm in 500 1000 1500 2000; do
  echo "Testing ${rpm} RPM..."
  veac motor set-rpm $rpm
  sleep 5
  veac motor get-values --format json >> $LOG
  echo "," >> $LOG
  veac motor stop
  sleep 2
done

echo "Results saved to $LOG"
```

### Firmware Update Workflow
```bash
# Check current version
veac firmware info

# Backup before update
veac config backup --output pre-update-backup.json

# Update firmware
veac firmware update --file VESC_6_00.bin

# Verify new version
veac firmware info

# Restore config if needed
veac config restore pre-update-backup.json
```

### Port Auto-Detection Script
```bash
#!/bin/bash
# auto-connect.sh

PORTS=$(veac device list-ports --format json | jq -r '.ports[].path')

for PORT in $PORTS; do
  echo "Trying $PORT..."
  if veac device connect --port $PORT --timeout 2000 2>/dev/null; then
    echo "Connected to $PORT"
    veac device info
    break
  fi
done
```

## Interactive Setup Session Example

This example demonstrates the complete conversational workflow for setting up a new VESC configuration.

### Example Dialogue: Mountainboard Setup

**Agent:** "I see you have the VESC CLI skill loaded. Let me help you set up your controller safely and effectively. I'll ask a few questions to understand your hardware and then guide you through the configuration process."

**Agent:** "First, what VESC controller model are you using? (e.g., VESC 4.12, VESC 6 MkIII, VESC 75/300, VESC Express)"

**User:** "VESC 6 MkIII"

**Agent:** "Perfect! The VESC 6 MkIII is a robust controller capable of 100A+ motor current. Now, what motor do you have connected? Please tell me the brand, model, and kV rating."

**User:** "Flipsky 6354 190kV"

**Agent:** "Excellent choice! The Flipsky 6354 with 190kV is a popular motor that offers a good balance of speed and torque. It's typically rated for around 60-80A continuous current. What's your battery setup? I'm looking for:"
- Battery chemistry (LiPo, Li-ion, etc.)
- Cell configuration (e.g., 10S, 12S)
- Capacity and discharge rating"

**User:** "10S4P Li-ion with Samsung 30Q cells, 36V nominal, 12Ah, rated for 60A discharge"

**Agent:** "That's a solid 10S pack with quality cells. The 60A discharge rating pairs well with your motor. What are you building?"

**User:** "An electric mountainboard for off-road trail riding"

**Agent:** "Mountainboard - great choice! That means you'll need good torque for climbing hills and handling rough terrain. What's your target top speed, and roughly how much will the loaded board weigh (with you on it)?"

**User:** "Want about 35 km/h top speed, total weight around 100kg with me on it"

**Agent:** "Perfect! Based on your complete setup, here's my analysis:"

```
HARDWARE CONFIGURATION SUMMARY:
═══════════════════════════════════════════════════════════
VESC:          VESC 6 MkIII (100A+ capable)
Motor:         Flipsky 6354 190kV (~60-80A max)
Battery:       10S4P Li-ion 12Ah 60A discharge
Application:   Electric mountainboard
Target Speed:  35 km/h
Total Weight:  100kg

CALCULATED REQUIREMENTS:
- For 35 km/h on typical MTB wheels: ~3000-3500 RPM needed
- At 190kV on 10S (42V max): Max RPM ~8000 (good headroom!)
- For 100kg MTB with hills: Need 50-80A for adequate torque
═══════════════════════════════════════════════════════════
```

**Agent:** "Based on your mountainboard application with off-road requirements, here are three configuration presets I recommend:"

| Preset | Motor Current | Battery Current | Best For |
|--------|---------------|-----------------|----------|
| **🛡️ CONSERVATIVE** | 40A | 20A | First tests, learning the board |
| **⚖️ BALANCED** | 60A | 35A | Daily riding, good performance |
| **🏁 PERFORMANCE** | 80A | 50A | Experienced riders, maximum torque |

**Agent:** "The CONSERVATIVE preset uses only 50% of your motor's capability and 33% of your battery's discharge rating. This gives you gentle acceleration, cooler operation, and maximum safety margins. I strongly recommend starting here for your first tests."

**Agent:** "The BALANCED preset uses the full continuous rating of your motor (60A) and stays well within your battery's 60A limit. This is what most riders settle on for daily use."

**Agent:** "The PERFORMANCE preset pushes to 80A motor current, which is near your motor's peak rating. This gives maximum torque for steep hills and aggressive acceleration, but generates more heat and requires careful monitoring."

**Agent:** "Which preset would you like to start with? I recommend CONSERVATIVE for initial setup and testing."

**User:** "Let's go with Conservative for now"

**Agent:** "Excellent choice! Safety first - we can always increase power later once everything is validated. Let me walk you through the setup process step by step."

**Agent:** "**Step 1: Connecting to your VESC**"
```bash
veac device connect
```

**Agent:** "Good, we're connected. Now let's check the current status:"
```bash
veac motor get-values --format json | jq '{temp_motor, temp_controller, fault_code}'
```

**Agent:** "Temperatures look good - both well below 50°C and no fault codes. **Step 2: Motor Detection**"

**Agent:** "Before we apply any configuration, we need to detect your motor parameters. This will measure resistance, inductance, and pole pairs. Is the motor free to spin without any load connected?"

**User:** "Yes, I have the belt off right now"

**Agent:** "Perfect! Let's run motor detection:"
```bash
veac motor detect --current 5.0 --min-rpm 100
```

**Agent:** "Detection complete! The VESC has determined your motor parameters. **Step 3: Backup Current Config**"
```bash
veac config backup --output pre-setup-backup-$(date +%Y%m%d).json
```

**Agent:** "Backup saved. **Step 4: Now I'll create the Conservative preset configuration for your setup:**"

```bash
# Read current config as base
veac config get-mc --output current-mc.json

# Configuration changes for Conservative preset:
# - Motor Current Limit: 40A
# - Battery Current Limit: 20A  
# - Temperature Limits: 80°C motor, 70°C controller
# - Conservative acceleration ramps
```

**Agent:** "**Step 5: Dry Run Preview** - Let me show you what will change:"
```bash
veac config set-mc conservative-mc-config.json --dry-run
```

**Agent:** "Here's what will be modified from your current settings:"

```
CONFIGURATION CHANGES (Conservative Preset):
═══════════════════════════════════════════════════════════
Parameter              Current    New      Change
───────────────────────────────────────────────────────────
l_current_max          ???        40.0A    ✓ Set to conservative
l_current_max_regen    ???        -20.0A   ✓ Matching brake current
l_in_current_max       ???        20.0A    ✓ Battery protection
l_in_current_min       ???        -20.0A   ✓ Regen limit
l_temp_fet_start       ???        70°C     ✓ Early thermal warning
l_temp_fet_end         ???        80°C     ✓ Cutoff for safety
l_temp_motor_start     ???        80°C     ✓ Motor protection
l_temp_motor_end       ???        90°C     ✓ Motor cutoff
═══════════════════════════════════════════════════════════
```

**Agent:** "These settings prioritize safety with moderate current limits that won't stress your hardware. Do you confirm you want to apply the Conservative preset? (Type 'yes' to proceed)"

**User:** "yes"

**Agent:** "**Step 6: Applying Configuration**"
```bash
veac config set-mc conservative-mc-config.json
```

**Agent:** "Configuration applied successfully! **Step 7: Static Test** - Let's test at very low power first with the motor unloaded:"
```bash
# Start with just 2A
veac motor set-current 2.0
```

**Agent:** "Observe the motor for 10 seconds. Is it spinning smoothly? Any unusual sounds? Direction is correct?"

**User:** "Yes, seems smooth and quiet"

**Agent:** "Good! Let's check telemetry:"
```bash
veac motor get-values
```

**Agent:** "Current draw is about 2A as expected, temperatures stable, no faults. Now test reverse:"
```bash
veac motor set-current -2.0
sleep 5
veac motor stop
```

**Agent:** "**Step 8: Low Power Test** - Let's increase slightly to 5A:"
```bash
veac motor set-current 5.0
sleep 10
veac motor get-values
veac motor stop
```

**Agent:** "Temperature rise is minimal - only 2°C increase. Motor is running smoothly. **Step 9: Progressive Testing**"

**Agent:** "Now let's test at 25% of our target (10A). This is the first test with meaningful torque:"
```bash
# Start monitoring in background
veac motor stream --fields rpm,temp_motor,temp_controller,current_motor --rate 1 &

# Apply 25% of conservative limit
veac motor set-current 10.0

# Monitor for 30 seconds, checking temperatures
sleep 30

veac motor get-values
veac motor stop
```

**Agent:** "Excellent! 30 seconds at 10A and temperatures only rose 5°C. No faults detected. **Step 10: Medium Power Test**"

**Agent:** "Let's test at 50% of our conservative limit (20A). This will give us a good sense of thermal performance:"
```bash
# Continuous monitoring
veac motor stream --fields temp_motor,temp_controller --rate 1 --duration 60 &

# 50% of conservative limit
veac motor set-current 20.0

# Full 60 second test
```

**Agent:** "[After 60 seconds] Temperatures are stabilizing at 45°C motor and 42°C controller - well within safe limits. Current draw is steady at 20A. **Step 11: Full Conservative Limit Test**"

**Agent:** "Final test at the full conservative limit of 40A:"
```bash
veac motor set-current 40.0

# Monitor for 30 seconds with continuous observation
sleep 30

veac motor get-values
veac motor stop
```

**Agent:** "Perfect! The system handled 40A smoothly. Motor temperature reached 52°C and controller 48°C - both well below our 80°C/70°C conservative limits."

**Agent:** "**SETUP COMPLETE - CONSERVATIVE PRESET VALIDATED**"

```
VALIDATION SUMMARY:
═══════════════════════════════════════════════════════════
✓ Motor detection successful
✓ Configuration applied safely
✓ Static test passed (2A, 5A)
✓ Low load test passed (10A)
✓ Medium load test passed (20A, 60s)
✓ Full conservative limit passed (40A)
✓ All temperatures within safe limits
✓ No fault codes detected
✓ Smooth operation confirmed

CURRENT CONFIGURATION:
- Motor Current: 40A
- Battery Current: 20A
- Temperature Limits: 80°C motor / 70°C controller
- Status: VALIDATED FOR OPERATIONAL USE
═══════════════════════════════════════════════════════════
```

**Agent:** "Your VESC is now configured with the Conservative preset and all tests have passed! You can now:"

1. **Connect your belt/chain and test under load** - Start with short rides, monitoring temperatures
2. **Progress to higher presets later** - When you're comfortable, we can increase to Balanced (60A) or Performance (80A)
3. **Monitor during real use** - Keep an eye on temperatures during your first few rides

**Agent:** "Commands you can use now:"
```bash
# Check status anytime
veac motor get-values

# Monitor during riding
veac motor stream --fields temp_motor,temp_controller --rate 1

# Stop immediately if needed
veac motor stop

# Backup this working config
veac config backup --output conservative-working-config.json
```

**Agent:** "Would you like me to help you with anything else? I can:"
- Show you how to monitor during your first ride
- Explain how to upgrade to Balanced preset later
- Set up additional features like traction control
- Configure app settings (remote control, etc.)

**User:** "That's great, thanks! I'll test it out and come back if I want to increase the power."

**Agent:** "Perfect! Enjoy your mountainboard, and remember - always monitor temperatures on your first few rides. When you're ready for more power, just let me know and we'll do another progressive test with the Balanced preset. Ride safe!"

---

### Quick Reference: Moving to Higher Presets

When the user is ready to upgrade from Conservative to Balanced or Performance:

```bash
# 1. Backup current working config
veac config backup --output conservative-working-$(date +%Y%m%d).json

# 2. Apply new preset configuration
veac config set-mc balanced-preset.json --dry-run
veac config set-mc balanced-preset.json

# 3. Run progressive tests again (REQUIRED)
# - Static: 2A, 5A
# - Low: 15A (25% of 60A)
# - Medium: 30A (50% of 60A)
# - Full: 60A (100% of balanced limit)

# 4. Validate temperatures and performance
veac motor stream --fields temp_motor,temp_controller,current_motor --duration 120

# 5. Operational test before regular use
```

**Important:** Never skip progressive testing when changing presets, even if the previous preset worked fine. Higher current means more heat and stress - validation is essential.

## Integration Examples

### JSON Processing with jq
```bash
# Extract specific fields
veac motor get-values --format json | jq '{rpm, voltage, temp_motor}'

# Check for faults
veac motor get-values --format json | jq 'select(.fault_code != 0)'

# Get next actions
veac motor set-rpm 1000 | jq '.next_actions'
```

### CSV Export
```bash
# Create CSV from telemetry
veac motor get-values --format json | jq -r '[.rpm, .current_motor, .voltage, .temp_motor] | @csv'
```

### Graphing with gnuplot
```bash
# Stream to file, then plot
veac motor stream --fields rpm --rate 10 --duration 60 > rpm-data.txt
# gnuplot script to visualize
```

## Environment Variable Usage

### Persistent Configuration
```bash
# Set in shell profile
export VEAC_PORT=/dev/ttyACM0
export VEAC_BAUD=115200
export VEAC_CAN_ID=1

# Now commands use defaults
veac device connect  # Uses VEAC_PORT
veac motor get-values  # Uses VEAC_PORT and VEAC_BAUD
```

### Per-Session Override
```bash
# Override for single command
VEAC_PORT=COM3 veac device connect
```
