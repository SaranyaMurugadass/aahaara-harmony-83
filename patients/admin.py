"""
Admin configuration for patients app
"""
from django.contrib import admin
from .models import Patient, PrakritiAnalysis, DiseaseAnalysis, Consultation, PatientReport, ReportComment, ReportShare

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

@admin.register(PatientReport)
class PatientReportAdmin(admin.ModelAdmin):
    """Patient report admin"""
    list_display = ('patient', 'title', 'report_type', 'status', 'uploaded_by', 'created_at', 'is_urgent')
    list_filter = ('report_type', 'status', 'is_urgent', 'created_at')
    search_fields = ('patient__user_name', 'title', 'description', 'uploaded_by__username')
    readonly_fields = ('file_path', 'public_url', 'file_size', 'created_at', 'updated_at')
    list_editable = ('status', 'is_urgent')

@admin.register(ReportComment)
class ReportCommentAdmin(admin.ModelAdmin):
    """Report comment admin"""
    list_display = ('report', 'author', 'is_internal', 'created_at')
    list_filter = ('is_internal', 'created_at')
    search_fields = ('report__title', 'author__username', 'comment')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ReportShare)
class ReportShareAdmin(admin.ModelAdmin):
    """Report share admin"""
    list_display = ('report', 'recipient_email', 'shared_by', 'expires_at', 'is_accessed', 'created_at')
    list_filter = ('is_accessed', 'expires_at', 'created_at')
    search_fields = ('report__title', 'recipient_email', 'shared_by__username')
    readonly_fields = ('access_token', 'created_at')