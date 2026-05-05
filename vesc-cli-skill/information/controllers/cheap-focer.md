# Cheap FOCer Series (v1, v2, v3)

## Overview

The **Cheap FOCer** series is an open-source, low-cost motor controller project created by **shamansystems** (and later continued by Makers PEV). Based on Benjamin Vedder's VESC designs, the Cheap FOCer aims to provide VESC-compatible motor control at significantly reduced cost through optimized hardware design and DIY-friendly manufacturing.

The project prioritizes:
- Low BOM (Bill of Materials) cost
- Easy assembly (especially hand-soldering)
- Open-source hardware and software
- JLCPCB manufacturing compatibility
- Educational value for learning motor control

Three major versions exist:
- **Cheap FOCer v1** - Based on VESC 4.12
- **Cheap FOCer 2** - Based on VESC 6 (discontinued, replaced by v3)
- **Cheap FOCer v3** - Current version, DRV-less design

## Project Philosophy

The Cheap FOCer was designed to make VESC technology accessible to:
- Hobbyists on a budget
- Educational projects
- Experimenters wanting to build their own controllers
- Makers wanting to understand motor control hardware

## Versions

### Cheap FOCer v1 (Legacy)

**Status**: Legacy (replaced by v2/v3)

| Parameter | Value |
|-----------|-------|
| Base Design | VESC 4.12 |
| MOSFETs | TO-220 package (6x) |
| PCB | 2-layer |
| Dimensions | 45mm x 92mm |
| Cost Target | ~$30-40 in parts |
| Assembly | Hand-solderable (0805 minimum) |

**Key Features**:
- TO-220 MOSFETs allow large heatsink attachment
- All SMD components 0805 or larger (hand-solderable)
- ON/OFF capability via simple switch
- Fits in Hammond 1590b enclosures
- Lower build cost than VESC 4.12

**Limitations**:
- Larger than original VESC
- Higher profile with TO-220 package
- Requires wire/solder wick reinforcement of power traces
- Two-shunt design limitations

**Note**: Cheap FOCer v1 has been superseded by v2 and v3. Use newer versions for new projects.

### Cheap FOCer 2 (v0.9) - Legacy

**Status**: Development halted, replaced by v3

| Parameter | Value |
|-----------|-------|
| Base Design | VESC 6 |
| MOSFETs | TO-220 |
| PCB | 2-layer |
| Dimensions | 60mm x 100mm x 14mm (without heatsink) |
| Cost Target | ~$120 for 5 boards |
| Continuous Current | 35A (realistic) |
| Peak Current | 70A (with good heatsinking) |
| Voltage | Up to 50.4V (12S) |

**Key Improvements Over v1**:
- VESC 6 based (vs VESC 4.12)
- IMU included (BMI160) for balancing
- Three-shunt design
- Significantly improved layout (reduced current loops)
- JST connectors (not pin headers)
- Lower profile
- Better low-inductance motor handling
- ESD protected I/O

**Design Goals**:
- Significantly lower BOM cost than VESC 6
- JLCPCB SMT assembly compatible
- 2-layer PCB for low-cost manufacturing
- ON/OFF connector for power control
- 2-pin CAN connector (avoids improper connections)
- Open source hardware

**Known Issues**:
- **WARNING**: Potential DRV8301 SMT assembly issues from JLCPCB
- Some units had blown D1 diode arrays on first power-up
- Cause: Inadequate DRV soldering leading to unregulated 5V (7V+)
- **Recommendation**: Reflow DRV and touch up soldering before first power-on
- Used custom firmware (not in official VESC project at the time)

**Status**: Development discontinued in favor of Cheap FOCer v3

### Cheap FOCer v3 (Current) - By Makers PEV

**Status**: Current recommended version

| Parameter | Value |
|-----------|-------|
| Hardware Design | VESC 6 based |
| Voltage | Up to 64.8V (18S Li-ion) |
| Absolute Max Voltage | 75.6V |
| Recommended Min Voltage | 18V |
| Peak Phase Current | 120A |
| Battery Current | 70A typical, 100A max (external cooling) |
| Efficiency | 95% or greater |
| PWM Frequency | 10kHz to 60kHz (Center Aligned) |
| Min Motor Inductance | 10µH (phase-to-phase) |
| Input Capacitance | 602µF |
| Operating Temperature | -20°C to 50°C |
| Storage Temperature | -35°C to 85°C |
| Thermal Cutback | Starts at 80°C, cutoff at 100°C |

