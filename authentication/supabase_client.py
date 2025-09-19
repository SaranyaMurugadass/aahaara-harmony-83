"""
Supabase client configuration and utilities
"""
import os
from django.conf import settings

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = None

def get_supabase_client():
    """Get Supabase client instance"""
    if not SUPABASE_AVAILABLE:
        print("Warning: Supabase not available, skipping Supabase integration")
        return None
        
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY
    
    if not url or not key:
        print("Warning: Supabase URL and Key not set, skipping Supabase integration")
        return None
    
    try:
        return create_client(url, key)
    except Exception as e:
        print(f"Warning: Failed to create Supabase client: {e}")
        return None

def get_supabase_admin_client():
    """Get Supabase admin client with service role key"""
    if not SUPABASE_AVAILABLE:
        print("Warning: Supabase not available, skipping Supabase integration")
        return None
        
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    
    if not url or not key:
        print("Warning: Supabase URL and Service Role Key not set, skipping Supabase integration")
        return None
    
    try:
        return create_client(url, key)
    except Exception as e:
        print(f"Warning: Failed to create Supabase admin client: {e}")
        return None
