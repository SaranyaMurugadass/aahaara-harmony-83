import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const prakritiQuestions = [
  {
    id: 1,
    question: "Body Frame",
    options: [
      { value: "vata", label: "Thin, lean build" },
      { value: "pitta", label: "Medium, athletic build" },
      { value: "kapha", label: "Heavy, broad build" }
    ]
  },
  {
    id: 2,
    question: "Skin Type",
    options: [
      { value: "vata", label: "Dry, rough, cool" },
      { value: "pitta", label: "Soft, oily, warm" },
      { value: "kapha", label: "Thick, moist, cool" }
    ]
  },
  {
    id: 3,
    question: "Body Weight Tendency",
    options: [
      { value: "vata", label: "Hard to gain weight" },
      { value: "pitta", label: "Stable weight" },
      { value: "kapha", label: "Hard to lose weight" }
    ]
  },
  {
    id: 4,
    question: "Hunger Pattern",
    options: [
      { value: "vata", label: "Irregular, variable" },
      { value: "pitta", label: "Sharp, urgent hunger" },
      { value: "kapha", label: "Can skip meals easily" }
    ]
  },
  {
    id: 5,
    question: "Weather Tolerance",
    options: [
      { value: "vata", label: "Dislike cold weather" },
      { value: "pitta", label: "Dislike hot weather" },
      { value: "kapha", label: "Dislike damp, cool weather" }
    ]
  },
  {
    id: 6,
    question: "Reaction to Stress",
    options: [
      { value: "vata", label: "Become anxious, worried" },
      { value: "pitta", label: "Become angry, irritated" },
      { value: "kapha", label: "Remain calm, withdrawn" }
    ]
  },
  {
    id: 7,
    question: "Pace of Activity",
    options: [
      { value: "vata", label: "Fast, erratic" },
      { value: "pitta", label: "Focused, determined" },
      { value: "kapha", label: "Slow, steady" }
    ]
  },
  {
    id: 8,
    question: "Sleep Pattern",
    options: [
      { value: "vata", label: "Light, interrupted sleep" },
      { value: "pitta", label: "Moderate, sound sleep" },
      { value: "kapha", label: "Deep, heavy sleep" }
    ]
  },
  {
    id: 9,
    question: "Bowel Movements",
    options: [
      { value: "vata", label: "Dry, hard, irregular" },
      { value: "pitta", label: "Soft, loose, regular" },
      { value: "kapha", label: "Heavy, regular, sluggish" }
    ]
  },
  {
    id: 10,
    question: "Hair Type",
    options: [
      { value: "vata", label: "Dry, thin, brittle" },
      { value: "pitta", label: "Fine, thinning, oily" },
      { value: "kapha", label: "Thick, oily, lustrous" }
    ]
  }
];

const PrakritiAnalysis = ({ patient, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateResults = () => {
    const scores = { vata: 0, pitta: 0, kapha: 0 };
    
    Object.values(answers).forEach((answer: any) => {
      scores[answer as keyof typeof scores]++;
    });

    // Convert to percentages
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const percentages = {
      vata: Math.round((scores.vata / total) * 100),
      pitta: Math.round((scores.pitta / total) * 100),
      kapha: Math.round((scores.kapha / total) * 100)
    };

    return percentages;
  };

  const handleNext = () => {
    if (currentQuestion < prakritiQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const calculatedResults = calculateResults();
      setResults(calculatedResults);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = () => {
    onComplete(results);
  };

  const progress = ((currentQuestion + 1) / prakritiQuestions.length) * 100;
  const currentQ = prakritiQuestions[currentQuestion];
  const canProceed = answers[currentQ.id];

  if (showResults) {
    const dominantDosha = Object.entries(results).reduce((a, b) => 
      results[a[0]] > results[b[0]] ? a : b
    )[0];

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Prakriti Analysis Results</CardTitle>
          <CardDescription>
            Constitutional analysis for {patient.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-healing flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white capitalize">{dominantDosha[0]}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Dominant Constitution: {dominantDosha.charAt(0).toUpperCase() + dominantDosha.slice(1)}
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(results).map(([dosha, percentage]) => (
              <div key={dosha} className="space-y-2">
                <div className="flex justify-between">
                  <Label className="capitalize font-medium">{dosha}</Label>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>
            ))}
          </div>

          <div className="bg-muted/30 rounded-lg p-6">
            <h4 className="font-medium mb-3">Constitutional Characteristics:</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-primary mb-2">Vata ({results.vata}%)</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Movement & circulation</li>
                  <li>• Creative & flexible</li>
                  <li>• Light & changeable</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-secondary mb-2">Pitta ({results.pitta}%)</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Metabolism & digestion</li>
                  <li>• Focused & determined</li>
                  <li>• Sharp & intense</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-accent mb-2">Kapha ({results.kapha}%)</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Structure & stability</li>
                  <li>• Calm & nurturing</li>
                  <li>• Strong & steady</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setShowResults(false)}>
              Retake Analysis
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              Complete & Save Results
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Prakriti Analysis - {patient.name}</CardTitle>
        <CardDescription>
          Answer these 10 questions to determine your constitutional type
        </CardDescription>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Question {currentQuestion + 1} of {prakritiQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>
          <RadioGroup
            value={answers[currentQ.id] || ""}
            onValueChange={(value) => handleAnswer(currentQ.id, value)}
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
            disabled={!canProceed}
          >
            {currentQuestion === prakritiQuestions.length - 1 ? "Calculate Results" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrakritiAnalysis;