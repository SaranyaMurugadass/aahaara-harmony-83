#!/usr/bin/env python
"""
Startup script for Django backend
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aahaara_backend.settings')
    django.setup()
    
    # Create superuser if it doesn't exist
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    if not User.objects.filter(username='admin').exists():
        print("Creating superuser...")
        User.objects.create_superuser(
            username='admin',
            email='admin@aahaara.com',
            password='admin123',
            role='doctor'
        )
        print("Superuser created: admin/admin123")
    
    # Run the server
    execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000'])
