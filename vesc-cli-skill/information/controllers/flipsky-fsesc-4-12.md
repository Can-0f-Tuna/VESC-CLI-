# Flipsky FSESC 4.12

## Overview

The **Flipsky FSESC 4.12** is a popular, affordable VESC-compatible motor controller manufactured by Flipsky (China). It is based on Benjamin Vedder's open-source VESC 4.12 hardware design and is fully compatible with VESC Tool software.

Known for offering reliable performance at a budget-friendly price point, the FSESC 4.12 has become one of the most widely used VESC clones in the DIY electric skateboard and robotics communities. It represents an excellent entry point for users wanting VESC functionality without the premium cost of official hardware.

Despite being manufactured in China, it maintains backward compatibility with the open-source VESC software, unlike many competitors who have moved to proprietary stacks.

## Specifications

| Parameter | Value |
|-----------|-------|
| Hardware Version | V4.12 |
| Firmware | V3.40 - 5.2 (upgradeable) |
| Max Voltage | 60V (8V-60V operating range) |
| Safe Battery Range | 3S to 12S LiPo |
| Recommended Battery | 10S LiPo |
| Max Current (Cont.) | 50A |
| Max Current (Peak) | 240A (instantaneous) |
| ERPM | 60,000 |
| PCB | 4 layers, 40mm x 60mm |
| Weight | ~80g (without case) |
| BEC | 5V @ 1.5A |
| Cooling | Passive (heatsink/case recommended) |

### Variants

1. **Standard** - PCB only, ~80g, dimensions 60x40x20mm
2. **With Aluminum Case** - ~120x56x20mm, improved cooling
3. **Mini FSESC4.20** - Compact variant, 50A continuous, 150A peak

## Features

### Motor Control
- **DC, BLDC, FOC (sinusoidal)** operation modes
- Sensored or sensorless operation
- FOC with auto-detection of motor parameters (FW 3.34+)
- Duty-cycle control, speed control, or current control
- Regenerative braking
- Good startup torque in both sensored and sensorless modes

### Hardware
- **DRV8302** MOSFET driver / buck converter / current shunt amplifier
- **6x IRFS7530 MOSFETs**
- **4-layer PCB** with 3oz copper (12oz total)
- **STM32F4** microcontroller
- **Timing**: Software calibration

### Sensor Support
- Hall sensors
- ABI encoder
- Sensorless operation
- Hybrid mode support

### Connectivity
- USB (Mini USB)
- UART
- CAN bus
- I2C
- PPM signal (RC servo)
- Analog input

### Control Interfaces
- PPM signal (RC servo)
- Analog
- UART
- I2C
- USB
- CAN bus

### Safety Features
- Adjustable protection against:
  - Low/high input voltage
  - High motor current
  - High input current
  - High regenerative braking current
  - High RPM (separate limits per direction)
- Temperature monitoring
- Current control and temperature control features

### Additional Features
- 5V 1.5A BEC output for external electronics
- Motor used as tachometer (odometry)
- Optional PPM signal output
- Wireless Wii Nunchuk (Nyko Kama) control via I2C
- Reverse direction support
- Programmable cutoff voltage

## Physical Characteristics

### Standard Version
- **Dimensions**: 60mm x 40mm x 20mm
- **Weight**: ~80g
- **PCB**: 4 layers, 40x60mm
- **Motor Wire**: 12AWG
- **Power Cable**: 12AWG

### Aluminum Case Version
- **Dimensions**: 120mm x 56mm x 20mm
- **Material**: Anodized aluminum
- **Cooling**: Improved thermal dissipation
- **Protection**: IP65 water resistance (with case)

## Use Cases

### Best For
- **Electric skateboards** (e-skate) - entry level to mid-performance
- **Electric longboards** - commuter builds
- **Robotics** - moderate power requirements
- **RC cars/trucks** - brushless conversions
- **DIY electric vehicles** - budget-conscious builds
- **Educational projects** - learning VESC platform

### Recommended Motor Power
- 500W to 2000W continuous
- Peak up to 3000W (brief periods)

### Recommended Battery
- **3S to 12S LiPo** (12S = 50.4V max)
- **10S (42V)** recommended for optimal performance
- Must not exceed 60V (spikes included)

### ERPM Limitations
- **60,000 ERPM maximum** (hardware limitation)
- ERPM = RPM × Motor Pole Pairs
- High KV motors at high voltage may exceed limit
- Example calculation: 200KV × 50V × 7 pole pairs = 70,000 ERPM (TOO HIGH)
- Recommended: 170KV or lower for 12S operation

## FOC Mode Considerations

