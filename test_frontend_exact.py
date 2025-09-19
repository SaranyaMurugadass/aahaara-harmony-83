#!/usr/bin/env python
"""
Test with exact frontend data structure
"""
import requests
import json
import time

def test_doctor_registration_exact():
    """Test with exact frontend data structure"""
    print("🔍 Testing Doctor Registration with Exact Frontend Data...")
    
    timestamp = str(int(time.time()))
    
    # This is exactly what the frontend would send
    data = {
        "username": f"frontend_exact_{timestamp}",
        "email": f"frontend_exact_{timestamp}@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Frontend",
        "last_name": "Exact",
        "qualification": "BAMS",
        "experience_years": 10,
        "license_number": f"LIC_EXACT_{timestamp}",
        "specialization": "general",
        "bio": "Frontend exact test",
        "consultation_fee": 500.00
    }
    
    print(f"📤 Sending data: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/register/doctor/",
            json=data,
            headers={
                "Origin": "http://localhost:8080",
                "Content-Type": "application/json"
            }
        )
        
        print(f"📥 Status Code: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("✅ Doctor registration successful!")
            print(f"📥 Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"❌ Doctor registration failed!")
            print(f"📥 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_missing_fields():
    """Test what happens with missing fields"""
    print("\n🔍 Testing Missing Fields...")
    
    # Test with missing required fields
    data = {
        "username": "missing_fields",
        "email": "missing@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Missing",
        "last_name": "Fields"
        # Missing: qualification, experience_years, license_number, specialization
    }
    
    print(f"📤 Sending incomplete data: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/register/doctor/",
            json=data,
            headers={
                "Origin": "http://localhost:8080",
                "Content-Type": "application/json"
            }
        )
        
        print(f"📥 Status Code: {response.status_code}")
        print(f"📥 Response: {response.text}")
        
        if response.status_code == 400:
            print("✅ Got expected 400 error for missing fields")
            return True
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_form_data_vs_json():
    """Test form data vs JSON"""
    print("\n🔍 Testing Form Data vs JSON...")
    
    data = {
        "username": "form_test",
        "email": "form_test@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Form",
        "last_name": "Test",
        "qualification": "BAMS",
        "experience_years": 10,
        "license_number": "LIC_FORM",
        "specialization": "general",
        "bio": "Form test",
        "consultation_fee": 500.00
    }
    
    # Test with form data (like HTML form would send)
    print("📤 Testing with form data...")
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/register/doctor/",
            data=data,  # form data instead of json
            headers={
                "Origin": "http://localhost:8080",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        )
        
        print(f"📥 Form Data Status: {response.status_code}")
        print(f"📥 Form Data Response: {response.text}")
        
    except Exception as e:
        print(f"❌ Form data error: {e}")
    
    # Test with JSON
    print("\n📤 Testing with JSON...")
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/register/doctor/",
            json=data,  # JSON data
            headers={
                "Origin": "http://localhost:8080",
                "Content-Type": "application/json"
            }
        )
        
        print(f"📥 JSON Status: {response.status_code}")
        print(f"📥 JSON Response: {response.text}")
        
    except Exception as e:
        print(f"❌ JSON error: {e}")

def main():
    print("🚀 Frontend Exact Test")
    print("=" * 50)
    
    # Test exact frontend data
    exact_success = test_doctor_registration_exact()
    
    # Test missing fields
    missing_success = test_missing_fields()
    
    # Test form data vs JSON
    test_form_data_vs_json()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"✅ Exact Frontend Data: {'PASS' if exact_success else 'FAIL'}")
    print(f"✅ Missing Fields Test: {'PASS' if missing_success else 'FAIL'}")
    
    if exact_success:
        print("\n🎉 Frontend data structure is correct!")
        print("💡 The issue might be:")
        print("   1. Frontend not sending the request properly")
        print("   2. Form validation failing")
        print("   3. Network issues")
        print("   4. Browser cache")
    else:
        print("\n❌ There's an issue with the data structure.")

if __name__ == "__main__":
    main()
