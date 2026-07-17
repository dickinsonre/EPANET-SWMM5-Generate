# EPANET 2.3 & SWMM 5.2.4 Network Generator — Course Handout

A practical guide to generating, inspecting, solver-verifying, and calibrating water
distribution (EPANET) and stormwater/sewer (SWMM) models entirely in your browser.
Hydraulic validity is confirmed by actually running the built-in WASM solver (see the
tier badges above the preview), not assumed at generation time.

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

That's a complete, structurally sound model — the tier badges above the preview show
whether the solver has verified it hydraulically. Everything else is refinement.

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
| **🤖 AI** | AI Assistant (powered by Claude). One click summarizes *what the program just did* — the network it just generated — in plain English, and you can ask free-form follow-up questions about it. See [§3.1](#31-ai-assistant). |

**Sidebar settings** are organized into four sub-tabs: **Network**, **Hydraulics**,
**Environment**, and **Map & Export**.

**Inline tooltips:** hover over almost any setting label to see a one-line description and a
reasonable range — no need to leave the page or consult this handout.

**Engine & version badges:** the header shows the bundled solver versions
(**EPANET 2.3**, **SWMM 5.2.4**) and the generator build (**v4.5 · 2026-07-17**) so you can
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

### 3.1 AI Assistant

The **🤖 AI** tab is a built-in assistant (powered by **Claude**, model `claude-opus-4-7`)
that explains the network you just generated in plain English.

- **✨ Summarize what the program just did** — one click produces a short narrative of the
  most recent run: the mode and units, the grid/topology it built, source and demand balance,
  connectivity, and any notable warnings. Useful for a quick sanity check or for pasting into
  a report or lab write-up.
- **Ask a question** — type a free-form question (e.g. *"How many pumps does this network
  have?"*, *"Is the supply adequate and why?"*, *"What would happen if I added a second
  reservoir?"*) and get an answer grounded in the same network snapshot.

**What the assistant sees.** It is only given a compact, text summary of the current
network — counts (junctions, pipes, pumps, reservoirs, etc.), demand/supply figures,
connectivity, zones, the seed, and the scalar configuration values. It does **not** receive
the full `.inp` file or any data beyond the run you just generated, so its answers describe
*this* network, not external sources.

**How it's powered.** The assistant uses **Replit AI Integrations** — there is no API key to
configure, and usage is billed to your Replit credits. Generate a network first; the buttons
report a gentle warning if there's nothing to summarize yet.

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
| **INP file** | `.inp` (compatible with EPANET 2.2+ / SWMM 5.2+) | Load into any standard solver. Includes full reporting and a documented `[TITLE]` block stamping the exact generator build (e.g. `v4.5`), the engine target (`loads in EPANET 2.2+` / `loads in EPA SWMM 5.2+`), the seed, the timestamp, and the run assumptions. The build string matches the header badge and the changelog verbatim. |
| **Validate** | in-app check | Confirms required sections, node/link cross-references, duplicate IDs, and `[END]` — *without* running a solve. |
| **GeoJSON** | `.geojson` | GIS import. Includes legacy CRS metadata (tagged EPSG:2913, US survey feet) for QGIS/ArcGIS. |
| **DEM** | ASCII grid | IDW-interpolated elevation surface for ArcGIS/QGIS. |
| **Calibration files** | EPANET `.cal` / SWMM `.dat` | Observed Pressure/Head/Demand/Flow/Velocity (EPANET) or Depth/Head/Inflow/Flow/Velocity (SWMM). |
| **Config** | `.json` | Save/load all settings, or "Copy Config" to clipboard. |
| **Batch ZIP** | `.zip` | N models (2–50) with sequential seeds + `manifest.json`. |
| **Node Sweep ZIP** | `.zip` | Many models stepping node count from Min→Max by Interval (see §10.1). |
| **Ensemble ZIP** | `.zip` | Monte Carlo ensemble — EPANET or SWMM (see §10). |
| **Map PNG** | `.png` | 2400×1600 @ 2× DPI snapshot of the network map. |

**Export progress (multi-model exports).** The long-running exports — **Batch ZIP**, **Node
Sweep ZIP**, and the EPANET/SWMM **Ensemble ZIP** — show a floating progress panel at the
bottom of the screen while they run: a percent-complete bar, the current model/member count
(plus the ZIP part number for large multi-part sweeps), the **elapsed time**, and an
**estimated time remaining** (projected from the average time per completed model). It switches
to a `zipping…` state while the archive is packed, then dismisses automatically when the export
finishes or fails.

**Solver progress.** The same panel also appears while you **run the engine** (Run Solver and
Quick Sim). An EPANET run shows a determinate `timestep i / N` bar with elapsed time + ETA as it
walks the simulation period (and an animated indeterminate bar during the single-shot solve
phases); a SWMM run — one blocking solve — shows an animated indeterminate bar. The elapsed
clock advances while the main thread is free and pauses during a single blocking solve. It
dismisses automatically when the solve finishes or fails.

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
   grade against **AWWA M32** pressure targets (note: in AWWA M32 a *higher* calibration
   level means a *stricter* tolerance, so Level 3 is tighter than Level 1):

   | Grade | Pressure RMSE | Meaning |
   |-------|---------------|---------|
   | **A** (green) | < 1 psi | Level 3 calibration (strictest — excellent) |
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
- `ensemble_manifest.csv` — multipliers plus mean Manning's n, DWF base, and rain depth,
  **and a per-member structural-validation block**: `structural_valid` (PASS/FAIL),
  `adverse_slope_conduits` (count of gravity conduits whose slope went ≤ 0 after the invert
  jitter), `min_slope_ft_per_ft`, `subcatch_routing_ok` (every subcatchment outlet resolves to
  a real node), `node_to_outfall_ok` (every junction still reaches an outfall via downstream
  BFS), and `flagged_conduits` (the offending conduit IDs). Force mains are pressurized
  (pump-fed) and are excluded from the slope check. This gives SWMM ensembles the same
  validity guarantee EPANET ensembles get from the BFS connectivity + S/D checks.
- `README.txt` — describes the perturbation ranges, seed scheme, and a PASS/FAIL member tally

Member seeds start at `baseSeed + 2000` (EPANET uses `baseSeed + 1000`), so the two
ensembles never collide. The other exporters stay clear of both bands: the **node sweep**
reuses the single `baseSeed` unchanged for every model (size is the only variable), and
**Batch ZIP** uses a small sequential block starting at `baseSeed` (`baseSeed`, `baseSeed+1`,
…). Keep a Batch run well under 1000 members if you intend to mix its files with an EPANET
ensemble from the same base seed, so its sequential block can't reach the `baseSeed + 1000`
offset.

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
actual size). The band that maps to a given `dim` is `(dim−0.5)² ≤ T < (dim+0.5)²`; for
`dim = 32` that is **993 … 1056 inclusive** (since `√1056 ≈ 32.496` still rounds to 32, while
`√1057 ≈ 32.512` rounds to 33). So with Step = 1, the 57 targets 1000–1056 all collapse onto
the same 32×32 grid. This is expected: the sweep guarantees a model for every requested step,
but the *actual* sizes advance in discrete jumps. Use a Step of roughly `2·dim+1` (the spacing
between consecutive perfect squares near your range) if you want every model to be a distinct
size.

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
    "generator": "EPANET-SWMM Generator v4.5",
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

**Versions.** The bundled in-browser EPANET solver is the OWA-EPANET **2.3** engine — that's the
version shown in the title and header badge. The `.inp` files the generator writes use the
standard format and stay **backward-compatible with EPANET 2.2 and later** (and SWMM 5.2+), which
is why compatibility notes say "2.2+". So "EPANET 2.3" = the solver engine; "EPANET 2.2+" = the
range of software that can open the output. The **MIT License** above is the single license that
governs this tool; the "teaching / testing / not for compliance" wording elsewhere is a
fitness-of-output disclaimer, not a usage restriction.

---

### Changelog

**v4.5 — 2026-07-17**
- **3D view (new tab):** interactive 3D terrain + network visualization. The terrain surface
  is interpolated from node ground elevations and shaded by height; pipes, pumps, and valves
  are drawn as lines draped over the surface, junctions as color-coded points, reservoirs/
  outfalls as green cones, and tanks as amber cylinders. Drag to rotate, scroll to zoom,
  right-drag to pan. Controls: vertical exaggeration (1–12×) and node coloring by elevation
  or, after a solver run, by pressure (EPANET) / depth (SWMM). The 3D engine (Three.js)
  loads on demand from a CDN the first time you open the tab.

**v4.4 — 2026-07-17**
- **Clickable workflow stepper:** the Configure › Generate › Validate › Export strip is now
  interactive — each numbered step is a button. Configure jumps to the settings search,
  Generate builds (or rebuilds) the model, Validate re-runs the solver-gated checks, and
  Export scrolls to the download buttons. Steps that aren't available yet appear locked
  with a tooltip explaining what unlocks them.
- **Complexity-mode tooltips:** hovering 🟢 Simple / 🔵 Advanced / 🟣 Expert now lists exactly
  which setting groups each mode unlocks.
- **Large-preset confirmation:** choosing Giant (50K) or City (100K) now shows an estimated
  generation time and a confirm dialog before building, instead of silently starting a long run.
- **Map toggle chips:** the City / Network / Labels / Voronoi map toggles are restyled as
  modern pill chips that light up when active.

**v4.3 — 2026-07-17**
- **Layout fix — preview tabs render in the main pane again:** a stray closing tag made every
  preview tab except Map (Stats, INP, Docs, HGL, Log, RPT, Results, AI) render inside the
  narrow left sidebar, leaving the main pane empty at desktop width. All tabs now fill the
  main preview pane as intended.
- **SWMM-correct map legends:** in SWMM mode, both the on-map legend and the mini legend under
  the map now use SWMM vocabulary (Junction / Outfall / Pump) instead of EPANET's
  Reservoir / Tank / Valve / Emitter, matching what the SWMM network actually contains.
- **Collapsible map legend:** click the legend's header to collapse it into a small
  "Map Legend ▸" pill (and click again to expand); the choice is remembered across sessions.
- **Humanized generation timestamp:** the status bar now says "Generated just now" /
  "Generated 12 min ago" (hover for the exact local date & time) instead of a bare clock time.
- **Export-progress polish:** the "Exporting…" toast is now fully hidden unless an export is
  actually running.

**v4.2 — 2026-07-17**
- **Richer progress tracker:** the Configure › Generate › Validate › Export stage strip now
  uses distinct icons per state — checkmark for done, animated spinner while the solver is
  validating, filled dot for the current step — with green connector lines filling in as
  steps complete, and the current step highlighted with a bold tinted chip. Tier badges
  (Solver/QA) also show an animated spinner while a solve is in flight.
- **First-visit walkthrough:** a lightweight 5-step guided tour (workflow strip → Generate →
  validation badges → settings search → preview/export tabs) appears once for new visitors
  and never again after finishing or skipping (stored in the browser).
- **INP & RPT line filtering:** both the INP preview and the solver report tab gained a
  filter box — type e.g. `[PUMPS]`, a node ID, or `WARNING` to see only matching lines with
  a match count; clearing the box restores the full view. Filtering the INP also bypasses
  the usual 300-line preview truncation (up to 2,000 matches shown).
- **Louder active states:** the active preview tab now carries a glow and heavier weight so
  it is always obvious which view you are on.

**v4.1 — 2026-07-16**
- **Solver-gated validation with tier badges:** a new badge strip above the preview shows an
  honest five-step ladder — **Generated → Syntax → Topology → Solver → QA**. "Generated" no
  longer implies hydraulic validity: the Solver badge turns green only after the WASM engine
  actually converges, and QA only after pressures pass an engineering screen (no negative
  pressures, few nodes below 20 psi, max under ~100 psi equivalent). EPANET models up to
  2,500 junctions are steady-state solved **automatically** right after generation; larger
  models and SWMM show a pending badge with instructions (Quick Sim / Run Solver). Quick Sim
  and the full extended-period solver also update the badges, and the Validation Report
  header now reads "Solver + QA Passed" instead of "Model Valid".
- **Technical accuracy audit:** documentation claims were tightened — the overview no longer
  calls unsolved output "hydraulically valid"; pump-curve guidance now correctly states that
  EPANET accepts a single design point (auto-expanding it to 3 points) with a 3-point curve
  *recommended*; the control-rule precedence text now matches the PRIORITY semantics described
  in the Rule-Based Controls section; supply-demand figures are labeled as
  "generator-estimated source capacity (planning estimate, not a solver result)"; the 80-ft
  pressure-zone threshold is labeled a generator heuristic; and a disclaimer notes that color
  themes imply no affiliation or endorsement.
- **Task-oriented workflow UX:** a **Configure › Generate › Validate › Export** stage strip at
  the top of the sidebar tracks where you are (green = done, cyan = current, red = failed
  validation), and a new **settings search box** filters sections across all four settings
  tabs at once — matches auto-expand, and clearing the box restores the normal tab view.

**v4.0 — 2026-06-11**
- **Incremental UI refresh:** four focused upgrades that make the active engine and the
  freshness of the preview obvious at a glance, without changing the overall layout:
  - **Engine-accent theming:** the whole interface re-tints by engine — **blue for EPANET 2.3**,
    **teal for SWMM 5.2.4** (active tabs, buttons, presets, focus rings, the engine pill, and the
    status-bar tag). Driven by a single `data-engine` attribute on `<html>` that swaps the shared
    `--accent-blue`/`--accent-cyan` accent, so it layers cleanly over the existing brand themes.
  - **Slim top bar:** the header collapsed to a single fixed-height row — title + one-line
    subtitle on the left, a dynamic **engine pill** (💧 EPANET 2.3 / 🌧 SWMM 5.2.4) and the build
    badge on the right — replacing the previous stacked two-badge block.
  - **Status bar:** a always-present strip atop the preview pane showing the active engine tag,
    units, element counts, and a generated/stale/not-generated state with the last-run timestamp.
  - **Stale-output indicator:** changing any generation parameter after a run surfaces an amber
    "Settings changed — regenerate" note beneath the Generate button and flips the status bar to
    "⚠️ Stale — regenerate"; regenerating clears it.

**v3.9 — 2026-05-29**
- **Engine toggle & presets now regenerate immediately:** switching between EPANET 2.3 and
  SWMM 5.2.4 previously cleared the cached model internally but left the *previous* engine's
  network on screen (map + INP), so SWMM appeared "stuck" on the EPANET output and a stale
  `;EPANET 2.3 Network` title lingered. The toggle now wipes the stale preview and auto-generates
  a fresh model for the selected engine. Likewise, clicking a size preset (Tiny … City) now
  regenerates in the *current* engine instead of only filling the input fields, so the map/INP
  always reflect the chosen preset and engine. The engine selection is never reset by a preset
  click. (A `[SUBCATCHMENTS]`/`[CONDUITS]` SWMM INP is produced in SWMM mode; a
  `[JUNCTIONS]`/`[PIPES]` EPANET INP in EPANET mode.)

**v3.8 — 2026-05-29**
- **Headloss formula now emits physically correct roughness:** selecting **Darcy-Weisbach**
  or **Chezy-Manning** previously still wrote Hazen-Williams C-factors (~80–130) into the
  `[PIPES]` roughness column — meaningless for those formulas (a D-W roughness of "100" reads
  as 100 *millifeet*, which makes the model unsolvable). The generator now converts each pipe's
  stored C-factor into the formula's native units when writing the INP: for **D-W**, the
  equivalent sand-grain roughness height ε via `ε(m) = 3.7·D·exp(-C·D^0.068 / 13.9)`, written in
  millifeet (US) or mm (SI); for **C-M**, a Manning's *n* mapped monotonically from the C-factor
  (smoother pipe → lower *n*). H-W is unchanged. Pipe quality is still authored as a single
  C-factor and stays consistent across formulas — so Darcy-Weisbach is now a fully valid,
  solvable toggle for solver-comparison exercises, not just a header line.

**v3.7 — 2026-05-29**
- **Always-visible health banner:** a compact health summary now sits directly above the
  preview tabs, so the network's status (junction count, percent connected, supply/demand
  ratio) is visible on *every* tab after generation — not just on Stats. It is color-coded
  green/amber/red, links to the full Stats view via "Details →", and (EPANET only, when a
  supply deficit or isolated nodes are detected) offers a one-click **🔧 Fix it** button.
