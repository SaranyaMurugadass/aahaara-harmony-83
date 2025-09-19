"""
Admin configuration for patients app
"""
from django.contrib import admin
from .models import Patient, PrakritiAnalysis, DiseaseAnalysis, Consultation

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    """Patient admin"""
    list_display = ('user', 'assigned_doctor', 'registration_date', 'is_active')
    list_filter = ('is_active', 'registration_date', 'assigned_doctor')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')

@admin.register(PrakritiAnalysis)
class PrakritiAnalysisAdmin(admin.ModelAdmin):
    """Prakriti analysis admin"""
    list_display = ('patient', 'primary_dosha', 'secondary_dosha', 'analyzed_by', 'analysis_date')
    list_filter = ('primary_dosha', 'secondary_dosha', 'analysis_date')
    search_fields = ('patient__user__username', 'patient__user__email', 'analyzed_by__user__username')

@admin.register(DiseaseAnalysis)
class DiseaseAnalysisAdmin(admin.ModelAdmin):
    """Disease analysis admin"""
    list_display = ('patient', 'disease_name', 'severity', 'diagnosed_by', 'diagnosis_date', 'is_active')
    list_filter = ('severity', 'is_active', 'diagnosis_date')
    search_fields = ('patient__user__username', 'disease_name', 'diagnosed_by__user__username')

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    """Consultation admin"""
    list_display = ('patient', 'doctor', 'consultation_type', 'consultation_date', 'duration_minutes')
    list_filter = ('consultation_type', 'consultation_date')
    search_fields = ('patient__user__username', 'doctor__user__username', 'chief_complaint')