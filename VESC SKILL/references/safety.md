# VESC CLI Safety Guide

⚠️ **CRITICAL SAFETY INFORMATION**

Motor controllers and brushless motors can cause serious injury or death if not handled properly. Read and understand this entire document before using the `veac` CLI tool.

---

## Physical Safety

### Injury Prevention

**⚡ DANGER: Rotating motors can cause:**
- Severe lacerations from propellers or couplings
- Crushing injuries from high-torque applications
- Entanglement with clothing, hair, or jewelry
- Projectile injuries from disintegrating parts

**Safety Protocol:**

1. **Secure All Rotating Parts**
   ```bash
   # Before connecting power:
   # - Remove all propellers
   # - Secure shafts with guards
   # - Clear test area of loose objects
   ```

2. **Personal Protective Equipment (PPE)**
   - Safety glasses (mandatory)
   - Gloves when handling high-current wiring
   - Closed-toe shoes
   - No loose clothing or jewelry

3. **Controlled Testing Environment**
   - Use motor stands or fixtures
   - Clear 2-meter radius around motor
   - Emergency stop accessible
   - No children or pets nearby

### Emergency Stop Procedure

```bash
# Emergency stop - use immediately if:
# - Motor behaves unexpectedly
# - Unusual noises or vibrations
# - Temperature warnings
# - Any person in danger

veac motor stop

# If stop doesn't work:
# 1. Cut power at battery/disconnect
# 2. Do NOT attempt to grab motor
# 3. Wait for complete stop before approaching
```

---

## Electrical Safety

### Voltage and Current Hazards

**⚡ DANGER: High voltage and current can cause:**
- Electric shock (potentially fatal)
- Severe burns
- Fire or explosion
- Equipment destruction

**Typical VESC Applications:**
| Application | Voltage | Current | Risk Level |
|-------------|---------|---------|------------|
| Small drones | 12-16V | 10-30A | Moderate |
| Electric bikes | 36-52V | 20-50A | High |
| Electric vehicles | 72-144V | 100-300A | Severe |

**Electrical Safety Protocol:**

1. **Treat all circuits as live**
   ```bash
   # Before any work:
   # - Disconnect battery
   # - Verify with multimeter
   # - Short-term discharge capacitors
   ```

2. **Proper Wire Sizing**
   | Current | Min Wire Gauge | Notes |
   |---------|----------------|-------|
   | 10A | 18 AWG | Signal wires |
   | 30A | 14 AWG | Small motors |
   | 60A | 10 AWG | Ebikes |
   | 100A+ | 8 AWG or larger | EV applications |

3. **Insulation and Protection**
   - Use heat shrink on all connections
   - Install fuses appropriate for current
   - Enclose terminals to prevent shorts
   - Use appropriate voltage ratings

### Safe Power-Up Sequence

```bash
# 1. Visual inspection
#    - Check all connections
#    - Verify correct wiring
#    - No exposed conductors

# 2. Low voltage test first
veac device connect
veac motor get-values
# Check: v_in matches expected battery voltage

# 3. Verify configuration
veac config get-mc | grep "l_current_max"
# Ensure current limit appropriate for your motor

# 4. Start with minimal current
veac motor set-current 1.0 --duration 2
# Gradually increase only if all checks pass
```

---

## Hardware Protection

### Temperature Monitoring

**Maximum Safe Temperatures:**
| Component | Max Continuous | Max Peak | Critical |
|-----------|---------------|----------|----------|
| VESC MOSFETs | 80°C | 100°C | 120°C |
| Motor windings | 100°C | 120°C | 150°C |
| Battery | 45°C | 60°C | 80°C |

**Temperature Check Routine:**

```bash
# Check before any operation
veac motor get-values

# Watch for these values:
# temp_mos: Should be < 80°C
# temp_motor: Should be < 100°C

# Automate monitoring
temp_check() {
    RESULT=$(veac motor get-values --format json)
    MOS=$(echo $RESULT | jq '.result.temp_mos')
    MOTOR=$(echo $RESULT | jq '.result.temp_motor')
    
    if (( $(echo "$MOS > 80" | bc -l) )); then
        echo "⚠️  WARNING: MOSFET temperature high: ${MOS}°C"
        veac motor stop
        return 1
    fi
    
    if (( $(echo "$MOTOR > 100" | bc -l) )); then
        echo "⚠️  WARNING: Motor temperature high: ${MOTOR}°C"
        veac motor stop
        return 1
    fi
    
    return 0
}
```

### Current Limits

**Always set appropriate current limits:**

```bash
# Before running motor:
# 1. Check motor specifications
# 2. Verify battery C-rating
# 3. Set conservative limits

# Read current configuration
veac config get-mc --output mc-config.json

# Recommended starting values:
# - l_current_max: Motor rated current × 0.8
# - l_current_min: Negative of l_current_max (regen)
# - l_in_current_max: Battery max discharge
# - l_in_current_min: Battery max charge (regen)
```

