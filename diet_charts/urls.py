"""
URL patterns for diet_charts app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('foods/', views.FoodItemListView.as_view(), name='food_list'),
    path('food-database/', views.food_database, name='food_database'),
    path('charts/', views.DietChartListCreateView.as_view(), name='diet_chart_list_create'),
    path('charts/<int:pk>/', views.DietChartDetailView.as_view(), name='diet_chart_detail'),
    path('charts/<int:diet_chart_id>/meals/', views.MealPlanListCreateView.as_view(), name='meal_plan_list_create'),
    path('generate/', views.generate_diet_chart, name='generate_diet_chart'),
    path('recommendations/', views.DietRecommendationListView.as_view(), name='diet_recommendations'),
]
