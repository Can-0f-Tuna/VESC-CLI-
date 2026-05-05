# Battery Configurations for VESC Projects

## Overview

This guide documents common battery pack configurations for VESC-based electric vehicles. Each configuration balances voltage, capacity, current capability, and physical size for different applications.

---

## Configuration Naming (S and P)

**Series (S):** Cells connected end-to-end, voltage adds up
- Increases voltage
- All cells carry same current
- One weak cell affects entire string

**Parallel (P):** Cells connected side-by-side, capacity adds up
- Increases capacity (Ah)
- Current splits between parallel cells
- Cells balance each other

**S-P Configuration Example: 10S4P**
- 10 cells in series: 37V nominal (10 × 3.6V)
- 4 parallel groups: 4× capacity
- Total cells: 10 × 4 = 40 cells

---

## Common Configurations

### 6S Configuration

**Voltage Profile:**
- Nominal: 22.2V (6 × 3.7V)
- Max: 25.2V (6 × 4.2V)
- Cutoff: 18.0V (6 × 3.0V)

**Typical Setups:**

| P-Count | Capacity (3000mAh) | Energy | Current (15A cells) | Application |
|---------|-------------------|--------|---------------------|-------------|
| 2P | 6Ah | 133Wh | 30A | Mini boards |
| 3P | 9Ah | 200Wh | 45A | Small commuters |
| 4P | 12Ah | 266Wh | 60A | Medium boards |

**VESC Compatibility:**
- Low ERPM capability
- Requires high KV motors (260-300KV) for speed
- Good for compact builds
- Limited top speed potential

**Recommended For:**
- Small/lightweight electric skateboards
- Compact e-scooters
- First-time builders
- Budget builds

**VESC Settings:**
```
Battery Voltage Cutoff Start: 19.8V (3.3V × 6)
Battery Voltage Cutoff End: 18.0V (3.0V × 6)
Max Battery Current: Depends on P-count × cell rating
```

**Motor KV Recommendations:**
- 260KV-300KV for 70-90mm wheels
- Provides 25-30 km/h top speed
- Good torque with proper gearing

---

### 10S Configuration

**Voltage Profile:**
- Nominal: 37.0V (10 × 3.7V)
- Max: 42.0V (10 × 4.2V)
- Cutoff: 30.0V (10 × 3.0V)

**The Standard for E-Skateboard Applications**

**Typical Setups:**

| P-Count | Capacity (3000mAh) | Energy | Current (15A cells) | Weight* | Application |
|---------|-------------------|--------|---------------------|---------|-------------|
| 2P | 6Ah | 222Wh | 30A | ~1.0kg | Ultra-compact |
| 3P | 9Ah | 333Wh | 45A | ~1.5kg | Compact commuter |
| 4P | 12Ah | 444Wh | 60A | ~2.0kg | Standard build |
| 5P | 15Ah | 555Wh | 75A | ~2.5kg | Extended range |

*Approximate cell weight only (add BMS, enclosure, wiring)

**VESC Compatibility:**
- Safe for all VESC hardware versions
- Moderate ERPM with 190KV motors
- Good balance of speed and torque
- Most widely tested configuration

**Cell Selection Guide:**
| P-Count | Best Cell Options | Max Pack Current |
|---------|-----------------|------------------|
| 2P | 25R, VTC5A, P26A | 40-50A |
| 3P | 30Q, HG2, VTC6 | 45-60A |
| 4P | 30Q, HG2, VTC6 | 60-80A |
| 5P+ | 30Q, GA | 75A+ |

**Motor KV Recommendations:**
- 170KV-190KV for 90-110mm wheels
- Provides 35-45 km/h top speed
- Excellent torque and efficiency
- Compatible with most VESCs

**Real-World Examples:**
- **Commuter Board (10S3P 30Q):**
  - 333Wh capacity
  - ~20-25km range
  - 45A continuous capability
  - Perfect for daily commuting

- **Performance Board (10S4P 30Q):**
  - 444Wh capacity
  - ~25-35km range
  - 60A continuous capability
  - Hill climbing, aggressive riding

**VESC Settings:**
```
Battery Cells Series: 10
Battery Capacity: [Ah based on P-count]
Battery Voltage Cutoff Start: 33.0V (3.3V × 10)
Battery Voltage Cutoff End: 30.0V (3.0V × 10)
Motor Current Max: [Based on motor capability]
Motor Current Brake: [-based on preference]
Battery Current Max: [P-count × cell rating × 0.8]
Battery Current Regen Max: -[P-count × 4A]
```

**Advantages:**
- Safe voltage for all VESC hardware
- Excellent motor and speed controller compatibility
- Proven reliable configuration
- Good range-to-weight ratio
- Well-documented in community

