# VESC CLI Project

## Overview

A modern, AI-agent-controllable CLI tool for VESC (Vedder Electronic Speed Controller) motor controllers. This project transforms the existing Qt-based GUI VESC Tool into a lightweight, programmatic interface optimized for automation and AI agent integration.

## Project Goal

Create a command-line interface that:
- Provides structured output (JSON/YAML) for programmatic control
- Supports schema introspection for AI agent capability discovery
- Eliminates Qt dependency for CLI operations
- Follows industry best practices for automation-friendly tools
- Maintains single-binary distribution for easy deployment

## Target Users

1. **Human Users** - Engineers and developers configuring VESC motor controllers
2. **AI Agents** - Automated systems controlling motors programmatically
3. **CI/CD Pipelines** - Automated testing and configuration validation

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Language | **TypeScript** | Type-safe, modern JavaScript runtime |
| Runtime | **Bun** | Fast JavaScript runtime with built-in bundler |
| Monorepo | **Turborepo** | Workspace management and build orchestration |
| CLI Framework | **commander** | Argument parsing, subcommands, help generation |
| Serialization | **zod** | Schema validation and type inference |
| Serial Communication | **serialport** | Cross-platform serial port I/O |
| Async Runtime | **Bun native** | Built-in async/await support |
| Output Formatting | **cli-table3** | Human-readable table output |
| Error Handling | **neverthrow** | Functional error handling |
| Build Output | **Bun bundler** | Single executable generation |

## Why Bun?

- **Single executable output** - `bun build --compile` creates standalone binaries
- **~50ms startup time** - Fast command execution for automation
- **Built-in TypeScript** - No transpilation step needed
- **Native npm compatibility** - Access to entire npm ecosystem
- **Cross-platform** - Builds for Windows, macOS, Linux
- **Built-in bundler** - No webpack/rollup configuration needed
- **Faster than Node.js** - Optimized JavaScriptCore engine

## Quick Start

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Run the CLI
./dist/veac --help

# Connect to a VESC
veac device connect --port /dev/ttyACM0

# Get motor telemetry
veac motor get-values --format json
```

## Workspace Structure

This is a Turborepo monorepo with the following structure:

```
veac/
├── apps/
│   └── cli/              # Main CLI application
├── packages/
│   ├── vesc-protocol/    # VESC communication protocol
│   ├── vesc-types/       # Shared TypeScript types
│   └── config-utils/     # Configuration file handling
├── turbo.json            # Turborepo pipeline config
├── package.json          # Workspace root manifest
└── bun.lockb             # Bun lockfile
```

## Project Status

🟡 **Phase: Migration in Progress** → Stage 6-7/10: Testing & Build System

See [state.md](./state.md) for detailed progress tracking.

## Documentation Structure

| Document | Purpose |
|----------|---------|
| [architecture.md](./architecture.md) | System design and VESC protocol details |
| [file-structure.md](./file-structure.md) | Turborepo workspace layout |
| [conventions.md](./conventions.md) | TypeScript coding standards |
| [commands.md](./commands.md) | Build, test, and development commands |
| [dependencies.md](./dependencies.md) | Required npm packages |
| [state.md](./state.md) | Current implementation status |
| [modules/](./modules/) | Module-specific documentation |

## External References

- **VESC Project**: https://vesc-project.com/
- **VESC Firmware**: https://github.com/vedderb/bldc
- **VESC Documentation**: https://vedderb-bldc.mintlify.app/
- **VESC Tool (existing)**: https://github.com/vedderb/vesc_tool
- **Bun Documentation**: https://bun.sh/docs
- **Turborepo**: https://turbo.build/repo

## License

GPL v3 - Following VESC project licensing
