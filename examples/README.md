# VESC CLI Examples

This directory contains example scripts demonstrating common VESC CLI workflows.

## Available Scripts

### Bash Scripts

#### `motor-tune.sh`
Complete motor tuning workflow demonstrating:
- Connection verification
- Telemetry reading
- Low-current testing
- RPM testing at multiple speeds
- Safe shutdown

```bash
./examples/motor-tune.sh
```

#### `safety-check.sh`
Pre-flight safety check that verifies:
- Device connectivity
- No active faults
- Temperatures within range
- Battery voltage nominal

```bash
./examples/safety-check.sh
```

#### `backup-configs.sh`
Automated configuration backup script:
- Creates timestamped backups
- Stores in organized directory structure
- Verifies backup integrity
- Lists recent backups

```bash
./examples/backup-configs.sh [backup-directory]
```

### Python Scripts

#### `telemetry-log.py`
Logs telemetry data to CSV for analysis:
- Continuous data logging
- Configurable duration
- CSV output for spreadsheet analysis
- 5 Hz sampling rate

```bash
python3 examples/telemetry-log.py 60 output.csv
```

## Using Examples

1. Make bash scripts executable:
   ```bash
   chmod +x examples/*.sh
   ```

2. Install Python dependencies (for Python scripts):
   ```bash
   # No external dependencies required
   # Uses only standard library
   ```

3. Run examples:
   ```bash
   # From project root
   ./examples/motor-tune.sh
   
   # Or with explicit path
   bash examples/motor-tune.sh
   ```

## Creating Your Own Scripts

Use these examples as templates for your own workflows. Key patterns:

### Error Handling
```bash
set -e  # Exit on error
command || { echo "Error message"; exit 1; }
```

### JSON Parsing
```bash
# Get specific value from JSON
VALUE=$(veac motor get-values | jq -r '.result.motor.rpm')
```

### Dry Run Testing
```bash
# Test without executing
veac motor set-rpm 1000 --dry-run
```

### Connection Check
```bash
# Always verify connection first
veac device ping || exit 1
```

## Safety Notes

- Always run `safety-check.sh` before operating
- Use `--dry-run` flag when testing new scripts
- Keep emergency stop ready when running motor commands
- Monitor temperatures during extended operations

## Contributing

Have a useful script? Consider contributing it to the examples directory!