---

### 12S Configuration

**Voltage Profile:**
- Nominal: 44.4V (12 × 3.7V)
- Max: 50.4V (12 × 4.2V)
- Cutoff: 36.0V (12 × 3.0V)

**The Modern High-Performance Standard**

**Typical Setups:**

| P-Count | Capacity (21700 4000mAh) | Energy | Current (35A cells) | Application |
|---------|------------------------|--------|---------------------|-------------|
| 2P | 8Ah | 355Wh | 70A | Compact high-power |
| 3P | 12Ah | 533Wh | 105A | Performance build |
| 4P | 16Ah | 710Wh | 140A | Extreme performance |

**Using 18650 Cells:**
| P-Count | Capacity (3000mAh) | Energy | Current (15A) | Notes |
|---------|-------------------|--------|---------------|-------|
| 4P | 12Ah | 533Wh | 60A | High P-count needed |
| 5P | 15Ah | 666Wh | 75A | Good for 30Q |

**VESC Compatibility:**
- **V4 Hardware:** Check ERPM limits with motor KV
- **V6 Hardware:** Fully compatible
- **ERPM Calculation:** 50.4V × Motor KV × (Pole Pairs/2)

**Motor KV Recommendations:**
- **For V4 (60k ERPM limit):** Use 140-170KV motors
- **For V6 (150k ERPM limit):** Use 170-190KV motors
- Lower KV provides more torque
- Higher KV provides more speed (within ERPM limits)

**Cell Selection for 12S:**
| Goal | Recommended Cell | Configuration |
|------|-----------------|---------------|
| Maximum power | Molicel P42A | 12S2P or 12S3P |
| Balanced | Samsung 40T | 12S2P or 12S3P |
| Maximum range | LG M50LT | 12S3P or 12S4P |
| Budget power | Samsung 25R | 12S4P or 12S5P |

**Advantages:**
- Higher voltage = more power at same current
- Reduced voltage sag under load
- Better efficiency at high speeds
- Modern standard for performance builds
- More compact for given power vs. lower voltage

**Considerations:**
- Must respect VESC ERPM limits
- Some older V4 hardware may need lower KV motors
- Higher voltage requires careful BMS selection
- More cells = higher pack cost

**Real-World Example (12S3P 40T):**
- 533Wh capacity
- 105A continuous capability
- ~35-45km range
- Excellent hill climbing
- Dual 6374 170KV motors

---

### 14S Configuration

**Voltage Profile:**
- Nominal: 51.8V (14 × 3.7V)
- Max: 58.8V (14 × 4.2V)
- Cutoff: 42.0V (14 × 3.0V)

**E-Bike Standard Voltage**

**Typical Setups:**

| P-Count | Capacity (5000mAh) | Energy | Current (10A cells) | Application |
|---------|-------------------|--------|---------------------|-------------|
| 4P | 20Ah | 1036Wh | 40A | Standard e-bike |
| 5P | 25Ah | 1295Wh | 50A | Extended range |
| 6P | 30Ah | 1554Wh | 60A | Cargo/tandem |

**Using 21700 Cells:**
| P-Count | Capacity (4800mAh) | Energy | Current | Application |
|---------|-------------------|--------|---------|-------------|
| 3P | 14.4Ah | 746Wh | 43A (M50LT) | Performance e-bike |
| 4P | 19.2Ah | 995Wh | 57A | Long-range e-bike |

**VESC Compatibility:**
- Check VESC voltage rating (many max at 60V)
- 14S fully charged = 58.8V (margin close to 60V limit)
- Some VESCs may need 13S instead for safety margin

**Motor KV Recommendations:**
- **For e-bike hub motors:** 8-15KV typical
- **For mid-drive systems:** Match to system voltage
- Lower KV preferred for torque

**Cell Selection:**
| Application | Recommended Cell | Configuration |
|-------------|-----------------|---------------|
| Maximum range | LG M50LT, Samsung 50E | 14S4P-6P |
| Power + range | Samsung 40T | 14S3P-4P |
| Budget option | LG MJ1, Samsung 35E | 14S5P-6P |

**Advantages:**
- Standard e-bike voltage
- Excellent efficiency
- Long range capability
- Compatible with e-bike chargers
- Good for cargo/utility builds

**Considerations:**
- Must verify VESC voltage limits
- Higher voltage BMS required
- Larger charger needed (58.8V max)
- May need voltage regulation for accessories

---

### 20S Configuration

**Voltage Profile:**
- Nominal: 74.0V (20 × 3.7V)
- Max: 84.0V (20 × 4.2V)
- Cutoff: 60.0V (20 × 3.0V)

