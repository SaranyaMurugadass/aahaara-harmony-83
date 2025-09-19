import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PatientAuth from "./components/auth/PatientAuth";
import DoctorAuth from "./components/auth/DoctorAuth";
import DoctorDashboard from "./components/dashboard/DoctorDashboard";
import PatientProfiles from "./pages/PatientProfiles";
import PatientDashboard from "./pages/PatientDashboard";
import FoodDatabase from "./pages/FoodDatabase";
import GenerateDietChart from "./pages/GenerateDietChart";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patient-login" element={<PatientAuth />} />
          <Route path="/doctor-login" element={<DoctorAuth />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/patient-profiles" element={<PatientProfiles />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/food-database" element={<FoodDatabase />} />
          <Route path="/generate-diet-chart" element={<GenerateDietChart />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
