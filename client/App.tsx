import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotFound from "./pages/NotFound";
import PlantDetail from "./pages/PlantDetail";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Index from "./pages/Index";
import Explore from "./modules/user/Explore";
import Login from "./modules/auth/Login";
import Register from "./modules/auth/Register";
import Dashboard from "./modules/admin/Dashboard";
import MedicationsPage from "./pages/MedicationsPage";
import MedicationDetailPage from "./pages/MedicationDetailPage";
import CompatibilityPage from "./pages/CompatibilityPage";
// import AIChatBot from "./modules/ai/AIChatBot"; // ❌ DESHABILITADO - CAUSA PANTALLA EN BLANCO
import { AuthProvider } from "./modules/auth/useAuth";
import { RequireAuth, RequireAdmin } from "./components/ProtectedRoute";
import ThemeProvider from "./components/ThemeProvider";
import SessionWarning from "./components/SessionWarning";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.main
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Index />
            </motion.main>
          }
        />
        <Route
          path="/explorar"
          element={
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RequireAuth>
                <Explore />
              </RequireAuth>
            </motion.main>
          }
        />
        <Route
          path="/plantas/:id"
          element={
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RequireAuth>
                <PlantDetail />
              </RequireAuth>
            </motion.main>
          }
        />
        <Route
          path="/favoritos"
          element={
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RequireAuth>
                <Favorites />
              </RequireAuth>
            </motion.main>
          }
        />
        <Route
          path="/medications"
          element={
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RequireAuth>
                <MedicationsPage />
              </RequireAuth>
            </motion.main>
          }
        />
        <Route
          path="/medications/:id"
          element={
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RequireAuth>
                <MedicationDetailPage />
              </RequireAuth>
            </motion.main>
          }
        />
        <Route
          path="/compatibilidad"
          element={
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RequireAuth>
                <CompatibilityPage />
              </RequireAuth>
            </motion.main>
          }
        />
        <Route
          path="/perfil"
          element={
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RequireAuth>
                <Profile />
              </RequireAuth>
            </motion.main>
          }
        />
        <Route
          path="/login"
          element={
            <motion.main className="container py-10" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Login />
            </motion.main>
          }
        />
        <Route
          path="/register"
          element={
            <motion.main className="container py-10" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Register />
            </motion.main>
          }
        />
        <Route
          path="/dashboard"
          element={
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RequireAdmin>
                <Dashboard />
              </RequireAdmin>
            </motion.main>
          }
        />
        <Route
          path="/terms"
          element={
            <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Terms />
            </motion.main>
          }
        />
        <Route
          path="/privacy"
          element={
            <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Privacy />
            </motion.main>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Sonner />
            <SessionWarning />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex-1">
                <AnimatedRoutes />
              </div>
              <Footer />
              {/* ❌ AIChatBot DESHABILITADO - CAUSA PANTALLA EN BLANCO */}
              {/* <AIChatBot /> */}
            </div>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

createRoot(document.getElementById("root")!).render(<App />);
