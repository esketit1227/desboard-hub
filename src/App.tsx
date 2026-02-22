import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Index from "./pages/Index";
import WidgetPage from "./pages/WidgetPage";
import ClientPortalPage from "./pages/ClientPortalPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
          <Route path="/widget/:id" element={<DashboardLayout><WidgetPage /></DashboardLayout>} />
          <Route path="/portal/:portalId" element={<DashboardLayout><ClientPortalPage /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