**Key Features**:
- **DRV-less design** - No DRV8301/DRV8302 (improved reliability)
- **USB Type-C** connector
- **Phase filters** included
- **Smart LED control**
- **1A 5V auxiliary output**
- **18S safe operation**
- **On-board IMU** (BMI160)
- **Bluetooth Low Energy** support
- **1x CAN bus**
- **1x UART**
- **Power consumption**: Off = 500µA, Idle < 0.8W

**Motor Support**:
- BLDC motors
- DC motors
- FOC (Field Oriented Control)
- Sensored and sensorless operation

## Design Philosophy by Version

### Cheap FOCer 2 Design Advantages
1. **Lower cost** than VESC 6
2. **TO-220 FETs** for big heatsink attachment
3. **2-layer PCB** - Low-cost JLCPCB manufacturing
4. **JLCPCB SMT assembly** designed
5. **ON/OFF connector** for power control
6. **2-pin CAN** - Prevents improper connections
7. **ESD protected I/O**
8. **Open source hardware**
9. **Direct meme integration** (community fun)

### Cheap FOCer v3 Innovations
1. **DRV-less design** - Eliminates common failure point
2. **Phase filters** - Better FOC performance
3. **USB-C** - Modern connector standard
4. **18S capability** - Higher voltage than v2
5. **Smart LED** - Visual status indication
6. **Improved electrical stability**
7. **Easy Bluetooth addon**

## Use Cases

### Best For
- **Budget electric skateboards** - DIY builds on a budget
- **Educational projects** - Learning motor control
- **One-wheels** - Balancing applications (with IMU)
- **Electric unicycles** - Personal mobility
- **Robotics projects** - Moderate power requirements
- **Hobby experimentation** - Understanding VESC hardware
- **Combat robots** (lightweight class) - Hobby weight

### Recommended Motor Power
- **Cheap FOCer v3**: 500W to 2000W
- Continuous current dependent on cooling

### Recommended Battery
- **Cheap FOCer v2**: 3S to 12S (12.6V to 50.4V)
- **Cheap FOCer v3**: 6S to 18S (25.2V to 75.6V)
- Ensure voltage spikes stay within limits

## Assembly and Manufacturing

### Cheap FOCer 2 Ordering Guide
1. **JLCPCB SMT Assembly**:
   - Upload gerber.zip
   - Upload BOM (Bill of Materials)
   - Select SMT assembly service
   - Review component placement
   - Extended parts (DRV8301, etc.) cost more

2. **Remaining Components** (not assembled by JLCPCB):
   - MOSFETs (TO-220 package)
   - Some capacitors
   - BMI160 IMU (if used)
   - Order from LCSC.com

3. **Required Tools**:
   - ST-Link V2 programmer
   - Reflow station (for BMI160 IMU)
   - Basic soldering equipment
   - Drill and M3 tap (for heatsink)

### BOM Cost (Cheap FOCer 2)
- Target: ~$120 USD for 5 complete controllers
- Individual controller: ~$24 in parts
- Costs vary with component selection and quantities

## Required Parts for Assembly (Cheap FOCer 2)

### Required
- SMD Assembled PCB (from JLCPCB)
- 6x MOSFETs (TO-220)
- Heatsink (60mm x 100mm minimum)
- Thermal pad (60mm x 60mm x 1mm)
- Thermal paste
- M3 x 12mm screws (6x)
- M3/M4 5mm nylon spacers (6x)
- M3 washers (6x)
- Battery and motor wires (12AWG or 10AWG)
- Connectors (XT60, bullet connectors)
- ST-Link V2 programmer

### Optional
- Pin headers (for GPIO)
- Power switch
- 60mm 5V fan
- Case (3D printable designs available)
- Bluetooth module

## Firmware