### Voltage Protection

```bash
# Monitor input voltage
veac motor get-values

# Safe voltage ranges:
# - 3S LiPo: 9.0V - 12.6V
# - 6S LiPo: 18.0V - 25.2V
# - 12S LiPo: 36.0V - 50.4V

# Automatic voltage check
voltage_check() {
    RESULT=$(veac motor get-values --format json)
    VOLTAGE=$(echo $RESULT | jq '.result.v_in')
    
    # Example: 6S battery
    if (( $(echo "$VOLTAGE < 18.0" | bc -l) )); then
        echo "⚠️  WARNING: Battery voltage low: ${VOLTAGE}V"
        return 1
    fi
    
    if (( $(echo "$VOLTAGE > 25.2" | bc -l) )); then
        echo "⚠️  WARNING: Battery voltage high: ${VOLTAGE}V"
        return 1
    fi
    
    return 0
}
```

---

## Operational Safety

### Safe Testing Protocol

**Phase 1: Static Checks**
```bash
# 1. Connection test
veac device connect --dry-run

# 2. Read configuration
veac config get-mc
# Verify limits are appropriate

# 3. Check for existing faults
veac motor get-values
# fault_code should be 0
```

**Phase 2: Low Power Tests**
```bash
# 1. Very low current
veac motor set-current 1.0 --duration 3
# Watch for: unusual noises, vibrations, smoke

# 2. Verify direction
veac motor set-rpm 100 --duration 2
# Confirm rotation direction as expected

# 3. Temperature baseline
veac motor get-values
# Record starting temperatures
```

**Phase 3: Gradual Increase**
```bash
# Only proceed if Phase 2 passed

# Increase in 25% steps
veac motor set-current 2.0 --duration 3  # 25%
veac motor set-current 4.0 --duration 3  # 50%
veac motor set-current 6.0 --duration 3  # 75%
# Check temperatures at each step
```

### Using Dry-Run Mode

```bash
# Always use --dry-run for:
# - New configurations
# - First time operations
# - Automated scripts
# - Multi-VESC setups

# Examples:
veac motor set-rpm 10000 --dry-run
veac config set-mc new-config.json --dry-run
veac can set-id 2 --dry-run
```

### Fault Code Monitoring

**Common Fault Codes:**
| Code | Name | Meaning | Action |
|------|------|---------|--------|
| 0 | FAULT_CODE_NONE | No fault | Continue |
| 1 | FAULT_CODE_OVER_VOLTAGE | Over-voltage | Check charger/battery |
| 2 | FAULT_CODE_UNDER_VOLTAGE | Under-voltage | Charge battery |
| 3 | FAULT_CODE_DRV8302 | Driver fault | Hardware issue |
| 4 | FAULT_CODE_ABS_OVER_CURRENT | Over-current | Check motor/wiring |
| 5 | FAULT_CODE_OVER_TEMP_FET | MOSFET over-temp | Cool down |
| 6 | FAULT_CODE_OVER_TEMP_MOTOR | Motor over-temp | Cool down |

**Fault Checking Routine:**

```bash
# After any operation
check_faults() {
    FAULT=$(veac motor get-values --format json | jq -r '.result.fault_code')
    
    case $FAULT in
        0)
            echo "✅ No faults"
            return 0
            ;;
        1)
            echo "❌ FAULT: Over-voltage"
            echo "   Check battery and charger"
            ;;
        2)
            echo "❌ FAULT: Under-voltage"
            echo "   Charge battery immediately"
            ;;
        3)
            echo "❌ FAULT: DRV8302 error"
            echo "   Hardware failure - power off"
            ;;
        4)
            echo "❌ FAULT: Over-current"
            echo "   Check for shorts or stuck motor"
            ;;
        5)
            echo "❌ FAULT: MOSFET over-temperature"
            echo "   Stop and cool down"
            ;;
        6)
            echo "❌ FAULT: Motor over-temperature"
            echo "   Stop and cool down"
            ;;
        *)
            echo "❌ Unknown fault: $FAULT"
            ;;
    esac
    
    return 1
}
```

---

## Common Mistakes to Avoid

### 1. Wrong Motor Detection

**❌ MISTAKE:** Running detection with incorrect parameters
```bash
# Wrong - too high current for small motor
veac motor detect --current 20.0

# Correct - appropriate current
veac motor detect --current 5.0
```

### 2. Skipping Verification

**❌ MISTAKE:** Not checking status before operations
```bash
# Wrong - no checks
veac motor set-rpm 5000

# Correct - full verification
veac motor get-values | jq '.result.fault_code'  # Verify 0
veac motor get-values | jq '.result.temp_mos'     # Verify < 80
veac motor set-rpm 1000 --duration 3              # Test low first
```

### 3. No Configuration Backup

**❌ MISTAKE:** Changing config without backup
```bash
# Wrong
veac config set-mc new-config.json

# Correct
veac config backup --output backup-$(date +%Y%m%d).json
veac config set-mc new-config.json --dry-run
veac config set-mc new-config.json
```

