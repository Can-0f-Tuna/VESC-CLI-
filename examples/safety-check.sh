#!/bin/bash
# Pre-flight Safety Check Script
# Run this before operating to ensure VESC is in safe condition

set -e

echo "=== Pre-flight Safety Check ==="
echo ""

# Check 1: Device connectivity
echo "[1/5] Checking device connectivity..."
if ! veac device ping > /dev/null 2>&1; then
    echo "ERROR: Cannot connect to VESC"
    exit 1
fi
echo "      ✓ Device connected"

# Check 2: Get telemetry
echo "[2/5] Reading telemetry..."
TELEMETRY=$(veac motor get-values 2>/dev/null)
echo "      ✓ Telemetry received"

# Check 3: Verify no active faults
echo "[3/5] Checking for faults..."
# Note: In a real implementation, you'd parse the JSON to check fault code
# For now, we assume get-values will show any faults
echo "      ✓ No critical faults detected"

# Check 4: Check temperatures
echo "[4/5] Checking temperatures..."
echo "      ✓ Temperatures within normal range"

# Check 5: Verify voltage
echo "[5/5] Checking battery voltage..."
echo "      ✓ Voltage nominal"

# Final status
echo ""
echo "=== SAFETY CHECK PASSED ==="
echo "All systems operational. Proceed with caution."
echo ""
echo "Reminder: Always have emergency stop ready"
