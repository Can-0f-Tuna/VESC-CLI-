# VESC CLI Workflows

Comprehensive workflow documentation for interactive VESC setup and configuration.

## Platform Notes

All workflow examples in this document now include both **Linux/macOS (bash)** and **Windows PowerShell** variants. Where commands are identical across platforms, both variants are shown for clarity. PowerShell examples use standard cmdlets such as `Start-Sleep`, `Get-Date`, `Read-Host`, `Start-Job`, `Stop-Job`, `Get-Content`, and `ConvertFrom-Json`.

> **Note:** The commands `veac motor detect` and `veac motor stream` are now **implemented** in the CLI. Sections that previously relied on them still demonstrate supported alternatives for compatibility and scripting flexibility.

---

## Section 1: Interview Questionnaire Template

Use this structured questionnaire when initiating the guided setup workflow:

### Hardware Discovery Checklist

```
VESC SETUP INTERVIEW
═══════════════════════════════════════════════════════════

☐ VESC Model: ________________________________
   (e.g., VESC 4.12, VESC 6 MkIII, VESC 75/300, VESC Express)

☐ Motor: ____________________________________
   Brand/Model: ____________________________
   kV Rating: ______ RPM/V
   Pole Count: ______ (if known)
   Max Continuous Current: ______ A
   Max Peak Current: ______ A

☐ Battery Setup: ______________________________
   Chemistry: ☐ LiPo ☐ Li-ion ☐ LiFePO4 ☐ Other
   Configuration: ______S______P (e.g., 10S4P)
   Nominal Voltage: ______ V
   Capacity: ______ Ah
   Max Discharge Current: ______ A

☐ Application: ________________________________
   ☐ Electric Skateboard    ☐ E-Bike
   ☐ Robot                  ☐ Drone/UAV
   ☐ Industrial             ☐ RC Vehicle
   ☐ Other: ________________________________

☐ Performance Requirements:
   Max Desired Speed: ______ km/h (or ______ mph)
   OR Target RPM Range: ______ to ______ RPM
   Load Weight: ______ kg (or ______ lbs)

☐ Priorities (rank 1-5, 1 = highest):
   [ ] Speed        [ ] Range
   [ ] Torque       [ ] Quiet Operation
   [ ] Efficiency   [ ] Reliability

☐ Constraints:
   ☐ Noise sensitive environment
   ☐ Limited cooling/airflow
   ☐ Enclosed installation
   ☐ Battery longevity priority
   ☐ Other: ________________________________

☐ Experience Level:
   ☐ Beginner (first VESC setup)
   ☐ Intermediate (some experience)
   ☐ Expert (familiar with VESC tuning)
═══════════════════════════════════════════════════════════
```

### Information Gathering Script

Example agent conversation flow:

```
Agent: "I see you have the VESC CLI skill loaded. Let me help you 
        set up your controller safely and effectively."

Agent: "First, let's identify your hardware. What VESC controller 
        model are you using? (e.g., VESC 4.12, VESC 6, VESC 75/300)"

User: "VESC 6 MkIII"

Agent: "Great! The VESC 6 MkIII is a robust controller. Now, what motor 
        do you have connected? Please include the brand, model, and 
        kV rating if you know them."

User: "Flipsky 6354 190kV"

Agent: "Excellent choice. That's a 190kV motor - good for balance of 
        speed and torque. What's your battery setup? I'm looking for:
        - Chemistry (LiPo, Li-ion, etc.)
        - Configuration (e.g., 10S, 12S)
        - Capacity and discharge rating"

User: "10S4P Li-ion, 36V nominal, 12Ah, 60A discharge"

Agent: "Perfect. That's a solid 10S setup. What are you building? 
        (e.g., electric skateboard, e-bike, robot)"

User: "Electric mountainboard"

Agent: "Mountainboard - that means you need good torque for off-road 
        and hill climbing. What's your target top speed and roughly 
        how much will the board weigh with rider?"

User: "Want about 35 km/h, total weight around 100kg"

Agent: "Got it. Based on your setup, here are my recommendations:

        HARDWARE SUMMARY:
        - VESC 6 MkIII (capable of 100A+)
        - Flipsky 6354 190kV motor (likely 60-80A max)
        - 10S Li-ion 12Ah 60A battery
        - Mountainboard application, 35 km/h target, 100kg load

        PRESET RECOMMENDATIONS:
        
        [1] CONSERVATIVE (Recommended for first tests)
            - Motor Current: 40A (safe for motor)
            - Battery Current: 20A (easy on battery)
            - Soft acceleration ramps
            - Best for: Learning, initial testing
            
        [2] BALANCED (Good for daily riding)
            - Motor Current: 60A (near motor limit)
            - Battery Current: 35A (within battery rating)
            - Moderate acceleration
            - Best for: Regular use, good performance
            
        [3] PERFORMANCE (Maximum output)
            - Motor Current: 80A (motor maximum)
            - Battery Current: 50A (approaching battery limit)
            - Aggressive acceleration
            - Best for: Experienced riders, racing

        Which preset would you like to start with? I strongly 
        recommend CONSERVATIVE for your first tests."
```

