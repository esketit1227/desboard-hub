const projects = [
  { name: "Brand Identity — Flux", client: "Flux Labs", status: "progress", progress: 72 },
  { name: "Website Redesign", client: "Mono Studio", status: "started", progress: 15 },
  { name: "Mobile App UI", client: "Nextwave", status: "progress", progress: 48 },
  { name: "Packaging Design", client: "Verdant Co", status: "completed", progress: 100 },
];

const statusStyles: Record<string, string> = {
  progress: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  started: "bg-warning/10 text-warning",
};

const statusLabels: Record<string, string> = {
  progress: "In Progress",
  completed: "Completed",
  started: "Just Started",
};

/** Compact preview for dashboard */
export const ProjectsPreview = () => (
  <div>
    <p className="text-3xl font-bold tracking-tight">4</p>
    <p className="text-xs opacity-70 mt-1">Active Projects</p>
    <div className="flex gap-1.5 mt-3">
      {projects.map((p) => (
        <div
          key={p.name}
          className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden"
        >
          <div
            className="h-full bg-primary/70 rounded-full"
            style={{ width: `${p.progress}%` }}
          />
        </div>
      ))}
    </div>
    <div className="flex items-center gap-3 mt-3">
      <span className="text-[10px] opacity-60">2 In Progress</span>
      <span className="text-[10px] opacity-60">1 Just Started</span>
      <span className="text-[10px] opacity-60">1 Done</span>
    </div>
  </div>
);

/** Full expanded view */
export const ProjectsExpanded = () => (
  <div className="space-y-4">
    {projects.map((project) => (
      <div key={project.name} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{project.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{project.client}</p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 ${statusStyles[project.status]}`}
        >
          {statusLabels[project.status]}
        </span>
        <div className="w-24 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">{project.progress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>
    ))}
  </div>
);
