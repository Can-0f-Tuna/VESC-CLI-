#!/usr/bin/env python3
"""
Telemetry Logging Script
Logs VESC telemetry to CSV file for analysis
"""

import subprocess
import json
import csv
import time
import sys
from datetime import datetime
from pathlib import Path

def get_telemetry():
    """Get telemetry from VESC"""
    try:
        result = subprocess.run(
            ['veac', 'motor', 'get-values'],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            print(f"Error getting telemetry: {result.stderr}")
            return None
    except Exception as e:
        print(f"Exception: {e}")
        return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python telemetry-log.py <duration_seconds> [output_file]")
        print("Example: python telemetry-log.py 60 motor-log.csv")
        sys.exit(1)
    
    duration = int(sys.argv[1])
    output_file = sys.argv[2] if len(sys.argv) > 2 else f"vesc-telemetry-{datetime.now().strftime('%Y%m%d-%H%M%S')}.csv"
    
    print(f"Logging telemetry for {duration} seconds to {output_file}")
    
    # CSV headers
    headers = [
        'timestamp', 'v_in', 'current_in', 'current_motor', 'rpm',
        'duty_cycle', 'temp_mos', 'temp_motor', 'fault_code'
    ]
    
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        start_time = time.time()
        sample_count = 0
        
        while time.time() - start_time < duration:
            data = get_telemetry()
            
            if data and data.get('ok') and 'result' in data:
                result = data['result']
                
                # Extract values (handle nested structure)
                motor = result.get('motor', {})
                input_data = result.get('input', {})
                temps = result.get('temperatures', {})
                fault = result.get('fault', {})
                
                row = [
                    datetime.now().isoformat(),
                    input_data.get('voltage', 0),
                    input_data.get('current', 0),
                    motor.get('current', 0),
                    motor.get('rpm', 0),
                    motor.get('duty_cycle', 0),
                    temps.get('mosfet', 0),
                    temps.get('motor', 0),
                    fault.get('code', 0)
                ]
                
                writer.writerow(row)
                sample_count += 1
                print(f"Sample {sample_count}: RPM={row[4]}, Current={row[3]:.2f}A, Temp={row[6]:.1f}°C")
            
            # Sample at 5 Hz (200ms interval)
            time.sleep(0.2)
    
    print(f"\nLogged {sample_count} samples to {output_file}")
    print(f"Average sample rate: {sample_count/duration:.1f} Hz")

if __name__ == '__main__':
    main()
