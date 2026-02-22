import { useState, useMemo } from "react";
import {
  FileText, Image, FolderOpen, Film, Search, Plus, Tag, Users,
  ChevronRight, ChevronDown, Folder, MoreHorizontal, Grid3X3, List,
  Upload, Filter, X, File, Music, Archive, HardDrive, Star,
  Download, Trash2, Copy, Move, Eye, Edit2, Clock, ArrowUpDown,
  CheckCircle2, Circle, Bookmark, Palette,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { getSizeTier } from "./WidgetCard";

/* ─── Types ─── */
type FileTag = { label: string; color: string };
type ClientTag = { name: string; avatar: string };
type FileLabel = { text: string; color: string };
type FileItem = {
  id: string; name: string; type: "pdf" | "design" | "image" | "video" | "audio" | "archive" | "doc";
  folder: string; size: string; sizeBytes: number; addedBy: string; date: string;
  tags: FileTag[]; client?: ClientTag; label?: FileLabel; starred: boolean; version: number;
  description?: string;
};
type FolderItem = { id: string; name: string; parent: string | null; fileCount: number; color?: string };

/* ─── Data ─── */
const TAGS: FileTag[] = [
  { label: "Final", color: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" },
  { label: "Draft", color: "bg-amber-500/15 text-amber-400 border border-amber-500/20" },
  { label: "Review", color: "bg-blue-500/15 text-blue-400 border border-blue-500/20" },
  { label: "Archived", color: "bg-muted text-muted-foreground border border-border/30" },
  { label: "Urgent", color: "bg-red-500/15 text-red-400 border border-red-500/20" },
  { label: "Approved", color: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20" },
  { label: "WIP", color: "bg-purple-500/15 text-purple-400 border border-purple-500/20" },
];

const LABELS: FileLabel[] = [
  { text: "Important", color: "bg-red-500" },
  { text: "Client Ready", color: "bg-emerald-500" },
  { text: "Internal", color: "bg-blue-500" },
  { text: "Confidential", color: "bg-amber-500" },
  { text: "Template", color: "bg-purple-500" },
];

const CLIENTS: ClientTag[] = [
  { name: "Acme Corp", avatar: "AC" }, { name: "Stellar Labs", avatar: "SL" },
  { name: "NovaTech", avatar: "NT" }, { name: "Orbit Inc", avatar: "OI" },
  { name: "Zenith Co", avatar: "ZC" },
];

const FOLDERS: FolderItem[] = [
  { id: "all", name: "All Files", parent: null, fileCount: 0 },
  { id: "general", name: "General Knowledge", parent: null, fileCount: 10, color: "bg-blue-500" },
  { id: "onboarding", name: "Onboarding", parent: "general", fileCount: 3, color: "bg-sky-500" },
  { id: "sops", name: "SOPs & Guides", parent: "general", fileCount: 4, color: "bg-cyan-500" },
  { id: "design", name: "Design Assets", parent: null, fileCount: 14, color: "bg-purple-500" },
  { id: "branding", name: "Branding", parent: "design", fileCount: 6, color: "bg-violet-500" },
  { id: "mockups", name: "Mockups", parent: "design", fileCount: 5, color: "bg-fuchsia-500" },
  { id: "contracts", name: "Contracts", parent: null, fileCount: 7, color: "bg-amber-500" },
  { id: "proposals", name: "Proposals", parent: "contracts", fileCount: 3, color: "bg-orange-500" },
  { id: "templates", name: "Templates", parent: null, fileCount: 4, color: "bg-emerald-500" },
];

const initialFiles: FileItem[] = [
  { id: "1", name: "Onboarding-Guide.pdf", type: "pdf", folder: "onboarding", size: "4.2 MB", sizeBytes: 4200000, addedBy: "Kevin Park", date: "Feb 18, 2026", tags: [TAGS[0], TAGS[5]], client: CLIENTS[0], label: LABELS[1], starred: true, version: 3, description: "Complete onboarding guide for new team members" },
  { id: "2", name: "Product-Roadmap.docx", type: "doc", folder: "onboarding", size: "1.8 MB", sizeBytes: 1800000, addedBy: "Sarah Chen", date: "Feb 16, 2026", tags: [TAGS[2]], client: CLIENTS[1], label: LABELS[0], starred: false, version: 2, description: "Q1 2026 product roadmap and milestones" },
  { id: "3", name: "hero-mockup-v3.fig", type: "design", folder: "mockups", size: "18 MB", sizeBytes: 18000000, addedBy: "Jordan Lee", date: "Feb 15, 2026", tags: [TAGS[1], TAGS[6]], client: CLIENTS[0], starred: true, version: 3, description: "Landing page hero section design" },
  { id: "4", name: "brand-guide-final.pdf", type: "pdf", folder: "branding", size: "6.1 MB", sizeBytes: 6100000, addedBy: "Kevin Park", date: "Feb 14, 2026", tags: [TAGS[0]], client: CLIENTS[2], label: LABELS[1], starred: false, version: 1, description: "Brand identity guidelines" },
  { id: "5", name: "NDA-AcmeCorp.pdf", type: "pdf", folder: "contracts", size: "520 KB", sizeBytes: 520000, addedBy: "Sarah Chen", date: "Feb 11, 2026", tags: [TAGS[0]], client: CLIENTS[0], label: LABELS[3], starred: true, version: 1, description: "Non-disclosure agreement with Acme Corp" },
  { id: "6", name: "social-media-pack.zip", type: "archive", folder: "branding", size: "42 MB", sizeBytes: 42000000, addedBy: "Jordan Lee", date: "Feb 10, 2026", tags: [TAGS[0], TAGS[5]], client: CLIENTS[1], starred: false, version: 1, description: "Social media assets bundle" },
  { id: "7", name: "product-demo.mp4", type: "video", folder: "general", size: "120 MB", sizeBytes: 120000000, addedBy: "Kevin Park", date: "Feb 9, 2026", tags: [TAGS[2]], client: CLIENTS[3], starred: false, version: 2, description: "Product walkthrough demo video" },
  { id: "8", name: "podcast-ep12.mp3", type: "audio", folder: "general", size: "35 MB", sizeBytes: 35000000, addedBy: "Sarah Chen", date: "Feb 8, 2026", tags: [TAGS[0]], starred: false, version: 1, description: "Company podcast episode 12" },
  { id: "9", name: "wireframes-v2.fig", type: "design", folder: "mockups", size: "8.4 MB", sizeBytes: 8400000, addedBy: "Jordan Lee", date: "Feb 7, 2026", tags: [TAGS[1]], client: CLIENTS[2], label: LABELS[2], starred: true, version: 2, description: "Dashboard wireframes iteration 2" },
  { id: "10", name: "SOP-client-intake.pdf", type: "pdf", folder: "sops", size: "2.1 MB", sizeBytes: 2100000, addedBy: "Kevin Park", date: "Feb 6, 2026", tags: [TAGS[0]], label: LABELS[4], starred: false, version: 1, description: "Standard operating procedure for client intake" },
  { id: "11", name: "invoice-template.docx", type: "doc", folder: "templates", size: "890 KB", sizeBytes: 890000, addedBy: "Sarah Chen", date: "Feb 5, 2026", tags: [TAGS[0]], label: LABELS[4], starred: false, version: 3, description: "Reusable invoice template" },
  { id: "12", name: "proposal-zenith.pdf", type: "pdf", folder: "proposals", size: "3.4 MB", sizeBytes: 3400000, addedBy: "Jordan Lee", date: "Feb 4, 2026", tags: [TAGS[2]], client: CLIENTS[4], label: LABELS[0], starred: true, version: 1, description: "Project proposal for Zenith Co" },
  { id: "13", name: "hero-banner.png", type: "image", folder: "branding", size: "2.8 MB", sizeBytes: 2800000, addedBy: "Jordan Lee", date: "Feb 3, 2026", tags: [TAGS[0]], client: CLIENTS[0], starred: false, version: 2, description: "Website hero banner image" },
  { id: "14", name: "contract-template.docx", type: "doc", folder: "templates", size: "1.2 MB", sizeBytes: 1200000, addedBy: "Sarah Chen", date: "Feb 2, 2026", tags: [TAGS[0]], label: LABELS[4], starred: false, version: 4, description: "Standard contract template" },
];

const FILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText, design: Palette, image: Image, video: Film, audio: Music, archive: Archive, doc: File,
};

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "text-red-400", design: "text-purple-400", image: "text-blue-400",
  video: "text-pink-400", audio: "text-amber-400", archive: "text-emerald-400", doc: "text-sky-400",
};

/* ─── Preview ─── */
export const FilesPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);
  const rootFolderCount = FOLDERS.filter(f => !f.parent && f.id !== "all").length;
  const usedPct = 54;

  if (tier === "compact") return null;

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-1.5 mt-1">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4" style={{ color: "#3b82f6" }} />
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight leading-none">{initialFiles.length}</p>
            <p className="text-[10px] text-muted-foreground">files</p>
          </div>
        </div>
        <div className="flex-1 space-y-1 overflow-hidden">
          {initialFiles.slice(0, 3).map((f) => (
            <div key={f.id} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#3b82f680" }} />
              <span className="text-[10px] font-medium truncate">{f.name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex-1 h-1.5 bg-foreground/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${usedPct}%`, background: "#3b82f6" }} />
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
          <p className="text-2xl font-bold tracking-tight leading-none">{initialFiles.length}</p>
          <p className="text-xs text-muted-foreground">files</p>
        </div>
        <span className="text-[10px] text-muted-foreground">{rootFolderCount} folders</span>
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {initialFiles.slice(0, 4).map((f) => {
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

/* ─── Expanded Full Page ─── */
export const FilesExpanded = () => {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [search, setSearch] = useState("");
  const [currentFolder, setCurrentFolder] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">("date");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterLabel, setFilterLabel] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["general", "design", "contracts"]));
  const [detailFile, setDetailFile] = useState<FileItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Breadcrumb path
  const getBreadcrumb = (folderId: string): FolderItem[] => {
    const path: FolderItem[] = [];
    let current = FOLDERS.find(f => f.id === folderId);
    while (current) {
      path.unshift(current);
      current = current.parent ? FOLDERS.find(f => f.id === current!.parent) : undefined;
    }
    return path;
  };

  // Get all descendant folder IDs
  const getDescendantIds = (folderId: string): string[] => {
    const children = FOLDERS.filter(f => f.parent === folderId);
    return children.flatMap(c => [c.id, ...getDescendantIds(c.id)]);
  };

  // Filtered & sorted files
  const filteredFiles = useMemo(() => {
    let result = files;

    // Folder filter
    if (currentFolder !== "all") {
      const folderIds = [currentFolder, ...getDescendantIds(currentFolder)];
      result = result.filter(f => folderIds.includes(f.folder));
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q) ||
        f.addedBy.toLowerCase().includes(q) ||
        f.client?.name.toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (filterTag !== "all") {
      result = result.filter(f => f.tags.some(t => t.label === filterTag));
    }

    // Client filter
    if (filterClient !== "all") {
      result = result.filter(f => f.client?.name === filterClient);
    }

    // Label filter
    if (filterLabel !== "all") {
      result = result.filter(f => f.label?.text === filterLabel);
    }

    // Type filter
    if (filterType !== "all") {
      result = result.filter(f => f.type === filterType);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "size": return b.sizeBytes - a.sizeBytes;
        case "type": return a.type.localeCompare(b.type);
        default: return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [files, currentFolder, search, filterTag, filterClient, filterLabel, filterType, sortBy]);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const toggleStar = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, starred: !f.starred } : f));
  };

  const deleteFiles = (ids: string[]) => {
    setFiles(prev => prev.filter(f => !ids.includes(f.id)));
    setSelectedFiles(new Set());
    setDetailFile(null);
  };

  const addTag = (fileId: string, tag: FileTag) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f;
      if (f.tags.some(t => t.label === tag.label)) return f;
      return { ...f, tags: [...f.tags, tag] };
    }));
  };

  const removeTag = (fileId: string, tagLabel: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, tags: f.tags.filter(t => t.label !== tagLabel) } : f
    ));
  };

  const setLabel = (fileId: string, label: FileLabel | undefined) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, label } : f));
  };

  const setClient = (fileId: string, client: ClientTag | undefined) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, client } : f));
  };

  const renameFile = (fileId: string, newName: string) => {
    if (!newName.trim()) return;
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: newName.trim() } : f));
    setRenamingId(null);
  };

  const moveFile = (fileId: string, targetFolder: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, folder: targetFolder } : f));
  };

  const activeFilters = [filterTag, filterClient, filterLabel, filterType].filter(f => f !== "all").length;
  const totalSize = files.reduce((sum, f) => sum + f.sizeBytes, 0);
  const totalCapacity = 500000000; // 500 MB
  const usedPct = Math.round((totalSize / totalCapacity) * 100);

  // Render folder tree
  const renderFolderTree = (parentId: string | null, depth: number = 0) => {
    const children = FOLDERS.filter(f => f.parent === parentId && f.id !== "all");
    return children.map(folder => {
      const hasChildren = FOLDERS.some(f => f.parent === folder.id);
      const isExpanded = expandedFolders.has(folder.id);
      const isActive = currentFolder === folder.id;
      const folderFiles = files.filter(f => f.folder === folder.id).length;

      return (
        <div key={folder.id}>
          <button
            onClick={() => setCurrentFolder(folder.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
              isActive ? "bg-foreground/10 text-foreground font-medium" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {hasChildren ? (
              <button onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }} className="p-0.5">
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            ) : <div className="w-4" />}
            <div className={`w-2 h-2 rounded-full ${folder.color || "bg-muted-foreground"} shrink-0`} />
            <span className="truncate flex-1 text-left">{folder.name}</span>
            <span className="text-[10px] text-muted-foreground">{folderFiles}</span>
          </button>
          {hasChildren && isExpanded && renderFolderTree(folder.id, depth + 1)}
        </div>
      );
    });
  };

  const FileIcon = ({ type }: { type: string }) => {
    const Icon = FILE_ICONS[type] || File;
    return <Icon className={`w-5 h-5 ${FILE_TYPE_COLORS[type] || "text-muted-foreground"} shrink-0`} />;
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-10rem)]">
      {/* Sidebar — Folder Tree */}
      <div className="w-56 shrink-0 flex flex-col gap-3">
        <Button variant="outline" className="w-full gap-2 rounded-xl border-dashed border-foreground/15 text-muted-foreground hover:text-foreground">
          <Upload className="w-4 h-4" /> Upload Files
        </Button>

        <ScrollArea className="flex-1">
          <div className="space-y-0.5">
            <button
              onClick={() => setCurrentFolder("all")}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                currentFolder === "all" ? "bg-foreground/10 text-foreground font-medium" : "text-muted-foreground hover:bg-foreground/5"
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span className="flex-1 text-left">All Files</span>
              <span className="text-[10px] text-muted-foreground">{files.length}</span>
            </button>

            <button
              onClick={() => {
                setFiles(prev => {
                  const starredFiles = prev.filter(f => f.starred);
                  return prev; // Just filter display
                });
                setCurrentFolder("all");
                // We'll filter by starred in a simpler way
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-foreground/5 transition-colors"
            >
              <Star className="w-4 h-4" />
              <span className="flex-1 text-left">Starred</span>
              <span className="text-[10px] text-muted-foreground">{files.filter(f => f.starred).length}</span>
            </button>

            <div className="h-px bg-border/30 my-2" />

            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">Folders</p>
            {renderFolderTree(null, 0)}
          </div>
        </ScrollArea>

        {/* Storage meter */}
        <div className="p-3 rounded-xl bg-foreground/5 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Storage</span>
            <span className="font-medium">{(totalSize / 1000000).toFixed(0)} MB / 500 MB</span>
          </div>
          <Progress value={usedPct} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground">{usedPct}% used</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm">
          {currentFolder === "all" ? (
            <span className="font-medium">All Files</span>
          ) : (
            getBreadcrumb(currentFolder).map((f, i, arr) => (
              <span key={f.id} className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentFolder(f.id)}
                  className={`hover:text-foreground transition-colors ${i === arr.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                >
                  {f.name}
                </button>
                {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
              </span>
            ))
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search files, clients, tags…"
              className="pl-9 rounded-xl bg-foreground/5 border-foreground/10"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeFilters > 0 && (
              <span className="w-4 h-4 rounded-full bg-foreground/20 text-[10px] flex items-center justify-center">{activeFilters}</span>
            )}
          </Button>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-32 rounded-xl border-foreground/10">
              <ArrowUpDown className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border border-foreground/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap gap-2 overflow-hidden"
            >
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-28 rounded-xl border-foreground/10 text-xs h-8">
                  <Tag className="w-3 h-3 mr-1" /> <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {TAGS.map(t => <SelectItem key={t.label} value={t.label}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="w-32 rounded-xl border-foreground/10 text-xs h-8">
                  <Users className="w-3 h-3 mr-1" /> <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {CLIENTS.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterLabel} onValueChange={setFilterLabel}>
                <SelectTrigger className="w-32 rounded-xl border-foreground/10 text-xs h-8">
                  <Bookmark className="w-3 h-3 mr-1" /> <SelectValue placeholder="Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Labels</SelectItem>
                  {LABELS.map(l => <SelectItem key={l.text} value={l.text}>{l.text}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-28 rounded-xl border-foreground/10 text-xs h-8">
                  <File className="w-3 h-3 mr-1" /> <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Document</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                </SelectContent>
              </Select>

              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => { setFilterTag("all"); setFilterClient("all"); setFilterLabel("all"); setFilterType("all"); }}>
                  Clear all
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk actions */}
        <AnimatePresence>
          {selectedFiles.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-2 p-2 rounded-xl bg-foreground/5 overflow-hidden"
            >
              <span className="text-xs font-medium">{selectedFiles.size} selected</span>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Download className="w-3 h-3" /> Download</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Move className="w-3 h-3" /> Move</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Tag className="w-3 h-3" /> Tag</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-red-400 hover:text-red-300" onClick={() => deleteFiles(Array.from(selectedFiles))}>
                <Trash2 className="w-3 h-3" /> Delete
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedFiles(new Set())}>
                <X className="w-3 h-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Files */}
        <div className="flex gap-4 flex-1 min-h-0">
          <ScrollArea className="flex-1">
            {/* Select all header */}
            {viewMode === "list" && filteredFiles.length > 0 && (
              <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold border-b border-border/20">
                <button onClick={selectAll} className="shrink-0">
                  {selectedFiles.size === filteredFiles.length ? <CheckCircle2 className="w-3.5 h-3.5 text-foreground/40" /> : <Circle className="w-3.5 h-3.5" />}
                </button>
                <span className="flex-1">Name</span>
                <span className="w-20 text-right">Size</span>
                <span className="w-24">Date</span>
                <span className="w-24">Client</span>
                <span className="w-20">Tags</span>
                <span className="w-8" />
              </div>
            )}

            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <FolderOpen className="w-10 h-10 opacity-30" />
                <p className="text-sm">No files found</p>
                <p className="text-xs">Try adjusting your filters or search</p>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-0.5">
                {filteredFiles.map(file => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer group/row ${
                      selectedFiles.has(file.id) ? "bg-foreground/8" : "hover:bg-foreground/4"
                    } ${detailFile?.id === file.id ? "ring-1 ring-foreground/15" : ""}`}
                    onClick={() => setDetailFile(file)}
                  >
                    <button onClick={(e) => { e.stopPropagation(); toggleSelect(file.id); }} className="shrink-0">
                      {selectedFiles.has(file.id) ? <CheckCircle2 className="w-4 h-4 text-foreground/50" /> : <Circle className="w-4 h-4 text-foreground/15 group-hover/row:text-foreground/30" />}
                    </button>

                    <button onClick={(e) => { e.stopPropagation(); toggleStar(file.id); }} className="shrink-0">
                      <Star className={`w-3.5 h-3.5 ${file.starred ? "fill-amber-400 text-amber-400" : "text-foreground/15 group-hover/row:text-foreground/25"}`} />
                    </button>

                    <FileIcon type={file.type} />

                    <div className="flex-1 min-w-0">
                      {renamingId === file.id ? (
                        <Input
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={() => renameFile(file.id, renameValue)}
                          onKeyDown={e => e.key === "Enter" && renameFile(file.id, renameValue)}
                          className="h-6 text-sm py-0 px-1"
                          autoFocus
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          {file.label && (
                            <span className={`w-1.5 h-1.5 rounded-full ${file.label.color} shrink-0`} title={file.label.text} />
                          )}
                          {file.version > 1 && (
                            <span className="text-[9px] text-muted-foreground bg-foreground/5 px-1 rounded">v{file.version}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="w-20 text-right text-xs text-muted-foreground">{file.size}</span>
                    <span className="w-24 text-xs text-muted-foreground">{file.date}</span>

                    <div className="w-24">
                      {file.client ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className="w-4 h-4 rounded-full bg-foreground/10 text-[8px] font-bold flex items-center justify-center">{file.client.avatar}</span>
                          <span className="truncate">{file.client.name}</span>
                        </span>
                      ) : <span className="text-[10px] text-muted-foreground/30">—</span>}
                    </div>

                    <div className="w-20 flex gap-0.5 overflow-hidden">
                      {file.tags.slice(0, 2).map(t => (
                        <span key={t.label} className={`text-[8px] px-1.5 py-0.5 rounded-full shrink-0 ${t.color}`}>{t.label}</span>
                      ))}
                      {file.tags.length > 2 && <span className="text-[8px] text-muted-foreground">+{file.tags.length - 2}</span>}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <button className="w-8 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => { setRenamingId(file.id); setRenameValue(file.name); }}>
                          <Edit2 className="w-3.5 h-3.5 mr-2" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem><Download className="w-3.5 h-3.5 mr-2" /> Download</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="w-3.5 h-3.5 mr-2" /> Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-default">
                            <Move className="w-3.5 h-3.5 mr-2" /> Move to
                            <ChevronRight className="w-3 h-3 ml-auto" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right">
                            {FOLDERS.filter(f => f.id !== "all" && f.id !== file.folder).map(f => (
                              <DropdownMenuItem key={f.id} onClick={() => moveFile(file.id, f.id)}>
                                <div className={`w-2 h-2 rounded-full ${f.color || "bg-muted-foreground"} mr-2`} />
                                {f.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenuSeparator />
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-default">
                            <Tag className="w-3.5 h-3.5 mr-2" /> Add Tag
                            <ChevronRight className="w-3 h-3 ml-auto" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right">
                            {TAGS.filter(t => !file.tags.some(ft => ft.label === t.label)).map(t => (
                              <DropdownMenuItem key={t.label} onClick={() => addTag(file.id, t)}>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${t.color} mr-2`}>{t.label}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-default">
                            <Bookmark className="w-3.5 h-3.5 mr-2" /> Set Label
                            <ChevronRight className="w-3 h-3 ml-auto" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right">
                            <DropdownMenuItem onClick={() => setLabel(file.id, undefined)}>None</DropdownMenuItem>
                            {LABELS.map(l => (
                              <DropdownMenuItem key={l.text} onClick={() => setLabel(file.id, l)}>
                                <div className={`w-2 h-2 rounded-full ${l.color} mr-2`} /> {l.text}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-default">
                            <Users className="w-3.5 h-3.5 mr-2" /> Assign Client
                            <ChevronRight className="w-3 h-3 ml-auto" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right">
                            <DropdownMenuItem onClick={() => setClient(file.id, undefined)}>None</DropdownMenuItem>
                            {CLIENTS.map(c => (
                              <DropdownMenuItem key={c.name} onClick={() => setClient(file.id, c)}>
                                <span className="w-4 h-4 rounded-full bg-foreground/10 text-[8px] font-bold flex items-center justify-center mr-2">{c.avatar}</span>
                                {c.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-400" onClick={() => deleteFiles([file.id])}>
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredFiles.map(file => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className={`relative p-4 rounded-2xl transition-all cursor-pointer group/card ${
                      selectedFiles.has(file.id) ? "bg-foreground/8 ring-1 ring-foreground/15" : "bg-foreground/3 hover:bg-foreground/6"
                    } ${detailFile?.id === file.id ? "ring-1 ring-foreground/20" : ""}`}
                    onClick={() => setDetailFile(file)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-foreground/5`}>
                        <FileIcon type={file.type} />
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); toggleStar(file.id); }}>
                          <Star className={`w-3.5 h-3.5 ${file.starred ? "fill-amber-400 text-amber-400" : "text-foreground/15"}`} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toggleSelect(file.id); }}>
                          {selectedFiles.has(file.id) ? <CheckCircle2 className="w-4 h-4 text-foreground/50" /> : <Circle className="w-4 h-4 text-foreground/15 opacity-0 group-hover/card:opacity-100" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-medium truncate mb-1">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground mb-2">{file.size} · {file.date}</p>

                    {file.label && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${file.label.color}`} />
                        <span className="text-[10px] text-muted-foreground">{file.label.text}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mb-2">
                      {file.tags.slice(0, 2).map(t => (
                        <span key={t.label} className={`text-[8px] px-1.5 py-0.5 rounded-full ${t.color}`}>{t.label}</span>
                      ))}
                    </div>

                    {file.client && (
                      <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-foreground/5">
                        <span className="w-4 h-4 rounded-full bg-foreground/10 text-[7px] font-bold flex items-center justify-center">{file.client.avatar}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{file.client.name}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Detail Panel */}
          <AnimatePresence>
            {detailFile && (
              <motion.div
                initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                className="shrink-0 overflow-hidden"
              >
                <div className="w-[280px] h-full rounded-2xl bg-foreground/3 border border-foreground/8 p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-foreground/5`}>
                      <FileIcon type={detailFile.type} />
                    </div>
                    <button onClick={() => setDetailFile(null)} className="p-1 hover:bg-foreground/5 rounded-lg">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold break-words">{detailFile.name}</h3>
                    {detailFile.description && <p className="text-xs text-muted-foreground mt-1">{detailFile.description}</p>}
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-medium">{detailFile.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{detailFile.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Added</span>
                      <span className="font-medium">{detailFile.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Added by</span>
                      <span className="font-medium">{detailFile.addedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-medium">v{detailFile.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Folder</span>
                      <span className="font-medium">{FOLDERS.find(f => f.id === detailFile.folder)?.name}</span>
                    </div>
                  </div>

                  {/* Label */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-2">Label</p>
                    <div className="flex flex-wrap gap-1.5">
                      {LABELS.map(l => (
                        <button
                          key={l.text}
                          onClick={() => setLabel(detailFile.id, detailFile.label?.text === l.text ? undefined : l)}
                          className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full border transition-colors ${
                            detailFile.label?.text === l.text ? "bg-foreground/10 border-foreground/20 text-foreground" : "border-foreground/10 text-muted-foreground hover:border-foreground/20"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${l.color}`} />
                          {l.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {detailFile.tags.map(t => (
                        <span key={t.label} className={`text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 ${t.color}`}>
                          {t.label}
                          <button onClick={() => { removeTag(detailFile.id, t.label); setDetailFile({ ...detailFile, tags: detailFile.tags.filter(tt => tt.label !== t.label) }); }}>
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-[9px] px-2 py-0.5 rounded-full border border-dashed border-foreground/15 text-muted-foreground hover:text-foreground">
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {TAGS.filter(t => !detailFile.tags.some(ft => ft.label === t.label)).map(t => (
                            <DropdownMenuItem key={t.label} onClick={() => { addTag(detailFile.id, t); setDetailFile({ ...detailFile, tags: [...detailFile.tags, t] }); }}>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${t.color} mr-2`}>{t.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Client */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-2">Client</p>
                    <Select
                      value={detailFile.client?.name || "none"}
                      onValueChange={(v) => {
                        const client = v === "none" ? undefined : CLIENTS.find(c => c.name === v);
                        setClient(detailFile.id, client);
                        setDetailFile({ ...detailFile, client });
                      }}
                    >
                      <SelectTrigger className="h-8 rounded-xl text-xs border-foreground/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No client</SelectItem>
                        {CLIENTS.map(c => (
                          <SelectItem key={c.name} value={c.name}>
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-foreground/10 text-[8px] font-bold flex items-center justify-center">{c.avatar}</span>
                              {c.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-1 text-xs border-foreground/10">
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs border-foreground/10 text-red-400 hover:text-red-300" onClick={() => deleteFiles([detailFile.id])}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
