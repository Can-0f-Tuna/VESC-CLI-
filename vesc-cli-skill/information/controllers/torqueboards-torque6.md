# Torqueboards TORQUE6

## Overview

**TORQUE6** is a VESC 6-based electronic speed controller (ESC) manufactured by **DIY Electric Skateboard** (torqueboards / diyelectricskateboard.com). Designed and based on the VESC 6 open-source project, the TORQUE6 provides a reliable, performance-oriented controller specifically tailored for electric skateboard applications.

The TORQUE6 represents a significant upgrade over their earlier TORQUE ESC (V4.12-based), offering improved torque, smoother acceleration, and the enhanced reliability characteristic of the VESC 6 platform's three-shunt design.

TORQUE6 controllers are available in both single and dual configurations, with the dual version integrating two independent VESCs on a single PCB with internal CAN bus connection.

## Product Line

### TORQUE6 Single ESC
- Individual VESC 6 controller
- For single-motor builds
- Can be paired for dual-motor setups

### TORQUE6 Dual ESC
- Dual VESCs on single PCB
- Internal CAN bus connection
- Single power input for both controllers
- Available in various current ratings

## Specifications

### TORQUE6 Single ESC

| Parameter | Value |
|-----------|-------|
| Hardware | V6 (VESC 6 Open Source Project) |
| Firmware | v5.1 or later |
| Max Voltage | 60V (12S max, 50.4V recommended) |
| Recommended Voltage | 12S LiPo (50.4V) |
| Continuous Current | 80A |
| Peak Current | 150A |
| Dimensions | 80mm x 70mm x 18mm |
| Weight | ~150g (with heatsink) |
| Cooling | Aluminum heatsink with thermal pad |
| Motor Wires | 5.5mm bullet connectors |
| Power Connector | XT60 |
| Connectors | JST-PH 2.0mm pitch |

### TORQUE6 Dual ESC (60V 100A/200A)

| Parameter | Value |
|-----------|-------|
| Hardware | V6 (VESC 6 Open Source Project) |
| Firmware | Latest VESC firmware |
| Max Voltage | 60V |
| Recommended Voltage | 12S (50.4V) |
| Continuous Current | 100A per side (200A total) |
| Peak Current | 200A per side |
| Dimensions | 155mm x 85mm x 25mm (with heatsink) |
| Motor Wires | MR60 female connectors, 100mm 12AWG |
| Power Connector | XT90 male, 60mm 12AWG |
| Connectors | JST-PH 2.0mm pitch |
| Internal Connection | CAN bus (pre-connected) |

## Features

### Motor Control
- **DC, BLDC, FOC (sinusoidal)** operation modes
- **Three-phase shunts** for precise current measurement
- Sensored or sensorless operation
- FOC with auto-detection of motor parameters
- Duty-cycle control, speed control, or current control
- Regenerative braking
- Good startup torque in sensorless mode

### Hardware
- **VESC 6-based design** - Improved over V4.12
- **Aluminum heatsink** - High thermal dissipation
- **Thermal pad** - High thermal conductivity pad included
- **Quality connectors** - XT60/XT90 and JST-PH

### Sensor Support
- Hall sensors
- Sensored motors
- Sensorless operation

### Connectivity
- USB
- UART
- CAN bus
- PPM input
- I2C
- SPI (COMM port)

### Dual ESC Features
- **Integrated CAN bus** - Master/slave pre-wired internally
- **Single power input** - Both VESCs powered from one battery connection
- **Independent control** - Each side configurable separately via VESC Tool
- **Traction control ready** - CAN-based traction control supported

### Input Sources
- PPM signal (RC receivers)
- UART commands
- CAN commands
- Analog input

## Physical Characteristics

### TORQUE6 Single
- **Dimensions**: 80mm x 70mm x 18mm
- **Heatsink**: Aluminum enclosure
- **Connectors**:
  - Battery: XT60
  - Motor: 5.5mm bullet connectors
  - Signal: JST-PH 2.0mm
- **Weight**: ~150g

### TORQUE6 Dual
- **Dimensions**: 155mm x 85mm x 25mm (with heatsink)
- **Heatsink**: Integrated aluminum heatsink
- **Connectors**:
  - Battery: XT90 male
  - Motors: MR60 female (yellow connectors on newer versions)
  - Signal: JST-PH 2.0mm

## Package Contents

### TORQUE6 Single ESC Setup
- 1x TORQUE6 ESC
- 1x TORQUE6 PPM Connector (included)

### TORQUE6 Dual ESC Setup
- 1x TORQUE6 Dual ESC
- 1x Power Switch (14mm diameter)
- 1x XT90 Connector (power wires)

### Dual Setup Additional Items (when buying 2 singles)
For dual motor using two single ESCs:
- 2x TORQUE6 ESC
- 1x TORQUE6 PPM Connector
- 1x TORQUE6 CANBus Connector
- 1x TORQUE6 Dual XT60 Parallel Connector

## Use Cases

### Best For
- **Electric skateboards** (e-skate) - performance builds
- **Electric longboards** - commuter to high-performance
- **Electric mountainboards** - 2WD and 4WD configurations
- **Robotics** - medium power requirements
- **RC vehicles** - brushless conversions

### Recommended Motor Power
- **Single 80A**: 1000W to 3000W
- **Dual 100A x2**: 2000W to 6000W total

### Recommended Battery
- **12S LiPo** (50.4V max) - recommended
- 10S LiPo - acceptable for lower power builds
- Minimum 8S for basic operation

### ERPM Capabilities
- **150,000 ERPM maximum** (VESC 6 platform)
- Suitable for high-speed motors
- Three-shunt design provides excellent FOC performance

## VESC Tool Compatibility

