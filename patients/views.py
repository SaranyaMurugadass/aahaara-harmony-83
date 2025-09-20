"""
Views for patient management - Updated for unified structure
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Patient, PrakritiAnalysis, DiseaseAnalysis, Consultation
from .serializers import (
    PatientSerializer, 
    PrakritiAnalysisSerializer, 
    DiseaseAnalysisSerializer,
    ConsultationSerializer,
    ConsultationCreateSerializer
)
from authentication.models import User, UnifiedProfile, UnifiedPatient
from authentication.supabase_service import supabase_service

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_list(request):
    """List patients using unified structure"""
    user = request.user
    
    if user.role == 'doctor':
        # Doctors can see all patients
        patients = UnifiedPatient.objects.all()
    elif user.role == 'patient':
        # Patients can only see their own record
        patients = UnifiedPatient.objects.filter(user=user)
    else:
        patients = UnifiedPatient.objects.none()
    
    # Convert to frontend format
    patient_data = []
    for patient in patients:
        profile = patient.user.unified_profile.filter(profile_type='patient').first()
        
        # Get latest Prakriti analysis
        latest_prakriti = PrakritiAnalysis.objects.filter(patient=patient).order_by('-analysis_date').first()
        prakriti_data = None
        if latest_prakriti:
            prakriti_data = {
                'id': str(latest_prakriti.id),
                'patient': str(latest_prakriti.patient.id),
                'patient_name': patient.user.full_name,
                'primary_dosha': latest_prakriti.primary_dosha,
                'primary_dosha_display': latest_prakriti.get_primary_dosha_display(),
                'secondary_dosha': latest_prakriti.secondary_dosha,
                'vata_score': latest_prakriti.vata_score,
                'pitta_score': latest_prakriti.pitta_score,
                'kapha_score': latest_prakriti.kapha_score,
                'total_score': latest_prakriti.total_score,
                'dosha_percentages': latest_prakriti.dosha_percentages,
                'analysis_notes': latest_prakriti.analysis_notes,
                'recommendations': latest_prakriti.recommendations,
                'status': latest_prakriti.status,
                'analyzed_by': str(latest_prakriti.analyzed_by.id),
                'analyzed_by_name': f"{latest_prakriti.analyzed_by.user.first_name} {latest_prakriti.analyzed_by.user.last_name}".strip(),
                'analysis_date': latest_prakriti.analysis_date.isoformat(),
                'updated_at': latest_prakriti.updated_at.isoformat(),
            }
        
        # Get active diseases
        active_diseases = DiseaseAnalysis.objects.filter(patient=patient, is_active=True)
        diseases_data = []
        for disease in active_diseases:
            diseases_data.append({
                'id': str(disease.id),
                'patient': str(disease.patient.id),
                'patient_name': patient.user.full_name,
                'disease_name': disease.disease_name,
                'icd_code': disease.icd_code,
                'severity': disease.severity,
                'severity_display': disease.get_severity_display(),
                'status': disease.status,
                'status_display': disease.get_status_display(),
                'symptoms': disease.symptoms,
                'diagnosis_notes': disease.diagnosis_notes,
                'treatment_plan': disease.treatment_plan,
                'medications': disease.medications,
                'follow_up_required': disease.follow_up_required,
                'follow_up_date': disease.follow_up_date.isoformat() if disease.follow_up_date else None,
                'diagnosed_by': str(disease.diagnosed_by.id),
                'diagnosed_by_name': f"{disease.diagnosed_by.user.first_name} {disease.diagnosed_by.user.last_name}".strip(),
                'diagnosis_date': disease.diagnosis_date.isoformat(),
                'updated_at': disease.updated_at.isoformat(),
                'is_active': disease.is_active,
            })
        
        patient_info = {
            'id': str(patient.id),
            'patient_id': patient.patient_id,
            'user_name': patient.user.full_name,
            'user_email': patient.user.email,
            'status': patient.status,
            'age': patient.age,
            'gender': profile.get_profile_data('gender', '') if profile else '',
            'blood_type': patient.get_medical_data('blood_type', 'unknown'),
            'height': patient.get_medical_data('height'),
            'weight': patient.get_medical_data('weight'),
            'bmi': patient.bmi,
            'location': profile.get_profile_data('location', '') if profile else '',
            'phone_number': profile.get_profile_data('phone_number', '') if profile else '',
            'date_of_birth': patient.get_medical_data('date_of_birth'),
            'created_at': patient.created_at,
            'updated_at': patient.updated_at,
            'prakriti_analysis': prakriti_data,
            'active_diseases': diseases_data,
        }
        patient_data.append(patient_info)
    
    return Response({
        'results': patient_data,
        'count': len(patient_data),
        'next': None,
        'previous': None
    })

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def patient_detail(request, pk):
    """Retrieve, update, or delete a patient"""
    try:
        # Get unified patient
        unified_patient = get_object_or_404(UnifiedPatient, id=pk)
        user = request.user
        
        # Check permissions
        if user.role == 'patient' and unified_patient.user != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            profile = unified_patient.user.unified_profile.filter(profile_type='patient').first()
            patient_data = {
                'id': unified_patient.id,
                'patient_id': unified_patient.patient_id,
                'user_name': unified_patient.user.full_name,
                'user_email': unified_patient.user.email,
                'status': unified_patient.status,
                'age': unified_patient.age,
                'gender': profile.get_profile_data('gender', '') if profile else '',
                'blood_type': unified_patient.get_medical_data('blood_type', 'unknown'),
                'height': unified_patient.get_medical_data('height'),
                'weight': unified_patient.get_medical_data('weight'),
                'bmi': unified_patient.bmi,
                'location': profile.get_profile_data('location', '') if profile else '',
                'phone_number': profile.get_profile_data('phone_number', '') if profile else '',
                'created_at': unified_patient.created_at,
                'updated_at': unified_patient.updated_at,
            }
            return Response(patient_data)
        
        elif request.method == 'PUT':
            # Update patient data
            profile = unified_patient.user.unified_profile.filter(profile_type='patient').first()
            if profile:
                profile_data = profile.profile_data.copy()
                medical_data = unified_patient.medical_data.copy()
                
                # Update profile data
                if 'gender' in request.data:
                    profile_data['gender'] = request.data['gender']
                if 'location' in request.data:
                    profile_data['location'] = request.data['location']
                if 'phone_number' in request.data:
                    profile_data['phone_number'] = request.data['phone_number']
                
                # Update medical data
                if 'height' in request.data:
                    medical_data['height'] = request.data['height']
                if 'weight' in request.data:
                    medical_data['weight'] = request.data['weight']
                if 'blood_type' in request.data:
                    medical_data['blood_type'] = request.data['blood_type']
                
                profile.profile_data = profile_data
                profile.save()
                
                unified_patient.medical_data = medical_data
                unified_patient.save()
                
                return Response({'message': 'Patient updated successfully'})
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'DELETE':
            if user.role != 'doctor':
                return Response({'error': 'Only doctors can delete patients'}, status=status.HTTP_403_FORBIDDEN)
            unified_patient.delete()
            return Response({'message': 'Patient deleted successfully'})
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def prakriti_analysis_list_create(request, patient_id):
    """List and create Prakriti analyses"""
    try:
        # Get unified patient
        unified_patient = get_object_or_404(UnifiedPatient, id=patient_id)
        user = request.user
        
        # Check permissions
        if user.role == 'patient' and unified_patient.user != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            # Get Prakriti analyses for this patient
            analyses = PrakritiAnalysis.objects.filter(patient=unified_patient)
            serializer = PrakritiAnalysisSerializer(analyses, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create new Prakriti analysis
            if user.role != 'doctor':
                return Response({'error': 'Only doctors can create analyses'}, status=status.HTTP_403_FORBIDDEN)
            
            # Get or create doctor profile
            doctor_profile, created = UnifiedProfile.objects.get_or_create(
                user=user, 
                profile_type='doctor',
                defaults={'profile_data': {}}
            )
            
            # Create analysis
            analysis_data = request.data.copy()
            analysis_data['patient'] = unified_patient.id
            analysis_data['analyzed_by'] = doctor_profile.id
            
            serializer = PrakritiAnalysisSerializer(data=analysis_data)
            if serializer.is_valid():
                analysis = serializer.save()
                
                # Sync to Supabase (optional - don't fail if sync fails)
                try:
                    supabase_service.sync_prakriti_analysis(analysis)
                    print(f"Successfully synced Prakriti analysis {analysis.id} to Supabase")
                except Exception as e:
                    print(f"Warning: Failed to sync Prakriti analysis to Supabase: {e}")
                    # Continue execution - don't fail the API request

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                print(f"Serializer validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def disease_analysis_list_create(request, patient_id):
    """List and create disease analyses"""
    try:
        # Get unified patient
        unified_patient = get_object_or_404(UnifiedPatient, id=patient_id)
        user = request.user
        
        # Check permissions
        if user.role == 'patient' and unified_patient.user != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            # Get disease analyses for this patient
            analyses = DiseaseAnalysis.objects.filter(patient=unified_patient)
            serializer = DiseaseAnalysisSerializer(analyses, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create new disease analysis
            if user.role != 'doctor':
                return Response({'error': 'Only doctors can create analyses'}, status=status.HTTP_403_FORBIDDEN)
            
            # Get or create doctor profile
            doctor_profile, created = UnifiedProfile.objects.get_or_create(
                user=user, 
                profile_type='doctor',
                defaults={'profile_data': {}}
            )
            
            # Create analysis
            analysis_data = request.data.copy()
            analysis_data['patient'] = unified_patient.id
            analysis_data['diagnosed_by'] = doctor_profile.id
            
            serializer = DiseaseAnalysisSerializer(data=analysis_data)
            if serializer.is_valid():
                analysis = serializer.save()
                
                # Sync to Supabase (optional - don't fail if sync fails)
                try:
                    supabase_service.sync_disease_analysis(analysis)
                    print(f"Successfully synced Disease analysis {analysis.id} to Supabase")
                except Exception as e:
                    print(f"Warning: Failed to sync disease analysis to Supabase: {e}")
                    # Continue execution - don't fail the API request

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def consultation_list_create(request, patient_id):
    """List and create consultations"""
    try:
        # Get unified patient
        unified_patient = get_object_or_404(UnifiedPatient, id=patient_id)
        user = request.user
        
        # Check permissions
        if user.role == 'patient' and unified_patient.user != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            # Get consultations for this patient
            consultations = Consultation.objects.filter(patient=unified_patient)
            serializer = ConsultationSerializer(consultations, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create new consultation
            if user.role != 'doctor':
                return Response({'error': 'Only doctors can create consultations'}, status=status.HTTP_403_FORBIDDEN)
            
            # Get doctor profile
            doctor_profile = get_object_or_404(UnifiedProfile, user=user, profile_type='doctor')
            
            # Create consultation
            consultation_data = request.data.copy()
            consultation_data['patient'] = unified_patient.id
            consultation_data['doctor'] = doctor_profile.id
            
            serializer = ConsultationCreateSerializer(data=consultation_data)
            if serializer.is_valid():
                consultation = serializer.save()
                return Response(ConsultationSerializer(consultation).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_patient(request):
    """Create a new patient (for doctors)"""
    try:
        if request.user.role != 'doctor':
            return Response({'error': 'Only doctors can create patients'}, status=status.HTTP_403_FORBIDDEN)
        
        with transaction.atomic():
            # Get user data
            user_data = request.data.get('user', {})
            if not user_data.get('email'):
                return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user already exists
            if User.objects.filter(email=user_data['email']).exists():
                return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user
            user = User.objects.create(
                username=user_data.get('email'),
                email=user_data['email'],
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                role='patient'
            )
            
            # Create unified patient profile
            profile_data = {
                'gender': request.data.get('gender', ''),
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
                profile_data=profile_data
            )
            
            # Create unified patient record
            import uuid
            patient_id = f"PAT-{str(uuid.uuid4())[:8].upper()}"
            medical_data = {
                'date_of_birth': request.data.get('date_of_birth'),
                'blood_type': request.data.get('blood_type', 'unknown'),
                'height': request.data.get('height'),
                'weight': request.data.get('weight'),
            }
            medical_data.update(profile_data)
            
            unified_patient = UnifiedPatient.objects.create(
                user=user,
                patient_id=patient_id,
                medical_data=medical_data
            )
            
            # Sync to Supabase
            try:
                supabase_service.sync_user_to_supabase(user)
                supabase_service.sync_patient_profile(unified_profile)
                supabase_service.sync_patient(unified_patient)
            except Exception as e:
                print(f"Warning: Failed to sync to Supabase: {e}")
            
            return Response({
                'message': 'Patient created successfully',
                'patient_id': patient_id,
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_summary(request, patient_id):
    """Get comprehensive patient summary"""
    user = request.user
    
    # Check permissions
    if user.role == 'patient':
        unified_patient = get_object_or_404(UnifiedPatient, id=patient_id, user=user)
    elif user.role == 'doctor':
        # For doctors, get any patient they have access to
        unified_patient = get_object_or_404(UnifiedPatient, id=patient_id)
    else:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Format patient data for frontend
    patient_data = {
        'id': str(unified_patient.id),
        'patient_id': unified_patient.patient_id,
        'user_name': f"{unified_patient.user.first_name} {unified_patient.user.last_name}".strip(),
        'user_email': unified_patient.user.email,
        'assigned_doctor_name': None,  # Will be set if doctor is assigned
        'status': 'active',
        'registration_date': unified_patient.created_at.isoformat(),
        'last_consultation': None,
        'next_appointment': None,
        'is_active': True,
        'notes': '',
        'display_name': f"{unified_patient.user.first_name} {unified_patient.user.last_name}".strip(),
        'age': unified_patient.age,
        'bmi': unified_patient.bmi,
        'gender': unified_patient.medical_data.get('gender', ''),
        'location': unified_patient.medical_data.get('location', ''),
        'phone_number': unified_patient.medical_data.get('phone_number', ''),
    }
    
    # Get latest Prakriti analysis
    latest_prakriti = PrakritiAnalysis.objects.filter(patient=unified_patient).order_by('-analysis_date').first()
    prakriti_data = None
    if latest_prakriti:
        prakriti_data = {
            'id': str(latest_prakriti.id),
            'patient': str(latest_prakriti.patient.id),
            'patient_name': patient_data['user_name'],
            'primary_dosha': latest_prakriti.primary_dosha,
            'primary_dosha_display': latest_prakriti.get_primary_dosha_display(),
            'secondary_dosha': latest_prakriti.secondary_dosha,
            'vata_score': latest_prakriti.vata_score,
            'pitta_score': latest_prakriti.pitta_score,
            'kapha_score': latest_prakriti.kapha_score,
            'total_score': latest_prakriti.total_score,
            'dosha_percentages': latest_prakriti.dosha_percentages,
            'analysis_notes': latest_prakriti.analysis_notes,
            'recommendations': latest_prakriti.recommendations,
            'status': latest_prakriti.status,
            'analyzed_by': str(latest_prakriti.analyzed_by.id),
            'analyzed_by_name': f"{latest_prakriti.analyzed_by.user.first_name} {latest_prakriti.analyzed_by.user.last_name}".strip(),
            'analysis_date': latest_prakriti.analysis_date.isoformat(),
            'updated_at': latest_prakriti.updated_at.isoformat(),
        }
    
    # Get active diseases
    active_diseases = DiseaseAnalysis.objects.filter(patient=unified_patient, is_active=True)
    diseases_data = []
    for disease in active_diseases:
        diseases_data.append({
            'id': str(disease.id),
            'patient': str(disease.patient.id),
            'patient_name': patient_data['user_name'],
            'disease_name': disease.disease_name,
            'icd_code': disease.icd_code,
            'severity': disease.severity,
            'severity_display': disease.get_severity_display(),
            'status': disease.status,
            'status_display': disease.get_status_display(),
            'symptoms': disease.symptoms,
            'diagnosis_notes': disease.diagnosis_notes,
            'treatment_plan': disease.treatment_plan,
            'medications': disease.medications,
            'follow_up_required': disease.follow_up_required,
            'follow_up_date': disease.follow_up_date.isoformat() if disease.follow_up_date else None,
            'diagnosed_by': str(disease.diagnosed_by.id),
            'diagnosed_by_name': f"{disease.diagnosed_by.user.first_name} {disease.diagnosed_by.user.last_name}".strip(),
            'diagnosis_date': disease.diagnosis_date.isoformat(),
            'updated_at': disease.updated_at.isoformat(),
            'is_active': disease.is_active,
        })
    
    # Get recent consultations
    recent_consultations = Consultation.objects.filter(patient=unified_patient).order_by('-consultation_date')[:5]
    consultations_data = []
    for consultation in recent_consultations:
        consultations_data.append({
            'id': consultation.id,
            'patient': consultation.patient.id,
            'patient_name': patient_data['user_name'],
            'doctor': consultation.doctor.id,
            'doctor_name': f"{consultation.doctor.first_name} {consultation.doctor.last_name}".strip(),
            'consultation_type': consultation.consultation_type,
            'consultation_type_display': consultation.get_consultation_type_display(),
            'status': consultation.status,
            'status_display': consultation.get_status_display(),
            'chief_complaint': consultation.chief_complaint,
            'history_of_present_illness': consultation.history_of_present_illness,
            'physical_examination': consultation.physical_examination,
            'vital_signs': consultation.vital_signs,
            'assessment': consultation.assessment,
            'plan': consultation.plan,
            'prescription': consultation.prescription,
            'recommendations': consultation.recommendations,
            'follow_up_date': consultation.follow_up_date.isoformat() if consultation.follow_up_date else None,
            'consultation_date': consultation.consultation_date.isoformat(),
            'actual_start_time': consultation.actual_start_time.isoformat() if consultation.actual_start_time else None,
            'actual_end_time': consultation.actual_end_time.isoformat() if consultation.actual_end_time else None,
            'duration_minutes': consultation.duration_minutes,
            'actual_duration': consultation.actual_duration,
            'consultation_fee': consultation.consultation_fee,
            'payment_status': consultation.payment_status,
            'notes': consultation.notes,
        })
    
    return Response({
        'patient': patient_data,
        'prakriti_analysis': prakriti_data,
        'active_diseases': diseases_data,
        'recent_consultations': consultations_data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_doctor(request, patient_id):
    """Assign a doctor to a patient"""
    if request.user.role != 'doctor':
        return Response({'error': 'Only doctors can assign patients'}, status=status.HTTP_403_FORBIDDEN)
    
    patient = get_object_or_404(Patient, id=patient_id)
    doctor_profile = get_object_or_404(DoctorProfile, user=request.user)
    
    patient.assigned_doctor = doctor_profile
    patient.save()
    
    return Response({
        'message': 'Doctor assigned successfully',
        'patient': PatientSerializer(patient).data
    }, status=status.HTTP_200_OK)