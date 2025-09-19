import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Database, FileText, LogOut, Search, Plus, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 127,
    activePlans: 89,
    foodItems: 450,
    thisWeek: 23
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalPatients: prev.totalPatients + Math.floor(Math.random() * 2),
        activePlans: prev.activePlans + Math.floor(Math.random() * 1),
        foodItems: prev.foodItems + Math.floor(Math.random() * 5),
        thisWeek: prev.thisWeek + Math.floor(Math.random() * 1)
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    // Navigate to home page
    window.location.href = '/';
  };
  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Aahaara360 - Dietitian Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Welcome back, Dr. Sharma</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search patients..."
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalPatients}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5 this month
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-bold text-secondary">{stats.activePlans}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12 this week
                  </p>
                </div>
                <FileText className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Food Items</p>
                  <p className="text-2xl font-bold text-accent">{stats.foodItems}+</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Plus className="w-3 h-3 mr-1" />
                    Database growing
                  </p>
                </div>
                <Database className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-primary">{stats.thisWeek}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    New consultations
                  </p>
                </div>
                <Plus className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Patient Profiles */}
          <Card className="shadow-healing hover:shadow-warm transition-all duration-300 cursor-pointer group"
               onClick={() => window.location.href = '/patient-profiles'}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-healing flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Patient Profiles</CardTitle>
              <CardDescription>
                Manage patient information, conduct assessments, and view health summaries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>• View all patient records</p>
                <p>• Add new patients</p>
                <p>• Conduct Prakriti analysis</p>
                <p>• Health history assessment</p>
                <p>• Generate health summaries</p>
              </div>
              <Button className="w-full bg-gradient-healing hover:opacity-90"
                     onClick={(e) => {
                       e.stopPropagation();
                       window.location.href = '/patient-profiles';
                     }}>
                Manage Patients
              </Button>
            </CardContent>
          </Card>

          {/* Food Database */}
          <Card className="shadow-healing hover:shadow-warm transition-all duration-300 cursor-pointer group"
               onClick={() => window.location.href = '/food-database'}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Food Database</CardTitle>
              <CardDescription>
                Browse Ayurvedic food categories and nutritional information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>• Vata, Pitta, Kapha categories</p>
                <p>• Nutritional information</p>
                <p>• Ayurvedic properties</p>
                <p>• Search and filter foods</p>
                <p>• Save custom meal plans</p>
              </div>
              <Button className="w-full bg-gradient-primary hover:opacity-90"
                     onClick={(e) => {
                       e.stopPropagation();
                       window.location.href = '/food-database';
                     }}>
                Browse Foods
              </Button>
            </CardContent>
          </Card>

          {/* Generate Diet Chart */}
          <Card className="shadow-healing hover:shadow-warm transition-all duration-300 cursor-pointer group"
               onClick={() => window.location.href = '/generate-diet-chart'}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-sunset flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Generate Diet Chart</CardTitle>
              <CardDescription>
                AI-powered automatic diet chart generation based on patient analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>• Select patient profile</p>
                <p>• AI-powered generation</p>
                <p>• 7-day meal plans</p>
                <p>• Manual editing options</p>
                <p>• PDF export & sharing</p>
              </div>
              <Button className="w-full bg-gradient-sunset hover:opacity-90"
                     onClick={(e) => {
                       e.stopPropagation();
                       window.location.href = '/generate-diet-chart';
                     }}>
                Create Diet Chart
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 shadow-soft">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest patient interactions and diet chart generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { patient: "Priya Sharma", action: "Diet chart generated", time: "2 hours ago", type: "success" },
                { patient: "Rahul Patel", action: "Prakriti analysis completed", time: "4 hours ago", type: "info" },
                { patient: "Anita Singh", action: "New patient registered", time: "1 day ago", type: "new" },
                { patient: "Vikram Kumar", action: "Diet chart updated", time: "2 days ago", type: "update" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-secondary' :
                      activity.type === 'info' ? 'bg-primary' :
                      activity.type === 'new' ? 'bg-accent' : 'bg-muted-foreground'
                    }`} />
                    <div>
                      <p className="font-medium">{activity.patient}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DoctorDashboard;