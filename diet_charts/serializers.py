"""
Serializers for diet chart management
"""
from rest_framework import serializers
from .models import FoodItem, DietChart, MealPlan, MealItem, DietRecommendation

class FoodItemSerializer(serializers.ModelSerializer):
    """Serializer for food items"""
    category_display = serializers.ReadOnlyField(source='get_category_display')
    season_display = serializers.ReadOnlyField(source='get_season_display')
    
    class Meta:
        model = FoodItem
        fields = [
            'id', 'name', 'scientific_name', 'category', 'category_display',
            'description', 'nutritional_info', 'vata_effect', 'pitta_effect',
            'kapha_effect', 'is_ayurvedic', 'is_organic', 'season', 'season_display',
            'preparation_methods', 'contraindications', 'benefits', 'image_url',
            'calories_per_100g', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class MealItemSerializer(serializers.ModelSerializer):
    """Serializer for meal items"""
    food_item_name = serializers.CharField(source='food_item.name', read_only=True)
    food_item_category = serializers.CharField(source='food_item.category', read_only=True)
    total_calories = serializers.ReadOnlyField()
    
    class Meta:
        model = MealItem
        fields = [
            'id', 'food_item', 'food_item_name', 'food_item_category', 'quantity',
            'unit', 'quantity_numeric', 'notes', 'is_optional', 'order', 'total_calories'
        ]

class MealPlanSerializer(serializers.ModelSerializer):
    """Serializer for meal plans"""
    meal_type_display = serializers.ReadOnlyField(source='get_meal_type_display')
    difficulty_display = serializers.ReadOnlyField(source='get_difficulty_display')
    meal_items = MealItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = MealPlan
        fields = [
            'id', 'meal_type', 'meal_type_display', 'meal_name', 'description',
            'timing', 'preparation_notes', 'cooking_time', 'difficulty_level',
            'difficulty_display', 'day_of_week', 'calories', 'is_optional',
            'meal_items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class MealPlanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating meal plans"""
    meal_items = MealItemSerializer(many=True, required=False)
    
    class Meta:
        model = MealPlan
        fields = [
            'meal_type', 'meal_name', 'description', 'timing', 'preparation_notes',
            'cooking_time', 'difficulty_level', 'day_of_week', 'calories',
            'is_optional', 'meal_items'
        ]
    
    def create(self, validated_data):
        meal_items_data = validated_data.pop('meal_items', [])
        meal_plan = MealPlan.objects.create(**validated_data)
        
        for item_data in meal_items_data:
            MealItem.objects.create(meal_plan=meal_plan, **item_data)
        
        return meal_plan

class DietChartSerializer(serializers.ModelSerializer):
    """Serializer for diet charts"""
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.display_name', read_only=True)
    chart_type_display = serializers.ReadOnlyField(source='get_chart_type_display')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    days_remaining = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()
    meal_plans = MealPlanSerializer(many=True, read_only=True)
    
    class Meta:
        model = DietChart
        fields = [
            'id', 'patient', 'patient_name', 'chart_name', 'chart_type', 'chart_type_display',
            'status', 'status_display', 'description', 'duration_days', 'start_date',
            'end_date', 'days_remaining', 'progress_percentage', 'is_active',
            'created_by', 'created_by_name', 'based_on_prakriti', 'special_instructions',
            'contraindications', 'expected_outcomes', 'progress_notes', 'meal_plans',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class DietChartCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating diet charts"""
    class Meta:
        model = DietChart
        fields = [
            'patient', 'chart_name', 'chart_type', 'description', 'duration_days',
            'start_date', 'end_date', 'based_on_prakriti', 'special_instructions',
            'contraindications', 'expected_outcomes'
        ]

class DietRecommendationSerializer(serializers.ModelSerializer):
    """Serializer for diet recommendations"""
    dosha_display = serializers.ReadOnlyField(source='get_dosha_display')
    recommendation_type_display = serializers.ReadOnlyField(source='get_recommendation_type_display')
    food_items = FoodItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = DietRecommendation
        fields = [
            'id', 'dosha_type', 'dosha_display', 'recommendation_type',
            'recommendation_type_display', 'title', 'description', 'detailed_guidelines',
            'food_items', 'priority', 'is_active', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']