# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/epanet-swmm-generator`

Self-contained EPANET 2.3 & SWMM 5.2.4 Network Generator web application. Generates hydraulically valid water distribution and stormwater network models with interactive canvas city map visualization. The app is a single `index.html` file (4910 lines of vanilla JS/CSS/HTML) served by Vite dev server. No React components or backend needed — all logic runs client-side.

Key features:
- EPANET 2.3 / SWMM 5.2.4 mode toggle
- US Customary / SI Metric units
- Quick presets (Tiny 50 → City 100K nodes), default preset: Standard (1K, 32×32 grid)
- Interactive canvas city map with terrain, streets, zones, parks
- INP file generation and download with full reporting enabled (Status Full, Summary Yes, Nodes All, Links All)
- DEM and GeoJSON export
- Config save/load (JSON) + Copy Config to clipboard
- Seed management: prominent seed display, Copy Seed button, Dice (randomize) button, Lock Seed checkbox, seed stored in INP [TITLE]
- WASM solver engine integration (EPANET 2.3 via epanet-js + @model-create/epanet-engine@0.9.0-alpha.1, SWMM via ikegdivs/swmm-js)
- Multiple tabs: Map, Stats, INP, Docs, HGL, RPT, Results, AI
- Results visualization with time slider animation
- Calibration file export: EPANET `.cal` (Pressure/Head/Demand/Flow/Velocity) and SWMM `.dat` (Depth/Head/Inflow/Flow/Velocity)
- Batch ZIP export: generates N INP models (2-50) with sequential seeds, packages as ZIP with manifest.json (JSZip CDN)
- Quick Sim: one-click steady-state EPANET solve → pressure heatmap overlay on map canvas with color-coded legend (green=good, red=low)
- HGL profile plot: ground/crown/invert/HGL lines with computed or estimated data, auto-resizes on tab switch
- Sidebar settings organized into 4 tabs: Network, Hydraulics, Environment, Map & Export
- Input validation with red/amber border highlighting and toast notifications blocking generation on invalid values
- Click-to-inspect on canvas: click any node or pipe to see a floating panel with element properties and solver results
- Tooltips on hover for technical terms and input labels (30+ definitions)
- Accessibility: ARIA labels, tabindex, keyboard navigation for section headers and interactive elements
- Progress bar with phase labels (e.g. "Building grid nodes... 10%") during generation
- Cooperative yielding (every 50 rows) for large-grid UI responsiveness
- SWMM subcatchments use D8 flow direction algorithm for drainage boundary routing
- **Phase 4**: WASM Validation Report — post-solve validation analysis (convergence, mass balance, negative/low pressure, velocity violations, stagnation, empty tanks), green/yellow/red severity badge on map, auto-fix (pipe upsize heuristic + re-solve), recommendations engine (booster pumps, flushing, tank supply), RPT integration
- **Phase 5**: Demand-Driven Pipe Sizing — BFS flow estimation from sources, flow-based diameter selection (2-5 ft/s target velocity, min 6" distribution / 12" arterial), Design Mode UI (population, per-capita gpcd, peaking factor, fire flow) auto-sizing reservoirs/pumps, Stats tab design basis display
- **AI Assistant** (🤖 AI tab): summarizes "what the program just did" (the last generated run) and answers free-form questions in plain English. Frontend in `index.html` (`buildAIContext()`/`aiMarkdown()`/`aiRequest()`/`aiSummarize()`/`aiAsk()`) POSTs a compact text snapshot of the current network to the api-server route `POST /api/anthropic/summarize`, which calls Claude (`claude-opus-4-7`) via Replit AI Integrations and returns `{summary, model}`. Stateless — no conversation/message DB tables. No API key (billed to Replit credits).
- **UX (v3.7)**: always-visible health banner (`#previewBanner`, `renderPreviewBanner()`/shared `computeHealth(nd,jc)`) above the preview tabs on every tab after generation — color-coded green/amber/red with "Details →" and (EPANET-only, on deficit/isolated nodes) a "🔧 Fix it" button calling `autoFixGenParams()` (heuristic param bump + regenerate); grouped color-coded Stats (`renderStats()` clusters via `.stats-group-title`); settings auto-persist across refresh via localStorage key `epswConfig` (`persistConfig()`/`restorePersistedConfig()`/`applyConfigObject()`, saved on each generation, restored on load with "Restored your last settings" toast, includes mode/units/seed/lockSeed so Lock-seed reloads reproduce the exact network).
- **Headloss roughness (v3.8)**: `pipeRoughnessForFormula()` converts the stored Hazen-Williams C-factor into the selected formula's native units when writing `[PIPES]` — sand-grain height ε (millifeet US / mm SI) for Darcy-Weisbach, Manning's n for Chezy-Manning, C unchanged for H-W — so D-W/C-M produce physically valid, solvable INPs.
- **Engine toggle/preset regeneration (v3.9)**: `setMode(mode, regen)` now clears the stale preview (`clearOutputPreview()`) and, when `regen` is passed by the toggle buttons, auto-regenerates for the selected engine; `applyPreset()` regenerates in the current engine after setting fields. Fixes SWMM appearing "stuck" on cached EPANET output. Config restore calls `setMode()` without `regen` to avoid double-generation on load.
- **Incremental UI refresh (v4.0)**: four focused, layout-preserving upgrades. (1) **Engine-accent theming** — `setMode()` sets `data-engine` on `<html>`; the CSS rule `html[data-engine="swmm"]` (placed after the brand-theme blocks) overrides `--accent-blue`/`--accent-cyan`/`--water-gradient` to teal so the whole UI re-tints blue↔teal by engine. (2) **Slim top bar** — `.app-header` is a single fixed 52px row; the two static engine badges were replaced by one dynamic `#enginePill` (updated in `setMode()`); `#buildBadge` kept. (3) **Status bar** — `#statusBar` (`.status-bar`) at the top of the preview pane, rendered by `renderStatusBar()` (reads `currentMode`/`currentUnits`/`networkData`/`outputStale`/`lastGenTime`); shows engine tag, units, element counts, and generated/stale/not-generated state. (4) **Stale-output indicator** — globals `outputStale`/`lastGenTime`; a delegated input/change listener on `#controlsPanel` calls `markStale()` (guarded by `_applyingCfg` and `networkData`, excludes `#themeSelect`), showing `#staleNote` (`.stale-note.show`) below `#genBtn`; cleared on each successful `renderStats()` and in `clearOutputPreview()`. `setUnits()` marks stale when a network exists. Uses CSS `color-mix()` for accent-tinted backgrounds.

