"""
Patient-related models for medical data and consultations
"""
from django.db import models
from django.conf import settings
from authentication.models import User, DoctorProfile

class Patient(models.Model):
    """Patient model linked to user"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient')
    assigned_doctor = models.ForeignKey(DoctorProfile, on_delete=models.SET_NULL, null=True, blank=True)
    registration_date = models.DateTimeField(auto_now_add=True)
    last_consultation = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()}"

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
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prakriti_analyses')
    primary_dosha = models.CharField(max_length=20, choices=DOSHA_CHOICES)
    secondary_dosha = models.CharField(max_length=20, choices=DOSHA_CHOICES, blank=True)
    vata_score = models.IntegerField(default=0)
    pitta_score = models.IntegerField(default=0)
    kapha_score = models.IntegerField(default=0)
    analysis_notes = models.TextField(blank=True)
    analyzed_by = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE)
    analysis_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.primary_dosha}"

class DiseaseAnalysis(models.Model):
    """Disease and health condition analysis"""
    SEVERITY_CHOICES = [
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='disease_analyses')
    disease_name = models.CharField(max_length=255)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    symptoms = models.TextField()
    diagnosis_notes = models.TextField(blank=True)
    treatment_plan = models.TextField(blank=True)
    diagnosed_by = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE)
    diagnosis_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.disease_name}"

class Consultation(models.Model):
    """Doctor-patient consultation records"""
    CONSULTATION_TYPE_CHOICES = [
        ('initial', 'Initial Consultation'),
        ('follow_up', 'Follow-up'),
        ('emergency', 'Emergency'),
        ('routine', 'Routine Check-up'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='consultations')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='consultations')
    consultation_type = models.CharField(max_length=20, choices=CONSULTATION_TYPE_CHOICES)
    chief_complaint = models.TextField()
    history_of_present_illness = models.TextField(blank=True)
    physical_examination = models.TextField(blank=True)
    assessment = models.TextField(blank=True)
    plan = models.TextField(blank=True)
    prescription = models.TextField(blank=True)
    follow_up_date = models.DateTimeField(null=True, blank=True)
    consultation_date = models.DateTimeField(auto_now_add=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.consultation_date.strftime('%Y-%m-%d')}"