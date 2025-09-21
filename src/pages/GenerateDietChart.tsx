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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  ArrowLeft,
  Wand2,
  Download,
  Edit,
  RefreshCw,
  User,
  Save,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/api";

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
      brunch: 270, // 15%
      lunch: 540, // 30%
      snack: 180, // 10%
      dinner: 450, // 25%
    },
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
      dinner: 550,
    },
  },
];

// Enhanced 7-day diet chart with food images and more variety
const mockDietChart = {
  day1: {
    breakfast: {
      name: "Warm Oatmeal with Ghee",
      calories: 360,
      suitable: true,
      image: warmOatmealImage,
    },
    brunch: {
      name: "Coconut Water & Dates",
      calories: 270,
      suitable: true,
      image: coconutWaterImage,
    },
    lunch: {
      name: "Kitchari with Vegetables",
      calories: 540,
      suitable: true,
      image: kitchariImage,
    },
    snack: {
      name: "Herbal Tea & Almonds",
      calories: 180,
      suitable: true,
      image: herbalTeaImage,
    },
    dinner: {
      name: "Light Dal & Rice",
      calories: 450,
      suitable: true,
      image: dalRiceImage,
    },
  },
  day2: {
    breakfast: {
      name: "Almond Milk Porridge",
      calories: 350,
      suitable: true,
      image: almondPorridgeImage,
    },
    brunch: {
      name: "Fresh Fruit Bowl",
      calories: 280,
      suitable: true,
      image: coconutWaterImage,
    },
    lunch: {
      name: "Quinoa & Vegetable Curry",
      calories: 550,
      suitable: true,
      image: kitchariImage,
    },
    snack: {
      name: "Mint Tea & Crackers",
      calories: 170,
      suitable: true,
      image: herbalTeaImage,
    },
    dinner: {
      name: "Steamed Vegetables & Roti",
      calories: 460,
      suitable: true,
      image: dalRiceImage,
    },
  },
  day3: {
    breakfast: {
      name: "Coconut Rice Porridge",
      calories: 340,
      suitable: true,
      image: warmOatmealImage,
    },
    brunch: {
      name: "Green Smoothie",
      calories: 260,
      suitable: true,
      image: coconutWaterImage,
    },
    lunch: {
      name: "Mixed Dal with Brown Rice",
      calories: 570,
      suitable: true,
      image: kitchariImage,
    },
    snack: {
      name: "Turmeric Latte & Nuts",
      calories: 190,
      suitable: true,
      image: herbalTeaImage,
    },
    dinner: {
      name: "Vegetable Soup & Bread",
      calories: 440,
      suitable: true,
      image: dalRiceImage,
    },
  },
  day4: {
    breakfast: {
      name: "Spiced Quinoa Bowl",
      calories: 380,
      suitable: true,
      image: almondPorridgeImage,
    },
    brunch: {
      name: "Buttermilk & Cucumber",
      calories: 250,
      suitable: true,
      image: coconutWaterImage,
    },
    lunch: {
      name: "Chickpea Curry & Rice",
      calories: 560,
      suitable: true,
      image: kitchariImage,
    },
    snack: {
      name: "Ginger Tea & Biscuits",
      calories: 200,
      suitable: true,
      image: herbalTeaImage,
    },
    dinner: {
      name: "Lentil Soup & Salad",
      calories: 420,
      suitable: true,
      image: dalRiceImage,
    },
  },
  day5: {
    breakfast: {
      name: "Millet Porridge with Nuts",
      calories: 370,
      suitable: true,
      image: warmOatmealImage,
    },
    brunch: {
      name: "Pomegranate Juice",
      calories: 240,
      suitable: true,
      image: coconutWaterImage,
    },
    lunch: {
      name: "Vegetable Biryani",
      calories: 580,
      suitable: true,
      image: kitchariImage,
    },
    snack: {
      name: "Cardamom Tea & Dates",
      calories: 160,
      suitable: true,
      image: herbalTeaImage,
    },
    dinner: {
      name: "Moong Dal & Chapati",
      calories: 470,
      suitable: true,
      image: dalRiceImage,
    },
  },
  day6: {
    breakfast: {
      name: "Barley Porridge",
      calories: 320,
      suitable: true,
      image: almondPorridgeImage,
    },
    brunch: {
      name: "Lassi with Honey",
      calories: 290,
      suitable: true,
      image: coconutWaterImage,
    },
    lunch: {
      name: "Sambar & Rice",
      calories: 530,
      suitable: true,
      image: kitchariImage,
    },
    snack: {
      name: "Fennel Tea & Trail Mix",
      calories: 210,
      suitable: true,
      image: herbalTeaImage,
    },
    dinner: {
      name: "Vegetable Khichdi",
      calories: 450,
      suitable: true,
      image: dalRiceImage,
    },
  },
  day7: {
    breakfast: {
      name: "Amaranth Porridge",
      calories: 360,
      suitable: true,
      image: warmOatmealImage,
    },
    brunch: {
      name: "Rose Water & Almonds",
      calories: 260,
      suitable: true,
      image: coconutWaterImage,
    },
    lunch: {
      name: "Rajma & Brown Rice",
      calories: 590,
      suitable: true,
      image: kitchariImage,
    },
    snack: {
      name: "Tulsi Tea & Roasted Seeds",
      calories: 180,
      suitable: true,
      image: herbalTeaImage,
    },
    dinner: {
      name: "Clear Soup & Steamed Rice",
      calories: 410,
      suitable: true,
      image: dalRiceImage,
    },
  },
};

