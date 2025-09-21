from django.urls import path
from .views import (
    DietChartListCreateView,
    DietChartDetailView,
    DietChartSummaryListView,
    get_patient_diet_charts,
    get_patient_latest_diet_chart,
    generate_diet_chart,
    save_diet_chart,
    get_diet_chart_stats
)

urlpatterns = [
    # Main CRUD endpoints
    path('', DietChartListCreateView.as_view(), name='dietchart-list-create'),
    path('create/', DietChartListCreateView.as_view(), name='dietchart-create'),
    path('<uuid:id>/', DietChartDetailView.as_view(), name='dietchart-detail'),
    path('<uuid:id>/update/', DietChartDetailView.as_view(), name='dietchart-update'),
    path('<uuid:id>/delete/', DietChartDetailView.as_view(), name='dietchart-delete'),
    
    # Summary endpoint
    path('summaries/', DietChartSummaryListView.as_view(), name='dietchart-summaries'),
    
    # Patient-specific endpoints
    path('patient/<uuid:patient_id>/', get_patient_diet_charts, name='patient-diet-charts'),
    path('patient/<uuid:patient_id>/latest/', get_patient_latest_diet_chart, name='patient-latest-diet-chart'),
    
    # Generation endpoint
    path('generate/', generate_diet_chart, name='generate-diet-chart'),
    
    # Save endpoint
    path('save/', save_diet_chart, name='save-diet-chart'),
    
    # Statistics endpoint
    path('stats/', get_diet_chart_stats, name='diet-chart-stats'),
]