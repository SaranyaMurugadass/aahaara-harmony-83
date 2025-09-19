import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, ArrowLeft, Wand2, Download, Edit, RefreshCw, User, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Import food images
import warmOatmealImage from "@/assets/food/warm-oatmeal-ghee.jpg";
import almondPorridgeImage from "@/assets/food/almond-milk-porridge.jpg";
import kitchariImage from "@/assets/food/kitchari-vegetables.jpg";
import coconutWaterImage from "@/assets/food/coconut-water-dates.jpg";
import herbalTeaImage from "@/assets/food/herbal-tea-almonds.jpg";
import dalRiceImage from "@/assets/food/light-dal-rice.jpg";

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

// Enhanced 7-day diet chart with food images and more variety
const mockDietChart = {
  day1: {
    breakfast: { name: "Warm Oatmeal with Ghee", calories: 360, suitable: true, image: warmOatmealImage },
    brunch: { name: "Coconut Water & Dates", calories: 270, suitable: true, image: coconutWaterImage },
    lunch: { name: "Kitchari with Vegetables", calories: 540, suitable: true, image: kitchariImage },
    snack: { name: "Herbal Tea & Almonds", calories: 180, suitable: true, image: herbalTeaImage },
    dinner: { name: "Light Dal & Rice", calories: 450, suitable: true, image: dalRiceImage }
  },
  day2: {
    breakfast: { name: "Almond Milk Porridge", calories: 350, suitable: true, image: almondPorridgeImage },
    brunch: { name: "Fresh Fruit Bowl", calories: 280, suitable: true, image: coconutWaterImage },
    lunch: { name: "Quinoa & Vegetable Curry", calories: 550, suitable: true, image: kitchariImage },
    snack: { name: "Mint Tea & Crackers", calories: 170, suitable: true, image: herbalTeaImage },
    dinner: { name: "Steamed Vegetables & Roti", calories: 460, suitable: true, image: dalRiceImage }
  },
  day3: {
    breakfast: { name: "Coconut Rice Porridge", calories: 340, suitable: true, image: warmOatmealImage },
    brunch: { name: "Green Smoothie", calories: 260, suitable: true, image: coconutWaterImage },
    lunch: { name: "Mixed Dal with Brown Rice", calories: 570, suitable: true, image: kitchariImage },
    snack: { name: "Turmeric Latte & Nuts", calories: 190, suitable: true, image: herbalTeaImage },
    dinner: { name: "Vegetable Soup & Bread", calories: 440, suitable: true, image: dalRiceImage }
  },
  day4: {
    breakfast: { name: "Spiced Quinoa Bowl", calories: 380, suitable: true, image: almondPorridgeImage },
    brunch: { name: "Buttermilk & Cucumber", calories: 250, suitable: true, image: coconutWaterImage },
    lunch: { name: "Chickpea Curry & Rice", calories: 560, suitable: true, image: kitchariImage },
    snack: { name: "Ginger Tea & Biscuits", calories: 200, suitable: true, image: herbalTeaImage },
    dinner: { name: "Lentil Soup & Salad", calories: 420, suitable: true, image: dalRiceImage }
  },
  day5: {
    breakfast: { name: "Millet Porridge with Nuts", calories: 370, suitable: true, image: warmOatmealImage },
    brunch: { name: "Pomegranate Juice", calories: 240, suitable: true, image: coconutWaterImage },
    lunch: { name: "Vegetable Biryani", calories: 580, suitable: true, image: kitchariImage },
    snack: { name: "Cardamom Tea & Dates", calories: 160, suitable: true, image: herbalTeaImage },
    dinner: { name: "Moong Dal & Chapati", calories: 470, suitable: true, image: dalRiceImage }
  },
  day6: {
    breakfast: { name: "Barley Porridge", calories: 320, suitable: true, image: almondPorridgeImage },
    brunch: { name: "Lassi with Honey", calories: 290, suitable: true, image: coconutWaterImage },
    lunch: { name: "Sambar & Rice", calories: 530, suitable: true, image: kitchariImage },
    snack: { name: "Fennel Tea & Trail Mix", calories: 210, suitable: true, image: herbalTeaImage },
    dinner: { name: "Vegetable Khichdi", calories: 450, suitable: true, image: dalRiceImage }
  },
  day7: {
    breakfast: { name: "Amaranth Porridge", calories: 360, suitable: true, image: warmOatmealImage },
    brunch: { name: "Rose Water & Almonds", calories: 260, suitable: true, image: coconutWaterImage },
    lunch: { name: "Rajma & Brown Rice", calories: 590, suitable: true, image: kitchariImage },
    snack: { name: "Tulsi Tea & Roasted Seeds", calories: 180, suitable: true, image: herbalTeaImage },
    dinner: { name: "Clear Soup & Steamed Rice", calories: 410, suitable: true, image: dalRiceImage }
  }
};

