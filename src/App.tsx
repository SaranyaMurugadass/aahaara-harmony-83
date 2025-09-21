import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Home from "./pages/Home";
import PatientAuth from "./components/auth/PatientAuth";
import DoctorAuth from "./components/auth/DoctorAuth";
import DoctorDashboard from "./components/dashboard/DoctorDashboard";
import PatientProfiles from "./pages/PatientProfiles";
import PatientDashboard from "./pages/PatientDashboard";
import FoodDatabase from "./pages/FoodDatabase";
import GenerateDietChart from "./pages/GenerateDietChart";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/patient-login" element={<PatientAuth />} />
              <Route path="/doctor-login" element={<DoctorAuth />} />
              <Route
                path="/doctor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient-profiles"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <PatientProfiles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/food-database"
                element={
                  <ProtectedRoute allowedRoles={["doctor", "patient"]}>
                    <FoodDatabase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/generate-diet-chart"
                element={
                  <ProtectedRoute allowedRoles={["doctor", "patient"]}>
                    <GenerateDietChart />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
