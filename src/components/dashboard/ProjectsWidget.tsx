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

const ProjectsWidget = () => {
  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div key={project.name} className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{project.name}</p>
            <p className="text-xs text-muted-foreground">{project.client}</p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${statusStyles[project.status]}`}
          >
            {statusLabels[project.status]}
          </span>
          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden shrink-0">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectsWidget;
