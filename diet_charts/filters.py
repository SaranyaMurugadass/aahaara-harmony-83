import django_filters
from .models import DietChart


class DietChartFilter(django_filters.FilterSet):
    """Filter for DietChart model."""
    
    # Basic filters
    chart_name = django_filters.CharFilter(lookup_expr='icontains')
    chart_type = django_filters.ChoiceFilter(choices=DietChart.CHART_TYPE_CHOICES)
    status = django_filters.ChoiceFilter(choices=DietChart.STATUS_CHOICES)
    
    # Date filters
    start_date = django_filters.DateFilter()
    start_date_after = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_before = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')
    end_date = django_filters.DateFilter()
    end_date_after = django_filters.DateFilter(field_name='end_date', lookup_expr='gte')
    end_date_before = django_filters.DateFilter(field_name='end_date', lookup_expr='lte')
    
    # Created date filters
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    # Patient filters
    patient_id = django_filters.UUIDFilter(field_name='patient_id')
    patient_name = django_filters.CharFilter(field_name='patient__user_name', lookup_expr='icontains')
    
    # Creator filters
    created_by_id = django_filters.UUIDFilter(field_name='created_by_id')
    created_by_name = django_filters.CharFilter(field_name='created_by__user_name', lookup_expr='icontains')
    
    # Numeric filters
    total_days = django_filters.NumberFilter()
    total_days_min = django_filters.NumberFilter(field_name='total_days', lookup_expr='gte')
    total_days_max = django_filters.NumberFilter(field_name='total_days', lookup_expr='lte')
    
    target_calories = django_filters.NumberFilter()
    target_calories_min = django_filters.NumberFilter(field_name='target_calories', lookup_expr='gte')
    target_calories_max = django_filters.NumberFilter(field_name='target_calories', lookup_expr='lte')
    
    # Boolean filters
    is_ai_generated = django_filters.BooleanFilter()
    
    # Array filters
    dosha_focus = django_filters.BaseInFilter(field_name='dosha_focus', lookup_expr='contains')
    food_restrictions = django_filters.BaseInFilter(field_name='food_restrictions', lookup_expr='contains')
    
    # Version filter
    version = django_filters.NumberFilter()
    
    class Meta:
        model = DietChart
        fields = [
            'chart_name', 'chart_type', 'status', 'start_date', 'end_date',
            'created_at', 'patient_id', 'patient_name', 'created_by_id', 'created_by_name',
            'total_days', 'target_calories', 'is_ai_generated', 'dosha_focus',
            'food_restrictions', 'version'
        ]


