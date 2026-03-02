import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PartnersProvider } from "@/contexts/PartnersContext";
import { SatelliteProvider } from "@/contexts/SatelliteContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import SatelliteUsers from "./pages/SatelliteUsers";
import ToolPlaceholder from "./pages/ToolPlaceholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      {/* Registration is disabled: redirect any /register access to /login */}
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <DashboardGuard>
          <Dashboard />
        </DashboardGuard>
      } />
      <Route path="/dashboard/satellites/users" element={
        <DashboardGuard>
          <SatelliteUsers />
        </DashboardGuard>
      } />
      <Route path="/tool/:toolId" element={<ToolPlaceholder />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SatelliteProvider>
            <PartnersProvider>
              <AppRoutes />
            </PartnersProvider>
          </SatelliteProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
