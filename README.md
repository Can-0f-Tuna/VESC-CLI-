# VESC CLI (veac)

AI-controllable CLI for VESC motor controllers. Built with Bun + TypeScript.

## Install

### Linux / macOS (bash/zsh)

```bash
curl -fsSL -o install.mjs https://raw.githubusercontent.com/Can-0f-Tuna/VESC-CLI-/master/install.mjs && node install.mjs && rm install.mjs
```

Or with Bun (faster):

```bash
curl -fsSL -o install.mjs https://raw.githubusercontent.com/Can-0f-Tuna/VESC-CLI-/master/install.mjs && bun install.mjs && rm install.mjs
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/Can-0f-Tuna/VESC-CLI-/master/install.mjs -OutFile install.mjs; node install.mjs; Remove-Item install.mjs
```

This downloads the installer, installs both the `veac` CLI and the VESC agent skill, then cleans up.

## Usage

```bash
# List devices
veac device list-ports

# Connect and control
veac device connect --port /dev/ttyACM0
veac motor get-values
veac motor set-rpm 1000
veac motor stop
```

## Features

- Interactive hardware discovery and configuration
- Motor control (RPM, current, duty cycle)
- CAN bus operations
- LispBM scripting
- Configuration backup/restore
- Comprehensive hardware database (30+ controllers, 50+ motors)

## Documentation

- [SKILL.md](vesc-cli-skill/SKILL.md) - Agent skill guide
- [references/commands.md](vesc-cli-skill/references/commands.md) - Command reference
- [references/workflows.md](vesc-cli-skill/references/workflows.md) - Setup workflows
- [information/controllers/](vesc-cli-skill/information/controllers/) - Controller database
- [information/motors/](vesc-cli-skill/information/motors/) - Motor database
- [information/batteries/](vesc-cli-skill/information/batteries/) - Battery database

## Development

```bash
git clone https://github.com/Can-0f-Tuna/VESC-CLI-.git
cd veac
bun install
bun run build
bun link
```

## License

GPL v3
