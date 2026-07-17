---
name: WebGL unavailable in e2e test browser
description: The Playwright testing subagent's headless browser cannot create WebGL contexts.
---
The e2e testing subagent's browser has no WebGL (context creation throws). Any Three.js/WebGL feature cannot be visually verified in CI.
**Why:** discovered when adding the 3D terrain view — "Error creating WebGL context" in every test run.
**How to apply:** for WebGL features, verify the graceful no-WebGL fallback path in e2e instead, reason through the render math carefully (or ask the user to confirm visually), and always wrap WebGLRenderer construction in try/catch with a friendly message.
