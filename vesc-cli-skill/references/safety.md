# VESC CLI Safety Considerations

Critical safety guidelines for operating VESC motor controllers.

## Physical Safety

### Before Operating Motors

1. **Secure all rotating parts** - Ensure belts, chains, and couplings are properly guarded
2. **Clear the work area** - Remove loose clothing, jewelry, and unsecured objects
3. **Verify mounting** - Confirm motor and controller are securely mounted
4. **Check wiring** - Inspect power and phase wires for damage or loose connections
5. **Emergency stop access** - Keep emergency stop button within reach

### During Operation

1. **Never touch rotating parts** - Motors can start unexpectedly
2. **Monitor temperatures** - Stop if motor or controller exceeds safe temperatures
3. **Watch for unusual sounds** - Grinding, squealing, or vibration indicates problems
4. **Stay alert** - Be ready to stop immediately if issues arise
5. **No loose items near motor** - Flying debris can cause injury

## Electrical Safety

### Power System

1. **Proper power rating** - Ensure power supply matches VESC specifications
2. **Fuse protection** - Use appropriate fuses on power input
3. **Insulation check** - Verify all terminals are insulated
4. **Capacitor discharge** - Wait for capacitors to discharge after power-off
5. **Grounding** - Ensure proper grounding of enclosures

### Phase Wires

1. **Proper gauge** - Use wire gauge rated for maximum motor current
2. **Secure connections** - Double-check all phase wire connections
3. **Insulation rating** - Use wire rated for motor voltage + safety margin
4. **Short protection** - Ensure phase wires cannot short to each other or ground

## Motor Safety

### Temperature Limits

| Component | Warning Temp | Critical Temp | Action |
|-----------|--------------|---------------|--------|
| Motor | 80°C | 100°C | Reduce load or stop |
| Controller | 70°C | 85°C | Improve cooling or stop |
| Battery | 45°C | 60°C | Stop charging/discharging |

Monitor continuously: `veac motor get-values`

### Current Limits

1. **Know your motor specs** - Never exceed rated continuous current
2. **Burst vs continuous** - Understand difference between peak and continuous ratings
3. **Battery limits** - Respect maximum discharge current of battery
4. **Wiring limits** - Ensure wiring can handle current without overheating

### Mechanical Limits

1. **Maximum RPM** - Never exceed motor's rated maximum RPM
2. **Torque limits** - Avoid mechanical damage from excessive torque
3. **Vibration** - Stop if excessive vibration develops
4. **Bearing condition** - Listen for bearing failure sounds

## Operational Safety

### Safe Start Procedure

```
1. Power on system
2. Verify no faults: veac motor get-values
3. Check temperatures
4. Start with low current/RPM
5. Monitor for anomalies
6. Gradually increase
```

### Safe Shutdown Procedure

```
1. Set RPM/current to 0: veac motor stop
2. Verify motor stopped: veac motor get-values
3. Wait for spin-down
4. Power off system
5. Secure work area
```

### Emergency Stop

```bash
# Immediate stop command
veac motor stop

# Or disconnect power if necessary
```

## CLI-Specific Safety Features

### Dry Run Mode

Always preview before executing:

```bash
# Preview motor command
veac motor set-rpm 5000 --dry-run

# Preview configuration write
veac config set-mc new-config.json --dry-run
```

### Duration Limits

Use auto-stop for unattended testing:

```bash
# Auto-stop after 10 seconds
veac motor set-rpm 1000 --duration 10
```

### Fault Code Checking

Always check for faults after operations:

```bash
# Check for faults
veac motor get-values --format json | jq '.fault_code'

# If fault_code != 0, investigate
```

## Configuration Safety Protocol

This protocol MUST be followed when applying new configurations to a VESC.

### Pre-Configuration Safety Checklist

Before changing ANY configuration:

