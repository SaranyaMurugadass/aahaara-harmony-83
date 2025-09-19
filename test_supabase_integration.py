#!/usr/bin/env python
"""
Test script to verify Supabase integration
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aahaara_backend.settings')
django.setup()

from authentication.supabase_service import supabase_service

def test_supabase_integration():
    """Test Supabase integration"""
    print("🔍 Testing Supabase Integration...")
    print("=" * 50)
    
    # Test 1: Service initialization
    print("\n1. Testing Service Initialization:")
    if supabase_service.is_available:
        print("✅ Supabase service is available")
    else:
        print("❌ Supabase service is not available")
        return False
    
    # Test 2: Connection test
    print("\n2. Testing Connection:")
    connection_test = supabase_service.test_connection()
    if connection_test['status'] == 'success':
        print(f"✅ {connection_test['message']}")
        print(f"Details: {connection_test['details']}")
    else:
        print(f"❌ {connection_test['message']}")
        print(f"Error: {connection_test['details']}")
        return False
    
    # Test 3: Health status
    print("\n3. Health Status:")
    health = supabase_service.get_health_status()
    for key, value in health.items():
        if key == 'connection_test':
            continue
        status = '✅' if value else '❌'
        print(f"{status} {key}: {value}")
    
    print("\n" + "=" * 50)
    print("🎉 Supabase integration test completed successfully!")
    return True

if __name__ == "__main__":
    success = test_supabase_integration()
    sys.exit(0 if success else 1)