- **One-click auto-fix:** the banner's **Fix it** button heuristically adjusts the generation
  parameters — bumping reservoirs/pumps/source head to close a supply/demand deficit, or
  reducing dead-ends/closed pipes and raising the diagonal-link percentage to reconnect
  isolated nodes — then regenerates the network automatically.
- **Grouped, color-coded Stats:** the Stats tab is now organized into labelled clusters
  (Topology, Supply & Demand, Quality Checks, Demand Zones, Design Basis for EPANET; Topology,
  Zones & Output for SWMM) instead of one flat grid, making the numbers far easier to scan.
- **Settings auto-persist across refresh:** your configuration (mode, units, all sidebar
  settings, seed, and the Lock-seed state) is saved to the browser after each generation and
  restored automatically on the next visit, so a refresh never wipes a carefully tuned setup.
  A brief "Restored your last settings" toast confirms the restore. With Lock seed on, a reload
  reproduces the exact same network.

**v3.6 — 2026-05-29**
- **AI Assistant tab (powered by Claude):** a new **🤖 AI** tab summarizes *what the program
  just did* — the network you just generated — in plain English with one click, and answers
  free-form follow-up questions about it (pumps, supply adequacy, "what if…", etc.). It is sent
  only a compact text snapshot of the current run (counts, demand/supply, connectivity, zones,
  seed, scalar config), never the full `.inp`. Runs through **Replit AI Integrations**
  (model `claude-opus-4-7`) — no API key to configure; usage is billed to Replit credits.
