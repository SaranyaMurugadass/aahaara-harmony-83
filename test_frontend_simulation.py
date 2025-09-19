#!/usr/bin/env python
"""
Test script to simulate frontend requests and debug 400 errors
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000/api/auth"

def test_patient_registration():
    """Test patient registration with frontend-like data"""
    print("🔍 Testing Patient Registration (Frontend Simulation)...")
    
    timestamp = str(int(time.time()))
    data = {
        "username": f"frontend_patient_{timestamp}",
        "email": f"frontend_patient_{timestamp}@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Frontend",
        "last_name": "Test",
        "age": 25,
        "gender": "male",
        "location": "Test City",
        "phone_number": "1234567890"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register/patient/", json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("✅ Patient registration successful!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"❌ Patient registration failed!")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Is the Django server running?")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_doctor_registration():
    """Test doctor registration with frontend-like data"""
    print("\n🔍 Testing Doctor Registration (Frontend Simulation)...")
    
    timestamp = str(int(time.time()))
    data = {
        "username": f"frontend_doctor_{timestamp}",
        "email": f"frontend_doctor_{timestamp}@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Frontend",
        "last_name": "Doctor",
        "qualification": "BAMS",
        "experience_years": 10,
        "license_number": f"LIC_FRONTEND_{timestamp}",
        "specialization": "general",
        "bio": "Frontend test doctor",
        "consultation_fee": 500.00
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register/doctor/", json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("✅ Doctor registration successful!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"❌ Doctor registration failed!")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Is the Django server running?")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_login():
    """Test login with frontend-like data"""
    print("\n🔍 Testing Login (Frontend Simulation)...")
    
    data = {
        "email": "frontend_patient_123@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login/", json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"❌ Login failed!")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Is the Django server running?")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_server_health():
    """Test if server is running"""
    print("🔍 Testing Server Health...")
    
    try:
        response = requests.get("http://localhost:8000/api/auth/supabase-debug/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ Server is running!")
            return True
        else:
            print(f"⚠️ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running!")
        return False
    except Exception as e:
        print(f"❌ Error checking server: {e}")
        return False

def main():
    print("🚀 Frontend Simulation Test")
    print("=" * 50)
    
    # Test server health first
    if not test_server_health():
        print("\n❌ Server is not running. Please start Django server first.")
        return
    
    # Test registrations
    patient_success = test_patient_registration()
    doctor_success = test_doctor_registration()
    
    # Test login
    login_success = test_login()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"✅ Server Health: {'PASS' if test_server_health() else 'FAIL'}")
    print(f"✅ Patient Registration: {'PASS' if patient_success else 'FAIL'}")
    print(f"✅ Doctor Registration: {'PASS' if doctor_success else 'FAIL'}")
    print(f"✅ Login: {'PASS' if login_success else 'FAIL'}")
    
    if all([patient_success, doctor_success, login_success]):
        print("\n🎉 All tests passed! Your API is working correctly.")
        print("💡 If you're still getting 400 errors in the frontend,")
        print("   check the browser console for more details.")
    else:
        print("\n❌ Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
