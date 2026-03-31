# EPANET Model Rules and Data Reference

Extracted from the EPANET-UI Manual (Open Water Analytics).

---

## 1. Data Model Overview

EPANET models a pipe network as **links** connected to **nodes**.

**Node types:**
- **Junctions** — have user-supplied water withdrawal rates (consumer demands)
- **Tanks** — storage units whose water level changes over time
- **Reservoirs** — boundary points with a fixed, user-assigned hydraulic head

**Link types:**
- **Pipes** — have length, diameter, roughness coefficient, and optional leakage area
- **Pumps** — have a constant power rating or a pump curve (head vs. flow)
- **Valves** — regulate either flow or pressure

**Supporting data objects:**
- **Time Patterns** — allow demands, quality source strength, and pump speed settings to vary at fixed intervals
- **Data Curves** — describe relationships between two quantities (head vs. flow for pumps, volume vs. water level for tanks)
- **Simple Controls** — adjust a link's setting based on node pressure, tank level, elapsed time, or time of day
- **Rule-Based Controls** — multi-condition rules with IF/THEN/ELSE/PRIORITY logic
- **Water Quality Sources** — introduce chemical constituents at specified nodes

---

## 2. Object Properties

### 2.1 Junction Properties

| Property | Description |
|---|---|
| Junction ID | Unique label, up to 31 characters. Cannot duplicate any other node ID. |
| Description | Optional text string. |
| Tag | Optional text string (no spaces) for categorization (e.g., pressure zone). |
| Elevation | Elevation (ft or m) above a common reference. Used to compute pressure from hydraulic head. |
| Base Demand | Average/nominal demand in current flow units. Negative value = external source of flow into the junction. |
| Demand Pattern | Time pattern ID providing multipliers applied to Base Demand over time. |
| Demand Categories | Multiple base demands and patterns for different user categories at the junction. |
| Emitter Coefficient | Discharge coefficient for emitter/sprinkler/nozzle. Units: flow units at 1 unit of pressure drop (psi or m). 0 = no emitter. |
| Initial Quality | Water quality level at simulation start. |
| Source Quality | Quality of any water entering the network at this location. |

### 2.2 Reservoir Properties

| Property | Description |
|---|---|
| Reservoir ID | Unique label, up to 31 characters. |
| Description | Optional text string. |
| Tag | Optional text string (no spaces). |
| Elevation | Elevation (ft or m) of water in the reservoir. |
| Elevation Pattern | Time pattern to model time-varying reservoir water elevation (e.g., tie-in to another system). |
| Initial Quality | Water quality level at simulation start. |
| Source Quality | Quality of any water entering the network at this location. |

### 2.3 Tank Properties

| Property | Description |
|---|---|
| Tank ID | Unique label, up to 31 characters. |
| Description | Optional text string. |
| Tag | Optional text string (no spaces). |
| Elevation | Elevation (ft or m) of the tank's **bottom** (not ground elevation). |
| Initial Level | Height (ft or m) of water surface above bottom elevation at simulation start. |
| Minimum Level | Minimum height (ft or m) above bottom. Tank will not drop below this. |
| Maximum Level | Maximum height (ft or m) above bottom. Tank will not rise above this. |
| Diameter | Diameter (ft or m). For square/rectangular tanks: equivalent diameter = 1.128 × √(cross-sectional area). |
| Minimum Volume | Volume at minimum level (ft³ or m³). Optional, for non-cylindrical tanks without a volume curve. |
| Volume Curve | Data curve: tank volume vs. water level. If none supplied, tank is assumed cylindrical. |
| Can Overflow | YES = inflow to full tank becomes overflow/spillage. Otherwise, inflow links are temporarily closed when full. |
| Mixing Model | MIXED (complete), 2COMP (two-compartment), FIFO (first-in first-out plug flow), LIFO (last-in first-out). |
| Mixing Fraction | Fraction of total volume in inlet-outlet compartment (for 2COMP model only). |
| Reaction Coefficient | Bulk reaction coefficient in tank. Positive = growth, negative = decay. Units: 1/days. |
| Initial Quality | Water quality level at simulation start. |
| Source Quality | Quality of water entering network from the tank (regardless of actual quality in tank). |

### 2.4 Pipe Properties

