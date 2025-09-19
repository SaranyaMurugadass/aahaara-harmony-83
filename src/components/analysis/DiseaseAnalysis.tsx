import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

const diseaseQuestions = [
  {
    id: 1,
    question: "Do you have a history of diabetes or blood sugar issues?",
    type: "radio",
    options: [
      { value: "none", label: "No history" },
      { value: "prediabetic", label: "Pre-diabetic/borderline" },
      { value: "type2", label: "Type 2 diabetes" },
      { value: "family", label: "Family history only" }
    ]
  },
  {
    id: 2,
    question: "Do you have high blood pressure or heart-related issues?",
    type: "radio",
    options: [
      { value: "none", label: "No issues" },
      { value: "borderline", label: "Borderline high BP" },
      { value: "hypertension", label: "Diagnosed hypertension" },
      { value: "heart", label: "Heart disease" }
    ]
  },
  {
    id: 3,
    question: "Do you experience digestive problems?",
    type: "checkbox",
    options: [
      { value: "acidity", label: "Acidity/heartburn" },
      { value: "bloating", label: "Bloating/gas" },
      { value: "constipation", label: "Constipation" },
      { value: "diarrhea", label: "Frequent loose stools" },
      { value: "none", label: "No digestive issues" }
    ]
  },
  {
    id: 4,
    question: "Do you have any respiratory conditions?",
    type: "checkbox",
    options: [
      { value: "asthma", label: "Asthma" },
      { value: "allergies", label: "Seasonal allergies" },
      { value: "sinusitis", label: "Chronic sinusitis" },
      { value: "none", label: "No respiratory issues" }
    ]
  },
  {
    id: 5,
    question: "Do you experience joint or muscle problems?",
    type: "checkbox",
    options: [
      { value: "arthritis", label: "Arthritis/joint pain" },
      { value: "backpain", label: "Chronic back pain" },
      { value: "muscle", label: "Muscle stiffness" },
      { value: "none", label: "No joint/muscle issues" }
    ]
  },
  {
    id: 6,
    question: "How would you describe your energy levels?",
    type: "radio",
    options: [
      { value: "high", label: "Generally high energy" },
      { value: "moderate", label: "Moderate, stable energy" },
      { value: "low", label: "Often tired/low energy" },
      { value: "variable", label: "Energy varies greatly" }
    ]
  },
  {
    id: 7,
    question: "Do you have any skin conditions?",
    type: "checkbox",
    options: [
      { value: "eczema", label: "Eczema/dermatitis" },
      { value: "psoriasis", label: "Psoriasis" },
      { value: "acne", label: "Frequent acne" },
      { value: "dryness", label: "Chronic dry skin" },
      { value: "none", label: "No skin issues" }
    ]
  },
  {
    id: 8,
    question: "How is your sleep quality?",
    type: "radio",
    options: [
      { value: "excellent", label: "Deep, restful sleep" },
      { value: "good", label: "Generally good sleep" },
      { value: "light", label: "Light, easily disturbed" },
      { value: "insomnia", label: "Difficulty falling/staying asleep" }
    ]
  },
  {
    id: 9,
    question: "Do you experience stress or anxiety?",
    type: "radio",
    options: [
      { value: "minimal", label: "Rarely stressed" },
      { value: "moderate", label: "Moderate stress levels" },
      { value: "high", label: "High stress/anxiety" },
      { value: "chronic", label: "Chronic anxiety/depression" }
    ]
  },
  {
    id: 10,
    question: "Do you have any hormonal imbalances?",
    type: "checkbox",
    options: [
      { value: "thyroid", label: "Thyroid issues" },
      { value: "pcos", label: "PCOS/hormonal irregularities" },
      { value: "menopause", label: "Menopause symptoms" },
      { value: "none", label: "No hormonal issues" }
    ]
  },
  {
    id: 11,
    question: "Do you have food allergies or intolerances?",
    type: "checkbox",
    options: [
      { value: "gluten", label: "Gluten intolerance" },
      { value: "lactose", label: "Lactose intolerance" },
      { value: "nuts", label: "Nut allergies" },
      { value: "spices", label: "Spice sensitivities" },
      { value: "none", label: "No food allergies" }
    ]
  },
  {
    id: 12,
    question: "How often do you get sick?",
    type: "radio",
    options: [
      { value: "rarely", label: "Rarely get sick" },
      { value: "seasonal", label: "Seasonal colds/flu" },
      { value: "frequent", label: "Frequently fall ill" },
      { value: "chronic", label: "Chronic health issues" }
    ]
  },
  {
    id: 13,
    question: "Do you have any weight-related concerns?",
    type: "radio",
    options: [
      { value: "stable", label: "Weight is stable" },
      { value: "gain", label: "Difficulty losing weight" },
      { value: "loss", label: "Difficulty gaining weight" },
      { value: "fluctuates", label: "Weight fluctuates frequently" }
    ]
  },
  {
    id: 14,
    question: "Do you take any regular medications?",
    type: "checkbox",
    options: [
      { value: "bp", label: "Blood pressure medication" },
      { value: "diabetes", label: "Diabetes medication" },
      { value: "thyroid", label: "Thyroid medication" },
      { value: "supplements", label: "Vitamins/supplements only" },
      { value: "none", label: "No regular medications" }
    ]
  },
  {
    id: 15,
    question: "Any other significant health concerns?",
    type: "checkbox",
    options: [
      { value: "kidney", label: "Kidney/urinary issues" },
      { value: "liver", label: "Liver problems" },
      { value: "autoimmune", label: "Autoimmune conditions" },
      { value: "cancer", label: "Cancer history" },
      { value: "none", label: "No other concerns" }
    ]
  }
];