**High-Power E-Bike / Electric Motorcycle**

**Typical Setups:**

| P-Count | Capacity | Energy | Application |
|---------|----------|--------|-------------|
| 2P (21700) | ~10Ah | 740Wh | Compact high-power |
| 3P (21700) | ~15Ah | 1110Wh | Performance build |
| 4P (21700) | ~20Ah | 1480Wh | Long-range high-power |

**VESC Compatibility:**
- **WARNING:** Most VESCs max at 60V!
- Requires specialized high-voltage VESC or controller
- Not for standard e-skateboard VESCs
- Used in: Electric motorcycles, high-power e-bikes

**Cell Selection:**
- High-power cells essential (40T, P42A)
- Quality matching critical
- Professional BMS mandatory

**Safety Considerations:**
- High voltage danger (80V+)
- Requires proper insulation
- Professional installation recommended
- Specialized chargers required

---

## Configuration Selection Guide

### By Application

| Application | Recommended Config | Why |
|-------------|---------------------|-----|
| First build | 10S3P or 10S4P | Proven, safe, good support |
| Compact commuter | 10S2P or 12S2P | Small size, adequate range |
| Long-range cruiser | 10S5P or 12S4P | Maximum Wh, good current |
| High-performance | 12S3P 21700 | Best power-to-weight |
| All-terrain/off-road | 12S3P-4P | High current, good range |
| E-bike | 14S4P-6P | Standard voltage, long range |
| E-motorcycle | 20S3P+ | High voltage, massive power |

### By Rider Weight

| Rider Weight | Recommended Minimum |
|--------------|---------------------|
| <60kg (130lb) | 10S3P or 6S4P |
| 60-80kg (130-175lb) | 10S3P-4P or 12S2P-3P |
| 80-100kg (175-220lb) | 10S4P or 12S3P |
| >100kg (220lb+) | 12S3P-4P or 10S5P |

### By Terrain

| Terrain | Recommended |
|---------|-------------|
| Flat only | 10S3P adequate |
| Moderate hills | 10S4P or 12S3P |
| Steep hills | 12S3P-4P with high-discharge cells |
| Mountains | 12S4P+ with P42A or 40T |

---

## Voltage vs. Performance

### Power Delivery

Power (Watts) = Voltage × Current

**Example:**
- 10S at 40A: 37V × 40A = 1480W
- 12S at 40A: 44.4V × 40A = 1776W (+20% more power at same current)

**Implications:**
- Higher voltage = more power for same current
- Less current stress on cells at higher voltage
- Reduced voltage sag under load

### Speed and ERPM

ERPM = Voltage × Motor KV × (Pole Pairs)

**10S with 190KV (7 pole pairs):**
- 42V × 190 × 7 = 55,860 ERPM (safe for V4)

**12S with 190KV:**
- 50.4V × 190 × 7 = 67,032 ERPM (exceeds V4 60k limit)

**Solution for 12S on V4:**
- Use 170KV motors: 50.4 × 170 × 7 = 59,976 ERPM (safe)
- Or use V6 hardware with 150k ERPM limit

---

## Physical Pack Design

### Cell Arrangement Patterns

**Standard Brick Layout:**
```
10S4P (40 cells) - Common arrangements:

Option 1: 10 long × 4 wide
[ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]  <- 10 series
[ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]

Option 2: 5 × 8 (compact)
[ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ]
```

**Flexible Pack Design:**
- Split into 2 × 5S for easier fitting
- Staggered layouts for curved decks
- Consider BMS placement and wiring

### Space Requirements

**Approximate Pack Dimensions (18650):**

| Config | Dimensions (L×W×H) | Notes |
|--------|-------------------|-------|
| 10S3P | 180×55×18mm | Very compact |
| 10S4P | 180×73×18mm | Standard |
| 10S5P | 180×91×18mm | Extended range |
| 12S3P | 216×55×18mm | Longer pack |
| 12S4P | 216×73×18mm | Large pack |

**21700 Cells (larger):**
| Config | Dimensions (L×W×H) | Notes |
|--------|-------------------|-------|
| 12S2P | 220×44×21mm | Compact power |
| 12S3P | 220×66×21mm | Standard 21700 |

### Wiring Considerations

**Series Connections:**
- Use appropriate gauge wire (12-14AWG for main leads)
- Keep series paths balanced in length
- Nickel strip or wire depending on current

**Parallel Connections:**
- All parallel cells must be same type/age/capacity
- Connect at multiple points for current distribution
- Balance leads to each parallel group

**BMS Placement:**
- Keep BMS close to cells (short sense wires)
- Allow airflow for BMS cooling
- Protect from moisture and vibration

---

## BMS Requirements by Configuration

### Current Ratings

