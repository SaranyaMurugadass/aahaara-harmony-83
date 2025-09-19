"""
Diet chart and nutrition-related models
"""
from django.db import models
from django.conf import settings
from patients.models import Patient, Consultation

class FoodItem(models.Model):
    """Food items database"""
    CATEGORY_CHOICES = [
        ('grains', 'Grains'),
        ('vegetables', 'Vegetables'),
        ('fruits', 'Fruits'),
        ('dairy', 'Dairy'),
        ('nuts_seeds', 'Nuts & Seeds'),
        ('spices', 'Spices'),
        ('beverages', 'Beverages'),
        ('sweets', 'Sweets'),
        ('oils', 'Oils'),
    ]
    
    DOSHA_EFFECT_CHOICES = [
        ('vata_+', 'Increases Vata'),
        ('vata_-', 'Decreases Vata'),
        ('pitta_+', 'Increases Pitta'),
        ('pitta_-', 'Decreases Pitta'),
        ('kapha_+', 'Increases Kapha'),
        ('kapha_-', 'Decreases Kapha'),
        ('neutral', 'Neutral'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    nutritional_info = models.JSONField(default=dict, blank=True)
    vata_effect = models.CharField(max_length=20, choices=DOSHA_EFFECT_CHOICES, default='neutral')
    pitta_effect = models.CharField(max_length=20, choices=DOSHA_EFFECT_CHOICES, default='neutral')
    kapha_effect = models.CharField(max_length=20, choices=DOSHA_EFFECT_CHOICES, default='neutral')
    is_ayurvedic = models.BooleanField(default=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class DietChart(models.Model):
    """Diet chart for patients"""
    CHART_TYPE_CHOICES = [
        ('therapeutic', 'Therapeutic'),
        ('maintenance', 'Maintenance'),
        ('detox', 'Detox'),
        ('weight_loss', 'Weight Loss'),
        ('weight_gain', 'Weight Gain'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='diet_charts')
    chart_name = models.CharField(max_length=255)
    chart_type = models.CharField(max_length=20, choices=CHART_TYPE_CHOICES)
    description = models.TextField(blank=True)
    duration_days = models.PositiveIntegerField(default=30)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('authentication.DoctorProfile', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.chart_name}"

class MealPlan(models.Model):
    """Meal plans within diet charts"""
    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('mid_morning', 'Mid-Morning'),
        ('lunch', 'Lunch'),
        ('evening', 'Evening'),
        ('dinner', 'Dinner'),
        ('bedtime', 'Bedtime'),
    ]
    
    diet_chart = models.ForeignKey(DietChart, on_delete=models.CASCADE, related_name='meal_plans')
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES)
    meal_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    timing = models.TimeField()
    preparation_notes = models.TextField(blank=True)
    day_of_week = models.PositiveIntegerField(choices=[(i, f'Day {i}') for i in range(1, 8)], default=1)
    
    def __str__(self):
        return f"{self.diet_chart.chart_name} - {self.meal_name}"

class MealItem(models.Model):
    """Food items in meal plans"""
    meal_plan = models.ForeignKey(MealPlan, on_delete=models.CASCADE, related_name='meal_items')
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity = models.CharField(max_length=100)  # e.g., "1 cup", "2 pieces"
    unit = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.meal_plan.meal_name} - {self.food_item.name}"

class DietRecommendation(models.Model):
    """General diet recommendations based on dosha"""
    dosha_type = models.CharField(max_length=20, choices=[
        ('vata', 'Vata'),
        ('pitta', 'Pitta'),
        ('kapha', 'Kapha'),
        ('vata-pitta', 'Vata-Pitta'),
        ('vata-kapha', 'Vata-Kapha'),
        ('pitta-kapha', 'Pitta-Kapha'),
        ('tridosha', 'Tridosha'),
    ])
    recommendation_type = models.CharField(max_length=50)  # e.g., "favorable_foods", "avoid_foods"
    title = models.CharField(max_length=255)
    description = models.TextField()
    food_items = models.ManyToManyField(FoodItem, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.dosha_type} - {self.title}"