"""
Serializers for diet chart management
"""
from rest_framework import serializers
from .models import FoodItem, DietChart, MealPlan, MealItem, DietRecommendation
from patients.models import Patient

class FoodItemSerializer(serializers.ModelSerializer):
    """Serializer for food items"""
    
    class Meta:
        model = FoodItem
        fields = '__all__'

class MealItemSerializer(serializers.ModelSerializer):
    """Serializer for meal items"""
    food_item_name = serializers.CharField(source='food_item.name', read_only=True)
    food_item_category = serializers.CharField(source='food_item.category', read_only=True)
    
    class Meta:
        model = MealItem
        fields = '__all__'

class MealPlanSerializer(serializers.ModelSerializer):
    """Serializer for meal plans"""
    meal_items = MealItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = MealPlan
        fields = '__all__'

class DietChartSerializer(serializers.ModelSerializer):
    """Serializer for diet charts"""
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.user.get_full_name', read_only=True)
    meal_plans = MealPlanSerializer(many=True, read_only=True)
    
    class Meta:
        model = DietChart
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class DietChartCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating diet charts"""
    
    class Meta:
        model = DietChart
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class DietRecommendationSerializer(serializers.ModelSerializer):
    """Serializer for diet recommendations"""
    food_items = FoodItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = DietRecommendation
        fields = '__all__'

class MealPlanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating meal plans"""
    meal_items = MealItemSerializer(many=True, required=False)
    
    class Meta:
        model = MealPlan
        fields = '__all__'
    
    def create(self, validated_data):
        meal_items_data = validated_data.pop('meal_items', [])
        meal_plan = MealPlan.objects.create(**validated_data)
        
        for meal_item_data in meal_items_data:
            MealItem.objects.create(meal_plan=meal_plan, **meal_item_data)
        
        return meal_plan
