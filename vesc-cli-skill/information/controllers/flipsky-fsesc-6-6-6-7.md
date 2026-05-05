# Flipsky FSESC 6.6 / 6.7 PRO

## Overview

The **Flipsky FSESC 6.6** and **6.7 PRO** are VESC 6-based motor controllers manufactured by Flipsky (China). These controllers offer a significant upgrade over the FSESC 4.12, featuring the three-shunt design, higher current capabilities, and improved FOC performance characteristic of the VESC 6 platform.

The FSESC 6.x series provides an affordable entry point into VESC 6 performance, making high-quality FOC control and advanced features accessible to budget-conscious builders. While not officially branded as "VESC," these controllers maintain compatibility with VESC Tool and the open-source VESC firmware.

The 6.7 PRO represents the latest refinement with improved components and manufacturing quality.

## Specifications

### FSESC 6.6

| Parameter | Value |
|-----------|-------|
| Hardware Version | V6.6 |
| Firmware | Latest VESC firmware (5.x, 6.x compatible) |
| Max Voltage | 60V (8V-60V operating range) |
| Safe Battery Range | 4S to 12S LiPo |
| Max Current (Cont.) | 60A |
| Max Current (Peak) | 150A (instantaneous) |
| ERPM | 150,000 |
| BEC | 5V 1.5A, 3.3V 1A |
| Weight | ~120g (without case) |
| Dimensions | PCB ~70x60mm |
| Cooling | Passive (aluminum case recommended) |

### FSESC 6.7 PRO

| Parameter | Value |
|-----------|-------|
| Hardware Version | V6.7 |
| Firmware | Latest VESC firmware (factory 5.2 recommended) |
| Max Voltage | 60V (8V-60V operating range) |
| Safe Battery Range | 4S to 12S LiPo |
| Max Current (Cont.) | 60A |
| Max Current (Peak) | 150A (instantaneous) |
| ERPM | 150,000 |
| BEC | 5V 1.5A, 3.3V 1A |
| Weight | ~380g (with aluminum case) |
| Dimensions | 100mm x 92mm x 22.5mm (with case) |
| Cooling | Anodized aluminum case (IP65) |

### Dual FSESC 6.7 Plus

| Parameter | Value |
|-----------|-------|
| Configuration | Dual ESC (2x VESC on one PCB) |
| Continuous Current | 100A per side (200A total) |
| Peak Current | 400A per side (800A total instantaneous) |
| Internal Connection | CAN bus integrated |
| Features | Power button, CAN bus connector |
| Dimensions | 78mm x 78mm x 27.3mm (with heatsink) |
| Weight | Varies by configuration |

## Features

### Motor Control (All Versions)
- **DC, BLDC, FOC (sinusoidal)** operation modes
- **Three-phase shunts** for precise current measurement
- Sensored or sensorless operation + hybrid mode
- FOC with auto-detection of motor parameters
- Duty-cycle control, speed control, or current control
- Regenerative braking
- Traction control (single and dual setups)
- Seamless 4-quadrant operation

### Hardware Improvements Over 4.12
- **Three-shunt design** (vs. two-shunt on 4.12)
- **DRV8301** MOSFET driver (improved over DRV8302)
- **Higher quality MOSFETs**
- **IMU support** (BMI160 on some versions)
- **Phase filters** for improved FOC performance
- **Better thermal design**

### Sensor Support
- Hall sensors
- ABI encoder
- AS5047 encoder
- Sensorless operation
- Hybrid mode

### Connectivity
- USB (Micro USB)
- UART
- CAN bus
- I2C
- PPM signal
- Analog input
- **NRF port** (for Bluetooth module)

### FSESC 6.7 PRO Improvements
1. **Aluminum case included** - Aviation-grade aluminum alloy, anodized, IP65
2. **Power button** included (on Plus versions)
3. **Anti-spark switch** integrated (on some models)
4. **CAN bus connector** added for easier 4WD setup
5. **USB port** - SMT soldering (more reliable than hand-soldered)
6. **SMT capacitors** - More reliable mounting
7. **Additional MOSFETs** - Bottom side for better power handling

### Dual FSESC 6.7 Plus Features
- **Integrated CAN bus** - Master/slave connection internal
- **Power button with LED** - Visual status indication
- **CAN bus connector** - Convenient 4WD expansion
- **Dual motor support** - One PCB, two independent VESCs
- **Shared power input** - Single battery connection

## Physical Characteristics

### FSESC 6.6 / 6.7 (PCB Only)
- **Dimensions**: ~70mm x 60mm
- **Weight**: ~120g
- **Connectors**: 12AWG motor wires, various JST headers

### FSESC 6.7 PRO (With Aluminum Case)
- **Dimensions**: 100mm x 92mm x 22.5mm
- **Weight**: ~380g (including case)
- **Material**: Aviation-grade aluminum alloy
- **Finish**: Anodized
- **Protection**: IP65 water resistance
- **Cooling**: Integrated heatsink design

### Dual FSESC 6.7 Plus
- **Dimensions**: 78mm x 78mm x 27.3mm (with heatsink)
- **Alternative**: 83mm x 27.3mm x 18.3mm (with aluminum case)
- **Weight**: Varies by configuration
- **Connectors**: 8AWG power cable, 12AWG motor wires
- **Bullet Connectors**: 4mm recommended

## Use Cases

