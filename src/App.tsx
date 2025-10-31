
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SpeakerProvider } from "@/contexts/SpeakerContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainAdminRoute from "@/components/MainAdminRoute";
import Home from "./pages/Home";
import LoadingSpinner from "@/components/LoadingSpinner";

const Admin = React.lazy(() => import("./pages/Admin"));
const Dev = React.lazy(() => import("./pages/Dev"));
const Login = React.lazy(() => import("./pages/Login"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

function App() {
  const enableAdmin = import.meta.env.VITE_ENABLE_ADMIN !== 'false';

  return (
    <AuthProvider>
      <SpeakerProvider>
        <TooltipProvider>
          <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/admin"
                element={
                  enableAdmin ? (
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/dev"
                element={
                  enableAdmin ? (
                    <MainAdminRoute>
                      <Dev />
                    </MainAdminRoute>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  enableAdmin ? <Login /> : <Navigate to="/" replace />
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </SpeakerProvider>
  </AuthProvider>
  );
}

export default App;
