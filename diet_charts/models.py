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
        ('legumes', 'Legumes'),
        ('herbs', 'Herbs'),
        ('meat', 'Meat & Fish'),
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
    
    SEASON_CHOICES = [
        ('spring', 'Spring'),
        ('summer', 'Summer'),
        ('monsoon', 'Monsoon'),
        ('autumn', 'Autumn'),
        ('winter', 'Winter'),
        ('all_season', 'All Season'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    scientific_name = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    nutritional_info = models.JSONField(default=dict, blank=True)
    vata_effect = models.CharField(max_length=20, choices=DOSHA_EFFECT_CHOICES, default='neutral')
    pitta_effect = models.CharField(max_length=20, choices=DOSHA_EFFECT_CHOICES, default='neutral')
    kapha_effect = models.CharField(max_length=20, choices=DOSHA_EFFECT_CHOICES, default='neutral')
    is_ayurvedic = models.BooleanField(default=True)
    is_organic = models.BooleanField(default=False)
    season = models.CharField(max_length=20, choices=SEASON_CHOICES, default='all_season')
    preparation_methods = models.JSONField(default=list, blank=True)
    contraindications = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    calories_per_100g = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Food Item"
        verbose_name_plural = "Food Items"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def get_category_display(self):
        return dict(self.CATEGORY_CHOICES).get(self.category, self.category)
    
    def get_season_display(self):
        return dict(self.SEASON_CHOICES).get(self.season, self.season)

class DietChart(models.Model):
    """Diet chart for patients"""
    CHART_TYPE_CHOICES = [
        ('therapeutic', 'Therapeutic'),
        ('maintenance', 'Maintenance'),
        ('detox', 'Detox'),
        ('weight_loss', 'Weight Loss'),
        ('weight_gain', 'Weight Gain'),
        ('pregnancy', 'Pregnancy'),
        ('diabetic', 'Diabetic'),
        ('hypertension', 'Hypertension'),
        ('digestive', 'Digestive Health'),
        ('immunity', 'Immunity Boosting'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='diet_charts')
    chart_name = models.CharField(max_length=255)
    chart_type = models.CharField(max_length=20, choices=CHART_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    description = models.TextField(blank=True)
    duration_days = models.PositiveIntegerField(default=30)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('authentication.DoctorProfile', on_delete=models.CASCADE, related_name='created_diet_charts')
    based_on_prakriti = models.ForeignKey('patients.PrakritiAnalysis', on_delete=models.SET_NULL, null=True, blank=True)
    based_on_diseases = models.ManyToManyField('patients.DiseaseAnalysis', blank=True)
    special_instructions = models.TextField(blank=True)
    contraindications = models.TextField(blank=True)
    expected_outcomes = models.TextField(blank=True)
    progress_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Diet Chart"
        verbose_name_plural = "Diet Charts"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.patient.user.full_name} - {self.chart_name}"
    
    @property
    def days_remaining(self):
        if self.end_date:
            from django.utils import timezone
            today = timezone.now().date()
            remaining = (self.end_date - today).days
            return max(0, remaining)
        return 0
    
    @property
    def progress_percentage(self):
        if self.duration_days > 0:
            from django.utils import timezone
            today = timezone.now().date()
            if self.start_date <= today <= self.end_date:
                elapsed = (today - self.start_date).days
                return min(100, (elapsed / self.duration_days) * 100)
            elif today > self.end_date:
                return 100
        return 0
    
    def get_chart_type_display(self):
        return dict(self.CHART_TYPE_CHOICES).get(self.chart_type, self.chart_type)
    
    def get_status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, self.status)

class MealPlan(models.Model):
    """Meal plans within diet charts"""
    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('mid_morning', 'Mid-Morning'),
        ('lunch', 'Lunch'),
        ('evening', 'Evening'),
        ('dinner', 'Dinner'),
        ('bedtime', 'Bedtime'),
        ('snack', 'Snack'),
    ]
    
    diet_chart = models.ForeignKey(DietChart, on_delete=models.CASCADE, related_name='meal_plans')
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES)
    meal_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    timing = models.TimeField()
    preparation_notes = models.TextField(blank=True)
    cooking_time = models.PositiveIntegerField(null=True, blank=True)  # in minutes
    difficulty_level = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='easy')
    day_of_week = models.PositiveIntegerField(choices=[(i, f'Day {i}') for i in range(1, 8)], default=1)
    calories = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_optional = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Meal Plan"
        verbose_name_plural = "Meal Plans"
        ordering = ['day_of_week', 'timing']
    
    def __str__(self):
        return f"{self.diet_chart.chart_name} - {self.meal_name}"
    
    def get_meal_type_display(self):
        return dict(self.MEAL_TYPE_CHOICES).get(self.meal_type, self.meal_type)
    
    def get_difficulty_display(self):
        return dict([
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
        ]).get(self.difficulty_level, self.difficulty_level)

class MealItem(models.Model):
    """Food items in meal plans"""
    meal_plan = models.ForeignKey(MealPlan, on_delete=models.CASCADE, related_name='meal_items')
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity = models.CharField(max_length=100)  # e.g., "1 cup", "2 pieces"
    unit = models.CharField(max_length=50, blank=True)
    quantity_numeric = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    is_optional = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = "Meal Item"
        verbose_name_plural = "Meal Items"
        ordering = ['order', 'food_item__name']
    
    def __str__(self):
        return f"{self.meal_plan.meal_name} - {self.food_item.name}"
    
    @property
    def total_calories(self):
        if self.quantity_numeric and self.food_item.calories_per_100g:
            return (self.quantity_numeric * self.food_item.calories_per_100g) / 100
        return None

class DietRecommendation(models.Model):
    """General diet recommendations based on dosha"""
    DOSHA_CHOICES = [
        ('vata', 'Vata'),
        ('pitta', 'Pitta'),
        ('kapha', 'Kapha'),
        ('vata-pitta', 'Vata-Pitta'),
        ('vata-kapha', 'Vata-Kapha'),
        ('pitta-kapha', 'Pitta-Kapha'),
        ('tridosha', 'Tridosha'),
    ]
    
    RECOMMENDATION_TYPE_CHOICES = [
        ('favorable_foods', 'Favorable Foods'),
        ('avoid_foods', 'Foods to Avoid'),
        ('lifestyle', 'Lifestyle Recommendations'),
        ('timing', 'Meal Timing'),
        ('preparation', 'Food Preparation'),
        ('general', 'General Guidelines'),
    ]
    
    dosha_type = models.CharField(max_length=20, choices=DOSHA_CHOICES)
    recommendation_type = models.CharField(max_length=50, choices=RECOMMENDATION_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    detailed_guidelines = models.TextField(blank=True)
    food_items = models.ManyToManyField(FoodItem, blank=True)
    priority = models.PositiveIntegerField(default=1)  # 1 = highest priority
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('authentication.DoctorProfile', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Diet Recommendation"
        verbose_name_plural = "Diet Recommendations"
        ordering = ['dosha_type', 'priority', 'title']
    
    def __str__(self):
        return f"{self.dosha_type} - {self.title}"
    
    def get_dosha_display(self):
        return dict(self.DOSHA_CHOICES).get(self.dosha_type, self.dosha_type)
    
    def get_recommendation_type_display(self):
        return dict(self.RECOMMENDATION_TYPE_CHOICES).get(self.recommendation_type, self.recommendation_type)