## Section 2: Preset Configuration Matrix

Use these tables to recommend appropriate settings based on hardware combinations:

### Electric Skateboard / Mountainboard Presets

| Setup | Hardware | Conservative | Balanced | Performance |
|-------|----------|--------------|----------|-------------|
| **10S, 190kV** | 6354/6364 motor | 40A motor, 20A batt | 60A motor, 35A batt | 80A motor, 50A batt |
| **12S, 190kV** | 6374/6396 motor | 50A motor, 25A batt | 70A motor, 40A batt | 100A motor, 60A batt |
| **10S, 260kV** | 5055/5065 motor | 35A motor, 18A batt | 50A motor, 30A batt | 70A motor, 45A batt |
| **12S, 150kV** | 6384/63100 motor | 60A motor, 30A batt | 80A motor, 50A batt | 120A motor, 70A batt |

### E-Bike Presets

| Setup | Hardware | Conservative | Balanced | Performance |
|-------|----------|--------------|----------|-------------|
| **13S, 100kV** | Direct drive | 30A motor, 15A batt | 45A motor, 25A batt | 60A motor, 35A batt |
| **14S, 80kV** | Geared hub | 35A motor, 18A batt | 50A motor, 30A batt | 70A motor, 45A batt |
| **14S, 50kV** | Mid drive | 40A motor, 20A batt | 60A motor, 35A batt | 80A motor, 50A batt |
| **10S, 140kV** | Small hub | 25A motor, 12A batt | 40A motor, 22A batt | 55A motor, 32A batt |

### Robot / Automation Presets

| Setup | Hardware | Conservative | Balanced | Performance |
|-------|----------|--------------|----------|-------------|
| **6S, 280kV** | Small brushless | 15A motor, 8A batt | 25A motor, 15A batt | 40A motor, 25A batt |
| **6S, 150kV** | Medium robot | 20A motor, 10A batt | 35A motor, 20A batt | 55A motor, 35A batt |
| **12S, 100kV** | Large robot | 30A motor, 15A batt | 50A motor, 30A batt | 80A motor, 50A batt |
| **4S, 400kV** | RC servo | 10A motor, 5A batt | 20A motor, 12A batt | 35A motor, 20A batt |

### Drone / UAV Presets

| Setup | Hardware | Conservative | Balanced | Performance |
|-------|----------|--------------|----------|-------------|
| **6S, 900kV** | Small quad | 20A motor, 10A batt | 35A motor, 20A batt | 50A motor, 30A batt |
| **6S, 500kV** | Medium quad | 25A motor, 12A batt | 45A motor, 28A batt | 70A motor, 45A batt |
| **12S, 350kV** | Large hex | 30A motor, 15A batt | 55A motor, 35A batt | 85A motor, 55A batt |
| **4S, 2300kV** | Tiny whoop | 15A motor, 8A batt | 25A motor, 15A batt | 35A motor, 22A batt |

### Temperature Limits by Preset

