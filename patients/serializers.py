"""
Serializers for patient management
"""
from rest_framework import serializers
from .models import PrakritiAnalysis, DiseaseAnalysis, Consultation
from authentication.models import UnifiedPatient, UnifiedProfile

class PatientSerializer(serializers.ModelSerializer):
    """Serializer for patient data"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UnifiedPatient
        fields = [
            'id', 'patient_id', 'user_name', 'user_email', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient_id', 'created_at', 'updated_at']

class PrakritiAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for Prakriti analysis"""
    patient_id = serializers.CharField(source='patient.id', read_only=True)
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    analyzed_by_name = serializers.CharField(source='analyzed_by.user.full_name', read_only=True)
    primary_dosha_display = serializers.ReadOnlyField(source='get_primary_dosha_display')
    total_score = serializers.ReadOnlyField()
    dosha_percentages = serializers.ReadOnlyField()
    
    class Meta:
        model = PrakritiAnalysis
        fields = [
            'id', 'patient', 'patient_id', 'patient_name', 'primary_dosha', 'primary_dosha_display',
            'secondary_dosha', 'vata_score', 'pitta_score', 'kapha_score',
            'total_score', 'dosha_percentages', 'analysis_notes', 'recommendations',
            'status', 'analyzed_by', 'analyzed_by_name', 'analysis_date', 'updated_at'
        ]
        read_only_fields = ['id', 'analysis_date', 'updated_at']

class DiseaseAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for disease analysis"""
    patient_id = serializers.CharField(source='patient.id', read_only=True)
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    diagnosed_by_name = serializers.CharField(source='diagnosed_by.user.full_name', read_only=True)
    severity_display = serializers.ReadOnlyField(source='get_severity_display')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    
    class Meta:
        model = DiseaseAnalysis
        fields = [
            'id', 'patient', 'patient_id', 'patient_name', 'disease_name', 'icd_code', 'severity',
            'severity_display', 'status', 'status_display', 'symptoms', 'diagnosis_notes',
            'treatment_plan', 'medications', 'follow_up_required', 'follow_up_date',
            'diagnosed_by', 'diagnosed_by_name', 'diagnosis_date', 'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'diagnosis_date', 'updated_at']

class ConsultationSerializer(serializers.ModelSerializer):
    """Serializer for consultation data"""
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.display_name', read_only=True)
    consultation_type_display = serializers.ReadOnlyField(source='get_consultation_type_display')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    actual_duration = serializers.ReadOnlyField()
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'consultation_type',
            'consultation_type_display', 'status', 'status_display', 'chief_complaint',
            'history_of_present_illness', 'physical_examination', 'vital_signs',
            'assessment', 'plan', 'prescription', 'recommendations', 'follow_up_date',
            'consultation_date', 'actual_start_time', 'actual_end_time', 'duration_minutes',
            'actual_duration', 'consultation_fee', 'payment_status', 'notes'
        ]
        read_only_fields = ['id', 'consultation_date']

class ConsultationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating consultations"""
    class Meta:
        model = Consultation
        fields = [
            'patient', 'consultation_type', 'chief_complaint', 'history_of_present_illness',
            'physical_examination', 'vital_signs', 'assessment', 'plan', 'prescription',
            'recommendations', 'follow_up_date', 'duration_minutes', 'consultation_fee',
            'payment_status', 'notes'
        ]

class PatientSummarySerializer(serializers.Serializer):
    """Serializer for comprehensive patient summary"""
    patient = PatientSerializer()
    prakriti_analysis = PrakritiAnalysisSerializer(allow_null=True)
    active_diseases = DiseaseAnalysisSerializer(many=True)
    recent_consultations = ConsultationSerializer(many=True)