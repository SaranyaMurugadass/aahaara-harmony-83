"""
Authentication models for doctors and patients - Updated for unified table structure
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.utils import timezone
import uuid

class User(AbstractUser):
    """Unified user model that maps to unified_users table"""
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    password_hash = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as primary identifier
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    
    class Meta:
        db_table = 'unified_users'
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_role_display_name(self):
        return dict(self.ROLE_CHOICES).get(self.role, self.role)

class UnifiedProfile(models.Model):
    """Unified profile model that maps to unified_profiles table"""
    PROFILE_TYPE_CHOICES = [
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='unified_profile')
    profile_type = models.CharField(max_length=20, choices=PROFILE_TYPE_CHOICES)
    profile_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'unified_profiles'
        verbose_name = "Unified Profile"
        verbose_name_plural = "Unified Profiles"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} ({self.profile_type})"
    
    @property
    def is_patient(self):
        return self.profile_type == 'patient'
    
    @property
    def is_doctor(self):
        return self.profile_type == 'doctor'
    
    def get_profile_data(self, key, default=None):
        """Get a specific value from profile_data JSON"""
        return self.profile_data.get(key, default)
    
    def set_profile_data(self, key, value):
        """Set a specific value in profile_data JSON"""
        self.profile_data[key] = value
        self.save()

class UnifiedPatient(models.Model):
    """Unified patient model that maps to unified_patients table"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='unified_patient')
    patient_id = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    medical_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'unified_patients'
        verbose_name = "Unified Patient"
        verbose_name_plural = "Unified Patients"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} ({self.patient_id})"
    
    def get_medical_data(self, key, default=None):
        """Get a specific value from medical_data JSON"""
        return self.medical_data.get(key, default)
    
    def set_medical_data(self, key, value):
        """Set a specific value in medical_data JSON"""
        self.medical_data[key] = value
        self.save()
    
    @property
    def age(self):
        """Calculate age from date_of_birth in medical_data"""
        date_of_birth = self.get_medical_data('date_of_birth')
        if date_of_birth:
            today = timezone.now().date()
            birth_date = timezone.datetime.strptime(date_of_birth, '%Y-%m-%d').date()
            return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return None
    
    @property
    def bmi(self):
        """Calculate BMI from height and weight in medical_data"""
        height = self.get_medical_data('height')
        weight = self.get_medical_data('weight')
        if height and weight:
            height_m = float(height) / 100
            return round(float(weight) / (height_m ** 2), 2)
        return None

# Legacy models for backward compatibility
class DoctorProfile(models.Model):
    """Legacy DoctorProfile model - maps to UnifiedProfile for backward compatibility"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    
    class Meta:
        managed = False  # Don't create database table
        verbose_name = "Doctor Profile"
        verbose_name_plural = "Doctor Profiles"
    
    def __str__(self):
        return f"Dr. {self.user.full_name}"
    
    @property
    def qualification(self):
        profile = self.user.unified_profile.filter(profile_type='doctor').first()
        return profile.get_profile_data('qualification', '') if profile else ''
    
    @property
    def experience_years(self):
        profile = self.user.unified_profile.filter(profile_type='doctor').first()
        return profile.get_profile_data('experience_years', 0) if profile else 0
    
    @property
    def license_number(self):
        profile = self.user.unified_profile.filter(profile_type='doctor').first()
        return profile.get_profile_data('license_number', '') if profile else ''
    
    @property
    def specialization(self):
        profile = self.user.unified_profile.filter(profile_type='doctor').first()
        return profile.get_profile_data('specialization', '') if profile else ''
    
    @property
    def bio(self):
        profile = self.user.unified_profile.filter(profile_type='doctor').first()
        return profile.get_profile_data('bio', '') if profile else ''
    
    @property
    def consultation_fee(self):
        profile = self.user.unified_profile.filter(profile_type='doctor').first()
        return profile.get_profile_data('consultation_fee', 0.00) if profile else 0.00
    
    @property
    def is_verified(self):
        profile = self.user.unified_profile.filter(profile_type='doctor').first()
        return profile.get_profile_data('is_verified', False) if profile else False

class PatientProfile(models.Model):
    """Legacy PatientProfile model - maps to UnifiedProfile for backward compatibility"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    
    class Meta:
        managed = False  # Don't create database table
        verbose_name = "Patient Profile"
        verbose_name_plural = "Patient Profiles"
    
    def __str__(self):
        return f"{self.user.full_name} (Patient)"
    
    @property
    def age(self):
        patient = self.user.unified_patient.first()
        return patient.age if patient else None
    
    @property
    def gender(self):
        profile = self.user.unified_profile.filter(profile_type='patient').first()
        return profile.get_profile_data('gender', '') if profile else ''
    
    @property
    def blood_type(self):
        patient = self.user.unified_patient.first()
        return patient.get_medical_data('blood_type', 'unknown') if patient else 'unknown'
    
    @property
    def height(self):
        patient = self.user.unified_patient.first()
        return patient.get_medical_data('height') if patient else None
    
    @property
    def weight(self):
        patient = self.user.unified_patient.first()
        return patient.get_medical_data('weight') if patient else None
    
    @property
    def location(self):
        profile = self.user.unified_profile.filter(profile_type='patient').first()
        return profile.get_profile_data('location', '') if profile else ''
    
    @property
    def phone_number(self):
        profile = self.user.unified_profile.filter(profile_type='patient').first()
        return profile.get_profile_data('phone_number', '') if profile else ''
    
    @property
    def bmi(self):
        patient = self.user.unified_patient.first()
        return patient.bmi if patient else None