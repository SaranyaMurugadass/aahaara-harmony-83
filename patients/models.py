"""
Patient-related models for medical data and consultations - Updated for unified structure
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from authentication.models import User, UnifiedProfile, UnifiedPatient

class Patient(models.Model):
    """Legacy Patient model - maps to UnifiedPatient for backward compatibility"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('discharged', 'Discharged'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient')
    assigned_doctor = models.ForeignKey(UnifiedProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_patients')
    patient_id = models.CharField(max_length=20, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    registration_date = models.DateTimeField(auto_now_add=True)
    last_consultation = models.DateTimeField(null=True, blank=True)
    next_appointment = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        managed = False  # Don't create database table
        verbose_name = "Patient"
        verbose_name_plural = "Patients"
        ordering = ['-registration_date']
    
    def __str__(self):
        return f"{self.user.full_name} ({self.patient_id})"
    
    @property
    def display_name(self):
        return f"{self.user.full_name} ({self.patient_id})"
    
    @property
    def age(self):
        """Get age from unified patient medical data"""
        unified_patient = self.user.unified_patient.first()
        return unified_patient.age if unified_patient else None
    
    @property
    def gender(self):
        """Get gender from unified profile"""
        profile = self.user.unified_profile.filter(profile_type='patient').first()
        return profile.get_profile_data('gender', '') if profile else ''
    
    @property
    def blood_type(self):
        """Get blood type from unified patient medical data"""
        unified_patient = self.user.unified_patient.first()
        return unified_patient.get_medical_data('blood_type', 'unknown') if unified_patient else 'unknown'
    
    @property
    def height(self):
        """Get height from unified patient medical data"""
        unified_patient = self.user.unified_patient.first()
        return unified_patient.get_medical_data('height') if unified_patient else None
    
    @property
    def weight(self):
        """Get weight from unified patient medical data"""
        unified_patient = self.user.unified_patient.first()
        return unified_patient.get_medical_data('weight') if unified_patient else None
    
    @property
    def location(self):
        """Get location from unified profile"""
        profile = self.user.unified_profile.filter(profile_type='patient').first()
        return profile.get_profile_data('location', '') if profile else ''
    
    @property
    def phone_number(self):
        """Get phone number from unified profile"""
        profile = self.user.unified_profile.filter(profile_type='patient').first()
        return profile.get_profile_data('phone_number', '') if profile else ''
    
    @property
    def bmi(self):
        """Get BMI from unified patient"""
        unified_patient = self.user.unified_patient.first()
        return unified_patient.bmi if unified_patient else None

class PrakritiAnalysis(models.Model):
    """Ayurvedic Prakriti (constitution) analysis"""
    DOSHA_CHOICES = [
        ('vata', 'Vata'),
        ('pitta', 'Pitta'),
        ('kapha', 'Kapha'),
        ('vata-pitta', 'Vata-Pitta'),
        ('vata-kapha', 'Vata-Kapha'),
        ('pitta-kapha', 'Pitta-Kapha'),
        ('tridosha', 'Tridosha'),
    ]
    
    ANALYSIS_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('completed', 'Completed'),
        ('reviewed', 'Reviewed'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prakriti_analyses')
    primary_dosha = models.CharField(max_length=20, choices=DOSHA_CHOICES)
    secondary_dosha = models.CharField(max_length=20, choices=DOSHA_CHOICES, blank=True)
    vata_score = models.IntegerField(default=0)
    pitta_score = models.IntegerField(default=0)
    kapha_score = models.IntegerField(default=0)
    analysis_notes = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=ANALYSIS_STATUS_CHOICES, default='draft')
    analyzed_by = models.ForeignKey(UnifiedProfile, on_delete=models.CASCADE, related_name='prakriti_analyses')
    analysis_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Prakriti Analysis"
        verbose_name_plural = "Prakriti Analyses"
        ordering = ['-analysis_date']
    
    def __str__(self):
        return f"{self.patient.user.full_name} - {self.primary_dosha}"
    
    @property
    def total_score(self):
        return self.vata_score + self.pitta_score + self.kapha_score
    
    @property
    def dosha_percentages(self):
        total = self.total_score
        if total == 0:
            return {'vata': 0, 'pitta': 0, 'kapha': 0}
        return {
            'vata': round((self.vata_score / total) * 100, 1),
            'pitta': round((self.pitta_score / total) * 100, 1),
            'kapha': round((self.kapha_score / total) * 100, 1)
        }
    
    def get_primary_dosha_display(self):
        return dict(self.DOSHA_CHOICES).get(self.primary_dosha, self.primary_dosha)

class DiseaseAnalysis(models.Model):
    """Disease and health condition analysis"""
    SEVERITY_CHOICES = [
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('cured', 'Cured'),
        ('chronic', 'Chronic'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='disease_analyses')
    disease_name = models.CharField(max_length=255)
    icd_code = models.CharField(max_length=20, blank=True)  # International Classification of Diseases
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    symptoms = models.TextField()
    diagnosis_notes = models.TextField(blank=True)
    treatment_plan = models.TextField(blank=True)
    medications = models.JSONField(default=list, blank=True)
    follow_up_required = models.BooleanField(default=True)
    follow_up_date = models.DateField(null=True, blank=True)
    diagnosed_by = models.ForeignKey(UnifiedProfile, on_delete=models.CASCADE, related_name='disease_analyses')
    diagnosis_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Disease Analysis"
        verbose_name_plural = "Disease Analyses"
        ordering = ['-diagnosis_date']
    
    def __str__(self):
        return f"{self.patient.user.full_name} - {self.disease_name}"
    
    def get_severity_display(self):
        return dict(self.SEVERITY_CHOICES).get(self.severity, self.severity)
    
    def get_status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, self.status)

class Consultation(models.Model):
    """Doctor-patient consultation records"""
    CONSULTATION_TYPE_CHOICES = [
        ('initial', 'Initial Consultation'),
        ('follow_up', 'Follow-up'),
        ('emergency', 'Emergency'),
        ('routine', 'Routine Check-up'),
        ('telemedicine', 'Telemedicine'),
        ('diet_review', 'Diet Chart Review'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='consultations')
    doctor = models.ForeignKey(UnifiedProfile, on_delete=models.CASCADE, related_name='consultations')
    consultation_type = models.CharField(max_length=20, choices=CONSULTATION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    chief_complaint = models.TextField()
    history_of_present_illness = models.TextField(blank=True)
    physical_examination = models.TextField(blank=True)
    vital_signs = models.JSONField(default=dict, blank=True)  # BP, HR, Temperature, etc.
    assessment = models.TextField(blank=True)
    plan = models.TextField(blank=True)
    prescription = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    follow_up_date = models.DateTimeField(null=True, blank=True)
    consultation_date = models.DateTimeField(auto_now_add=True)
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('partial', 'Partial'),
        ('waived', 'Waived'),
    ], default='pending')
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Consultation"
        verbose_name_plural = "Consultations"
        ordering = ['-consultation_date']
    
    def __str__(self):
        return f"{self.patient.user.full_name} - {self.consultation_date.strftime('%Y-%m-%d')}"
    
    @property
    def actual_duration(self):
        if self.actual_start_time and self.actual_end_time:
            delta = self.actual_end_time - self.actual_start_time
            return delta.total_seconds() / 60
        return None
    
    def get_consultation_type_display(self):
        return dict(self.CONSULTATION_TYPE_CHOICES).get(self.consultation_type, self.consultation_type)
    
    def get_status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, self.status)