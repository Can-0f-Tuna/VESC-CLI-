# Dependencies

## Core Dependencies

### CLI Framework

```json
{
  "dependencies": {
    "commander": "^11.1.0"
  }
}
```

**Purpose**: Command-line argument parsing, subcommand handling, automatic help generation, shell completion support.

**Why commander**: Battle-tested, widely used, excellent TypeScript support, straightforward API.

### Type Safety and Validation

```json
{
  "dependencies": {
    "zod": "^3.22.0",
    "@types/node": "^20.10.0"
  }
}
```

**Purpose**: Runtime schema validation, type inference from schemas, input validation.

**Why zod**: TypeScript-first, excellent error messages, composable schemas.

### Serial Communication

```json
{
  "dependencies": {
    "serialport": "^12.0.0"
  }
}
```

**Purpose**: Cross-platform serial port I/O for USB CDC/UART communication with VESC.

**Why serialport**: Industry standard for Node.js/Bun serial communication, cross-platform support, active maintenance.

### Output Formatting

```json
{
  "dependencies": {
    "cli-table3": "^0.6.3",
    "chalk": "^5.3.0"
  }
}
```

**Purpose**: Human-friendly table output, colored terminal output.

**Why cli-table3**: Simple API, good column sizing, works in both Node.js and Bun.
**Why chalk**: Standard for terminal colors, widely adopted.

### Error Handling

```json
{
  "dependencies": {
    "neverthrow": "^6.1.0"
  }
}
```

**Purpose**: Functional error handling with Result types.

**Why neverthrow**: Type-safe error handling without exceptions, Rust-like Result type in TypeScript.

### YAML Support

```json
{
  "dependencies": {
    "js-yaml": "^4.1.0",
    "@types/js-yaml": "^4.0.9"
  }
}
```

**Purpose**: YAML output formatting, YAML config file parsing.

### XML Parsing

```json
{
  "dependencies": {
    "fast-xml-parser": "^4.3.0"
  }
}
```

**Purpose**: Reading/writing VESC configuration XML files.

**Why fast-xml-parser**: Fast, lightweight, supports both parsing and building XML.

## Development Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/bun": "^1.0.0",
    "prettier": "^3.1.0",
    "turbo": "^1.11.0"
  }
}
```

| Package | Purpose |
|---------|---------|
| `typescript` | Type checking and compilation |
| `@types/bun` | Bun-specific type definitions |
| `prettier` | Code formatting |
| `turbo` | Workspace build orchestration |

## Workspace Package References

### Internal Dependencies

Packages use `workspace:*` protocol for internal dependencies:

```json
{
  "dependencies": {
    "@veac/vesc-types": "workspace:*",
    "@veac/vesc-protocol": "workspace:*",
    "@veac/config-utils": "workspace:*"
  }
}
```

This ensures:
- Automatic version synchronization
- Local development with live changes
- Monorepo-aware dependency resolution

## Complete package.json Example

### apps/cli/package.json

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
    "test": "bun test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "zod": "^3.22.0",
    "cli-table3": "^0.6.3",
    "chalk": "^5.3.0",
    "js-yaml": "^4.1.0",
    "neverthrow": "^6.1.0",
    "@veac/vesc-protocol": "workspace:*",
    "@veac/vesc-types": "workspace:*",
    "@veac/config-utils": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/js-yaml": "^4.0.9",
    "typescript": "^5.3.0"
  }
}
```

### packages/vesc-protocol/package.json

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
    "neverthrow": "^6.1.0",
    "@veac/vesc-types": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

### packages/vesc-types/package.json

```json
{
  "name": "@veac/vesc-types",
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
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

### packages/config-utils/package.json

```json
{
  "name": "@veac/config-utils",
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
    "fast-xml-parser": "^4.3.0",
    "zod": "^3.22.0",
    "@veac/vesc-types": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

## Version Constraints

| Package | Min Version | Notes |
|---------|-------------|-------|
| commander | 11.1.0 | ESM support stable |
| zod | 3.22.0 | Type inference stable |
| serialport | 12.0.0 | Latest stable API |
| bun | 1.0.0 | Required for --compile |
| turbo | 1.11.0 | Workspace protocol support |
| typescript | 5.3.0 | Satisfies all packages |

## Bun-Specific Dependencies

### Native Modules

Some packages may require native bindings. Bun handles these differently:

```json
{
  "trustedDependencies": [
    "serialport",
    "@serialport/bindings"
  ]
}
```

Add to root `package.json` to allow native module compilation.

## Security Considerations

All dependencies are:
- **Widely used**: Popular packages with large user bases
- **Actively maintained**: Recent releases within last 6 months
- **Audited**: Available on npm with security advisories tracked

Run security audits:

```bash
# Check for vulnerabilities
bun audit

# Update dependencies
bun update
```

## Optional Dependencies (Future)

```json
{
  "optionalDependencies": {
    "noble": "^1.9.0"
  }
}
```

Future optional features:
- **Bluetooth support**: BLE communication with VESC
- **WebSocket**: TCP hub connectivity
- **Progress bars**: indicatif equivalent for long operations
