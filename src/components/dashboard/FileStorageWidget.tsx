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

const FileStorageWidget = () => {
  return (
    <div className="space-y-2">
      {files.map((file) => {
        const Icon = icons[file.type] || FileText;
        return (
          <div
            key={file.name}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{file.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {file.project} · {file.size}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${statusStyles[file.status]}`}
            >
              {statusLabels[file.status]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default FileStorageWidget;