| Property | Description |
|---|---|
| Pipe ID | Unique label, up to 31 characters. |
| Start Node | Node ID where pipe begins. |
| End Node | Node ID where pipe ends. |
| Description | Optional text string. |
| Tag | Optional text string (no spaces). |
| Length | Actual length (ft or m). |
| Diameter | Pipe diameter (inches or mm). |
| Roughness | Roughness coefficient. Unitless for Hazen-Williams or Chezy-Manning; millifeet or mm for Darcy-Weisbach. |
| Loss Coefficient | Unitless minor loss coefficient (bends, fittings, etc.). |
| Initial Status | OPEN, CLOSED, or CV (check valve — flow must go from Start to End node). |
| Bulk Coefficient | Bulk reaction coefficient. Positive = growth, negative = decay. Units: 1/days. |
| Wall Coefficient | Wall reaction coefficient. Positive = growth, negative = decay. Units: 1/days. |
| Leak Area | Average leak opening area (sq mm) × number of leaks per 100 units of pipe length. |
| Leak Expansion | Rate of leak expansion (sq mm per unit of pressure head) × number of leaks per 100 units of pipe length. Typical values per leak: 0.1–0.001 for plastic, 0 for rigid iron. |

### 2.5 Pump Properties

| Property | Description |
|---|---|
| Pump ID | Unique label, up to 31 characters. |
| Start Node | Node on suction (inlet) side. |
| End Node | Node on discharge side. |
| Description | Optional text string. |
| Tag | Optional text string (no spaces). |
| Pump Curve | Data curve: head delivered vs. flow rate. Not needed for constant energy pumps. |
| Power | Constant power (hp or kW). Ignored if a pump curve is assigned. |
| Speed | Relative speed setting (unitless). 1.0 = normal; 1.2 = 20% above normal. |
| Speed Pattern | Time pattern controlling pump operation. Multiplier of 0 = pump shut off. |
| Initial Status | OPEN (online) or CLOSED (offline) at simulation start. |
| Efficiency Curve | Wire-to-water efficiency (%) vs. flow rate. For energy usage calculation only. |
| Energy Price | Average price of energy (monetary units per kWh). |
| Energy Pattern | Time pattern describing how energy price varies over time. |

### 2.6 Valve Properties

| Property | Description |
|---|---|
| Valve ID | Unique label, up to 31 characters. |
| Start Node | Node on upstream side. |
| End Node | Node on downstream side. |
| Description | Optional text string. |
| Tag | Optional text string (no spaces). |
| Diameter | Valve diameter (inches or mm). |
| Type | PRV (Pressure Reducing), PSV (Pressure Sustaining), PBV (Pressure Breaker), FCV (Flow Control), TCV (Throttle Control), GPV (General Purpose). |
| Setting | Pressure (PRV/PSV/PBV) in psi or m, flow (FCV) in flow units, loss coefficient (TCV), or head loss curve ID (GPV). |
| Loss Coefficient | Unitless minor loss coefficient. |
| Initial Status | OPEN, CLOSED, or ACTIVE (normal operating mode). |

**Valve placement rules:**
- A PRV/PSV cannot be directly connected to a reservoir or tank (use an intermediate junction)
- PRVs/PSVs cannot share the same downstream node or be placed in series
- Two PSVs cannot share the same upstream node
- FCVs cannot be directly connected to a reservoir or tank
- A GPV cannot be connected to another GPV

---

## 3. Controls

### 3.1 Simple Controls

Format:
```
LINK linkID action IF NODE nodeID ABOVE/BELOW value
LINK linkID action AT TIME time
LINK linkID action AT CLOCKTIME clocktime
```

Where:
- `linkID` = link ID label
- `action` = OPEN, CLOSED, a pump speed setting, or a valve setting
- `nodeID` = node ID label
- `value` = pressure for a junction or water level for a tank
- `time` = hours since simulation start (decimal or HH:MM)
- `clocktime` = 24-hour clock time (HH:MM)

**Control actions on link types:**
- **Pipes** (without CV): status can be OPEN or CLOSED. Pipes with CVs cannot have controls.
- **Pumps**: CLOSED (offline) or OPEN (speed = 1.0). A numeric setting = relative speed; if > 0 it brings the pump back online.
- **Valves**: OPEN or CLOSED overrides the normal setting. A numeric setting removes any previously fixed status.

