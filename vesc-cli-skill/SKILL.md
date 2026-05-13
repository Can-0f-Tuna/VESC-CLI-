# VESC CLI Skill

Agent-first CLI tool for controlling VESC motor controllers with HATEOAS-style JSON responses and self-documenting command trees.

## Quick Reference

```bash
# Connect to VESC
veac device connect

# Get motor telemetry
veac motor get-values

# Set motor RPM
veac motor set-rpm 1000

# Stop motor
veac motor stop

# Backup configuration
veac config backup --output backup.json
```

## ⚠️ Implementation Status

This skill documents the intended full API. Command status:
- ✅ [Implemented] — Working in current build
- ⚠️ [Partial] — Basic functionality, limitations noted
- ❌ [Missing] — Not yet implemented (will error if used)

**Current coverage:** ~40 CLI commands implemented. The VESC protocol supports 160+ packet IDs; this CLI exposes the most commonly used subset.

See `references/commands.md` for complete command reference.

## Guided Setup Workflow

When this skill is loaded without a specific command, the agent should initiate an interview process to understand the user's setup and guide them through safe configuration.

### Overview

This conversational workflow helps users:
1. Identify their hardware components
2. Select appropriate configuration presets
3. Validate safety parameters
4. Apply configurations progressively and safely

### Phase 1: Hardware Discovery (Interview Questions)

The agent MUST ask the user these questions to understand their setup:

**Essential Hardware Questions:**

1. **VESC Controller Model**
   - Which VESC are you using? (e.g., VESC 4.12, VESC 6 MkIII, VESC 75/300, VESC Express, etc.)
   - This determines available features and current limits

2. **Motor Specifications**
   - Brand and model of the connected motor?
   - kV rating (RPM per volt)?
   - Pole count (if known)?
   - Maximum rated current (continuous and peak)?

3. **Battery Setup**
   - Battery chemistry? (LiPo, Li-ion, LiFePO4)
   - Nominal voltage? (e.g., 6S = 22.2V, 10S = 37V, 12S = 44.4V)
   - Capacity in Ah?
   - Maximum discharge current rating?
   - Battery configuration? (e.g., 10S4P, 12S3P)

4. **Application Type**
   - What is this for? (electric skateboard, e-bike, robot, drone, industrial automation, etc.)
   - This determines appropriate presets and safety margins

5. **Performance Requirements**
   - Desired maximum speed? (km/h or mph, or target RPM range)
   - Weight of vehicle or load? (kg or lbs)
   - Any specific performance priorities?

6. **Constraints and Priorities**
   - Noise sensitivity? (quiet operation needed)
   - Heat constraints? (enclosed space, limited cooling)
   - Efficiency vs Performance preference?
   - Range vs Power preference?

### Phase 2: Present Configuration Options

Based on the hardware discovered, show the user available preset categories:

**Available Preset Categories:**

| Preset | Description | Best For |
|--------|-------------|----------|
| **Conservative** | Lower current limits, softer acceleration, generous safety margins | Beginners, testing, sensitive applications |
| **Balanced** | Good performance with reasonable safety margins | Most users, daily use |
| **Performance** | Higher limits, aggressive response | Experienced users, racing, maximum output |
| **Custom** | Manual configuration | Expert users, specific requirements |

**Trade-off Explanations:**

Present these trade-offs clearly so the user can make informed decisions:

| Trade-off | Option A | Option B | Impact |
|-----------|----------|----------|--------|
| Speed vs Torque | Higher speed gearing | Lower speed, higher torque | Top end vs hill climbing |
| Acceleration vs Efficiency | Aggressive acceleration | Gentle ramp-up | Battery drain, component stress |
| Range vs Power | Lower current limits | Higher current limits | Distance per charge vs acceleration |
| Heat vs Performance | Conservative limits | Aggressive limits | Component life vs power output |
| Battery Life vs Performance | Lower discharge rates | Higher discharge rates | Longevity vs immediate power |

### Phase 3: Safety Checkpoints

Before applying ANY configuration, the agent MUST:

**Pre-Configuration Checklist:**

1. ✓ **Verify Motor Detection**
   - Confirm motor detection has been run successfully (usually via the VESC Tool GUI)
   - Check detected parameters match expected values
   - **Note:** Motor detection via CLI (`veac motor detect`) is now implemented. Ensure motor detection has been run successfully and detected parameters match expected values.

2. ✓ **Validate Temperature Limits**
   - Motor limit: Typically 80°C (adjust based on motor specs)
   - Controller limit: Typically 70°C (adjust based on VESC model)
   - Ensure limits are appropriate for the hardware

3. ✓ **Confirm Current Limits Are Safe**
   - Motor current ≤ Motor rated continuous current
   - Battery current ≤ Battery maximum discharge current
   - Both ≤ Wiring gauge rating
   - Both ≤ VESC maximum specifications

