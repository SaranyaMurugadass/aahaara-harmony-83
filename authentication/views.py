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
                
                # Create patient profile
                patient_data = {
                    'age': request.data.get('age'),
                    'gender': request.data.get('gender'),
                    'location': request.data.get('location', ''),
                    'phone_number': request.data.get('phone_number', ''),
                }
                
                patient_serializer = PatientProfileSerializer(data=patient_data)
                if patient_serializer.is_valid():
                    patient_profile = patient_serializer.save(user=user)
                    
                    # Sync user to Supabase with debugging
                    try:
                        supabase_user_id = supabase_service.sync_user_to_supabase(user)
                        if supabase_user_id:
                            print(f"✅ User synced to Supabase with ID: {supabase_user_id}")
                            
                            # Sync patient profile
                            supabase_profile_id = supabase_service.sync_patient_profile(patient_profile)
                            if supabase_profile_id:
                                print(f"✅ Patient profile synced to Supabase with ID: {supabase_profile_id}")
                            else:
                                print("⚠️ Patient profile sync to Supabase failed")
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
                        'token': token.key
                    }, status=status.HTTP_201_CREATED)
                else:
                    user.delete() # Rollback user creation if profile fails
                    return Response(patient_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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
                
                # Create doctor profile
                doctor_data = {
                    'qualification': request.data.get('qualification'),
                    'experience_years': request.data.get('experience_years'),
                    'license_number': request.data.get('license_number'),
                    'specialization': request.data.get('specialization'),
                    'bio': request.data.get('bio', ''),
                    'consultation_fee': request.data.get('consultation_fee', 0.00),
                }
                
                doctor_serializer = DoctorProfileSerializer(data=doctor_data)
                if doctor_serializer.is_valid():
                    doctor_profile = doctor_serializer.save(user=user)
                    
                    # Sync user and profile to Supabase with debugging
                    try:
                        supabase_user_id = supabase_service.sync_user_to_supabase(user)
                        if supabase_user_id:
                            print(f"✅ User synced to Supabase with ID: {supabase_user_id}")
                            
                            # Sync doctor profile
                            supabase_profile_id = supabase_service.sync_doctor_profile(doctor_profile)
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
                        'token': token.key
                    }, status=status.HTTP_201_CREATED)
                else:
                    user.delete() # Rollback user creation if profile fails
                    return Response(doctor_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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
    return Response({
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)

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