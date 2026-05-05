#!/bin/bash
# Backup All VESC Configurations
# Creates timestamped backups of both MC and APP configurations

set -e

# Create backup directory
BACKUP_DIR="${1:-vesc-backups}"
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/vesc-backup-$TIMESTAMP.json"

echo "=== VESC Configuration Backup ==="
echo ""

# Check connection
echo "Checking VESC connection..."
veac device ping || { echo "Failed to connect to VESC"; exit 1; }

# Create backup
echo "Creating backup: $BACKUP_FILE"
veac config backup --output "$BACKUP_FILE"

# Verify backup
echo "Verifying backup..."
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "unknown")
    echo "Backup created successfully ($SIZE bytes)"
else
    echo "ERROR: Backup file not created"
    exit 1
fi

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR"/*.json 2>/dev/null | tail -5 || echo "  (none found)"

echo ""
echo "=== Backup Complete ==="
echo "To restore, use: veac config restore $BACKUP_FILE"