```
☐ 1. Motor detection completed and verified
   Run: veac motor detect
   Verify: Detection completes without errors
   
☐ 2. Current configuration backed up
   Run: veac config backup --output pre-change-$(date +%Y%m%d).json
   Verify: Backup file created and valid JSON
   
☐ 3. Hardware limits documented
   - Motor max continuous current: _____ A
   - Motor max peak current: _____ A
   - Battery max discharge current: _____ A
   - VESC max current rating: _____ A
   - Wiring ampacity: _____ A
   
☐ 4. Temperature limits appropriate
   - Motor temperature limit: _____ °C (recommended: 80-100°C)
   - Controller temperature limit: _____ °C (recommended: 70-85°C)
   
☐ 5. Current limits within safe bounds
   Verify: motor_current ≤ min(motor_rating, battery_rating, vesc_rating, wiring_rating)
   Verify: battery_current ≤ battery_discharge_rating
   
☐ 6. Dry-run performed
   Run: veac config set-mc new-config.json --dry-run
   Verify: No errors, changes look correct
   
☐ 7. Explicit confirmation obtained
   User must type "yes" to proceed
```

### Critical Rules

**NEVER skip motor detection on first setup.**
- Motor detection establishes baseline parameters (resistance, inductance, pole pairs)
- Operating without detection can cause poor performance or damage
- Re-run detection if motor is changed or rewired

**ALWAYS start with 25% of target current for initial tests.**
- First test: 2A static test (motor unloaded)
- Second test: 25% of target current
- Third test: 50% of target current
- Fourth test: Full target current (only after all previous pass)

**MONITOR temperature continuously during testing.**
- Check baseline temperature before starting
- Check every 10-15 seconds during tests
- Stop immediately if temperature rises >20°C from baseline
- Allow full cool-down between test phases

**HAVE EMERGENCY STOP READY.**
- Know the command: `veac motor stop`
- Keep terminal window accessible
- Test emergency stop before high-power tests
- Have physical disconnect ready as backup

**DOCUMENT BASELINE VALUES BEFORE CHANGES.**
```bash
# Record baseline telemetry
veac motor get-values --format json > baseline-$(date +%Y%m%d-%H%M%S).json

# Include in baseline:
# - Motor resistance (from detection)
# - Temperature at idle
# - Voltage at rest
# - Any existing fault codes
```

**TEST INCREMENTALLY: Static → Low → Medium → Full.**

| Phase | Current | Duration | Prerequisites |
|-------|---------|----------|---------------|
| Static | 2A | 10 sec | Motor unloaded, all connections secure |
| Low | 25% of target | 30 sec | Static test passed |
| Medium | 50% of target | 60 sec | Low test passed, temps stable |
| Full | 100% of target | Varies | Medium test passed, temps in limits |

**WHAT TO DO IF MOTOR BEHAVES UNEXPECTEDLY:**

Immediate Actions:
1. **STOP IMMEDIATELY** - `veac motor stop`
2. **DISCONNECT POWER** if stop command fails
3. **CHECK FAULT CODES** - `veac motor get-values | jq '.fault_code'`
4. **DOCUMENT CONDITIONS** - What was happening when issue occurred?

Fault Code Response:

| Fault | Meaning | Immediate Action | Before Continuing |
|-------|---------|------------------|-------------------|
| 0 | None | Continue testing | N/A |
| 1 | Overcurrent (phase) | Stop, check wiring | Verify phase connections, reduce limits |
| 2 | Overvoltage | Stop, check battery | Verify battery voltage, check regen settings |
| 3 | Undervoltage | Stop, check battery | Charge battery, verify voltage cutoff |
| 4 | Motor stalled | Stop, check mechanics | Verify motor spins freely, check load |
| 5 | Overcurrent (ABS) | Stop, check settings | Reduce current limits, verify configuration |
| 6 | Timeout | Stop, check connection | Verify USB/CAN connection stability |
| 7 | Encoder error | Stop, check sensors | Verify encoder wiring, realign if needed |
| 8 | Precharge error | Stop, check power | Verify battery connection, check precharge circuit |
| 9 | HW error | Power cycle VESC | Restart VESC, check firmware version |
| 10 | Sensor error | Stop, check sensors | Verify hall/encoder wiring and alignment |