| Config | Min BMS Current | Recommended | Notes |
|--------|----------------|-------------|-------|
| 6S2P-3P | 30A | 40-60A | Light duty |
| 10S2P-3P | 40A | 60-80A | Standard |
| 10S4P | 60A | 80-100A | Performance |
| 12S2P | 50A | 60-80A | High power |
| 12S3P-4P | 80A | 100A+ | Extreme |
| 14S+ | 40A+ | Match pack | E-bike specific |

### Voltage Ratings

| Config | Max Voltage | BMS Voltage Rating |
|--------|-------------|-------------------|
| 6S | 25.2V | 30V |
| 10S | 42.0V | 50V |
| 12S | 50.4V | 60V |
| 14S | 58.8V | 70V |
| 20S | 84.0V | 100V |

---

## Charger Selection

### Voltage Requirements

| Config | Max Voltage | Charger Voltage |
|--------|-------------|-----------------|
| 6S | 25.2V | 25.2V LiPo/Li-ion |
| 10S | 42.0V | 42.0V Li-ion |
| 12S | 50.4V | 50.4V Li-ion |
| 14S | 58.8V | 58.8V (or 58.4V) |
| 20S | 84.0V | 84V or 100V programmable |

### Current Ratings

**Standard Charge (0.5C):**
| Pack Capacity | Charge Current | Charge Time |
|--------------|----------------|-------------|
| 6Ah | 3A | ~3 hours |
| 10Ah | 5A | ~3 hours |
| 15Ah | 7.5A | ~3 hours |
| 20Ah | 10A | ~3 hours |

**Fast Charge (1C):**
- Half the charge time
- Reduces cell lifespan slightly
- Ensure cells support 1C charging

---

## Configuration Quick Reference

### Voltage Table
| S-Count | Nominal | Full | Cutoff | VESC Safe? |
|---------|---------|------|--------|------------|
| 6S | 22.2V | 25.2V | 18.0V | Yes |
| 10S | 37.0V | 42.0V | 30.0V | Yes |
| 12S | 44.4V | 50.4V | 36.0V | V6: Yes, V4: Check |
| 13S | 48.1V | 54.6V | 39.0V | V6 only |
| 14S | 51.8V | 58.8V | 42.0V | HV only |
| 20S | 74.0V | 84.0V | 60.0V | HV only |

### Energy Comparison (3P with 3000mAh cells)
| Config | Voltage | Capacity | Energy |
|--------|---------|----------|--------|
| 6S3P | 22.2V | 9Ah | 200Wh |
| 10S3P | 37.0V | 9Ah | 333Wh |
| 12S3P | 44.4V | 9Ah | 400Wh |
| 14S3P | 51.8V | 9Ah | 466Wh |

---

## Real-World Build Examples

### Example 1: Budget Commuter
**10S3P Samsung 30Q**
- Cells: 30 × 30Q
- Energy: 333Wh
- Weight: ~1.5kg complete
- Current: 45A continuous
- Range: 20-25km
- Cost: ~$150-200 (cells only)
- **Best for:** Daily commuting, light riders

### Example 2: Performance Board
**12S3P Samsung 40T (21700)**
- Cells: 36 × 40T
- Energy: 533Wh
- Weight: ~2.5kg complete
- Current: 105A continuous
- Range: 35-45km
- Cost: ~$250-300 (cells only)
- **Best for:** Aggressive riding, hills, heavy riders

### Example 3: Maximum Range
**10S5P Panasonic NCR18650GA**
- Cells: 50 × GA
- Energy: 740Wh
- Weight: ~2.5kg
- Current: 50A continuous (conservative)
- Range: 45-60km
- Cost: ~$200-250 (cells only)
- **Best for:** Long distance, flat terrain, efficiency

### Example 4: Compact Power
**12S2P Molicel P42A**
- Cells: 24 × P42A
- Energy: 373Wh
- Weight: ~1.7kg
- Current: 90A continuous
- Range: 20-30km
- Cost: ~$170-200 (cells only)
- **Best for:** Short board, high power, light weight

---

## Sources and References

### Technical Resources
- **Battery University:** https://batteryuniversity.com
- **VESC Project Calculators:** https://vesc-project.com/calculators
- **ESK8 Forum:** https://forum.esk8.news

### Community Build Threads
- "Optimal Configurations Thread" - ESK8 News
- "Battery Builds" section - Endless Sphere
- "VESC Settings Guide" - Various forums

### Manufacturer Data
- Samsung SDI datasheets
- LG Chem specifications
- VESC hardware documentation

---

*Document Version: 1.0*
*Last Updated: May 2026*
*Configurations Covered: 6S, 10S, 12S, 14S, 20S*
