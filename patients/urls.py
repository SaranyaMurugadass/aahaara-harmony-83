"""
URL patterns for patients app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.patient_list, name='patient_list_create'),
    path('<int:pk>/', views.PatientDetailView.as_view(), name='patient_detail'),
    path('<int:patient_id>/summary/', views.patient_summary, name='patient_summary'),
    path('<int:patient_id>/assign-doctor/', views.assign_doctor, name='assign_doctor'),
    path('<int:patient_id>/prakriti/', views.PrakritiAnalysisListCreateView.as_view(), name='prakriti_analysis'),
    path('<int:patient_id>/diseases/', views.DiseaseAnalysisListCreateView.as_view(), name='disease_analysis'),
    path('<int:patient_id>/consultations/', views.ConsultationListCreateView.as_view(), name='consultations'),
]
