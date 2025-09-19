"""
Serializers for patient management
"""
from rest_framework import serializers
from .models import Patient, PrakritiAnalysis, DiseaseAnalysis, Consultation
from authentication.models import DoctorProfile

class PatientSerializer(serializers.ModelSerializer):
    """Serializer for patient details"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    assigned_doctor_name = serializers.CharField(source='assigned_doctor.user.get_full_name', read_only=True)
    
    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ('user', 'registration_date', 'last_consultation')

class PrakritiAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for Prakriti analysis"""
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    analyzed_by_name = serializers.CharField(source='analyzed_by.user.get_full_name', read_only=True)
    
    class Meta:
        model = PrakritiAnalysis
        fields = '__all__'
        read_only_fields = ('analysis_date',)

class DiseaseAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for disease analysis"""
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    diagnosed_by_name = serializers.CharField(source='diagnosed_by.user.get_full_name', read_only=True)
    
    class Meta:
        model = DiseaseAnalysis
        fields = '__all__'
        read_only_fields = ('diagnosis_date',)

class ConsultationSerializer(serializers.ModelSerializer):
    """Serializer for consultations"""
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    
    class Meta:
        model = Consultation
        fields = '__all__'
        read_only_fields = ('consultation_date',)

class ConsultationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating consultations"""
    
    class Meta:
        model = Consultation
        fields = '__all__'
        read_only_fields = ('consultation_date',)
