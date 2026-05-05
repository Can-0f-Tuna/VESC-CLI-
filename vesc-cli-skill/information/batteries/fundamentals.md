# Battery Fundamentals for VESC Projects

## Overview

This guide covers essential battery knowledge for VESC-based electric vehicle projects. Understanding these fundamentals is critical for safe operation, optimal performance, and maximizing battery lifespan.

---

## Battery Chemistry Types

### LiPo (Lithium Polymer)

**Characteristics:**
- Nominal voltage: 3.7V per cell (3.6V for some chemistries)
- Maximum voltage: 4.2V per cell
- Cutoff voltage: 3.0-3.2V per cell (recommended)
- Energy density: 150-200 Wh/kg
- Discharge rates: Very high (up to 100C+ for RC packs)
- Cycle life: 300-500 cycles

**Pros:**
- Extremely high discharge rates (burst power)
- Lightweight and compact
- No memory effect
- Low self-discharge rate

**Cons:**
- Shorter cycle life compared to cylindrical cells
- Fire risk if physically damaged or overcharged
- Requires careful handling and charging protocols
- Voltage sag under heavy load
- Sensitive to over-discharge

**Best for:** RC vehicles, drones, applications requiring burst power and lightweight solutions

**Safety Notes:**
- Never puncture or crush
- Use fire-resistant charging bags
- Never leave charging unattended
- Store at 3.75-3.85V per cell (storage voltage)

---

### Li-ion 18650/21700 (Cylindrical Cells)

**Characteristics:**
- Nominal voltage: 3.6V per cell (some 3.7V)
- Maximum voltage: 4.2V per cell
- Cutoff voltage: 2.5-3.0V per cell
- Energy density: 200-260 Wh/kg (varies by chemistry)
- Discharge rates: 5C to 25C (depending on cell type)
- Cycle life: 500-2000+ cycles

**Cell Chemistry Variants:**

| Chemistry | Nominal V | Energy Density | Discharge | Cycle Life | Safety |
|-----------|-----------|----------------|-----------|------------|--------|
| NCA (Li-cobalt) | 3.6V | 200-260 Wh/kg | Moderate | 500-1000 | Good |
| NMC | 3.6-3.7V | 150-220 Wh/kg | High | 1000-2000 | Good |
| LCO | 3.6V | 150-200 Wh/kg | Low | 500-1000 | Moderate |

**Pros:**
- Long cycle life (especially high-quality cells)
- High energy density
- Safer than LiPo when properly managed
- Standardized form factors (18650, 21700)
- Wide availability and established supply chain

**Cons:**
- Lower continuous discharge than LiPo for same size
- Requires BMS for multi-cell packs
- Heavier than LiPo for equivalent power
- Physical protection needed (shock/vibration)

**Best for:** Electric skateboards, e-bikes, power tools, applications needing balance of energy and power

---

### LiFePO4 (Lithium Iron Phosphate)

**Characteristics:**
- Nominal voltage: 3.2V per cell
- Maximum voltage: 3.65V per cell
- Cutoff voltage: 2.5V per cell
- Energy density: 90-120 Wh/kg
- Discharge rates: 1C to 25C continuous
- Cycle life: 2000+ cycles
- Thermal runaway temperature: 270°C (518°F)

**Pros:**
- Excellent thermal stability (safest Li-ion chemistry)
- Extremely long cycle life (2000+ cycles)
- Very high continuous discharge rates possible
- Tolerant to full charge conditions
- Can handle high temperatures better
- Very flat discharge curve

**Cons:**
- Lower energy density (heavier for same capacity)
- Lower nominal voltage (affects pack voltage calculations)
- Higher self-discharge than other Li-ion types
- More expensive per kWh

**Best for:** E-bikes, electric vehicles, stationary storage, applications prioritizing safety and longevity over weight

**Important:** With 4 cells in series (4S), full charge voltage is 14.4V (3.6V × 4), which is perfect for 12V lead-acid replacement.

---

### Solid State (Emerging Technology)

**Current Status:** Limited commercial availability, primarily in development/testing phase

**Expected Characteristics:**
- Higher energy density (theoretical 300+ Wh/kg)
- Improved safety (non-flammable electrolyte)
- Wider temperature operating range
- Faster charging capability
- Longer cycle life

