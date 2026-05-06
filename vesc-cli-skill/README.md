# VESC CLI Skill

**AI-controllable CLI for VESC motor controllers with interactive guided setup.**

Provides comprehensive support for VESC motor control, CAN bus operations, LispBM scripting, and configuration management with an intelligent workflow system.

---

## Installation

Install this skill with a single command:

```bash
bunx skills add https://github.com/Can-0f-Tuna/VESC-CLI-.git --skill vesc-cli
```

**Requirements:**
- Node.js ≥ 18.0
- Bun runtime ≥ 1.0
- `veac` CLI installed globally: `bun install -g @veac/cli`

---

## Quick Start

Once installed, the skill provides expert guidance for:

### 1. Interactive Guided Setup (Recommended for Beginners)

Just start a conversation about VESC setup:

```
User: I want to configure my VESC motor controller
Agent: I'll help you set that up! Let me ask a few questions about your hardware...
```

The agent will:
- Interview you about your hardware (VESC model, motor, battery)
- Look up specifications from the hardware database
- Present preset configurations (Conservative / Balanced / Performance / Custom)
- Execute with 10-step safety validation

### 2. Direct Command Execution

```
User: Run veac motor set-rpm 1000
Agent: Executing veac motor set-rpm 1000...
```

### 3. Hardware Lookup

```
User: What VESC 6 specs do you have?
Agent: Reading VESC 6 specifications from database...

User: Tell me about Flipsky 6374 motors
Agent: Reading Flipsky motor specifications...
```

---

## Skill Structure

```
vesc-cli-skill/
├── SKILL.md                      # Entry point (triggers, quick start, workflow)
├── commands.md                   # Complete command reference (all 65+ commands)
├── examples.md                   # Usage examples with interactive dialogue
├── safety.md                     # Safety protocols and configuration checks
├── troubleshooting.md            # Common errors and solutions
├── references/
│   ├── workflows.md              # 4-phase interview + preset matrix + testing protocol
│   ├── commands.md               # Detailed command documentation
│   └── README.md                 # Reference documentation index
└── information/                  # Hardware database (34 files)
    ├── controllers/              # 15 files (30+ VESC models documented)
    ├── motors/                   # 12 files (50+ motor variants)
    └── batteries/                # 7 files (11 cell types + safety guides)
```

---

## Interactive Workflow Features

### Phase 1: Hardware Discovery
The agent asks structured questions:
1. VESC controller model
2. Motor model and kV rating
3. Battery configuration (voltage, capacity, cell type)
4. Application type (e-skate, e-bike, robot, etc.)
5. Temperature constraints
6. Current limits

### Phase 2: Configuration Options
Based on your hardware, the agent presents:

| Preset | Motor Current | Battery Current | Temp Limits | Best For |
|--------|--------------|-----------------|-------------|----------|
| **Conservative** | 30-40A | 20-30A | 80°C max | Beginners, testing |
| **Balanced** | 50-60A | 40-50A | 85°C max | Daily use |
| **Performance** | 70-80A | 60-70A | 90°C max | Experienced users |
| **Custom** | User-defined | User-defined | Custom | Specific needs |

### Phase 3: Safety Checkpoints
- Voltage compatibility verification
- Current within safe margins
- Temperature limits configured
- Fault code monitoring enabled
- Emergency stop tested

### Phase 4: Execution
- Command preview with dry-run option
- Live status monitoring
- Post-execution verification
- `next_actions` suggestions for follow-up commands

---

## Hardware Database

The skill includes comprehensive documentation for:

### Controllers (30+ Models)
- **Official VESC**: 4.12, 6, Express, HD60/HD75, 75/300, 100/250
- **VESC Labs 2025**: Minim, Duet, Classic, Maxim series
- **Third-party**: Flipsky, Makerbase, Spintend, Torqueboards, Cheap FOCer

### Motors (50+ Variants)
- **E-Skate**: Maytech, Flipsky, Torqueboards, BKB, Eovan
- **E-Bike**: Bafang BBS02/BBSHD, QS Motor 205/273, MXUS 3K Turbo
- **Budget**: Turnigy SK3/SK8, Generic 50xx/63xx
- **Specialty**: T-Motor UAV motors

### Batteries
- **Cell Types**: 11 major models (Samsung, LG, Sony, Molicel, Panasonic)
- **Configurations**: 6S, 10S, 12S, 14S, 20S setup guides
- **Safety**: Thermal runaway prevention, BMS selection, emergency protocols

---

## Usage Examples

### Setup a New VESC

