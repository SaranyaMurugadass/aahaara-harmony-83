"""
Serializers for authentication and user management
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from .models import User, DoctorProfile, PatientProfile

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True}
        }
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class DoctorProfileSerializer(serializers.ModelSerializer):
    """Serializer for doctor profile"""
    display_name = serializers.ReadOnlyField()
    specialization_display = serializers.ReadOnlyField(source='get_specialization_display')
    
    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'qualification', 'experience_years', 'license_number', 
            'specialization', 'specialization_display', 'bio', 'consultation_fee', 
            'is_verified', 'rating', 'total_consultations', 'profile_picture',
            'languages', 'consultation_hours', 'display_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'rating', 'total_consultations', 'created_at', 'updated_at']

class PatientProfileSerializer(serializers.ModelSerializer):
    """Serializer for patient profile"""
    age = serializers.ReadOnlyField()
    bmi = serializers.ReadOnlyField()
    gender_display = serializers.ReadOnlyField(source='get_gender_display')
    
    class Meta:
        model = PatientProfile
        fields = [
            'id', 'date_of_birth', 'age', 'gender', 'gender_display', 'blood_type',
            'height', 'weight', 'bmi', 'location', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relation', 'medical_history',
            'allergies', 'current_medications', 'profile_picture', 'insurance_provider',
            'insurance_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'age', 'bmi', 'created_at', 'updated_at']

class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            try:
                user = User.objects.get(email=email)
                if user.check_password(password):
                    attrs['user'] = user
                    return attrs
                else:
                    raise serializers.ValidationError('Invalid credentials')
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials')
        else:
            raise serializers.ValidationError('Must include email and password')

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data"""
    full_name = serializers.ReadOnlyField()
    role_display_name = serializers.ReadOnlyField(source='get_role_display_name')
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'role_display_name', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_joined', 'is_active', 'last_login', 'created_at', 'updated_at']

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user data"""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone_number']
    
    def validate_email(self, value):
        if self.instance and User.objects.filter(email=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

class DoctorProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating doctor profile"""
    class Meta:
        model = DoctorProfile
        fields = [
            'qualification', 'bio', 'consultation_fee', 'languages', 'consultation_hours'
        ]

class PatientProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating patient profile"""
    class Meta:
        model = PatientProfile
        fields = [
            'date_of_birth', 'height', 'weight', 'location', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relation', 'medical_history',
            'allergies', 'current_medications', 'insurance_provider', 'insurance_number'
        ]