**Warning:** Using a pair of pressure controls to open/close a link can cause instability if the pressure settings are too close together. Use rule-based controls instead.

### 3.2 Rule-Based Controls

Format:
```
RULE ruleID
IF condition_1
AND condition_2
OR condition_3
AND condition_4
etc.
THEN action_1
AND action_2
etc.
ELSE action_3
AND action_4
etc.
PRIORITY value
```

Only RULE, IF, and THEN are required; AND, OR, ELSE, and PRIORITY are optional.

**Operator precedence:** OR has higher precedence than AND:
- `IF A or B and C` is equivalent to `IF (A or B) and C`
- To express `IF A or (B and C)`, use two separate rules

**PRIORITY:** Higher-priority rules override lower. A rule without a priority value always has lower priority than one with a value. Equal priorities: the rule listed first wins.

#### Condition Clause Format

```
object id attribute relation value
```

**Object keywords:** NODE, LINK, SYSTEM, JUNCTION, PIPE, RESERVOIR, PUMP, TANK, VALVE

When SYSTEM is used, no ID is supplied.

**Node attributes:** DEMAND, HEAD, PRESSURE

**Tank attributes:** LEVEL, FILLTIME (hours to fill), DRAINTIME (hours to empty)

**Link attributes:** FLOW, STATUS (OPEN, CLOSED, or ACTIVE), SETTING (pump speed or valve setting)

**SYSTEM attributes:** DEMAND (total system demand), TIME (hours from start, decimal or HH:MM), CLOCKTIME (24-hour military time)

**Relational operators:** `=`, `IS`, `<>`, `NOT`, `<`, `BELOW`, `>`, `ABOVE`, `<=`, `>=`

#### Action Clause Format

```
object id STATUS/SETTING IS value
```

Where:
- `object` = LINK, PIPE, PUMP, or VALVE
- `id` = object's ID label
- `value` = OPEN, CLOSED, pump speed setting, or valve setting

#### Rule Examples

Pump/bypass control based on tank level:
```
RULE 1
IF TANK 1 LEVEL ABOVE 19.1
THEN PUMP 335 STATUS IS CLOSED
AND PIPE 330 STATUS IS OPEN

RULE 2
IF TANK 1 LEVEL BELOW 17.1
THEN PUMP 335 STATUS IS OPEN
AND PIPE 330 STATUS IS CLOSED
```

Time-of-day varying pump control:
```
RULE 3
IF SYSTEM CLOCKTIME >= 8 AM
AND SYSTEM CLOCKTIME < 6 PM
AND TANK 1 LEVEL BELOW 12
THEN PUMP 335 STATUS IS OPEN

RULE 4
IF SYSTEM CLOCKTIME >= 6 PM
OR SYSTEM CLOCKTIME < 8 AM
AND TANK 1 LEVEL BELOW 14
THEN PUMP 335 STATUS IS OPEN
```

---

## 4. Modeling Water Demands

### 4.1 Consumer Demands

Consumer demands represent water consumption rates assigned to junction nodes. These include residential, industrial, commercial, irrigation, non-metered losses, and fire flow demands.

**Base Demand** is normally the nominal/average demand. A **Demand Pattern** applies time-varying multipliers.

**Demand Categories** allow multiple demand types at a single junction, each with its own base demand and pattern.

### 4.2 Demand Driven vs. Pressure Driven Analysis

**Demand Driven Analysis (DDA):** Full nodal demands are always met regardless of resulting pressures (may produce negative pressures).

**Pressure Driven Analysis (PDA):** Demand varies between 0 and full value as a power function of pressure between a minimum and service pressure level.

PDA Parameters:
- **Minimum Pressure** — below this, no demand can be delivered
- **Service Pressure** — at or above this, full demand is delivered (must be ≥ 0.1 psi/m above Minimum Pressure)
- **Pressure Exponent** — power to which pressure is raised (recommended: 0.5)

### 4.3 Emitter Demands

Emitters model flow through nozzles/orifices where flow varies with pressure raised to some power (typically 0.5 for nozzles/sprinklers).

