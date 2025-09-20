import uuid
from django.db import models
from authentication.models import User


class FoodItem(models.Model):
    """Model for storing Ayurvedic food items with comprehensive properties"""
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    serving_size = models.CharField(max_length=100)
    
    # Nutritional Information
    calories = models.IntegerField()
    protein_g = models.DecimalField(max_digits=5, decimal_places=2)
    carbs_g = models.DecimalField(max_digits=5, decimal_places=2)
    fat_g = models.DecimalField(max_digits=5, decimal_places=2)
    fiber_g = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Ayurvedic Properties
    rasa = models.JSONField(default=list, help_text="Array of tastes (Sweet, Sour, Salty, Pungent, Bitter, Astringent)")
    guna = models.JSONField(default=list, help_text="Array of qualities (Heavy, Light, Hot, Cold, Oily, Dry, etc.)")
    virya = models.CharField(max_length=50, choices=[
        ('Heating', 'Heating'),
        ('Cooling', 'Cooling'),
        ('Neutral', 'Neutral')
    ])
    
    # Dosha Effects
    VATA_EFFECT_CHOICES = [
        ('pacifies', 'Pacifies'),
        ('aggravates', 'Aggravates'),
        ('neutral', 'Neutral')
    ]
    
    PITTA_EFFECT_CHOICES = [
        ('pacifies', 'Pacifies'),
        ('aggravates', 'Aggravates'),
        ('neutral', 'Neutral')
    ]
    
    KAPHA_EFFECT_CHOICES = [
        ('pacifies', 'Pacifies'),
        ('aggravates', 'Aggravates'),
        ('neutral', 'Neutral')
    ]
    
    vata_effect = models.CharField(max_length=20, choices=VATA_EFFECT_CHOICES)
    pitta_effect = models.CharField(max_length=20, choices=PITTA_EFFECT_CHOICES)
    kapha_effect = models.CharField(max_length=20, choices=KAPHA_EFFECT_CHOICES)
    
    # Meal Categories
    MEAL_TYPE_CHOICES = [
        ('Breakfast', 'Breakfast'),
        ('Brunch', 'Brunch'),
        ('Lunch', 'Lunch'),
        ('Snacks', 'Snacks'),
        ('Dinner', 'Dinner')
    ]
    
    meal_types = models.JSONField(default=list, help_text="Array of meal types")
    food_category = models.CharField(max_length=100)
    
    # Tags and Dietary Information
    tags = models.JSONField(default=list, help_text="Array of dietary tags")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_food_items')
    
    class Meta:
        db_table = 'food_items'
        verbose_name = "Food Item"
        verbose_name_plural = "Food Items"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.food_category})"
    
    @property
    def is_tridoshic(self):
        """Check if the food is tridoshic (good for all doshas)"""
        return (
            self.vata_effect == 'pacifies' and
            self.pitta_effect == 'pacifies' and
            self.kapha_effect == 'pacifies'
        )
    
    @property
    def dosha_balance(self):
        """Get the dosha balance as a string"""
        effects = []
        if self.vata_effect == 'pacifies':
            effects.append('Vata+')
        elif self.vata_effect == 'aggravates':
            effects.append('Vata-')
        
        if self.pitta_effect == 'pacifies':
            effects.append('Pitta+')
        elif self.pitta_effect == 'aggravates':
            effects.append('Pitta-')
            
        if self.kapha_effect == 'pacifies':
            effects.append('Kapha+')
        elif self.kapha_effect == 'aggravates':
            effects.append('Kapha-')
            
        return ', '.join(effects) if effects else 'Neutral'
    
    def get_meal_types_display(self):
        """Get formatted meal types for display"""
        return ', '.join(self.meal_types) if self.meal_types else 'Not specified'
    
    def get_tags_display(self):
        """Get formatted tags for display"""
        return ', '.join(self.tags) if self.tags else 'No tags'
    
    def get_rasa_display(self):
        """Get formatted rasa for display"""
        return ', '.join(self.rasa) if self.rasa else 'Not specified'
    
    def get_guna_display(self):
        """Get formatted guna for display"""
        return ', '.join(self.guna) if self.guna else 'Not specified'

