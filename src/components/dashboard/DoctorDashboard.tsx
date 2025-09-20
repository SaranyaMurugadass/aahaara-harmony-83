import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Database,
  FileText,
  LogOut,
  Search,
  Plus,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  BarChart3,
  PieChart,
  Target,
  Heart,
  Leaf,
  Stethoscope
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: async () => {
      // Mock data for now - replace with actual API calls
      return {
        stats: {
          totalPatients: 127,
          activePlans: 89,
          foodItems: 450,
          thisWeek: 23,
          completedConsultations: 156,
          pendingAppointments: 8,
          averageRating: 4.8,
          monthlyRevenue: 45000
        },
        recentActivity: [
          {
            patient: "Priya Sharma",
            action: "Diet chart generated",
            time: "2 hours ago",
            type: "success"
          },
          {
            patient: "Rahul Patel",
            action: "Prakriti analysis completed",
            time: "4 hours ago",
            type: "info"
          },
          {
            patient: "Anita Singh",
            action: "New patient registered",
            time: "1 day ago",
            type: "new"
          },
          {
            patient: "Vikram Kumar",
            action: "Diet chart updated",
            time: "2 days ago",
            type: "update"
          },
        ],
        upcomingAppointments: [
          {
            id: 1,
            patient: "Rajesh Kumar",
            time: "10:00 AM",
            type: "Follow-up",
            status: "confirmed"
          },
          {
            id: 2,
            patient: "Sunita Devi",
            time: "11:30 AM",
            type: "Initial Consultation",
            status: "confirmed"
          },
          {
            id: 3,
            patient: "Amit Singh",
            time: "2:00 PM",
            type: "Diet Review",
            status: "pending"
          }
        ]
      };
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const stats = [
    {
      title: "Total Patients",
      value: dashboardData?.stats.totalPatients || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+5 this month",
      changeType: "positive"
    },
    {
      title: "Active Diet Plans",
      value: dashboardData?.stats.activePlans || 0,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+12 this week",
      changeType: "positive"
    },
    {
      title: "Food Database",
      value: `${dashboardData?.stats.foodItems || 0}+`,
      icon: Database,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "Growing",
      changeType: "neutral"
    },
    {
      title: "This Week",
      value: dashboardData?.stats.thisWeek || 0,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "New consultations",
      changeType: "neutral"
    },
    {
      title: "Completed Consultations",
      value: dashboardData?.stats.completedConsultations || 0,
      icon: Stethoscope,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      change: "+8 today",
      changeType: "positive"
    },
    {
      title: "Average Rating",
      value: dashboardData?.stats.averageRating || 0,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: "Excellent",
      changeType: "positive"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Aahaara360 - Doctor Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, Dr. {user?.first_name || 'Doctor'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-soft hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-xs flex items-center ${stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Patient Profiles */}
          <Card className="shadow-healing hover:shadow-warm transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/patient-profiles')}>
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
                  navigate('/patient-profiles');
                }}>
                Manage Patients
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Food Database */}
          <Card className="shadow-healing hover:shadow-warm transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/food-database')}>
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
                  navigate('/food-database');
                }}>
                Browse Foods
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Generate Diet Chart */}
          <Card className="shadow-healing hover:shadow-warm transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/generate-diet-chart')}>
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
                  navigate('/generate-diet-chart');
                }}>
                Create Diet Chart
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Today's scheduled consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${appointment.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      <div>
                        <p className="font-medium">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{appointment.time}</p>
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest patient interactions and diet chart generations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'info' ? 'bg-blue-500' :
                          activity.type === 'new' ? 'bg-purple-500' : 'bg-gray-500'
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
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;