**Emitter Coefficient:** Flow rate at 1 unit of pressure drop (1 psi or 1 m).

Uses: sprinkler systems, irrigation networks, pipe leakage simulation, fire flow computation.

### 4.4 Leakage Demands (FAVAD Model)

```
Leakage Flow = Cd × (Ao × H^0.5 + m × H^1.5)
```

Where:
- `Cd` = discharge coefficient
- `Ao` = crack area under zero pressure (sq mm)
- `H` = pressure head
- `m` = rate of crack area expansion with pressure (typical: 0–0.001 sq mm/m depending on material)

Pipe properties:
- **Leak Area** = N × average crack area (sq mm), where N = number of leaking cracks per 100 units of pipe length
- **Leak Expansion** = N × average crack expansion rate (sq mm per unit of pressure head)

---

## 5. Modeling Water Quality

A model must run as an **extended period simulation** (duration > 0) for water quality analysis.

### 5.1 Single Species Analysis

Can model:
- Blending water from different sources
- Water age throughout system
- Loss of chlorine residuals
- Growth of disinfection by-products
- Contaminant intrusion propagation

**Parameters:**
- Type: CHEMICAL, WATER AGE, SOURCE TRACING, or none
- Constituent Name
- Concentration Units: mg/L or ug/L (age = hours, tracing = percent)
- Quality Tolerance: smallest change causing new water parcel creation (typical: 0.01 for chemicals, 0.1 for age/tracing)
- Bulk Reaction Order: 1 for first-order, 2 for second-order
- Tank Reaction Order: same as above for tanks
- Wall Reaction Order: FIRST (1) or ZERO (0)
- Limiting Concentration: max growth or min decay value (bulk reactions proportional to difference from this)
- Specific Diffusivity: relative to chlorine at 20°C (0.00112 sq ft/day). 0 = ignore mass transfer.

### 5.2 Water Quality Sources

**Concentration Source:** Applies only when node has net negative demand (water enters network). Best for reservoirs or treatment works.

**Booster Sources:**
- **MASS** — adds fixed mass flow to node's inflow mass
- **FLOW PACED** — adds fixed concentration to resultant inflow concentration
- **SET POINT** — fixes concentration of outflow (if inflow concentration is below setpoint)

### 5.3 Tank Mixing Models

| Model | Description |
|---|---|
| MIXED (Complete Mixing) | All inflow instantaneously mixed with existing contents. No extra parameters. |
| 2COMP (Two-Compartment) | Two fully-mixed compartments. Inlet/outlet in first. Requires mixing fraction parameter. |
| FIFO (First-In First-Out) | No mixing; first parcel in = first out. For baffled tanks with simultaneous inflow/outflow. |
| LIFO (Last-In First-Out) | No mixing; last parcel in = first out. For unbaffled tanks with simultaneous inflow/outflow. |

---

## 6. Data Curves

| Curve Type | Description |
|---|---|
| Pump | Head delivered vs. flow rate |
| Efficiency | Pump percent efficiency vs. flow rate |
| Volume | Tank volume vs. height above tank bottom |
| Valve | Percent flow (fully open PCV) vs. percent valve opening |
| Head Loss | Head loss across GPV vs. flow through valve |
| Generic | X, Y data applicable to any curve type |

**Pump curve fitting rules:**
- Three points provided (first at 0 flow = shutoff head): program fits a continuous function through all three.
- Single design point: program adds a point at 0 flow / 133% of design head, another at 200% of design flow / 0 head, then fits a continuous curve through all three.

---

## 7. Time Patterns

Time patterns provide multipliers applied at each pattern time period.

- Pattern Step interval set in Analysis Options (default: 1 hour)
- If a pattern ends before simulation duration, it **wraps around** and repeats
- A typical diurnal pattern is available as a template

---

## 8. Analysis Options

### 8.1 Hydraulic Options

