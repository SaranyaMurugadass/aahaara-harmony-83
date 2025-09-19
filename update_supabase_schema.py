#!/usr/bin/env python3
"""
Script to update Supabase schema to fix foreign key constraint issues
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
project_dir = Path(__file__).parent
sys.path.insert(0, str(project_dir))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aahaara_backend.settings')
django.setup()

from authentication.supabase_service import SupabaseService

def update_supabase_schema():
    """Update Supabase schema to fix foreign key constraints"""
    print("🔄 Updating Supabase schema...")
    
    service = SupabaseService()
    if not service.is_available:
        print("❌ Supabase service not available")
        return False
    
    try:
        # Drop the existing users table and recreate it
        print("🗑️ Dropping existing users table...")
        service.client.rpc('drop_table_if_exists', {'table_name': 'users'}).execute()
        
        # Create the new users table
        print("🏗️ Creating new users table...")
        create_users_table_sql = """
        CREATE TABLE public.users (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            django_id INTEGER UNIQUE,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            role user_role NOT NULL DEFAULT 'patient',
            password_hash VARCHAR(255),
            is_active BOOLEAN DEFAULT true,
            is_staff BOOLEAN DEFAULT false,
            is_superuser BOOLEAN DEFAULT false,
            date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
        
        # Execute the SQL
        service.client.rpc('exec_sql', {'sql': create_users_table_sql}).execute()
        
        print("✅ Supabase schema updated successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error updating schema: {e}")
        return False

if __name__ == "__main__":
    success = update_supabase_schema()
    if success:
        print("🎉 Schema update completed!")
    else:
        print("💥 Schema update failed!")
        sys.exit(1)
