"""
URL patterns for patients app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.patient_list, name='patient_list'),
    path('create/', views.create_patient, name='create_patient'),
    path('<uuid:pk>/', views.patient_detail, name='patient_detail'),
    path('<uuid:patient_id>/summary/', views.patient_summary, name='patient_summary'),
    path('<uuid:patient_id>/assign-doctor/', views.assign_doctor, name='assign_doctor'),
    path('<uuid:patient_id>/prakriti/', views.prakriti_analysis_list_create, name='prakriti_analysis'),
    path('<uuid:patient_id>/diseases/', views.disease_analysis_list_create, name='disease_analysis'),
    path('<uuid:patient_id>/consultations/', views.consultation_list_create, name='consultations'),
]