| Option | Description |
|---|---|
| Maximum Trials | Max iterations per hydraulic time step. |
| Accuracy | Principal convergence criterion: sum of all flow changes / total flow < this value. |
| Head Tolerance | Convergence: computed head loss vs. nodal head difference < this value (ft or m). 0 = not used. |
| Flow Tolerance | Convergence: largest absolute flow change < this value (flow units). 0 = not used. |
| If Unbalanced | STOP = halt analysis; CONTINUE = continue with warning. |
| Status Reporting | NONE, NORMAL (component status changes), FULL (accuracy at each trial/time step). |
| CHECKFREQ | Solution trials between status checks for pumps, CVs, FCVs, tank-connected pipes. |
| MAXCHECK | Trials after which periodic status checks are discontinued (only at convergence). |
| DAMPLIMIT | Accuracy value at which damping (60% flow changes) and PRV/PSV status checks begin. 0 = no damping. 1.0 or 0.1 can help non-converging simulations. |

### 8.2 Demand Options

| Option | Description |
|---|---|
| Demand Model | DDA (demand driven) or PDA (pressure driven). |
| Default Pattern | ID of default demand pattern for junctions without one. If blank, EPANET tries pattern "1". |
| Demand Multiplier | Scales all baseline demands (2 = double, 0.5 = halve). |
| Service Pressure | Pressure for full demand (PDA only). Must be ≥ 0.1 psi/m above Minimum Pressure. |
| Minimum Pressure | Pressure below which no demand is delivered (PDA only). |
| Pressure Exponent | Power for PDA demand function (recommended: 0.5). |
| Emitter Exponent | Power for emitter flow calculation (recommended: 0.5). |
| Emitter Can Backflow | YES or NO. |

### 8.3 Water Quality Options

| Option | Description |
|---|---|
| Single Species Model | CHEMICAL, WATER AGE, SOURCE TRACING, or none. |
| Multi-Species Model | EPANET-MSX for interacting chemical/biological species. |

### 8.4 Time Options

| Option | Description |
|---|---|
| Duration | Full simulation duration (hours). 0 = snapshot analysis. |
| Hydraulic Step | Interval for computing new hydraulic state. Default: 1 hour. Auto-reduced if > Pattern or Report step. |
| Quality Step | Water quality tracking step. Default: 1/10 of hydraulic step. Can use HH:MM:SS. |
| Pattern Step | Interval between time pattern periods. Default: 1 hour. |
| Pattern Start | Time offset at which patterns start (hours). Default: 0. |
| Report Step | Interval between output results. Default: 1 hour. |
| Report Start | Time into analysis when reporting begins. Default: 0. |
| Rule Step | Time step for checking rule-based controls. Default: 1/10 of hydraulic step. |
| Clock Start | Time of day (military, e.g., 15:00) when reporting begins. Default: 0 (midnight). |
| Statistic | Post-processing: NONE (full time series), AVERAGED, MINIMUM, MAXIMUM, RANGE. |

### 8.5 Energy Options

| Option | Description |
|---|---|
| Pump Efficiency | Default percent efficiency for pumps without an efficiency curve (default: 75%). |
| Energy Price | Default energy cost per kWh (default: 0). |
| Price Pattern | Time pattern for varying energy prices. |
| Demand Charge | Additional energy charge per max kW usage during simulation. |

---

## 9. Project Setup

### 9.1 Flow Units and Unit System

Choosing metric flow units requires all data in SI metric. US customary flow units require US customary data. Pressure units can differ from the project's unit system (e.g., kPa with GPM flow).

### 9.2 Head Loss Formulas

| Formula | Roughness Units |
|---|---|
| H-W (Hazen-Williams) | Unitless C-factor |
| D-W (Darcy-Weisbach) | millifeet (US) or millimeters (SI) |
| C-M (Chezy-Manning) | seconds/meter^(1/3) |

**Roughness conversion (H-W → D-W):**
```
e = 3.7 × D × exp(-C × (D^0.068) / 13.9)
```
Where e = D-W roughness height (meters), D = pipe diameter (meters), C = H-W C-factor.

### 9.3 Additional Project Settings

- Specific Gravity: density ratio relative to water at 4°C (unitless)
- Specific Viscosity: kinematic viscosity relative to water at 20°C (unitless)

---

## 10. Hydraulics Reference Tables

### 10.1 Hazen-Williams Roughness C-Factors

| Pipe Material | C-Factor |
|---|---|
| Cast Iron | 130–140 |
| Concrete | 120–140 |
| Galvanized Iron | 120 |
| Steel | 140–150 |
| Plastic | 140–150 |

