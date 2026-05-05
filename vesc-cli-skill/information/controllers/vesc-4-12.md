# VESC 4.12

## Overview

The **VESC 4.12** (Vedder Electronic Speed Controller) is the original open-source motor controller designed by Benjamin Vedder. Released in 2015, it represents the foundational hardware design that started the VESC ecosystem. This is the hardware version 4.12 based on the STM32F4 microcontroller and DRV8302 MOSFET driver.

The VESC 4.12 established the open-source standard for brushless motor control and has been widely cloned and adapted by numerous manufacturers worldwide.

## Specifications

| Parameter | Value |
|-----------|-------|
| Max Voltage | 60V (8V-60V operating range) |
| Max Current (Cont.) | 50A |
| Max Current (Peak) | 240A (brief periods) |
| Power Rating | ~3000W (at 60V) |
| Hardware Version | 4.12 (HW 4.10/4.11/4.12 compatible) |
| PCB Dimensions | 40mm x 60mm |
| Weight | ~80g (without case) |
| Cooling | Passive (optional heatsink/enclosure) |
| Microcontroller | STM32F405 |
| MOSFET Driver | DRV8302 |
| MOSFETs | 6x IRFS7530 |

## Features

### Motor Control
- **BLDC (Brushless DC)** control with sensorless and sensored operation
- **FOC (Field Oriented Control)** with auto-detection of motor parameters (FW 2.3+)
- **DC motor** support
- Sensored or sensorless operation + hybrid mode
- Duty-cycle control, speed control, or current control modes
- Seamless 4-quadrant operation (forward/reverse with acceleration/braking)
- Regenerative braking
- Adaptive PWM frequency for optimal ADC measurements

### Sensor Support
- Hall sensors
- ABI encoder
- Sensorless operation with VSS (Vedder Sensorless Startup)
- Low-speed sensorless startup capability

### Connectivity
- USB (Mini USB) - VESC Tool configuration
- UART (serial communication)
- CAN bus
- I2C (for accessories like nunchuk)
- PPM input (RC servo signal)
- Analog input

### Safety Features
- Adjustable protection against:
  - Low/high input voltage
  - High motor current
  - High input current
  - High regenerative braking current (separate limits)
  - Rapid duty cycle changes (ramping)
  - High RPM (separate limits per direction)
- Temperature-based current limiting
- Soft back-off strategies for current and RPM limits

### Additional Features
- 5V 1A output for external electronics (from DRV8302 buck converter)
- Consumed and regenerated amp-hour and watt-hour counting
- Motor used as tachometer for odometry
- Real-time data logging and plotting

## Use Cases

### Best For
- Electric skateboards (e-skate) - entry to mid-level
- Electric bikes (e-bike) - lower power applications
- Robotics and RC vehicles
- DIY electric vehicles
- Experimental and educational projects

### Recommended Motor Power
- 500W to 2000W continuous
- Peak power up to 3000W (brief periods)

### Recommended Battery
- 3S to 12S LiPo (12S = 50.4V max)
- 10S (42V) recommended for optimal performance
- Minimum 8V input

### ERPM Limitations
- **60,000 ERPM maximum** (hardware limitation)
- ERPM = RPM × Motor Pole Pairs
- Example: 200KV motor at 12S (50V) with 7 pole pairs = 70,000 ERPM (EXCEEDS LIMIT)
- Recommended: 130KV or lower motors for 12S operation

## Known Issues

### Hardware Limitations
1. **Two-shunt design** - Less precise current measurement compared to VESC 6 three-shunt design
2. **60K ERPM limit** - High KV motors at high voltage can exceed this limit
3. **FOC performance** - Works best at low ERPM; high ERPM with high current can cause issues
4. **DRV8302 fault sensitivity** - Can trigger faults under high load or rapid switching

### Common Problems
- **FOC mode issues at high ERPM**: Reduce motor current to 35-40A if experiencing problems
- **Temperature**: Requires proper cooling for continuous high-current operation
- **Voltage spikes**: Must stay below 60V; use appropriate capacitors near battery input

### Workarounds
- Use BLDC mode instead of FOC for high-speed applications
- Keep motor max current at 35-40A for FOC on 4.12 hardware
- Add electrolytic capacitor (2200µF 63V) near battery input
- Ensure proper cooling with heatsink or aluminum enclosure

## Official Resources

- **Product Page**: http://vedder.se/2015/01/vesc-open-source-esc/
- **Hardware GitHub**: https://github.com/vedderb/bldc-hardware
- **Firmware GitHub**: https://github.com/vedderb/bldc
- **VESC Tool**: https://vesc-project.com/vesc_tool
- **Documentation**: https://vesc-project.com/documentation

## Sources

1. Benjamin Vedder's Original Blog Post - http://vedder.se/2015/01/vesc-open-source-esc/
2. VESC Hardware GitHub Repository - https://github.com/vedderb/bldc-hardware
3. VESC Project Hardware Page - https://vesc-project.com/Hardware
4. VESC Project Documentation - https://vesc-project.com/documentation

**Last Updated**: 2025-05-05

**Note**: The VESC 4.12 design is open source under CC BY-SA 4.0 license. Many third-party manufacturers produce VESC 4.12 compatible hardware with varying quality. Only Trampa Boards (historically) and now VESC Labs are authorized to use the VESC trademark.
