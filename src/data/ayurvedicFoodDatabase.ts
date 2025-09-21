// Comprehensive Ayurvedic Food Database
export interface AyurvedicProperties {
  doshas: {
    vata: "good" | "moderate" | "avoid";
    pitta: "good" | "moderate" | "avoid";
    kapha: "good" | "moderate" | "avoid";
  };
  rasa: string[]; // taste
  virya: "ushna" | "sheeta"; // potency: heating or cooling
  vipaka: "madhura" | "amla" | "katu"; // post-digestive effect
  guna: string[]; // qualities
  properties: string; // health benefits
}

export interface FoodData {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  sugar: number;
  ayurveda: AyurvedicProperties;
}

export const ayurvedicFoodDatabase: Record<string, FoodData> = {
  // Fruits
  apple: {
    calories: 52,
    carbs: 14,
    protein: 0.3,
    fat: 0.2,
    fiber: 2.4,
    sugar: 10.4,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "moderate" },
      rasa: ["madhura", "kashaya"], // sweet, astringent
      virya: "sheeta", // cooling
      vipaka: "madhura", // sweet post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Digestive, cooling, good for heart",
    },
  },
  banana: {
    calories: 89,
    carbs: 23,
    protein: 1.1,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12.2,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "avoid" },
      rasa: ["madhura"], // sweet
      virya: "sheeta", // cooling
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Energy giving, good for weakness, avoid in cold/cough",
    },
  },
  orange: {
    calories: 47,
    carbs: 12,
    protein: 0.9,
    fat: 0.1,
    fiber: 2.4,
    sugar: 9.4,
    ayurveda: {
      doshas: { vata: "moderate", pitta: "avoid", kapha: "good" },
      rasa: ["amla", "madhura"], // sour, sweet
      virya: "ushna", // heating
      vipaka: "amla", // sour post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Vitamin C rich, digestive, may increase pitta",
    },
  },
  strawberry: {
    calories: 32,
    carbs: 8,
    protein: 0.7,
    fat: 0.3,
    fiber: 2,
    sugar: 4.9,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "good" },
      rasa: ["madhura", "amla"], // sweet, sour
      virya: "sheeta", // cooling
      vipaka: "madhura", // sweet post-digestive
      guna: ["laghu", "snigdha"], // light, slightly oily
      properties: "Antioxidant rich, cooling, generally neutral",
    },
  },
  grapes: {
    calories: 62,
    carbs: 16,
    protein: 0.6,
    fat: 0.2,
    fiber: 0.9,
    sugar: 16,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "moderate" },
      rasa: ["madhura", "amla"], // sweet, sour
      virya: "sheeta", // cooling
      vipaka: "madhura", // sweet post-digestive
      guna: ["laghu", "snigdha"], // light, oily
      properties: "Cooling, rejuvenating, good for liver",
    },
  },
  mango: {
    calories: 60,
    carbs: 15,
    protein: 0.8,
    fat: 0.4,
    fiber: 1.6,
    sugar: 13.7,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "avoid" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Nourishing, aphrodisiac, may increase kapha",
    },
  },
  pomegranate: {
    calories: 83,
    carbs: 19,
    protein: 1.7,
    fat: 1.2,
    fiber: 4,
    sugar: 14,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "good" },
      rasa: ["madhura", "kashaya"], // sweet, astringent
      virya: "sheeta", // cooling
      vipaka: "madhura", // sweet post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Blood purifier, heart tonic, tri-doshic",
    },
  },

  // Vegetables
  broccoli: {
    calories: 34,
    carbs: 7,
    protein: 2.8,
    fat: 0.4,
    fiber: 2.6,
    sugar: 1.5,
    ayurveda: {
      doshas: { vata: "moderate", pitta: "good", kapha: "good" },
      rasa: ["tikta", "kashaya"], // bitter, astringent
      virya: "sheeta", // cooling
      vipaka: "katu", // pungent post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Detoxifying, anti-inflammatory, may cause gas in vata",
    },
  },
  carrot: {
    calories: 41,
    carbs: 10,
    protein: 0.9,
    fat: 0.2,
    fiber: 2.8,
    sugar: 4.7,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "moderate" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Good for eyes, grounding, nourishing",
    },
  },
  potato: {
    calories: 77,
    carbs: 17,
    protein: 2,
    fat: 0.1,
    fiber: 2.2,
    sugar: 0.8,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "avoid" },
      rasa: ["madhura"], // sweet
      virya: "sheeta", // cooling
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Grounding, may cause sluggishness in kapha",
    },
  },
  tomato: {
    calories: 18,
    carbs: 3.9,
    protein: 0.9,
    fat: 0.2,
    fiber: 1.2,
    sugar: 2.6,
    ayurveda: {
      doshas: { vata: "moderate", pitta: "avoid", kapha: "good" },
      rasa: ["amla", "madhura"], // sour, sweet
      virya: "ushna", // heating
      vipaka: "amla", // sour post-digestive
      guna: ["laghu", "sara"], // light, flowing
      properties: "May increase pitta and acidity",
    },
  },
  lettuce: {
    calories: 15,
    carbs: 2.9,
    protein: 1.4,
    fat: 0.1,
    fiber: 1.3,
    sugar: 0.8,
    ayurveda: {
      doshas: { vata: "moderate", pitta: "good", kapha: "good" },
      rasa: ["tikta", "kashaya"], // bitter, astringent
      virya: "sheeta", // cooling
      vipaka: "katu", // pungent post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Cooling, cleansing, may increase vata if taken alone",
    },
  },
  spinach: {
    calories: 23,
    carbs: 3.6,
    protein: 2.9,
    fat: 0.4,
    fiber: 2.2,
    sugar: 0.4,
    ayurveda: {
      doshas: { vata: "moderate", pitta: "good", kapha: "good" },
      rasa: ["tikta", "kashaya"], // bitter, astringent
      virya: "sheeta", // cooling
      vipaka: "katu", // pungent post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Iron rich, cooling, good for blood",
    },
  },
  cucumber: {
    calories: 16,
    carbs: 4,
    protein: 0.7,
    fat: 0.1,
    fiber: 0.5,
    sugar: 1.7,
    ayurveda: {
      doshas: { vata: "moderate", pitta: "good", kapha: "good" },
      rasa: ["madhura"], // sweet
      virya: "sheeta", // cooling
      vipaka: "madhura", // sweet post-digestive
      guna: ["laghu", "snigdha"], // light, oily
      properties: "Cooling, hydrating, good for skin",
    },
  },

  // Proteins
  "chicken breast": {
    calories: 165,
    carbs: 0,
    protein: 31,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "good" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Strengthening, building, easy to digest",
    },
  },
  salmon: {
    calories: 208,
    carbs: 0,
    protein: 20,
    fat: 12,
    fiber: 0,
    sugar: 0,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "moderate" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Nourishing, omega-3 rich, may increase pitta",
    },
  },
  beef: {
    calories: 250,
    carbs: 0,
    protein: 26,
    fat: 15,
    fiber: 0,
    sugar: 0,
    ayurveda: {
      doshas: { vata: "good", pitta: "avoid", kapha: "avoid" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Very strengthening, heavy to digest, increases heat",
    },
  },
  egg: {
    calories: 155,
    carbs: 1.1,
    protein: 13,
    fat: 11,
    fiber: 0,
    sugar: 1.1,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "moderate" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Building, nourishing, may be heavy for some",
    },
  },
  tuna: {
    calories: 132,
    carbs: 0,
    protein: 28,
    fat: 1,
    fiber: 0,
    sugar: 0,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "good" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Lean protein, easy to digest, strengthening",
    },
  },
  lentils: {
    calories: 116,
    carbs: 20,
    protein: 9,
    fat: 0.4,
    fiber: 8,
    sugar: 1.8,
    ayurveda: {
      doshas: { vata: "moderate", pitta: "good", kapha: "good" },
      rasa: ["kashaya"], // astringent
      virya: "sheeta", // cooling
      vipaka: "katu", // pungent post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Protein rich, grounding, may cause gas in vata",
    },
  },

  // Grains & Carbs
  rice: {
    calories: 130,
    carbs: 28,
    protein: 2.7,
    fat: 0.3,
    fiber: 0.4,
    sugar: 0.1,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "moderate" },
      rasa: ["madhura"], // sweet
      virya: "sheeta", // cooling
      vipaka: "madhura", // sweet post-digestive
      guna: ["laghu", "snigdha"], // light, oily
      properties: "Easy to digest, nourishing, cooling",
    },
  },
  bread: {
    calories: 265,
    carbs: 49,
    protein: 9,
    fat: 3.2,
    fiber: 2.7,
    sugar: 5.7,
    ayurveda: {
      doshas: { vata: "moderate", pitta: "moderate", kapha: "avoid" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Heavy, may cause congestion in kapha",
    },
  },
  pasta: {
    calories: 131,
    carbs: 25,
    protein: 5,
    fat: 1.1,
    fiber: 1.8,
    sugar: 0.6,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "moderate" },
      rasa: ["madhura"], // sweet
      virya: "sheeta", // cooling
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Grounding, satisfying, moderate for all doshas",
    },
  },
  oats: {
    calories: 389,
    carbs: 66,
    protein: 17,
    fat: 7,
    fiber: 11,
    sugar: 1,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "moderate" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Nourishing, strengthening, good for nervous system",
    },
  },
  quinoa: {
    calories: 120,
    carbs: 22,
    protein: 4.4,
    fat: 1.9,
    fiber: 2.8,
    sugar: 0.9,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "good" },
      rasa: ["madhura", "kashaya"], // sweet, astringent
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Balanced, complete protein, tri-doshic",
    },
  },

  // Dairy
  milk: {
    calories: 42,
    carbs: 5,
    protein: 3.4,
    fat: 1,
    fiber: 0,
    sugar: 5,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "avoid" },
      rasa: ["madhura"], // sweet
      virya: "sheeta", // cooling
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Nourishing, cooling, may increase kapha",
    },
  },
  cheese: {
    calories: 113,
    carbs: 1,
    protein: 7,
    fat: 9,
    fiber: 0,
    sugar: 1,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "avoid" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Building, heavy, may increase kapha",
    },
  },
  yogurt: {
    calories: 59,
    carbs: 3.6,
    protein: 10,
    fat: 0.4,
    fiber: 0,
    sugar: 3.6,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "avoid" },
      rasa: ["amla"], // sour
      virya: "ushna", // heating
      vipaka: "amla", // sour post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Probiotic, may increase kapha and pitta",
    },
  },

  // Nuts & Seeds
  almonds: {
    calories: 579,
    carbs: 22,
    protein: 21,
    fat: 50,
    fiber: 12,
    sugar: 4.4,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "moderate" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Brain tonic, strengthening, good for memory",
    },
  },
  walnuts: {
    calories: 654,
    carbs: 14,
    protein: 15,
    fat: 65,
    fiber: 7,
    sugar: 2.6,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "moderate" },
      rasa: ["madhura", "tikta"], // sweet, bitter
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Brain food, omega-3 rich, may increase pitta",
    },
  },
  peanuts: {
    calories: 567,
    carbs: 16,
    protein: 26,
    fat: 49,
    fiber: 8,
    sugar: 4.7,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "avoid" },
      rasa: ["madhura"], // sweet
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["guru", "snigdha"], // heavy, oily
      properties: "Building, may cause allergies, heavy for kapha",
    },
  },

  // Spices & Herbs
  ginger: {
    calories: 80,
    carbs: 18,
    protein: 1.8,
    fat: 0.8,
    fiber: 2,
    sugar: 1.7,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "good" },
      rasa: ["katu"], // pungent
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Digestive, warming, good for cold and cough",
    },
  },
  turmeric: {
    calories: 354,
    carbs: 65,
    protein: 8,
    fat: 10,
    fiber: 21,
    sugar: 3.2,
    ayurveda: {
      doshas: { vata: "good", pitta: "good", kapha: "good" },
      rasa: ["katu", "tikta"], // pungent, bitter
      virya: "ushna", // heating
      vipaka: "katu", // pungent post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Anti-inflammatory, blood purifier, tri-doshic",
    },
  },
  cinnamon: {
    calories: 247,
    carbs: 81,
    protein: 4,
    fat: 1.2,
    fiber: 54,
    sugar: 2.2,
    ayurveda: {
      doshas: { vata: "good", pitta: "moderate", kapha: "good" },
      rasa: ["madhura", "katu"], // sweet, pungent
      virya: "ushna", // heating
      vipaka: "madhura", // sweet post-digestive
      guna: ["laghu", "ruksha"], // light, dry
      properties: "Warming, digestive, good for diabetes",
    },
  },
};