const DiseaseAnalysis = ({ patient, onComplete }: { patient: any, onComplete?: (results: any) => void }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleRadioAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: [value]
    }));
  };

  const handleCheckboxAnswer = (questionId, value, checked) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...current.filter(v => v !== "none"), value]
        };
      } else {
        return {
          ...prev,
          [questionId]: current.filter(v => v !== value)
        };
      }
    });
  };

  const analyzeHealthProfile = () => {
    const issues = {
      metabolic: [],
      digestive: [],
      respiratory: [],
      musculoskeletal: [],
      mental: [],
      hormonal: [],
      immune: [],
      other: []
    };

    // Analyze answers and categorize health issues
    Object.entries(answers).forEach(([questionId, values]) => {
      const qId = parseInt(questionId);
      (values as string[]).forEach((value: string) => {
        if (value === "none") return;
        
        switch (qId) {
          case 1:
            if (["prediabetic", "type2"].includes(value)) {
              issues.metabolic.push("Blood sugar management needed");
            }
            break;
          case 2:
            if (["borderline", "hypertension", "heart"].includes(value)) {
              issues.metabolic.push("Cardiovascular care required");
            }
            break;
          case 3:
            if (value !== "none") {
              issues.digestive.push(`${value} management`);
            }
            break;
          case 4:
            if (value !== "none") {  
              issues.respiratory.push(`${value} care`);
            }
            break;
          case 5:
            if (value !== "none") {
              issues.musculoskeletal.push(`${value} support`);
            }
            break;
          case 9:
            if (["high", "chronic"].includes(value)) {
              issues.mental.push("Stress management needed");
            }
            break;
          case 10:
            if (value !== "none") {
              issues.hormonal.push(`${value} balance`);
            }
            break;
          // Add more cases as needed
        }
      });
    });

    return issues;
  };

  const handleNext = () => {
    if (currentQuestion < diseaseQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(analyzeHealthProfile());
    }
  };

  const progress = ((currentQuestion + 1) / diseaseQuestions.length) * 100;
  const currentQ = diseaseQuestions[currentQuestion];
  const hasAnswered = answers[currentQ.id] && answers[currentQ.id].length > 0;

  if (showResults) {
    const healthProfile = analyzeHealthProfile();
    const totalIssues = Object.values(healthProfile).flat().length;

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Health History Analysis</CardTitle>
          <CardDescription>
            Comprehensive health profile for {patient.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-healing flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-white">{totalIssues}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {totalIssues === 0 ? "Excellent Health Profile" : 
               totalIssues <= 3 ? "Good Health with Minor Concerns" :
               totalIssues <= 6 ? "Moderate Health Management Needed" :
               "Comprehensive Care Required"}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(healthProfile).map(([category, issues]) => {
              if (issues.length === 0) return null;
              return (
                <Card key={category} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium capitalize mb-2">{category} Health</h4>
                    <ul className="text-sm space-y-1">
                      {issues.map((issue, index) => (
                        <li key={index} className="text-muted-foreground">• {issue}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalIssues === 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Excellent Health Foundation
              </h4>
              <p className="text-green-600 dark:text-green-300 text-sm">
                No significant health concerns identified. Focus on preventive care and lifestyle maintenance.
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setShowResults(false)}>
              Review Answers
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              Complete Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Health History Analysis - {patient.name}</CardTitle>
        <CardDescription>
          Please answer these questions about your health history and current conditions
        </CardDescription>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Question {currentQuestion + 1} of {diseaseQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>
          
          {currentQ.type === "radio" ? (
            <RadioGroup
              value={(answers[currentQ.id] && answers[currentQ.id][0]) || ""}
              onValueChange={(value) => handleRadioAnswer(currentQ.id, value)}
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value={option.value} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-2">
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                  <Checkbox
                    id={`checkbox-${index}`}
                    checked={(answers[currentQ.id] || []).includes(option.value)}
                    onCheckedChange={(checked) => handleCheckboxAnswer(currentQ.id, option.value, checked)}
                  />
                  <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasAnswered}
          >
            {currentQuestion === diseaseQuestions.length - 1 ? "Complete Analysis" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiseaseAnalysis;