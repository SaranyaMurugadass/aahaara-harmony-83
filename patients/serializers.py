"""
Serializers for patient management
"""
from rest_framework import serializers
from .models import PrakritiAnalysis, DiseaseAnalysis, Consultation, PatientReport, ReportComment, ReportShare
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


# Patient Report Serializers
class PatientReportSerializer(serializers.ModelSerializer):
    """Serializer for PatientReport model"""
    
    patient_name = serializers.CharField(source='patient.user_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.first_name', read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    is_recent = serializers.ReadOnlyField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientReport
        fields = [
            'id', 'patient', 'patient_name', 'uploaded_by', 'uploaded_by_name',
            'report_type', 'title', 'description', 'notes', 'file_name', 
            'file_path', 'file_size', 'file_size_mb', 'file_type', 'public_url',
            'report_date', 'status', 'is_urgent', 'is_recent', 'comments_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'uploaded_by']
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def validate_file_size(self, value):
        """Validate file size (max 50MB)"""
        max_size = 50 * 1024 * 1024  # 50MB
        if value > max_size:
            raise serializers.ValidationError("File size cannot exceed 50MB")
        return value
    
    def validate_report_type(self, value):
        """Validate report type"""
        valid_types = [choice[0] for choice in PatientReport.REPORT_TYPE_CHOICES]
        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid report type. Must be one of: {', '.join(valid_types)}")
        return value


class PatientReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating PatientReport"""
    
    class Meta:
        model = PatientReport
        fields = [
            'patient', 'report_type', 'title', 'description', 'notes',
            'file_name', 'file_path', 'file_size', 'file_type', 'public_url',
            'report_date', 'is_urgent'
        ]
    
    def validate_file_size(self, value):
        """Validate file size (max 50MB)"""
        max_size = 50 * 1024 * 1024  # 50MB
        if value > max_size:
            raise serializers.ValidationError("File size cannot exceed 50MB")
        return value


class PatientReportUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating PatientReport"""
    
    class Meta:
        model = PatientReport
        fields = [
            'title', 'description', 'notes', 'report_date', 'status', 'is_urgent'
        ]


class PatientReportSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for report summaries"""
    
    patient_name = serializers.CharField(source='patient.user_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.first_name', read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    
    class Meta:
        model = PatientReport
        fields = [
            'id', 'patient_name', 'uploaded_by_name', 'report_type', 'title',
            'file_name', 'file_size_mb', 'status', 'is_urgent', 'created_at'
        ]


class ReportCommentSerializer(serializers.ModelSerializer):
    """Serializer for ReportComment model"""
    
    author_name = serializers.CharField(source='author.first_name', read_only=True)
    
    class Meta:
        model = ReportComment
        fields = [
            'id', 'report', 'author', 'author_name', 'comment', 'is_internal',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']


class ReportCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ReportComment"""
    
    class Meta:
        model = ReportComment
        fields = ['report', 'comment', 'is_internal']


class ReportShareSerializer(serializers.ModelSerializer):
    """Serializer for ReportShare model"""
    
    shared_by_name = serializers.CharField(source='shared_by.first_name', read_only=True)
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = ReportShare
        fields = [
            'id', 'report', 'shared_by', 'shared_by_name', 'recipient_email',
            'recipient_name', 'message', 'access_token', 'expires_at',
            'is_accessed', 'accessed_at', 'is_expired', 'created_at'
        ]
        read_only_fields = ['id', 'shared_by', 'access_token', 'created_at']


class ReportShareCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ReportShare"""
    
    class Meta:
        model = ReportShare
        fields = [
            'report', 'recipient_email', 'recipient_name', 'message', 'expires_at'
        ]
    
    def validate_expires_at(self, value):
        """Validate expiration date (must be in future)"""
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError("Expiration date must be in the future")
        return value