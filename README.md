# VESC CLI (veac) - AI-Controllable Motor Controller CLI

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)]()
[![License](https://img.shields.io/badge/license-GPL--3.0-green.svg)](LICENSE)

AI-controllable CLI for VESC motor controllers built with Bun + TypeScript. Features interactive conversational workflow, comprehensive hardware database, and HATEOAS-style JSON responses for seamless agent integration.

## ✨ Features

- **🎯 Interactive Setup Workflow** - Conversational hardware discovery and safe configuration
- **📊 Comprehensive Database** - 30+ VESC controllers, 50+ motors, 11 battery cells documented
- **🤖 Agent-First Design** - HATEOAS-style JSON responses with suggested next actions
- **⚡ High Performance** - Built with Bun for fast execution
- **🔧 Full VESC Support** - Motor control, CAN bus, Lisp scripting, configuration management
- **🛡️ Safety-First** - Built-in protection, validation, and progressive configuration
- **📚 Self-Documenting** - Schema introspection for all commands

## 🚀 One Command Install

Install both the CLI tool and the agent skill in one line:

```bash
bunx github:Can-0f-Tuna/veac/install
```

Or with npx (if you don't have Bun):

```bash
npx github:Can-0f-Tuna/veac/install
```

This will:
- ✅ Install the `veac` CLI globally
- ✅ Install the VESC CLI skill for agent assistance
- ✅ Build from source automatically
- ✅ Set up all necessary dependencies

### 🔄 Alternative Options

**Skill-only install** (if you already have the CLI):

```bash
bunx skills add https://github.com/Can-0f-Tuna/veac.git --skill vesc-cli-skill
```

### 🔧 Advanced Install (Manual)

For those who prefer full control or need to customize the installation:

```bash
# Clone the repository
git clone https://github.com/Can-0f-Tuna/veac.git
cd veac

# Install dependencies and build
bun install
bun run build

# Link globally (optional)
bun link

# Add the skill separately (optional)
bunx skills add https://github.com/Can-0f-Tuna/veac.git --skill vesc-cli-skill
```

## 🎮 Usage

### Quick Start

```bash
# List available VESC devices
veac device list-ports

# Connect to a VESC
veac device connect --port /dev/ttyACM0

# Get motor telemetry
veac motor get-values

# Control the motor
veac motor set-rpm 1000
veac motor set-current 5.0
veac motor stop
```

### Interactive Guided Setup

When you mention VESC without a specific command, the agent will guide you through an interactive setup:

```
🎯 VESC Guided Setup
===================

I'll help you configure your VESC safely. First, let me understand your hardware setup.

Phase 1: Hardware Discovery
1. Which VESC controller are you using?
   (e.g., VESC 6 MkIII, VESC 75/300, VESC Express)

2. What's your motor brand and kV rating?

3. What's your battery configuration?

[Agent analyzes your hardware and presents safe configuration presets]

Configuration Presets Available:
- 🛡️ Conservative: Safe for all hardware, ~60% capability
- ⚖️ Balanced: Good performance with safety margin, ~80% capability
- 🚀 Performance: Maximum safe performance, ~95% capability
- ⚙️ Custom: Define your own parameters

[After selection, the agent applies the configuration progressively with validation]
```

## 📦 Architecture

```
veac/
├── apps/
│   └── cli/              # Main CLI application
├── packages/
│   ├── protocol/         # VESC binary protocol
│   ├── serial/           # Serial communication
│   ├── cli-core/         # Shared CLI utilities
│   └── config/           # Configuration types
├── vesc-cli-skill/       # Agent skill package
│   ├── SKILL.md          # Skill entry point
│   ├── references/       # Workflow guides, command reference
│   └── information/      # Hardware database
│       ├── controllers/  # 30+ VESC models documented
│       ├── motors/       # 50+ BLDC motors
│       └── batteries/    # Battery fundamentals + cell database
└── examples/             # Usage examples
```

## 📋 Commands

### Device Operations
```bash
veac device list-ports       # List available serial ports
veac device connect          # Connect to VESC (auto-detect or specify port)
veac device info             # Get device information
veac device ping             # Test connection
```

### Motor Control
```bash
veac motor get-values        # Get telemetry (RPM, current, voltage, temp)
veac motor set-rpm <rpm>     # Set target RPM
veac motor set-current <A>   # Set motor current in Amps
veac motor set-duty <0-1>    # Set duty cycle (0-100%)
veac motor stop              # Stop motor safely
veac motor set-current-brake # Apply regenerative braking
```

### Configuration
```bash
veac config get-mc           # Read motor configuration
veac config get-mc --output mcconf.json
veac config set-mc mcconf.json
veac config get-app          # Read app configuration
veac config backup --output backup.json
veac config restore backup.json
```

### CAN Bus
```bash
veac can set-id <id>         # Set CAN ID for this VESC
veac can scan                # Scan for VESCs on CAN bus
veac can status              # Get CAN bus status
veac can forward <id> <cmd>  # Forward command to another VESC
```

### Lisp Scripting
```bash
veac lisp upload script.lisp # Upload LispBM script
veac lisp start              # Start Lisp execution
veac lisp stop               # Stop Lisp execution
veac lisp repl <code>        # Execute REPL command
veac lisp get-stats          # Get Lisp statistics
veac lisp erase              # Erase Lisp program
```

### Schema Introspection
```bash
veac schema                  # Get full command schema
veac schema motor            # Get schema for motor commands
veac schema motor set-rpm    # Get specific command schema
```

## 🛡️ Safety Features

- **Progressive Configuration** - Apply settings in stages with validation
- **Hardware Limits Checking** - Database-enforced limits based on your hardware
- **Temperature Monitoring** - Automatic warnings and limits
- **Dry Run Mode** - Preview changes with `--dry-run`
- **Backup/Restore** - Full configuration backup before changes
- **Fault Code Checking** - Automatic post-operation verification

## 📚 Hardware Database

The skill includes comprehensive documentation:

### Controllers (30+ models)
- Official VESC: 4.12, 6 (MKIII-MKVI), 75/300, 100/250, Express, HD60/HD75
- VESC Labs 2025: Minim, Duet, Classic, Maxim series
- Third-party: Flipsky, Makerbase, Spintend, TorqueBoards, Cheap FOCer

### Motors (50+ variants)
- E-skate: Maytech, Flipsky, TorqueBoards, BKB, Eovan
- E-bike: Bafang, QS Motor, MXUS
- Budget: Turnigy, Generic
- Specialty: T-Motor (UAV/robotics)

### Batteries
- LiPo, Li-ion (18650, 21700), LiFePO4 fundamentals
- Cell database: Samsung, LG, Sony, Molicel, Panasonic
- BMS selection guide
- Safety protocols and thermal runaway prevention

## 🔧 Environment Variables

```bash
VEAC_PORT=/dev/ttyACM0       # Default serial port
VEAC_BAUD=115200             # Default baud rate
VEAC_CAN_ID=1                # Default CAN ID
```

## 🧪 Development

```bash
# Install dependencies
bun install

# Run CLI in development mode
bun run dev

# Build all packages
bun run build

# Run tests
bun run test

# Run the CLI
bun run veac --help
```

## 📖 Documentation

- [SKILL.md](vesc-cli-skill/SKILL.md) - Skill entry point and workflow guide
- [references/commands.md](vesc-cli-skill/references/commands.md) - Complete command reference
- [references/workflows.md](vesc-cli-skill/references/workflows.md) - Interactive setup guide
- [references/examples.md](vesc-cli-skill/references/examples.md) - Usage examples
- [information/controllers/](vesc-cli-skill/information/controllers/) - Controller database
- [information/motors/](vesc-cli-skill/information/motors/) - Motor database
- [information/batteries/](vesc-cli-skill/information/batteries/) - Battery database

## 🐛 Troubleshooting

See [references/troubleshooting.md](vesc-cli-skill/references/troubleshooting.md) for:
- Connection issues
- Motor control problems
- CAN bus diagnostics
- Configuration errors
- Performance optimization

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit PRs.

## 📄 License

GPL v3 - Following the VESC project licensing philosophy

---

**Made for makers, by makers.** Control your VESC with confidence. 🛹⚡🤖
