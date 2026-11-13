import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./components/ProtectedRoute";
import Background3DWorld from "./components/Background3DWorld";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import Services from "./pages/Services";
import BookService from "./pages/BookService";
import MyBookings from "./pages/MyBookings";
import CustomerOverview from "./pages/CustomerOverview";
import WorkerDashboard from "./pages/WorkerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { ToastProvider } from "./components/ui";
import { SceneDataProvider } from "./scene/SceneStore";
import { SceneErrorBoundary, AppErrorBoundary } from "./scene/SceneErrorFallback";

function WorldRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/services" element={<Services />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book/:serviceId"
            element={
              <ProtectedRoute roles={["customer"]}>
                <BookService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute roles={["customer"]}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker"
            element={
              <ProtectedRoute roles={["worker"]}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SceneDataProvider>
        <ToastProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-emerald-900 shadow-lg"
          >
            Skip to content
          </a>

          {/* Persistent Nexbot 3D Robot Background Mounted Once Across App */}
          <SceneErrorBoundary>
            <Background3DWorld />
          </SceneErrorBoundary>

          {/* Subtle Photographic Grain Veil */}
          <div className="grain pointer-events-none" aria-hidden="true" />

          {/* Application Content */}
          <div id="main" className="relative min-h-screen">
            <AppErrorBoundary>
              <WorldRoutes />
            </AppErrorBoundary>
          </div>
        </ToastProvider>
      </SceneDataProvider>
    </BrowserRouter>
  );
}
