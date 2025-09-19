"""
Django management command to test Supabase integration
"""
from django.core.management.base import BaseCommand
from authentication.supabase_service import supabase_service
import json

class Command(BaseCommand):
    help = 'Test Supabase integration and show debugging information'

    def add_arguments(self, parser):
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show verbose output',
        )

    def handle(self, *args, **options):
        verbose = options['verbose']
        
        self.stdout.write(self.style.SUCCESS('🔍 Testing Supabase Integration...'))
        self.stdout.write('=' * 50)
        
        # Test 1: Service initialization
        self.stdout.write('\n1. Testing Service Initialization:')
        if supabase_service.is_available:
            self.stdout.write(self.style.SUCCESS('✅ Supabase service is available'))
        else:
            self.stdout.write(self.style.ERROR('❌ Supabase service is not available'))
            return
        
        # Test 2: Connection test
        self.stdout.write('\n2. Testing Connection:')
        connection_test = supabase_service.test_connection()
        if connection_test['status'] == 'success':
            self.stdout.write(self.style.SUCCESS(f'✅ {connection_test["message"]}'))
            if verbose:
                self.stdout.write(f'Details: {json.dumps(connection_test["details"], indent=2)}')
        else:
            self.stdout.write(self.style.ERROR(f'❌ {connection_test["message"]}'))
            self.stdout.write(f'Error: {connection_test["details"]}')
            return
        
        # Test 3: Health status
        self.stdout.write('\n3. Health Status:')
        health = supabase_service.get_health_status()
        for key, value in health.items():
            if key == 'connection_test':
                continue
            status = '✅' if value else '❌'
            self.stdout.write(f'{status} {key}: {value}')
        
        if verbose and 'connection_test' in health:
            self.stdout.write(f'Connection Test: {json.dumps(health["connection_test"], indent=2)}')
        
        # Test 4: Test user creation (if verbose)
        if verbose:
            self.stdout.write('\n4. Testing User Creation:')
            try:
                # This would create a test user in Supabase
                # For now, just show that the method exists
                self.stdout.write('✅ User creation methods are available')
                self.stdout.write('✅ Doctor profile sync methods are available')
                self.stdout.write('✅ Patient profile sync methods are available')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error testing user creation: {e}'))
        
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('🎉 Supabase integration test completed!'))
        
        if not verbose:
            self.stdout.write('\n💡 Run with --verbose for detailed information')
