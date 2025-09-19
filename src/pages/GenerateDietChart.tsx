import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowLeft, Wand2, Download, Edit, RefreshCw, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock patient data
const mockPatients = [
  {
    id: 1,
    name: "Priya Sharma",
    age: 32,
    gender: "Female",
    prakritiScore: { vata: 30, pitta: 50, kapha: 20 },
    dominantDosha: "Pitta",
    targetCalories: 1800,
    mealDistribution: {
      breakfast: 360, // 20%
      brunch: 270,    // 15%
      lunch: 540,     // 30%
      snack: 180,     // 10%
      dinner: 450     // 25%
    }
  },
  {
    id: 2,
    name: "Rahul Patel",
    age: 28,
    gender: "Male",
    prakritiScore: { vata: 45, pitta: 30, kapha: 25 },
    dominantDosha: "Vata",
    targetCalories: 2200,
    mealDistribution: {
      breakfast: 440,
      brunch: 330,
      lunch: 660,
      snack: 220,
      dinner: 550
    }
  }
];

// Mock generated diet chart
const mockDietChart = {
  day1: {
    breakfast: { name: "Warm Oatmeal with Ghee", calories: 360, suitable: true },
    brunch: { name: "Coconut Water & Dates", calories: 270, suitable: true },
    lunch: { name: "Kitchari with Vegetables", calories: 540, suitable: true },
    snack: { name: "Herbal Tea & Almonds", calories: 180, suitable: true },
    dinner: { name: "Light Dal & Rice", calories: 450, suitable: true }
  },
  day2: {
    breakfast: { name: "Coconut Rice Flakes", calories: 350, suitable: true },
    brunch: { name: "Fresh Fruit Bowl", calories: 280, suitable: true },
    lunch: { name: "Quinoa & Vegetable Curry", calories: 550, suitable: true },
    snack: { name: "Mint Tea & Crackers", calories: 170, suitable: true },
    dinner: { name: "Steamed Vegetables & Roti", calories: 460, suitable: true }
  },
  // ... more days
};

const GenerateDietChart = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("select"); // select, generating, edit, final
  const [generatedChart, setGeneratedChart] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setCurrentView("generating");
  };

  const handleGenerateChart = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setGeneratedChart(mockDietChart);
      setIsGenerating(false);
      setCurrentView("edit");
    }, 3000);
  };

  const renderPatientCard = (patient) => (
    <Card key={patient.id} className="hover:shadow-warm transition-all duration-300 cursor-pointer"
          onClick={() => handleSelectPatient(patient)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-healing flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">
                {patient.age} years • {patient.gender}
              </p>
              <div className="flex space-x-2 mt-2">
                <Badge variant="secondary">
                  Dominant: {patient.dominantDosha}
                </Badge>
                <Badge variant="outline">
                  {patient.targetCalories} cal/day
                </Badge>
              </div>
            </div>
          </div>
          <Button>
            Select Patient
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderDayChart = (dayData: any, dayName: string) => (
    <Card key={dayName}>
      <CardHeader>
        <CardTitle className="text-lg capitalize">{dayName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(dayData).map(([meal, food]) => (
          <div key={meal} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="font-medium capitalize">{meal}</p>
              <p className="text-sm text-muted-foreground">{food.name}</p>
            </div>
            <div className="text-right">
              <Badge variant={food.suitable ? "default" : "destructive"}>
                {food.calories} cal
              </Badge>
              <Button size="sm" variant="ghost" className="ml-2">
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  if (currentView === "generating") {
    return (
      <div className="min-h-screen bg-gradient-earth">
        <div className="container mx-auto px-6 py-8">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView("select")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Selection
          </Button>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-healing flex items-center justify-center mb-6">
                <User className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">{selectedPatient?.name}</h2>
              <div className="flex justify-center space-x-4 mb-6">
                <Badge variant="secondary">
                  Dominant: {selectedPatient?.dominantDosha}
                </Badge>
                <Badge variant="outline">
                  Target: {selectedPatient?.targetCalories} cal/day
                </Badge>
              </div>

              <div className="bg-muted/30 rounded-lg p-6 mb-6">
                <h3 className="font-medium mb-4">Daily Calorie Distribution</h3>
                <div className="grid grid-cols-5 gap-4 text-sm">
                  {selectedPatient?.mealDistribution && Object.entries(selectedPatient.mealDistribution).map(([meal, calories]) => (
                    <div key={meal} className="text-center">
                      <p className="font-medium capitalize">{meal}</p>
                      <p className="text-muted-foreground">{calories} cal</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleGenerateChart}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating AI Diet Chart...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate AI Diet Chart
                    </>
                  )}
                </Button>
                
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Analyzing patient profile and generating personalized 7-day diet plan...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === "edit" && generatedChart) {
    return (
      <div className="min-h-screen bg-gradient-earth">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur border-b border-border/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentView("select")}
                  className="mb-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Selection
                </Button>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Diet Chart - {selectedPatient?.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Review and customize the AI-generated 7-day diet plan
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <Tabs defaultValue="day1" className="space-y-6">
            <TabsList className="grid grid-cols-7 w-full">
              {Array.from({length: 7}, (_, i) => (
                <TabsTrigger key={`day${i+1}`} value={`day${i+1}`}>
                  Day {i+1}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="day1" className="space-y-4">
              {renderDayChart(mockDietChart.day1, "day1")}
            </TabsContent>
            
            <TabsContent value="day2" className="space-y-4">
              {renderDayChart(mockDietChart.day2, "day2")}
            </TabsContent>
            
            {/* Add more TabsContent for remaining days */}
          </Tabs>
        </main>
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
                onClick={() => navigate('/doctor-dashboard')}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Generate Diet Chart
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered automatic diet chart generation based on patient analysis
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Patient Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Select Patient for Diet Chart Generation</h2>
          
          {filteredPatients.map(renderPatientCard)}
          
          {filteredPatients.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No patients found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search term" : "No patients available for diet chart generation"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default GenerateDietChart;