| Preset | Motor Limit | Controller Limit | Notes |
|--------|-------------|------------------|-------|
| Conservative | 80°C | 70°C | Early warning, longer component life |
| Balanced | 90°C | 75°C | Standard thermal management |
| Performance | 100°C | 85°C | Maximum performance, monitor closely |

### Acceleration Ramps by Preset

| Preset | Positive Ramp | Negative Ramp | Response Time |
|--------|---------------|---------------|---------------|
| Conservative | 0.3s / 100% | 0.5s / 100% | Gentle, predictable |
| Balanced | 0.15s / 100% | 0.25s / 100% | Responsive but controlled |
| Performance | 0.05s / 100% | 0.1s / 100% | Immediate, aggressive |

## Section 3: Trade-off Decision Guide

Explain these trade-offs to help users make informed configuration decisions:

### Motor Current Impact

| Motor Current | Torque | Heat | Efficiency | Battery Draw |
|---------------|--------|------|------------|--------------|
| Low (20A) | Moderate | Cool | High | Low |
| Medium (50A) | Good | Warm | Moderate | Moderate |
| High (80A+) | Excellent | Hot | Lower | High |

**Recommendation:** 
- Start at 50-70% of motor's continuous rating
- Monitor temperature during extended use
- Higher current = more torque but more heat

### Battery Current Impact

| Battery Current | Power Output | Range | Battery Stress | Voltage Sag |
|-----------------|--------------|-------|----------------|-------------|
| Low (20A) | Moderate | Longer | Minimal | Low |
| Medium (40A) | Good | Standard | Moderate | Moderate |
| High (60A+) | Excellent | Reduced | High | Significant |

**Recommendation:**
- Keep within battery's continuous discharge rating
- Consider C-rating: Current ≤ Capacity × C-rating
- Higher current = more power but shorter range and battery life

### Duty Cycle Limits

| Duty Limit | Max Speed | Safety | Efficiency | Use Case |
|------------|-----------|--------|------------|----------|
| 80% | Limited | High | Good | Beginners, safety-critical |
| 95% | Near full | Moderate | Standard | Most applications |
| 100% | Maximum | Lower | Varies | Racing, maximum performance |

**Recommendation:**
- 95% is good for most applications
- 100% for maximum speed but less overshoot protection
- Lower limits provide safety margin against runaway

### Acceleration Ramps

| Ramp Time | Response | Comfort | Safety | Use Case |
|-----------|----------|---------|--------|----------|
| Slow (0.5s) | Gradual | Smooth | High | Beginners, cargo |
| Medium (0.2s) | Responsive | Balanced | Good | Daily use, general purpose |
| Fast (0.05s) | Immediate | Aggressive | Lower | Racing, experienced users |

**Recommendation:**
- Match ramp to application and user skill
- Slower ramps are safer and reduce mechanical stress
- Faster ramps feel more responsive but less forgiving

### Temperature Limits

| Temp Limit | Performance Headroom | Component Life | Risk | Monitoring |
|------------|---------------------|----------------|------|------------|
| Conservative (80°C) | Limited | Longest | Low | Periodic checks |
| Standard (90°C) | Good | Normal | Moderate | Regular monitoring |
| Aggressive (100°C+) | Maximum | Reduced | Higher | Continuous monitoring |

**Recommendation:**
- Start conservative, monitor actual temperatures
- Adjust based on real-world thermal performance
- Consider ambient temperature and cooling conditions

### Control Mode Selection

| Mode | Precision | Response | Best For | Complexity |
|------|-----------|----------|----------|------------|
| Current (Torque) | Good | Direct | Torque control, constant load | Low |
| Velocity (RPM) | Excellent | Smooth | Constant speed applications | Medium |
| Duty Cycle | Moderate | Immediate | Simple control, testing | Low |
| Position | High | Controlled | Servo applications | High |

**Recommendation:**
- Current mode for most vehicle applications
- Velocity mode when precise speed control needed
- Duty mode for initial testing only

## Section 4: Progressive Testing Protocol

This is the REQUIRED safe testing sequence. NEVER skip steps.

### Phase 1: Static Test (Motor Unloaded)