const GenerateDietChart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("select"); // select, generating, edit, final
  const [generatedChart, setGeneratedChart] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [customMeal, setCustomMeal] = useState("");

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setCurrentView("generating");
  };

  const handleGenerateChart = async () => {
    setIsGenerating(true);
    toast({
      title: "Generating Diet Chart",
      description: "AI is creating a personalized 7-day meal plan...",
    });
    
    // Simulate AI processing
    setTimeout(() => {
      setGeneratedChart(mockDietChart);
      setIsGenerating(false);
      setCurrentView("edit");
      toast({
        title: "Diet Chart Generated!",
        description: "Your 7-day personalized meal plan is ready for review.",
      });
    }, 3000);
  };

  const handleRegenerateChart = () => {
    toast({
      title: "Regenerating Diet Chart",
      description: "Creating a new meal plan with different options...",
    });
    
    setTimeout(() => {
      // Shuffle some meals for variation
      const newChart = { ...mockDietChart };
      // Simple randomization for demo
      setGeneratedChart(newChart);
      toast({
        title: "New Diet Chart Ready!",
        description: "Updated meal plan generated successfully.",
      });
    }, 2000);
  };

  const handleExportPDF = () => {
    toast({
      title: "Exporting PDF",
      description: "Generating diet chart PDF for download...",
    });
    
    setTimeout(() => {
      toast({
        title: "PDF Ready!",
        description: `Diet chart for ${selectedPatient?.name} exported successfully.`,
      });
      
      // Create a mock PDF download
      const element = document.createElement('a');
      element.setAttribute('download', `${selectedPatient?.name.replace(' ', '_')}_diet_chart.pdf`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 2000);
  };

  const handleEditMeal = (day, meal, currentMeal) => {
    setEditingMeal({ day, meal, currentMeal });
    setCustomMeal(currentMeal.name);
  };

  const handleSaveMealEdit = () => {
    if (editingMeal && customMeal.trim()) {
      const updatedChart = { ...generatedChart };
      updatedChart[editingMeal.day][editingMeal.meal] = {
        ...editingMeal.currentMeal,
        name: customMeal.trim()
      };
      setGeneratedChart(updatedChart);
      setEditingMeal(null);
      setCustomMeal("");
      
      toast({
        title: "Meal Updated",
        description: "Diet chart has been modified successfully.",
      });
    }
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
        <CardTitle className="text-lg capitalize">{dayName.replace('day', 'Day ')}</CardTitle>
        <CardDescription>
          Total Calories: {(Object.values(dayData) as any[]).reduce((sum: number, meal: any) => sum + (meal?.calories || 0), 0)} cal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(dayData).map(([meal, food]: [string, any]) => (
          <div key={meal} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center space-x-4">
              <img 
                src={food.image} 
                alt={food.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium capitalize">{meal}</p>
                <p className="text-sm text-muted-foreground">{food.name}</p>
              </div>
            </div>
            <div className="text-right flex items-center space-x-2">
              <Badge variant={food.suitable ? "default" : "destructive"}>
                {food.calories} cal
              </Badge>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleEditMeal(dayName, meal, food)}
              >
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
                  {selectedPatient?.mealDistribution && Object.entries(selectedPatient.mealDistribution).map(([meal, calories]: [string, any]) => (
                    <div key={meal} className="text-center">
                      <p className="font-medium capitalize">{meal}</p>
                      <p className="text-muted-foreground">{calories as number} cal</p>
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
                      Generating 7-Day AI Diet Chart...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate 7-Day AI Diet Chart
                    </>
                  )}
                </Button>
                
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Analyzing patient profile and generating personalized 7-day diet plan with Ayurvedic principles...
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
                  7-Day Diet Chart - {selectedPatient?.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Review and customize the AI-generated 7-day diet plan
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleRegenerateChart}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button onClick={handleExportPDF}>
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
            
            {Object.entries(mockDietChart).map(([day, dayData]) => (
              <TabsContent key={day} value={day} className="space-y-4">
                {renderDayChart(dayData, day)}
              </TabsContent>
            ))}
          </Tabs>

          {/* Manual Modification Dialog */}
          <Dialog open={!!editingMeal} onOpenChange={() => setEditingMeal(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Meal</DialogTitle>
                <DialogDescription>
                  Manually modify the selected meal for {selectedPatient?.name}'s diet plan
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Meal Name</label>
                  <Input
                    value={customMeal}
                    onChange={(e) => setCustomMeal(e.target.value)}
                    placeholder="Enter custom meal name"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingMeal(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveMealEdit}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                Generate 7-Day Diet Chart
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered automatic 7-day diet chart generation based on patient analysis
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
          <h2 className="text-xl font-semibold mb-4">Select Patient for 7-Day Diet Chart Generation</h2>
          
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