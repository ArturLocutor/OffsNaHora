
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SpeakerProvider } from "@/contexts/SpeakerContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

function App() {
  const enableAdmin = import.meta.env.VITE_ENABLE_ADMIN !== 'false';

  return (
    <AuthProvider>
      <SpeakerProvider>
        <TooltipProvider>
          <BrowserRouter>
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
              path="/login"
              element={
                enableAdmin ? <Login /> : <Navigate to="/" replace />
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </SpeakerProvider>
  </AuthProvider>
  );
}

export default App;
