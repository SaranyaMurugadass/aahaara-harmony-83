"""
Serializers for authentication and user management
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, DoctorProfile, PatientProfile
from .supabase_service import supabase_service

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'role', 'password', 'password_confirm')
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
        }
    
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
    user = UserRegistrationSerializer(read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = '__all__'
        read_only_fields = ('user', 'is_verified', 'created_at', 'updated_at')

class PatientProfileSerializer(serializers.ModelSerializer):
    """Serializer for patient profile"""
    user = UserRegistrationSerializer(read_only=True)
    
    class Meta:
        model = PatientProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

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
    """Serializer for user details"""
    doctor_profile = DoctorProfileSerializer(read_only=True)
    patient_profile = PatientProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'doctor_profile', 'patient_profile', 'date_joined', 'is_active')
        read_only_fields = ('id', 'date_joined', 'is_active')