If Motor Makes Unusual Sounds:
- Grinding or scraping: Stop immediately, check bearings and mechanics
- High-pitched whine: May be normal at high RPM, but verify current draw
- Clicking or stuttering: Check phase wire connections, run detection again
- Rattling: Check mounting bolts and belt/chain tension

If Temperature Rises Too Quickly:
- >10°C in 30 seconds at low current: Stop, check for mechanical binding
- >20°C in 60 seconds at medium current: Stop, verify current limits
- Approaching limit at <50% power: Stop, configuration likely incorrect

If Motor Doesn't Respond:
1. Check fault codes first
2. Verify motor detection was successful
3. Check phase wire connections
4. Verify control mode (current vs RPM vs duty)
5. Confirm command value is within limits

### Configuration Testing Decision Tree

```
START CONFIGURATION TEST
           |
    ┌──────┴──────────┐
    ▼                   ▼
Motor                  Backup
Detected?              Created?
    │                      │
┌───┴───┐             ┌────┴─────┐
│NO     │YES          │NO        │YES
│       │             │          │
┌───────┐             ┌─────────┐  │
│Run    │             │Create   │  │
│detect │             │backup   │  │
└───────┘             └─────────┘  │
    │                      │       │
    └──────────┬───────────┘       │
               ▼                   │
        Verify Limits              │
        Are Safe?                  │
               │                   │
        ┌──────┴──────┐           │
        │NO           │YES        │
        │             │            │
    ┌───┴───┐         ▼            │
    │Adjust │  ┌──────┴──────┐      │
    │limits │  │Dry-run      │      │
    └───────┘  │Preview      │      │
               └──────┬──────┘      │
                      ▼              │
               User                  │
               Confirms?             │
               │                    │
        ┌──────┴──────┐             │
        │NO          │YES           │
        │            │             │
    ┌───┴───┐        ▼             │
    │Abort  │  ┌─────┴──────┐       │
    └───────┘  │Static Test │       │
               │(2A)         │       │
               └─────┬──────┘       │
                     ▼              │
              ┌──────┴──────┐       │
              │FAIL        │PASS     │
              │            │         │
         ┌────┴───┐        ▼         │
         │Invest- │  ┌────┴────┐     │
         │igate    │  │Low Test │     │
         └────────┘  │(25%)     │     │
                     └────┬────┘     │
                          ▼           │
                   ┌──────┴──────┐    │
                   │FAIL        │PASS  │
                   │            │      │
              ┌────┴───┐        ▼      │
              │Check   │  ┌────┴────┐  │
              │config  │  │Med Test │  │
              └────────┘  │(50%)    │  │
                          └────┬────┘  │
                               ▼        │
                        ┌──────┴──────┐│
                        │FAIL        │PASS│
                        │            │     │
                   ┌────┴───┐        ▼     │
                   │Reduce  │  ┌────┴────┐ │
                   │limits   │  │Full Test│ │
                   └────────┘  │(100%)   │ │
                              └────┬────┘ │
                                   ▼       │
                            ┌──────┴──────┐
                            │FAIL        │PASS
                            │            │
                       ┌────┴───┐        ▼
                       │Therm/  │  ┌─────┴─────┐
                       │Mech    │  │OPERATIONAL│
                       │Issue   │  │CONFIG     │
                       └────────┘  └──────────┘
```

### Post-Configuration Verification

After configuration is applied and tested:

```bash
# 1. Verify config was written correctly
veac config get-mc --output verify-mc.json
# Compare key parameters with intended values

# 2. Document final settings
cat << EOF > final-config-summary.txt
VESC Configuration Summary
Date: $(date)
Motor Current Limit: $(jq '.l_current_max' verify-mc.json)A
Battery Current Limit: $(jq '.l_in_current_max' verify-mc.json)A
Temperature Limits: $(jq '.l_temp_fet_start' verify-mc.json)°C / $(jq '.l_temp_motor_start' verify-mc.json)°C
EOF

# 3. Create operational config backup
veac config backup --output operational-$(date +%Y%m%d).json
```