const GenerateDietChart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if this is a patient view only mode
  const {
    patient: patientFromState,
    dietChart: dietChartFromState,
    viewOnly,
  } = location.state || {};

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(
    patientFromState || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState(
    dietChartFromState ? "edit" : "select"
  ); // select, generating, edit, final
  const [generatedChart, setGeneratedChart] = useState(
    dietChartFromState?.daily_meals || null
  );

  // Debug logging
  console.log("🔍 GenerateDietChart Debug:", {
    viewOnly,
    dietChartFromState,
    currentView,
    generatedChart: !!generatedChart,
    patientFromState,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [customMeal, setCustomMeal] = useState("");

  // Load patients from API (only if not in view-only mode)
  useEffect(() => {
    // Skip loading patients if we're in view-only mode (patient viewing their own chart)
    if (viewOnly) {
      setLoading(false);
      return;
    }

    const loadPatients = async () => {
      try {
        setLoading(true);
        console.log("🔍 Starting to load patients for diet chart...");
        const response = await apiClient.getPatients();
        console.log("🔍 Full API response:", response);
        console.log("🔍 Response results:", response.results);
        console.log("🔍 Number of patients:", response.results?.length || 0);

        if (response.results && response.results.length > 0) {
          console.log("🔍 First patient structure:", response.results[0]);
        }

        setPatients(response.results || []);
      } catch (error) {
        console.error("❌ Error loading patients:", error);
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [viewOnly]);

  // Refresh patients function
  const refreshPatients = async () => {
    if (viewOnly) return;

    try {
      setLoading(true);
      console.log("🔄 Refreshing patients list...");
      const response = await apiClient.getPatients();
      setPatients(response.results || []);

      toast({
        title: "Patients Refreshed",
        description: `Found ${
          response.results?.length || 0
        } patients available for diet chart generation.`,
      });
    } catch (error) {
      console.error("❌ Error refreshing patients:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh patients list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    // Add safety checks to prevent undefined errors
    // The backend returns patients directly, not nested under 'patient' key
    if (!patient || !patient.user_name) {
      console.log("🔍 Filtering out patient due to missing data:", patient);
      return false;
    }
    const matches = patient.user_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    console.log(
      `🔍 Patient ${patient.user_name} matches search "${searchTerm}":`,
      matches
    );
    return matches;
  });

  console.log("🔍 Total patients:", patients.length);
  console.log("🔍 Filtered patients:", filteredPatients.length);
  console.log("🔍 Search term:", searchTerm);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setCurrentView("generating");
  };

  // Check if both analyses are completed
  const isPrakritiCompleted = location.state?.prakritiAnalysis;
  const isDiseaseAnalysisCompleted =
    location.state?.diseases && location.state.diseases.length > 0;
  const canGenerateChart = isPrakritiCompleted && isDiseaseAnalysisCompleted;

  const handleGenerateChart = async () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description:
          "Please select a patient first before generating a diet chart.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    toast({
      title: "Generating Diet Chart",
      description: `Creating a personalized 7-day meal plan for ${
        selectedPatient.patient?.user_name || selectedPatient.name
      }...`,
    });

    try {
      // Call the real API to generate diet chart
      const response = await apiClient.generateDietChart({
        patient_id: selectedPatient.id,
        chart_name: `${selectedPatient.user_name} - 7 Day Diet Chart`,
        chart_type: "7_day",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });

      console.log("🔍 Generated diet chart response:", response);

      // Use the generated chart or fallback to mock
      const chartData = response.daily_meals || mockDietChart;
      setGeneratedChart(chartData);
      setCurrentView("edit");

      // Store the generated chart ID for later use
      if (response.id) {
        localStorage.setItem("currentDietChartId", response.id);
      }

      toast({
        title: "Diet Chart Generated!",
        description: `7-day personalized meal plan for ${
          selectedPatient.patient?.user_name || selectedPatient.name
        } is ready!`,
      });
    } catch (error) {
      console.error("❌ Error generating diet chart:", error);

      // Fallback to mock data if API fails
      setGeneratedChart(mockDietChart);
      setCurrentView("edit");

      toast({
        title: "Diet Chart Generated (Demo)",
        description: "Using demo data. API generation will be available soon.",
      });
    } finally {
      setIsGenerating(false);
    }
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

  const handleExportPDF = async () => {
    console.log("🔍 PDF Export Debug:", {
      contentRef: contentRef.current,
      currentView,
      viewOnly,
      generatedChart: !!generatedChart,
    });

    if (!contentRef.current) {
      console.error("❌ contentRef.current is null");
      toast({
        title: "Export Failed",
        description: "Content not ready for export. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Exporting PDF",
      description: "Generating diet chart PDF for download...",
    });

    try {
      // Check if html2pdf is available
      if (typeof html2pdf === "undefined") {
        throw new Error("html2pdf library not loaded");
      }

      // Temporarily hide buttons for PDF generation
      const buttons = contentRef.current.querySelectorAll(".no-print");
      const originalStyles: string[] = [];

      buttons.forEach((button) => {
        const element = button as HTMLElement;
        originalStyles.push(element.style.display);
        element.style.display = "none";
      });

      // Wait a bit for DOM to update and ensure content is rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Double-check that content is still available
      if (!contentRef.current) {
        throw new Error("Content reference lost during processing");
      }

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${(
          selectedPatient?.patient?.user_name ||
          selectedPatient?.name ||
          "patient"
        ).replace(/\s+/g, "_")}_diet_chart.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      // Generate PDF
      await html2pdf().set(opt).from(contentRef.current).save();

      // Restore button visibility
      buttons.forEach((button, index) => {
        const element = button as HTMLElement;
        element.style.display = originalStyles[index];
      });

      toast({
        title: "PDF Exported Successfully!",
        description: `Diet chart for ${
          selectedPatient?.patient?.user_name || selectedPatient?.name
        } exported successfully.`,
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: `Failed to export PDF: ${
          error.message || "Unknown error"
        }. Please try again.`,
        variant: "destructive",
      });
    }
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
        name: customMeal.trim(),
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

  const handleSaveAndSendToPatient = async () => {
    if (!selectedPatient || !generatedChart) {
      toast({
        title: "Error",
        description: "No patient or diet chart selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      const chartId = localStorage.getItem("currentDietChartId");

      if (chartId) {
        // Clean the generated chart data to match backend expectations
        const cleanedChart = {};
        Object.keys(generatedChart).forEach((dayKey) => {
          cleanedChart[dayKey] = {};
          Object.keys(generatedChart[dayKey]).forEach((mealKey) => {
            const meal = generatedChart[dayKey][mealKey];
            cleanedChart[dayKey][mealKey] = {
              name: meal.name,
              calories: meal.calories,
              description: meal.description || meal.name,
              suitable: meal.suitable || true,
            };
          });
        });

        // Update existing chart
        await apiClient.saveDietChart({
          id: chartId,
          daily_meals: cleanedChart,
          status: "active", // Mark as active so patient can see it
          notes: `Diet chart generated and sent to ${
            selectedPatient.user_name
          } on ${new Date().toLocaleDateString()}`,
        });
      } else {
        // Clean the generated chart data to match backend expectations
        const cleanedChart = {};
        Object.keys(generatedChart).forEach((dayKey) => {
          cleanedChart[dayKey] = {};
          Object.keys(generatedChart[dayKey]).forEach((mealKey) => {
            const meal = generatedChart[dayKey][mealKey];
            cleanedChart[dayKey][mealKey] = {
              name: meal.name,
              calories: meal.calories,
              description: meal.description || meal.name,
              suitable: meal.suitable || true,
            };
          });
        });

        // Create new chart
        const response = await apiClient.createDietChart({
          patient: selectedPatient.id,
          chart_name: `${selectedPatient.user_name} - 7 Day Diet Chart`,
          chart_type: "7_day",
          status: "active",
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          total_days: 7,
          daily_meals: cleanedChart,
          target_calories: 2000, // Default, should be calculated based on patient
          meal_distribution: {
            breakfast: 0.25,
            brunch: 0.15,
            lunch: 0.3,
            snack: 0.1,
            dinner: 0.2,
          },
          notes: `Diet chart generated and sent to ${
            selectedPatient.user_name
          } on ${new Date().toLocaleDateString()}`,
        });

        if (response.id) {
          localStorage.setItem("currentDietChartId", response.id);
        }
      }

      toast({
        title: "Diet Chart Sent Successfully!",
        description: `The 7-day diet chart has been sent to ${selectedPatient.user_name} and is now available in their dashboard.`,
      });

      // Navigate back to doctor dashboard
      setTimeout(() => {
        navigate("/doctor-dashboard");
      }, 2000);
    } catch (error) {
      console.error("❌ Error saving diet chart:", error);
      toast({
        title: "Error",
        description: "Failed to save diet chart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderPatientCard = (patient) => {
    // Add safety checks to prevent undefined errors
    // The backend returns patients directly, not nested under 'patient' key
    if (!patient || !patient.user_name) {
      return null;
    }

    // Calculate age from date of birth
    const calculateAge = (dob) => {
      if (!dob) return "Unknown";
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    };

    // Get dominant dosha from prakriti analysis
    const getDominantDosha = (prakritiData) => {
      if (
        !prakritiData ||
        !prakritiData.vata_score ||
        !prakritiData.pitta_score ||
        !prakritiData.kapha_score
      ) {
        return "Not Analyzed";
      }
      const scores = {
        vata: prakritiData.vata_score,
        pitta: prakritiData.pitta_score,
        kapha: prakritiData.kapha_score,
      };
      const dominant = Object.keys(scores).reduce((a, b) =>
        scores[a] > scores[b] ? a : b
      );
      return dominant.charAt(0).toUpperCase() + dominant.slice(1);
    };

    // Calculate target calories based on age, gender, and activity level
    const calculateTargetCalories = (patientData) => {
      const age = calculateAge(patientData.date_of_birth);
      const gender = patientData.gender;
      const weight = patientData.weight || 70; // Default weight if not provided
      const height = patientData.height || 170; // Default height if not provided

      // Basic BMR calculation (simplified)
      let bmr;
      if (gender === "Male") {
        bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
      } else {
        bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
      }

      // Activity level multiplier (1.2 for sedentary, 1.375 for light activity, 1.55 for moderate)
      const activityMultiplier = 1.375; // Default to light activity
      return Math.round(bmr * activityMultiplier);
    };

    const age = calculateAge(patient.date_of_birth);
    const dominantDosha = getDominantDosha(patient.prakriti_analysis);
    const targetCalories = calculateTargetCalories(patient);

    const isSelected = selectedPatient?.id === patient.id;

    return (
      <Card
        key={patient.id}
        className={`hover:shadow-warm transition-all duration-300 cursor-pointer ${
          isSelected ? "ring-2 ring-orange-500 bg-orange-50" : ""
        }`}
        onClick={() => handleSelectPatient(patient)}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-healing flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{patient.user_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {age} years • {patient.gender}
                </p>
                <div className="flex space-x-2 mt-2">
                  <Badge variant="secondary">Dominant: {dominantDosha}</Badge>
                  <Badge variant="outline">{targetCalories} cal/day</Badge>
                </div>
              </div>
            </div>
            <Button variant={isSelected ? "default" : "outline"}>
              {isSelected ? "✓ Selected" : "Select Patient"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDayChart = (dayData: any, dayName: string) => (
    <Card key={dayName}>
      <CardHeader>
        <CardTitle className="text-lg capitalize">
          {dayName.replace("day", "Day ")}
        </CardTitle>
        <CardDescription>
          Total Calories:{" "}
          {(Object.values(dayData) as any[]).reduce(
            (sum: number, meal: any) => sum + (meal?.calories || 0),
            0
          )}{" "}
          cal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(dayData).map(([meal, food]: [string, any]) => (
          <div
            key={meal}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border"
          >
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
              {!viewOnly && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditMeal(dayName, meal, food)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
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

              <h2 className="text-2xl font-bold mb-2">
                {selectedPatient?.user_name}
              </h2>
              <div className="flex justify-center space-x-4 mb-6">
                <Badge variant="secondary">
                  Dominant: {selectedPatient?.dominantDosha}
                </Badge>

                <Badge variant="outline">
                  Target: {selectedPatient?.targetCalories} cal/day
                </Badge>
              </div>

              {/* Analysis Status */}
              <div className="bg-muted/30 rounded-lg p-6 mb-6">
                <h3 className="font-medium mb-4">Analysis Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        isPrakritiCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-sm font-medium">
                      Prakriti Analysis:{" "}
                      {isPrakritiCompleted ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        isDiseaseAnalysisCompleted
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-sm font-medium">
                      Disease Analysis:{" "}
                      {isDiseaseAnalysisCompleted ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>
                {!canGenerateChart && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> Both analyses must be completed
                      before generating a diet chart.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-muted/30 rounded-lg p-6 mb-6">
                <h3 className="font-medium mb-4">Daily Calorie Distribution</h3>
                <div className="grid grid-cols-5 gap-4 text-sm">
                  {selectedPatient?.mealDistribution &&
                    Object.entries(selectedPatient.mealDistribution).map(
                      ([meal, calories]: [string, any]) => (
                        <div key={meal} className="text-center">
                          <p className="font-medium capitalize">{meal}</p>
                          <p className="text-muted-foreground">
                            {calories as number} cal
                          </p>
                        </div>
                      )
                    )}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleGenerateChart}
                  disabled={isGenerating || !canGenerateChart}
                  className={`w-full ${
                    !canGenerateChart ? "bg-gray-300 cursor-not-allowed" : ""
                  }`}
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating 7-Day AI Diet Chart...
                    </>
                  ) : !canGenerateChart ? (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Complete Both Analyses First
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
                      <div
                        className="bg-gradient-primary h-2 rounded-full animate-pulse"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Analyzing patient profile and generating personalized
                      7-day diet plan with Ayurvedic principles...
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

  if (currentView === "edit" && (generatedChart || viewOnly)) {
    return (
      <div className="min-h-screen bg-gradient-earth">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur border-b border-border/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  onClick={() =>
                    navigate(
                      viewOnly ? "/patient-dashboard" : "/doctor-dashboard"
                    )
                  }
                  className="mb-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {viewOnly ? "Back to Dashboard" : "Back to Dashboard"}
                </Button>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {viewOnly ? "My 7-Day Diet Chart" : "7-Day Diet Chart - "}
                  {!viewOnly && selectedPatient?.user_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {viewOnly
                    ? "Your personalized 7-day meal plan created by your doctor"
                    : "Review and customize the AI-generated 7-day diet plan"}
                </p>
              </div>
              <div className="flex space-x-2">
                {!viewOnly && (
                  <>
                    <Button variant="outline" onClick={handleRegenerateChart}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button
                      onClick={handleSaveAndSendToPatient}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Send to Patient
                    </Button>
                  </>
                )}
                <Button onClick={handleExportPDF} className="no-print">
                  <Download className="w-4 h-4 mr-2" />
                  {viewOnly ? "Download PDF" : "Export PDF"}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main ref={contentRef} className="container mx-auto px-6 py-8">
          <Tabs defaultValue="day1" className="space-y-6">
            <TabsList className="grid grid-cols-7 w-full">
              {Array.from({ length: 7 }, (_, i) => (
                <TabsTrigger key={`day${i + 1}`} value={`day${i + 1}`}>
                  Day {i + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(generatedChart || mockDietChart).map(
              ([day, dayData]) => (
                <TabsContent key={day} value={day} className="space-y-4">
                  {renderDayChart(dayData, day)}
                </TabsContent>
              )
            )}
          </Tabs>

          {/* Manual Modification Dialog */}
          <Dialog
            open={!!editingMeal}
            onOpenChange={() => setEditingMeal(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Meal</DialogTitle>
                <DialogDescription>
                  Manually modify the selected meal for {selectedPatient?.name}
                  's diet plan
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
                  <Button
                    variant="outline"
                    onClick={() => setEditingMeal(null)}
                  >
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
                onClick={() =>
                  navigate(
                    viewOnly ? "/patient-dashboard" : "/doctor-dashboard"
                  )
                }
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {viewOnly ? "Back to Dashboard" : "Back to Dashboard"}
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {viewOnly ? "My 7-Day Diet Chart" : "7-Day Diet Chart - "}
                {!viewOnly && selectedPatient?.user_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {viewOnly
                  ? "Your personalized 7-day meal plan created by your doctor"
                  : "Review and customize the AI-generated 7-day diet plan"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={contentRef} className="container mx-auto px-6 py-8">
        {/* Search and Refresh */}
        <div className="mb-8 flex justify-between items-center">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={refreshPatients}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Patients
          </Button>
        </div>

        {/* Patient Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Select Patient for 7-Day Diet Chart Generation
          </h2>

          {loading ? (
            <Card className="text-center py-12">
              <CardContent>
                <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-spin" />
                <h3 className="text-lg font-semibold mb-2">
                  Loading patients...
                </h3>
                <p className="text-muted-foreground">
                  Please wait while we fetch patient data
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredPatients.map(renderPatientCard)}

              {filteredPatients.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No patients found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm
                        ? "Try adjusting your search term or click 'Refresh Patients' to reload the list"
                        : "No patients available for diet chart generation. Make sure patients have been added to the system."}
                    </p>
                    {!searchTerm && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          To add patients:
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => navigate("/doctor-dashboard")}
                          className="mr-2"
                        >
                          Go to Dashboard
                        </Button>
                        <Button
                          variant="outline"
                          onClick={refreshPatients}
                          disabled={loading}
                        >
                          <RefreshCw
                            className={`w-4 h-4 mr-2 ${
                              loading ? "animate-spin" : ""
                            }`}
                          />
                          Refresh Patients
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Generate Button - Show when patient is selected */}
              {selectedPatient && (
                <Card className="mt-6 border-2 border-orange-200 bg-orange-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-orange-800">
                          Selected Patient: {selectedPatient.user_name}
                        </h3>
                        <p className="text-orange-600">
                          Ready to generate a personalized 7-day diet chart
                        </p>
                      </div>
                      <Button
                        onClick={handleGenerateChart}
                        disabled={isGenerating}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Diet Chart
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default GenerateDietChart;
