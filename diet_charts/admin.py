"""
Admin configuration for diet_charts app
"""
from django.contrib import admin
from .models import FoodItem, DietChart, MealPlan, MealItem, DietRecommendation

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    """Food item admin"""
    list_display = ('name', 'category', 'vata_effect', 'pitta_effect', 'kapha_effect', 'is_ayurvedic')
    list_filter = ('category', 'vata_effect', 'pitta_effect', 'kapha_effect', 'is_ayurvedic')
    search_fields = ('name', 'description')

@admin.register(DietChart)
class DietChartAdmin(admin.ModelAdmin):
    """Diet chart admin"""
    list_display = ('chart_name', 'patient', 'chart_type', 'created_by', 'start_date', 'end_date', 'is_active')
    list_filter = ('chart_type', 'is_active', 'start_date', 'created_by')
    search_fields = ('chart_name', 'patient__user__username', 'created_by__user__username')

@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    """Meal plan admin"""
    list_display = ('meal_name', 'diet_chart', 'meal_type', 'timing', 'day_of_week')
    list_filter = ('meal_type', 'day_of_week', 'diet_chart')
    search_fields = ('meal_name', 'diet_chart__chart_name')

@admin.register(MealItem)
class MealItemAdmin(admin.ModelAdmin):
    """Meal item admin"""
    list_display = ('meal_plan', 'food_item', 'quantity', 'unit')
    list_filter = ('food_item__category', 'meal_plan__meal_type')
    search_fields = ('meal_plan__meal_name', 'food_item__name')

@admin.register(DietRecommendation)
class DietRecommendationAdmin(admin.ModelAdmin):
    """Diet recommendation admin"""
    list_display = ('title', 'dosha_type', 'recommendation_type', 'created_at')
    list_filter = ('dosha_type', 'recommendation_type', 'created_at')
    search_fields = ('title', 'description')