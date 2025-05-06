import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import WarrantiesPage from "./pages/WarrantiesPage";
import AddWarrantyPage from "./pages/AddWarrantyPage";
import WarrantyDetailPage from "./pages/WarrantyDetailPage";
import NotFound from "./pages/NotFound";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const queryClient = new QueryClient();

// ProtectedRoute component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected.
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warranties"
              element={
                <ProtectedRoute>
                  <WarrantiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-warranty"
              element={
                <ProtectedRoute>
                  <AddWarrantyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warranty/:id"
              element={
                <ProtectedRoute>
                  <WarrantyDetailPage />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
