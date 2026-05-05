#!/bin/bash
# Motor Tuning Workflow Example
# This script demonstrates a complete motor tuning workflow

set -e

echo "=== VESC Motor Tuning Workflow ==="
echo ""

# Step 1: Check connection
echo "Step 1: Checking device connection..."
veac device ping || { echo "Failed to connect to VESC"; exit 1; }

# Step 2: Get initial telemetry
echo "Step 2: Getting initial telemetry..."
veac motor get-values

# Step 3: Configure for low-current testing
echo "Step 3: Setting low current (2A) for testing..."
veac motor set-current 2.0 --duration 3

# Step 4: Test at different RPMs
echo "Step 4: Testing at different RPMs..."

for rpm in 500 1000 2000 3000; do
    echo "  Testing at $rpm RPM..."
    veac motor set-rpm $rpm --duration 2
done

# Step 5: Stop motor
echo "Step 5: Stopping motor..."
veac motor stop

# Step 6: Verify final state
echo "Step 6: Verifying final state..."
veac motor get-values

echo ""
echo "=== Motor Tuning Complete ==="
