import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Calendar,
  Clock,
  Upload,
  FileText,
  Utensils,
  Bell,
  ChefHat,
  History,
  CalendarDays,
  Download,
  ArrowLeft,
  Trophy,
  Flame,
  Star,
  Check,
  TrendingUp,
  Activity,
  Heart,
  Target,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import AdvancedFoodScanner from "@/components/food/AdvancedFoodScanner";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showRemindersDialog, setShowRemindersDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch patient data
  const { data: patientData, isLoading } = useQuery({
    queryKey: ["patient-dashboard"],
    queryFn: () => apiClient.getUserProfile(),
    enabled: !!user,
    onSuccess: (data) => {
      console.log("🔍 Patient data loaded:", data);
      console.log("🔍 Patient ID:", data?.id);
    },
  });

  // Fetch patient's latest diet chart
  const { data: dietChart, isLoading: isLoadingDietChart } = useQuery({
    queryKey: ["patient-diet-chart", patientData?.patient_data?.id],
    queryFn: () => {
      console.log(
        "🔍 Fetching diet chart for patient ID:",
        patientData?.patient_data?.id
      );
      console.log("🔍 Patient data structure:", patientData);
      // Use the UnifiedPatient.id from patient_data (which is the UUID that diet charts reference)
      const patientId = patientData?.patient_data?.id;
      console.log("🔍 Using patient ID:", patientId);
      return apiClient.getPatientLatestDietChart(patientId);
    },
    enabled: !!patientData?.patient_data?.id,
    retry: 1,
    onError: (error) => {
      console.error("❌ Error fetching diet chart:", error);
    },
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBookAppointment = (formData: any) => {
    toast({
      title: "Appointment Requested",
      description:
        "Your appointment request has been sent to the doctor. You will receive a confirmation soon.",
    });
    setShowAppointmentDialog(false);
  };

  const handleUploadReport = async (
    files: File[],
    reportType: string,
    notes: string
  ) => {
    if (!files.length || !patientData?.patient_data?.id) {
      toast({
        title: "Upload Failed",
        description:
          "Please select a file and ensure patient data is available.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Uploading Report",
        description: "Please wait while your report is being uploaded...",
      });

      const file = files[0];
      const result = await apiClient.uploadPatientReport(
        file,
        patientData.patient_data.id,
        reportType,
        file.name,
        `Uploaded by patient`,
        notes
      );

      toast({
        title: "Report Uploaded Successfully!",
        description:
          "Your medical report has been uploaded and sent to your doctor for review.",
      });
      setShowUploadDialog(false);
    } catch (error) {
      console.error("Report upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateReminders = (reminders: any) => {
    toast({
      title: "Reminders Updated",
      description: "Your meal reminder preferences have been saved.",
    });
    setShowRemindersDialog(false);
  };

  const handleViewDietChart = () => {
    if (!dietChart) {
      toast({
        title: "No Diet Chart Available",
        description:
          "You don't have an active diet chart yet. Please contact your doctor.",
        variant: "destructive",
      });
      return;
    }

    navigate("/generate-diet-chart", {
      state: {
        patient: {
          ...patientData,
          id: patientData?.patient_data?.id, // Use the UnifiedPatient.id for the diet chart
        },
        dietChart: dietChart,
        viewOnly: true,
      },
    });
  };

  const handleDownloadReport = async (reportId: string, fileName: string) => {
    try {
      toast({
        title: "Downloading Report",
        description: "Preparing report for download...",
      });

      const blob = await apiClient.downloadReport(reportId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete!",
        description: "Report downloaded successfully.",
      });
    } catch (error) {
      console.error("Report download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMealComplete = (mealType: string) => {
    toast({
      title: "Meal Completed! 🎉",
      description: `Great job completing your ${mealType}! Keep up the streak!`,
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const renderTodaysMeals = () => {
    if (isLoadingDietChart) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-2 text-muted-foreground">
            Loading your meal plan...
          </p>
        </div>
      );
    }

    if (!dietChart || !dietChart.daily_meals) {
      console.log("🔍 No diet chart or daily_meals found:", { dietChart });
      return (
        <div className="text-center p-8">
          <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No meal plan available yet</p>
          <p className="text-sm text-muted-foreground">
            Contact your doctor to get your personalized diet chart
          </p>
          {dietChart && (
            <p className="text-xs text-muted-foreground mt-2">
              Debug: Chart exists but no daily_meals found
            </p>
          )}
        </div>
      );
    }

    // Get today's meals from the diet chart (assuming day1 for now)
    const todayMeals = dietChart.daily_meals.day1 || {};
    const mealTypes = ["breakfast", "lunch", "snack", "dinner"];
    const mealTimes = {
      breakfast: "7:00 AM",
      lunch: "12:30 PM",
      snack: "4:00 PM",
      dinner: "7:30 PM",
    };

    const meals = mealTypes
      .map((type) => {
        const meal = todayMeals[type];
        return {
          type,
          name: meal?.name || "Meal not planned",
          calories: meal?.calories || 0,
          time: mealTimes[type as keyof typeof mealTimes],
          completed: false,
        };
      })
      .filter((meal) => meal.name !== "Meal not planned");

    return (
      <div className="grid gap-4">
        {meals.map((meal) => (
          <Card
            key={meal.type}
            className={`p-4 transition-all duration-300 ${
              meal.completed ? "bg-green-50 border-green-200" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ChefHat
                  className={`w-5 h-5 ${
                    meal.completed ? "text-green-600" : "text-primary"
                  }`}
                />
                <div>
                  <p
                    className={`font-medium capitalize ${
                      meal.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {meal.type}
                  </p>
                  <p className="text-sm text-muted-foreground">{meal.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{meal.time}</p>
                  <p className="text-xs text-muted-foreground">
                    {meal.calories} cal
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={meal.completed ? "secondary" : "default"}
                  onClick={() =>
                    !meal.completed && handleMealComplete(meal.type)
                  }
                  disabled={meal.completed}
                >
                  {meal.completed ? <Check className="w-4 h-4" /> : "Mark Done"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

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
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Welcome, {user?.first_name || "Patient"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Your personalized Ayurvedic wellness dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current time</p>
                <p className="font-medium">
                  {currentTime.toLocaleTimeString()}
                </p>
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
      <main ref={contentRef} className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-healing flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {user?.full_name || "Patient Name"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.patient_profile?.age || "N/A"} years •{" "}
                    {user?.patient_profile?.gender || "N/A"}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {user?.patient_profile?.blood_type || "Unknown"} Blood Type
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog
                  open={showAppointmentDialog}
                  onOpenChange={setShowAppointmentDialog}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Book Doctor Appointment</DialogTitle>
                    </DialogHeader>
                    <AppointmentBookingForm onSubmit={handleBookAppointment} />
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={showUploadDialog}
                  onOpenChange={setShowUploadDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Medical Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Medical Report</DialogTitle>
                    </DialogHeader>
                    <ReportUploadForm onSubmit={handleUploadReport} />
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={showRemindersDialog}
                  onOpenChange={setShowRemindersDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="w-4 h-4 mr-2" />
                      Meal Reminders
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Meal Reminder Settings</DialogTitle>
                    </DialogHeader>
                    <MealReminderForm
                      initialData={{
                        breakfast: { time: "07:00", enabled: true },
                      }}
                      onSubmit={handleUpdateReminders}
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleViewDietChart}
                  disabled={isLoadingDietChart}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isLoadingDietChart
                    ? "Loading..."
                    : dietChart
                    ? "View Diet Chart"
                    : "No Diet Chart Available"}
                </Button>

                <Separator className="my-3" />

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Today's Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Streak
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        7 days
                      </p>
                    </div>
                    <Flame className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Meals Today
                      </p>
                      <p className="text-2xl font-bold text-green-600">2/4</p>
                    </div>
                    <Utensils className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold text-blue-600">75%</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Meals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Utensils className="w-5 h-5 mr-2" />
                  Today's Meal Plan
                </CardTitle>
                <CardDescription>
                  Follow your personalized Ayurvedic diet chart
                </CardDescription>
              </CardHeader>
              <CardContent>{renderTodaysMeals()}</CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="w-5 h-5 mr-2" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Dr. Priya Sharma</p>
                        <p className="text-sm text-muted-foreground">
                          Follow-up Consultation
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Jan 20, 2024</p>
                        <p className="text-xs text-muted-foreground">
                          10:00 AM
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Food Scanner */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Utensils className="w-5 h-5 mr-2" />
                  AI Food Scanner
                </CardTitle>
                <CardDescription>
                  Advanced food recognition with camera, upload, and Ayurvedic
                  analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedFoodScanner />
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Blood Test Report</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded 2 days ago
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleDownloadReport(
                          "mock-report-id",
                          "blood_test_report.pdf"
                        )
                      }
                      className="no-print"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

// Form Components
const AppointmentBookingForm = ({
  onSubmit,
}: {
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    doctor: "",
    date: "",
    time: "",
    type: "consultation",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="doctor">Preferred Doctor</Label>
        <select
          id="doctor"
          value={formData.doctor}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, doctor: e.target.value }))
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Select Doctor</option>
          <option value="Dr. Priya Sharma">
            Dr. Priya Sharma - Ayurvedic Specialist
          </option>
          <option value="Dr. Rahul Patel">
            Dr. Rahul Patel - Nutrition Expert
          </option>
          <option value="Dr. Anita Singh">
            Dr. Anita Singh - General Practitioner
          </option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Preferred Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Preferred Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, time: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="type">Appointment Type</Label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, type: e.target.value }))
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="consultation">General Consultation</option>
          <option value="follow-up">Follow-up</option>
          <option value="diet-review">Diet Chart Review</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Describe your concerns or symptoms..."
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        Request Appointment
      </Button>
    </form>
  );
};

const ReportUploadForm = ({
  onSubmit,
}: {
  onSubmit: (files: File[], reportType: string, notes: string) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [reportType, setReportType] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportType) {
      alert("Please select a report type");
      return;
    }
    onSubmit(files, reportType, notes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="reportType">Report Type</Label>
        <select
          id="reportType"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Select Report Type</option>
          <option value="blood-test">Blood Test</option>
          <option value="urine-test">Urine Test</option>
          <option value="xray">X-Ray</option>
          <option value="mri">MRI Scan</option>
          <option value="consultation">Consultation Report</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <Label htmlFor="files">Upload Files</Label>
        <Input
          id="files"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB each)
        </p>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about the report..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        Upload Report
      </Button>
    </form>
  );
};

const MealReminderForm = ({
  initialData,
  onSubmit,
}: {
  initialData: any;
  onSubmit: (data: any) => void;
}) => {
  const [reminders, setReminders] = useState(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reminders);
  };

  const updateReminder = (meal: string, field: string, value: any) => {
    setReminders((prev: any) => ({
      ...prev,
      [meal]: { ...prev[meal], [field]: value },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.entries(reminders).map(([meal, data]: [string, any]) => (
        <div key={meal} className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="capitalize font-medium">{meal} Reminder</Label>
            <input
              type="checkbox"
              checked={data.enabled}
              onChange={(e) =>
                updateReminder(meal, "enabled", e.target.checked)
              }
              className="rounded border-input"
            />
          </div>
          <Input
            type="time"
            value={data.time}
            onChange={(e) => updateReminder(meal, "time", e.target.value)}
            disabled={!data.enabled}
          />
        </div>
      ))}

      <Separator />

      <div className="text-sm text-muted-foreground">
        <p>• Reminders will be sent via browser notifications</p>
        <p>• Make sure to allow notifications for this website</p>
        <p>• You can customize reminder times for each meal</p>
      </div>

      <Button type="submit" className="w-full">
        Save Reminder Settings
      </Button>
    </form>
  );
};

export default PatientDashboard;
