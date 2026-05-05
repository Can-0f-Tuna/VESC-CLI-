# VESC HD60 / HD75

## Overview

The **VESC HD60** and **HD75** are high-power variants of the VESC 6 platform, designed for demanding applications that require extreme current handling and robust thermal management. These controllers represent some of the most powerful options in the standard VESC 6 form factor.

Built with premium components and featuring enhanced thermal design, the HD series is specifically engineered for high-performance electric vehicles, hydrofoils, combat robots, and industrial machinery that demands sustained high-current operation.

## Specifications

### VESC HD60

| Parameter | Value |
|-----------|-------|
| Max Voltage | 60V (safe for 3S-12S LiPo) |
| Max Current (Cont.) | 100A+ (duty-dependent) |
| Max Current (Peak) | 200A+ |
| Power Rating | ~6000W |
| Dimensions | Similar to VESC 6 MKVI |
| Weight | ~200g+ (with enhanced heatsink) |
| Cooling | Enhanced CNC aluminum heatsink |
| Hardware Base | VESC 6 with upgraded power stage |

### VESC HD75

| Parameter | Value |
|-----------|-------|
| Max Voltage | 75V (safe for 3S-16S LiPo) |
| Max Current (Cont.) | 100A+ (duty-dependent) |
| Max Current (Peak) | 200A+ |
| Power Rating | ~7500W |
| Dimensions | Similar to VESC 6 |
| Weight | ~200g+ (with enhanced heatsink) |
| Cooling | Enhanced CNC aluminum heatsink |
| Hardware Base | VESC 6 with 75V-rated components |

## Features

### Power Stage
- **Enhanced MOSFET configuration** for higher current handling
- **Upgraded gate drivers** for improved switching performance
- **Three-phase shunts** with high-precision current measurement
- **Adjustable current and voltage filters** for optimized motor control
- **Higher current capacity** than standard VESC 6 MKVI

### Motor Control
- **DC, BLDC, FOC (sinusoidal)** operation modes
- Sensored or sensorless operation + hybrid mode
- HFI (High-Frequency Injection) including Silent HFI
- VSS (Vedder Sensorless Startup)
- Sensorless position control capable
- Field weakening support for increased top speed

### Sensor Support
- Hall sensors
- ABI encoder
- AS5047/AS5X47U encoder
- SIN/COS encoder
- Multiple precision encoder options

### IMU (Inertial Measurement Unit)
- **9-axis IMU** built-in (accelerometer + gyroscope)
- Balancing application support
- Orientation sensing
- Motion profiling

### Connectivity
- USB (Micro USB)
- 2x UART ports
- CAN bus with UAVCAN support
- SPI and I2C
- PWM in/out
- SWD port
- NRF port for Bluetooth

### Power Management
- Hibernation mode with wake-up capability
- Automatic power-off feature
- 5V and 12V outputs for external electronics
- Multiple power-on options (button, CAN, roll-to-start)

### Advanced Features
- Traction control
- Throttle curves and ramping
- Real-time data logging
- Full scripting support (QML and LISP)
- Mobile app compatibility

## Use Cases

### Best For
- **Electric hydrofoils** (e-foils) - sustained high current for water sports
- **Combat robots** - high burst current for weapon systems
- **High-performance electric skateboards** - extreme acceleration
- **Electric bikes** - steep hill climbing and high torque
- **Electric boats** - marine applications
- **Industrial machinery** - sustained high-power operation
- **Electric motorcycles** - high-power two-wheelers
- **Racing applications** - competitive e-skate and e-bike

### Recommended Motor Power
- **HD60**: 2000W to 6000W
- **HD75**: 2000W to 7500W (16S capable)

### Recommended Battery
- **HD60**: 10S to 12S LiPo (high discharge capability)
- **HD75**: 12S to 16S LiPo (high discharge capability)
- Minimum 100A continuous battery discharge recommended

### ERPM Capabilities
- **150,000 ERPM maximum**
- Suitable for high-speed motors
- Optimized for high-current FOC operation

## Key Differences from Standard VESC 6

1. **Higher current capability** - Sustained high-amperage operation
2. **Enhanced thermal design** - Better heatsinking for continuous duty
3. **Upgraded components** - Higher-rated MOSFETs and drivers
4. **HD75 variant** - 75V rating for 16S battery operation
5. **Combat-rated** - Designed for shock and vibration resistance

## Thermal Management

### Critical Considerations
The HD series requires proper thermal management:
- **CNC aluminum heatsink housing** included
- **Additional cooling** may be needed for continuous high-current operation
- **Air circulation** important for sustained performance
- **Water cooling** possible with appropriate enclosure modifications

### Temperature Monitoring
- Built-in MOSFET temperature sensing
- Configurable thermal cutback
- Real-time temperature monitoring via VESC Tool

## Known Issues and Considerations

### Power Requirements
- Requires high-discharge battery capable of supporting continuous current
- Battery must match controller capability
- Voltage spikes must not exceed rated maximum (60V/75V)

### Installation
- Robust mounting required for high-vibration environments (combat robots)
- Proper heatsinking essential
- Adequate air circulation needed

### Cost
- Premium pricing compared to standard VESC 6
- High-performance components justify cost
- Targeted at professional/demanding applications

## Compatibility

### Works With
- All standard VESC software features
- VESC Express for wireless connectivity
- VESC Tool configuration
- All standard input methods (PPM, UART, CAN)
- Standard motor sensors and encoders

### Not Compatible With
- No known incompatibilities
- Standard VESC 6 accessories work

## Official Resources

- **VESC Project**: https://vesc-project.com/
- **VESC Tool**: https://vesc-project.com/vesc_tool
- **VESC Labs**: https://www.vesclabs.com/
- **Documentation**: https://vesc-project.com/documentation

## Notes

The HD60/HD75 are specialized variants that may have limited availability compared to standard VESC 6 models. They are typically:
- Produced in smaller quantities
- Targeted at professional/commercial applications
- Available through specialized distributors

For most applications, the **VESC 6 MKVI HP** or **VESC 75/300** may offer better availability and similar performance characteristics.

## Sources

1. VESC Project Hardware Documentation - https://vesc-project.com/Hardware
2. VESC 6 Schematics and Specifications - VESC Project
3. VESC Labs Product Information - https://www.vesclabs.com/
4. Community Forums and User Reports - https://vesc-project.com/forum
5. Benjamin Vedder Hardware GitHub - https://github.com/vedderb/bldc-hardware

**Last Updated**: 2025-05-05

**Important**: Specifications may vary slightly between production batches. Always verify current specifications with the manufacturer before purchase. The HD series is designed for experienced users with demanding applications.
