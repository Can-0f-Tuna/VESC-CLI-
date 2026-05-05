# File Structure

## Turborepo Workspace Layout

```
veac/
├── apps/                           # Applications
│   └── cli/                        # Main CLI application
│       ├── package.json            # CLI package manifest
│       ├── tsconfig.json           # TypeScript config
│       ├── src/
│       │   ├── index.ts            # Entry point
│       │   ├── cli.ts              # Commander CLI setup
│       │   ├── commands/           # Command implementations
│       │   │   ├── index.ts        # Command exports
│       │   │   ├── device.ts       # Device commands
│       │   │   ├── motor.ts        # Motor commands
│       │   │   ├── config.ts       # Configuration commands
│       │   │   ├── firmware.ts     # Firmware commands
│       │   │   ├── can.ts          # CAN bus commands
│       │   │   ├── lisp.ts         # LispBM commands
│       │   │   ├── bms.ts          # BMS commands
│       │   │   ├── log.ts          # Data logging commands
│       │   │   └── terminal.ts     # Terminal commands
│       │   ├── output/             # Output formatting
│       │   │   ├── index.ts
│       │   │   ├── json.ts
│       │   │   ├── table.ts
│       │   │   └── yaml.ts
│       │   └── schema.ts           # Schema introspection
│       └── tests/
│           └── integration.test.ts # Integration tests
│
├── packages/                       # Shared packages
│   ├── vesc-protocol/              # VESC communication protocol
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts            # Public exports
│   │       ├── packet.ts           # Packet encoding/decoding
│   │       ├── crc.ts              # CRC16 calculation
│   │       ├── connection.ts       # Serial connection management
│   │       ├── commands.ts         # Command serialization
│   │       └── responses.ts        # Response parsing
│   │
│   ├── vesc-types/                 # Shared TypeScript types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts            # Public exports
│   │       ├── datatypes.ts        # VESC data structures
│   │       ├── config.ts           # Configuration types
│   │       └── commands.ts         # Command type definitions
│   │
│   └── config-utils/               # Configuration file handling
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── xml.ts              # XML serialization
│           ├── backup.ts           # Backup/restore utilities
│           └── validation.ts       # Config validation
│
├── turbo.json                      # Turborepo pipeline config
├── package.json                    # Root workspace manifest
├── bun.lockb                       # Bun lockfile
├── tsconfig.json                   # Root TypeScript config
└── README.md                       # Project documentation
```

## Root Configuration

### package.json (Root)

```json
{
  "name": "veac",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "format": "prettier --write .",
    "clean": "turbo run clean && rm -rf dist node_modules"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "prettier": "^3.1.0",
    "turbo": "^1.11.0",
    "typescript": "^5.3.0"
  }
}
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": ["NODE_ENV"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Package Responsibilities

### `apps/cli/`

Main CLI application implementing the `veac` command:

- **index.ts**: Entry point, process setup
- **cli.ts**: Commander CLI setup with subcommands
- **commands/**: Command category implementations
  - Each file implements one noun category (device, motor, config, etc.)
  - Uses packages from `packages/` for VESC communication
- **output/**: Output formatting (JSON/Table/YAML)
- **schema.ts**: Machine-readable schema generation

### `packages/vesc-protocol/`

Low-level VESC protocol implementation:

- **packet.ts**: Packet framing, encoding, decoding
- **crc.ts**: IBM SDLC CRC16 calculation
- **connection.ts**: Serial port management with serialport
- **commands.ts**: Command serialization to binary
- **responses.ts**: Binary response parsing into typed structures

### `packages/vesc-types/`

Shared TypeScript type definitions:

- **datatypes.ts**: VESC data structures (McValues, etc.)
- **config.ts**: Configuration file type definitions
- **commands.ts**: Command and response type definitions
- Used by both CLI and protocol packages

### `packages/config-utils/`

Configuration file handling utilities:

- **xml.ts**: XML serialization for VESC configuration files
- **backup.ts**: Backup/restore operations
- **validation.ts**: Configuration validation

## Package Manifest Examples

### Package (e.g., packages/vesc-protocol/package.json)

```json
{
  "name": "@veac/vesc-protocol",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "serialport": "^12.0.0",
    "@veac/vesc-types": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

### CLI Package (apps/cli/package.json)

```json
{
  "name": "@veac/cli",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "veac": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc && bun build --compile ./dist/index.js --outfile ../../dist/veac",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "test": "bun test"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "@veac/vesc-protocol": "workspace:*",
    "@veac/vesc-types": "workspace:*",
    "@veac/config-utils": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

## Build Output

After `bun run build`:

```
veac/
├── apps/cli/dist/           # Compiled TypeScript
├── packages/vesc-protocol/dist/
├── packages/vesc-types/dist/
├── packages/config-utils/dist/
└── dist/
    └── veac                 # Compiled executable (Bun --compile output)
```

## Inter-Package Dependencies

```
┌─────────────┐
│ apps/cli    │
└──────┬──────┘
       │
       ├─── packages/vesc-protocol
       │
       ├─── packages/vesc-types
       │
       └─── packages/config-utils
                │
                └─── packages/vesc-types

packages/vesc-protocol depends on:
  - packages/vesc-types

packages/config-utils depends on:
  - packages/vesc-types
```

## Git Ignore

```
# Dependencies
node_modules/

# Build outputs
dist/
*.exe
*.bin

# Bun
bun.lockb

# TypeScript
*.tsbuildinfo

# Logs
*.log

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# VESC files
*.xml
*.bin
*.zip
```

## Future Extensions

Potential future additions:

```
├── apps/
│   └── cli/
│   └── web-ui/             # Future: Web-based UI
├── packages/
│   └── vesc-bluetooth/     # Future: BLE support
├── completions/            # Shell completion scripts
│   ├── veac.bash
│   ├── veac.zsh
│   └── veac.fish
├── man/                    # Man pages
│   └── veac.1
└── packaging/              # Distribution packaging
    ├── debian/
    ├── homebrew/
    └── windows/
```
