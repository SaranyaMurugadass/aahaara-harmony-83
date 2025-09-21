"""
API views for authentication and user management
"""
from django.db import transaction
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

from .serializers import (
    UserRegistrationSerializer,
    DoctorProfileSerializer, 
    PatientProfileSerializer,
    UserLoginSerializer,
    UserSerializer
)
from .models import UnifiedProfile, UnifiedPatient
from .supabase_service import supabase_service

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_patient(request):
    """Register a new patient"""
    try:
        with transaction.atomic():
            # Create user
            user_data = request.data.copy()
            user_data['role'] = 'patient'
            user_serializer = UserRegistrationSerializer(data=user_data)
            
            if user_serializer.is_valid():
                user = user_serializer.save()
                
                # Create unified patient profile
                patient_profile_data = {
                    'date_of_birth': request.data.get('date_of_birth'),
                    'gender': request.data.get('gender'),
                    'blood_type': request.data.get('blood_type'),
                    'height': request.data.get('height'),
                    'weight': request.data.get('weight'),
                    'location': request.data.get('location', ''),
                    'phone_number': request.data.get('phone_number', ''),
                    'emergency_contact_name': request.data.get('emergency_contact_name', ''),
                    'emergency_contact_phone': request.data.get('emergency_contact_phone', ''),
                    'emergency_contact_relation': request.data.get('emergency_contact_relation', ''),
                    'medical_history': request.data.get('medical_history', ''),
                    'allergies': request.data.get('allergies', ''),
                    'current_medications': request.data.get('current_medications', ''),
                    'insurance_provider': request.data.get('insurance_provider', ''),
                    'insurance_number': request.data.get('insurance_number', ''),
                }
                
                # Create unified profile
                unified_profile = UnifiedProfile.objects.create(
                    user=user,
                    profile_type='patient',
                    profile_data=patient_profile_data
                )
                
                # Create unified patient record
                import uuid
                patient_id = f"PAT-{str(uuid.uuid4())[:8].upper()}"
                unified_patient = UnifiedPatient.objects.create(
                    user=user,
                    patient_id=patient_id,
                    medical_data=patient_profile_data
                )
                
                # Sync user to Supabase with debugging
                try:
                    supabase_user_id = supabase_service.sync_user_to_supabase(user)
                    if supabase_user_id:
                        print(f"✅ User synced to Supabase with ID: {supabase_user_id}")
                        
                        # Sync patient profile
                        supabase_profile_id = supabase_service.sync_patient_profile(unified_profile)
                        if supabase_profile_id:
                            print(f"✅ Patient profile synced to Supabase with ID: {supabase_profile_id}")
                        else:
                            print("⚠️ Patient profile sync to Supabase failed")
                        
                        # Sync patient record
                        supabase_patient_id = supabase_service.sync_patient(unified_patient)
                        if supabase_patient_id:
                            print(f"✅ Patient record synced to Supabase with ID: {supabase_patient_id}")
                        else:
                            print("⚠️ Patient record sync to Supabase failed")
                    else:
                        print("⚠️ User sync to Supabase failed")
                except Exception as e:
                    print(f"❌ Supabase sync error: {e}")
                    # Continue with Django registration even if Supabase fails
                
                # Create token
                token, created = Token.objects.get_or_create(user=user)
                
                return Response({
                    'message': 'Patient registered successfully',
                    'user': UserSerializer(user).data,
                    'patient_id': patient_id,
                    'token': token.key
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_doctor(request):
    """Register a new doctor"""
    try:
        with transaction.atomic():
            # Create user
            user_data = request.data.copy()
            user_data['role'] = 'doctor'
            user_serializer = UserRegistrationSerializer(data=user_data)
            
            if user_serializer.is_valid():
                user = user_serializer.save()
                
                # Create unified doctor profile
                doctor_profile_data = {
                    'qualification': request.data.get('qualification'),
                    'experience_years': request.data.get('experience_years'),
                    'license_number': request.data.get('license_number'),
                    'specialization': request.data.get('specialization'),
                    'bio': request.data.get('bio', ''),
                    'consultation_fee': request.data.get('consultation_fee', 0.00),
                    'languages': request.data.get('languages', []),
                    'consultation_hours': request.data.get('consultation_hours', {}),
                }
                
                # Create unified profile
                unified_profile = UnifiedProfile.objects.create(
                    user=user,
                    profile_type='doctor',
                    profile_data=doctor_profile_data
                )
                
                # Sync user and profile to Supabase with debugging
                try:
                    supabase_user_id = supabase_service.sync_user_to_supabase(user)
                    if supabase_user_id:
                        print(f"✅ User synced to Supabase with ID: {supabase_user_id}")
                        
                        # Sync doctor profile
                        supabase_profile_id = supabase_service.sync_doctor_profile(unified_profile)
                        if supabase_profile_id:
                            print(f"✅ Doctor profile synced to Supabase with ID: {supabase_profile_id}")
                        else:
                            print("⚠️ Doctor profile sync to Supabase failed")
                    else:
                        print("⚠️ User sync to Supabase failed")
                except Exception as e:
                    print(f"❌ Supabase sync error: {e}")
                    # Continue with Django registration even if Supabase fails
                
                # Create token
                token, created = Token.objects.get_or_create(user=user)
                
                return Response({
                    'message': 'Doctor registered successfully',
                    'user': UserSerializer(user).data,
                    'doctor_profile': unified_profile.profile_data,
                    'token': token.key
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def user_login(request):
    """Log in a user"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        # The serializer already validated the user and password
        user = serializer.validated_data['user']
        
        # Create or get token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_logout(request):
    """Log out a user"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except:
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """Get user profile"""
    user = request.user
    profile_data = {
        'user': UserSerializer(user).data
    }
    
    # Add role-specific profile data
    if user.role == 'patient':
        unified_patient = user.unified_patient.first()
        if unified_patient:
            profile_data['patient_data'] = {
                'id': unified_patient.id,  # This is the UnifiedPatient.id needed for diet charts
                'patient_id': unified_patient.patient_id,
                'age': unified_patient.age,
                'bmi': unified_patient.bmi,
                'medical_data': unified_patient.medical_data
            }
        
        profile = user.unified_profile.filter(profile_type='patient').first()
        if profile:
            profile_data['profile_data'] = profile.profile_data
    
    elif user.role == 'doctor':
        profile = user.unified_profile.filter(profile_type='doctor').first()
        if profile:
            profile_data['doctor_data'] = profile.profile_data
    
    return Response(profile_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def supabase_debug(request):
    """Debug Supabase integration status"""
    health_status = supabase_service.get_health_status()
    connection_test = supabase_service.test_connection()
    
    return Response({
        'supabase_health': health_status,
        'connection_test': connection_test,
        'debug_info': {
            'is_available': supabase_service.is_available,
            'client_initialized': supabase_service.client is not None,
            'debug_mode': getattr(supabase_service, 'debug_mode', False)
        }
    }, status=status.HTTP_200_OK)