```
User: I just got a Flipsky FSESC 6.7 and want to set it up for my e-skate
Agent: Great choice! The Flipsky FSESC 6.7 is a solid VESC 6 based controller. 
       To help you configure it safely, I need to know:

       1. What motor are you using? (e.g., Flipsky 6374 190kV)
       2. What's your battery setup? (e.g., 10S4P with Samsung 30Q)
       3. What's your application? (e-skate, e-bike, robot, etc.)

User: I have Flipsky 6374 190kV and 10S4P Samsung 30Q, e-skate
Agent: Reading hardware specifications...
       
       Hardware Profile:
       - VESC: Flipsky FSESC 6.7 (60V max, 100A burst, VESC 6 based)
       - Motor: Flipsky 6374 190kV (3150W max, 80A current, 190kV)
       - Battery: 10S4P Samsung 30Q (42V max, 15A per cell, 60A total)
       
       Calculated Safe Limits:
       - Motor current: 80A max (motor limit)
       - Battery current: 60A max (battery limit)
       - Recommended: 50A motor / 40A battery for daily use
       
       Recommended Preset: Balanced
       - Motor current: 50A
       - Battery current: 40A  
       - ERPM limit: 100,000
       - Temperature cutoff: 85°C start, 100°C cutoff
       
       Would you like me to apply the Balanced preset? (Conservative/Balanced/Performance/Custom)

User: Balanced
Agent: Applying configuration... [executes veac commands]
       ✓ Configuration complete! 
       Your VESC is now configured for safe operation.
       
       Next actions:
       1. veac motor get-values - Check motor status
       2. veac motor set-rpm 1000 - Test motor at low RPM
       3. veac motor stop - Emergency stop
```

### Direct Motor Control

```
User: veac motor set-current 5.0
Agent: Executing veac motor set-current 5.0...
       ✓ Success! Motor current set to 5.0A
       
       Motor is now running with 5A current.
       
       Next actions:
       1. veac motor get-values - Check telemetry
       2. veac motor stop - Stop motor
       3. veac motor set-current 10.0 - Increase current
```

### Configuration Backup

```
User: Backup my VESC config
Agent: Creating complete backup...
       ✓ Motor configuration backed up
       ✓ App configuration backed up
       Backup saved to vesc-backup-2025-01-08.json
       
       Next actions:
       1. veac config restore vesc-backup-2025-01-08.json - Restore from this backup
       2. veac config get-mc --output mc-conf.xml - Export motor config
```

### Hardware Specs Lookup

```
User: What are the specs for VESC 75/300?
Agent: Reading VESC 75/300 specifications...

       VESC 75/300 - Ultra-High Current Controller
       ─────────────────────────────────────────
       
       Electrical Specifications:
       - Max Voltage: 75V (18S Li-ion / 22S LiPo max)
       - Max Current: 300A (phase shunt design)
       - Continuous Current: ~150A (depends on cooling)
       - Wattage: 22,500W max
       
       Hardware:
       - CPU: STM32F4
       - Shunt Type: Phase shunt (three phases)
       - Cooling: Forced air + optional liquid cooling
       - Connectors: 8mm bullet connectors (power)
       
       Use Cases:
       - High-power e-bikes and e-motos
       - Electric motorcycles
       - EV conversions
       - High-torque robotics
       
       Typical Motor Pairing:
       - 3000-8000W BLDC motors
       - 20S-24S battery packs
       - 200-300A capable battery systems
```

---

## Safety Features

The skill enforces safety at every step:

- **Temperature monitoring**: Configurable temp cutoffs
- **Current limits**: Prevents exceeding hardware ratings
- **Voltage protection**: Validates battery-VESC compatibility
- **Dry-run mode**: Preview changes before applying
- **Emergency protocols**: Built-in stop commands
- **Fault detection**: Monitors and reports fault codes

---

## Command Categories

| Category | Commands | Description |
|----------|----------|-------------|
| **Device** | 5 | Port listing, connection, info, ping |
| **Motor** | 8 | RPM, current, duty, brake, stop, values |
| **CAN** | 6 | ID setting, scanning, forwarding, status |
| **Lisp** | 9 | Upload, REPL, memory, stats, erase |
| **Config** | 7 | Read, write, backup, restore, erase |
| **Terminal** | 2 | Interactive REPL, single command |
| **Utility** | 3 | Completions, schema, version |

**Total: 65+ commands documented**

---

## Troubleshooting

The skill includes comprehensive troubleshooting guides:

- Connection failures and port issues
- Command timeouts
- Invalid argument errors  
- Protocol errors
- Motor control failures
- CAN bus issues
- Configuration errors

---

## Contributing

This skill is part of the veac CLI project. To contribute:

1. Fork the repository
2. Add hardware documentation to `information/` folder
3. Update command references in `references/`
4. Submit a pull request

---

## License

MIT License - See project repository for details.

---

## Resources

- **VESC Project**: https://vesc-project.com
- **VESC Tool Docs**: https://docs.vesc-project.com
- **Benjamin Vedder**: https://vedder.se
- **ESK8 Builders**: https://www.electric-skateboard.builders
- **Endless Sphere**: https://endless-sphere.com

---

**Quick Install Reminder:**

```bash
bunx skills add https://github.com/Can-0f-Tuna/VESC-CLI-.git --skill vesc-cli
```