- **Version single source of truth + drift guard:** the build version now lives in one
  constant (`GEN_BUILD`) that drives the header badge and every exported `[TITLE]` block, and
  the `[TITLE]` block additionally stamps the engine target (`loads in EPANET 2.2+` /
  `loads in EPA SWMM 5.2+`) alongside the seed and timestamp. A one-line runtime assertion on
  load checks that the badge, the `[TITLE]` writer, and the changelog top entry all carry the
  same build string and logs a console error if they ever drift.
- **SWMM ensemble structural validation:** each perturbed ensemble member is now checked for
  adverse-slope (≤ 0) gravity conduits created by the junction-invert jitter, plus the
  topology-invariant guarantees that every subcatchment routes to a real node and every node
  still reaches an outfall. The pass/fail and the flagged conduit IDs are written into
  `ensemble_manifest.csv` per member, giving SWMM the same validity credibility EPANET already
  had.
- **Build-version stamps aligned to v3.6:** the version written into generated artifacts now
  matches the header badge and changelog. Previously the EPANET/SWMM `[TITLE]` comments stamped
  `v3.0`, the batch-ZIP `manifest.json` stamped `v3.0`, and the node-sweep `manifest.json` stamped
  `v3.5`. The handout's build badge reference and `manifest.json` example were also updated from
  `v3.5` to `v3.6`.
