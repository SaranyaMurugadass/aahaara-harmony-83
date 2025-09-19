import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, ArrowLeft, Utensils, Plus, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock food data
const mockFoods = {
  vata: {
    breakfast: [
      {
        id: 1,
        name: "Warm Oatmeal with Ghee",
        calories: 250,
        proteins: 8,
        agni: "Enhances",
        virigi: "Good",
        digestible: "Easy",
        properties: "Warming, Nourishing, Grounding"
      },
      {
        id: 2,
        name: "Almond Milk Porridge",
        calories: 200,
        proteins: 6,
        agni: "Supports",
        virigi: "Good",
        digestible: "Easy",
        properties: "Moistening, Calming"
      },
      // ... more breakfast items
    ],
    lunch: [
      {
        id: 11,
        name: "Kitchari with Vegetables",
        calories: 350,
        proteins: 12,
        agni: "Balances",
        virigi: "Excellent",
        digestible: "Very Easy",
        properties: "Complete protein, Tridoshic"
      },
      // ... more lunch items
    ],
    // ... other meal categories
  },
  pitta: {
    breakfast: [
      {
        id: 21,
        name: "Coconut Rice Flakes",
        calories: 180,
        proteins: 4,
        agni: "Cools",
        virigi: "Good",
        digestible: "Easy",
        properties: "Cooling, Light, Sweet"
      },
      // ... more items
    ],
    // ... other categories
  },
  kapha: {
    breakfast: [
      {
        id: 41,
        name: "Spiced Quinoa Bowl",
        calories: 220,
        proteins: 8,
        agni: "Stimulates",
        virigi: "Good",
        digestible: "Moderate",
        properties: "Warming, Light, Energizing"
      },
      // ... more items
    ],
    // ... other categories
  }
};

const FoodDatabase = () => {
  const navigate = useNavigate();
  const [selectedDosha, setSelectedDosha] = useState("vata");
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [searchTerm, setSearchTerm] = useState("");
  const [savedItems, setSavedItems] = useState([]);
  const [foodItems, setFoodItems] = useState(mockFoods);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const currentFoods = foodItems[selectedDosha]?.[selectedMeal] || [];
  const filteredFoods = currentFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveFood = (food) => {
    if (!savedItems.find(item => item.id === food.id)) {
      setSavedItems([...savedItems, { ...food, dosha: selectedDosha, mealType: selectedMeal }]);
    }
  };

  const handleAddFood = (newFood) => {
    const newId = Math.max(...Object.values(foodItems).flatMap(dosha => 
      Object.values(dosha).flatMap(meals => meals.map(food => food.id))
    )) + 1;
    
    const foodWithId = { ...newFood, id: newId };
    
    setFoodItems(prev => ({
      ...prev,
      [selectedDosha]: {
        ...prev[selectedDosha],
        [selectedMeal]: [...(prev[selectedDosha]?.[selectedMeal] || []), foodWithId]
      }
    }));
    
    setShowAddDialog(false);
  };

  const renderFoodCard = (food) => (
    <Card key={food.id} className="hover:shadow-warm transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{food.name}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">{food.calories} cal</Badge>
              <Badge variant="outline">{food.proteins}g protein</Badge>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleSaveFood(food)}
            disabled={savedItems.find(item => item.id === food.id)}
          >
            <Plus className="w-4 h-4 mr-1" />
            {savedItems.find(item => item.id === food.id) ? "Saved" : "Save"}
          </Button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Agni Effect:</span>
            <Badge variant={food.agni === "Enhances" ? "default" : "secondary"}>
              {food.agni}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Virigi:</span>
            <Badge variant={food.virigi === "Excellent" ? "default" : "secondary"}>
              {food.virigi}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Digestibility:</span>
            <Badge variant={food.digestible === "Very Easy" || food.digestible === "Easy" ? "default" : "secondary"}>
              {food.digestible}
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-muted-foreground text-xs">Properties:</span>
            <p className="text-sm mt-1">{food.properties}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
                Ayurvedic Food Database
              </h1>
              <p className="text-sm text-muted-foreground">Browse foods by dosha and meal categories</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <Save className="w-4 h-4 mr-1" />
                {savedItems.length} items saved
              </Badge>
              <Button variant="outline">
                View Saved Items
              </Button>
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
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Dosha Selection */}
        <Tabs value={selectedDosha} onValueChange={setSelectedDosha} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="vata" className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
              Vata
            </TabsTrigger>
            <TabsTrigger value="pitta" className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
              Pitta
            </TabsTrigger>
            <TabsTrigger value="kapha" className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-accent mr-2"></div>
              Kapha
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Meal Type Selection */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {["breakfast", "brunch", "lunch", "snack", "dinner"].map((meal) => (
              <Button
                key={meal}
                variant={selectedMeal === meal ? "default" : "outline"}
                onClick={() => setSelectedMeal(meal)}
                className="capitalize"
              >
                <Utensils className="w-4 h-4 mr-2" />
                {meal}
              </Button>
            ))}
          </div>
        </div>

        {/* Food Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map(renderFoodCard)}
          
          {filteredFoods.length === 0 && (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <CardContent>
                  <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No foods found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search term" : `No ${selectedMeal} items available for ${selectedDosha} dosha`}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Add more foods placeholder */}
        <Card className="mt-8 border-dashed">
          <CardContent className="text-center py-8">
            <Plus className="w-8 h-8 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Add More Foods</h3>
            <p className="text-muted-foreground mb-4">
              Expand your database with more {selectedDosha} {selectedMeal} options
            </p>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Add New Food Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New {selectedDosha.charAt(0).toUpperCase() + selectedDosha.slice(1)} {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} Item</DialogTitle>
                </DialogHeader>
                <AddFoodForm onSubmit={handleAddFood} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// Add Food Form Component
const AddFoodForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    proteins: "",
    agni: "Enhances",
    virigi: "Good",
    digestible: "Easy",
    properties: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      calories: parseInt(formData.calories),
      proteins: parseInt(formData.proteins)
    });
    setFormData({
      name: "",
      calories: "",
      proteins: "",
      agni: "Enhances",
      virigi: "Good",
      digestible: "Easy",
      properties: ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Food Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter food name"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="calories">Calories</Label>
          <Input
            id="calories"
            type="number"
            value={formData.calories}
            onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
            placeholder="250"
            required
          />
        </div>
        <div>
          <Label htmlFor="proteins">Proteins (g)</Label>
          <Input
            id="proteins"
            type="number"
            value={formData.proteins}
            onChange={(e) => setFormData(prev => ({ ...prev, proteins: e.target.value }))}
            placeholder="8"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label htmlFor="agni">Agni Effect</Label>
          <select 
            id="agni"
            value={formData.agni}
            onChange={(e) => setFormData(prev => ({ ...prev, agni: e.target.value }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="Enhances">Enhances</option>
            <option value="Supports">Supports</option>
            <option value="Balances">Balances</option>
            <option value="Cools">Cools</option>
            <option value="Stimulates">Stimulates</option>
          </select>
        </div>
        <div>
          <Label htmlFor="virigi">Virigi</Label>
          <select 
            id="virigi"
            value={formData.virigi}
            onChange={(e) => setFormData(prev => ({ ...prev, virigi: e.target.value }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>
        <div>
          <Label htmlFor="digestible">Digestibility</Label>
          <select 
            id="digestible"
            value={formData.digestible}
            onChange={(e) => setFormData(prev => ({ ...prev, digestible: e.target.value }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="Very Easy">Very Easy</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Difficult">Difficult</option>
          </select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="properties">Properties</Label>
        <Textarea
          id="properties"
          value={formData.properties}
          onChange={(e) => setFormData(prev => ({ ...prev, properties: e.target.value }))}
          placeholder="Warming, Nourishing, Grounding"
          rows={2}
          required
        />
      </div>
      
      <Button type="submit" className="w-full">
        Add Food Item
      </Button>
    </form>
  );
};

export default FoodDatabase;
