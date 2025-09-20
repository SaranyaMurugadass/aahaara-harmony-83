"""
Django management command to set up Supabase tables
"""
from django.core.management.base import BaseCommand
from authentication.supabase_service import supabase_service
import os

class Command(BaseCommand):
    help = 'Set up Supabase tables for Aahaara Harmony'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreate tables even if they exist',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up Supabase tables...'))
        
        if not supabase_service.is_available:
            self.stdout.write(self.style.ERROR('Supabase service is not available'))
            return
        
        # Read SQL file
        sql_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'supabase_tables.sql')
        
        try:
            with open(sql_file_path, 'r') as f:
                sql_content = f.read()
            
            # Split SQL into individual statements
            statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
            
            success_count = 0
            error_count = 0
            
            for statement in statements:
                try:
                    # Execute each SQL statement
                    result = supabase_service.client.rpc('exec_sql', {'sql': statement}).execute()
                    success_count += 1
                    self.stdout.write(f'✓ Executed: {statement[:50]}...')
                except Exception as e:
                    error_count += 1
                    self.stdout.write(self.style.WARNING(f'⚠ Warning executing: {statement[:50]}... - {str(e)}'))
            
            self.stdout.write(self.style.SUCCESS(f'\nSetup completed: {success_count} successful, {error_count} warnings'))
            
            # Test the tables
            self.stdout.write('\nTesting table access...')
            self.test_table_access()
            
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'SQL file not found: {sql_file_path}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error setting up tables: {str(e)}'))
    
    def test_table_access(self):
        """Test access to the created tables"""
        try:
            # Test Prakriti analyses table
            prakriti_test = supabase_service.client.table('prakriti_analyses').select('id').limit(1).execute()
            self.stdout.write('✓ prakriti_analyses table accessible')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠ prakriti_analyses table: {str(e)}'))
        
        try:
            # Test Disease analyses table
            disease_test = supabase_service.client.table('disease_analyses').select('id').limit(1).execute()
            self.stdout.write('✓ disease_analyses table accessible')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠ disease_analyses table: {str(e)}'))
        
        try:
            # Test Consultations table
            consultations_test = supabase_service.client.table('consultations').select('id').limit(1).execute()
            self.stdout.write('✓ consultations table accessible')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠ consultations table: {str(e)}'))
