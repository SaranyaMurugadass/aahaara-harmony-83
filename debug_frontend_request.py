#!/usr/bin/env python
"""
Debug script to capture and analyze frontend requests
"""
import json
import time
from django.test import RequestFactory
from django.http import JsonResponse
from authentication.views import register_doctor, register_patient

def debug_doctor_registration():
    """Debug doctor registration with detailed logging"""
    print("🔍 Debugging Doctor Registration...")
    
    # Simulate frontend request
    factory = RequestFactory()
    data = {
        'username': 'debug_doctor',
        'email': 'debug_doctor@example.com',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        'first_name': 'Debug',
        'last_name': 'Doctor',
        'qualification': 'BAMS',
        'experience_years': 10,
        'license_number': 'LIC_DEBUG',
        'specialization': 'general',
        'bio': 'Debug doctor',
        'consultation_fee': 500.00
    }
    
    print(f"📤 Sending data: {json.dumps(data, indent=2)}")
    
    # Create request
    request = factory.post('/api/auth/register/doctor/', data, content_type='application/json')
    
    # Call the view
    response = register_doctor(request)
    
    print(f"📥 Response status: {response.status_code}")
    print(f"📥 Response data: {response.data}")
    
    return response.status_code == 201

def debug_patient_registration():
    """Debug patient registration with detailed logging"""
    print("\n🔍 Debugging Patient Registration...")
    
    # Simulate frontend request
    factory = RequestFactory()
    data = {
        'username': 'debug_patient',
        'email': 'debug_patient@example.com',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        'first_name': 'Debug',
        'last_name': 'Patient',
        'age': 25,
        'gender': 'male',
        'location': 'Debug City',
        'phone_number': '1234567890'
    }
    
    print(f"📤 Sending data: {json.dumps(data, indent=2)}")
    
    # Create request
    request = factory.post('/api/auth/register/patient/', data, content_type='application/json')
    
    # Call the view
    response = register_patient(request)
    
    print(f"📥 Response status: {response.status_code}")
    print(f"📥 Response data: {response.data}")
    
    return response.status_code == 201

if __name__ == "__main__":
    print("🚀 Frontend Request Debugging")
    print("=" * 50)
    
    # Test doctor registration
    doctor_success = debug_doctor_registration()
    
    # Test patient registration  
    patient_success = debug_patient_registration()
    
    print("\n" + "=" * 50)
    print("📊 Debug Results:")
    print(f"✅ Doctor Registration: {'PASS' if doctor_success else 'FAIL'}")
    print(f"✅ Patient Registration: {'PASS' if patient_success else 'FAIL'}")
    
    if doctor_success and patient_success:
        print("\n🎉 All registrations working! The issue might be:")
        print("   1. CORS configuration")
        print("   2. Frontend sending wrong data format")
        print("   3. Network connectivity")
        print("   4. Browser cache issues")
    else:
        print("\n❌ Registration issues found. Check the debug output above.")
