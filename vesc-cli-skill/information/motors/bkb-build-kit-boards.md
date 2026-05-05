# Build Kit Boards (BKB) Motors

## Overview

Build Kit Boards (BKB) is a US-based company offering high-quality DIY electric skateboard kits and components. Their motors are specifically designed for their board kits (Tayto, Duo, Voyager) and are known for reliability, ease of installation, and compatibility with both VESC-based and proprietary LingYi ESC systems. BKB motors feature modern connector standards and are optimized for plug-and-play DIY builds.

**Manufacturer:** Build Kit Boards, Inc. (USA)  
**Official Website:** https://buildkitboards.com  
**Primary Applications:** Electric skateboards, longboards, DIY PEV builds

---

## Available Variants

### 6354 Series (Entry/Mid Level)
| Model | kV | Max Power | Max Current | Weight | Features |
|-------|----|-----------|-------------|--------|----------|
| 6354-190KV (Type-R) | 190 | 3000W | 80A | ~700g | Partially sealed |
| 6354-160KV (RailCore) | 160 | 3000W | 80A | ~700g | D-Bore shaft, MR60 |

**Type-R Features:**
- 8mm shaft with 7mm D-Bore (16mm length)
- Partially sealed can for debris protection
- MR60 phase wire connector
- JST-ZH 6-pin sensor connector (2.0mm)
- 30mm & 44mm mounting patterns
- 120° Hall effect sensors
- 15T motor pulley included
- Compatible with Pre-RailCore BKB boards

**RailCore V1.2+ Features:**
- 160kV for better efficiency with 12S batteries
- D-Bore shaft system (no set screws needed)
- Redesigned for RailCore modular system
- 3000W continuous rating

### 6384 Series (High Performance)
| Model | kV | Max Power | Max Current | Weight | Features |
|-------|----|-----------|-------------|--------|----------|
| 6384-190KV (Type-R) | 190 | 4000W | 100A | ~900g | Dual mounting |
| 6384-160KV (RailCore) | 160 | 4000W | 100A | ~900g | 66% more torque |

**Type-R Features:**
- 8mm shaft with 7mm D-Bore (16mm length)
- 25% more power than 6354 motors
- MR60 phase connector
- JST-ZH 6-pin sensor (2.0mm)
- 30mm & 44mm mounting hole patterns
- 120° Hall sensors
- 15T pulley included
- Fits Pre-RailCore Duo/Tayto

**RailCore V1.2+ Features:**
- 160kV optimized for 12S operation
- 4000W per motor (8000W dual)
- 66% more torque than 6354
- D-Bore mounting system
- Extended 236mm trucks recommended

### 6368 Series (Mid-Size Option)
| Model | kV | Max Power | Max Current | Weight |
|-------|----|-----------|-------------|--------|
| 6368-190KV | 190 | 3500W | 90A | ~850g |

**Features:**
- Bridge size between 6354 and 6374
- Good for compact high-power builds

---

## Common Specifications

| Parameter | 6354 | 6368 | 6384 |
|-----------|------|------|------|
| **Motor Type** | Outrunner BLDC | Outrunner BLDC | Outrunner BLDC |
| **Sensor Type** | Hall Effect | Hall Effect | Hall Effect |
| **Pole Count** | 14 | 14 | 14 |
| **Max Voltage** | 12S (50.4V) | 12S (50.4V) | 12S (50.4V) |
| **Shaft Type** | 8mm with D-Bore | 8mm with D-Bore | 8mm with D-Bore |
| **D-Bore Size** | 7mm flat | 7mm flat | 7mm flat |
| **Shaft Length** | 16mm | 16mm | 16mm |
| **Mounting Patterns** | 30mm / 44mm | 30mm / 44mm | 30mm / 44mm |
| **Phase Connector** | MR60 | MR60 | MR60 |
| **Sensor Connector** | JST-ZH 6pin | JST-ZH 6pin | JST-ZH 6pin |
| **Sensor Pitch** | 2.0mm | 2.0mm | 2.0mm |
| **Construction** | Partially sealed | Standard | Standard |
| **IP Rating** | IP54 (partial) | Open | Open |
| **Pulley Included** | 15T Carbon Steel | Varies | 15T Carbon Steel |

---

## RailCore System Integration

### What is RailCore?
RailCore is BKB's modular mounting system introduced in 2023+ that allows:
- Easy component swapping
- Standardized connectors across all parts
- Upgrade paths without full rebuilds
- Compatibility with various battery/ESC combinations

### RailCore Motor Features
1. **D-Bore Shaft System**
   - Eliminates set screws
   - More secure pulley mounting
   - No shaft damage from loose screws
   - 7mm flat on 8mm shaft

2. **Standardized Connectors**
   - MR60 for phase wires (high current capable)
   - JST-ZH 6-pin 2.0mm for sensors
   - Compatible with BKB Xenith ESC

3. **160kV Optimization**
   - Designed for 12S batteries
   - Better efficiency at common e-skate RPMs
   - Higher torque at equivalent speeds
   - Lower current draw for same power

---

## Performance Characteristics

### Power Comparison (Dual Motor Setups)
| Configuration | Continuous Power | Peak Power | Torque | Best For |
|---------------|------------------|------------|--------|----------|
| Dual 6354 | 6000W | 8000W | Standard | Light riders, flat terrain |
| Dual 6384 | 8000W | 10000W | +66% | Heavy riders, hills, speed |

### 6384 Performance vs 6354
- **25% more power** continuous rating
- **66% more torque** at the wheels
- Better hill climbing capability
- Higher top speed potential
- Runs cooler under load
- Heavier (expected tradeoff)