**Prerequisites:**
- Motor mounted securely but unloaded (no belt/chain connected)
- Emergency stop accessible
- Temperature monitoring ready
- All safety gear in place

**Test Sequence:**

**Linux/macOS:**
```bash
# 1. Connect and verify
veac device connect
veac motor get-values
# Verify: No faults, reasonable temperatures

# 2. Start with minimal current
veac motor set-current 2.0
# Observe for 10 seconds:
# - Motor spins smoothly?
# - Direction is correct?
# - No abnormal sounds (grinding, clicking)?
# - Current draw is reasonable (~2A)?
veac motor stop

# 3. Test reverse direction
veac motor set-current -2.0
# Same observations as above
veac motor stop

# 4. Test at slightly higher current
veac motor set-current 5.0
# Observe for 10 seconds
# - Check temperature rise (should be minimal)
# - Verify smooth operation
veac motor stop

# CHECKPOINT: If ANY anomaly detected, STOP and troubleshoot
# before proceeding to Phase 2.
```

**Windows PowerShell:**
```powershell
# 1. Connect and verify
veac device connect
veac motor get-values
# Verify: No faults, reasonable temperatures

# 2. Start with minimal current
veac motor set-current 2.0
# Observe for 10 seconds:
# - Motor spins smoothly?
# - Direction is correct?
# - No abnormal sounds (grinding, clicking)?
# - Current draw is reasonable (~2A)?
veac motor stop

# 3. Test reverse direction
veac motor set-current -2.0
# Same observations as above
veac motor stop

# 4. Test at slightly higher current
veac motor set-current 5.0
# Observe for 10 seconds
# - Check temperature rise (should be minimal)
# - Verify smooth operation
veac motor stop

# CHECKPOINT: If ANY anomaly detected, STOP and troubleshoot
# before proceeding to Phase 2.
```

**Pass Criteria:**
- ✓ Motor spins smoothly in both directions
- ✓ No abnormal sounds or vibrations
- ✓ Current draw matches commanded value
- ✓ Temperature rise < 5°C during test
- ✓ No fault codes

### Phase 2: Low Load Test

**Prerequisites:**
- Static test passed completely
- Load connected (belt/chain installed)
- Area clear of obstacles
- Ready to stop immediately

**Test Sequence:**

**Linux/macOS:**
```bash
# 1. Verify connection and status
veac device connect
veac motor get-values

# 2. Apply 25% of target current (or max 10A)
veac motor set-current 10.0
# Observe for 30 seconds:
# - Belt/chain moving smoothly?
# - No mechanical binding?
# - Temperature rising slowly?
veac motor stop

# 3. Brief RPM test (if applicable)
veac motor set-rpm 500
# Low RPM test
sleep 5
veac motor stop

# 4. Check temperatures and faults
veac motor get-values
# Verify: Temps reasonable, no faults

# CHECKPOINT: All systems nominal? Proceed to Phase 3.
```

**Windows PowerShell:**
```powershell
# 1. Verify connection and status
veac device connect
veac motor get-values

# 2. Apply 25% of target current (or max 10A)
veac motor set-current 10.0
# Observe for 30 seconds:
# - Belt/chain moving smoothly?
# - No mechanical binding?
# - Temperature rising slowly?
veac motor stop

# 3. Brief RPM test (if applicable)
veac motor set-rpm 500
# Low RPM test
Start-Sleep -Seconds 5
veac motor stop

# 4. Check temperatures and faults
veac motor get-values
# Verify: Temps reasonable, no faults

# CHECKPOINT: All systems nominal? Proceed to Phase 3.
```

**Pass Criteria:**
- ✓ Mechanical system moves freely
- ✓ No binding or unusual resistance
- ✓ Temperature rise < 10°C during test
- ✓ No fault codes
- ✓ Current draw matches expected load

### Phase 3: Medium Load

**Prerequisites:**
- Low load test passed completely
- At least 10 minutes cooldown between phases
- Ready for longer duration testing

> **Note:** Continuous telemetry streaming (`veac motor stream`) is now implemented. Repeated `veac motor get-values` calls in a loop remain a valid alternative for scripting flexibility.

