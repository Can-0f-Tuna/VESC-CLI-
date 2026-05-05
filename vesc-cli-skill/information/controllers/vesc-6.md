# VESC 6

## Overview

The **VESC 6** is the second-generation hardware design by Benjamin Vedder, representing a significant upgrade over the original VESC 4.12. First released in 2017, the VESC 6 features a complete redesign with a three-shunt current measurement system, improved thermal management, and significantly higher current capabilities.

The VESC 6 is considered the "gold standard" for VESC-based controllers and is used in high-performance electric vehicles, industrial applications, and robotics worldwide. It is only officially manufactured by VESC Labs (previously Trampa Boards).

Multiple hardware revisions exist:
- **VESC 6 MKIII** (2018)
- **VESC 6 MKIV** (2019)
- **VESC 6 MKV** (2020)
- **VESC 6 MKVI** (2022)
- **VESC 6 MKVI HP** (High Power variant)

## Specifications

### VESC 6 MKVI (Standard)

| Parameter | Value |
|-----------|-------|
| Max Voltage | 60V (11.1V – 60V) |
| Max Current (Cont.) | 80A |
| Max Current (Peak) | 150A (160A burst) |
| Power Rating | ~4800W |
| Dimensions | 75mm x 70mm x 18mm |
| Weight | ~180g (with CNC aluminum case) |
| Cooling | CNC Aluminum heatsink housing |
| Battery Support | 3S to 12S LiPo/LiIon |

### VESC 6 MKVI HP (High Power)

| Parameter | Value |
|-----------|-------|
| Max Voltage | 60V (11.1V – 60V) |
| Max Current (Cont.) | 100A |
| Max Current (Peak) | 200A (spikes to 210A) |
| Power Rating | ~6000W |
| Dimensions | 75mm x 70mm x 18mm |
| Weight | ~180g (with CNC aluminum case) |
| Cooling | CNC Aluminum heatsink housing |

### VESC 6/75 (16S Capable Variant)

| Parameter | Value |
|-----------|-------|
| Max Voltage | 75V (14V – 63V, safe for 16S) |
| Max Current (Cont.) | 60A |
| Max Current (Peak) | 120A |
| Power Rating | ~4500W |
| Dimensions | 75mm x 70mm x 18mm |
| Battery Support | 3S to 16S LiPo/LiIon |

## Features

### Motor Control
- **DC, BLDC, FOC (sinusoidal)** operation modes
- **Three-phase shunts** for precise current measurement on all motor phases
- **Adjustable current and voltage filters** for optimal motor detection
- Sensored or sensorless operation + hybrid mode
- HFI (High-Frequency Injection) and Silent HFI support
- VSS (Vedder Sensorless Startup)
- Sensorless position control capable
- Configurable RPM, current, voltage, and power limits

### Sensor Support
- Hall sensors
- ABI encoder
- AS5047/AS5X47U encoder
- SIN/COS encoder
- TS5700N8501 encoder (single and multiturn)
- MT6816 encoder
- BISSC encoder
- TLE5102 encoder
- Custom encoder support

### IMU (Inertial Measurement Unit)
- **9-axis IMU** (accelerometer + gyroscope)
- ±2/±4/±8/±16 g full scale accelerometer
- Used for balancing applications and orientation sensing

### Connectivity
- USB (Micro USB)
- 2x UART ports
- CAN bus with UAVCAN support
- SPI and I2C
- PWM in/out
- SWD port for debugging
- PPM input
- NRF port (for Bluetooth module)

### Power Management
- **Hibernation mode** - Wake up via power switch (momentary NC)
- **Automatic hibernation** with adjustable timer
- Consumes just **20µA when hibernating** (less than battery self-discharge)
- 5V 1A output for external electronics
- 3.3V 0.5A output for external electronics
- Automatic power-off feature (no loop key needed)
- Roll-to-start capability (can be disabled)

### Advanced Features
- **Traction control** (single and twin setup)
- Throttle curves and ramping for all input sources
- Separate acceleration and brake throttle curves
- Motor revolution, amp-hour, watt-hour counting
- Real-time data analysis via communication ports
- Full scripting support (QML and LISP)
- Mobile app support (Android/iOS)
- User-specific profiles for different setups

