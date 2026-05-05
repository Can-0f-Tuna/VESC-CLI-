# Eovan Electric Skateboard Motors

## Overview

Eovan is an electric skateboard brand that has gained recognition for their high-performance boards and quality components. Their 6374 motors are specifically designed for their GTS Carbon Super and other models, offering a balance of power, efficiency, and reliability. While primarily sold as part of complete boards, Eovan motors have become sought after for their quality and integrated design approach.

**Manufacturer:** Eovan (International brand, manufacturing in China)  
**Official Website:** https://www.eovanboard.com  
**Primary Applications:** Electric skateboards (complete builds)

---

## Available Variants

### Eovan 6374-170KV Motors

| Model | kV | Max Power | Voltage | Weight | Features |
|-------|----|-----------|---------|--------|----------|
| Eovan 6374-170KV | 170 | 3500W | 12S (50.4V) | ~900g | Custom port design |

**Key Specifications:**
- Motor Type: Outrunner BLDC, Sensored
- kV Rating: 170 RPM/V
- Max Power: 3500W per motor
- Max Speed: 60+ km/h (dual drive, 12S)
- Voltage: 12S standard (50.4V max)
- Poles: 14 (standard 63mm configuration)
- Shaft: 8mm with D-bore or keyway
- Pulley: 15T motor gear included
- Wire Configuration: Custom Eovan port design
- Wire Gauge: Upgraded for higher current capacity
- Sensor: Hall effect sensors
- Cooling: Optimized for sustained operation
- Waterproof: Yes (suitable for wet conditions)

### Eovan GTS Carbon Super Motor System

| Specification | Value |
|---------------|-------|
| **Motor Configuration** | Dual 6374-170KV |
| **Total Power** | 7000W (2x 3500W) |
| **ESC** | Custom Eovan ESC (VESC-based Gen II) |
| **Battery** | 12S 50.4V |
| **Top Speed** | 50-60 km/h |
| **Range** | 45-65 km |
| **Hill Climb** | 30%+ grades |
| **Drive Type** | Belt drive |
| **Trucks** | Double kingpin |

---

## Common Specifications

| Parameter | Value |
|-----------|-------|
| **Motor Type** | Outrunner, Brushless DC |
| **Sensor Type** | Hall Effect, Sensored |
| **Number of Poles** | 14 |
| **kV Options** | 170KV (standard) |
| **Max Voltage** | 12S (50.4V) |
| **Max Power** | 3500W per motor |
| **Shaft Diameter** | 8mm |
| **Mounting** | Standard 63mm |
| **Motor Pulley** | 15T (included) |
| **Wire Design** | Custom port (unit design) |
| **Waterproof** | Yes |
| **Weight** | ~900g per motor |
| **Length** | Standard 6374 (74mm) |
| **Diameter** | 63mm |

---

## Design Features

### Custom Port Design
Eovan motors feature a proprietary connector system:
- **Unit Design:** Bigger internal wires for higher current capacity
- **Clean Installation:** Easy to install and remove
- **Integrated:** Designed specifically for Eovan ESC compatibility
- **Dust/Water Protection:** Sealed connector design

### 170KV Optimization
The 170KV rating is specifically chosen for:
- **12S Battery Systems:** Optimal speed/torque balance at 50.4V
- **Efficiency:** Good efficiency at typical e-skate RPMs
- **Heat Management:** Lower kV = less heat at given torque
- **Dual Drive:** Good synchronization characteristics

### Heat Dissipation
- **Good Heat Dissipation:** Designed for sustained high-power operation
- **Low Noise:** Optimized for quiet operation
- **Long Service Life:** Quality bearings and construction

---

## Performance Characteristics

### Power Delivery
| Configuration | Power | Use Case |
|---------------|-------|----------|
| Single 6374 | 3500W | Adequate for light riders |
| Dual 6374 | 7000W | Standard performance |
| Peak (brief) | 8000W+ | Acceleration bursts |

### Efficiency
- **Peak Efficiency:** ~88% (typical for quality 6374)
- **Sustained Operation:** Good efficiency at cruise
- **Heat Generation:** Moderate, well-managed

### Noise Level
- **Design Focus:** Low noise operation
- **Hall Sensor Startup:** Smooth, no cogging
- **Belt Drive:** Quieter than gear drives

### Real-World Performance (GTS Carbon Super)
| Metric | Value |
|--------|-------|
| **Top Speed** | 50-60 km/h |
| **0-30 km/h** | ~3-4 seconds |
| **Range** | 45-65 km (depending on mode) |
| **Hill Grade** | 30%+ |
| **Rider Weight** | Up to 120kg supported |

---

## Eovan ESC Integration

### Proprietary ESC (Generation II)
Eovan uses a custom ESC based on VESC architecture:

