import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField
from authentication.models import User, UnifiedPatient


class DietChart(models.Model):
    """
    Represents a generated diet chart for a patient.
    Maps to the 'diet_charts' table in Supabase.
    """
    
    CHART_TYPE_CHOICES = [
        ('7_day', '7 Day'),
        ('14_day', '14 Day'),
        ('30_day', '30 Day'),
        ('custom', 'Custom'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(UnifiedPatient, on_delete=models.CASCADE, related_name='diet_charts')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_diet_charts')
    
    # Chart Details
    chart_name = models.CharField(max_length=255)
    chart_type = models.CharField(max_length=20, choices=CHART_TYPE_CHOICES, default='7_day')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Dates
    start_date = models.DateField()
    end_date = models.DateField()
    total_days = models.IntegerField(default=7)
    
    # Patient Analysis Data (snapshot at time of creation)
    prakriti_analysis = models.JSONField(null=True, blank=True, help_text="Snapshot of prakriti analysis")
    disease_analysis = models.JSONField(null=True, blank=True, help_text="Snapshot of disease analysis")
    patient_preferences = models.JSONField(null=True, blank=True, help_text="Dietary preferences, allergies, etc.")
    
    # Chart Configuration
    target_calories = models.IntegerField(null=True, blank=True)
    meal_distribution = models.JSONField(null=True, blank=True, help_text="Percentage distribution of calories across meals")
    dosha_focus = ArrayField(models.CharField(max_length=50), blank=True, default=list, help_text="Which doshas to focus on")
    food_restrictions = ArrayField(models.CharField(max_length=50), blank=True, default=list, help_text="Dietary restrictions")
    
    # Chart Content
    daily_meals = models.JSONField(default=dict, help_text="The actual meal plan for each day")
    
    # Metadata
    notes = models.TextField(blank=True, null=True)
    is_ai_generated = models.BooleanField(default=True)
    generation_parameters = models.JSONField(null=True, blank=True, help_text="Parameters used for AI generation")
    version = models.IntegerField(default=1)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'diet_charts'
        verbose_name = "Diet Chart"
        verbose_name_plural = "Diet Charts"
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=models.Q(total_days__gt=0),
                name='check_positive_days'
            ),
            models.CheckConstraint(
                check=models.Q(target_calories__isnull=True) | models.Q(target_calories__gt=0),
                name='check_positive_calories'
            ),
            models.CheckConstraint(
                check=models.Q(start_date__lte=models.F('end_date')),
                name='check_date_order'
            ),
        ]
    
    def __str__(self):
        return f"{self.chart_name} - {self.patient.user_name} ({self.chart_type})"
    
    @property
    def patient_name(self):
        """Get the patient's name for easy access."""
        return self.patient.user_name
    
    @property
    def created_by_name(self):
        """Get the creator's name for easy access."""
        return self.created_by.user_name
    
    def get_total_calories(self):
        """Calculate total calories for the entire chart."""
        if not self.daily_meals:
            return 0
        
        total = 0
        for day_data in self.daily_meals.values():
            if isinstance(day_data, dict):
                for meal_data in day_data.values():
                    if isinstance(meal_data, dict) and 'calories' in meal_data:
                        total += meal_data.get('calories', 0)
        return total
    
    def get_meal_count(self):
        """Get the total number of meals in the chart."""
        if not self.daily_meals:
            return 0
        
        count = 0
        for day_data in self.daily_meals.values():
            if isinstance(day_data, dict):
                count += len(day_data)
        return count
    
    def is_active(self):
        """Check if the chart is currently active."""
        return self.status == 'active'
    
    def can_be_modified(self):
        """Check if the chart can be modified."""
        return self.status in ['draft', 'active']