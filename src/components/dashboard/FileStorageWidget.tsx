import { FileText, Image, FolderOpen, Film } from "lucide-react";

const files = [
  { name: "flux-brand-guide.pdf", type: "pdf", project: "Brand Identity", status: "completed", size: "4.2 MB" },
  { name: "hero-mockup.fig", type: "design", project: "Website Redesign", status: "progress", size: "18 MB" },
  { name: "app-screens-v2.png", type: "image", project: "Mobile App UI", status: "progress", size: "2.8 MB" },
  { name: "intro-animation.mp4", type: "video", project: "Brand Identity", status: "completed", size: "24 MB" },
];

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  design: FolderOpen,
  image: Image,
  video: Film,
};

const statusStyles: Record<string, string> = {
  completed: "bg-success/10 text-success",
  progress: "bg-primary/10 text-primary",
  started: "bg-warning/10 text-warning",
};

const statusLabels: Record<string, string> = {
  completed: "Done",
  progress: "Active",
  started: "New",
};

/** Compact preview */
export const FilesPreview = () => (
  <div>
    <p className="text-3xl font-bold tracking-tight">49 MB</p>
    <p className="text-xs text-muted-foreground mt-1">4 files stored</p>
    <div className="flex items-center gap-2 mt-3 flex-wrap">
      {files.slice(0, 3).map((f) => {
        const Icon = icons[f.type] || FileText;
        return (
          <div key={f.name} className="flex items-center gap-1.5 bg-secondary/50 rounded-lg px-2 py-1">
            <Icon className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-medium truncate max-w-[70px]">{f.name}</span>
          </div>
        );
      })}
      <span className="text-[10px] text-muted-foreground">+1 more</span>
    </div>
  </div>
);

/** Full expanded view */
export const FilesExpanded = () => (
  <div className="space-y-3">
    {files.map((file) => {
      const Icon = icons[file.type] || FileText;
      return (
        <div
          key={file.name}
          className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {file.project} · {file.size}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 ${statusStyles[file.status]}`}
          >
            {statusLabels[file.status]}
          </span>
        </div>
      );
    })}
  </div>
);
