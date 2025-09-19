import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Mock patient data
const mockPatientData = {
  id: 1,
  name: "John Doe",
  age: 32,
  gender: "Male",
  location: "Mumbai, Maharashtra",
  dominantDosha: "Pitta",
  currentDietChart: {
    startDate: "2024-01-15",
    endDate: "2024-01-21",
    totalDays: 7,
    day1: {
      breakfast: { name: "Warm Oatmeal with Ghee", calories: 320, time: "7:00 AM", completed: false },
      lunch: { name: "Kitchari with Vegetables", calories: 420, time: "12:30 PM", completed: false },
      snack: { name: "Herbal Tea with Almonds", calories: 150, time: "4:00 PM", completed: false },
      dinner: { name: "Light Dal with Rice", calories: 350, time: "7:30 PM", completed: false }
    },
    // ... other days would be similar
  },
  upcomingAppointments: [
    { id: 1, doctor: "Dr. Priya Sharma", date: "2024-01-20", time: "10:00 AM", type: "Follow-up" },
    { id: 2, doctor: "Dr. Rahul Patel", date: "2024-01-25", time: "3:00 PM", type: "Consultation" }
  ],
  mealReminders: {
    breakfast: { time: "07:00", enabled: true },
    lunch: { time: "12:30", enabled: true },
    dinner: { time: "19:30", enabled: true }
  },
  streakData: {
    currentStreak: 7,
    longestStreak: 12,
    totalDaysCompleted: 45,
    achievements: [
      { id: 1, title: "First Week", description: "Completed 7 consecutive days", icon: "Trophy", earned: true },
      { id: 2, title: "Consistency King", description: "15 days streak", icon: "Flame", earned: false },
      { id: 3, title: "Diet Master", description: "30 days streak", icon: "Star", earned: false }
    ]
  }
};

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientData, setPatientData] = useState(mockPatientData);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showRemindersDialog, setShowRemindersDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBookAppointment = (formData) => {
    toast({
      title: "Appointment Requested",
      description: "Your appointment request has been sent to the doctor. You will receive a confirmation soon.",
    });
    setShowAppointmentDialog(false);
  };

  const handleUploadReport = (files) => {
    toast({
      title: "Report Uploaded",
      description: "Your medical report has been uploaded and sent to your doctor for review.",
    });
    setShowUploadDialog(false);
  };

  const handleUpdateReminders = (reminders) => {
    setPatientData(prev => ({ ...prev, mealReminders: reminders }));
    toast({
      title: "Reminders Updated",
      description: "Your meal reminder preferences have been saved.",
    });
    setShowRemindersDialog(false);
  };

  const handleViewDietChart = () => {
    navigate('/generate-diet-chart', { 
      state: { 
        patient: patientData,
        viewOnly: true 
      } 
    });
  };

  const handleDownloadReport = (reportType: string) => {
    toast({
      title: "Downloading Report",
      description: `Preparing ${reportType} report for download...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Download Complete!",
        description: "Report downloaded successfully.",
      });
      
      // Create a mock download
      const element = document.createElement('a');
      element.setAttribute('download', `${reportType}_report.pdf`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1500);
  };

  const handleMealComplete = (mealType: string) => {
    setPatientData(prev => ({
      ...prev,
      currentDietChart: {
        ...prev.currentDietChart,
        day1: {
          ...prev.currentDietChart.day1,
          [mealType]: {
            ...prev.currentDietChart.day1[mealType],
            completed: true
          }
        }
      }
    }));

    toast({
      title: "Meal Completed! 🎉",
      description: `Great job completing your ${mealType}! Keep up the streak!`,
    });

    // Check if all meals are completed to update streak
    const updatedMeals = {
      ...patientData.currentDietChart.day1,
      [mealType]: { ...patientData.currentDietChart.day1[mealType], completed: true }
    };
    
    const allMealsCompleted = Object.values(updatedMeals).every((meal: any) => meal.completed);
    if (allMealsCompleted) {
      toast({
        title: "Daily Goal Achieved! 🔥",
        description: `You've completed all meals today! Streak: ${patientData.streakData.currentStreak + 1} days`,
      });
    }
  };

  const renderTodaysMeals = () => {
    const today = patientData.currentDietChart?.day1;
    if (!today) return null;

    return (
      <div className="grid gap-4">
        {Object.entries(today).map(([mealType, meal]: [string, any]) => (
          <Card key={mealType} className={`p-4 transition-all duration-300 ${meal.completed ? 'bg-green-50 border-green-200' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ChefHat className={`w-5 h-5 ${meal.completed ? 'text-green-600' : 'text-primary'}`} />
                <div>
                  <p className={`font-medium capitalize ${meal.completed ? 'line-through text-muted-foreground' : ''}`}>{mealType}</p>
                  <p className="text-sm text-muted-foreground">{meal.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{meal.time}</p>
                  <p className="text-xs text-muted-foreground">{meal.calories} cal</p>
                </div>
                <Button
                  size="sm"
                  variant={meal.completed ? "secondary" : "default"}
                  onClick={() => !meal.completed && handleMealComplete(mealType)}
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

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Welcome, {patientData.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Your personalized Ayurvedic wellness dashboard
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current time</p>
              <p className="font-medium">{currentTime.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
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
                  <h3 className="font-semibold text-lg">{patientData.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {patientData.age} years • {patientData.gender}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {patientData.dominantDosha} Constitution
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
                <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
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

                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
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

                <Dialog open={showRemindersDialog} onOpenChange={setShowRemindersDialog}>
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
                      initialData={patientData.mealReminders}
                      onSubmit={handleUpdateReminders} 
                    />
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleViewDietChart}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Diet Chart
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Today's Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Streak & Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flame className="w-5 h-5 mr-2 text-orange-500" />
                  Diet Streak & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center mx-auto mb-2">
                      <Flame className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{patientData.streakData.currentStreak}</p>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-2">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{patientData.streakData.longestStreak}</p>
                    <p className="text-sm text-muted-foreground">Longest Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mx-auto mb-2">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{patientData.streakData.totalDaysCompleted}</p>
                    <p className="text-sm text-muted-foreground">Total Days</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h4 className="font-semibold mb-3">Achievements</h4>
                  <div className="grid gap-3">
                    {patientData.streakData.achievements.map((achievement) => (
                      <Card key={achievement.id} className={`p-3 ${achievement.earned ? 'bg-yellow-50 border-yellow-200' : 'opacity-60'}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                            {achievement.icon === "Trophy" && <Trophy className={`w-5 h-5 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}`} />}
                            {achievement.icon === "Flame" && <Flame className={`w-5 h-5 ${achievement.earned ? 'text-orange-600' : 'text-gray-400'}`} />}
                            {achievement.icon === "Star" && <Star className={`w-5 h-5 ${achievement.earned ? 'text-purple-600' : 'text-gray-400'}`} />}
                          </div>
                          <div>
                            <p className={`font-medium ${achievement.earned ? 'text-yellow-800' : 'text-gray-500'}`}>{achievement.title}</p>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                          {achievement.earned && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Earned!</Badge>}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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
              <CardContent>
                {renderTodaysMeals()}
              </CardContent>
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
                {patientData.upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {patientData.upcomingAppointments.map((appointment) => (
                      <Card key={appointment.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{appointment.doctor}</p>
                            <p className="text-sm text-muted-foreground">{appointment.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{appointment.date}</p>
                            <p className="text-xs text-muted-foreground">{appointment.time}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No upcoming appointments. Book one to get started!
                  </p>
                )}
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
                        <p className="text-xs text-muted-foreground">Uploaded 2 days ago</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadReport('blood-test')}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Consultation Summary</p>
                        <p className="text-xs text-muted-foreground">Generated 1 week ago</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadReport('consultation')}>
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

// Appointment Booking Form Component
const AppointmentBookingForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    doctor: "",
    date: "",
    time: "",
    type: "consultation",
    notes: ""
  });

  const handleSubmit = (e) => {
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
          onChange={(e) => setFormData(prev => ({ ...prev, doctor: e.target.value }))}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Select Doctor</option>
          <option value="Dr. Priya Sharma">Dr. Priya Sharma - Ayurvedic Specialist</option>
          <option value="Dr. Rahul Patel">Dr. Rahul Patel - Nutrition Expert</option>
          <option value="Dr. Anita Singh">Dr. Anita Singh - General Practitioner</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Preferred Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Preferred Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="type">Appointment Type</Label>
        <select 
          id="type"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>
      
      <Button type="submit" className="w-full">
        Request Appointment
      </Button>
    </form>
  );
};

// Report Upload Form Component
const ReportUploadForm = ({ onSubmit }) => {
  const [files, setFiles] = useState([]);
  const [reportType, setReportType] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ files, reportType, notes });
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

// Meal Reminder Form Component
const MealReminderForm = ({ initialData, onSubmit }) => {
  const [reminders, setReminders] = useState(initialData);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reminders);
  };

  const updateReminder = (meal, field, value) => {
    setReminders(prev => ({
      ...prev,
      [meal]: { ...prev[meal], [field]: value }
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
              onChange={(e) => updateReminder(meal, 'enabled', e.target.checked)}
              className="rounded border-input"
            />
          </div>
          <Input
            type="time"
            value={data.time}
            onChange={(e) => updateReminder(meal, 'time', e.target.value)}
            disabled={!data.enabled}
          />
        </div>
      ))
      }
      
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
