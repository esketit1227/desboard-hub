import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  FolderKanban, CalendarDays, Users, DollarSign, HardDrive,
  Receipt, ListTodo, MessageSquare, BarChart3, Briefcase,
} from "lucide-react";
import { ProjectsExpanded } from "@/components/dashboard/ProjectsWidget";
import { CalendarExpanded } from "@/components/dashboard/CalendarWidget";
import { ClientsExpanded } from "@/components/dashboard/ClientPortalWidget";
import { FinancesExpanded } from "@/components/dashboard/FinancesWidget";
import { FilesExpanded } from "@/components/dashboard/FileStorageWidget";
import { InvoicesExpanded } from "@/components/dashboard/InvoicesWidget";
import { TasksExpanded } from "@/components/dashboard/TasksWidget";
import { MessagesExpanded } from "@/components/dashboard/MessagesWidget";
import { AnalyticsExpanded } from "@/components/dashboard/AnalyticsWidget";
import { StudioExpanded } from "@/components/dashboard/StudioWidget";

const WIDGET_MAP: Record<string, { title: string; icon: React.ReactNode; expanded: React.ComponentType }> = {
  projects: { title: "Projects", icon: <FolderKanban className="w-5 h-5" />, expanded: ProjectsExpanded },
  calendar: { title: "Calendar", icon: <CalendarDays className="w-5 h-5" />, expanded: CalendarExpanded },
  finances: { title: "Finances", icon: <DollarSign className="w-5 h-5" />, expanded: FinancesExpanded },
  clients: { title: "Client Portal", icon: <Users className="w-5 h-5" />, expanded: ClientsExpanded },
  files: { title: "File Storage", icon: <HardDrive className="w-5 h-5" />, expanded: FilesExpanded },
  invoices: { title: "Invoices", icon: <Receipt className="w-5 h-5" />, expanded: InvoicesExpanded },
  tasks: { title: "Tasks", icon: <ListTodo className="w-5 h-5" />, expanded: TasksExpanded },
  messages: { title: "Messages", icon: <MessageSquare className="w-5 h-5" />, expanded: MessagesExpanded },
  analytics: { title: "Analytics", icon: <BarChart3 className="w-5 h-5" />, expanded: AnalyticsExpanded },
  studio: { title: "Studio", icon: <Briefcase className="w-5 h-5" />, expanded: StudioExpanded },
};

const WidgetPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const widget = id ? WIDGET_MAP[id] : null;

  if (!widget) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Widget not found</p>
      </div>
    );
  }

  const Expanded = widget.expanded;

  return (
    <div className="min-h-screen bg-background p-3 md:p-5 lg:p-6">
      <div className="dashboard-container min-h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-50 px-5 py-4 flex items-center gap-3 border-b border-border/30">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl p-2 hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{widget.icon}</span>
            <h1 className="text-lg font-bold">{widget.title}</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-8 lg:p-10 overflow-auto">
          <Expanded />
        </main>
      </div>
    </div>
  );
};

export default WidgetPage;