### Best For
- **Electric skateboards** (e-skate) - mid to high performance
- **Electric longboards** - performance commuter builds
- **Electric mountainboards** - off-road applications
- **Robotics** - higher power requirements
- **RC vehicles** - brushless conversions
- **DIY electric vehicles** - performance builds
- **One-wheels/unicycles** - balancing applications (with IMU)

### Recommended Motor Power
- **Single**: 1000W to 3000W
- **Dual**: 2000W to 6000W total

### Recommended Battery
- **4S to 12S LiPo** (12S = 50.4V max)
- **10S or 12S** recommended for best performance
- High-discharge cells recommended for peak current

### ERPM Capabilities
- **150,000 ERPM maximum**
- Significantly better than 4.12 (60K limit)
- Three-shunt design provides smooth operation at high ERPM
- Better FOC performance across speed range

## Firmware Compatibility

### Important Firmware Note
**Flipsky Recommendation**: It is recommended to keep factory firmware 5.2. New firmware upgrades may damage the ESC on some hardware revisions.

### Supported Firmware
- **Hardware Version**: V6.6, V6.7
- **Compatible**: VESC firmware 5.2 (recommended), 6.x
- **VESC Tool**: Compatible with official VESC Tool
- **Default**: VESC_default_no_hw_limits (some versions)

### Firmware Installation
- Factory firmware typically pre-installed
- Can be updated via VESC Tool (with caution)
- Some versions use custom firmware
- Check hardware revision before updating

## Comparison: FSESC 6.x vs FSESC 4.12

| Feature | FSESC 6.x | FSESC 4.12 |
|---------|-----------|------------|
| Shunt Design | Three-shunt | Two-shunt |
| ERPM Limit | 150,000 | 60,000 |
| Continuous Current | 60A | 50A |
| Peak Current | 150A | 240A |
| FOC Performance | Excellent | Limited at high ERPM |
| Voltage | 60V | 60V |
| IMU | Some versions | No |
| Price | ~$130-170 | ~$60-80 |
| Thermal Design | Better | Basic |

## Comparison: FSESC 6.7 vs Official VESC 6

| Feature | FSESC 6.7 | Official VESC 6 MKVI |
|---------|-----------|---------------------|
| Price | ~$140 | ~$200+ |
| Continuous Current | 60A | 80A-100A |
| Build Quality | Good | Premium |
| Warranty | Limited | Better |
| Support | Community | Official |
| Software | VESC compatible | VESC native |
| Components | Good | Premium grade |

## Known Issues and Considerations

### Firmware Caution
- **WARNING**: Upgrading firmware may damage some units
- **Recommendation**: Keep factory firmware 5.2
- Check hardware revision before any firmware changes

### Quality Variations
- Manufacturing quality can vary between batches
- Some users report inconsistent component quality
- Aluminum case versions are generally more reliable

### Common Issues
1. **IMU availability** - Not all versions include BMI160 IMU
2. **Firmware compatibility** - Some versions use custom firmware
3. **Temperature** - Aluminum case recommended for sustained 60A
4. **USB reliability** - 6.7 PRO improved with SMT soldering

### Recommendations
- Use aluminum case version for best reliability
- Keep factory firmware unless specifically required
- Ensure proper cooling for continuous operation
- Verify IMU presence if needed for balancing

## Package Contents

### FSESC 6.7 PRO Single
- 1x FSESC 6.7 with aluminum case
- 1x Micro USB cable
- 1x VESC sensor wire
- 1x PPM cable
- 1x Manual

### Dual FSESC 6.7 Plus
- 1x Dual FSESC 6.7 Plus
- 2x VESC sensor wires
- 1x LED button (on switch versions)
- 1x Micro USB
- 1x Manual

## Official Resources

- **Flipsky Website**: https://flipsky.net/
- **FSESC 6.7 PRO**: https://flipsky.net/products/fs-esc-6-6
- **Dual FSESC 6.7 Plus**: https://flipsky.net/products/dual-fsesc6-7-plus-with-power-button
- **VESC Project**: https://vesc-project.com/
- **VESC Tool**: https://vesc-project.com/vesc_tool

## Community Resources

- **VESC Project Forums**: https://vesc-project.com/forum
- **Electric Skateboard Forums**: https://forum.esk8.news/
- Flipsky-specific community guides and tutorials

## Selection Guide

### Choose FSESC 4.12 if:
- Budget is primary concern
- Moderate performance needs (under 50A)
- 60K ERPM limit acceptable
- Basic functionality sufficient

### Choose FSESC 6.6/6.7 if:
- Need 150K ERPM capability
- Want better FOC performance
- Higher continuous current needed (60A)
- Planning balancing applications (check IMU)
- Want aluminum case option

### Choose Dual FSESC 6.7 Plus if:
- Building dual-motor setup
- Want integrated CAN connection
- Prefer single PCB solution
- Need power button integration

## Sources

1. Flipsky Official Product Pages - https://flipsky.net/
2. VESC Project Forums - FSESC 6.6 discussions
3. Community user reports and testing (esk8.news)
4. Flipsky product manuals and specifications
5. GitHub VESC firmware documentation

**Last Updated**: 2025-05-05

**Trademark Notice**: "VESC" is a registered trademark of Benjamin Vedder. Flipsky produces VESC-compatible hardware. FSESC (Flipsky Electronic Speed Controller) is a Flipsky product name.

**Disclaimer**: This documentation is based on manufacturer specifications and community reports. Firmware upgrade warnings should be heeded. Always verify current specifications with the seller before purchase.
