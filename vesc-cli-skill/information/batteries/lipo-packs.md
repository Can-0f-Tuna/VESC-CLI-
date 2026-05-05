# LiPo Battery Pack Guide

## Overview

LiPo (Lithium Polymer) batteries are widely used in RC vehicles, drones, and some VESC-based applications. They offer extremely high discharge rates and lightweight construction but require careful handling due to fire risks.

**Key Differences from Cylindrical Cells:**
- **Pouch construction** vs. cylindrical metal can
- **Higher discharge rates** (up to 100C+)
- **Shorter cycle life** (typically 300-500 cycles)
- **Fire risk** if damaged or misused
- **Lower cost** per pack for equivalent power

---

## LiPo Characteristics

### Basic Specifications

**Nominal Voltage:** 3.7V per cell (some specify 3.6V)
**Max Charge Voltage:** 4.2V per cell (4.35V for LiHV)
**Cutoff Voltage:** 3.0-3.2V per cell (never below 3.0V)
**Storage Voltage:** 3.75-3.85V per cell

**Common Pack Configurations:**
| Config | Nominal | Max | Cutoff | Common Use |
|--------|---------|-----|--------|------------|
| 2S | 7.4V | 8.4V | 6.0V | Small RC cars |
| 3S | 11.1V | 12.6V | 9.0V | Drones, small boards |
| 4S | 14.8V | 16.8V | 12.0V | RC cars, quads |
| 6S | 22.2V | 25.2V | 18.0V | VESC small boards |
| 8S | 29.6V | 33.6V | 24.0V | Medium boards |
| 10S | 37.0V | 42.0V | 30.0V | E-skate (matches 10S Li-ion) |
| 12S | 44.4V | 50.4V | 36.0V | High power e-skate |

---

## Understanding C-Ratings

### What is C-Rating?

The "C" rating represents the discharge current capability relative to capacity:

```
Maximum Current (A) = Capacity (Ah) × C-Rating
```

**Example Calculations:**
- 5000mAh (5Ah) battery at 25C = 5 × 25 = 125A continuous
- 5000mAh battery at 50C = 5 × 50 = 250A continuous
- 5000mAh battery at 100C = 5 × 100 = 500A continuous

### Continuous vs. Burst Ratings

Most LiPo packs have two ratings:

**Continuous Rating:**
- Sustainable discharge rate
- Can be maintained until pack depletion
- Primary specification for selection

**Burst Rating:**
- Short-term peak capability
- Typically 10 seconds to 1 minute
- 20-50% higher than continuous
- For acceleration, not sustained use

**Example:**
- "50C Continuous / 100C Burst"
- 5Ah pack: 250A continuous, 500A for 10-30 seconds

---

## C-Rating Reality Check

### Marketing vs. Reality

**Important:** Not all C-ratings are accurate. Industry practice varies:

| Brand Quality | Trust Level | Recommendation |
|--------------|-------------|----------------|
| Premium (Thunder Power, Revo) | High | Ratings generally accurate |
| Quality (Turnigy, Zippy) | Moderate | Use 70-80% of rated C |
| Budget brands | Low | Use 50% of rated C |

### Derating Recommendations

**Until proven through testing:**
- Assume only 60-80% of rated continuous C is sustainable
- Monitor temperature after runs
- Check voltage sag under load
- Adjust based on real-world performance

