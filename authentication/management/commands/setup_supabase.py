"""
Django management command to set up Supabase database
"""
from django.core.management.base import BaseCommand
from authentication.supabase_service import supabase_service
import os

class Command(BaseCommand):
    help = 'Set up Supabase database with tables and sample data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-tables',
            action='store_true',
            help='Create database tables',
        )
        parser.add_argument(
            '--create-sample-data',
            action='store_true',
            help='Create sample food items',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Run all setup operations',
        )

    def handle(self, *args, **options):
        if not supabase_service.is_available():
            self.stdout.write(
                self.style.ERROR('Supabase is not available. Please check your configuration.')
            )
            return

        if options['all'] or options['create_tables']:
            self.create_tables()
        
        if options['all'] or options['create_sample_data']:
            self.create_sample_data()

    def create_tables(self):
        """Create database tables using SQL files"""
        self.stdout.write('Creating Supabase tables...')
        
        try:
            # Read and execute schema SQL
            schema_file = os.path.join(os.path.dirname(__file__), '../../../supabase_schema.sql')
            if os.path.exists(schema_file):
                with open(schema_file, 'r') as f:
                    schema_sql = f.read()
                
                # Execute schema
                result = supabase_service.client.rpc('exec_sql', {'sql': schema_sql}).execute()
                self.stdout.write(
                    self.style.SUCCESS('Database tables created successfully!')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('Schema file not found. Please run the SQL manually in Supabase dashboard.')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating tables: {e}')
            )

    def create_sample_data(self):
        """Create sample food items"""
        self.stdout.write('Creating sample food items...')
        
        try:
            success = supabase_service.create_sample_food_items()
            if success:
                self.stdout.write(
                    self.style.SUCCESS('Sample food items created successfully!')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('Could not create sample food items.')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating sample data: {e}')
            )