### Important Warning
The Flipsky FSESC 4.12 **does support FOC mode**, but with limitations:

1. **ERPM Limit**: FOC works best at low ERPM
2. **High KV Motors**: May struggle at high voltage in FOC
3. **Recommended Settings**:
   - Keep motor max current at 35-40A for FOC
   - Calculate ERPM: Motor KV × Battery Voltage × Pole Pairs
   - Stay below 60,000 ERPM total

### FOC vs BLDC
- **FOC**: Quieter operation, more efficient, smoother torque
- **BLDC**: More robust at high ERPM, simpler operation
- **Recommendation**: Use BLDC for high-speed/high-voltage setups

## Known Issues and Limitations

### Hardware Limitations
1. **Two-shunt design** - Same as original VESC 4.12
2. **60K ERPM limit** - Cannot exceed this value
3. **FOC performance** - Limited at high ERPM/high current
4. **DRV8302 limitations** - Can trigger faults under extreme load

### Quality Variations
- Quality can vary between production batches
- Some users report DRV soldering issues
- Capacitor quality may vary
- PCB copper weight is good (3oz per layer)

### Common Problems
- **FOC issues at high ERPM**: Switch to BLDC or reduce current
- **DRV faults**: May occur under heavy load or rapid switching
- **Temperature**: Requires proper cooling for continuous 50A
- **USB connection**: Some users report intermittent USB issues

### Workarounds
- Keep motor max current at 35-40A for reliable FOC operation
- Ensure adequate cooling (heatsink or aluminum case)
- Add external capacitor near battery input
- Use conservative settings initially

## Firmware Compatibility

### Supported Firmware
- **Hardware Version**: 4.12
- **Compatible Firmware**: V3.40 through 5.2
- **VESC Tool**: Compatible with official VESC Tool
- **Recommended**: Keep factory firmware (5.2) for best stability

### Firmware Updates
- Can be updated via VESC Tool
- ST-Link V2 required for bootloader updates
- Firmware updates may erase configuration

## Comparison with Official VESC

| Feature | Flipsky FSESC 4.12 | Official VESC 4.12 |
|---------|-------------------|-------------------|
| Price | ~$60-80 | ~$115-150 (historical) |
| Quality | Good (variable) | Premium |
| Support | Community | Official |
| Warranty | Limited | Better |
| Components | Good quality | Premium grade |
| PCB | 4-layer, 3oz copper | 4-layer |
| Compatibility | Full VESC compatibility | Reference standard |

## Official Resources

- **Flipsky Website**: https://flipsky.net/
- **Product Page**: https://flipsky.net/collections/v4-series/products/fsesc-4-12-50a-with-without-aluminum-case
- **VESC Project**: https://vesc-project.com/
- **VESC Tool**: https://vesc-project.com/vesc_tool
- **GitHub**: https://github.com/vedderb/bldc (firmware)

## Community Resources

- **VESC Project Forums**: https://vesc-project.com/forum
- **Electric Skateboard Forums**: https://forum.esk8.news/
- **Flipsky Documentation**: Various community guides available

## Recommended VESC Tool Version

For Flipsky FSESC 4.12 with firmware 3.40:
- **VESC Tool 0.95** or **VESC Tool 3.0** for newer firmware
- Download from: https://vesc-project.com/vesc_tool

## Known Good Setups

### Conservative Settings (Reliable)
- Battery: 10S (42V nominal)
- Motor max: 40A
- Battery max: 40A
- ERPM limit: 50,000
- Mode: FOC or BLDC

### Performance Settings (Experienced users)
- Battery: 12S (50.4V max)
- Motor max: 50A (brief)
- Battery max: 50A
- ERPM limit: 60,000
- Mode: BLDC (recommended for high ERPM)

## Sources

1. Flipsky Official Product Page - https://flipsky.net/collections/v4-series
2. MOMObot Flipsky Documentation - https://momobot.readthedocs.io/en/latest/bonus/vesc_doc.html
3. VESC Project Forums - Flipsky 4.12 discussions
4. GitHub VESC Documentation - https://github.com/vedderb/bldc
5. Community forums and user reports (esk8.news)
6. Flipsky Manual and Specifications

**Last Updated**: 2025-05-05

**Trademark Notice**: "VESC" is a registered trademark of Benjamin Vedder. Flipsky is an independent manufacturer producing VESC-compatible hardware.

**Disclaimer**: This documentation is based on manufacturer specifications and community reports. Actual performance may vary. Always verify compatibility before purchase. The FSESC 4.12 is not an official VESC product but is designed to be compatible with VESC software.
