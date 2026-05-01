import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/I18nProvider";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Method from "./pages/Method";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import BeforeAfter from "./pages/BeforeAfter";
import FindProperty from "./pages/FindProperty";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDemandes from "./pages/admin/AdminDemandes";
import AdminReseau from "./pages/admin/AdminReseau";
import AdminEnvois from "./pages/admin/AdminEnvois";
import AdminParametres from "./pages/admin/AdminParametres";
import AdminWorkflow from "./pages/admin/AdminWorkflow";
import AdminDocuSign from "./pages/admin/AdminDocuSign";
import { AdminGate } from "./pages/admin/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/method" element={<Method />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/before-after" element={<BeforeAfter />} />
            <Route path="/find-your-property" element={<FindProperty />} />
            <Route path="/contact" element={<Contact />} />
            {/* Legacy FR routes for backwards compatibility */}
            <Route path="/a-propos" element={<About />} />
            <Route path="/methode" element={<Method />} />
            <Route path="/projets" element={<Projects />} />
            <Route path="/projets/:slug" element={<ProjectDetail />} />
            <Route path="/avant-apres" element={<BeforeAfter />} />
            <Route path="/recherche-de-bien" element={<FindProperty />} />
            {/* Admin */}
            <Route path="/admin" element={<AdminGate><AdminDashboard /></AdminGate>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/demandes" element={<AdminGate><AdminDemandes /></AdminGate>} />
            <Route path="/admin/reseau" element={<AdminGate><AdminReseau /></AdminGate>} />
            <Route path="/admin/envois" element={<AdminGate><AdminEnvois /></AdminGate>} />
            <Route path="/admin/parametres" element={<AdminGate><AdminParametres /></AdminGate>} />
            <Route path="/admin/workflow" element={<AdminGate><AdminWorkflow /></AdminGate>} />
            <Route path="/admin/settings/docusign" element={<AdminGate><AdminDocuSign /></AdminGate>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
