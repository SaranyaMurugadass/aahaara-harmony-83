"""
Views for patient management - Updated for unified structure
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
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
        patient_info = {
            'id': patient.id,
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
            'created_at': patient.created_at,
            'updated_at': patient.updated_at,
        }
        patient_data.append(patient_info)
    
    return Response({
        'results': patient_data,
        'count': len(patient_data),
        'next': None,
        'previous': None
    })

class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a patient"""
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor':
            return Patient.objects.filter(assigned_doctor__user=user)
        elif user.role == 'patient':
            return Patient.objects.filter(user=user)
        return Patient.objects.none()

class PrakritiAnalysisListCreateView(generics.ListCreateAPIView):
    """List and create Prakriti analyses"""
    serializer_class = PrakritiAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        user = self.request.user
        
        if user.role == 'doctor':
            return PrakritiAnalysis.objects.filter(patient_id=patient_id)
        elif user.role == 'patient':
            return PrakritiAnalysis.objects.filter(patient__user=user, patient_id=patient_id)
        return PrakritiAnalysis.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'doctor':
            doctor_profile = get_object_or_404(DoctorProfile, user=self.request.user)
            prakriti_analysis = serializer.save(analyzed_by=doctor_profile)
            # Sync to Supabase
            try:
                supabase_service.sync_prakriti_analysis(prakriti_analysis)
            except Exception as e:
                print(f"Warning: Failed to sync Prakriti analysis to Supabase: {e}")

class DiseaseAnalysisListCreateView(generics.ListCreateAPIView):
    """List and create disease analyses"""
    serializer_class = DiseaseAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        user = self.request.user
        
        if user.role == 'doctor':
            return DiseaseAnalysis.objects.filter(patient_id=patient_id)
        elif user.role == 'patient':
            return DiseaseAnalysis.objects.filter(patient__user=user, patient_id=patient_id)
        return DiseaseAnalysis.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'doctor':
            doctor_profile = get_object_or_404(DoctorProfile, user=self.request.user)
            serializer.save(diagnosed_by=doctor_profile)

class ConsultationListCreateView(generics.ListCreateAPIView):
    """List and create consultations"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConsultationCreateSerializer
        return ConsultationSerializer
    
    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        user = self.request.user
        
        if user.role == 'doctor':
            return Consultation.objects.filter(patient_id=patient_id)
        elif user.role == 'patient':
            return Consultation.objects.filter(patient__user=user, patient_id=patient_id)
        return Consultation.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'doctor':
            doctor_profile = get_object_or_404(DoctorProfile, user=self.request.user)
            serializer.save(doctor=doctor_profile)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_summary(request, patient_id):
    """Get comprehensive patient summary"""
    user = request.user
    
    # Check permissions
    if user.role == 'patient':
        patient = get_object_or_404(Patient, id=patient_id, user=user)
    elif user.role == 'doctor':
        patient = get_object_or_404(Patient, id=patient_id, assigned_doctor__user=user)
    else:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get patient data
    patient_data = PatientSerializer(patient).data
    
    # Get latest Prakriti analysis
    latest_prakriti = PrakritiAnalysis.objects.filter(patient=patient).order_by('-analysis_date').first()
    prakriti_data = PrakritiAnalysisSerializer(latest_prakriti).data if latest_prakriti else None
    
    # Get active diseases
    active_diseases = DiseaseAnalysis.objects.filter(patient=patient, is_active=True)
    diseases_data = DiseaseAnalysisSerializer(active_diseases, many=True).data
    
    # Get recent consultations
    recent_consultations = Consultation.objects.filter(patient=patient).order_by('-consultation_date')[:5]
    consultations_data = ConsultationSerializer(recent_consultations, many=True).data
    
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