### 10.2 Darcy-Weisbach Roughness Heights

| Pipe Material | millifeet | millimeters |
|---|---|---|
| Wrought Iron, Steel | 0.15–8 | 0.05–2.4 |
| Asphalt-Lined Cast Iron | 0.4–7 | 0.1–2.1 |
| Galvanized Iron | 0.3–15 | 0.1–4.6 |
| Cast Iron | 0.8–18 | 0.2–5.5 |
| Concrete | 1–10 | 0.3–3 |
| Cement | 1.3–4 | 0.4–1.2 |
| Plastic | 0.005 | 0.0015 |

### 10.3 Minor Loss Coefficients

| Fitting | Loss Coefficient |
|---|---|
| Globe valve, fully open | 10.0 |
| Angle valve, fully open | 5.0 |
| Swing check valve, fully open | 2.5 |
| Gate valve, fully open | 0.2 |
| Short-radius elbow | 0.9 |
| Medium-radius elbow | 0.8 |
| Long-radius elbow | 0.6 |
| 45 degree elbow | 0.4 |
| Closed return bend | 2.2 |
| Standard tee – flow through run | 0.6 |
| Standard tee – flow through branch | 1.8 |
| Square entrance | 0.5 |
| Exit | 1.0 |

---

## 11. Measurement Units

| Parameter | US Customary | SI Metric |
|---|---|---|
| Concentration | mg/L or ug/L | mg/L or ug/L |
| Demand | (see Flow units) | (see Flow units) |
| Diameter (Pipes) | inches | millimeters |
| Diameter (Tanks) | feet | meters |
| Efficiency | percent | percent |
| Elevation | feet | meters |
| Emitter Coeff. | flow units @ 1 psi drop | flow units @ 1 meter drop |
| Energy | kilowatt-hours | kilowatt-hours |
| Flow (US) | CFS, GPM, MGD, IMGD, AFD | — |
| Flow (SI) | — | LPS, LPM, MLD, CMH, CMD, CMS |
| Head | feet | meters |
| Leak Area | sq mm per 100 ft of pipe | sq mm per 100 m of pipe |
| Leak Expansion | sq mm per ft of head | sq mm per m of head |
| Length | feet | meters |
| Minor Loss Coeff. | unitless | unitless |
| Power | horsepower | kilowatts |
| Pressure | psi or feet | meters, kPa, or bar |
| Reaction Coeff. (Bulk) | 1/day (1st-order) | 1/day (1st-order) |
| Reaction Coeff. (Wall) | mass/sq-ft/day (0-order), ft/day (1st-order) | mass/sq-m/day (0-order), m/day (1st-order) |
| Roughness | unitless (H-W), millifeet (D-W), s/m^(1/3) (C-M) | unitless (H-W), mm (D-W), s/m^(1/3) (C-M) |
| Source Mass Injection | mass/minute | mass/minute |
| Velocity | feet/second | meters/second |
| Volume | cubic feet | cubic meters |
| Water Age | hours | hours |

---

## 12. Fire Flow Analysis

For each selected node, the analysis determines:
1. Pressure when a target fire flow is added to normal demand
2. Largest fire flow that maintains pressures above a target

**Setup parameters:**
- Target fire flow value
- Target pressure to maintain
- Time of day (for extended period)
- Node selection (individual, by tag, by region, or all)
- Pressure zone scope (individual node, all selected nodes, or all network nodes)

**Analysis method:**
1. Run simulation with no fire flow → if static pressure < target, available fire flow = 0
2. Add full target fire flow → if target pressure met at all zone nodes, available fire flow = full target
3. Otherwise, Ridder's Method finds largest fire flow meeting target pressure

---

## 13. Troubleshooting & Modeling Tips

### Sizing a Pump for Specific Flow
Set pump status to CLOSED. Add positive demand at suction node equal to required flow, negative demand of same magnitude at discharge node. Head difference between nodes = required pump head.

### Sizing a Pump for Specific Head
Replace pump with a Pressure Breaker Valve (PBV) in opposite direction. Convert design head to equivalent pressure as PBV setting. Flow through valve = pump's design flow.

### Modeling a Groundwater Well
Represent as a reservoir with head = aquifer piezometric head. Connect pump from reservoir to network. Alternatively, use a junction with negative demand equal to pumping rate.

