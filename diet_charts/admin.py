"""
Admin configuration for diet_charts app
"""
from django.contrib import admin
from .models import DietChart


@admin.register(DietChart)
class DietChartAdmin(admin.ModelAdmin):
    """Diet chart admin"""
    list_display = ('chart_name', 'patient_name', 'chart_type', 'created_by_name', 'start_date', 'end_date', 'status', 'is_ai_generated')
    list_filter = ('chart_type', 'status', 'is_ai_generated', 'start_date', 'created_at')
    search_fields = ('chart_name', 'patient__user_name', 'created_by__user_name', 'notes')
    readonly_fields = ('id', 'created_at', 'updated_at', 'version')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'chart_name', 'chart_type', 'status', 'patient', 'created_by')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'total_days')
        }),
        ('Analysis Data', {
            'fields': ('prakriti_analysis', 'disease_analysis', 'patient_preferences'),
            'classes': ('collapse',)
        }),
        ('Configuration', {
            'fields': ('target_calories', 'meal_distribution', 'dosha_focus', 'food_restrictions'),
            'classes': ('collapse',)
        }),
        ('Content', {
            'fields': ('daily_meals', 'notes'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('is_ai_generated', 'generation_parameters', 'version', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )