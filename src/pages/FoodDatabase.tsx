import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/api";
import {
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Heart,
  Flame,
  Snowflake,
  Utensils,
  Clock,
  Leaf,
  Zap,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  rasa: string[];
  guna: string[];
  virya: string;
  vata_effect: string;
  pitta_effect: string;
  kapha_effect: string;
  meal_types: string[];
  food_category: string;
  tags: string[];
  is_tridoshic: boolean;
  dosha_balance: string;
  meal_types_display: string;
  tags_display: string;
  rasa_display: string;
  guna_display: string;
  created_at: string;
  updated_at: string;
  created_by_name: string;
}

interface FoodStats {
  total_foods: number;
  dosha_stats: {
    vata_pacifying: number;
    pitta_pacifying: number;
    kapha_pacifying: number;
    tridoshic: number;
  };
  meal_stats: {
    Breakfast: number;
    Brunch: number;
    Lunch: number;
    Snacks: number;
    Dinner: number;
  };
}

const FoodDatabase: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDosha, setSelectedDosha] = useState<string>("all");
  const [selectedMealType, setSelectedMealType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stats, setStats] = useState<FoodStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [newFood, setNewFood] = useState({
    name: "",
    serving_size: "",
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    rasa: "",
    guna: "",
    virya: "Neutral",
    vata_effect: "neutral",
    pitta_effect: "neutral",
    kapha_effect: "neutral",
    meal_types: [] as string[],
    food_category: "",
    tags: "",
  });
  const [addingFood, setAddingFood] = useState(false);
  const { toast } = useToast();

  // Load food items
  const loadFoods = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (searchTerm) params.search = searchTerm;
      if (selectedDosha !== "all") {
        if (selectedDosha === "vata") params.vata_effect = "pacifies";
        if (selectedDosha === "pitta") params.pitta_effect = "pacifies";
        if (selectedDosha === "kapha") params.kapha_effect = "pacifies";
      }
      if (selectedMealType !== "all") {
        params.meal_types = [selectedMealType];
      }
      if (selectedCategory !== "all") {
        params.food_category = selectedCategory;
      }

      console.log("🔍 Loading foods with params:", params);
      const response = await apiClient.getFoodItems(params);
      console.log("🔍 Food API response:", response);
      setFoods(response.results || []);
    } catch (error) {
      console.error("Error loading foods:", error);
      toast({
        title: "Error",
        description: "Failed to load food database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load stats and categories
  const loadStats = async () => {
    try {
      console.log("🔍 Loading stats and categories...");
      const [statsResponse, categoriesResponse] = await Promise.all([
        apiClient.getFoodStats(),
        apiClient.getFoodCategories(),
      ]);
      console.log("🔍 Stats response:", statsResponse);
      console.log("🔍 Categories response:", categoriesResponse);
      setStats(statsResponse);
      setCategories(categoriesResponse.categories || []);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  useEffect(() => {
    console.log("🔍 FoodDatabase component mounted");
    console.log("🔍 Auth token:", localStorage.getItem("auth_token"));
    loadFoods();
    loadStats();
  }, [searchTerm, selectedDosha, selectedMealType, selectedCategory]);

  // Handle adding new food item
  const handleAddFood = async () => {
    if (!newFood.name || !newFood.food_category) {
      toast({
        title: "Validation Error",
        description: "Food name and category are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingFood(true);

      // Prepare the food data for API
      const foodData = {
        name: newFood.name,
        serving_size: newFood.serving_size,
        calories: newFood.calories,
        protein_g: newFood.protein_g,
        carbs_g: newFood.carbs_g,
        fat_g: newFood.fat_g,
        fiber_g: newFood.fiber_g,
        rasa: newFood.rasa
          ? newFood.rasa
              .split(",")
              .map((r) => {
                const trimmed = r.trim();
                // Handle special cases for proper capitalization
                const rasaMap: { [key: string]: string } = {
                  sweet: "Sweet",
                  sour: "Sour",
                  salty: "Salty",
                  pungent: "Pungent",
                  bitter: "Bitter",
                  astringent: "Astringent",
                };
                return (
                  rasaMap[trimmed.toLowerCase()] ||
                  trimmed.charAt(0).toUpperCase() +
                    trimmed.slice(1).toLowerCase()
                );
              })
              .filter(Boolean)
          : [],
        guna: newFood.guna
          ? newFood.guna
              .split(",")
              .map((g) => g.trim())
              .filter(Boolean)
          : [],
        virya: newFood.virya,
        vata_effect: newFood.vata_effect,
        pitta_effect: newFood.pitta_effect,
        kapha_effect: newFood.kapha_effect,
        meal_types: newFood.meal_types,
        food_category: newFood.food_category,
        tags: newFood.tags
          ? newFood.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      console.log("🔍 Adding food with data:", foodData);
      const response = await apiClient.createFoodItem(foodData);
      console.log("🔍 Add food response:", response);

      toast({
        title: "Success",
        description: `${newFood.name} has been added to the database!`,
      });

      // Reset form
      setNewFood({
        name: "",
        serving_size: "",
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        rasa: "",
        guna: "",
        virya: "Neutral",
        vata_effect: "neutral",
        pitta_effect: "neutral",
        kapha_effect: "neutral",
        meal_types: [],
        food_category: "",
        tags: "",
      });

      setShowAddDialog(false);
      loadFoods();
      loadStats();
    } catch (error) {
      console.error("Error adding food:", error);
      toast({
        title: "Error",
        description: "Failed to add food item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingFood(false);
    }
  };

  // Handle CSV import
  const handleImportCSV = async () => {
    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiClient.importCSVFoods(csvFile);

      toast({
        title: "Import Successful",
        description: `Imported ${response.imported_count} food items`,
      });

      setShowImportDialog(false);
      setCsvFile(null);
      loadFoods();
      loadStats();
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import CSV file",
        variant: "destructive",
      });
    }
  };

  // Get dosha effect icon
  const getDoshaEffectIcon = (effect: string) => {
    switch (effect) {
      case "pacifies":
        return <Shield className="w-4 h-4 text-green-500" />;
      case "aggravates":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  // Get virya icon
  const getViryaIcon = (virya: string) => {
    switch (virya) {
      case "Heating":
        return <Flame className="w-4 h-4 text-orange-500" />;
      case "Cooling":
        return <Snowflake className="w-4 h-4 text-blue-500" />;
      default:
        return <Zap className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get meal type icon
  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case "Breakfast":
        return <Utensils className="w-4 h-4 text-yellow-500" />;
      case "Brunch":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "Lunch":
        return <Utensils className="w-4 h-4 text-green-500" />;
      case "Snacks":
        return <Leaf className="w-4 h-4 text-purple-500" />;
      case "Dinner":
        return <Utensils className="w-4 h-4 text-blue-500" />;
      default:
        return <Utensils className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ayurvedic Food Database
          </h1>
          <p className="text-gray-600">
            Discover foods categorized by dosha effects and meal types
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
      <CardContent className="p-6">
                <div className="flex items-center justify-between">
          <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Foods
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total_foods}
                    </p>
            </div>
                  <Utensils className="w-8 h-8 text-blue-500" />
          </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tridoshic Foods
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.dosha_stats.tridoshic}
                    </p>
          </div>
                  <Heart className="w-8 h-8 text-green-500" />
          </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Vata Pacifying
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.dosha_stats.vata_pacifying}
                    </p>
          </div>
                  <Shield className="w-8 h-8 text-purple-500" />
        </div>
      </CardContent>
    </Card>

            <Card>
              <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pitta Pacifying
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.dosha_stats.pitta_pacifying}
                    </p>
            </div>
                  <Flame className="w-8 h-8 text-orange-500" />
            </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

              {/* Dosha Filter */}
              <Select value={selectedDosha} onValueChange={setSelectedDosha}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Dosha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doshas</SelectItem>
                  <SelectItem value="vata">Vata Pacifying</SelectItem>
                  <SelectItem value="pitta">Pitta Pacifying</SelectItem>
                  <SelectItem value="kapha">Kapha Pacifying</SelectItem>
                </SelectContent>
              </Select>

              {/* Meal Type Filter */}
              <Select
                value={selectedMealType}
                onValueChange={setSelectedMealType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Meal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meal Types</SelectItem>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Brunch">Brunch</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Food
                </Button>
              </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Food Item</DialogTitle>
                </DialogHeader>
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
                        <Label htmlFor="name">Food Name *</Label>
        <Input
          id="name"
                          value={newFood.name}
                          onChange={(e) =>
                            setNewFood({ ...newFood, name: e.target.value })
                          }
                          placeholder="e.g., Ghee"
                        />
                      </div>
                      <div>
                        <Label htmlFor="serving_size">Serving Size</Label>
                        <Input
                          id="serving_size"
                          value={newFood.serving_size}
                          onChange={(e) =>
                            setNewFood({
                              ...newFood,
                              serving_size: e.target.value,
                            })
                          }
                          placeholder="e.g., 1 tablespoon"
                        />
                      </div>
      </div>
      
                    {/* Nutritional Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Nutritional Information
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="calories">Calories</Label>
          <Input
            id="calories"
            type="number"
                            value={newFood.calories}
                            onChange={(e) =>
                              setNewFood({
                                ...newFood,
                                calories: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="protein_g">Protein (g)</Label>
                          <Input
                            id="protein_g"
                            type="number"
                            step="0.1"
                            value={newFood.protein_g}
                            onChange={(e) =>
                              setNewFood({
                                ...newFood,
                                protein_g: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0.0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="carbs_g">Carbs (g)</Label>
                          <Input
                            id="carbs_g"
                            type="number"
                            step="0.1"
                            value={newFood.carbs_g}
                            onChange={(e) =>
                              setNewFood({
                                ...newFood,
                                carbs_g: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0.0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fat_g">Fat (g)</Label>
                          <Input
                            id="fat_g"
                            type="number"
                            step="0.1"
                            value={newFood.fat_g}
                            onChange={(e) =>
                              setNewFood({
                                ...newFood,
                                fat_g: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0.0"
          />
        </div>
        <div>
                          <Label htmlFor="fiber_g">Fiber (g)</Label>
          <Input
                            id="fiber_g"
            type="number"
                            step="0.1"
                            value={newFood.fiber_g}
                            onChange={(e) =>
                              setNewFood({
                                ...newFood,
                                fiber_g: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ayurvedic Properties */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Ayurvedic Properties
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rasa">Rasa (Tastes)</Label>
                          <Input
                            id="rasa"
                            value={newFood.rasa}
                            onChange={(e) =>
                              setNewFood({ ...newFood, rasa: e.target.value })
                            }
                            placeholder="e.g., Sweet, Sour (valid: Sweet, Sour, Salty, Pungent, Bitter, Astringent)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="guna">Guna (Qualities)</Label>
                          <Input
                            id="guna"
                            value={newFood.guna}
                            onChange={(e) =>
                              setNewFood({ ...newFood, guna: e.target.value })
                            }
                            placeholder="e.g., Heavy, Oily (comma separated)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="virya">Virya (Potency)</Label>
                          <Select
                            value={newFood.virya}
                            onValueChange={(value) =>
                              setNewFood({ ...newFood, virya: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select potency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Heating">Heating</SelectItem>
                              <SelectItem value="Cooling">Cooling</SelectItem>
                              <SelectItem value="Neutral">Neutral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="food_category">Food Category *</Label>
                          <Input
                            id="food_category"
                            value={newFood.food_category}
                            onChange={(e) =>
                              setNewFood({
                                ...newFood,
                                food_category: e.target.value,
                              })
                            }
                            placeholder="e.g., Dairy, Grains, Vegetables"
                          />
                        </div>
        </div>
      </div>
      
                    {/* Dosha Effects */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Dosha Effects
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
                          <Label htmlFor="vata_effect">Vata Effect</Label>
                          <Select
                            value={newFood.vata_effect}
                            onValueChange={(value) =>
                              setNewFood({ ...newFood, vata_effect: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pacifies">Pacifies</SelectItem>
                              <SelectItem value="aggravates">
                                Aggravates
                              </SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                            </SelectContent>
                          </Select>
        </div>
        <div>
                          <Label htmlFor="pitta_effect">Pitta Effect</Label>
                          <Select
                            value={newFood.pitta_effect}
                            onValueChange={(value) =>
                              setNewFood({ ...newFood, pitta_effect: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pacifies">Pacifies</SelectItem>
                              <SelectItem value="aggravates">
                                Aggravates
                              </SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                            </SelectContent>
                          </Select>
        </div>
        <div>
                          <Label htmlFor="kapha_effect">Kapha Effect</Label>
                          <Select
                            value={newFood.kapha_effect}
                            onValueChange={(value) =>
                              setNewFood({ ...newFood, kapha_effect: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pacifies">Pacifies</SelectItem>
                              <SelectItem value="aggravates">
                                Aggravates
                              </SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Meal Types */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Meal Types</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[
                          "Breakfast",
                          "Brunch",
                          "Lunch",
                          "Snacks",
                          "Dinner",
                        ].map((mealType) => (
                          <div
                            key={mealType}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={mealType}
                              checked={newFood.meal_types.includes(mealType)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewFood({
                                    ...newFood,
                                    meal_types: [
                                      ...newFood.meal_types,
                                      mealType,
                                    ],
                                  });
                                } else {
                                  setNewFood({
                                    ...newFood,
                                    meal_types: newFood.meal_types.filter(
                                      (mt) => mt !== mealType
                                    ),
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={mealType} className="text-sm">
                              {mealType}
                            </Label>
                          </div>
                        ))}
        </div>
      </div>
      
                    {/* Tags */}
      <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={newFood.tags}
                        onChange={(e) =>
                          setNewFood({ ...newFood, tags: e.target.value })
                        }
                        placeholder="e.g., Vegan, Gluten-free, Spicy (comma separated)"
        />
      </div>
      
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddFood} disabled={addingFood}>
                        {addingFood ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Food
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={showImportDialog}
                onOpenChange={setShowImportDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Food Items from CSV</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csv-file">Select CSV File</Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={(e) =>
                          setCsvFile(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                    <Button onClick={handleImportCSV} disabled={!csvFile}>
                      Import Foods
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Food Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => (
              <Card key={food.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">
                      {food.name}
                    </CardTitle>
                    {food.is_tridoshic && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        Tridoshic
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{food.serving_size}</p>
                </CardHeader>
                <CardContent>
                  {/* Nutritional Info */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-blue-800">
                        {food.calories} cal
                      </p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-sm font-medium text-green-800">
                        {food.protein_g}g protein
                      </p>
                    </div>
                  </div>

                  {/* Dosha Effects */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Vata:</span>
                      <div className="flex items-center gap-1">
                        {getDoshaEffectIcon(food.vata_effect)}
                        <span className="text-xs capitalize">
                          {food.vata_effect}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pitta:</span>
                      <div className="flex items-center gap-1">
                        {getDoshaEffectIcon(food.pitta_effect)}
                        <span className="text-xs capitalize">
                          {food.pitta_effect}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Kapha:</span>
                      <div className="flex items-center gap-1">
                        {getDoshaEffectIcon(food.kapha_effect)}
                        <span className="text-xs capitalize">
                          {food.kapha_effect}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Virya */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Virya:</span>
                    <div className="flex items-center gap-1">
                      {getViryaIcon(food.virya)}
                      <span className="text-xs">{food.virya}</span>
                    </div>
                  </div>

                  {/* Meal Types */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Meal Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {food.meal_types.map((mealType, index) => (
                        <Badge
                          key={`${food.id}-${mealType}-${index}`}
                          variant="outline"
                          className="text-xs"
                        >
                          {getMealTypeIcon(mealType)}
                          <span className="ml-1">{mealType}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {food.tags.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {food.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={`${food.id}-tag-${tag}-${index}`}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {food.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{food.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Plus className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && foods.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No foods found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or add some food items to the
                database.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Food
      </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FoodDatabase;
