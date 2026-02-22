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

/** Compact preview — reveals more at larger sizes */
export const ProjectsPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const h = pixelSize?.height ?? 140;
  const showList = h > 200;
  const showProgress = h > 280;
  const itemCount = h > 360 ? projects.length : h > 280 ? 3 : 2;

  if (!showList) {
    return (
      <div>
        <p className="text-3xl font-bold tracking-tight">4</p>
        <p className="text-xs opacity-60 mt-1">Active Projects</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs opacity-60 font-medium">{projects.length} Active Projects</p>
      {projects.slice(0, itemCount).map((project) => (
        <div key={project.name} className="flex items-center gap-3 py-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{project.name}</p>
            <p className="text-[10px] opacity-50">{project.client}</p>
          </div>
          {showProgress ? (
            <div className="w-16 shrink-0">
              <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-current rounded-full opacity-40" style={{ width: `${project.progress}%` }} />
              </div>
              <p className="text-[9px] opacity-50 mt-0.5 text-right">{project.progress}%</p>
            </div>
          ) : (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusStyles[project.status]}`}>
              {statusLabels[project.status]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

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
