"""
Django management command to create Supabase tables directly
"""
from django.core.management.base import BaseCommand
from authentication.supabase_service import supabase_service

class Command(BaseCommand):
    help = 'Create Supabase tables for Aahaara Harmony'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating Supabase tables...'))
        
        if not supabase_service.is_available:
            self.stdout.write(self.style.ERROR('Supabase service is not available'))
            return
        
        # Create tables using individual SQL statements
        tables_sql = [
            # Prakriti Analysis Table
            """
            CREATE TABLE IF NOT EXISTS prakriti_analyses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                django_id UUID NOT NULL UNIQUE,
                patient_id UUID REFERENCES unified_patients(id) ON DELETE CASCADE,
                django_patient_id UUID NOT NULL,
                primary_dosha VARCHAR(20) NOT NULL CHECK (primary_dosha IN ('vata', 'pitta', 'kapha', 'vata-pitta', 'vata-kapha', 'pitta-kapha', 'tridosha')),
                secondary_dosha VARCHAR(20) CHECK (secondary_dosha IN ('vata', 'pitta', 'kapha', 'vata-pitta', 'vata-kapha', 'pitta-kapha', 'tridosha')),
                vata_score INTEGER NOT NULL DEFAULT 0,
                pitta_score INTEGER NOT NULL DEFAULT 0,
                kapha_score INTEGER NOT NULL DEFAULT 0,
                analysis_notes TEXT,
                recommendations TEXT,
                status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
                analyzed_by_id UUID REFERENCES unified_profiles(id) ON DELETE CASCADE,
                django_analyzed_by_id UUID NOT NULL,
                analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            
            # Disease Analysis Table
            """
            CREATE TABLE IF NOT EXISTS disease_analyses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                django_id UUID NOT NULL UNIQUE,
                patient_id UUID REFERENCES unified_patients(id) ON DELETE CASCADE,
                django_patient_id UUID NOT NULL,
                disease_name VARCHAR(255) NOT NULL,
                icd_code VARCHAR(20),
                severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
                status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cured', 'chronic')),
                symptoms TEXT NOT NULL,
                diagnosis_notes TEXT,
                treatment_plan TEXT,
                medications JSONB DEFAULT '[]'::jsonb,
                follow_up_required BOOLEAN DEFAULT FALSE,
                follow_up_date DATE,
                diagnosed_by_id UUID REFERENCES unified_profiles(id) ON DELETE CASCADE,
                django_diagnosed_by_id UUID NOT NULL,
                diagnosis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            
            # Consultations Table
            """
            CREATE TABLE IF NOT EXISTS consultations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                django_id UUID NOT NULL UNIQUE,
                patient_id UUID REFERENCES unified_patients(id) ON DELETE CASCADE,
                django_patient_id UUID NOT NULL,
                doctor_id UUID REFERENCES unified_profiles(id) ON DELETE CASCADE,
                django_doctor_id UUID NOT NULL,
                consultation_type VARCHAR(20) NOT NULL CHECK (consultation_type IN ('initial', 'follow_up', 'emergency', 'routine', 'telemedicine', 'diet_review')),
                status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
                chief_complaint TEXT NOT NULL,
                history_of_present_illness TEXT,
                physical_examination TEXT,
                vital_signs JSONB DEFAULT '{}'::jsonb,
                assessment TEXT,
                plan TEXT,
                prescription TEXT,
                recommendations TEXT,
                follow_up_date DATE,
                consultation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                actual_start_time TIMESTAMP WITH TIME ZONE,
                actual_end_time TIMESTAMP WITH TIME ZONE,
                duration_minutes INTEGER DEFAULT 30,
                actual_duration INTEGER,
                consultation_fee DECIMAL(10,2),
                payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'waived')),
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            )
            """
        ]
        
        success_count = 0
        error_count = 0
        
        for i, sql in enumerate(tables_sql):
            try:
                # Use raw SQL execution
                result = supabase_service.client.postgrest.rpc('exec_sql', {'sql': sql}).execute()
                success_count += 1
                table_names = ['prakriti_analyses', 'disease_analyses', 'consultations']
                self.stdout.write(f'✓ Created table: {table_names[i]}')
            except Exception as e:
                error_count += 1
                table_names = ['prakriti_analyses', 'disease_analyses', 'consultations']
                self.stdout.write(self.style.WARNING(f'⚠ Error creating {table_names[i]}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nTable creation completed: {success_count} successful, {error_count} errors'))
        
        # Test table access
        self.stdout.write('\nTesting table access...')
        self.test_table_access()
    
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


