# Commands

## Development Commands

### Build Commands

```bash
# Build all packages (uses Turbo for parallel builds)
bun run build

# Build specific package
cd apps/cli && bun run build
cd packages/vesc-protocol && bun run build

# Build release executable
bun run build
# Output: dist/veac (single executable)

# Clean build artifacts
bun run clean
cd apps/cli && bun run clean
```

### Run Commands

```bash
# Run CLI in development mode
bun run dev

# Run CLI directly
bun run --filter=@veac/cli dev

# Run specific command
bun ./apps/cli/src/index.ts device list-ports
bun ./apps/cli/src/index.ts --port /dev/ttyACM0 device info

# Run compiled version
./dist/veac --help
./dist/veac motor get-values
```

### Test Commands

```bash
# Run all tests
bun test

# Run tests with output
bun test --verbose

# Run tests for specific package
cd apps/cli && bun test
cd packages/vesc-protocol && bun test

# Run tests in specific file
bun test apps/cli/tests/integration.test.ts

# Run tests with watch mode
bun test --watch
```

### Linting and Formatting

```bash
# Format code with Prettier
bun run format

# Check formatting
bun run format --check

# Type check all packages
bun run typecheck

# Type check specific package
cd apps/cli && bun run typecheck
```

### Dependency Management

```bash
# Install dependencies
bun install

# Update dependencies
bun update

# Add dependency to specific package
cd apps/cli && bun add commander
cd packages/vesc-protocol && bun add neverthrow

# Add dev dependency
cd apps/cli && bun add -d @types/node

# Remove dependency
cd apps/cli && bun remove some-package

# Audit for security vulnerabilities
bun audit
```

### Turborepo Commands

```bash
# Run command across all packages
turbo run build
turbo run test
turbo run typecheck

# Run with dependencies
turbo run build --filter=@veac/cli...

# Run without cache
turbo run build --force

# View pipeline
turbo run build --dry
```

## CLI Usage Commands (Once Built)

### Device Operations

```bash
# List available serial ports
veac device list-ports
veac device list-ports --format json

# Connect to VESC
veac device connect --port /dev/ttyACM0
veac device connect --port COM3 --baud 115200

# Get device information
veac device info
veac device info --format json

# Ping device
veac device ping

# Monitor device telemetry
veac device monitor --fields rpm,current,voltage --duration 30
```

### Motor Control

```bash
# Get motor telemetry
veac motor get-values
veac motor get-values --format json

# Set motor RPM
veac motor set-rpm 5000
veac motor set-rpm 5000 --duration 10

# Set motor current
veac motor set-current 10.5
veac motor set-current 10.5 --duration 5

# Set duty cycle
veac motor set-duty 0.5

# Stop motor
veac motor stop

# Run motor detection
veac motor detect --current 5.0
veac motor detect --current 5.0 --min-rpm 100 --low-duty 0.1

# Stream motor data
veac motor stream --fields rpm,current,voltage --rate 10hz --duration 60
```

### Configuration Management

```bash
# Read motor configuration
veac config get-mc
veac config get-mc --output mcconf.xml

# Write motor configuration
veac config set-mc --input mcconf.xml
veac config set-mc --input mcconf.xml --dry-run

# Read application configuration
veac config get-app
veac config get-app --output appconf.xml

# Write application configuration
veac config set-app --input appconf.xml

# Backup all configurations
veac config backup --output backup.zip

# Restore from backup
veac config restore --input backup.zip
veac config restore --input backup.zip --dry-run
```

### Firmware Operations

```bash
# Get firmware information
veac firmware info
veac firmware info --format json

# Update firmware
veac firmware update --file firmware.bin
veac firmware update --file firmware.bin --dry-run

# Backup current firmware
veac firmware backup --output firmware-backup.bin
```

### CAN Bus Operations

```bash
# Ping all CAN devices
veac can ping
veac can ping --timeout 2000

# List discovered CAN devices
veac can list
veac can list --format json

# Get status of specific CAN device
veac can status 1

# Forward command via CAN
veac can forward 1 motor get-values
```

### LispBM Operations

```bash
# Upload Lisp script
veac lisp upload --file script.lisp
veac lisp upload --file script.lisp --reduce

# Erase Lisp
veac lisp erase
veac lisp erase --force

# Get Lisp status
veac lisp status
veac lisp status --format json

# Interactive Lisp REPL
veac lisp repl
```

### Schema Introspection (AI Agent Support)

```bash
# Get full command schema
veac schema
veac schema --format yaml

# Get schema for specific command
veac schema motor set-rpm
veac schema device info --format json
```

### Global Options

```bash
# Specify port and format
veac --port /dev/ttyACM0 --format json motor get-values

# Use with CAN forwarding
veac --port /dev/ttyACM0 --can-id 1 motor get-values

# Dry run (preview changes)
veac --dry-run config set-mc --input mcconf.xml

# Skip confirmations
veac --yes lisp erase

# Verbose output
veac --verbose device connect

# Custom timeout
veac --timeout 10000 motor detect
```

## Development Workflow

### Daily Development

```bash
# 1. Check code compiles
cd apps/cli && bun run typecheck

# 2. Run tests
bun test

# 3. Format code
bun run format

# 4. Build release
bun run build

# 5. Test CLI
./dist/veac --help
```

### Before Committing

```bash
# Full verification script
#!/bin/bash
bun run format --check
bun run typecheck
bun test
bun run build
```

## CI/CD Integration

### Example GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Check formatting
        run: bun run format --check
      
      - name: Type check
        run: bun run typecheck
      
      - name: Run tests
        run: bun test
      
      - name: Build release
        run: bun run build
      
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: veac
          path: dist/veac
```

## Cross-Platform Builds

Bun's `--compile` supports multiple targets:

```bash
# Build for current platform
bun build --compile ./apps/cli/dist/index.js --outfile dist/veac

# Build for specific target (when available)
bun build --compile --target=bun-windows-x64 ./apps/cli/dist/index.js --outfile dist/veac.exe
bun build --compile --target=bun-darwin-x64 ./apps/cli/dist/index.js --outfile dist/veac-darwin
bun build --compile --target=bun-linux-x64 ./apps/cli/dist/index.js --outfile dist/veac-linux
```

Note: Bun's cross-compilation support is evolving. Check latest documentation.
