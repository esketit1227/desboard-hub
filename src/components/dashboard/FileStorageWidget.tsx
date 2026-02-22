import { useState } from "react";
import {
  FileText, Image, FolderOpen, Film, Search, Plus, Tag, Users,
  ChevronRight, ChevronDown, Folder, MoreHorizontal, Grid3X3, List,
  Upload, Filter, X, File, Music, Archive, HardDrive,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSizeTier } from "./WidgetCard";

type FileTag = { label: string; color: string };
type ClientTag = { name: string; avatar: string };
type FileItem = {
  id: string; name: string; type: "pdf" | "design" | "image" | "video" | "audio" | "archive" | "doc";
  folder: string; size: string; addedBy: string; date: string; tags: FileTag[]; client?: ClientTag; label?: string;
};
type FolderItem = { id: string; name: string; parent: string | null; fileCount: number; };

const TAGS: FileTag[] = [
  { label: "Final", color: "bg-foreground/10 text-foreground/70" },
  { label: "Draft", color: "bg-foreground/5 text-muted-foreground" },
  { label: "Review", color: "bg-foreground/10 text-foreground/60" },
  { label: "Archived", color: "bg-muted text-muted-foreground" },
  { label: "Urgent", color: "bg-foreground/15 text-foreground" },
];

const CLIENTS: ClientTag[] = [
  { name: "Acme Corp", avatar: "AC" }, { name: "Stellar Labs", avatar: "SL" },
  { name: "NovaTech", avatar: "NT" }, { name: "Orbit Inc", avatar: "OI" },
];

const FOLDERS: FolderItem[] = [
  { id: "general", name: "General Knowledge", parent: null, fileCount: 10 },
  { id: "onboarding", name: "Onboarding", parent: "general", fileCount: 3 },
  { id: "design", name: "Design Assets", parent: null, fileCount: 14 },
  { id: "branding", name: "Branding", parent: "design", fileCount: 6 },
  { id: "contracts", name: "Contracts", parent: null, fileCount: 7 },
];

const FILES: FileItem[] = [
  { id: "1", name: "Onboarding-Guide.pdf", type: "pdf", folder: "onboarding", size: "4.2 MB", addedBy: "kevin@mail.com", date: "Feb 18, 2026", tags: [TAGS[0]], client: CLIENTS[0] },
  { id: "2", name: "Product-Roadmap.docx", type: "doc", folder: "onboarding", size: "1.8 MB", addedBy: "sarah@mail.com", date: "Feb 16, 2026", tags: [TAGS[2]], client: CLIENTS[1] },
  { id: "3", name: "hero-mockup-v3.fig", type: "design", folder: "design", size: "18 MB", addedBy: "jordan@mail.com", date: "Feb 15, 2026", tags: [TAGS[1]], client: CLIENTS[0] },
  { id: "4", name: "brand-guide-final.pdf", type: "pdf", folder: "branding", size: "6.1 MB", addedBy: "kevin@mail.com", date: "Feb 14, 2026", tags: [TAGS[0]], client: CLIENTS[2] },
  { id: "5", name: "NDA-AcmeCorp.pdf", type: "pdf", folder: "contracts", size: "520 KB", addedBy: "sarah@mail.com", date: "Feb 11, 2026", tags: [TAGS[0]], client: CLIENTS[0] },
];

const FILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText, design: FolderOpen, image: Image, video: Film, audio: Music, archive: Archive, doc: File,
};

export const FilesPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);
  const rootFolderCount = FOLDERS.filter(f => !f.parent).length;
  const usedPct = 54;

  if (tier === "compact") return null;

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-1.5 mt-1">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">{FILES.length}</p>
          <p className="text-[10px] text-muted-foreground">files</p>
        </div>
        <div className="flex-1 space-y-1 overflow-hidden">
          {FILES.slice(0, 3).map((f) => (
            <div key={f.id} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-foreground/30 shrink-0" />
              <span className="text-[10px] font-medium truncate">{f.name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex-1 h-1 bg-foreground/8 rounded-full overflow-hidden">
            <div className="h-full bg-foreground/20 rounded-full" style={{ width: `${usedPct}%` }} />
          </div>
          <span className="text-[9px] text-muted-foreground">{usedPct}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2 mt-1">
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">{FILES.length}</p>
          <p className="text-xs text-muted-foreground">files</p>
        </div>
        <span className="text-[10px] text-muted-foreground">{rootFolderCount} folders</span>
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {FILES.slice(0, 4).map((f) => {
          const Icon = FILE_ICONS[f.type] || File;
          return (
            <div key={f.id} className="flex items-center gap-2">
              <Icon className="w-3 h-3 text-foreground/30 shrink-0" />
              <span className="text-[10px] font-medium truncate flex-1">{f.name}</span>
              <span className="text-[8px] text-muted-foreground">{f.size}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-auto pt-1 border-t border-foreground/8">
        <div className="flex-1 h-1 bg-foreground/8 rounded-full overflow-hidden">
          <div className="h-full bg-foreground/20 rounded-full" style={{ width: `${usedPct}%` }} />
        </div>
        <span className="text-[9px] text-muted-foreground">{usedPct}% used</span>
      </div>
    </div>
  );
};

export const FilesExpanded = () => {
  const [search, setSearch] = useState("");
  const filtered = FILES.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files…" className="pl-9 rounded-xl" />
      </div>
      <div className="space-y-2">
        {filtered.map(f => {
          const Icon = FILE_ICONS[f.type] || File;
          return (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <Icon className="w-5 h-5 text-foreground/40 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-[10px] text-muted-foreground">{f.size} · {f.date}</p>
              </div>
              <div className="flex gap-1">
                {f.tags.map(t => <span key={t.label} className={`text-[9px] px-1.5 py-0.5 rounded-full ${t.color}`}>{t.label}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
