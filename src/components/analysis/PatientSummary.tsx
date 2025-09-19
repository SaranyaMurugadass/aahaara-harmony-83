import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { User, Heart, Utensils, Activity, Download } from "lucide-react";

const PatientSummary = ({ patient }) => {
  // Mock calculated data based on patient profile
  const calculateCalorieNeeds = (patient) => {
    // Harris-Benedict formula with activity factor
    const baseRate = patient.gender === "Male" 
      ? 88.362 + (13.397 * 70) + (4.799 * 175) - (5.677 * patient.age)
      : 447.593 + (9.247 * 60) + (3.098 * 165) - (4.330 * patient.age);
    
    return Math.round(baseRate * 1.4); // Moderate activity level
  };

  const getMealDistribution = (totalCalories, dominantDosha) => {
    // Adjust meal distribution based on dosha
    if (dominantDosha === "Vata") {
      return {
        breakfast: Math.round(totalCalories * 0.25), // 25%
        brunch: Math.round(totalCalories * 0.15),    // 15%
        lunch: Math.round(totalCalories * 0.30),     // 30%
        snack: Math.round(totalCalories * 0.10),     // 10%
        dinner: Math.round(totalCalories * 0.20)     // 20%
      };
    } else if (dominantDosha === "Kapha") {
      return {
        breakfast: Math.round(totalCalories * 0.30), // 30%
        brunch: Math.round(totalCalories * 0.10),    // 10%
        lunch: Math.round(totalCalories * 0.35),     // 35%
        snack: Math.round(totalCalories * 0.05),     // 5%
        dinner: Math.round(totalCalories * 0.20)     // 20%
      };
    } else { // Pitta
      return {
        breakfast: Math.round(totalCalories * 0.20), // 20%
        brunch: Math.round(totalCalories * 0.15),    // 15%
        lunch: Math.round(totalCalories * 0.30),     // 30%
        snack: Math.round(totalCalories * 0.10),     // 10%
        dinner: Math.round(totalCalories * 0.25)     // 25%
      };
    }
  };

  const getDietaryRecommendations = (dominantDosha) => {
    const recommendations = {
      Vata: {
        favor: ["Warm, cooked foods", "Sweet, sour, salty tastes", "Regular meal times", "Healthy fats", "Grounding grains"],
        avoid: ["Cold, raw foods", "Bitter, pungent tastes", "Irregular eating", "Excess caffeine", "Dry, light foods"],
        lifestyle: ["Regular routine", "Gentle exercise", "Adequate rest", "Stress management", "Warm environment"]
      },
      Pitta: {
        favor: ["Cool, fresh foods", "Sweet, bitter, astringent tastes", "Moderate portions", "Cooling spices", "Fresh fruits"],
        avoid: ["Hot, spicy foods", "Sour, salty, pungent tastes", "Overeating", "Excessive heat", "Fermented foods"],
        lifestyle: ["Cool environment", "Moderate exercise", "Regular sleep", "Avoid overwork", "Calming activities"]
      },
      Kapha: {
        favor: ["Light, warm foods", "Pungent, bitter, astringent tastes", "Smaller portions", "Stimulating spices", "Cooked vegetables"],
        avoid: ["Heavy, oily foods", "Sweet, sour, salty tastes", "Overeating", "Cold foods", "Dairy excess"],
        lifestyle: ["Regular exercise", "Active lifestyle", "Avoid daytime sleep", "Stimulating activities", "Dry environment"]
      }
    };
    
    return recommendations[dominantDosha] || recommendations.Vata;
  };

  // Calculate values
  const totalCalories = calculateCalorieNeeds(patient);
  const dominantDosha = patient.prakritiScore 
    ? Object.entries(patient.prakritiScore).reduce((a, b) => 
        patient.prakritiScore[a[0]] > patient.prakritiScore[b[0]] ? a : b
      )[0]
    : "Vata";
  
  const mealDistribution = getMealDistribution(totalCalories, dominantDosha);
  const recommendations = getDietaryRecommendations(dominantDosha);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Patient Overview */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-healing flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">{patient.name} - Health Summary</CardTitle>
          <CardDescription>
            Comprehensive Ayurvedic health assessment and dietary guidelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-medium mb-2">Basic Information</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{patient.age} years old</p>
                <p>{patient.gender}</p>
                <p>{patient.location}</p>
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">Dominant Dosha</h4>
              <Badge variant="default" className="text-lg py-2 px-4">
                {dominantDosha.charAt(0).toUpperCase() + dominantDosha.slice(1)}
              </Badge>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">Daily Calorie Target</h4>
              <div className="text-2xl font-bold text-primary">
                {totalCalories} cal
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prakriti Constitution */}
      {patient.prakritiScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Constitutional Analysis (Prakriti)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(patient.prakritiScore).map(([dosha, percentage]: [string, any]) => (
                <div key={dosha} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium capitalize">{dosha}</span>
                    <span className="text-sm font-medium">{percentage as number}%</span>
                  </div>
                  <Progress value={percentage as number} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Meal Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="w-5 h-5 mr-2" />
            Daily Meal Distribution
          </CardTitle>
          <CardDescription>
            Optimal calorie distribution based on your {dominantDosha} constitution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            {Object.entries(mealDistribution).map(([meal, calories]) => (
              <Card key={meal} className="text-center">
                <CardContent className="p-4">
                  <h4 className="font-medium capitalize mb-2">{meal}</h4>
                  <div className="text-xl font-bold text-primary mb-1">
                    {calories}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((calories / totalCalories) * 100)}% of daily intake
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dietary Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Based on your {dominantDosha} constitution and health profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-3">
                ✓ Foods to Favor
              </h4>
              <ul className="space-y-1 text-sm">
                {recommendations.favor.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-700 dark:text-red-400 mb-3">
                ✗ Foods to Minimize
              </h4>
              <ul className="space-y-1 text-sm">
                {recommendations.avoid.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-3">Lifestyle Recommendations</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {recommendations.lifestyle.map((item, index) => (
                <Badge key={index} variant="outline" className="justify-center p-2">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Button onClick={handleExportSummary} variant="outline" size="lg" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export Summary
          </Button>
          <Button onClick={handleGenerateDietChart} size="lg" className="flex-1">
            <Utensils className="w-4 h-4 mr-2" />
            Generate Diet Chart
          </Button>
        </div>
        
        <Button onClick={handleSaveResults} size="lg" className="w-full bg-gradient-healing">
          <FileText className="w-4 h-4 mr-2" />
          Complete & Save Results
        </Button>
      </div>
    </div>
  );
};

export default PatientSummary;