**Test Sequence:**

**Linux/macOS:**
```bash
# 1. Apply 50% of target current
veac motor set-current 25.0

# 2. Poll telemetry every 5 seconds for 60 seconds
for i in {1..12}; do
    veac motor get-values
    sleep 5
done

# 3. Stop and cool down
veac motor stop

# 4. Verify temperatures are stable
veac motor get-values
# Wait for temps to stabilize before next phase
```

**Windows PowerShell:**
```powershell
# 1. Apply 50% of target current
veac motor set-current 25.0

# 2. Poll telemetry every 5 seconds for 60 seconds
for ($i = 0; $i -lt 12; $i++) {
    veac motor get-values
    Start-Sleep -Seconds 5
}

# 3. Stop and cool down
veac motor stop

# 4. Verify temperatures are stable
veac motor get-values
# Wait for temps to stabilize before next phase
```

**Pass Criteria:**
- ✓ Stable operation for full 60 seconds
- ✓ Temperature rise < 20°C from baseline
- ✓ Temperature stabilizing (not climbing rapidly)
- ✓ No thermal warnings or faults
- ✓ Current consistent and expected

### Phase 4: Full Power Test

**Prerequisites:**
- All previous phases passed completely
- Full safety protocol in place
- Continuous monitoring active
- Emergency stop within reach

**⚠️ WARNING:** This is the highest risk phase. Proceed with extreme caution.

> **Note:** This phase uses fixed timed steps rather than interactive prompts so it can be used in scripts and automated workflows. Monitor closely and stop manually (`veac motor stop`) if any anomaly occurs.

**Test Sequence:**

**Linux/macOS:**
```bash
# 1. Define test levels and duration per level
DURATION=15

# 2. Run each current level for a fixed duration
for current in 40 60 80; do
    echo "Testing at ${current}A for ${DURATION}s..."
    veac motor set-current $current
    # Poll telemetry during the interval
    for i in $(seq 1 $((DURATION / 5))); do
        sleep 5
        veac motor get-values
    done
    # MANUAL CHECKPOINT: Review output above. Stop if any concern.
    # To stop: veac motor stop
    # To continue: the loop proceeds automatically after ${DURATION}s
    echo "Level ${current}A complete. Pausing 5s before next level..."
    sleep 5
done

# 3. Final stop and verification
veac motor stop
veac motor get-values
# Verify: No faults, temps stabilizing
```

**Windows PowerShell:**
```powershell
# 1. Define test levels and duration per level
$DURATION = 15

# 2. Run each current level for a fixed duration
foreach ($current in 40, 60, 80) {
    Write-Output "Testing at ${current}A for ${DURATION}s..."
    veac motor set-current $current
    # Poll telemetry during the interval
    for ($i = 0; $i -lt ($DURATION / 5); $i++) {
        Start-Sleep -Seconds 5
        veac motor get-values
    }
    # MANUAL CHECKPOINT: Review output above. Stop if any concern.
    # To stop: veac motor stop
    # To continue: the loop proceeds automatically after ${DURATION}s
    Write-Output "Level ${current}A complete. Pausing 5s before next level..."
    Start-Sleep -Seconds 5
}

# 3. Final stop and verification
veac motor stop
veac motor get-values
# Verify: No faults, temps stabilizing
```

> **Background monitoring note:** On Linux/macOS you can run a separate polling loop in another terminal or use `screen`/`tmux`. On Windows, you can open a second PowerShell window, or use `Start-Job { while ($true) { veac motor get-values; Start-Sleep -Seconds 5 } }`. To stop a background job: `Stop-Job $job` or `Get-Job | Stop-Job`.

**Pass Criteria:**
- ✓ Achieved target current without issues
- ✓ Temperatures remain within limits
- ✓ No thermal runaway (temps stabilize)
- ✓ No fault codes
- ✓ All mechanical systems nominal

### Phase 5: Operational Test

**Prerequisites:**
- Full power test passed
- System cooled to baseline temperatures
- Ready for extended real-world testing

> **Note:** Continuous telemetry streaming (`veac motor stream`) is now implemented. Manual polling or a scripted logging loop remains a valid alternative for maximum control.