**Challenges:**
- High manufacturing costs
- Limited production scale
- Unproven long-term reliability
- Interface resistance issues

---

## Key Concepts

### Nominal vs. Maximum Voltage

Understanding the difference between nominal and maximum voltage is critical for pack design:

| Cells in Series | Nominal Voltage | Max Voltage (4.2V/cell) | Cutoff Voltage |
|-----------------|-----------------|------------------------|----------------|
| 1S | 3.6V | 4.2V | 3.0V |
| 3S | 10.8V | 12.6V | 9.0V |
| 6S | 22.2V | 25.2V | 18.0V |
| 10S | 37.0V | 42.0V | 30.0V |
| 12S | 44.4V | 50.4V | 36.0V |
| 14S | 51.8V | 58.8V | 42.0V |
| 20S | 74.0V | 84.0V | 60.0V |

**Critical for VESC:** Always configure VESC with correct cell count and voltage limits. Never exceed VESC maximum voltage rating (typically 60V for most VESCs).

---

### C-Rating and Discharge Rates

The "C" rating represents the discharge current relative to capacity:

**Formula:**
```
Maximum Current (A) = Capacity (Ah) × C-Rating
```

**Examples:**
- 3000mAh (3Ah) cell at 10C = 30A maximum discharge
- 4000mAh (4Ah) cell at 20C = 80A maximum discharge
- 5000mAh (5Ah) cell at 30C = 150A maximum discharge

**Important Considerations:**
- **Continuous vs. Burst:** Continuous rating is sustainable; burst is typically 10-30 seconds
- **Derating:** Real-world performance is often 70-80% of rated C
- **Temperature:** Higher discharge rates increase cell temperature
- **Cycle life:** Higher discharge rates reduce cycle life

**VESC Application:** Calculate required C-rating based on motor current draw:
```
Required Battery Current = Motor Current × Duty Cycle
For dual motors: Required Battery Current = (Motor1 + Motor2) × Duty Cycle
```

---

### Capacity (Ah) vs Energy (Wh)

**Amp-hours (Ah):** Measures charge capacity (current × time)
**Watt-hours (Wh):** Measures energy capacity (voltage × Ah)

**Example Calculations:**
- 10S4P pack with 3000mAh cells:
  - Capacity: 4 × 3000mAh = 12,000mAh (12Ah)
  - Energy: 12Ah × 37V (nominal) = 444Wh

**Why Wh Matters:**
- Runtime depends on energy (Wh), not just capacity (Ah)
- Higher voltage packs store more energy for same Ah
- Electric vehicles typically specify range based on Wh consumption (Wh/km or Wh/mile)

---

### Series (S) and Parallel (P) Configurations

**Series Configuration (S):**
- Increases voltage
- Capacity (Ah) stays the same
- All cells carry same current
- One weak cell affects entire pack

**Parallel Configuration (P):**
- Increases capacity (Ah)
- Voltage stays the same
- Current splits between parallel cells
- Cells balance each other

**Combined S-P Configuration:**

**Example: 10S4P**
- 10 cells in series: 37V nominal
- 4 parallel groups: 4× capacity
- Total cells: 40 cells

**Current Calculation:**
```
Pack Current = Cell Current × P-count
For 10S4P with 20A cells: Max pack current = 20A × 4 = 80A continuous
```

**Voltage Calculation:**
```
Nominal Voltage = 3.6V × S-count
Max Voltage = 4.2V × S-count
Cutoff Voltage = 3.0V × S-count
```

---

### Internal Resistance (IR)

**Definition:** Opposition to current flow within the cell, measured in milliohms (mΩ)

**Typical Values:**
- High-drain 18650: 12-20mΩ
- High-capacity 18650: 20-35mΩ
- 21700 cells: 10-15mΩ

**Impact:**
- **Voltage Sag:** Higher IR = more voltage drop under load
- **Heat:** Power lost as heat = I² × R
- **Efficiency:** Lower IR = better efficiency

**Measuring IR:**
- AC impedance at 1kHz (manufacturer spec)
- DC IR calculation: (Voltage_no_load - Voltage_under_load) / Current

**Temperature Effect:** IR increases as temperature decreases

---

### Cycle Life

