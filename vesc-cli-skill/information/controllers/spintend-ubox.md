# Spintend Ubox VESC Controllers

## Overview

**Spintend** is a Chinese manufacturer specializing in VESC-compatible motor controllers under their **"Ubox"** product line. The Ubox controllers have gained significant popularity in the electric skateboard, scooter, and DIY EV communities for offering high performance, robust features, and competitive pricing.

Ubox controllers are known for their:
- Integrated features (IMU, Bluetooth, power button)
- Multiple voltage/current options
- Aluminum PCB variants for improved cooling
- Convenient port layouts
- Power button with LED indicators
- 12V power outputs for accessories

The Ubox line includes both single and dual motor controllers, with various voltage ratings (75V, 85V, 100V, 126V) and current capacities.

## Product Line Overview

### Single Motor Controllers

#### Ubox 100V 100A (FR4 PCB)
- **Voltage**: Up to 100V (22S capable)
- **Current**: 100A continuous
- **PCB**: FR4 (standard fiberglass)
- **Features**: 12V power port, fan port, NRF port

#### Ubox Aluminum Lite 100V 100A
- **Voltage**: Up to 100V (22S capable)
- **Current**: 100A continuous
- **PCB**: Aluminum PCB (super compact)
- **Features**: Compact size, no 12V power port

#### Ubox Aluminum 85V 150A
- **Voltage**: Up to 85V
- **Current**: 150A continuous
- **PCB**: Aluminum PCB
- **Features**: Popular for daily commuter builds
- **Most popular Ubox model**

#### Ubox Aluminum 85V 250A V2
- **Voltage**: Up to 85V
- **Current**: 250A continuous
- **PCB**: Aluminum PCB with enhanced power stage
- **Features**: Higher power for racing/extreme applications
- **MOSFETs**: JMSH1001ATL-13
- **Current Amplifier**: INA240A1

#### Ubox Aluminum 126V 160A
- **Voltage**: Up to 126V (30S capable)
- **Current**: 160A continuous
- **PCB**: Aluminum PCB
- **Features**: Highest voltage Ubox controller

### Dual Motor Controllers

#### Dual Ubox V2 J 75V 100A x2
- **Voltage**: 75V (18S capable)
- **Current**: 100A per motor (200A total)
- **PCB**: FR4
- **MOSFETs**: JMSH1001ATL (JM)
- **Features**: 
  - Internal CAN bus switch
  - Integrated receiver
  - 3x 12V power ports

#### Dual Ubox V2 Purple 100A x2
- **Voltage**: 75V
- **Current**: 100A per motor (200A total)
- **PCB**: FR4
- **MOSFETs**: Onsemi FDBL0150N80 (75V)
- **Features**: Best performance MOSFETs for 75V spec

#### Dual Ubox Aluminum Lite 100V 100A x2
- **Voltage**: Up to 100V
- **Current**: 100A per motor (200A total)
- **PCB**: Aluminum PCB
- **Features**: 
  - Super compact dual controller
  - Designed to replace older Ubox V2 100V
  - No 12V power ports (size trade-off)

## Detailed Specifications

### Ubox Aluminum 85V 150A (Most Popular)