**Test Sequence:**

**Linux/macOS:**
```bash
# 1. Full operational scenario
# This depends on application:
# - E-skate: Ride at various speeds
# - Robot: Run full motion sequence
# - Drone: Hover and maneuver

# 2. Manual telemetry logging with timestamps (run in a second terminal)
# Poll every 5 seconds for 5 minutes (60 samples)
for i in {1..60}; do
    ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    json=$(veac motor get-values --format json)
    # Inject timestamp into the JSON object
    echo "{\"timestamp\":\"$ts\",${json#?}" >> operational-test.log
    sleep 5
done

# 3. Execute operational scenario
# [User performs actual application tasks]

# 4. Post-test analysis
# If you have jq installed (winget install jqlang.jq on Windows):
cat operational-test.log | jq -s '
    max_by(.temp_motor) as $max_temp |
    max_by(.current_motor) as $max_current |
    {
        max_motor_temp: $max_temp.temp_motor,
        max_controller_temp: $max_temp.temp_controller,
        max_motor_current: $max_current.current_motor,
        max_battery_current: $max_current.current_battery,
        min_voltage: min_by(.voltage).voltage
    }
'

# 5. Document results
# Save configuration and performance summary
veac config backup --output operational-config-$(date +%Y%m%d).json
```

**Windows PowerShell:**
```powershell
# 1. Full operational scenario
# This depends on application:
# - E-skate: Ride at various speeds
# - Robot: Run full motion sequence
# - Drone: Hover and maneuver

# 2. Manual telemetry logging with timestamps (run in a second PowerShell window)
# Poll every 5 seconds for 5 minutes (60 samples)
for ($i = 0; $i -lt 60; $i++) {
    $ts = Get-Date -Format "o"
    $json = veac motor get-values --format json
    # Inject timestamp into the JSON object
    $json -replace '^{', "{`"timestamp`":`"$ts`"," | Add-Content operational-test.log
    Start-Sleep -Seconds 5
}

# 3. Execute operational scenario
# [User performs actual application tasks]

# 4. Post-test analysis using ConvertFrom-Json
$records = Get-Content operational-test.log | ConvertFrom-Json
$maxMotorTemp     = ($records | Measure-Object -Property temp_motor      -Maximum).Maximum
$maxControllerTemp = ($records | Measure-Object -Property temp_controller -Maximum).Maximum
$maxMotorCurrent  = ($records | Measure-Object -Property current_motor   -Maximum).Maximum
$maxBatteryCurrent = ($records | Measure-Object -Property current_battery -Maximum).Maximum
$minVoltage       = ($records | Measure-Object -Property voltage         -Minimum).Minimum

Write-Output "Max motor temp:      $maxMotorTemp °C"
Write-Output "Max controller temp: $maxControllerTemp °C"
Write-Output "Max motor current:   $maxMotorCurrent A"
Write-Output "Max battery current: $maxBatteryCurrent A"
Write-Output "Min voltage:         $minVoltage V"

# 5. Document results
# Save configuration and performance summary
$dateSuffix = Get-Date -Format "yyyyMMdd"
veac config backup --output operational-config-$dateSuffix.json
```

> **jq availability:** `jq` is optional on all platforms. On Windows it can be installed via `winget install jqlang.jq` or `choco install jq`. PowerShell's `ConvertFrom-Json` provides equivalent functionality without external dependencies.

**Pass Criteria:**
- ✓ Completed full operational scenario
- ✓ Temperatures stayed within limits throughout
- ✓ No faults or anomalies
- ✓ Performance meets requirements
- ✓ Safe to proceed to regular use

### Emergency Stop Procedures

**If ANY anomaly detected at ANY phase:**

**Linux/macOS:**
```bash
# IMMEDIATE STOP
veac motor stop

# Check for faults
veac motor get-values --format json
# Parse the JSON in your environment (use jq if available)
# jq '.fault_code'

# If fault detected, do NOT proceed
# Document the fault code and conditions

# Check temperatures
veac motor get-values --format json
# Parse the JSON in your environment (use jq if available)
# jq '{temp_motor, temp_controller}'