**Testing Method:**
1. Run pack at expected sustained current
2. Check temperature immediately after (should be warm, not hot)
3. Monitor voltage sag (shouldn't drop below 3.3V/cell under load)
4. If too hot or excessive sag, reduce current or upgrade pack

---

## LiPo Pack Brands

### Premium Brands

**Thunder Power (TP):**
- Highest C-ratings in industry
- Expensive but generally accurate specs
- Excellent for racing applications

**Revolectrix:**
- High-performance cells
- Accurate ratings
- Premium pricing

### Quality Mid-Range Brands

**Turnigy (HobbyKing):**
- Most popular for DIY builds
- Good balance of price/performance
- Nano-Tech line offers high C-ratings
- Generally reliable if not overstressed

**Zippy:**
- Budget-friendly option
- Good for moderate applications
- Less consistent than premium brands

**Gens Ace:**
- Good reputation for accuracy
- Reasonable pricing
- Popular in RC community

### Budget/Entry Level

**Generic "Blue" packs:**
- Variable quality
- Often inflated C-ratings
- Requires careful testing
- Good for learning, not mission-critical

---

## Graphene LiPo Technology

### What is Graphene LiPo?

Graphene-enhanced LiPo batteries claim improved:
- Lower internal resistance
- Higher C-ratings
- Better cycle life
- Faster charging capability
- Lower operating temperatures

### Reality

**Actual benefits (verified):**
- Generally lower IR than standard LiPo
- Better voltage retention under load
- Slightly improved cycle life
- Often heavier than claimed (graphene adds weight)

**Marketing claims to verify:**
- "150C" ratings may not be fully sustainable
- Real improvements are 20-40%, not 2-3x

**Quality Brands Offering Graphene:**
- Turnigy Graphene
- Gens Ace Soaring
- Some Revolectrix lines

---

## LiPo for VESC Applications

### Why Use LiPo with VESC?

**Advantages:**
- Extremely high burst current capability
- Lightweight for the power delivered
- No need to build custom pack
- Easy to swap/replace
- Lower upfront cost

**Disadvantages:**
- Shorter lifespan (300-500 cycles)
- Fire risk requires careful handling
- Need multiple packs for range
- Bulkier than custom 18650/21700 for same capacity
- Requires careful charging protocols

### Recommended Configurations

**Compact E-Skate (Short Range, High Power):**
- **6S 5000mAh 50C** (22.2V, 250A capability)
- Good for small boards, light riders
- ~111Wh per pack

**Standard E-Skate (10S):**
- **10S 5000mAh 40-60C** (37V, 200-300A)
- Matches 10S Li-ion voltage
- ~185Wh per pack
- May need 2-3 packs for adequate range

**High Power Build (12S):**
- **12S 4000-5000mAh 60C+** (44.4V, 240-300A)
- Maximum power delivery
- ~222Wh per pack

### VESC Settings for LiPo

**Voltage Cutoffs:**
```
For 10S LiPo:
- Cutoff Start: 33V (3.3V × 10)
- Cutoff End: 30V (3.0V × 10)

For 12S LiPo:
- Cutoff Start: 39.6V (3.3V × 12)
- Cutoff End: 36V (3.0V × 12)
```

**Important:** LiPo voltage sags more than cylindrical cells under load. Set cutoffs higher to prevent over-discharge under sag conditions.

---

## LiPo Safety

### Fire Risk

**Reality:**
- LiPo fires are rare when handled properly
- Most incidents occur during charging or from physical damage
- Once thermal runaway starts, it cannot be stopped

**What Causes Fires:**
- Overcharging (above 4.2V/cell)
- Over-discharging (below 3.0V/cell)
- Physical puncture or crush damage
- Short circuits
- Charging at incorrect settings
- Charging damaged cells

### Safety Equipment

**Essential:**
- **LiPo Safe Bag:** Fire-resistant charging/storage bag
- **Smoke Detector:** Near charging area
- **Fire Extinguisher:** CO2 or ABC rated (will not stop LiPo fire but prevents spread)
- **Sand/Bucket:** For containing fire (water cools, LiPo fire is self-sustaining)

**Recommended:**
- **Charging mat:** Heat-resistant surface
- **Ammeter/Voltmeter:** Monitor during charge
- **Cell balancer:** Ensures even charging

### Charging Safety Protocols

**DO:**
- Use LiPo-specific balance charger
- Charge in LiPo bag or fire-resistant container
- Monitor during charging (check every 15-20 min)
- Verify cell count and voltage before charging
- Check pack for puffing/damage before each charge
- Charge at 1C rate unless pack specifies higher

**DON'T:**
- Never leave charging unattended
- Never charge damaged/puffed packs
- Never charge above 4.2V/cell (4.35V for LiHV)
- Never charge in vehicle or near flammables
- Never charge immediately after hard use (let cool first)
- Never charge below 0°C (32°F)

---

## LiPo Care and Maintenance

### Storage

**Storage Voltage:** 3.75-3.85V per cell (50-60% charge)
- Never store fully charged (>1 week)
- Never store fully depleted

**Storage Temperature:**
- Cool, dry location
- 15-25°C (59-77°F) ideal
- Never below -10°C or above 45°C

**Long-term Storage:**
- Check voltage monthly
- Recharge to storage voltage if below 3.7V/cell
- Replace if voltage drops below 3.0V in storage

### Physical Care

**Inspection:**
- Check for puffing before/after each use
- Inspect leads and connectors
- Look for any physical damage
- Check balance leads for fraying

**Handling:**
- Never puncture or crush
- Avoid sharp bends in leads
- Don't pull on leads (pull on connector)
- Use protective case during transport

### Disposal

**Warning:** Damaged/dead LiPos can still contain significant energy

**Safe Disposal Method:**
1. Discharge completely using charger discharge function
2. Submerge in salt water bath for 24-48 hours (outdoors)
3. Wrap in tape to prevent shorting
4. Dispose at battery recycling center (NOT regular trash)

**Salt Water Bath:**
- Saturated salt solution (water can't hold more salt)
- Use plastic container (not metal)
- Place outdoors away from structures
- Leave for 1-2 days minimum

---

## LiPo vs. Li-ion for VESC

### Comparison Table

| Factor | LiPo | Li-ion 18650/21700 | Winner |
|--------|------|-------------------|---------|
| Upfront Cost | Lower | Higher | LiPo |
| Cost per Cycle | Higher | Lower | Li-ion |
| Discharge Rate | Very High (100C+) | Moderate (10-45A) | LiPo |
| Energy Density | Lower | Higher | Li-ion |
| Weight (same Wh) | Heavier | Lighter | Li-ion |
| Cycle Life | 300-500 | 500-2000+ | Li-ion |
| Safety | Lower | Higher | Li-ion |
| Maintenance | High | Low | Li-ion |
| Pack Building | Pre-made | Custom required | LiPo |
| Fire Risk | Higher | Lower | Li-ion |
| Swappable | Easy | Hard | LiPo |

### When to Choose LiPo

**Choose LiPo when:**
- You need maximum burst power for racing/competition
- You want swappable packs for quick turnaround
- You have charging infrastructure for multiple packs
- You're building a short-range, high-power board
- You understand and accept fire safety requirements
- Budget is limited upfront (but higher long-term cost)

**Choose Li-ion when:**
- You want maximum range and efficiency
- You want 1000+ cycle lifespan
- You want lower maintenance
- Safety is a primary concern
- You need integrated, clean pack design
- You want better long-term value

---

## Selecting LiPo for VESC

### Current Requirements

**Calculate needed discharge:**
```
Required Current = Motor Max Current × Duty Cycle

Example:
Dual motors at 60A each = 120A total
Duty cycle at speed: 0.8
Battery Current Required: 120A × 0.8 = 96A
Add 20% headroom: 96A × 1.2 = ~115A needed
```

**LiPo Selection:**
- 5000mAh at 25C = 125A (adequate)
- 5000mAh at 50C = 250A (excellent margin)

### Voltage Selection

**Match VESC and motor:**
- Check VESC voltage limit (typically 60V max)
- Check motor voltage rating
- Calculate ERPM limits

**Common VESC Setups:**
| VESC | Max Voltage | Max Cells LiPo | Notes |
|------|-------------|----------------|-------|
| V4.12 | 60V | 12S (50.4V) | Conservative with 10S |
| V6.x | 60V | 12S (50.4V) | 12S compatible |
| Stormcore | 60V+ | 13S+ | Check specific model |

### Capacity Planning

**Wh Calculation:**
```
Wh = Voltage (nominal) × Capacity (Ah)

10S 5000mAh LiPo:
37V × 5Ah = 185Wh

For 20km range at 15Wh/km:
Need: 300Wh
Requires: 2 × 10S 5000mAh packs (370Wh total)
```

---

## Common Mistakes

### Charging Errors
1. Using wrong charger type (NiMH/NiCd instead of LiPo)
2. Incorrect cell count setting
3. Charging at excessive rate (>1C without verification)
4. Charging without balancing
5. Not using balance charger

### Usage Errors
1. Over-discharging below 3.0V/cell
2. Running until voltage cutoff every ride
3. Not allowing cooling between runs
4. Running damaged/puffed packs
5. Exceeding continuous C-rating

### Storage Errors
1. Storing fully charged
2. Storing in hot locations
3. Not checking voltage periodically
4. Storing depleted packs

---

## Recommended Practices

### For New Users

1. **Start with quality charger:** SkyRC, Hitec, or ISDT balance charger
2. **Buy name-brand packs:** Turnigy, Gens Ace, or better
3. **Use LiPo bag:** Always charge in fire-resistant container
4. **Conservative C-rating:** Buy higher C than you think you need
5. **Multiple packs:** Have 2-3 packs rather than pushing one pack hard

### Charging Setup

**Minimum Requirements:**
- Balance charger with cell display
- LiPo charging mode (not Li-ion/LiFe)
- Correct cell count selection
- 1C charge rate default
- Balance leads connected

**Optional Upgrades:**
- Parallel charging board (for multiple packs)
- Cell voltage checker
- IR meter for pack health monitoring

---

## Sources and References

### Technical Resources
1. **Battery University:** https://batteryuniversity.com
   - BU-304a: Safety Concerns with Li-ion
   - BU-409: Charging Lithium-ion

2. **Roger's Hobby Center:** LiPo Guide
   - https://rogershobbycenter.com/lipoguide

3. **NFPA LiPo Safety:** https://www.nfpa.org

### Community Resources
- **RC Groups Forum:** https://www.rcgroups.com
- **HobbyKing Community:** https://hobbyking.com
- **VESC Project:** https://vesc-project.com
- **ESK8 News:** https://forum.esk8.news

### Manufacturer Resources
- **Turnigy/HobbyKing:** Product specifications and guides
- **Gens Ace:** Technical documentation
- **Thunder Power:** Professional RC LiPo

---

## Quick Reference

### Voltage Chart
| Cells | Nominal | Storage | Full | Empty |
|-------|---------|---------|------|-------|
| 2S | 7.4V | 7.6V | 8.4V | 6.0V |
| 3S | 11.1V | 11.4V | 12.6V | 9.0V |
| 4S | 14.8V | 15.2V | 16.8V | 12.0V |
| 6S | 22.2V | 22.8V | 25.2V | 18.0V |
| 10S | 37.0V | 38.0V | 42.0V | 30.0V |
| 12S | 44.4V | 45.6V | 50.4V | 36.0V |

### C-Rating to Current (5000mAh example)
| C-Rating | Continuous Current | Burst (10s) |
|----------|-------------------|-------------|
| 10C | 50A | 75A |
| 20C | 100A | 150A |
| 30C | 150A | 225A |
| 50C | 250A | 375A |
| 100C | 500A | 750A |

### Charge Rate Reference
| Pack Capacity | 1C Charge | 2C Charge | 5C Charge |
|--------------|-----------|-----------|-----------|
| 3000mAh | 3A | 6A | 15A |
| 4000mAh | 4A | 8A | 20A |
| 5000mAh | 5A | 10A | 25A |
| 6000mAh | 6A | 12A | 30A |

---

*Document Version: 1.0*
*Last Updated: May 2026*
*Primary Use: VESC-based electric vehicle applications*