**Features:**
- VESC-based firmware (modified)
- Remote programmable
- Smart functions integrated
- Designed for Eovan motors
- 12S optimized

**Drive Modes:**
| Mode | Speed | Use Case |
|------|-------|----------|
| L (Low) | 20 km/h | Beginners, learning |
| D (Drive) | 35 km/h | Normal riding |
| S (Sport) | 45 km/h | Fast riding |
| Eovan Race | 50-60 km/h | Maximum performance |

### Important Warning
**⚠️ Do not upgrade to standard VESC firmware on Eovan ESC:**
- Eovan ESC has custom hardware modifications
- Standard VESC firmware may not work correctly
- May damage ESC or motor
- Contact Eovan for technical support

### VESC Compatibility (If Using External VESC)
If using Eovan motors with standard VESC:
```
Motor Type: FOC
Pole Pairs: 7

Current Limits:
  Motor Max: 80A
  Motor Min: -80A
  Battery Max: 60A per motor
  Battery Min: -20A

Voltage:
  Max: 50.4V (12S)

Sensorless ERPM: 2500
Hall Sensors: Enabled
```

---

## Where to Buy

### Official
- **Eovan Website:** https://www.eovanboard.com/collections/motor
- **Price:** $129 per motor (single), $258 for pair

### Availability
- **Individual Motors:** Available as replacement parts
- **Complete Boards:** GTS Carbon Super and other models
- **Spare Parts:** Motor mounts, pulleys, belts

### Related Products
| Product | Price | Description |
|---------|-------|-------------|
| 6374 Motor Single | $129 | Single replacement motor |
| 6374 Motor Pair | $258 | Dual motor set |
| Motor + Extension Cord | $278 | With wiring harness |
| Motor Mount | $45-60 | CNC aluminum mount |

---

## Eovan Board Specifications

### GTS Carbon Super
| Component | Specification |
|-----------|-------------|
| **Deck** | Carbon fiber |
| **Motors** | Dual 6374-170KV |
| **ESC** | Eovan Gen II (VESC-based) |
| **Battery** | 12S 50.4V |
| **Trucks** | Double kingpin |
| **Wheels** | 105mm or 120mm options |
| **Weight** | ~12kg |
| **Top Speed** | 60 km/h |
| **Range** | 45-65 km |
| **Price** | $1500-2000 (complete) |

---

## Known Characteristics

### Advantages
- ✅ Purpose-designed for Eovan systems
- ✅ Quality construction
- ✅ Good heat management
- ✅ 170KV well-matched to 12S
- ✅ Custom connector (clean install)
- ✅ Waterproof

### Considerations
- ⚠️ Custom connector requires adapter for standard VESC
- ⚠️ 170KV may be too low for 10S builds
- ⚠️ Primarily available through Eovan
- ⚠️ Designed for belt drive (not direct drive)

---

## Comparison with Other 6374 Motors

| Feature | Eovan 6374 | Maytech 6374 | Flipsky 6374 | TorqueBoards 6374 |
|---------|------------|--------------|--------------|-------------------|
| kV | 170 | 170/190 | 140/170/190 | 170/190 |
| Power | 3500W | 3550W | 3250-3500W | 3500W |
| Connector | Custom | 4.0/5.5mm bullets | 4.0/5.5mm bullets | MT60 |
| Waterproof | Yes | Yes (C versions) | No (standard) | No |
| Shaft | 8mm | 8/10mm | 8/10mm | 8mm |
| Price | $129 | $80-100 | $99-113 | $164 |
| Availability | Eovan only | Wide | Wide | DIYEB only |
| VESC Ready | With adapter | Yes | Yes | Yes |

---

## Sources

### Official
- Eovan Motors: https://www.eovanboard.com/collections/motor/products/electric-skateboard-6374-motors-170kv-powerful-belt-drive
- GTS Carbon Super: https://www.eovanboard.com/products/eovan-gts-carbon-super

### Reviews
- Eovan website reviews
- YouTube Eovan board reviews
- Reddit r/ElectricSkateboard user experiences

---

## Summary

Eovan 6374-170KV motors are quality components specifically designed for the Eovan ecosystem. They offer:
- **Integrated Design:** Works seamlessly with Eovan ESCs
- **Good Performance:** 3500W per motor is competitive
- **170KV Rating:** Optimal for 12S systems
- **Waterproofing:** Suitable for wet conditions

**Best For:**
- Eovan board owners needing replacement motors
- Builders wanting matched motor/ESC systems
- 12S battery builds
- Riders prioritizing integrated design

**Not Ideal For:**
- 10S or lower voltage builds (kV too low)
- Builders wanting standard connectors
- Budget builds

*Last Updated: May 2026*