### Input Sources
- PPM signal (RC servo)
- Analog input
- NRF Nyko Kama Nunchuck
- UART commands
- CAN commands

### Protection Features
- Low/high input voltage protection
- High motor current protection
- High input current protection
- High regenerative braking current protection (separate limits)
- High RPM protection (separate limits per direction)
- Over-temperature protection (MOSFET and motor)
- Adjustable soft back-off strategies

## Use Cases

### Best For
- **Electric skateboards** (e-skate) - high performance
- **Electric mountainboards** (e-MTB)
- **Electric bikes** (e-bike) - mid to high power
- **Electric hydrofoils** (e-foil)
- **Electric boats** (e-boat)
- **Robotics** and autonomous vehicles
- **Industrial applications**
- **DIY one-wheels and unicycles**

### Recommended Motor Power
- **MKVI**: 1000W to 4000W
- **MKVI HP**: 2000W to 6000W
- **6/75**: 1000W to 4000W (16S capable)

### Recommended Battery
- **MKVI/MKVI HP**: 3S to 12S LiPo (10S/12S typical)
- **6/75**: 3S to 16S LiPo (12S/16S typical)

### ERPM Capabilities
- **150,000 ERPM maximum** (motor/system dependent)
- Significantly better high-ERPM performance than VESC 4.12
- Three-shunt design provides smoother operation at all speeds

## Key Improvements Over VESC 4.12

1. **Three-shunt design** - Precise current measurement on all three phases vs. two-shunt calculation
2. **Higher current capacity** - Up to 100A+ continuous vs. 50A
3. **Higher ERPM support** - 150K ERPM vs. 60K ERPM
4. **Better FOC performance** - Smoother, quieter operation
5. **IMU integration** - Built-in accelerometer and gyroscope
6. **Hibernation mode** - Ultra-low power standby
7. **Three individual gate drivers** - Better control and reliability
8. **Full phase filters** - Better motor detection
9. **More connectivity** - Dual UART, expanded encoder support

## Known Issues

### VESC 6 MKVI-Specific
- Higher cost compared to VESC 4.12 clones
- Limited to 60V (12S) on standard MKVI (use 6/75 or MKVI HP for higher power)

### General Considerations
- Thermal management required for continuous high-current operation
- Aluminum case required for proper heat dissipation
- High-power applications may need additional cooling

## Official Resources

- **VESC Labs**: https://www.vesclabs.com/
- **Product Comparison**: https://www.vesclabs.com/motor-controller-comparison/
- **VESC Project**: https://vesc-project.com/
- **VESC Tool**: https://vesc-project.com/vesc_tool
- **Hardware Schematics**:
  - VESC 6 MKIII: https://vesc-project.com/sites/default/files/Benjamin%20Posts/VESC_6.pdf
  - VESC 6 MKV: https://vesc-project.com/sites/default/files/Benjamin%20Posts/VESC_6_mk5.pdf
  - VESC 6 Plus: https://vesc-project.com/sites/default/files/Benjamin%20Posts/VESC_6_plus.pdf
- **Firmware GitHub**: https://github.com/vedderb/bldc

## Historical Note

As of 2025, VESC Labs (founded by Benjamin Vedder and key VESC project members) is now the official manufacturer of VESC hardware. Previously, Trampa Boards was the exclusive manufacturer. Both brands maintain the same high quality and full compatibility with VESC software.

## Sources

1. VESC Labs Motor Controller Comparison - https://www.vesclabs.com/motor-controller-comparison/
2. VESC Project Hardware Page - https://vesc-project.com/Hardware
3. VESC 6 Schematics (MKIII, MKV, Plus) - VESC Project
4. Trampa Boards VESC 6 Product Pages - https://trampa.co.uk/
5. Benjamin Vedder GitHub - https://github.com/vedderb/bldc

**Last Updated**: 2025-05-05

**Trademark Notice**: "VESC" is a registered trademark of Benjamin Vedder. Only VESC Labs and legacy Trampa devices are authorized to use the VESC trademark.
