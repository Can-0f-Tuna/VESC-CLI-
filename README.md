# VESC CLI

**AI-Controllable Command Line Interface for VESC Motor Controllers**

[![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-green?style=for-the-badge)]()

A modern, lightweight CLI tool for controlling VESC (Vedder Electronic Speed Controller) motor controllers. Built for AI agents, automation, and human engineers who prefer the terminal.

## ✨ Features

- 🤖 **AI-First Design** - JSON output with HATEOAS navigation for agents
- ⚡ **Fast** - Native Rust binary, ~1ms startup
- 🔧 **Complete Control** - All 58 VESC commands supported
- 📊 **Real-time Telemetry** - Motor values, temperatures, faults (34 error codes)
- 💾 **Configuration** - Backup/restore MC and APP settings
- 🔌 **Auto-Discovery** - Automatically finds VESC on USB
- 🌐 **CAN Bus** - Multi-VESC network support
- 📜 **LispBM** - Scripting support for advanced users
- 🛡️ **Safe** - Dry-run mode, validation, comprehensive error handling

## 🚀 Quick Install

### One-Line Installation

**macOS & Linux:**
```bash
curl -sSL https://raw.githubusercontent.com/Can-0f-Tuna/VESC-CLI-/master/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/Can-0f-Tuna/VESC-CLI-/master/install.ps1 | iex
```

### Manual Installation

1. **Install Rust** (if not already installed):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Clone and Build:**
   ```bash
   git clone https://github.com/Can-0f-Tuna/VESC-CLI-.git
   cd VESC-CLI-
   cargo build --release
   ```

3. **Install:**
   ```bash
   cargo install --path .
   ```

## 🎯 Quick Start

### 1. List Available Devices
```bash
vesc device list-ports
```

### 2. Connect to VESC
```bash
vesc device connect --port COM3
# or auto-detect:
vesc device connect
```

### 3. Get Motor Telemetry
```bash
vesc motor get-values --port COM3
```

### 4. Control Motor
```bash
# Set RPM
vesc motor set-rpm 1000 --port COM3

# Set current (Amps)
vesc motor set-current 5.0 --port COM3

# Stop motor
vesc motor stop --port COM3
```

## 📖 Usage Guide

### Device Commands

```bash
vesc device list-ports      # List all serial ports
vesc device connect         # Connect and verify VESC
vesc device info            # Get firmware version and hardware info
vesc device ping            # Check connectivity
```

### Motor Commands

```bash
vesc motor get-values              # Real-time telemetry (voltage, current, RPM, temp)
vesc motor set-rpm <rpm>           # Set motor speed
vesc motor set-duty <0.0-1.0>      # Set duty cycle
vesc motor set-current <amps>     # Set motor current
vesc motor set-current-brake <a>  # Apply current brake
vesc motor stop                   # Emergency stop
```

### Configuration Commands

```bash
vesc config get-mc              # Read motor controller config
vesc config set-mc config.json  # Write motor controller config
vesc config get-app             # Read app config
vesc config set-app app.json    # Write app config
vesc config backup backup.json  # Backup all configs
vesc config restore backup.json # Restore from backup
```

### CAN Bus Commands (Multi-VESC)

```bash
vesc can set-id 1               # Set CAN ID for this VESC
vesc can scan                   # Discover VESCs on CAN bus
vesc can forward 2 set-rpm 1000 # Send command to VESC #2
```

### Schema & Discovery

```bash
vesc schema                     # Show all available commands
vesc schema motor               # Show motor command schema
vesc generate-completions bash  # Generate shell completions
```

## 🤖 For AI Agents

Every command returns structured JSON with HATEOAS navigation:

```bash
$ vesc motor get-values
{
  "ok": true,
  "command": "motor get-values",
  "result": {
    "input": { "voltage": 50.4, "current": 2.5 },
    "motor": { "rpm": 1200, "current": 5.2, "duty_cycle": 0.65 },
    "temperatures": { "mosfet": 42.0, "motor": 38.5 },
    "fault": { "code": 0, "active": false }
  },
  "next_actions": [
    { "command": "vesc motor stop", "description": "Stop the motor" },
    { "command": "vesc motor set-rpm 1000", "description": "Set to 1000 RPM" }
  ]
}
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Connection failed |
| 3 | Timeout |
| 4 | Invalid argument |
| 5 | Protocol error |

## 🛠️ Advanced Features

### Dry-Run Mode
Preview changes without applying:
```bash
vesc config set-mc new-config.json --dry-run
```

### Terminal Mode
Interactive REPL:
```bash
vesc terminal --repl
```

### LispBM Scripting
```bash
vesc lisp upload script.lisp    # Upload script
vesc lisp start                 # Start execution
vesc lisp repl "(+ 1 2 3)"      # Execute REPL command
```

## 📦 Installation Details

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, Linux (most distributions)
- **Architecture**: x86_64 or ARM64
- **Serial**: USB port for VESC connection
- **Optional**: Rust 1.70+ (only for building from source)

### Where It's Installed

| Platform | Location |
|----------|----------|
| macOS/Linux | `~/.local/bin/vesc` |
| Windows | `%USERPROFILE%\.vesc-cli\bin\vesc.exe` |

### Shell Completions

Generate completions for your shell:
```bash
vesc generate-completions bash  # >> ~/.bashrc
vesc generate-completions zsh   # >> ~/.zshrc
vesc generate-completions fish  # >> ~/.config/fish/config.fish
```

## 🔧 Building from Source

```bash
# Clone repository
git clone https://github.com/Can-0f-Tuna/VESC-CLI-.git
cd VESC-CLI-

# Build release binary
cargo build --release

# Run tests
cargo test

# Install locally
cargo install --path .
```

## 🐛 Troubleshooting

### "vesc: command not found"

**macOS/Linux:**
```bash
export PATH="$HOME/.local/bin:$PATH"
source ~/.bashrc  # or ~/.zshrc
```

**Windows:**
Restart your terminal, or run:
```powershell
$env:PATH = [Environment]::GetEnvironmentVariable("Path", "User")
```

### "No VESC found"

1. Check USB connection
2. Run `vesc device list-ports` to see available ports
3. Try manual port: `vesc device connect --port COM3` (Windows) or `--port /dev/ttyACM0` (Linux)

### Permission Denied (Linux)

Add user to dialout group:
```bash
sudo usermod -a -G dialout $USER
# Log out and back in
```

## 📝 Documentation

- [Agent Guide](AGENTS.md) - Complete guide for AI agents
- [CLI Context](CLI_CONTEXT.md) - VESC domain knowledge
- [Architecture](orchestrator-agent-docs/architecture.md) - System design
- [Examples](examples/) - Sample scripts and workflows

## 🤝 Contributing

Contributions welcome! Areas we need help:

- Binary protocol parsing improvements
- Additional VESC commands
- Better error messages
- Documentation translations
- CI/CD improvements

## 📄 License

GPL-3.0 - See [LICENSE](LICENSE)

## 🙏 Acknowledgments

- [VESC Project](https://vesc-project.com/) by Benjamin Vedder
- [Rust Community](https://www.rust-lang.org/community)
- Contributors and testers

---

**Built with ❤️ for the VESC community**

For support, open an [issue](https://github.com/Can-0f-Tuna/VESC-CLI-/issues) or join the discussion.