### Cheap FOCer 2
- Uses custom firmware (not official VESC at time of development)
- Firmware available on GitHub
- Requires ST-Link V2 for initial bootloader flash

### Cheap FOCer v3
- VESC 6 open source project compatible
- Uses standard VESC firmware
- Configurable via VESC Tool
- IMU support built-in

## GitHub Repositories

### Cheap FOCer 2
- **Repository**: shamansystems/Cheap-FOCer-2
- **URL**: https://github.com/shamansystems/Cheap-FOCer-2
- **Language**: C, KiCad
- **License**: CC BY-SA 4.0

### Cheap FOCer v1
- **Repository**: shamansystems/Cheap-FOCer
- **URL**: https://github.com/shamansystems/Cheap-FOCer
- **Status**: Archived/Legacy

## Current Status (2025)

### Cheap FOCer 2
- Development halted
- Replaced by v3
- GitHub repository archived
- Community support only

### Cheap FOCer v3
- **Manufactured by**: Makers PEV
- **Available from**: Makers PEV, One Stop Board Shop, other retailers
- **Price**: ~$100-150
- **Status**: Active product

## Known Issues

### Cheap FOCer 2
- **DRV soldering issues** from JLCPCB assembly (see warnings above)
- Custom firmware not in official VESC project
- Requires careful DRV reflow before first use
- Larger than original VESC 6

### General Considerations
- DIY assembly required (unless buying pre-built v3)
- Community support only (no official warranty)
- Performance depends on assembly quality
- Heatsinking critical for rated current

## Comparison with Other Budget VESCs

| Feature | Cheap FOCer v3 | Flipsky 4.12 | Makerbase Mini |
|---------|---------------|--------------|----------------|
| Price | ~$100-150 | ~$60-80 | ~$50-70 |
| Assembly | Pre-built | Pre-built | Pre-built |
| Design | DRV-less | Standard | Standard |
| Voltage | 18S | 12S | Varies |
| Current | 70A-120A | 50A | Varies |
| Open Source | Yes | No | No |
| DIY Option | v2 available | No | No |
| IMU | Yes | Some | Some |

## Official Resources

### Cheap FOCer 2 (Legacy)
- **GitHub**: https://github.com/shamansystems/Cheap-FOCer-2
- **Ordering Guide**: GitHub repository guides/ordering/
- **Assembly Guide**: GitHub repository guides/assembly/
- **Support Thread**: https://forum.esk8.news/t/cheap-focer-3-open-source-low-cost-vesc-6-based-esc-in-development/67432

### Cheap FOCer v3 (Current)
- **Makers PEV**: https://www.makerspev.com/
- **Product Page**: https://www.makerspev.com/collections/frontpage/products/cheap-focer
- **One Stop Board Shop**: https://onestopboardshop.com/products/cheap-focer-by-makers-pev

### Community
- **Esk8.news Forums**: Development and support discussions
- **VESC Project Forums**: https://vesc-project.com/forum

## Historical Note

The Cheap FOCer project represents the open-source spirit of the VESC ecosystem:
- Started by community member (shamansystems)
- Optimized for low-cost manufacturing
- Educational focus
- Transitioned to commercial production (v3)

The project's goal was never to compete with premium VESC hardware, but to provide an accessible entry point for learning and experimentation.

## Sources

1. Cheap FOCer 2 GitHub Repository - https://github.com/shamansystems/Cheap-FOCer-2
2. Cheap FOCer v1 GitHub Repository - https://github.com/shamansystems/Cheap-FOCer
3. Makers PEV Cheap FOCer v3 Product Page
4. One Stop Board Shop Cheap FOCer Page
5. Esk8.news Forums - Cheap FOCer development thread
6. JLCPCB Ordering Guides (in repository)

**Last Updated**: 2025-05-05

**Trademark Notice**: "VESC" is a registered trademark of Benjamin Vedder. The Cheap FOCer is a community open-source project compatible with VESC software.

**Disclaimer**: The Cheap FOCer is a DIY/open-source project. v1 and v2 require significant electronics assembly skills. v3 is available pre-assembled from commercial vendors. The original project (v1/v2) was designed for educational purposes and hobbyist experimentation. Safety precautions should be observed when working with high-power electronics.
