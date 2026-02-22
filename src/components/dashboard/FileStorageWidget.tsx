import { useState } from "react";
import {
  FileText, Image, FolderOpen, Film, Search, Plus, Tag, Users,
  ChevronRight, ChevronDown, Folder, MoreHorizontal, Grid3X3, List,
  Upload, Filter, X, File, Music, Archive,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ─── Types ─── */
type FileTag = { label: string; color: string };
type ClientTag = { name: string; avatar: string };
type FileItem = {
  id: string;
  name: string;
  type: "pdf" | "design" | "image" | "video" | "audio" | "archive" | "doc";
  folder: string;
  size: string;
  addedBy: string;
  date: string;
  tags: FileTag[];
  client?: ClientTag;
  label?: string;
};
type FolderItem = {
  id: string;
  name: string;
  parent: string | null;
  fileCount: number;
};

/* ─── Mock Data ─── */
const TAGS: FileTag[] = [
  { label: "Final", color: "bg-success/15 text-success" },
  { label: "Draft", color: "bg-warning/15 text-warning" },
  { label: "Review", color: "bg-primary/15 text-primary" },
  { label: "Archived", color: "bg-muted text-muted-foreground" },
  { label: "Urgent", color: "bg-destructive/15 text-destructive" },
];

const CLIENTS: ClientTag[] = [
  { name: "Acme Corp", avatar: "AC" },
  { name: "Stellar Labs", avatar: "SL" },
  { name: "NovaTech", avatar: "NT" },
  { name: "Orbit Inc", avatar: "OI" },
];

const FOLDERS: FolderItem[] = [
  { id: "general", name: "General Knowledge", parent: null, fileCount: 10 },
  { id: "onboarding", name: "Onboarding", parent: "general", fileCount: 3 },
  { id: "sub1", name: "Templates", parent: "onboarding", fileCount: 5 },
  { id: "sub2", name: "Guides", parent: "onboarding", fileCount: 10 },
  { id: "integrations", name: "Integrations", parent: "general", fileCount: 5 },
  { id: "documents", name: "Documents", parent: "general", fileCount: 8 },
  { id: "design", name: "Design Assets", parent: null, fileCount: 14 },
  { id: "branding", name: "Branding", parent: "design", fileCount: 6 },
  { id: "mockups", name: "Mockups", parent: "design", fileCount: 8 },
  { id: "contracts", name: "Contracts", parent: null, fileCount: 7 },
];

const FILES: FileItem[] = [
  { id: "1", name: "Onboarding-Guide.pdf", type: "pdf", folder: "onboarding", size: "4.2 MB", addedBy: "kevin@mail.com", date: "Feb 18, 2026", tags: [TAGS[0]], client: CLIENTS[0], label: "Important" },
  { id: "2", name: "Product-Roadmap.docx", type: "doc", folder: "onboarding", size: "1.8 MB", addedBy: "sarah@mail.com", date: "Feb 16, 2026", tags: [TAGS[2]], client: CLIENTS[1] },
  { id: "3", name: "hero-mockup-v3.fig", type: "design", folder: "mockups", size: "18 MB", addedBy: "jordan@mail.com", date: "Feb 15, 2026", tags: [TAGS[1]], client: CLIENTS[0] },
  { id: "4", name: "brand-guide-final.pdf", type: "pdf", folder: "branding", size: "6.1 MB", addedBy: "kevin@mail.com", date: "Feb 14, 2026", tags: [TAGS[0]], client: CLIENTS[2], label: "Approved" },
  { id: "5", name: "app-screens-v2.png", type: "image", folder: "mockups", size: "2.8 MB", addedBy: "alex@mail.com", date: "Feb 13, 2026", tags: [TAGS[2]], client: CLIENTS[1] },
  { id: "6", name: "intro-animation.mp4", type: "video", folder: "branding", size: "24 MB", addedBy: "jordan@mail.com", date: "Feb 12, 2026", tags: [TAGS[0]], client: CLIENTS[3] },
  { id: "7", name: "NDA-AcmeCorp.pdf", type: "pdf", folder: "contracts", size: "520 KB", addedBy: "sarah@mail.com", date: "Feb 11, 2026", tags: [TAGS[0]], client: CLIENTS[0], label: "Signed" },
  { id: "8", name: "API-docs.md", type: "doc", folder: "integrations", size: "340 KB", addedBy: "alex@mail.com", date: "Feb 10, 2026", tags: [TAGS[1]] },
  { id: "9", name: "podcast-ep3.mp3", type: "audio", folder: "general", size: "45 MB", addedBy: "kevin@mail.com", date: "Feb 9, 2026", tags: [TAGS[4]], client: CLIENTS[2] },
  { id: "10", name: "assets-bundle.zip", type: "archive", folder: "design", size: "120 MB", addedBy: "jordan@mail.com", date: "Feb 8, 2026", tags: [TAGS[3]] },
];

/* ─── Icon Map ─── */
const FILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  design: FolderOpen,
  image: Image,
  video: Film,
  audio: Music,
  archive: Archive,
  doc: File,
};

