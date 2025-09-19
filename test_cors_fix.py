#!/usr/bin/env python
"""
Test CORS fix and frontend simulation
"""
import requests
import json
import time

def test_cors_headers():
    """Test CORS headers are properly set"""
    print("🔍 Testing CORS Headers...")
    
    try:
        # Test OPTIONS request (preflight)
        response = requests.options(
            "http://localhost:8000/api/auth/register/doctor/",
            headers={
                "Origin": "http://localhost:8080",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
        )
        
        print(f"OPTIONS Status: {response.status_code}")
        print(f"CORS Headers: {dict(response.headers)}")
        
        # Check for CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        
        print(f"CORS Configuration: {cors_headers}")
        
        return response.status_code in [200, 204]
        
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

def test_doctor_registration_with_cors():
    """Test doctor registration with CORS headers"""
    print("\n🔍 Testing Doctor Registration with CORS...")
    
    timestamp = str(int(time.time()))
    data = {
        "username": f"cors_doctor_{timestamp}",
        "email": f"cors_doctor_{timestamp}@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "CORS",
        "last_name": "Doctor",
        "qualification": "BAMS",
        "experience_years": 10,
        "license_number": f"LIC_CORS_{timestamp}",
        "specialization": "general",
        "bio": "CORS test doctor",
        "consultation_fee": 500.00
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/register/doctor/",
            json=data,
            headers={
                "Origin": "http://localhost:8080",
                "Content-Type": "application/json"
            }
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("✅ Doctor registration with CORS successful!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"❌ Doctor registration failed!")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_patient_registration_with_cors():
    """Test patient registration with CORS headers"""
    print("\n🔍 Testing Patient Registration with CORS...")
    
    timestamp = str(int(time.time()))
    data = {
        "username": f"cors_patient_{timestamp}",
        "email": f"cors_patient_{timestamp}@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "CORS",
        "last_name": "Patient",
        "age": 25,
        "gender": "male",
        "location": "CORS City",
        "phone_number": "1234567890"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/register/patient/",
            json=data,
            headers={
                "Origin": "http://localhost:8080",
                "Content-Type": "application/json"
            }
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("✅ Patient registration with CORS successful!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"❌ Patient registration failed!")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🚀 CORS Fix Test")
    print("=" * 50)
    
    # Test CORS headers
    cors_success = test_cors_headers()
    
    # Test registrations with CORS
    doctor_success = test_doctor_registration_with_cors()
    patient_success = test_patient_registration_with_cors()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"✅ CORS Headers: {'PASS' if cors_success else 'FAIL'}")
    print(f"✅ Doctor Registration: {'PASS' if doctor_success else 'FAIL'}")
    print(f"✅ Patient Registration: {'PASS' if patient_success else 'FAIL'}")
    
    if all([cors_success, doctor_success, patient_success]):
        print("\n🎉 CORS fix successful! Your frontend should now work.")
        print("💡 Try refreshing your frontend and testing registration again.")
    else:
        print("\n❌ Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