- **Versioning & license wording clarified:** disambiguated "EPANET 2.3" (the bundled solver
  engine) from "EPANET 2.2+" (the range of software that can open the generated `.inp` files) —
  compatibility notes now read "compatible with EPANET 2.2+" rather than implying a version
  conflict, and a new "Versions" note in Credits & License spells out the distinction. Also made
  the license consistent: the **MIT License** is the single license governing the tool, and the
  "teaching / testing / not for compliance" text is now clearly framed as a fitness-of-output
  disclaimer rather than a competing usage term.
- **SWMM dynamic-wave step tuning:** generated `[OPTIONS]` now set `LENGTHENING_STEP 5`
  (artificial conduit lengthening for short-conduit numerical stability, was `0`) and add an
  explicit `MINIMUM_STEP 0` (minimum variable time step, previously left to SWMM's 0.5 s default).
- **Export progress bar with elapsed time + ETA:** the long-running multi-model exports
  (Batch ZIP, node-count sweep, and the EPANET/SWMM Monte Carlo ensembles) now show a floating
  progress panel at the bottom of the screen with a percent-complete bar, the current model /
  member count (and ZIP part, for big sweeps), the elapsed time, and an **estimated time
  remaining** (a linear projection from the average time per completed item). The panel appears
  when an export starts and dismisses automatically when it finishes or fails.
- **Solver progress panel:** running the engine now shows the same floating panel. An **EPANET**
  run displays a determinate `timestep i / N` bar (with elapsed time + ETA) while it walks the
  extended-period simulation, and an animated indeterminate bar during the single-shot
  hydraulic/water-quality solves. A **SWMM** run (one blocking WASM call) shows an animated
  indeterminate bar; **Quick Sim** shows the panel too. The slide animation is transform-driven
  so it keeps moving even while a blocking solve freezes the main thread. The elapsed-time clock
  advances whenever the main thread is free (it can't tick during a single blocking WASM call,
  but resumes once that call returns). A global solver lock blocks a second solve from starting
  mid-run.

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
- **Export download fix:** every export (`.inp`, RPT, HTML report, DEM, GeoJSON, config, Batch
  ZIP, node sweep, Monte Carlo ensembles, map/HGL PNGs) now downloads reliably when the app is
  viewed **embedded in an iframe** (the Replit preview pane and the Canvas board). Browsers
  block a same-document `<a download>` click inside a sandboxed iframe, so all downloads were
  silently doing nothing there; they now run from a brief, self-closing top-level tab that
  preserves the real filename. The published/standalone app downloads directly as before. If
  your browser asks, **allow pop-ups** for the site so the download tab can open.
- **Docs corrections:** fixed a mis-indented code fence in §10.1 (`manifest.json` block) that
  was breaking Markdown rendering of every heading after it; spelled out the exact grid-mapping
  band (`(dim−0.5)² ≤ T < (dim+0.5)²`, i.e. 993–1056 → 32×32) to confirm the worked example;
  clarified that a *higher* AWWA M32 level = a *stricter* tolerance (§9); and documented that
  the node-sweep / Batch seed schemes stay clear of the `+1000`/`+2000` ensemble offsets (§10).

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