### Enforcing Specific Source Flow Schedule
Replace reservoirs with junctions having negative demands equal to scheduled flows. Keep at least one tank or remaining reservoir. Allow tanks to overflow if needed.

### Fire Flow at a Junction
- **Pressure check:** Add fire flow to node's normal demand and check resulting pressure.
- **Available flow:** Set emitter coefficient to large value (100× max expected flow), add required pressure head (2.3 × pressure in psi) to node's elevation. Available fire flow = reported emitter demand.

### Modeling Reduced Pressure Backflow Prevention Valve
Use a General Purpose Valve (GPV) with headloss curve showing increasing head loss with decreasing flow, plus a check valve (CV pipe) in series.

### Modeling Pressurized Pneumatic Tank
Use a short, wide cylindrical tank with elevation ≈ pressure head rating. Cross-sectional area = (V₂ − V₁) / (y − x) where V and y are volume and head at min/max.

### Water Quality Initial Conditions
- **Existing conditions:** Assign measured values at monitored nodes, interpolate elsewhere. Include tanks and source locations.
- **Future conditions:** Run multiple repeating demand cycles until results repeat periodically. For water age, initial tank value ≈ 24 / (fraction of volume exchanged daily).

### THM Growth Modeling
Use first-order saturation kinetics: bulk reaction order = 1, limiting concentration = max THM level, bulk coefficient = positive value (0.7 / THM doubling time).

### Chlorine Booster Station
Set Source Type to SETPOINT BOOSTER or FLOW PACED BOOSTER at the junction/tank node.

---

## 14. Error Codes

| Code | Meaning |
|---|---|
| 0 | No error |
| 101 | Insufficient memory available |
| 102 | No network data available |
| 103 | Hydraulic solver not opened |
| 104 | No hydraulics for water quality analysis |
| 105 | Water quality solver not opened |
| 106 | No results saved to report on |
| 110 | Cannot solve network hydraulic equations |
| 120 | Cannot solve water quality transport equations |
| 200 | One or more errors in an input file |
| 201 | Syntax error |
| 202 | Illegal numeric value |
| 203 | Undefined node |
| 204 | Undefined link |
| 205 | Undefined time pattern |
| 206 | Undefined curve |
| 207 | Attempt to control a CV pipe or GPV valve |
| 208 | Illegal PDA pressure limits |
| 209 | Illegal node property value |
| 211 | Illegal link property value |
| 212 | Undefined Trace Node |
| 213 | Invalid option value |
| 214 | Too many characters in input line |
| 215 | Duplicate ID label |
| 216 | Undefined pump |
| 217 | Invalid pump energy data |
| 219 | Illegal valve connection to tank node |
| 220 | Illegal valve connection to another valve |
| 221 | Misplaced clause in rule-based control |
| 222 | Link assigned same start and end nodes |
| 223 | Not enough nodes in network |
| 224 | No tanks or reservoirs in network |
| 225 | Invalid lower/upper levels for tank |
| 226 | No head curve or power rating for pump |
| 227 | Invalid head curve for pump |
| 230 | Nonincreasing x-values for curve |
| 233 | Network has unconnected node |
| 240 | Nonexistent water quality source |
| 241 | Nonexistent control |
| 250 | Invalid format (e.g., ID name too long) |
| 251 | Invalid parameter code |
| 252 | Invalid ID name |
| 253 | Nonexistent demand category |
| 254 | Node with no coordinates |
| 257 | Nonexistent rule |
| 258 | Nonexistent rule clause |
| 259 | Cannot delete node with connected links |
| 260 | Cannot delete Trace Node |
| 261 | Cannot delete node/link in a control |
| 262 | Cannot modify network while solver is open |
| 301 | Identical filenames for different file types |
| 302 | Cannot open input file |
| 303 | Cannot open report file |
| 304 | Cannot open output file |
| 305 | Cannot open hydraulics file |
| 306 | Hydraulics file does not match network data |
| 307 | Cannot read hydraulics file |
| 308 | Cannot save results to binary file |
| 309 | Cannot save results to report file |

---

*Source: EPANET-UI Manual — Open Water Analytics (github.com/openwateranalytics/epanet)*
