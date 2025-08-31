import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import Game from "./pages/Game";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import GameControl from "./pages/admin/GameControl";
import DemoAccounts from "./pages/admin/DemoAccounts";
import WithdrawalApprovals from "./pages/admin/WithdrawalApprovals";
import LiveUsers from "./pages/admin/LiveUsers";
import Customization from "./pages/admin/Customization";
import Integrations from "./pages/admin/Integrations";
import Reports from "./pages/admin/Reports";
import Transactions from "./pages/admin/Transactions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-casino flex items-center justify-center">
        <div className="text-casino-gold">Carregando...</div>
      </div>
    );
  }

  return user ? <Game /> : <AuthForm />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/game-control" element={<GameControl />} />
            <Route path="/admin/demo-accounts" element={<DemoAccounts />} />
            <Route path="/admin/approvals" element={<WithdrawalApprovals />} />
            <Route path="/admin/live-games" element={<LiveUsers />} />
            <Route path="/admin/customization" element={<Customization />} />
            <Route path="/admin/integrations" element={<Integrations />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/transactions" element={<Transactions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
