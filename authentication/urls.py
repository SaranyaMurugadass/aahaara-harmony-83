"""
URL patterns for authentication app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('register/patient/', views.register_patient, name='register_patient'),
    path('register/doctor/', views.register_doctor, name='register_doctor'),
    path('login/', views.user_login, name='user_login'),
    path('logout/', views.user_logout, name='user_logout'),
    path('profile/', views.user_profile, name='user_profile'),
    path('supabase-debug/', views.supabase_debug, name='supabase_debug'),
]