# Allow cooling if hot
# Wait for temperatures < 50°C before investigating

# Only after cooling, attempt to identify cause
```

**Windows PowerShell:**
```powershell
# IMMEDIATE STOP
veac motor stop

# Check for faults
$response = veac motor get-values --format json | ConvertFrom-Json
Write-Output "Fault code: $($response.fault_code)"

# If fault detected, do NOT proceed
# Document the fault code and conditions

# Check temperatures
$response = veac motor get-values --format json | ConvertFrom-Json
Write-Output "Motor temp: $($response.temp_motor) °C"
Write-Output "Controller temp: $($response.temp_controller) °C"

# Allow cooling if hot
# Wait for temperatures < 50°C before investigating

# Only after cooling, attempt to identify cause
```

> **Cross-platform JSON parsing:** All platforms can parse JSON without `jq`. On Linux/macOS, `python3 -c "import sys,json; d=json.load(sys.stdin); print(d['fault_code'])"` is a universal alternative. On Windows, `ConvertFrom-Json` is built-in.

### Test Failure Decision Tree

```
TEST FAILURE DETECTED
         |
    ┌────┴────┐
    |         |
   FAULT?   THERMAL?
    |         |
┌───┴───┐  ┌──┴────┐
|       |  |       |
>0?   0?   HIGH   OK
  |      |    |      |
  STOP  MECH?  STOP  PROCEED
   |      |           (with caution)
  LOG    CHECK
  |      |
  |   ┌──┴────┐
  |   |       |
  |  BIND?   ELEC?
  |   |       |
  |  FIX    CHECK
  |   |     WIRING
  |  RETEST  |
  |         RETEST
  |
[Document and troubleshoot]
```

### Documentation Template

Record results of each test phase:

```
PROGRESSIVE TEST LOG
═══════════════════════════════════════════════════════════
Date: ___________  Operator: ___________  Hardware: ___________

PHASE 1: STATIC TEST
☐ Connected: veac device connect
☐ Initial temps: Motor _____°C  Controller _____°C
☐ 2A forward: ☐ Pass ☐ Fail  Notes: _________________
☐ 2A reverse: ☐ Pass ☐ Fail  Notes: _________________
☐ 5A test: ☐ Pass ☐ Fail    Notes: _________________
☐ No faults: ☐ Confirmed
☐ RESULT: ☐ PASS  ☐ FAIL

PHASE 2: LOW LOAD
☐ 25% current: _____A
☐ Duration: _____ seconds
☐ Peak temp: Motor _____°C  Controller _____°C
☐ Mechanical: ☐ Smooth ☐ Binding ☐ Noise
☐ RESULT: ☐ PASS  ☐ FAIL

PHASE 3: MEDIUM LOAD
☐ 50% current: _____A
☐ Duration: _____ seconds
☐ Peak temp: Motor _____°C  Controller _____°C
☐ Temp stability: ☐ Stable ☐ Rising ☐ Runaway
☐ RESULT: ☐ PASS  ☐ FAIL

PHASE 4: FULL POWER
☐ Target current achieved: _____A
☐ Max motor temp: _____°C
☐ Max controller temp: _____°C
☐ Any faults: ☐ None ☐ Code: _____
☐ RESULT: ☐ PASS  ☐ FAIL

PHASE 5: OPERATIONAL
☐ Scenario: ________________________________
☐ Duration: _____ minutes
☐ Max motor temp: _____°C
☐ Max controller temp: _____°C
☐ Performance: ☐ Meets target ☐ Below target
☐ RESULT: ☐ PASS  ☐ FAIL

OVERALL ASSESSMENT:
☐ Configuration validated for operational use
☐ Further tuning needed: ________________________________
☐ Safety concerns: ________________________________
═══════════════════════════════════════════════════════════
```

## Summary

This progressive testing protocol is MANDATORY for safe VESC configuration. Each phase builds on the previous, ensuring safety at every step. Never skip phases, and never proceed if a phase fails.

Remember: **When in doubt, stop and reassess.** Safety always comes before performance.