// Helper function to get food data
export const getFoodData = (foodName: string): FoodData | null => {
  const normalizedName = foodName.toLowerCase().trim();
  return ayurvedicFoodDatabase[normalizedName] || null;
};

// Helper function to calculate nutrition based on quantity
export const calculateNutrition = (
  foodName: string,
  quantity: number
): FoodData => {
  const baseFood = getFoodData(foodName) || {
    calories: 100,
    carbs: 15,
    protein: 5,
    fat: 2,
    fiber: 2,
    sugar: 5,
    ayurveda: {
      doshas: { vata: "moderate", pitta: "moderate", kapha: "moderate" },
      rasa: ["madhura"],
      virya: "sheeta",
      vipaka: "madhura",
      guna: ["laghu"],
      properties: "General food properties",
    },
  };

  const multiplier = quantity / 100;

  return {
    calories: baseFood.calories * multiplier,
    carbs: baseFood.carbs * multiplier,
    protein: baseFood.protein * multiplier,
    fat: baseFood.fat * multiplier,
    fiber: baseFood.fiber * multiplier,
    sugar: baseFood.sugar * multiplier,
    ayurveda: baseFood.ayurveda,
  };
};

// Helper function to get dosha color
export const getDoshaColor = (dosha: string, effect: string): string => {
  const colors = {
    vata: {
      good: "bg-purple-100 text-purple-800",
      moderate: "bg-purple-50 text-purple-600",
      avoid: "bg-red-100 text-red-800",
    },
    pitta: {
      good: "bg-red-100 text-red-800",
      moderate: "bg-red-50 text-red-600",
      avoid: "bg-orange-100 text-orange-800",
    },
    kapha: {
      good: "bg-green-100 text-green-800",
      moderate: "bg-green-50 text-green-600",
      avoid: "bg-yellow-100 text-yellow-800",
    },
  };
  return (
    colors[dosha as keyof typeof colors]?.[
      effect as keyof typeof colors.vata
    ] || "bg-gray-100 text-gray-800"
  );
};