/* ─── Folder Tree Component ─── */
const FolderTreeNode = ({
  folder,
  allFolders,
  selectedFolder,
  onSelect,
  depth = 0,
}: {
  folder: FolderItem;
  allFolders: FolderItem[];
  selectedFolder: string | null;
  onSelect: (id: string) => void;
  depth?: number;
}) => {
  const [expanded, setExpanded] = useState(depth === 0);
  const children = allFolders.filter((f) => f.parent === folder.id);
  const isSelected = selectedFolder === folder.id;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(folder.id);
          if (children.length) setExpanded(!expanded);
        }}
        className={`w-full flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-sm transition-colors hover:bg-secondary/60 ${
          isSelected ? "bg-secondary text-foreground font-medium" : "text-muted-foreground"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {children.length > 0 ? (
          expanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <Folder className="w-4 h-4 shrink-0" />
        <span className="truncate flex-1 text-left">{folder.name}</span>
        <span className="text-[10px] bg-secondary rounded-full px-1.5 py-0.5 font-medium">{folder.fileCount}</span>
      </button>
      {expanded && children.map((child) => (
        <FolderTreeNode
          key={child.id}
          folder={child}
          allFolders={allFolders}
          selectedFolder={selectedFolder}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};

/* ─── Compact Preview ─── */
export const FilesPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const h = pixelSize?.height ?? 140;
  const showList = h > 200;
  const itemCount = h > 300 ? 4 : 2;

  if (!showList) {
    return (
      <div>
        <p className="text-3xl font-bold tracking-tight">271 MB</p>
        <p className="text-xs text-muted-foreground mt-1">10 files · 3 folders</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground font-medium">271 MB · 10 files</p>
      {FILES.slice(0, itemCount).map((file) => {
        const Icon = FILE_ICONS[file.type] || FileText;
        return (
          <div key={file.id} className="flex items-center gap-2 py-0.5">
            <Icon className="w-3.5 h-3.5 opacity-50 shrink-0" />
            <span className="text-[11px] font-medium truncate flex-1">{file.name}</span>
            <span className="text-[9px] opacity-40 shrink-0">{file.size}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Full Expanded View ─── */
export const FilesExpanded = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sidebarTab, setSidebarTab] = useState<"folders" | "tags">("folders");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeClientFilter, setActiveClientFilter] = useState<string | null>(null);

  const rootFolders = FOLDERS.filter((f) => !f.parent);

  // Get all descendant folder IDs for a given folder
  const getDescendants = (folderId: string): string[] => {
    const children = FOLDERS.filter((f) => f.parent === folderId);
    return [folderId, ...children.flatMap((c) => getDescendants(c.id))];
  };

  const filteredFiles = FILES.filter((f) => {
    if (selectedFolder) {
      const validFolders = getDescendants(selectedFolder);
      if (!validFolders.includes(f.folder)) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!f.name.toLowerCase().includes(q) && !f.addedBy.toLowerCase().includes(q) && !f.client?.name.toLowerCase().includes(q)) return false;
    }
    if (activeTagFilter && !f.tags.some((t) => t.label === activeTagFilter)) return false;
    if (activeClientFilter && f.client?.name !== activeClientFilter) return false;
    return true;
  });

  const currentFolderName = selectedFolder ? FOLDERS.find((f) => f.id === selectedFolder)?.name : "All Files";
  const subFolders = selectedFolder ? FOLDERS.filter((f) => f.parent === selectedFolder) : rootFolders;

  return (
    <div className="flex gap-0 -mx-6 -mb-6 -mt-4 h-[70vh]">
      {/* Left Sidebar */}
      <div className="w-[260px] border-r border-border/40 flex flex-col shrink-0">
        {/* Search */}
        <div className="p-3 border-b border-border/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-secondary/30 border-border/30"
            />
          </div>
        </div>

        {/* Sidebar Tabs */}
        <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as any)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-3 mt-2 h-8 bg-secondary/40">
            <TabsTrigger value="folders" className="text-xs h-6 gap-1"><Folder className="w-3 h-3" />Folders</TabsTrigger>
            <TabsTrigger value="tags" className="text-xs h-6 gap-1"><Tag className="w-3 h-3" />Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="folders" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="p-2">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-sm transition-colors hover:bg-secondary/60 mb-1 ${
                    !selectedFolder ? "bg-secondary text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  <FolderOpen className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">All Files</span>
                  <span className="text-[10px] bg-secondary rounded-full px-1.5 py-0.5 font-medium">{FILES.length}</span>
                </button>
                {rootFolders.map((folder) => (
                  <FolderTreeNode
                    key={folder.id}
                    folder={folder}
                    allFolders={FOLDERS}
                    selectedFolder={selectedFolder}
                    onSelect={setSelectedFolder}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tags" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-1">
                {TAGS.map((tag) => {
                  const count = FILES.filter((f) => f.tags.some((t) => t.label === tag.label)).length;
                  const isActive = activeTagFilter === tag.label;
                  return (
                    <button
                      key={tag.label}
                      onClick={() => setActiveTagFilter(isActive ? null : tag.label)}
                      className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm transition-colors hover:bg-secondary/60 ${
                        isActive ? "bg-secondary font-medium" : ""
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${tag.color.split(" ")[0]}`} />
                      <span className="flex-1 text-left">{tag.label}</span>
                      <span className="text-[10px] text-muted-foreground">{count}</span>
                    </button>
                  );
                })}

                <div className="border-t border-border/30 pt-3 mt-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 px-2">Clients</p>
                  {CLIENTS.map((client) => {
                    const count = FILES.filter((f) => f.client?.name === client.name).length;
                    const isActive = activeClientFilter === client.name;
                    return (
                      <button
                        key={client.name}
                        onClick={() => setActiveClientFilter(isActive ? null : client.name)}
                        className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm transition-colors hover:bg-secondary/60 ${
                          isActive ? "bg-secondary font-medium" : ""
                        }`}
                      >
                        <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                          {client.avatar}
                        </div>
                        <span className="flex-1 text-left truncate">{client.name}</span>
                        <span className="text-[10px] text-muted-foreground">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-sm font-semibold truncate">{currentFolderName}</h3>
            {(activeTagFilter || activeClientFilter) && (
              <div className="flex items-center gap-1.5">
                {activeTagFilter && (
                  <Badge variant="secondary" className="text-[10px] gap-1 h-5 cursor-pointer" onClick={() => setActiveTagFilter(null)}>
                    {activeTagFilter} <X className="w-2.5 h-2.5" />
                  </Badge>
                )}
                {activeClientFilter && (
                  <Badge variant="secondary" className="text-[10px] gap-1 h-5 cursor-pointer" onClick={() => setActiveClientFilter(null)}>
                    {activeClientFilter} <X className="w-2.5 h-2.5" />
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewMode("list")}>
              <List className={`w-3.5 h-3.5 ${viewMode === "list" ? "text-foreground" : "text-muted-foreground"}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewMode("grid")}>
              <Grid3X3 className={`w-3.5 h-3.5 ${viewMode === "grid" ? "text-foreground" : "text-muted-foreground"}`} />
            </Button>
            <Button size="sm" className="h-7 text-xs gap-1 ml-2">
              <Upload className="w-3 h-3" /> Upload
            </Button>
          </div>
        </div>

        {/* Sub-folders row */}
        {subFolders.length > 0 && (
          <div className="px-5 py-3 border-b border-border/20">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Folders</p>
            <div className="flex gap-2 flex-wrap">
              {subFolders.map((sf) => (
                <button
                  key={sf.id}
                  onClick={() => setSelectedFolder(sf.id)}
                  className="flex items-center gap-2 bg-secondary/40 hover:bg-secondary/60 rounded-xl px-3 py-2 transition-colors group"
                >
                  <Folder className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <div className="text-left">
                    <p className="text-xs font-medium">{sf.name}</p>
                    <p className="text-[10px] text-muted-foreground">{sf.fileCount} Files</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* File List / Grid */}
        <ScrollArea className="flex-1">
          {viewMode === "list" ? (
            <div className="px-5 py-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_120px_100px_80px_80px_32px] gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                <span>Name</span>
                <span>Client</span>
                <span>Added By</span>
                <span>Size</span>
                <span>Tags</span>
                <span />
              </div>
              {filteredFiles.length === 0 && (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No files found
                </div>
              )}
              {filteredFiles.map((file) => {
                const Icon = FILE_ICONS[file.type] || FileText;
                return (
                  <div
                    key={file.id}
                    className="grid grid-cols-[1fr_120px_100px_80px_80px_32px] gap-2 items-center px-3 py-2.5 rounded-xl hover:bg-secondary/30 transition-colors group cursor-pointer"
                  >
                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] text-muted-foreground">{file.date}</p>
                          {file.label && (
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{file.label}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Client */}
                    <div>
                      {file.client ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold shrink-0">
                            {file.client.avatar}
                          </div>
                          <span className="text-xs text-muted-foreground truncate">{file.client.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </div>

                    {/* Added By */}
                    <span className="text-xs text-muted-foreground truncate">{file.addedBy.split("@")[0]}</span>

                    {/* Size */}
                    <span className="text-xs text-muted-foreground">{file.size}</span>

                    {/* Tags */}
                    <div className="flex gap-1 flex-wrap">
                      {file.tags.map((t) => (
                        <span key={t.label} className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${t.color}`}>{t.label}</span>
                      ))}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="text-xs">Open</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Rename</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Move to…</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Add Tag</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Assign Client</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Add Label</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-3 grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredFiles.length === 0 && (
                <div className="col-span-full text-center py-12 text-sm text-muted-foreground">
                  No files found
                </div>
              )}
              {filteredFiles.map((file) => {
                const Icon = FILE_ICONS[file.type] || FileText;
                return (
                  <div
                    key={file.id}
                    className="rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors p-4 cursor-pointer group relative"
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="text-xs">Open</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">Rename</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">Move to…</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">Add Tag</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{file.size} · {file.date}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {file.tags.map((t) => (
                        <span key={t.label} className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${t.color}`}>{t.label}</span>
                      ))}
                      {file.label && (
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{file.label}</span>
                      )}
                    </div>
                    {file.client && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-4 h-4 rounded bg-primary/10 text-primary flex items-center justify-center text-[7px] font-bold">
                          {file.client.avatar}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{file.client.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
