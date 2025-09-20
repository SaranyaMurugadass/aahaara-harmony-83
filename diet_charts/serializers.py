from rest_framework import serializers
from .models import DietChart


class DietChartSerializer(serializers.ModelSerializer):
    """Serializer for DietChart model."""
    
    # Computed fields
    patient_name = serializers.ReadOnlyField()
    created_by_name = serializers.ReadOnlyField()
    total_calories = serializers.SerializerMethodField()
    meal_count = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    can_be_modified = serializers.SerializerMethodField()
    
    class Meta:
        model = DietChart
        fields = [
            'id', 'patient', 'created_by', 'chart_name', 'chart_type', 'status',
            'start_date', 'end_date', 'total_days', 'prakriti_analysis', 'disease_analysis',
            'patient_preferences', 'target_calories', 'meal_distribution', 'dosha_focus',
            'food_restrictions', 'daily_meals', 'notes', 'is_ai_generated',
            'generation_parameters', 'version', 'created_at', 'updated_at',
            'patient_name', 'created_by_name', 'total_calories', 'meal_count',
            'is_active', 'can_be_modified'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'version']
    
    def get_total_calories(self, obj):
        """Get total calories for the entire chart."""
        return obj.get_total_calories()
    
    def get_meal_count(self, obj):
        """Get the total number of meals in the chart."""
        return obj.get_meal_count()
    
    def get_is_active(self, obj):
        """Check if the chart is currently active."""
        return obj.is_active()
    
    def get_can_be_modified(self, obj):
        """Check if the chart can be modified."""
        return obj.can_be_modified()
    
    def validate(self, data):
        """Validate the diet chart data."""
        # Validate date order
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError("Start date must be before or equal to end date.")
        
        # Validate total days matches date range
        if data.get('start_date') and data.get('end_date') and data.get('total_days'):
            from datetime import timedelta
            date_diff = (data['end_date'] - data['start_date']).days + 1
            if data['total_days'] != date_diff:
                raise serializers.ValidationError("Total days must match the date range.")
        
        # Validate target calories
        if data.get('target_calories') is not None and data['target_calories'] <= 0:
            raise serializers.ValidationError("Target calories must be positive.")
        
        return data


class DietChartCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new diet charts."""
    
    class Meta:
        model = DietChart
        fields = [
            'patient', 'chart_name', 'chart_type', 'status', 'start_date', 'end_date',
            'total_days', 'prakriti_analysis', 'disease_analysis', 'patient_preferences',
            'target_calories', 'meal_distribution', 'dosha_focus', 'food_restrictions',
            'daily_meals', 'notes', 'is_ai_generated', 'generation_parameters'
        ]
    
    def validate_daily_meals(self, value):
        """Validate the daily meals structure."""
        if not value:
            raise serializers.ValidationError("Daily meals cannot be empty.")
        
        # Validate structure
        for day_key, day_data in value.items():
            if not isinstance(day_data, dict):
                raise serializers.ValidationError(f"Day {day_key} must be an object.")
            
            for meal_key, meal_data in day_data.items():
                if not isinstance(meal_data, dict):
                    raise serializers.ValidationError(f"Meal {meal_key} in {day_key} must be an object.")
                
                # Validate required meal fields
                required_fields = ['name', 'calories']
                for field in required_fields:
                    if field not in meal_data:
                        raise serializers.ValidationError(f"Meal {meal_key} in {day_key} must have {field}.")
                
                # Validate calories is positive
                if meal_data.get('calories', 0) < 0:
                    raise serializers.ValidationError(f"Meal {meal_key} in {day_key} calories must be non-negative.")
        
        return value


class DietChartUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating diet charts."""
    
    class Meta:
        model = DietChart
        fields = [
            'chart_name', 'status', 'prakriti_analysis', 'disease_analysis',
            'patient_preferences', 'target_calories', 'meal_distribution',
            'dosha_focus', 'food_restrictions', 'daily_meals', 'notes',
            'generation_parameters'
        ]
    
    def validate_status(self, value):
        """Validate status transitions."""
        if self.instance:
            current_status = self.instance.status
            valid_transitions = {
                'draft': ['active', 'archived'],
                'active': ['completed', 'archived'],
                'completed': ['archived'],
                'archived': ['draft', 'active']
            }
            
            if value not in valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from {current_status} to {value}."
                )
        
        return value


class DietChartSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for diet chart summaries."""
    
    patient_name = serializers.ReadOnlyField()
    created_by_name = serializers.ReadOnlyField()
    total_calories = serializers.SerializerMethodField()
    meal_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DietChart
        fields = [
            'id', 'chart_name', 'chart_type', 'status', 'start_date', 'end_date',
            'total_days', 'target_calories', 'created_at', 'patient_name',
            'created_by_name', 'total_calories', 'meal_count'
        ]
    
    def get_total_calories(self, obj):
        return obj.get_total_calories()
    
    def get_meal_count(self, obj):
        return obj.get_meal_count()