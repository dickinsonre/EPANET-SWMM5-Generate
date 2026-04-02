async function loadEpanetModules() {
  const { Project, Workspace } = await import("epanet-js");
  (window as any).__EpanetProject = Project;
  (window as any).__EpanetWorkspace = Workspace;
}

(window as any).__loadEpanetModules = loadEpanetModules;