### Recommended Software
- **VESC Tool**: Download from https://vesc-project.com/vesc_tool
- Create account on VESC Project to download
- Windows, MacOS, Linux, Android versions available

### Programming
- Configure via VESC Tool over USB
- Real-time data monitoring
- Motor detection wizard
- Firmware updates supported

### Dual ESC Configuration
When using TORQUE6 Dual ESC:
1. Power on ESC
2. Connect via VESC Tool
3. Both sides appear in software
4. Toggle between sides for independent configuration
5. CAN bus already connected - no separate cable needed

## Pinout Information

### TORQUE6 Dual ESC V1.01 Pinout
**First batch used different pinout than standard** - labeled "TORQUE6 DUAL 60V 100/200A V1.01"

**COMM Port (8-pin JST-PH 2.0)**:
- TSX_SCL = TX
- RX_SDA = RX
- GND = VESC -
- 5V = 5V or VESC +

### Standard TORQUE6 / Single ESC
Uses standard COMM port pinout compatible with:
- VX1 Remote (Torqueboards)
- Standard VESC accessories
- Standard PPM receivers

## Recommended Remote

### VX1 Remote (Torqueboards)
- UART capable remote
- Precise throttle response
- Battery level indicator
- Reverse function
- Compatible with TORQUE6 wiring harness

Package includes:
- VX1 Remote
- VX1 Receiver (UART)
- V4.12 VESC Wire Harness
- V6 VESC Wire Harness

## Comparison: TORQUE6 vs VESC 4.12

| Feature | TORQUE6 | VESC 4.12 |
|---------|---------|-----------|
| Hardware | V6 | V4.12 |
| Shunt Design | Three-shunt | Two-shunt |
| ERPM Limit | 150,000 | 60,000 |
| Continuous Current | 80A-100A | 50A |
| FOC Performance | Excellent | Limited at high ERPM |
| Reliability | Higher | Good |
| Heat Dissipation | Better | Basic |
| Price | ~$135 (single) | ~$60-80 |

## Comparison: TORQUE6 vs Official VESC 6

| Feature | TORQUE6 | Official VESC 6 MKVI |
|---------|---------|---------------------|
| Price | ~$135 (single), ~$342 (dual) | ~$200+ (single) |
| Continuous Current | 80A | 80A-100A |
| Build Quality | Good | Premium |
| Warranty | Standard | Better |
| Support | Torqueboards | Official VESC |
| Software | VESC compatible | VESC native |
| Form Factor | Skateboard optimized | General purpose |

## Known Issues and Considerations

### Dual ESC V1.01 Pinout
- First batch used different pinout
- Check label on your ESC
- Ensure receiver wiring matches

### Voltage Limitation
- 60V maximum (12S)
- Not suitable for higher voltage builds (16S, 20S)
- 12S recommended for optimal performance

### Firmware
- Compatible with official VESC firmware
- Update via VESC Tool
- Keep updated for latest features

### Physical Size
- Check enclosure dimensions before purchase
- Dual ESC requires larger enclosure
- Heatsink adds to height (25mm on dual)

## Official Resources

- **DIY Electric Skateboard**: https://diyelectricskateboard.com/
- **TORQUE6 Single**: https://diyelectricskateboard.com/products/torque6-esc
- **TORQUE6 Dual**: https://diyelectricskateboard.com/products/torque6-dual-esc
- **VX1 Remote**: https://diyelectricskateboard.com/products/vx1-remote
- **Dual ESC Documentation**: https://diyelectricskateboard.com/blogs/electric-skateboard/torque6-dual-esc-documentation
- **VESC Project**: https://vesc-project.com/
- **VESC Tool**: https://vesc-project.com/vesc_tool

## Historical Context

The TORQUE6 was developed as an upgrade to the original TORQUE ESC (V4.12-based):
- **TORQUE ESC (V4.12)**: Earlier generation, basic performance
- **TORQUE6**: VESC 6-based, significantly improved

Improvements over V4.12:
- 3x higher ERPM capability (150K vs 60K)
- Three-shunt design for better FOC
- Higher continuous current (80A vs 50A)
- Better heat dissipation
- More reliable construction

## Community Resources

- DIY Electric Skateboard website guides
- VESC Project Forums
- Electric skateboard communities (esk8.news)
- YouTube tutorials for TORQUE6 setup

## Setup Recommendations

### Single Motor Build
1. TORQUE6 Single ESC ($135)
2. TORQUE6 PPM Connector (included)
3. Compatible motor (up to 3000W)
4. 12S battery pack
5. VX1 Remote (recommended, $70)
Total: ~$205

### Dual Motor Build (2WD)
Option 1 - Single ESCs:
- 2x TORQUE6 Single ($270)
- CANBus Connector + Dual XT60 (included)
- VX1 Remote ($70)
Total: ~$340

Option 2 - Dual ESC:
- 1x TORQUE6 Dual ($342)
- Power switch (included)
- VX1 Remote ($70)
Total: ~$412

## Sources

1. DIY Electric Skateboard TORQUE6 Product Page
2. DIY Electric Skateboard TORQUE6 Dual ESC Documentation
3. DIY Electric Skateboard VX1 Remote Product Page
4. VESC Project Hardware Documentation
5. Community user reports and reviews
6. Electric skateboard forum discussions

**Last Updated**: 2025-05-05

**Trademark Notice**: "VESC" is a registered trademark of Benjamin Vedder. Torqueboards produces VESC-compatible hardware under their TORQUE6 product line.

**Disclaimer**: This documentation is based on manufacturer specifications and community reports. Always verify current specifications and pinout information (especially for early dual ESC batches) before installation. The TORQUE6 is optimized for 12S electric skateboard applications and may not be suitable for higher voltage builds.
