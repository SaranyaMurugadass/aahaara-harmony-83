from django.urls import path
from . import views

urlpatterns = [
    # Food items CRUD
    path('', views.food_items_list, name='food_items_list'),
    path('<uuid:food_id>/', views.food_item_detail, name='food_item_detail'),
    path('create/', views.create_food_item, name='create_food_item'),
    path('<uuid:food_id>/update/', views.update_food_item, name='update_food_item'),
    path('<uuid:food_id>/delete/', views.delete_food_item, name='delete_food_item'),
    
    # Import and utilities
    path('import-csv/', views.import_csv_foods, name='import_csv_foods'),
    path('categories/', views.food_categories, name='food_categories'),
    path('stats/', views.food_stats, name='food_stats'),
]

