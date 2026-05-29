# EPANET 2.3 & SWMM 5.2.4 Network Generator — Course Handout

A practical guide to generating, inspecting, and calibrating hydraulically valid water
distribution (EPANET) and stormwater/sewer (SWMM) models entirely in your browser.

> **One-line summary:** This tool builds realistic test networks — from a 50-node village
> to a 100,000-node city — with proper connectivity, supply/demand balance, and spatial
> realism, then exports standard `.inp` files that load directly into EPANET, EPA SWMM,
> WNTR, PySWMM, InfoWorks, and WaterGEMS.

---

## Table of Contents

1. [What This Tool Is (and Isn't)](#1-what-this-tool-is-and-isnt)
2. [Quick Start (5 Minutes)](#2-quick-start-5-minutes)
3. [The Interface, Tab by Tab](#3-the-interface-tab-by-tab)
4. [UI Complexity Modes: Simple / Advanced / Expert](#4-ui-complexity-modes-simple--advanced--expert)
5. [Key Settings Explained](#5-key-settings-explained)
6. [Reading the Health Summary & Stats](#6-reading-the-health-summary--stats)
7. [Understanding the Generated Model](#7-understanding-the-generated-model)
8. [Exports & File Formats](#8-exports--file-formats)
9. [Calibration Workflow (Truth → Corrupt → Recover)](#9-calibration-workflow-truth--corrupt--recover)
10. [Monte Carlo Ensembles for Uncertainty Analysis](#10-monte-carlo-ensembles-for-uncertainty-analysis)
    - [10.1 Node-count sweep (many models across a size range)](#101-node-count-sweep-many-models-across-a-size-range)
11. [Hydraulics Cheat Sheet](#11-hydraulics-cheat-sheet)
12. [Glossary](#12-glossary)
13. [Troubleshooting](#13-troubleshooting)
14. [Classroom Exercises](#14-classroom-exercises)

---

## 1. What This Tool Is (and Isn't)

**It is:**

- A **synthetic network generator** — it invents plausible pipe layouts, elevations,
  demands, and roughness values from a random seed.
- A **teaching and research aid** — perfect for learning EPANET/SWMM, practicing
  calibration, stress-testing solvers, and producing reproducible test cases.
- **Fully client-side** — everything runs in your browser. No data leaves your machine;
  it works offline once loaded.

**It is *not*:**

- A model of any *real* water system. Coordinates are synthetic planar units.
- A substitute for licensed professional engineering judgment or regulatory submittals.

**Reproducibility:** Every model is built from a **seed** using a deterministic
pseudo-random generator (Mulberry32). The same seed + same settings always produces the
same network — essential for sharing examples and calibration exercises.

---

## 2. Quick Start (5 Minutes)

1. **Pick a mode** (top-left): `EPANET 2.3` (pressurized water distribution) or
   `SWMM 5.2.4` (stormwater / sewer).
2. **Pick units:** `US Customary` (ft, gpm, psi) or `SI / Metric` (m, L/s, m).
3. **Choose a preset:** Start with **Standard (1K)** — a 32×32 grid, ~1,000 nodes.
   - Smaller (Tiny 50 / Small 150) = faster, easier to inspect.
   - Larger (Mega 10K → City 100K) = slower; watch memory on mobile devices.
4. Click **Generate**. Watch the progress bar ("Building grid nodes… 10%", etc.).
5. Review the **Map** tab (visual network) and the **Stats** tab (the green/amber/red
   **health summary** tells you at a glance if the model is sound).
6. Go to the **INP** tab → **Download .inp**, or open it in EPANET/SWMM directly.

That's a complete, hydraulically valid model. Everything else is refinement.

---

## 3. The Interface, Tab by Tab

| Tab | What it shows |
|-----|---------------|
| **Map** | Interactive city-map visualization: terrain, streets, zones, parks, and the network overlaid. Click any node or pipe to inspect its properties and solver results. |
| **Stats** | Health summary banner + a grid of key metrics (junctions, pipes, demand, S/D ratio, connectivity, pressure zones, etc.). |
| **INP** | The generated `.inp` text. Download, copy, select-all, or **Validate** (structural check). |
| **Docs** | Built-in reference: EPANET fundamentals, the Global Gradient Algorithm, C-factor tables, calibration exercises, and historical context. |
| **HGL** | Hydraulic Grade Line profile plot (ground / crown / invert / HGL). |
| **Log** | Engineering log of generation decisions (source placement, connectivity, sizing). |
| **RPT** | Post-solve report output (after running the WASM solver). |
| **Results** | Solver results with a time-slider animation for extended-period simulations. |

**Sidebar settings** are organized into four sub-tabs: **Network**, **Hydraulics**,
**Environment**, and **Map & Export**.

**Inline tooltips:** hover over almost any setting label to see a one-line description and a
reasonable range — no need to leave the page or consult this handout.

**Engine & version badges:** the header shows the bundled solver versions
(**EPANET 2.3**, **SWMM 5.2.4**) and the generator build (**v3.5 · 2026-05-29**) so you can
confirm compatibility with your desktop tools at a glance.

**Keyboard shortcuts:**

| Shortcut | Action |
|----------|--------|
| `Ctrl/⌘ + G` or `Ctrl/⌘ + Enter` | Generate network |
| `Ctrl/⌘ + S` | Download INP |
| `Ctrl/⌘ + Shift + C` | Copy INP to clipboard |
| `Ctrl/⌘ + Z` | Undo configuration change |
| `Ctrl/⌘ + Shift + Z` or `Ctrl/⌘ + Y` | Redo configuration change |

Undo/redo step through committed changes to the sidebar settings (it does not undo a
generated network — just the input values), so you can experiment freely and back out.

---

## 4. UI Complexity Modes: Simple / Advanced / Expert

Below the unit toggle there's a **Simple / Advanced / Expert** switch. It controls how
many settings are visible so beginners aren't overwhelmed:

- **Simple** — only the essentials: presets, grid/topology, terrain & elevation. Best for
  a first session or a quick test network.
- **Advanced** — adds hydraulics (roughness, valves, pumps), demand zones, and water
  quality options.
- **Expert** — exposes everything, including SWMM RDII/RTK coefficients, snowmelt,
  groundwater, and fine-grained calibration controls.

Your choice is remembered between visits.

---

## 5. Key Settings Explained

### Network (topology)

| Setting | Meaning | Typical |
|---------|---------|---------|
| **Grid Rows × Cols** | Size of the underlying street grid. Node count ≈ rows × cols. | 32 × 32 (≈1K) |
| **Node Spacing** | Distance between intersections. | 300–500 ft |
| **Jitter** | Randomizes node positions so the grid isn't perfectly square. | 10–30% |
| **Diagonal %** | Fraction of diagonal street connections (more loops, more realism). | 10–20% |
| **Dead Ends** | Number of dead-end branches (cul-de-sacs). | a few % |

### Sources & Hydraulics (EPANET)

| Setting | Meaning | Typical |
|---------|---------|---------|
| **Reservoirs** | Fixed-head supply sources (treatment plants). | 1–3 |
| **Tanks** | Storage for equalization; placed on local high ground. | 1–4 |
| **Pumps** | Boost head from a source into the network. | as needed |
| **Reservoir Head** | Supply hydraulic head (ft). Higher = more pressure. | 150–300 ft |
| **C-min / C-max** | Hazen-Williams roughness range. Lower C = rougher/older pipe. | 80–140 |
| **PRVs / FCVs** | Pressure-reducing / flow-control valves at zone boundaries. | a few |

### Demand

| Setting | Meaning | Typical |
|---------|---------|---------|
| **Demand zones** | % residential / commercial / industrial / mixed. | site-specific |
| **Demand min/max** | Per-node base demand range (gpm). | 1–20 gpm |
| **Emitter Nodes** | Junctions with pressure-dependent leakage (leaks/hydrants). | 5–15% of nodes |

### Design Mode (auto-sizing)

Enable **Design Mode** to size the network from demographics instead of raw numbers:

- **Population**, **per-capita demand (gpcd)**, **peaking factor**, and **fire flow**
  drive automatic reservoir, pump, and pipe sizing toward target velocities (2–5 ft/s).

---

## 6. Reading the Health Summary & Stats

After generation, the **Stats** tab shows a one-line **health summary** banner:

- ✅ **Green** — model looks sound: fully connected, adequate supply, no obvious issues.
- ⚠️ **Amber** — minor cautions (e.g., S/D ratio tight at ~1.0).
- ⛔ **Red** — real problems (isolated nodes, supply deficit).

When the banner is amber or red, a **"Why?"** button appears. Click it to expand a
plain-language explanation of the *specific* cause (isolated nodes, supply deficit, tight
supply, or low pressure) along with concrete fixes (e.g., raise reservoir head, add a pump,
lower dead ends, enable Design Mode).

Key metrics to watch:

| Metric | What "good" looks like |
|--------|------------------------|
| **Connectivity** | 100% — every node reachable from a source. |
| **Isolated** | 0 — no orphaned nodes/pipes. |
| **S/D Ratio** | ≥ 1.1 — supply capacity exceeds peak demand with margin. |
| **Pressure Zones** | Auto-created when elevation range > 80 ft. |

> **Note on S/D ratio:** Earlier versions could generate a model at exactly **0.50
> (deficit)**. The generator now counts gravity-fed reservoirs at full capacity and adds a
> 1.15 safety factor, so fresh models default to **S/D ≈ 1.15 (adequate)**.

> **Note on connectivity:** "100% connected / 0 isolated" now reconcile correctly — the
> node total no longer double-counts reservoirs and tanks.

---

## 7. Understanding the Generated Model

The generator applies real engineering logic, not pure randomness:

- **Connectivity validation (BFS):** A breadth-first search from every source confirms
  each junction is reachable; isolated nodes are counted and reported.
- **Pump sizing via critical path:** BFS traces the hydraulically farthest node, computes
  Hazen-Williams friction along that path, and builds a 3-point pump curve that brackets
  the operating point (the AWWA-recommended approach).
- **Pressure-zone detection:** If the elevation range exceeds ~80 ft, the network is split
  into ~70 ft zones with PRVs at the boundaries.
- **Spatial realism:** C-factors correlate with location (downtown = older/rougher,
  suburbs = newer/smoother); pipe ages trend from 1950s near the center to 2020s at the
  edges; demand zones cluster (industrial, commercial, residential).
- **Flow-based pipe sizing:** Diameters are chosen from estimated flows toward a 2–5 ft/s
  target velocity (min 6" distribution / 12" arterial).
- **Street-routing factor:** Pipe lengths are multiplied by a **density-scaled** factor to
  approximate routing along streets rather than straight lines — **~1.55×** in the dense,
  older urban core (irregular older grid) tapering to **~1.15×** at the newer suburban edges.

For SWMM, subcatchments use a **D8 flow-direction** algorithm for drainage routing, and
RDII uses statistically rigorous **RTK** distributions.

---

## 8. Exports & File Formats

| Export | Format | Use |
|--------|--------|-----|
| **INP file** | `.inp` (EPANET 2.2+ / SWMM 5.2+) | Load into any standard solver. Includes full reporting and a documented `[TITLE]` block (seed + assumptions). |
| **Validate** | in-app check | Confirms required sections, node/link cross-references, duplicate IDs, and `[END]` — *without* running a solve. |
| **GeoJSON** | `.geojson` | GIS import. Includes legacy CRS metadata (tagged EPSG:2913, US survey feet) for QGIS/ArcGIS. |
| **DEM** | ASCII grid | IDW-interpolated elevation surface for ArcGIS/QGIS. |
| **Calibration files** | EPANET `.cal` / SWMM `.dat` | Observed Pressure/Head/Demand/Flow/Velocity (EPANET) or Depth/Head/Inflow/Flow/Velocity (SWMM). |
| **Config** | `.json` | Save/load all settings, or "Copy Config" to clipboard. |
| **Batch ZIP** | `.zip` | N models (2–50) with sequential seeds + `manifest.json`. |
| **Node Sweep ZIP** | `.zip` | Many models stepping node count from Min→Max by Interval (see §10.1). |
| **Ensemble ZIP** | `.zip` | Monte Carlo ensemble — EPANET or SWMM (see §10). |
| **Map PNG** | `.png` | 2400×1600 @ 2× DPI snapshot of the network map. |

---

## 9. Calibration Workflow (Truth → Corrupt → Recover)

This tool is built for the classic calibration teaching pattern:

1. **Generate a "truth" model.** Lock the seed so it's reproducible. Run the solver to get
   "true" pressures/flows. Export a calibration file (`.cal` / `.dat`) — these become your
   *field observations*.
2. **Create a "corrupted" model.** Change the seed *or* manually degrade parameters
   (e.g., set all C-factors to a wrong guess like 100, or scale demands). This is the model
   a student starts from, not knowing the truth.
3. **Calibrate back.** Adjust roughness, demands, and statuses until the corrupted model's
   results match the observed calibration file. Compare against the truth to grade the
   recovery.

**Automated Calibration Scoring (in-app).** The **Results** tab now closes this loop without
leaving the browser:

1. Run the solver on your truth model (use the **▶ Run Solver** button right on the Results
   tab — it auto-loads the WASM engine if needed).
2. Click **📌 Save as Truth** to snapshot the truth results (mode, seed, units are recorded).
3. Corrupt or recalibrate the model (change C-factors, demands, seed, etc.) and re-run the
   solver.
4. Click **🎯 Score vs Truth**. The tool computes **RMSE** for pressure (or node depth in
   SWMM), flow, and demand across every shared element and timestep, then assigns a letter
   grade against **AWWA M32** pressure targets:

   | Grade | Pressure RMSE | Meaning |
   |-------|---------------|---------|
   | **A** (green) | < 1 psi | Level 3 calibration (excellent) |
   | **B** (green) | < 3 psi | Level 1 calibration (good) |
   | **C** (amber) | 3–5 psi | Marginal |
   | **D** (red) | 5–8 psi | Poor |
   | **F** (red) | > 8 psi | Failed |

   Relative error (RMSE ÷ mean truth value) is color-coded green < 5%, amber 5–10%, red
   > 10% — the typical AWWA M32 flow tolerance. SI head (m) is converted to psi for grading.
   This enables automated grading for classroom use.

The **Docs** tab includes worked calibration exercises with runnable Python/WNTR code
(manual, automated, and demand-pattern calibration).

---

## 10. Monte Carlo Ensembles for Uncertainty Analysis

Both modes provide an **Ensemble** export that holds the **topology constant** and
perturbs parameters across N members, each from its own seed.

### EPANET ensemble

- **C-factor** (roughness) — ± your chosen %
- **Base demand** — ± your chosen %
- **Elevation** — ± your chosen absolute amount (ft)
- **Demand pattern (temporal)** — ± your chosen %; jitters each hourly pattern multiplier
  to capture *temporal* demand uncertainty (set via the **Pat ±%** field, default 10%)

ZIP contents:

- `EPANET23_ensemble_001_seed####.inp` … one `.inp` per member
- `ensemble_manifest.csv` — maps each member to its perturbation multipliers (C-factor,
  demand, elevation, pattern jitter) and summary stats (mean C-factor, total demand)
- `README.txt` — describes the perturbation ranges and seed scheme

### SWMM ensemble

The **Generate SWMM Ensemble ZIP** button (SWMM mode) perturbs stormwater-specific
parameters:

- **Manning's n** (conduit + force-main roughness) — ± your chosen % (**n ±%**)
- **Dry-weather inflow** (DWF base flow) — ± your chosen % (**DWF ±%**)
- **Junction invert elevation** — ± your chosen absolute amount in ft (**Z ±ft**)
- **Subcatchment % impervious** — ± your chosen % (relative; clamped to 0–100%) (**Imp ±%**)
- **Storm rainfall depth** — ± your chosen %; rescales the design-storm hyetograph (**Rain ±%**)

ZIP contents:

- `SWMM524_ensemble_001_seed####.inp` … one `.inp` per member
- `ensemble_manifest.csv` — multipliers plus mean Manning's n, DWF base, and rain depth
- `README.txt` — describes the perturbation ranges and seed scheme

Member seeds start at `baseSeed + 2000` (EPANET uses `baseSeed + 1000`), so the two
ensembles never collide.

**Use it for:** GLUE, Bayesian calibration, and global sensitivity analysis
(Sobol, Morris). Feed the `.inp` set into WNTR/PySWMM, solve each, and analyze the
distribution of outputs.

### 10.1 Node-count sweep (many models across a size range)

Where the Monte Carlo ensemble (§10) varies *parameters* while the topology stays fixed, the
**node-count sweep** does the opposite: it varies the **model size** itself and holds every
other setting constant. One click produces a whole *series* of models that grow from a small
network to a large one in regular steps — ideal when you need a graduated family of `.inp`
files rather than a single model.

#### Where to find it

Generate any network first (EPANET or SWMM), then open **Map & Export**. Below the
**Batch ZIP** controls you'll see the **📈 Node-Count Sweep** panel with three numeric
fields and a **Generate Node Sweep ZIP** button. The panel is mode-aware: in EPANET mode it
emits EPANET 2.3 models, in SWMM mode it emits SWMM 5.2.4 models — no other switch required.

#### The three inputs

| Field    | Meaning                                              | Rules                          |
| -------- | --------------------------------------------------- | ------------------------------ |
| **Min**  | Smallest target node count (the first model)        | Must be **≥ 9** (a 3×3 grid)   |
| **Max**  | Largest target node count (the last model)          | Must be **≥ Min**              |
| **Step** | Node-count increment between successive models       | Must be **≥ 1**                |

The tool generates one model for every target value in the inclusive series
`Min, Min+Step, Min+2·Step, …` up to (and including, when it lands exactly) **Max**. The
number of models produced is therefore `floor((Max − Min) / Step) + 1`.

> **Example:** Min = 50, Max = 1000, Step = 50 → 20 models targeting 50, 100, 150, … , 1000
> nodes. Min = 100, Max = 10 000, Step = 100 → 100 models. Min = 9, Max = 99 856, Step = 1 →
> the maximum-resolution sweep.

#### How a target becomes a model (the grid mapping)

Each target node count `T` is converted to a **near-square grid**:

```
dim  = round( sqrt(T) )      # clamped to the 3 … 316 range
rows = dim
cols = dim
```

So a target of 1000 → `round(√1000)=32` → a 32×32 grid (≈1024 junctions before sources are
added). Every **other** setting — spacing, reservoirs, tanks, pumps, valves, terrain, demand
model, storm, units, theme — is taken **exactly as you have it configured in the sidebar**.
The sweep only rewrites `gridRows`/`gridCols`; it restores your original grid values when it
finishes, so your on-screen model is untouched.

Because the grid must be square-ish and integer-dimensioned, the **realized** node count is
*quantized*. Targets that round to the same `dim` produce the same grid (and thus the same
actual size). For example, with Step = 1 the targets 1000–1056 all round to a 32×32 grid. This
is expected: the sweep guarantees a model for every requested step, but the *actual* sizes
advance in discrete jumps. Use a Step of roughly `2·dim+1` (the spacing between consecutive
perfect squares near your range) if you want every model to be a distinct size.

| Target `T` | `round(√T)` | Grid    | ≈ Junctions |
| ---------- | ----------- | ------- | ----------- |
| 9          | 3           | 3×3     | 9           |
| 50         | 7           | 7×7     | 49          |
| 100        | 10          | 10×10   | 100         |
| 1 000      | 32          | 32×32   | 1 024       |
| 2 500      | 50          | 50×50   | 2 500       |
| 10 000     | 100         | 100×100 | 10 000      |
| 99 856     | 316         | 316×316 | 99 856      |

Targets above **99 856** (316×316, the generator's maximum grid) are clamped to that size.

#### Reproducibility — one seed for the whole series

Every model in the sweep uses the **same seed** (whatever is in the Seed box when you click
Generate). That is deliberate: with the seed and all parameters held constant, the *only*
variable across the set is the network size, which is exactly what you want for a clean
scaling study. Re-running the sweep with the same seed and inputs reproduces byte-identical
`.inp` files. (If you instead want size **and** randomness to vary, run several sweeps with
different seeds, or use **Batch ZIP** for same-size/different-seed sets.)

#### What you get — ZIP contents

A small/medium sweep downloads as a single `<mode>_node_sweep_<N>models.zip`
(e.g. `epanet_node_sweep_20models.zip`). Large sweeps are **streamed as multiple ZIP parts**
— see *Limits & performance* below — named
`<mode>_node_sweep_part01_<count>models.zip`, `…_part02_…`, and so on; each part is a fully
self-contained ZIP. Either way, every ZIP contains:

- **One `.inp` per step**, named:

  ```
  EPANET23_<NNN>_target<T>_<dim>x<dim>_<actual>nodes_seed<seed>.inp
  SWMM524_<NNN>_target<T>_<dim>x<dim>_<actual>nodes_seed<seed>.inp
  ```

  where `<NNN>` is a zero-padded sweep index (`001`, `002`, …), `<T>` the requested target,
  `<dim>×<dim>` the grid, and `<actual>` the realized node count. The index prefix guarantees
  filenames are **unique** even when several targets round to the same grid — nothing
  overwrites anything inside the ZIP.

- **`manifest.json`** — a machine-readable index of the run:

  ```json
  {
    "generator": "EPANET-SWMM Generator v3.5",
    "mode": "epanet",
    "units": "US",
    "sweep": { "minNodes": 50, "maxNodes": 1000, "interval": 50, "models": 20 },
    "files": [
      {
        "filename": "EPANET23_001_target50_7x7_49nodes_seed42.inp",
        "targetNodes": 50,
        "gridRows": 7,
        "gridCols": 7,
        "actualNodes": 49,
        "pipes": 84,
        "seed": 42
      }
      /* … one entry per model … */
    ]
  }
```

  Every model that part contains appears in `files[]`, so you can always compare
  **target vs. realized** size and pipe count at a glance, and drive downstream scripts
  directly off the manifest. For multi-part runs each part carries its own `manifest.json`
  with `part` / `partModels` fields covering just that part's models — concatenate the
  `files[]` arrays across parts to reconstruct the full run.

#### Limits & performance

- **Model count cap: 100,000 models per run.** If your Min/Max/Step would exceed this, the
  tool refuses and asks you to widen the Step or narrow the range.
- **Size cap: ≈99,856 nodes** per model (the 316×316 grid ceiling).
- Models are generated **sequentially in the browser**, yielding to the UI between each so the
  tab stays responsive and shows live `i / N` (and `· part P`) progress on the button.
- **Memory-safe multi-part streaming.** To keep memory bounded on big runs, the tool does
  **not** hold the whole sweep in memory. Instead it accumulates models into a part and flushes
  that part to a downloaded ZIP — then frees the memory — once the part reaches **~64 MB** of
  `.inp` text **or 1000 models**, whichever comes first. So a run is delivered as one ZIP when
  it's small, or as several numbered parts (`…_part01…`, `…_part02…`) when it's large. This is
  why a very large sweep produces multiple downloads. (Earlier builds buffered everything and
  could exhaust tab memory on large sweeps — this streaming approach fixes that.)
- **Allow multiple downloads.** Because parts download automatically as they complete, your
  browser may prompt to "allow multiple file downloads" on the first large run — accept it, or
  the later parts will be blocked.
- Practical runtime scales with both the number of models **and** their sizes — a few dozen
  small models finish in seconds, whereas thousands of large (10k+ node) models can still take
  many minutes (memory is bounded, but CPU time is not). For the fastest big runs, prefer
  smaller per-model sizes.

#### Worked workflow — solver scaling study

1. Set the mode (EPANET/SWMM), units, and any topology/hydraulic options you want fixed.
2. Generate once to confirm the model looks right.
3. In the Node-Count Sweep panel, enter e.g. **Min 100, Max 10000, Step 100** (100 models).
4. Click **Generate Node Sweep ZIP** and wait for the progress to reach `100/100`.
5. Unzip and iterate over `manifest.json`; for each entry, load the `.inp` into WNTR / EPANET
   / PySWMM, solve, and record solve time and peak memory against `actualNodes` / `pipes`.
6. Plot runtime-vs-size to characterize your solver's scaling curve.

**Use it for:** solver-scaling benchmarks, runtime-vs-size profiling, regression corpora,
stress-testing downstream tooling, and teaching how network size affects build/solve cost —
all from a single reproducible, seed-locked series.

---

## 11. Hydraulics Cheat Sheet

**Hazen-Williams head loss (US units):**

```
h_f = 4.73 · L · (Q / C)^1.852 / D^4.87      (h_f in ft, L in ft, Q in cfs, D in ft)
```

- `C` = roughness coefficient (higher = smoother). New PVC ≈ 150; old cast iron ≈ 80.
- Valid for water at 40–75 °F, turbulent flow (Re > 4000). Empirical, not physics-derived,
  but standard US practice because C-factors are well documented.

**Pressure ↔ head (US units):**

```
pressure (psi) = 0.433 · head (ft)        head (ft) = 2.31 · pressure (psi)
```

**Rules of thumb:**

| Quantity | Healthy range |
|----------|---------------|
| Service pressure | 40–80 psi (min ~20 psi under fire flow) |
| Pipe velocity | 2–5 ft/s (peak) |
| S/D ratio | ≥ 1.1–1.2 |
| Fire flow | 500–3,500+ gpm depending on land use |

**Valve types:** PRV (limits downstream P), PSV (maintains upstream P), PBV (fixed P drop),
FCV (limits flow), TCV (throttle), GPV (custom head-loss curve).

---

## 12. Glossary

- **BFS** — Breadth-First Search; used to verify every node connects to a source.
- **C-factor** — Hazen-Williams roughness coefficient (higher = smoother pipe).
- **Demand** — Water draw at a junction (gpm or L/s).
- **Emitter** — A pressure-dependent outflow (models leaks or hydrants).
- **HGL** — Hydraulic Grade Line; elevation of the energy/pressure surface.
- **Peaking factor** — Ratio of peak-hour to average demand (default 1.6; design mode 2.0).
- **PRV** — Pressure-Reducing Valve; common at pressure-zone boundaries.
- **RDII** — Rainfall-Derived Infiltration and Inflow (SWMM sewers).
- **RTK** — Three-parameter unit-hydrograph method for RDII.
- **S/D ratio** — Supply capacity ÷ peak demand. < 1.0 = deficit.
- **Seed** — Number that makes a generated network reproducible.
- **Subcatchment** — A drainage area in SWMM that routes runoff to a node.

---

## 13. Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| **S/D ratio shows 0.50 / deficit** | You're on an older deployed version. Re-publish or refresh — current builds default to ~1.15. |
| **Connectivity < 100% / isolated nodes** | Too many dead ends or closed pipes; reduce them, or increase diagonal % for more loops. |
| **Pump shows "0 ft elevation change"** | The pump provides head for downstream *friction* losses, not elevation lift — this is valid. |
| **Large model is slow / tab freezes** | 50K–100K nodes need significant memory; try a smaller preset, or use a desktop browser. |
| **INP won't load in EPANET** | Run **Validate** first; check the reported errors (missing sections, dangling links). |
| **Results tab is empty** | Click **▶ Run Solver** on the Results tab (it auto-loads the WASM engine), or use **Load WASM Engine → Run Solver** in the sidebar; results then populate the RPT/Results tabs. |

---

## 14. Classroom Exercises

**A. First Network (15 min)**
Generate a Tiny (50) EPANET model. On the Map tab, click a junction and a pipe to read
their properties. Identify the reservoir and trace a path from it to a dead end.

**B. Diagnose a Deficit (20 min)**
Lower the reservoir head until the health summary turns red (S/D < 1.0). Then fix it two
ways: (1) raise reservoir head, (2) add a pump. Compare the resulting S/D ratios.

**C. Pressure Zones (20 min)**
Increase the elevation range above 80 ft and regenerate. Find the auto-created pressure
zones and the PRVs at their boundaries (Stats + Map).

**D. Calibration (45 min)**
Follow §9: generate a locked-seed truth model, export its calibration file, corrupt the
C-factors, then recover them. Grade your recovery against the truth.

**E. Uncertainty (45 min)**
Export a 50-member Monte Carlo ensemble (§10). Solve all members in WNTR and plot the
distribution of minimum pressure across the ensemble.

---

### Credits & License

Generator by Robert Dickinson. Released under the **MIT License** — free to use, modify,
and distribute, including in published research, with attribution. Provided "as is",
without warranty. **Not a substitute for licensed professional engineering judgment.**

EPANET is public-domain software from the US EPA (engine: MIT-licensed,
OpenWaterAnalytics). EPA SWMM is public domain. This generator is an independent tool that
produces files compatible with both.

---

### Changelog

**v3.5 — 2026-05-29**
- **Node-count sweep ("many model") export** (both modes): generates one model per target
  node count from **Min → Max** stepping by **Interval**, each mapped to a near-square grid
  (rows = cols = round(√target)), all sharing the same seed for reproducibility. Packaged as
  a ZIP with `manifest.json` recording target vs. actual node count per model (see §10.1).
  Filenames carry a zero-padded index + target so they never collide; `swmmRawData` is
  saved/restored so a SWMM sweep doesn't disturb the ensemble export.
- **Node-sweep model cap raised to 100,000** models per run (was 100). Per-model size cap
  remains ≈99,856 nodes (316×316 grid).
- **Node-sweep memory-safe multi-part streaming:** large sweeps no longer buffer the whole run
  in memory (which could freeze the tab around a few hundred models). The tool now flushes a
  downloaded ZIP part every ~64 MB of `.inp` text or 1000 models and frees the memory, so big
  runs arrive as numbered parts (`…_part01…`, `…_part02…`). Allow "multiple downloads" if your
  browser prompts. See §10.1 performance notes.

**v3.4 — 2026-05-29**
- **SWMM Monte Carlo ensemble export** (parallel to the EPANET one): fixed-topology,
  per-member seeded perturbation of Manning's n, DWF base flow, junction inverts,
  subcatchment % impervious, and storm rainfall depth, packaged as a ZIP with
  `ensemble_manifest.csv` (see §10).

**v3.3 — 2026-05-29**
- **Automated Calibration Scoring** on the Results tab: **📌 Save as Truth** + **🎯 Score
  vs Truth** compute pressure/flow/demand RMSE and assign an A–F grade against AWWA M32
  targets (green/amber/red), closing the calibration loop for automated classroom grading.
- **▶ Run Solver** button directly on the Results tab (auto-loads the WASM engine) — no
  need to go back to the sidebar.
- **Undo/Redo** for sidebar configuration changes (`Ctrl/⌘+Z` / `Ctrl/⌘+Shift+Z` or `Ctrl/⌘+Y`).

**v3.2 — 2026-05-29**
- Engine + build version badges in the header (EPANET 2.3 / SWMM 5.2.4 / v3.2).
- Density-scaled street-routing factor (1.55× core → 1.15× suburban edges).
- Context-sensitive **"Why?"** explanations on the health summary banner.
- Demand-pattern (temporal) perturbation added to Monte Carlo ensembles (**Pat ±%**).
- Keyboard shortcuts: `Ctrl/⌘+Enter` (generate) and `Ctrl/⌘+Shift+C` (copy INP).
- Tooltip coverage and label fixes across the settings panels.

**v3.1 and earlier**
- Supply/demand fix (S/D ≈ 1.15), connectivity reconciliation, Simple/Advanced/Expert UI
  modes, Monte Carlo ensembles, health summary banner, INP validation, GeoJSON CRS,
  flow-based pipe sizing, WASM validation report.