| Parameter | Value |
|-----------|-------|
| Max Voltage | 85V (warning: don't exceed 85V) |
| Min Voltage | 12V |
| Continuous Current | 150A |
| 12V Port | 2 groups, total <3A |
| 12V Fan Port | 3-pin connector |
| 12V Power Port | 4-pin connector |
| Power Button | LED indicator (green = running, dim green = idle, blinking red = abnormal) |
| IMU | BMI160 (built-in) |
| NRF Port | Yes (for Bluetooth/2.4GHz) |
| UART Port | Yes |
| CAN Bus | Yes (can power on/off via CAN) |
| SWD Port | Yes |
| Firmware | 6.2 (latest) |
| Case | Aluminum with stack design |
| Dimensions | Compact (model dependent) |
| Cooling | Aluminum PCB + case |

### Ubox Aluminum 100V 100A

| Parameter | Value |
|-----------|-------|
| Max Voltage | 100V (up to 22S) |
| Warning | Cannot support regen when 22S battery is full charged |
| Continuous Current | 100A |
| 12V Port | 2 groups, total 3A max |
| Firmware | 6.0+ (latest 6.05 fixes auto-shutoff error) |
| BEC | 5V/3.3V for logic |
| Protection | All power circuits protected by recovery fuse |
| Hall Protection | Strengthened hall signal clamping |
| IMU | BMI160 integrated |
| Dimensions | 29mm x 68mm x 83mm |
| Battery Connector | XT90 male |
| Motor Connectors | 4.0mm female bullet |

### Ubox Aluminum 85V 250A V2

| Parameter | Value |
|-----------|-------|
| Max Voltage | 85V |
| Continuous Current | 250A |
| 12V Port | 2 groups, total <4A (V1) or <3A (V2) |
| MOSFETs | JMSH1001ATL-13 |
| Current Amplifier | INA240A1 |
| Fuse | Optional 2x 120A fuses (recommended) |
| Bluetooth | Optional module |
| Firmware | 6.2 |
| Cooling | Aluminum power board for quick heat transfer |

## Common Features Across Ubox Series

### Power Management
- **Hibernation mode**: Ultra-low power standby
- **Power button with LED**:
  - Solid green = Running normally
  - Dim green = Stopped / beginning throttle
  - Blinking red = Abnormal/fault condition
- **Ignite key port**: Alternative power on/off method
- **CAN bus power control**: Turn on/off via CAN commands

### Integrated Features
- **BMI160 IMU**: Built-in accelerometer and gyro for balancing applications
- **NRF port**: Dedicated port for Bluetooth or 2.4GHz receiver
- **12V power ports**: 2-3 groups depending on model (for lights, fans, accessories)
- **Recovery fuse protection**: All power circuits (12V/5V/3.3V) protected
- **Hall signal protection**: Strengthened clamping circuits

### Connectivity (Most Models)
- USB Type-C or Micro USB
- CAN bus
- UART (with ADC inputs on some models)
- PPM input
- Hall sensor port
- NRF port (Bluetooth/remote)
- SWD port (diagnostics/debugging)
- Power button port
- 12V power/fan ports

### LED Indicators
Most Ubox controllers feature power button LED status indication:
- **Solid Green**: Running normally
- **Dim Green**: Stopped or beginning to throttle
- **Blinking Red**: Abnormal condition or fault

## Use Cases

### Best For
- **Electric skateboards** (e-skate) - single and dual motor builds
- **Electric scooters** - stock motor upgrades
- **E-foils** (electric hydrofoils) - high current for water propulsion
- **One-wheels** - balancing applications (with IMU)
- **Electric bikes** - mid to high power conversions
- **Combat robots** - high burst current
- **Robotics** - mobile robots requiring VESC control

### Model Selection Guide

**Choose Ubox 100V 100A if:**
- Need 22S capability (high voltage)
- Want 12V power ports for accessories
- Building high-speed e-skate

**Choose Ubox Aluminum 85V 150A if:**
- Want best value/performance ratio
- Daily commuter build
- 16S battery system
- Most popular = proven reliability

**Choose Ubox Aluminum 85V 250A if:**
- Need maximum current (250A)
- Racing/competition use
- High-power applications
- Combat robots

**Choose Dual Ubox if:**
- Building dual-motor vehicle
- Want integrated CAN connection
- Prefer single PCB solution

**Choose Aluminum Lite if:**
- Space is critical
- Want most compact solution
- Can sacrifice 12V power ports

### Recommended Motor Power
- **100A models**: 1000W to 4000W
- **150A models**: 1500W to 6000W
- **250A models**: 2500W to 10,000W

### Recommended Battery
- **75V models**: 12S to 18S (44.4V to 75.6V)
- **85V models**: 12S to 20S (44.4V to 84V)
- **100V models**: 12S to 22S (44.4V to 92.4V)
- **126V model**: Up to 30S (126V)

## Important Warnings

### Voltage Warnings
- **85V models**: "Don't try more than 85V power!"
- **100V models**: "Can't support regen function when 22S battery is full charged!"
- **126V model**: Extreme voltage - expert use only

### Firmware Warnings
- Shipped with latest firmware (6.0, 6.2)
- Using "unlimited" firmware voids warranty
- Open source firmware has risky features
- Only hardware is in warranty protection

### Physical Installation
- **Ubox 100V**: Screw length in bottom must be LESS than 2mm (will touch capacitors)
- Ensure proper mounting for vibration resistance
- Aluminum PCB transfers heat quickly but still requires cooling

## Warranty and Support

### Warranty Terms
- **Hardware only** in warranty protection
- Firmware modifications void warranty
- Open source firmware considered "risky"
- Damage from improper installation not covered

### Support Resources
- Spintend website documentation
- Community forums
- YouTube tutorials
- GitHub resources

## Official Resources

- **Spintend Website**: https://spintend.com/
- **Ubox Collection**: https://spintend.com/collections/esc-based-on-vesc
- **How to Choose Guide**: https://spintend.com/blogs/news/how-to-pick-up-a-vesc-controller-to-mold-scooter
- **Product Pages**:
  - Ubox 100V 100A: https://spintend.com/products/single-ubox-100v-100a-motor-controller-based-on-vesc
  - Ubox 85V 150A: https://spintend.com/collections/esc-based-on-vesc/products/single-ubox-aluminum-controller-85v-150a-based-on-vesc
  - Ubox 85V 250A: https://spintend.com/products/single-ubox-aluminum-controller-85v-250a-v2-based-on-vesc

## Community Resources

- VESC Project Forums
- Electric skateboard communities (esk8.news)
- Electric scooter forums
- E-foil communities
- YouTube tutorials and reviews

## Firmware Compatibility

All Ubox controllers are compatible with official VESC firmware:
- Factory firmware: V6.0, V6.2 (varies by production date)
- Can be updated via VESC Tool
- Default hardware limits enforced
- Using "no limits" firmware voids warranty

## Comparison with Other Brands

| Feature | Spintend Ubox | Flipsky | Makerbase |
|---------|---------------|---------|-----------|
| Price Range | $85-215 | $60-180 | $90-130 |
| IMU | Integrated (most models) | Some models | Some models |
| 12V Ports | Yes (most models) | No | Varies |
| Power Button | Yes (with LED) | Some models | Some models |
| Aluminum PCB | Yes (many models) | Some models | Yes |
| Build Quality | Good | Good | Good |
| Unique Features | LED indicators, ignite port | - | Phase filtering (select models) |

## Known Issues and Considerations

### Common Considerations
1. **Firmware warranty**: Using unlimited firmware voids warranty
2. **Voltage limits**: Strictly enforced - exceeding ratings causes damage
3. **Regen on 100V**: Cannot use regen with fully charged 22S battery
4. **Screw length**: Critical on Ubox 100V (must be <2mm)
5. **Cooling**: Aluminum PCB helps but sustained high current needs airflow

### Model-Specific Issues
- Check specific product page for version differences (V1 vs V2)
- Some models have different 12V current ratings
- Fuse options vary by model
- Bluetooth module optional on most models

## Sources

1. Spintend Official Website - https://spintend.com/
2. Spintend Ubox Product Collection
3. Spintend "How to Choose" Guide
4. Individual product pages (100V 100A, 85V 150A, 85V 250A V2)
5. Community user reports and testing
6. VESC Project Forums - Ubox discussions

**Last Updated**: 2025-05-05

**Trademark Notice**: "VESC" is a registered trademark of Benjamin Vedder. Spintend produces VESC-compatible hardware under their Ubox product line.

**Disclaimer**: This documentation is based on manufacturer specifications and community reports. Firmware warranty warnings and voltage limits should be strictly observed. Always verify current specifications with the seller before purchase.
