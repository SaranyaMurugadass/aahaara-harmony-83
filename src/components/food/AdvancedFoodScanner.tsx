import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Upload,
  Edit3,
  List,
  Brain,
  Plus,
  Trash2,
  Eye,
  Check,
  X,
  Heart,
  Zap,
  Shield,
} from "lucide-react";

interface FoodItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  ayurveda?: any;
  timestamp: string;
  source: string;
}

interface TrainingData {
  id: number;
  timestamp: string;
  image: string;
  analysis: any;
  rawResponse: string;
  userFeedback?: string;
}

const AdvancedFoodScanner: React.FC = () => {
  // State management
  const [dailyFoods, setDailyFoods] = useState<FoodItem[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Manual entry form
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [calories, setCalories] = useState("");

  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Configuration
  const [geminiApiKey, setGeminiApiKey] = useState(
    localStorage.getItem("geminiApiKey") ||
      "AIzaSyA06UCtavNsTYt6Pb-yViOLkdUViN4M7Dk"
  );

  // Save the new API key to localStorage on component mount
  useEffect(() => {
    if (!localStorage.getItem("geminiApiKey")) {
      localStorage.setItem(
        "geminiApiKey",
        "AIzaSyA06UCtavNsTYt6Pb-yViOLkdUViN4M7Dk"
      );
    }
  }, []);
  const [showApiKeyConfig, setShowApiKeyConfig] = useState(false);

  // Training data state
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);

  const dailyCalorieGoal = 2000;

  // Load saved data on component mount
  useEffect(() => {
    const savedFoods = localStorage.getItem("dailyFoods");
    if (savedFoods) {
      setDailyFoods(JSON.parse(savedFoods));
    }

    const savedTrainingData = localStorage.getItem("trainingData");
    if (savedTrainingData) {
      setTrainingData(JSON.parse(savedTrainingData));
    }
  }, []);

  // Save foods to localStorage whenever dailyFoods changes
  useEffect(() => {
    localStorage.setItem("dailyFoods", JSON.stringify(dailyFoods));
  }, [dailyFoods]);

  // Ensure video plays when camera becomes active
  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      const video = videoRef.current;
      if (video.paused) {
        video.play().catch(console.error);
      }
    }
  }, [isCameraActive]);

  // Force video to play when component mounts and camera is active
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.srcObject && isCameraActive) {
      video.play().catch(console.error);
    }
  }, [isCameraActive]);

  // Camera Functions
  const startCamera = async () => {
    setIsCameraLoading(true);
    try {
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "environment",
        },
      });

      console.log("Camera stream obtained:", stream);

      // Wait for the video element to be available
      let attempts = 0;
      const maxAttempts = 10;

      while (!videoRef.current && attempts < maxAttempts) {
        console.log(`Waiting for video ref... attempt ${attempts + 1}`);
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (videoRef.current) {
        console.log("Video ref found, setting up stream");
        // Clear any existing stream first
        videoRef.current.srcObject = null;

        // Set the stream to the video element
        videoRef.current.srcObject = stream;

        // Set up event listeners
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          setIsCameraActive(true);
          setIsCameraLoading(false);

          // Force play after metadata is loaded
          videoRef.current?.play().catch(console.error);
        };

        videoRef.current.oncanplay = () => {
          console.log("Video can play - forcing play");
          // Force the video to play
          videoRef.current?.play().catch((error) => {
            console.error("Auto-play failed:", error);
          });
        };

        videoRef.current.onplay = () => {
          console.log("Video is now playing");
        };

        videoRef.current.onerror = (e) => {
          console.error("Video error:", e);
          setIsCameraLoading(false);
        };

        // Try to play immediately
        try {
          await videoRef.current.play();
          console.log("Video playing successfully");
        } catch (playError) {
          console.error("Immediate play failed:", playError);
          // Try again after a short delay
          setTimeout(() => {
            videoRef.current?.play().catch(console.error);
          }, 100);
        }

        // Additional attempt to ensure video plays
        setTimeout(() => {
          if (videoRef.current && videoRef.current.paused) {
            console.log("Video still paused, attempting to play again");
            videoRef.current.play().catch(console.error);
          }
        }, 500);

        // Additional debugging
        setTimeout(() => {
          if (videoRef.current) {
            console.log(
              "Video dimensions:",
              videoRef.current.videoWidth,
              "x",
              videoRef.current.videoHeight
            );
            console.log("Video ready state:", videoRef.current.readyState);
            console.log("Video paused:", videoRef.current.paused);
            console.log("Video srcObject:", videoRef.current.srcObject);
          }
        }, 1000);
      } else {
        console.error("Video ref is still null after waiting");
        setIsCameraLoading(false);
        alert(
          "Video element not found. Please refresh the page and try again."
        );
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraLoading(false);
      alert(`Camera access denied or not available. Error: ${error.message}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setIsCameraLoading(false);
    }
  };

  // Force video display function
  const forceVideoDisplay = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      console.log("Forcing video display...");
      videoRef.current.load(); // Reload the video element
      videoRef.current
        .play()
        .then(() => {
          console.log("Video display forced successfully");
        })
        .catch((error) => {
          console.error("Force display failed:", error);
        });
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current video frame to canvas
        ctx.drawImage(video, 0, 0);

        // Convert to image data
        const dataURL = canvas.toDataURL("image/jpeg", 0.8);
        console.log("Photo captured successfully");

        // Set the captured image
        setCapturedImage(dataURL);

        // Start analysis immediately
        setIsAnalyzing(true);

        try {
          // Analyze the captured image
          await analyzeImage(dataURL);
        } catch (error) {
          console.error("Analysis failed:", error);
          alert("Analysis failed. Please check your AI key and try again.");
        } finally {
          setIsAnalyzing(false);
        }
      }
    } else {
      alert("Camera not ready. Please start the camera first.");
    }
  };

  // File upload functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadedImage(result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // AI Analysis
  const analyzeImageWithGemini = async (imageBase64: string) => {
    const prompt = `Analyze this image and identify all food items visible. For each food item, provide:

1. Food name (be specific, e.g., "grilled chicken breast" not just "chicken")
2. Estimated portion size in grams or standard units
3. Confidence level (0-100%)
4. Estimated nutritional information per portion:
   - Calories, Carbohydrates (g), Protein (g), Fat (g), Fiber (g), Sugar (g)
5. Ayurvedic properties:
   - Dosha effects (vata: good/moderate/avoid, pitta: good/moderate/avoid, kapha: good/moderate/avoid)
   - Rasa (taste): madhura (sweet), amla (sour), lavana (salty), katu (pungent), tikta (bitter), kashaya (astringent)
   - Virya (potency): ushna (heating) or sheeta (cooling)
   - Vipaka (post-digestive effect): madhura (sweet), amla (sour), katu (pungent)
   - Guna (qualities): laghu (light), guru (heavy), ruksha (dry), snigdha (oily), etc.
   - Traditional properties and recommendations

Return the response in the following JSON format only, no additional text:
{
    "foods": [
        {
            "name": "food name",
            "portion_size": 150,
            "unit": "grams",
            "confidence": 85,
            "nutrition": {
                "calories": 250,
                "carbs": 0,
                "protein": 30,
                "fat": 8,
                "fiber": 0,
                "sugar": 0
            },
            "ayurveda": {
                "doshas": {
                    "vata": "good",
                    "pitta": "moderate",
                    "kapha": "good"
                },
                "rasa": ["madhura"],
                "virya": "ushna",
                "vipaka": "madhura",
                "guna": ["guru", "snigdha"],
                "properties": "Strengthening, building, easy to digest"
            }
        }
    ]
}

Be as accurate as possible with portion size estimation and Ayurvedic analysis based on traditional principles.`;

    const parts = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
      { text: prompt },
    ];

    const requestBody = {
      contents: [
        {
          parts: parts,
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.1,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    try {
      const base64Data = imageData.split(",")[1];
      const response = await analyzeImageWithGemini(base64Data);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);

        // Save training data
        saveTrainingData(imageData, analysisData, response);

        // Set results
        setDetectionResults(analysisData.foods || []);
        setShowResults(true);

        // Automatically add detected foods to daily log
        if (analysisData.foods && analysisData.foods.length > 0) {
          const detectedFoods = analysisData.foods.map((food: any) => ({
            id: Date.now() + Math.random(),
            name: food.name,
            calories: food.nutrition?.calories || 0,
            protein: food.nutrition?.protein || 0,
            carbs: food.nutrition?.carbs || 0,
            fat: food.nutrition?.fat || 0,
            fiber: food.nutrition?.fiber || 0,
            sugar: food.nutrition?.sugar || 0,
            sodium: food.nutrition?.sodium || 0,
            timestamp: new Date().toISOString(),
            image: imageData,
            aiAnalysis: food,
            portionSize: food.portion_size || 100,
            unit: food.unit || "grams",
          }));

          // Add all detected foods to daily log
          detectedFoods.forEach((food) => addFood(food));

          // Show success message
          const foodNames = detectedFoods.map((f) => f.name).join(", ");
          alert(
            `✅ Food detected and added to your daily log!\n\nDetected: ${foodNames}\nTotal calories: ${detectedFoods.reduce(
              (sum, f) => sum + f.calories,
              0
            )}kcal`
          );
        }

        return analysisData;
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Training data management
  const saveTrainingData = (
    imageData: string,
    analysisResult: any,
    rawResponse: string
  ) => {
    const newTrainingData = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      image: imageData.substring(0, 100) + "...",
      analysis: analysisResult,
      rawResponse: rawResponse,
    };

    const updatedTrainingData = [...trainingData, newTrainingData];
    setTrainingData(updatedTrainingData);
    localStorage.setItem("trainingData", JSON.stringify(updatedTrainingData));
  };

  const clearTrainingData = () => {
    if (confirm("Are you sure you want to clear all training data?")) {
      setTrainingData([]);
      localStorage.removeItem("trainingData");
    }
  };

  // Food management
  const addFood = (foodData: any) => {
    const newFood: FoodItem = {
      id: Date.now(),
      name: foodData.name,
      quantity: foodData.quantity || foodData.portion_size || 100,
      unit: foodData.unit || "grams",
      calories: foodData.calories || foodData.nutrition?.calories || 0,
      carbs: foodData.carbs || foodData.nutrition?.carbs || 0,
      protein: foodData.protein || foodData.nutrition?.protein || 0,
      fat: foodData.fat || foodData.nutrition?.fat || 0,
      fiber: foodData.fiber || foodData.nutrition?.fiber || 0,
      sugar: foodData.sugar || foodData.nutrition?.sugar || 0,
      ayurveda: foodData.ayurveda,
      timestamp: new Date().toLocaleTimeString(),
      source: foodData.source || "AI Analysis",
    };

    setDailyFoods((prev) => [...prev, newFood]);
  };

  const removeFood = (id: number) => {
    setDailyFoods((prev) => prev.filter((food) => food.id !== id));
  };

  const clearAllFoods = () => {
    if (confirm("Are you sure you want to clear all foods?")) {
      setDailyFoods([]);
    }
  };

  // Calculate daily totals
  const dailyTotals = dailyFoods.reduce(
    (acc, food) => {
      acc.calories += food.calories;
      acc.carbs += food.carbs;
      acc.protein += food.protein;
      acc.fat += food.fat;
      return acc;
    },
    { calories: 0, carbs: 0, protein: 0, fat: 0 }
  );

  const calorieProgress = Math.min(
    (dailyTotals.calories / dailyCalorieGoal) * 100,
    100
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Aahaara360 Food Scanner
        </h1>
        <p className="text-lg text-muted-foreground">
          Track your nutrition with smart food recognition and Ayurvedic
          insights
        </p>

        {/* API Key Configuration */}
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowApiKeyConfig(!showApiKeyConfig)}
          >
            <Brain className="w-4 h-4 mr-2" />
            {showApiKeyConfig ? "Hide" : "Configure"} AI Settings
          </Button>

          {showApiKeyConfig && (
            <div className="mt-4 p-4 bg-muted rounded-lg max-w-md mx-auto">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                Gemini API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={geminiApiKey}
                onChange={(e) => {
                  setGeminiApiKey(e.target.value);
                  localStorage.setItem("geminiApiKey", e.target.value);
                }}
                placeholder="Enter your Gemini API key"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Get your free API key from{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Live Camera Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Live Camera Detection
            </CardTitle>
            <CardDescription>
              Real-time AI-powered food recognition using your camera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {/* Always render video element but hide it when not active */}
              <div
                className="relative mx-auto"
                style={{
                  maxWidth: "400px",
                  display: isCameraActive ? "block" : "none",
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  controls={false}
                  className="w-full rounded-lg border-2 border-primary"
                  style={{
                    height: "300px",
                    objectFit: "cover",
                    backgroundColor: "#000",
                    display: "block",
                    minHeight: "300px",
                    width: "100%",
                    transform: "scaleX(-1)", // Mirror the video like a selfie camera
                  }}
                  onLoadStart={() => console.log("Video load started")}
                  onLoadedData={() => {
                    console.log("Video data loaded");
                    // Force play when data is loaded
                    if (videoRef.current) {
                      videoRef.current.play().catch(console.error);
                    }
                  }}
                  onCanPlay={() => {
                    console.log("Video can play");
                    // Force play when video can play
                    if (videoRef.current && videoRef.current.paused) {
                      videoRef.current.play().catch(console.error);
                    }
                  }}
                  onPlay={() => console.log("Video is playing")}
                  onPause={() => console.log("Video is paused")}
                  onError={(e) => {
                    console.error("Video element error:", e);
                    setIsCameraLoading(false);
                  }}
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <div className="text-white text-center">
                      <div className="animate-spin w-8 h-8 mx-auto mb-2 border-4 border-white border-t-transparent rounded-full"></div>
                      <p>Analyzing...</p>
                    </div>
                  </div>
                )}
                {!isAnalyzing && isCameraActive && (
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Camera Active - Show food item here
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {videoRef.current?.paused ? "Paused" : "Playing"}
                </div>
              </div>

              {/* Show UI based on camera state */}
              {!isCameraActive && !isCameraLoading && (
                <div className="text-center py-8">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Start your camera to begin food detection
                  </p>
                  <Button
                    onClick={startCamera}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Start Camera
                  </Button>
                </div>
              )}

              {isCameraLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full"></div>
                  <p className="text-muted-foreground">Starting camera...</p>
                </div>
              )}

              {/* Camera controls - always show when camera is active */}
              {isCameraActive && (
                <div className="flex gap-2 justify-center mt-4">
                  <Button
                    onClick={capturePhoto}
                    className="flex items-center gap-2"
                    disabled={isAnalyzing}
                  >
                    <Camera className="w-4 h-4" />
                    {isAnalyzing ? "Analyzing..." : "📸 Capture & Analyze"}
                  </Button>
                  <Button
                    onClick={forceVideoDisplay}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Show Camera
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Stop Camera
                  </Button>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Photo Analysis
            </CardTitle>
            <CardDescription>
              Upload a photo for AI food recognition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-3 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Drop your food photo here or click to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Supported formats: JPG, PNG, GIF
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedImage && (
                <div className="mt-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full max-w-md mx-auto rounded-lg mb-4"
                  />
                  <Button
                    onClick={() => analyzeImage(uploadedImage)}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    {isAnalyzing ? "Analyzing..." : "Analyze Food"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {showResults && detectionResults.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🤖 AI Analysis Results</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResults(false)}
              >
                <X className="w-4 h-4" />
                Clear Results
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detectionResults.map((food, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 border-l-4 border-l-primary"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">🍽️ {food.name}</h3>
                    <Badge variant="secondary">
                      {food.confidence}% confident
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Portion: {food.portion_size} {food.unit}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold text-primary">
                        {food.nutrition?.calories || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Calories
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold text-primary">
                        {food.nutrition?.carbs || 0}g
                      </div>
                      <div className="text-xs text-muted-foreground">Carbs</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold text-primary">
                        {food.nutrition?.protein || 0}g
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Protein
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold text-primary">
                        {food.nutrition?.fat || 0}g
                      </div>
                      <div className="text-xs text-muted-foreground">Fat</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold text-primary">
                        {food.nutrition?.fiber || 0}g
                      </div>
                      <div className="text-xs text-muted-foreground">Fiber</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold text-primary">
                        {food.nutrition?.sugar || 0}g
                      </div>
                      <div className="text-xs text-muted-foreground">Sugar</div>
                    </div>
                  </div>

                  {food.ayurveda && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Ayurvedic Properties
                      </h4>

                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-amber-700 mb-2">
                          Dosha Effects:
                        </h5>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className="bg-purple-500 text-white">
                            Vata: {food.ayurveda.doshas?.vata || "moderate"}
                          </Badge>
                          <Badge className="bg-red-500 text-white">
                            Pitta: {food.ayurveda.doshas?.pitta || "moderate"}
                          </Badge>
                          <Badge className="bg-green-500 text-white">
                            Kapha: {food.ayurveda.doshas?.kapha || "moderate"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <h6 className="text-xs font-medium text-amber-600 mb-1">
                            Rasa (Taste)
                          </h6>
                          <div className="flex flex-wrap gap-1">
                            {(food.ayurveda.rasa || []).map(
                              (rasa: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {rasa}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <h6 className="text-xs font-medium text-amber-600 mb-1">
                            Virya (Potency)
                          </h6>
                          <Badge variant="outline" className="text-xs">
                            {food.ayurveda.virya || "N/A"}
                          </Badge>
                        </div>
                        <div>
                          <h6 className="text-xs font-medium text-amber-600 mb-1">
                            Vipaka (Post-digestive)
                          </h6>
                          <Badge variant="outline" className="text-xs">
                            {food.ayurveda.vipaka || "N/A"}
                          </Badge>
                        </div>
                      </div>

                      {food.ayurveda.properties && (
                        <div>
                          <h6 className="text-xs font-medium text-amber-600 mb-1">
                            Health Benefits
                          </h6>
                          <p className="text-sm text-amber-700 italic">
                            {food.ayurveda.properties}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button onClick={() => addFood(food)} className="w-full mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Food Log
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Today's Nutrition Summary</CardTitle>
          <CardDescription>
            Track your daily calorie and nutrient intake
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Calories</span>
                <span>
                  {Math.round(dailyTotals.calories)} / {dailyCalorieGoal}
                </span>
              </div>
              <Progress value={calorieProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {Math.round(dailyTotals.carbs)}g
                </div>
                <div className="text-sm text-muted-foreground">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {Math.round(dailyTotals.protein)}g
                </div>
                <div className="text-sm text-muted-foreground">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {Math.round(dailyTotals.fat)}g
                </div>
                <div className="text-sm text-muted-foreground">Fat</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food List */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Today's Food Log</CardTitle>
              <CardDescription>
                {dailyFoods.length} items logged today
              </CardDescription>
            </div>
            {dailyFoods.length > 0 && (
              <Button variant="destructive" size="sm" onClick={clearAllFoods}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {dailyFoods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No foods added yet. Start by uploading a photo or manually adding
              food!
            </div>
          ) : (
            <div className="space-y-4">
              {dailyFoods.map((food) => (
                <div
                  key={food.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="font-medium text-lg">{food.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {food.quantity} {food.unit} •{" "}
                        {Math.round(food.calories)} cal • C:{" "}
                        {Math.round(food.carbs)}g • P:{" "}
                        {Math.round(food.protein)}g • F: {Math.round(food.fat)}g
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Added: {food.timestamp} • {food.source}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFood(food.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Training Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            AI Training Data
          </CardTitle>
          <CardDescription>Monitor and manage AI learning data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Help improve the AI:</strong> Every analysis is saved
              to help improve food detection accuracy.
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const data = trainingData.map((item) => ({
                    id: item.id,
                    timestamp: item.timestamp,
                    food: item.analysis.foods?.[0]?.name || "Unknown",
                    confidence: item.analysis.foods?.[0]?.confidence || 0,
                  }));
                  console.log("Training Data:", data);
                  alert(
                    `Training data exported to console. ${data.length} items found.`
                  );
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Data
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearTrainingData}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Data
              </Button>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Training Data Count:</strong> {trainingData.length}{" "}
                items
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated:{" "}
                {trainingData.length > 0
                  ? new Date(
                      trainingData[trainingData.length - 1].timestamp
                    ).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedFoodScanner;