### Real-World Performance (BKB Duo with Dual 6384)
| Metric | Value |
|--------|-------|
| Top Speed | 40+ mph |
| Range | 20-25 miles |
| Hill Climb | 25-30% grades |
| Acceleration | 0-30 mph in ~4 seconds |
| Rider Weight Capacity | 250+ lbs |

---

## Recommended Configurations

### BKB Tayto Kit (Compact)
| Component | Specification |
|-----------|-------------|
| Motors | 2x 6354-190KV (Type-R) or 160KV (RailCore) |
| ESC | BKB Xenith V2 (VESC-based) or LingYi |
| Battery | 10S3P or 12S2P |
| Trucks | Extended 236mm |
| Wheels | 97mm-110mm |
| Gearing | 15T motor / 40T-48T wheel |
| Top Speed | 28-34 mph |
| Best For | Commuting, portability, lighter riders |

### BKB Duo Kit (Performance)
| Component | Specification |
|-----------|-------------|
| Motors | 2x 6384-190KV (Type-R) or 160KV (RailCore) |
| ESC | BKB Xenith V2 (dual VESC-based) |
| Battery | 12S3P or 12S4P |
| Trucks | Extended 236mm |
| Wheels | 97mm-120mm |
| Gearing | 15T motor / 40T wheel |
| Top Speed | 40+ mph |
| Best For | Heavy riders, hills, performance |

### DIY VESC Build
| Component | Specification |
|-----------|-------------|
| Motors | 2x 6384-160KV |
| ESC | Dual FSESC6.6 or VESC6-based |
| Battery | 12S 4P-5P |
| Gearing | 15T/40T |
| Top Speed | ~45 mph |
| Note | Programming cable needed for Xenith |

---

## VESC Configuration

### BKB Xenith ESC Programming
**Important:** BKB Xenith ESCs are pre-configured and should not be flashed with standard VESC firmware unless you understand the implications.

If reprogramming is needed:
1. Contact BKB support for guidance
2. Use BKB-provided firmware/settings
3. Backup original configuration first

### Motor Settings (Typical for 6384-190KV)
```
Motor Type: FOC
Pole Pairs: 7

Current Limits:
  Motor Max: 100A
  Motor Min: -100A  
  Battery Max: 60A per motor
  Battery Min: -20A (regen)

Voltage:
  Min: 8V
  Max: 50.4V (12S)

Sensors:
  Hall Sensor Mode: Enabled
  Sensorless ERPM: 2500
```

### Motor Detection Values
| Parameter | 6354 | 6384 |
|-----------|------|------|
| R (Ω) | ~0.060 | ~0.050 |
| L (μH) | ~55 | ~45 |
| λ (Wb) | ~0.0022 | ~0.0022 |

---

## Connector Pinouts

### MR60 Phase Connector
| Wire | Phase |
|------|-------|
| Yellow | A / U |
| Blue | B / V |
| Green | C / W |

### JST-ZH 6-Pin Sensor
| Pin | Function | Color |
|-----|----------|-------|
| 1 | 5V | Red |
| 2 | Hall A | Yellow |
| 3 | Hall B | Green |
| 4 | Hall C | Blue |
| 5 | Temp | White |
| 6 | GND | Black |

---

## Where to Buy

### Official
- **Build Kit Boards:** https://buildkitboards.com
- **Motor Collection:** https://buildkitboards.com/collections/motors

### Pricing (USD)
| Product | Price |
|---------|-------|
| 6354 Motor (Type-R) | ~$100-120 |
| 6384 Motor (Type-R) | ~$120-140 |
| Tayto Kit (with 6354) | ~$699+ |
| Duo Kit (with 6384) | ~$899+ |
| Extended Trucks + 6384 Upgrade | ~$299 |

### Availability
- Type-R motors for Pre-RailCore boards: Limited stock (discontinuing)
- RailCore motors: Current production
- Kits: In stock with various motor options

---

## Known Issues and Notes

### ESC Compatibility
- **LingYi ESC:** Reliable but less customizable than VESC
- **Xenith V2:** VESC-based, fully programmable
- **Programming:** Requires specific cable for Xenith
- **VESC Migration:** Possible but requires knowledge

### Motor Mounting
- **D-Bore:** New RailCore system eliminates set screw issues
- **Mounting Bolts:** M4 required
- **Patterns:** Dual 30mm/44mm patterns for flexibility

### Maintenance
- **Bearings:** Sealed bearings, minimal maintenance
- **Cleaning:** Wipe down, avoid pressure washing
- **Inspection:** Check D-Bore tightness periodically

---

## Comparison

| Feature | BKB 6384 | Maytech 6374 | Flipsky 6384 | TorqueBoards 6380 |
|---------|----------|--------------|--------------|-------------------|
| Power | 4000W | 3550W | 4000W | 4580W |
| Shaft | D-Bore (RailCore) | Round/Keyed | Round/D | Round/Keyed |
| Connector | MR60 | 4.0/5.5mm | 4.0/5.5mm | MT60 |
| Sensor | JST-ZH 2.0mm | JST 6-pin | JST-ZH 1.5mm | JST-PH 2.0mm |
| Mounting | 30/44mm | 30mm | 30mm | 30mm |
| Designed For | BKB Kits | Universal | Universal | Universal |
| Price Range | Mid | Mid | Low | High |

---

## Sources

### Official BKB
- Motor Collection: https://buildkitboards.com/collections/motors
- 6384 Type-R: https://buildkitboards.com/collections/thanks-for-the-ride-bkb-3/products/6354-6384-motors-type-r-previous-generation-1
- Duo Kit: https://buildkitboards.com/products/electric-longboard
- Tayto Kit: https://buildkitboards.com/products/electric-skateboard

### Community
- Reddit r/BuildKitBoards
- ESK8 Forum BKB threads
- BKB Discord server

---

*Last Updated: May 2026*
