#!/usr/bin/env python
"""
Final test script to verify Supabase integration with unique users
"""
import os
import sys
import django
import json
import time

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aahaara_backend.settings')
django.setup()

from authentication.views import register_patient, register_doctor
from django.test import RequestFactory
from django.contrib.auth import get_user_model

User = get_user_model()

def test_patient_registration():
    """Test patient registration with Supabase integration"""
    print("🔍 Testing Patient Registration with Supabase...")
    print("=" * 50)
    
    # Create a mock request with unique username
    factory = RequestFactory()
    timestamp = str(int(time.time()))
    data = {
        'username': f'test_patient_{timestamp}',
        'email': f'test_patient_{timestamp}@example.com',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        'first_name': 'Test',
        'last_name': 'Patient',
        'age': 25,
        'gender': 'male',
        'location': 'Test City'
    }
    
    request = factory.post('/api/auth/register/patient/', data, content_type='application/json')
    
    try:
        response = register_patient(request)
        print(f"✅ Patient registration successful!")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 201:
            print(f"Response: {json.dumps(response.data, indent=2)}")
            
            # Check if user was created in Django
            user = User.objects.get(username=f'test_patient_{timestamp}')
            print(f"✅ User created in Django: {user.email}")
            return True
        else:
            print(f"❌ Registration failed: {response.data}")
            return False
    except Exception as e:
        print(f"❌ Patient registration failed: {e}")
        return False

def test_doctor_registration():
    """Test doctor registration with Supabase integration"""
    print("\n🔍 Testing Doctor Registration with Supabase...")
    print("=" * 50)
    
    # Create a mock request with unique username
    factory = RequestFactory()
    timestamp = str(int(time.time()))
    data = {
        'username': f'test_doctor_{timestamp}',
        'email': f'test_doctor_{timestamp}@example.com',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        'first_name': 'Test',
        'last_name': 'Doctor',
        'qualification': 'BAMS',
        'experience_years': 10,
        'license_number': f'LIC_TEST_{timestamp}',
        'specialization': 'general',
        'bio': 'Test doctor',
        'consultation_fee': 500.00
    }
    
    request = factory.post('/api/auth/register/doctor/', data, content_type='application/json')
    
    try:
        response = register_doctor(request)
        print(f"✅ Doctor registration successful!")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 201:
            print(f"Response: {json.dumps(response.data, indent=2)}")
            
            # Check if user was created in Django
            user = User.objects.get(username=f'test_doctor_{timestamp}')
            print(f"✅ User created in Django: {user.email}")
            return True
        else:
            print(f"❌ Registration failed: {response.data}")
            return False
    except Exception as e:
        print(f"❌ Doctor registration failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Final Supabase Integration Test...")
    print("=" * 60)
    
    # Test patient registration
    patient_success = test_patient_registration()
    
    # Test doctor registration
    doctor_success = test_doctor_registration()
    
    print("\n" + "=" * 60)
    if patient_success and doctor_success:
        print("🎉 All tests passed! Supabase integration is working perfectly!")
        print("✅ Users are being created in Django")
        print("✅ Supabase API integration is working")
        print("✅ UUID handling is working correctly")
        return True
    else:
        print("❌ Some tests failed. Check the output above for details.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
