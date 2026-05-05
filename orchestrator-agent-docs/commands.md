# Commands

## Development Commands

### Build Commands

```bash
# Debug build (fast compilation, unoptimized)
cargo build

# Release build (optimized, for distribution)
cargo build --release

# Build with specific features
cargo build --features "usb-support"

# Check compilation without building
cargo check

# Clean build artifacts
cargo clean
```

### Run Commands

```bash
# Run the CLI
cargo run -- --help

# Run with arguments
cargo run -- device list-ports
cargo run -- --port /dev/ttyACM0 device info

# Run release version
cargo run --release -- motor get-values
```

### Test Commands

```bash
# Run all tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_packet_encode

# Run integration tests only
cargo test --test integration_test

# Run tests in release mode
cargo test --release

# Run with coverage (requires cargo-tarpaulin)
cargo tarpaulin --out Html

# Run benchmarks (if defined)
cargo bench
```

### Linting and Formatting

```bash
# Format code
cargo fmt

# Check formatting without modifying
cargo fmt -- --check

# Run clippy lints
cargo clippy

# Run clippy with all features
cargo clippy --all-features -- -D warnings

# Fix auto-fixable clippy warnings
cargo clippy --fix
```

### Documentation

```bash
# Generate and open documentation
cargo doc --open

# Generate docs for all features
cargo doc --all-features

# Generate docs including private items
cargo doc --document-private-items
```

### Dependency Management

```bash
# Update dependencies
cargo update

# Check for outdated dependencies (requires cargo-outdated)
cargo outdated

# Audit for security vulnerabilities (requires cargo-audit)
cargo audit

# Check for unused dependencies (requires cargo-udeps)
cargo udeps
```

### Release and Distribution

```bash
# Build for release
cargo build --release

# Install locally
cargo install --path .

# Create distribution package
cargo package --allow-dirty

# Publish to crates.io
cargo publish

# Cross-compile (requires cross)
cross build --target x86_64-pc-windows-gnu
cross build --target aarch64-unknown-linux-gnu
```

## CLI Usage Commands (Once Built)

### Device Operations

```bash
# List available serial ports
vesc-cli device list-ports
vesc-cli device list-ports --format json

# Connect to VESC
vesc-cli device connect --port /dev/ttyACM0
vesc-cli device connect --port COM3 --baud 115200

# Get device information
vesc-cli device info
vesc-cli device info --format json

# Ping device
vesc-cli device ping

# Monitor device telemetry
vesc-cli device monitor --fields rpm,current,voltage --duration 30
```

### Motor Control

```bash
# Get motor telemetry
vesc-cli motor get-values
vesc-cli motor get-values --format json

# Set motor RPM
vesc-cli motor set-rpm 5000
vesc-cli motor set-rpm 5000 --duration 10

# Set motor current
vesc-cli motor set-current 10.5
vesc-cli motor set-current 10.5 --duration 5

# Set duty cycle
vesc-cli motor set-duty 0.5

# Stop motor
vesc-cli motor stop

# Run motor detection
vesc-cli motor detect --current 5.0
vesc-cli motor detect --current 5.0 --min-rpm 100 --low-duty 0.1

# Stream motor data
vesc-cli motor stream --fields rpm,current,voltage --rate 10hz --duration 60
```

### Configuration Management

```bash
# Read motor configuration
vesc-cli config get-mc
vesc-cli config get-mc --output mcconf.xml

# Write motor configuration
vesc-cli config set-mc --input mcconf.xml
vesc-cli config set-mc --input mcconf.xml --dry-run

# Read application configuration
vesc-cli config get-app
vesc-cli config get-app --output appconf.xml

# Write application configuration
vesc-cli config set-app --input appconf.xml

# Backup all configurations
vesc-cli config backup --output backup.zip

# Restore from backup
vesc-cli config restore --input backup.zip
vesc-cli config restore --input backup.zip --dry-run
```

### Firmware Operations

```bash
# Get firmware information
vesc-cli firmware info
vesc-cli firmware info --format json

# Update firmware
vesc-cli firmware update --file firmware.bin
vesc-cli firmware update --file firmware.bin --dry-run

# Backup current firmware
vesc-cli firmware backup --output firmware-backup.bin
```

### CAN Bus Operations

```bash
# Ping all CAN devices
vesc-cli can ping
vesc-cli can ping --timeout 2000

# List discovered CAN devices
vesc-cli can list
vesc-cli can list --format json

# Get status of specific CAN device
vesc-cli can status 1

# Forward command via CAN
vesc-cli can forward 1 motor get-values
```

### LispBM Operations

```bash
# Upload Lisp script
vesc-cli lisp upload --file script.lisp
vesc-cli lisp upload --file script.lisp --reduce

# Erase Lisp
vesc-cli lisp erase
vesc-cli lisp erase --force

# Get Lisp status
vesc-cli lisp status
vesc-cli lisp status --format json

# Interactive Lisp REPL
vesc-cli lisp repl
```

### Schema Introspection (AI Agent Support)

```bash
# Get full command schema
vesc-cli schema
vesc-cli schema --format yaml

# Get schema for specific command
vesc-cli schema motor set-rpm
vesc-cli schema device info --format json
```

### Global Options

```bash
# Specify port and format
vesc-cli --port /dev/ttyACM0 --format json motor get-values

# Use with CAN forwarding
vesc-cli --port /dev/ttyACM0 --can-id 1 motor get-values

# Dry run (preview changes)
vesc-cli --dry-run config set-mc --input mcconf.xml

# Skip confirmations
vesc-cli --yes lisp erase

# Verbose output
vesc-cli --verbose device connect

# Custom timeout
vesc-cli --timeout 10000 motor detect
```

## Development Workflow

### Daily Development

```bash
# 1. Check code compiles
cargo check

# 2. Run tests
cargo test

# 3. Format code
cargo fmt

# 4. Run lints
cargo clippy

# 5. Build release
cargo build --release

# 6. Test CLI
./target/release/vesc-cli --help
```

### Before Committing

```bash
# Full verification script
#!/bin/bash
cargo fmt -- --check
cargo clippy -- -D warnings
cargo test
cargo doc
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
      - uses: actions/checkout@v3
      
      - name: Install Rust
        uses: dtolnay/rust-action@stable
      
      - name: Check formatting
        run: cargo fmt -- --check
      
      - name: Run clippy
        run: cargo clippy -- -D warnings
      
      - name: Run tests
        run: cargo test
      
      - name: Build release
        run: cargo build --release
```
