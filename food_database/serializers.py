from rest_framework import serializers
from .models import FoodItem


class FoodItemSerializer(serializers.ModelSerializer):
    """Serializer for FoodItem model"""
    
    # Computed fields
    is_tridoshic = serializers.ReadOnlyField()
    dosha_balance = serializers.ReadOnlyField()
    meal_types_display = serializers.ReadOnlyField(source='get_meal_types_display')
    tags_display = serializers.ReadOnlyField(source='get_tags_display')
    rasa_display = serializers.ReadOnlyField(source='get_rasa_display')
    guna_display = serializers.ReadOnlyField(source='get_guna_display')
    
    # Creator information
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = FoodItem
        fields = [
            'id', 'name', 'serving_size', 'calories', 'protein_g', 'carbs_g', 
            'fat_g', 'fiber_g', 'rasa', 'guna', 'virya', 'vata_effect', 
            'pitta_effect', 'kapha_effect', 'meal_types', 'food_category', 
            'tags', 'created_at', 'updated_at', 'created_by', 'created_by_name',
            'is_tridoshic', 'dosha_balance', 'meal_types_display', 
            'tags_display', 'rasa_display', 'guna_display'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class FoodItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new food items"""
    
    class Meta:
        model = FoodItem
        fields = [
            'name', 'serving_size', 'calories', 'protein_g', 'carbs_g', 
            'fat_g', 'fiber_g', 'rasa', 'guna', 'virya', 'vata_effect', 
            'pitta_effect', 'kapha_effect', 'meal_types', 'food_category', 'tags'
        ]
    
    def validate_meal_types(self, value):
        """Validate meal types"""
        valid_meal_types = ['Breakfast', 'Brunch', 'Lunch', 'Snacks', 'Dinner']
        for meal_type in value:
            if meal_type not in valid_meal_types:
                raise serializers.ValidationError(
                    f"Invalid meal type: {meal_type}. Must be one of {valid_meal_types}"
                )
        return value
    
    def validate_rasa(self, value):
        """Validate rasa values"""
        valid_rasa = ['Sweet', 'Sour', 'Salty', 'Pungent', 'Bitter', 'Astringent']
        for rasa in value:
            if rasa not in valid_rasa:
                raise serializers.ValidationError(
                    f"Invalid rasa: {rasa}. Must be one of {valid_rasa}"
                )
        return value


class FoodItemFilterSerializer(serializers.Serializer):
    """Serializer for filtering food items"""
    
    # Dosha filters
    vata_effect = serializers.ChoiceField(
        choices=['pacifies', 'aggravates', 'neutral'], 
        required=False
    )
    pitta_effect = serializers.ChoiceField(
        choices=['pacifies', 'aggravates', 'neutral'], 
        required=False
    )
    kapha_effect = serializers.ChoiceField(
        choices=['pacifies', 'aggravates', 'neutral'], 
        required=False
    )
    
    # Meal type filters
    meal_types = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            'Breakfast', 'Brunch', 'Lunch', 'Snacks', 'Dinner'
        ]),
        required=False
    )
    
    # Other filters
    food_category = serializers.CharField(required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    rasa = serializers.ListField(child=serializers.CharField(), required=False)
    guna = serializers.ListField(child=serializers.CharField(), required=False)
    virya = serializers.ChoiceField(
        choices=['Heating', 'Cooling', 'Neutral'], 
        required=False
    )
    
    # Search
    search = serializers.CharField(required=False)
    
    # Nutritional filters
    min_calories = serializers.IntegerField(required=False)
    max_calories = serializers.IntegerField(required=False)
    min_protein = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    max_protein = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)