- **Solver-gated validation (v4.1)**: tier badge strip `#tierStrip` (Generated→Syntax→Topology→Solver→QA) rendered by `renderTierBadges()` from `tierState`; `runTieredValidation()` runs after each generation (syntax via silent `computeINPValidation(inp)`, topology from `networkData`, auto steady-state solve for EPANET ≤2500 junctions via shared `steadyStateSolve()` refactored out of `quickSim()`, unit-aware pressure QA via `applyPressureQA()`); full solver run and Quick Sim also update badges; validation report header reads "Solver + QA Passed". Docs audited for honest claims (no "hydraulically valid" pre-solve, pump 3-point curve *recommended* not required, control-rule PRIORITY semantics, "generator-estimated source capacity", 80-ft zone threshold labeled heuristic, theme non-affiliation disclaimer).
- **Task-oriented UX (v4.1)**: `#stageStrip` Configure›Generate›Validate›Export indicator (`renderStageIndicator()`, driven by `networkData` + `tierState`); `#settingsSearch` box filters `.section` blocks across all settings tabs (`filterSettings()`); builds on existing Simple/Advanced/Expert `setUIMode()`.

- **Kimi review fixes (v4.3)**: removed a stray `</div>` (~line 1777) that closed `.preview-panel` early, making every preview tab except Map render into the 380px sidebar grid column — all tabs now fill the main pane; mode-aware map legends (canvas legend in `drawNetworkOverlay()` + HTML `#legendRow` via `updateLegendRow()` called in `setMode()`) show Junction/Outfall/Pump in SWMM mode; collapsible canvas legend (`_legendCollapsed`/`_legendRect`, click header to toggle, localStorage `epswLegendCollapsed`, hit-test in canvas-internal coords in the inspect click listener); humanized status-bar timestamp ("just now"/"N min ago", exact datetime in tooltip, 60s refresh interval); `#exportProgress` gets `visibility:hidden` until `.visible`.
- **Production hardening (v4.6)**: four correctness/usability fixes from audit. (1) SWMM conduit slope: `makeConduit` no longer mutates shared `node.elev` mid-loop; a post-pass reconciles the minimum required invert per node across all incoming conduits, making slope enforcement order-independent. (2) SWMM outfall multi-inlet: `MAX_OUTFALL_INLETS = 4` (was 1); eliminates dead-end conduits near drainage boundaries. (3) Solver warnings surfaced: `steadyStateSolve()` now returns `{pressures, warnings}`; EPANET Warning 5 / "Valves cannot deliver enough flow" etc. appear as amber toast + amber Solver tier badge in both `runTieredValidation` and `quickSim`. (4) Mobile pinch-zoom: removed `user-scalable=no`/`maximum-scale=1` from viewport meta (WCAG 2.1 SC 1.4.4 / 1.4.10).
- **3D view (v4.5)**: new "3D" preview tab (`#tab-view3d`) with interactive Three.js terrain + network visualization. Three.js r160 lazy-loaded via dynamic `import()` from jsDelivr CDN on first tab open (`_loadThree()`). `_build3DScene()` builds a 96×96 heightfield from node ground elevations (bucket average + iterative neighbor hole-fill + smoothing), renders vertex-colored terrain `PlaneGeometry`, nodes as `THREE.Points` (size scales down for big networks), pipes/pumps/valves as `LineSegments` (blue EPANET / teal SWMM), reservoirs as green cones, tanks as amber cylinders. Custom orbit controls (left-drag rotate, wheel zoom, right-drag pan) in `_apply3DCamera()`; RAF loop only runs while tab visible (`_start3DLoop()`/`stop3DLoop()` hooked into `switchTab()`). Rebuild key `_3dKey()` = network `_genStamp` + exaggeration select (1–12×) + color mode (elevation vs solver pressure/depth) + timestep. Graceful errors for CDN failure / no network.
- **Mockup UX ideas (v4.4)**: clickable numbered workflow stepper (`renderStageIndicator()` emits buttons calling `stageAction(i)` — 0 focuses `#settingsSearch`, 1 `generateNetwork()`, 2 re-runs `runTieredValidation()` guarded by `_solverBusy`, 3 scrolls to first `.download-btn`; Validate/Export locked at 55% opacity + tooltip until `networkData`); per-button tooltips on Simple/Advanced/Expert listing unlocked sections; big-preset confirm modal (`BIG_PRESETS` giant/city, `confirmBigPreset()` overlay with estimated time, re-entry via `applyPreset._confirmed` flag); `.map-toggle` restyled as pill chips using `:has(input:checked)`.
- **UX quick wins (v4.2)**: richer stage strip (spinner `.tier-spin` for running, green connector fills, tinted bold active chip) in `renderStageIndicator()`; tier badges spin while running; first-visit walkthrough (`TOUR_STEPS`/`startTour()`/`tourNext()`/`endTour()`, localStorage `epswTourSeen`, auto-starts 1.2s after load); INP/RPT line filters (`#inpFilter`+`filterINPView()` inside `renderINPPreview()`, `#rptFilter`+`renderRPTPreview()` refactor with `_colorINPLine`/`_colorRPTLine`, 2000-match cap, count notes); `.tab-btn.active` glow.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
