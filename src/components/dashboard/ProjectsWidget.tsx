const projects = [
  { name: "Brand Identity — Flux", client: "Flux Labs", status: "progress", progress: 72, deadline: "Mar 15" },
  { name: "Website Redesign", client: "Mono Studio", status: "started", progress: 15, deadline: "Apr 2" },
  { name: "Mobile App UI", client: "Nextwave", status: "progress", progress: 48, deadline: "Mar 28" },
  { name: "Packaging Design", client: "Verdant Co", status: "completed", progress: 100, deadline: "Feb 10" },
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
  const w = pixelSize?.width ?? 300;

  // Adaptive font sizes
  const titleSize = h > 300 ? "text-4xl" : h > 200 ? "text-3xl" : "text-2xl";
  const labelSize = h > 300 ? "text-sm" : h > 200 ? "text-xs" : "text-[11px]";
  const itemNameSize = w > 400 ? "text-sm" : h > 240 ? "text-xs" : "text-[11px]";
  const subSize = w > 400 ? "text-xs" : "text-[10px]";
  const badgeSize = w > 400 ? "text-[11px]" : "text-[9px]";

  const showList = h > 180;
  const showProgress = h > 260;
  const showDeadline = w > 350;
  const itemCount = h > 400 ? projects.length : h > 300 ? 4 : h > 240 ? 3 : 2;

  if (!showList) {
    const completed = projects.filter(p => p.status === "completed").length;
    const inProgress = projects.filter(p => p.status === "progress").length;
    return (
      <div>
        <p className={`${titleSize} font-bold tracking-tight`}>{projects.length}</p>
        <p className={`${labelSize} opacity-60 mt-1`}>Active Projects</p>
        {h > 160 && (
          <div className={`flex gap-3 mt-2 ${subSize} opacity-50`}>
            <span>{inProgress} in progress</span>
            <span>{completed} done</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className={`${labelSize} opacity-60 font-medium`}>{projects.length} Active Projects</p>
      {projects.slice(0, itemCount).map((project) => (
        <div key={project.name} className="flex items-center gap-2 py-1">
          <div className="flex-1 min-w-0">
            <p className={`${itemNameSize} font-medium truncate`}>{project.name}</p>
            <p className={`${subSize} opacity-50`}>{project.client}</p>
          </div>
          {showDeadline && (
            <span className={`${subSize} opacity-40 shrink-0`}>{project.deadline}</span>
          )}
          {showProgress ? (
            <div className="w-16 shrink-0">
              <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-current rounded-full opacity-40" style={{ width: `${project.progress}%` }} />
              </div>
              <p className="text-[9px] opacity-50 mt-0.5 text-right">{project.progress}%</p>
            </div>
          ) : (
            <span className={`${badgeSize} font-medium px-1.5 py-0.5 rounded-full ${statusStyles[project.status]}`}>
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
