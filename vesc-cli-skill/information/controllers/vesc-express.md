# VESC Express

## Overview

The **VESC Express** is a wireless connectivity and data logging module designed to complement VESC motor controllers. It is not a motor controller itself, but rather a powerful companion device that adds Wi-Fi, Bluetooth, GPS, and extensive logging capabilities to any VESC-based system.

Built around the ESP32-C3 or ESP32-S3 microcontroller, the VESC Express enables wireless configuration, real-time monitoring, data logging to SD card, and high-speed wireless firmware updates. It connects to the VESC via CAN bus, allowing parallel operation with other CAN devices.

The VESC Express represents a significant advancement in VESC ecosystem connectivity, making it easier than ever to configure, monitor, and log data from VESC controllers wirelessly.

## Specifications

| Parameter | Value |
|-----------|-------|
| Microcontroller | ESP32-C3 or ESP32-S3 |
| Wi-Fi | 802.11 b/g/n |
| Bluetooth | BLE (Bluetooth Low Energy) |
| GPS Support | M8030 chipset GNSS module (optional) |
| Storage | Micro SD card slot (SD card not included) |
| Connection to VESC | CAN bus |
| USB | USB-C connector (USB to CAN bridge) |
| Weight | ~4g (without case/cables) |
| Power | Powered via CAN from VESC |

## Features

### Wireless Connectivity
- **High-speed Wi-Fi** connection to VESC devices
- **Bluetooth Low Energy** (BLE) for mobile app connectivity
- **Two Wi-Fi modes**:
  - Access Point mode (creates its own Wi-Fi network)
  - Station mode (connects to existing Wi-Fi network)
- Custom network name and password configuration
- Encryption and PIN code protection for phone app connections

### Data Logging
- **Permanent logging to microSD card**
- High-speed log file extraction via Wi-Fi
- Eliminates need to physically connect to retrieve logs
- Compatible with VESC Tool log viewer

### Firmware Updates
- **Wireless firmware updates** to VESC controllers
- Load new firmware within seconds instead of minutes
- Update multiple VESCs in an array simultaneously

### USB to CAN Bridge
- **USB-C connector** acts as USB to CAN bridge
- Can be routed to external USB port on vehicle
- Provides additional USB access point
- Convenient for vehicles with enclosed VESCs

### GPS Integration
- Support for external **M8030 chipset GNSS module**
- Location tracking and GPS-based logging
- Speed and position data recording
- Optional GPS dongle available

### Configuration
- **Programmable name** (shows up in VESC Tool when scanning)
- Configurable via VESC Tool
- Custom Wi-Fi network settings
- PIN code and encryption settings

## Physical Interface

### Connections
- **CAN bus** connection to VESC (primary interface)
- **USB-C** port for USB to CAN bridging
- **Micro SD card slot** for data storage
- **GPS connector** (for optional GPS module)

### Compatibility
Works with all VESC controllers that have CAN bus support:
- VESC 6 (all variants)
- VESC 75/300
- VESC 100/250
- VESC HD60/HD75
- Third-party VESC compatible controllers with CAN

## Use Cases

### Best For
- **Electric skateboards** - Wireless tuning and logging
- **Electric mountainboards** - Real-time monitoring and data collection
- **Electric bikes** - Performance tracking and diagnostics
- **Electric hydrofoils** - Water-resistant logging solution
- **Robotics** - Wireless control and telemetry
- **Industrial applications** - Remote monitoring and diagnostics
- **Research and development** - Extensive data logging

### Applications
1. **Performance Tuning**: Adjust VESC settings wirelessly via mobile app
2. **Data Analysis**: Log and analyze ride data, motor performance, battery usage
3. **Troubleshooting**: Real-time fault monitoring and diagnostics
4. **Firmware Management**: Easy wireless firmware updates
5. **GPS Tracking**: Track routes, speeds, and locations
6. **Race/Competition**: Professional-grade data logging

## Integration with VESC Tool

The VESC Express integrates seamlessly with VESC Tool:
- Detected automatically when scanning for devices
- Configure Wi-Fi and Bluetooth settings through VESC Tool
- Access logs wirelessly from VESC Tool
- Update VESC Express firmware via VESC Tool

## Setup and Configuration

### Initial Setup
1. Connect VESC Express to VESC via CAN bus cable
2. Power on VESC
3. Scan for devices in VESC Tool
4. Configure Wi-Fi settings (network name, password)
5. Set encryption/PIN if desired
6. Insert microSD card for logging (optional)

### Wi-Fi Modes

**Access Point Mode:**
- VESC Express creates its own Wi-Fi network
- Connect directly from phone/computer
- Default for standalone operation

**Station Mode:**
- VESC Express connects to existing Wi-Fi network
- Useful for home/shop environments
- Enables internet connectivity (if needed)

## Benefits

### Convenience
- No need to open enclosures to access VESC
- Wireless configuration from smartphone
- Quick firmware updates

### Data Management
- Store extensive logs on SD card
- Fast Wi-Fi transfer of large log files
- Real-time data viewing

### Professional Features
- GPS tracking capability
- Professional-grade logging
- Remote diagnostics support

## Known Issues and Limitations

### Considerations
- Requires CAN bus connection to VESC
- MicroSD card not included
- GPS module is optional accessory
- Wi-Fi range limited by environment

### Troubleshooting
- Ensure proper CAN bus wiring (CAN_H, CAN_L)
- Check that VESC has CAN bus enabled
- Verify firmware compatibility
- Format SD card as FAT32 for best compatibility

## Official Resources

- **VESC Project Page**: https://vesc-project.com/node/4139
- **Trampa Manual**: https://trampa.co.uk/vesc-express-manual/
- **GitHub Repository**: https://github.com/vedderb/vesc_express
- **VESC Tool**: https://vesc-project.com/vesc_tool

## Historical Note

The VESC Express was developed to address the need for:
1. Faster firmware updates (USB can be slow for large firmware files)
2. Permanent logging without running out of storage
3. Wireless connectivity for sealed/enclosed installations
4. Professional-grade data collection for racing and development

It represents the evolution of the VESC ecosystem from a simple motor controller to a comprehensive electric vehicle control platform.

## Sources

1. VESC Express GitHub Repository - https://github.com/vedderb/vesc_express
2. Trampa VESC Express Manual - https://trampa.co.uk/vesc-express-manual/
3. VESC Project Forums - https://vesc-project.com/node/4139
4. VESC Express Product Page - Trampa Boards
5. VESC Tool Documentation - https://vesc-project.com/vesc_tool

**Last Updated**: 2025-05-05

**Note**: The VESC Express requires VESC Tool version 3.0 or later for full functionality. Ensure your VESC firmware is up to date for best compatibility.
