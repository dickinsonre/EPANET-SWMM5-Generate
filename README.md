# EPANET-SWMM5-Generate

A self-contained web application for generating hydraulically valid **EPANET 2.3** and **SWMM 5.2.4** network models with an interactive canvas city map visualization.

🔗 **Live App**: [replit.com/@robertdickinson/EPANET-SWMM5-Generate](https://replit.com/@robertdickinson/EPANET-SWMM5-Generate)

---

## Overview

EPANET-SWMM5-Generate lets engineers and modelers instantly produce realistic water distribution and stormwater network models — complete with terrain, streets, zones, and parks — without any backend or framework dependencies. Everything runs client-side in a single `index.html` file, powered by WebAssembly (WASM) solver engines.

Switch between **EPANET** (water distribution pressure networks) and **SWMM** (stormwater/drainage networks) modes with a single toggle. Models can be downloaded as standard `.inp` files for use in EPA SWMM, EPANET, or any compatible tool.

---

## Features

### Network Generation
- EPANET 2.3 / SWMM 5.2.4 mode toggle
- US Customary and SI Metric unit support
- Quick presets from **Tiny (50 nodes)** to **City (100K nodes)**; default: Standard (1K nodes, 32×32 grid)
- Seed-based reproducible generation with prominent seed display, Copy Seed, Dice (randomize), and Lock Seed controls

### Visualization
- Interactive canvas city map with terrain, streets, zones, and parks
- **Quick Sim**: one-click steady-state EPANET solve → pressure heatmap overlay with color-coded legend (green = good, red = low pressure)
- **HGL Profile Plot**: ground / crown / invert / hydraulic grade lines, auto-resizes on tab switch
- **Results tab** with time slider animation
- Click-to-inspect: click any node or pipe for a floating panel with element properties and solver results
- Tooltips on hover for 30+ technical terms and input labels

### Solver Integration (WASM)
- EPANET 2.3 via `epanet-js` + `@model-create/epanet-engine@0.9.0-alpha.1`
- SWMM via `ikegdivs/swmm-js`
- **Phase 4 – WASM Validation Report**: post-solve convergence, mass balance, negative/low pressure, velocity violations, stagnation, and empty tank checks with green/yellow/red severity badge, auto-fix (pipe upsize heuristic + re-solve), and recommendations engine (booster pumps, flushing, tank supply)

### Design & Hydraulics
- **Phase 5 – Demand-Driven Pipe Sizing**: BFS flow estimation from sources, flow-based diameter selection (2–5 ft/s target velocity, min 6" distribution / 12" arterial)
- Design Mode UI with population, per-capita demand (gpcd), peaking factor, and fire flow inputs
- Auto-sizing of reservoirs and pumps; Stats tab design basis display
- SWMM subcatchments use **D8 flow direction algorithm** for drainage boundary routing

### Export & Import
- INP file generation and download with full reporting (Status Full, Summary Yes, Nodes All, Links All)
- DEM and GeoJSON export
- Calibration file export: EPANET `.cal` (Pressure / Head / Demand / Flow / Velocity) and SWMM `.dat` (Depth / Head / Inflow / Flow / Velocity)
- **Batch ZIP export**: generate 2–50 INP models with sequential seeds, packaged as ZIP with `manifest.json` (via JSZip CDN)
- Config save/load (JSON) and Copy Config to clipboard

### UI / Accessibility
- Sidebar settings organized into 4 tabs: Network, Hydraulics, Environment, Map & Export
- Input validation with red/amber border highlighting and toast notifications (blocks generation on invalid values)
- Progress bar with phase labels (e.g., "Building grid nodes… 10%") during generation
- Cooperative yielding (every 50 rows) for UI responsiveness on large grids
- ARIA labels, tabindex, keyboard navigation for all interactive elements

---

## Tabs

| Tab | Description |
|-----|-------------|
| **Map** | Interactive canvas city map |
| **Stats** | Network statistics and design basis |
| **INP** | Raw INP file preview |
| **Docs** | Documentation and parameter reference |
| **HGL** | Hydraulic grade line profile |
| **RPT** | Solver report output |
| **Results** | Animated simulation results |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML / CSS / JavaScript (single `index.html`) |
| Monorepo | pnpm workspaces |
| Language | TypeScript 5.9 |
| API server | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod (`zod/v4`), `drizzle-zod` |
| API codegen | Orval (from OpenAPI spec) |
| Build | esbuild (CJS bundle) |
| Node.js | 24 |

---

## Repository Structure

```
EPANET-SWMM5-Generate/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── epanet-swmm-generator/  # Main single-file web app (index.html)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── screenshots/            # App screenshots
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

---

## Getting Started

### Prerequisites
- [Node.js 24+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### Install & Run

```bash
git clone https://github.com/dickinsonre/EPANET-SWMM5-Generate.git
cd EPANET-SWMM5-Generate
pnpm install
pnpm run dev
```

The app will be served locally. Open the provided URL in your browser.

### Build

```bash
pnpm run build
```

Runs typechecking first, then bundles all packages.

### Typecheck

```bash
pnpm run typecheck
```

---

## Usage

1. **Select a mode** — toggle between EPANET and SWMM in the sidebar.
2. **Choose a preset** — pick a network size (Tiny → City) or enter custom dimensions.
3. **Configure settings** — adjust hydraulics, environment, and map options across the 4 sidebar tabs.
4. **Generate** — click Generate to build the model; watch the progress bar.
5. **Simulate** — use Quick Sim for a one-click steady-state solve and pressure heatmap.
6. **Export** — download the `.inp` file, calibration files, DEM, GeoJSON, or a batch ZIP.

---

## Background

This project is part of ongoing work integrating EPANET and SWMM simulation engines into modern web workflows. It is developed by [Robert Dickinson](https://github.com/dickinsonre), co-author of SWMM3 and long-time contributor to SWMM5, XPSWMM, and InfoWorks ICM.

---

## License

This repository is public. Refer to individual library licenses (`epanet-js`, `swmm-js`) for their respective terms.
