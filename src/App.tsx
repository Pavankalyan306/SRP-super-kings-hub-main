import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Matches from "./pages/Matches";
import Players from "./pages/Players";
import News from "./pages/News";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Scorecard from "./pages/Scorecard";
import Photos from "./pages/Photos";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

function AuthHashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash || "";
    if (hash.includes("type=recovery")) {
      navigate({ pathname: "/reset-password", hash }, { replace: true });
    }
  }, [navigate]);

  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthHashRedirect />
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/players" element={<Players />} />
                <Route path="/news" element={<News />} />
                <Route path="/match/:matchId" element={<Scorecard />} />
                <Route path="/photos" element={<Photos />} />
                <Route path="/about" element={<About />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
