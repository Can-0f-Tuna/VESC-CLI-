# VESC CLI Skill

**AI-controllable CLI for VESC motor controllers with interactive guided setup.**

When you load this skill, the AI agent will automatically interview you about your hardware and present safe configuration options — no need to know the commands yourself.

---

## How It Works

### 1. Start a Conversation
Just tell the agent you want to configure your VESC:

```
User: I want to configure my VESC
Agent: Hello! I'm your VESC configuration assistant. I'll help you set up your motor controller safely. To give you the best options, I need to understand your hardware first.

What VESC controller are you using? (e.g., VESC 4.12, VESC 6, Flipsky FSESC)
```

The agent will ask you about:
- **Your controller** (VESC model)
- **Your motor** (brand, kV rating, current limit)
- **Your battery** (type, voltage, configuration)
- **Your application** (e-skate, e-bike, robot, etc.)
- **Your goals** (speed, torque, range, safety level)

### 2. Choose Your Behavior
Based on your hardware, the agent presents options like:

- **Startup style**: Jump to speed instantly, or ramp up slowly?
- **Speed limit**: Cap the top speed for safety, or full range?
- **Acceleration**: Gentle, medium, or aggressive?
- **Braking**: Regenerative, active braking, or coast?
- **Control mode**: Torque control, speed control, or simple throttle?

### 3. Safe Execution
The agent calculates safe limits from your hardware specs, shows you exactly what will be applied, asks for confirmation, then executes with progressive testing — starting at low power and working up.

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
- Present behavior options (startup, speed limits, acceleration, braking)
- Calculate safe current and speed limits
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

## Skill Structure

```
vesc-cli-skill/
├── SKILL.md                      # Entry point (agent role, behavior rules, interview flow)
├── commands.md                   # Complete command reference (all 40 commands)
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

## Example Conversation

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

       Safe Maximums:
       - Motor current: 80A max (motor limit)
       - Battery current: 60A max (battery limit)
       - Recommended: 50A motor / 40A battery for daily use

       Based on your setup, here are the behavior options available to you:

       A. Startup Style
          [1] Jump to target speed instantly — best for racing, experienced users
          [2] Ramp up slowly from standstill — best for skateboards, beginners (RECOMMENDED)
          [3] Gradual torque from zero — best for hill starts, heavy loads

       B. Speed Limit
          [1] Cap at safe speed for beginners — limit to 30 km/h equivalent
          [2] No limit — full hardware capability
          [3] Variable modes — Eco/Sport/Race with different limits

       C. Acceleration
          [1] Gentle — smooth, predictable, longest range (RECOMMENDED)
          [2] Medium — responsive but controlled, good for daily use
          [3] Aggressive — immediate response, maximum thrill

       Which options would you like? I recommend [2] for startup, [1] for speed limit,
       and [1] for acceleration for a safe first setup.

User: Let's go with your recommendations

Agent: I will apply the following settings:
       - Motor current: 50A
       - Battery current: 40A
       - Startup: Ramp up slowly
       - Speed limit: 30 km/h equivalent
       - Acceleration: Gentle
       - Control mode: Current (torque)
       - Braking: Regenerative

       Type 'yes' to proceed, or tell me what to change.

User: yes

Agent: Applying configuration... [executes veac commands]
       ✓ Configuration complete!
       ✓ Static test passed (2A, no faults)
       ✓ Low power test passed (10A, temps stable)

       Your VESC is now configured for safe operation.

       Next actions:
       1. veac motor get-values - Check motor status
       2. veac motor set-rpm 1000 - Test motor at low RPM
       3. veac motor stop - Emergency stop
```

---

## Safety Features

The skill enforces safety at every step:

- **Hardware-aware limits**: Safe current/speed calculated from your specs
- **Temperature monitoring**: Configurable temp cutoffs
- **Current limits**: Prevents exceeding hardware ratings
- **Voltage protection**: Validates battery-VESC compatibility
- **Dry-run mode**: Preview changes before applying
- **Emergency protocols**: Built-in stop commands
- **Fault detection**: Monitors and reports fault codes
- **Progressive testing**: Always starts at 2A, works up slowly

---

## Command Categories

| Category | Commands | Description |
|----------|----------|-------------|
| **Device** | 5 | Port listing, connection, info, ping |
| **Motor** | 10 | RPM, current, duty, brake, stop, values, detect, stream, position, handbrake |
| **CAN** | 4 | ID setting, scanning, forwarding, status |
| **Lisp** | 9 | Upload, REPL, memory, stats, erase, start, stop, read, write |
| **Config** | 6 | Read, write, backup, restore |
| **Terminal** | 2 | Interactive REPL, single command |
| **Firmware** | 2 | Info, update |
| **Utility** | 2 | Completions, schema |

**Total: 40 commands implemented**

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