**Definition:** Number of charge/discharge cycles before capacity drops to specified percentage (typically 70-80%)

**Factors Affecting Cycle Life:**

1. **Depth of Discharge (DoD):**
   - 100% DoD → ~300-500 cycles
   - 80% DoD → ~600-1000 cycles
   - 50% DoD → ~1500-3000 cycles

2. **Charge Voltage:**
   - 4.20V/cell → Standard cycles
   - 4.10V/cell → ~2× cycle life
   - 4.00V/cell → ~3× cycle life

3. **Temperature:**
   - High temperature accelerates degradation
   - Above 30°C (86°F) reduces life
   - Above 45°C (113°F) significantly reduces life

4. **Discharge Rate:**
   - Higher rates = more heat = shorter life
   - Continuous high-rate discharge doubles wear

**Battery University Formula:**
> Every 0.10V drop below 4.20V/cell roughly doubles the cycle life, but reduces usable capacity by ~10%.

---

### Depth of Discharge (DoD) and State of Charge (SoC)

**Depth of Discharge:** Percentage of capacity used during discharge
- 100% DoD = fully discharged (3.0V/cell)
- 80% DoD = 20% remaining
- 50% DoD = 50% remaining (best for longevity)

**State of Charge:** Current charge level as percentage
- 100% SoC = 4.2V/cell
- 80% SoC ≈ 4.0V/cell
- 50% SoC ≈ 3.75-3.8V/cell
- 20% SoC ≈ 3.5V/cell
- 0% SoC = 3.0V/cell (cutoff)

**Voltage vs. SoC (Li-ion NMC/NCA):**
| Voltage | Approx. SoC | Notes |
|---------|-------------|-------|
| 4.20V | 100% | Full charge |
| 4.10V | 90% | Good storage voltage |
| 4.00V | 80% | Extended cycle life |
| 3.80V | 60% | Optimal storage |
| 3.60V | 40% | Nominal voltage |
| 3.40V | 20% | Low charge |
| 3.00V | 0% | Cutoff (empty) |

**Important:** The discharge curve is non-linear. Most energy is delivered between 4.0V and 3.5V.

---

## Charging

### CC/CV (Constant Current/Constant Voltage) Method

**Stage 1 - Constant Current (CC):**
- Current: 0.5C to 1C (typically)
- Voltage: Rising from current level to 4.2V/cell
- Duration: ~70% of charge time
- Delivers ~80% of capacity

**Stage 2 - Constant Voltage (CV):**
- Voltage: Fixed at 4.2V/cell
- Current: Tapering down
- Ends when current reaches 0.05C (or 0.1C)
- Delivers final ~20% of capacity

**Stage 3 - Termination:**
- Charge complete
- No trickle charge for Li-ion
- Float charge NOT recommended

**Charge Time Calculation:**
```
Time ≈ (Capacity / Charge Current) × 1.4 (factor for CV stage)
Example: 3000mAh at 1.5A (0.5C) = (3Ah / 1.5A) × 1.4 = 2.8 hours
```

### Charge Rates

**Standard Charge:** 0.5C (conservative, extends life)
**Fast Charge:** 1C (moderate stress)
**Maximum Charge:** 2C+ (check cell specifications, reduces life)

**Safety Limits:**
- Never charge below 0°C (32°F) for standard Li-ion
- Some cells allow charging to -10°C with reduced current
- Never exceed 4.25V/cell

**Temperature Monitoring:**
- Optimal: 10°C to 30°C
- Acceptable: 0°C to 45°C
- Above 50°C: Stop charging, allow to cool

---

## Safety Considerations

### Charging Safety
- Use quality chargers with proper CC/CV profiles
- Never leave charging unattended
- Charge in fire-resistant container or area
- Monitor cell temperatures
- Ensure proper ventilation
- Use correct voltage settings for your cell count

### Discharge Limits
- Never discharge below 3.0V/cell (2.5V absolute minimum)
- Monitor voltage under load (sag can take cells below cutoff)
- Implement VESC voltage cutoffs in software
- Temperature cutoffs: Stop discharge if cells exceed 60°C

### Temperature Ranges

**Charging:**
- Standard Li-ion: 0°C to 45°C
- Some cells: -10°C to 45°C (with reduced current)