4. ✓ **Require Explicit Confirmation**
   - Present proposed configuration clearly
   - Show what will change from current settings
   - Ask for explicit "yes" before writing config
   - Example: "I will apply the Balanced preset with 40A motor current and 20A battery current. Type 'yes' to proceed."

5. ✓ **Recommend Conservative Start**
   - Suggest starting with Conservative preset for first tests
   - Explain progressive testing approach
   - Emphasize safety over performance initially

### Phase 4: Execution Workflow

The step-by-step process for applying configuration:

**Step 1: Connect to VESC**
```bash
veac device connect
# Or specify port: veac device connect --port /dev/ttyACM0
```

**Step 2: Check Device Info**
```bash
veac device info
# Verify connection and firmware version
```
**Note:** Motor detection (`veac motor detect`) is now implemented. You may still use the VESC Tool GUI for initial motor detection if preferred.

**Step 3: Backup Current Configuration**
```bash
veac config backup --output current-config-backup.json
```

**Step 4: Read Current Motor Configuration**
```bash
veac config get-mc --output current-mc.json
```

**Step 5: Show Proposed Changes (Dry Run)**
```bash
veac config set-mc new-config.json --dry-run
```
**Note:** `--dry-run` currently returns a placeholder response for most commands. It does not validate configurations against current settings or show real diffs. Use it as a command syntax check only.

**Step 6: Apply Configuration**
```bash
veac config set-mc new-config.json
```

**Step 7: Verify Motor Status Before Testing**
```bash
veac motor get-values
# Confirm no fault codes and motor is ready
```
Then test at Low Power (Static Test):
```bash
veac motor set-current 2.0
# Observe for 5-10 seconds
veac motor stop
```

**Step 8: Verify with Telemetry**
```bash
veac motor get-values
# Check for fault codes, temperatures, expected current draw
```

**Step 9: Progressive Power Testing**
```bash
# If Step 7-8 passed, test at 25% of target
veac motor set-current 10.0
# Monitor for 30 seconds
veac motor get-values
veac motor stop

# Then 50%
veac motor set-current 20.0
# Monitor continuously

# Only after all tests pass, try full target
```

**Step 10: Operational Validation**
```bash
# Test in actual application conditions
veac motor set-rpm <target_rpm>
# Full operational test with monitoring
```

### Progressive Testing Protocol

Always follow this testing sequence:

1. **Static Test (Unloaded)**
   - 2A current maximum
   - Check motor direction
   - Listen for abnormal sounds
   - Verify smooth rotation

2. **Low Load Test**
   - 5A current or 25% of target
   - Brief spin (3-5 seconds)
   - Check temperature rise
   - Verify no faults

3. **Medium Load**
   - 25-50% of target current
   - Monitor for 30 seconds
   - Check temperature stability
   - Verify telemetry is normal

4. **Full Power Test**
   - Only after all previous pass
   - Target current/RPM
   - Continuous monitoring
   - Stop immediately if any anomaly

5. **Operational Test**
   - Run through full intended use case
   - Extended monitoring
   - Verify all functions work correctly

See `references/workflows.md` for detailed workflow documentation, preset matrices, and testing protocols.

## References

- **commands.md** - Complete command reference with all options and parameters
- **examples.md** - Practical usage examples for common workflows
- **safety.md** - Safety guidelines, temperature limits, and operational procedures
- **troubleshooting.md** - Common issues and solutions
- **workflows.md** - Interview templates, preset matrices, and testing protocols

## Safety First

Always:
1. Start with `--dry-run` to preview changes
2. Backup configuration before modifications
3. Test incrementally from low to high power
4. Monitor temperatures continuously
5. Have emergency stop ready (`veac motor stop`)
6. Check fault codes after each operation

**Note on `--dry-run`:** `--dry-run` currently returns a placeholder response for most commands. It does not validate configurations against current settings or show real diffs. Use it to verify command syntax, but rely on manual review and backups for true change validation.

See `references/safety.md` for complete safety guidelines.

## Error Handling

All commands return JSON. Check the `ok` field:
- `ok: true` - Success, use `result`
- `ok: false` - Failure, check `error` and `fix` fields

## HATEOAS Navigation

Every response includes `next_actions` - an array of suggested next commands to guide workflow.

## Exit Codes

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

## Known Limitations

- **Platform:** Bash syntax is used in examples; Windows users may need PowerShell equivalents (e.g., `veac device connect --port COM3`).
- **CAN bus:** `veac can scan` uses a naive polling approach rather than the proper `COMM_PING_CAN` protocol command. `veac can status` returns general telemetry data, not actual CAN bus statistics.
- **Dry run:** `--dry-run` is a placeholder-only flag for most commands and does not perform real validation or diffing.

All planned CLI commands are now implemented. Some hardware-specific features (e.g., firmware update validation) may still require testing against real VESC hardware.