## Configuration Safety

### Backup Before Changes

```bash
# Always backup first
veac config backup --output pre-change-$(date +%Y%m%d).json

# Then make changes
veac config set-mc modified-config.json
```

### Critical Parameters

Double-check these before operation:

| Parameter | Risk if Wrong | Verification |
|-----------|---------------|--------------|
| Motor current limits | Overheating/fire | Compare to motor datasheet |
| Battery current limits | Battery damage | Check battery specs |
| Voltage limits | Component damage | Match system voltage |
| Temperature limits | Thermal damage | Set appropriate thresholds |

### Restore Procedure

If configuration causes problems:

```bash
# Immediate stop
veac motor stop

# Restore known-good config
veac config restore known-good-backup.json

# Verify restoration
veac motor get-values

# Restart with caution
```

## CAN Bus Safety

### Multi-VESC Considerations

1. **Unique IDs** - Ensure each VESC has unique CAN ID
2. **Bus termination** - Proper 120Ω termination at both ends
3. **Cable quality** - Use shielded twisted pair for CAN
4. **Baud rate** - All devices must use same CAN baud rate
5. **Bus load** - Monitor for excessive bus traffic

### Forwarding Safety

When forwarding commands:

```bash
# Verify target exists
veac can scan

# Forward with caution
veac can forward 2 set-rpm 1000

# Verify response
veac can forward 2 get-values
```

## LispBM Safety

### Script Validation

1. **Test incrementally** - Run small code sections first
2. **Memory limits** - Monitor Lisp memory usage
3. **Infinite loops** - Avoid unbounded loops
4. **Safe values** - Clamp outputs to safe ranges

### Safe Development Pattern

```bash
# 1. Upload script
veac lisp upload test-script.lisp

# 2. Check for errors
veac lisp get-stats

# 3. Start with monitoring
veac motor stream --fields rpm --rate 1 &
veac lisp start

# 4. Monitor and stop if needed
veac lisp stop
```

## Environment Safety

### Temperature

- Operate within specified ambient temperature range
- Ensure adequate ventilation or cooling
- Avoid direct sunlight on controller

### Moisture

- Keep electronics dry
- Avoid condensation
- Use IP-rated enclosures for outdoor use

### Vibration

- Secure mounting prevents connector loosening
- Use strain relief on cables
- Check connections periodically

## Risk Mitigation

### PPE (Personal Protective Equipment)

- Safety glasses when working with high-speed rotating parts
- Gloves when handling hot components
- Closed-toe shoes in work area

### Fire Safety

- Fire extinguisher rated for electrical fires nearby
- Smoke detector in work area
- Clear evacuation path

### First Aid

- First aid kit accessible
- Know location of nearest medical facility
- Emergency contact numbers posted

## Post-Incident Procedure

If safety incident occurs:

1. **Ensure safety** - Stop all motion, disconnect power
2. **Document state** - Save telemetry: `veac motor get-values > incident-log.json`
3. **Preserve evidence** - Don't modify configuration
4. **Check logs** - Review fault codes and temperatures
5. **Report** - Document what happened for future prevention

## Safety Checklist

Before each session:

- [ ] Physical mounting secure
- [ ] Wiring inspected
- [ ] Emergency stop accessible
- [ ] Work area clear
- [ ] PPE available
- [ ] Backup created (if changing config)
- [ ] Dry-run performed (if new operation)
- [ ] Temperature monitoring ready
- [ ] Fire extinguisher accessible
- [ ] Know emergency procedures

## Remember

1. **Motors are powerful** - Respect their capability to cause harm
2. **When in doubt, stop** - It's always safe to stop and reassess
3. **No shortcuts** - Follow all safety procedures every time
4. **Stay alert** - Fatigue leads to accidents
5. **Document issues** - Report and learn from near-misses

**Safety is your responsibility.**