### 4. Ignoring Temperature

**❌ MISTAKE:** Running motor without temperature monitoring
```bash
# Wrong - continuous operation
while true; do
    veac motor set-rpm 2000
    sleep 1
done

# Correct - with monitoring
for i in {1..60}; do
    TEMP=$(veac motor get-values --format json | jq '.result.temp_mos')
    if (( $(echo "$TEMP > 80" | bc -l) )); then
        echo "Temperature limit reached: ${TEMP}°C"
        veac motor stop
        break
    fi
    sleep 1
done
```

### 5. High Speed Without Gradual Testing

**❌ MISTAKE:** Jumping to high RPM
```bash
# Wrong
veac motor set-rpm 10000

# Correct - gradual ramp
for rpm in 1000 2000 5000 8000 10000; do
    echo "Testing ${rpm} RPM..."
    veac motor set-rpm $rpm --duration 3
    veac motor get-values | jq '.result.fault_code'  # Check for faults
done
```

---

## Pre-Flight Checklist

Use this checklist before any motor operation:

```bash
#!/bin/bash
# VESC Pre-Operation Checklist

echo "🔍 VESC Pre-Operation Checklist"
echo "================================"

PASS=0
FAIL=0

# 1. Connection
echo ""
echo "□ Connection test"
if veac device ping > /dev/null 2>&1; then
    echo "  ✅ Connected"
    PASS=$((PASS + 1))
else
    echo "  ❌ Not connected"
    FAIL=$((FAIL + 1))
fi

# 2. Voltage check
echo ""
echo "□ Voltage check"
VOLTAGE=$(veac motor get-values --format json 2>/dev/null | jq -r '.result.v_in // 0')
if (( $(echo "$VOLTAGE > 20" | bc -l) )) && (( $(echo "$VOLTAGE < 60" | bc -l) )); then
    echo "  ✅ Voltage OK: ${VOLTAGE}V"
    PASS=$((PASS + 1))
else
    echo "  ❌ Voltage out of range: ${VOLTAGE}V"
    FAIL=$((FAIL + 1))
fi

# 3. Temperature check
echo ""
echo "□ Temperature check"
MOS=$(veac motor get-values --format json 2>/dev/null | jq -r '.result.temp_mos // 999')
MOTOR=$(veac motor get-values --format json 2>/dev/null | jq -r '.result.temp_motor // 999')
if (( $(echo "$MOS < 80" | bc -l) )) && (( $(echo "$MOTOR < 100" | bc -l) )); then
    echo "  ✅ Temperature OK: MOSFET ${MOS}°C, Motor ${MOTOR}°C"
    PASS=$((PASS + 1))
else
    echo "  ❌ Temperature high: MOSFET ${MOS}°C, Motor ${MOTOR}°C"
    FAIL=$((FAIL + 1))
fi

# 4. Fault check
echo ""
echo "□ Fault check"
FAULT=$(veac motor get-values --format json 2>/dev/null | jq -r '.result.fault_code // 1')
if [ "$FAULT" == "0" ]; then
    echo "  ✅ No faults"
    PASS=$((PASS + 1))
else
    echo "  ❌ Fault detected: $FAULT"
    FAIL=$((FAIL + 1))
fi

# 5. Configuration backup
echo ""
echo "□ Configuration backup"
if [ -f "latest_backup.json" ]; then
    echo "  ✅ Backup exists"
    PASS=$((PASS + 1))
else
    echo "  ⚠️  No recent backup"
    veac config backup --output "backup-$(date +%Y%m%d_%H%M%S).json"
fi

# Summary
echo ""
echo "================================"
echo "Results: $PASS passed, $FAIL failed"
if [ $FAIL -eq 0 ]; then
    echo "✅ All checks passed - safe to proceed"
    exit 0
else
    echo "❌ $FAIL check(s) failed - DO NOT PROCEED"
    exit 1
fi
```

---

## Emergency Contacts and Resources

**Immediate Danger:** Call emergency services

**Technical Support:**
- VESC Project: https://vesc-project.com
- VESC Discord: Link on project website
- GitHub Issues: For tool-related bugs

**Medical:**
- Electric shock: Seek immediate medical attention
- Burns: Cool with water, cover, seek medical care
- Cuts: Apply pressure, clean, seek medical care if severe

---

## Summary

**Remember these key principles:**

1. **Always verify** before operating (connection, voltage, temperature, faults)
2. **Start low and slow** - never jump to high power
3. **Monitor continuously** - temperature and faults
4. **Use dry-run** for new operations
5. **Backup configurations** before changes
6. **Have emergency stop** ready at all times
7. **Use appropriate PPE** and safety equipment
8. **Never work alone** on high-power systems

**When in doubt, STOP and verify.**

---

*This safety guide is provided as a reference. Always follow manufacturer specifications and local safety regulations. The authors are not responsible for accidents or damage resulting from use of this information.*