**Discharging:**
- Standard: -20°C to 60°C
- Optimal: 10°C to 40°C
- Note: Performance degrades below 0°C

**Storage:**
- Short term (weeks): -10°C to 45°C
- Long term (months): 0°C to 25°C

### Storage Guidelines
- Store at 3.75-3.85V per cell (50-60% SoC)
- Cool, dry location
- Away from flammable materials
- Check voltage every 3 months
- Never store fully charged or fully depleted

### Failure Modes

**Thermal Runaway:**
- Uncontrolled self-heating reaction
- Triggered by: overcharge, overheat, internal short, physical damage
- Results in: gas venting, fire, potential explosion
- Cannot be stopped once initiated

**Prevention:**
- Use quality BMS
- Proper charging protocols
- Temperature monitoring
- Physical protection
- Quality cells from reputable manufacturers

---

## VESC Configuration Guidelines

### Voltage Settings

**Battery Voltage Cutoff:**
```
Cutoff Start: (3.3V × S-count)  # Begin reducing power
Cutoff End: (3.0V × S-count)    # Stop completely

Example for 10S:
Cutoff Start: 33V
Cutoff End: 30V
```

### Current Calculations

**Battery Current:**
```
Battery Current = Motor Current × Duty Cycle
Duty Cycle = Actual Voltage / Battery Voltage

Example:
Motor Current: 50A
Battery: 42V (10S full)
Actual voltage under load: 38V
Duty Cycle: 38/42 = 0.90
Battery Current: 50A × 0.90 = 45A
```

**Regen Current:**
- Limited by cell charge rate (typically 0.5C to 1C)
- Calculate based on P-count: Max Regen = Cell Max Charge × P-count
- Example: 10S4P with 4A charge cells: Max regen = 4A × 4 = 16A

---

## Sources and References

### Primary Technical Sources
1. **Battery University** - https://batteryuniversity.com
   - BU-205: Types of Lithium-ion
   - BU-409: Charging Lithium-ion
   - BU-501a: Discharge Characteristics
   - BU-808: How to Prolong Lithium-based Batteries
   - BU-216: Summary Table of Lithium-based Batteries

### Manufacturer Datasheets
- Samsung SDI: INR18650-30Q, INR18650-25R, INR21700-40T
- LG Chem: INR18650-HG2, INR21700-M50LT
- Molicel: INR-18650-P26A, INR-21700-P42A
- Panasonic: NCR18650GA
- Sony/Murata: US18650VTC5A, US18650VTC6

### Safety Resources
- NFPA: Lithium-Ion Battery Safety Guidelines
- OSHA: Safety and Health Information Bulletin
- UL Research Institutes: FSRI Lithium-Ion Battery Guide
- FM Global: Data Sheet 7-112

### Community Resources
- VESC Project: https://vesc-project.com
- ESK8 News Forum: https://forum.esk8.news
- Endless Sphere: https://endless-sphere.com

---

## Quick Reference Tables

### Cell Voltage Reference
| State | Voltage/cell | 10S Pack | 12S Pack |
|-------|--------------|----------|----------|
| Full | 4.2V | 42.0V | 50.4V |
| 90% | 4.1V | 41.0V | 49.2V |
| 80% | 4.0V | 40.0V | 48.0V |
| 60% | 3.8V | 38.0V | 45.6V |
| 40% | 3.6V | 36.0V | 43.2V |
| 20% | 3.4V | 34.0V | 40.8V |
| Empty | 3.0V | 30.0V | 36.0V |

### Common Pack Configurations
| Config | Nominal V | Max V | Cells | Typical Use |
|--------|-----------|-------|-------|-------------|
| 6S2P | 22.2V | 25.2V | 12 | Small boards |
| 10S2P | 37.0V | 42.0V | 20 | Compact e-skate |
| 10S4P | 37.0V | 42.0V | 40 | Standard e-skate |
| 12S4P | 44.4V | 50.4V | 48 | High-power e-skate |
| 14S4P | 51.8V | 58.8V | 56 | E-bike |
| 20S2P | 74.0V | 84.0V | 40 | High-voltage e-bike |

---

*Document Version: 1.0*
*Last Updated: May 2026*
*For VESC CLI Tool - Battery Information Module*
