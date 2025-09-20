"""
Supabase Service for Aahaara Harmony
Comprehensive integration with debugging and error handling
"""
import os
import logging
from typing import Optional, Dict, Any, List
from django.conf import settings
from django.utils import timezone

# Configure logging
logger = logging.getLogger(__name__)

class SupabaseService:
    """Comprehensive Supabase integration service with debugging"""
    
    def __init__(self):
        self.client = None
        self.is_available = False
        self.debug_mode = getattr(settings, 'DEBUG', False)
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client with comprehensive error handling"""
        try:
            from supabase import create_client, Client
            
            supabase_url = getattr(settings, 'SUPABASE_URL', None)
            supabase_key = getattr(settings, 'SUPABASE_KEY', None)
            
            if not supabase_url or not supabase_key:
                logger.warning("Supabase credentials not found in settings")
                self.is_available = False
                return
            
            self.client = create_client(supabase_url, supabase_key)
            
            # Test connection
            test_response = self.client.table('unified_users').select('id').limit(1).execute()
            self.is_available = True
            
            if self.debug_mode:
                logger.info("Supabase client initialized successfully")
                logger.info(f"Supabase URL: {supabase_url}")
                logger.info(f"Supabase Key: {supabase_key[:10]}...")
            
        except ImportError as e:
            logger.error(f"Supabase package not installed: {e}")
            self.is_available = False
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            self.is_available = False
    
    def _log_operation(self, operation: str, data: Dict = None, success: bool = True, error: str = None):
        """Log Supabase operations for debugging"""
        if not self.debug_mode:
            return
        
        status = "SUCCESS" if success else "ERROR"
        logger.info(f"{status} Supabase {operation}")
        
        if data:
            logger.info(f"Data: {data}")
        
        if error:
            logger.error(f"Error: {error}")
    
    def sync_user_to_supabase(self, user) -> Optional[str]:
        """Sync Django user to Supabase with comprehensive error handling"""
        if not self.is_available:
            self._log_operation("sync_user", success=False, error="Supabase not available")
            return None
        
        try:
            import uuid
            # Generate a UUID for Supabase (since Supabase expects UUID format)
            user_uuid = str(uuid.uuid4())
            
            user_data = {
                'id': user_uuid,
                'django_id': user.id,  # Store Django ID for reference
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'created_at': timezone.now().isoformat(),
                'updated_at': timezone.now().isoformat()
            }
            
            # Check if user already exists by django_id
            existing_user = self.client.table('unified_users').select('id').eq('django_id', user.id).execute()
            
            if existing_user.data:
                # Update existing user
                response = self.client.table('unified_users').update(user_data).eq('django_id', user.id).execute()
                self._log_operation("update_user", user_data, success=True)
                return existing_user.data[0]['id']
            else:
                # Create new user
                response = self.client.table('unified_users').insert(user_data).execute()
                self._log_operation("create_user", user_data, success=True)
                return user_uuid
            
        except Exception as e:
            self._log_operation("sync_user", user_data if 'user_data' in locals() else {}, success=False, error=str(e))
            logger.error(f"Failed to sync user {user.id} to Supabase: {e}")
            return None
    
    def sync_doctor_profile(self, unified_profile) -> Optional[str]:
        """Sync Django unified doctor profile to Supabase"""
        if not self.is_available:
            self._log_operation("sync_doctor_profile", success=False, error="Supabase not available")
            return None
        
        try:
            import uuid
            profile_uuid = str(uuid.uuid4())
            
            profile_data = {
                'id': profile_uuid,
                'django_id': unified_profile.id,
                'user_id': unified_profile.user.id,
                'profile_type': unified_profile.profile_type,
                'profile_data': unified_profile.profile_data,
                'created_at': timezone.now().isoformat(),
                'updated_at': timezone.now().isoformat()
            }
            
            # Check if profile already exists by django_id
            existing_profile = self.client.table('unified_profiles').select('id').eq('django_id', unified_profile.id).execute()
            
            if existing_profile.data:
                # Update existing profile
                response = self.client.table('unified_profiles').update(profile_data).eq('django_id', unified_profile.id).execute()
                self._log_operation("update_doctor_profile", profile_data, success=True)
                return existing_profile.data[0]['id']
            else:
                # Create new profile
                response = self.client.table('unified_profiles').insert(profile_data).execute()
                self._log_operation("create_doctor_profile", profile_data, success=True)
                return profile_uuid
            
        except Exception as e:
            self._log_operation("sync_doctor_profile", profile_data if 'profile_data' in locals() else {}, success=False, error=str(e))
            logger.error(f"Failed to sync doctor profile {doctor_profile.id} to Supabase: {e}")
            return None
    
    def sync_patient_profile(self, unified_profile) -> Optional[str]:
        """Sync Django unified patient profile to Supabase"""
        if not self.is_available:
            self._log_operation("sync_patient_profile", success=False, error="Supabase not available")
            return None
        
        try:
            import uuid
            profile_uuid = str(uuid.uuid4())
            
            profile_data = {
                'id': profile_uuid,
                'django_id': unified_profile.id,
                'user_id': unified_profile.user.id,
                'profile_type': unified_profile.profile_type,
                'profile_data': unified_profile.profile_data,
                'created_at': timezone.now().isoformat(),
                'updated_at': timezone.now().isoformat()
            }
            
            # Check if profile already exists by django_id
            existing_profile = self.client.table('unified_profiles').select('id').eq('django_id', unified_profile.id).execute()
            
            if existing_profile.data:
                # Update existing profile
                response = self.client.table('unified_profiles').update(profile_data).eq('django_id', unified_profile.id).execute()
                self._log_operation("update_patient_profile", profile_data, success=True)
                return existing_profile.data[0]['id']
            else:
                # Create new profile
                response = self.client.table('unified_profiles').insert(profile_data).execute()
                self._log_operation("create_patient_profile", profile_data, success=True)
                return profile_uuid
            
        except Exception as e:
            self._log_operation("sync_patient_profile", profile_data if 'profile_data' in locals() else {}, success=False, error=str(e))
            logger.error(f"Failed to sync patient profile {unified_profile.id} to Supabase: {e}")
            return None

    def sync_patient(self, unified_patient) -> Optional[str]:
        """Sync Django unified patient to Supabase"""
        if not self.is_available:
            self._log_operation("sync_patient", success=False, error="Supabase not available")
            return None
        
        try:
            import uuid
            patient_uuid = str(uuid.uuid4())
            
            patient_data = {
                'id': patient_uuid,
                'django_id': unified_patient.id,
                'user_id': unified_patient.user.id,
                'patient_id': unified_patient.patient_id,
                'status': unified_patient.status,
                'medical_data': unified_patient.medical_data,
                'created_at': timezone.now().isoformat(),
                'updated_at': timezone.now().isoformat()
            }
            
            # Check if patient already exists by django_id
            existing_patient = self.client.table('unified_patients').select('id').eq('django_id', unified_patient.id).execute()
            
            if existing_patient.data:
                # Update existing patient
                response = self.client.table('unified_patients').update(patient_data).eq('django_id', unified_patient.id).execute()
                self._log_operation("update_patient", patient_data, success=True)
                return existing_patient.data[0]['id']
            else:
                # Create new patient
                response = self.client.table('unified_patients').insert(patient_data).execute()
                self._log_operation("create_patient", patient_data, success=True)
                return patient_uuid
            
        except Exception as e:
            self._log_operation("sync_patient", patient_data if 'patient_data' in locals() else {}, success=False, error=str(e))
            logger.error(f"Failed to sync patient {unified_patient.id} to Supabase: {e}")
            return None

    def sync_prakriti_analysis(self, prakriti_analysis) -> Optional[str]:
        """Sync Django Prakriti analysis to Supabase"""
        if not self.is_available:
            self._log_operation("sync_prakriti_analysis", success=False, error="Supabase not available")
            return None
        
        try:
            import uuid
            analysis_uuid = str(uuid.uuid4())
            
            # Get patient's Supabase ID
            patient_supabase_id = None
            try:
                patient_response = self.client.table('unified_patients').select('id').eq('django_id', prakriti_analysis.patient.id).execute()
                if patient_response.data:
                    patient_supabase_id = patient_response.data[0]['id']
            except Exception as e:
                logger.warning(f"Could not find patient Supabase ID: {e}")
            
            # Get doctor's Supabase ID
            doctor_supabase_id = None
            try:
                doctor_response = self.client.table('unified_profiles').select('id').eq('django_id', prakriti_analysis.analyzed_by.id).execute()
                if doctor_response.data:
                    doctor_supabase_id = doctor_response.data[0]['id']
            except Exception as e:
                logger.warning(f"Could not find doctor Supabase ID: {e}")
            
            analysis_data = {
                'id': analysis_uuid,
                'django_id': str(prakriti_analysis.id),
                'patient_id': patient_supabase_id,
                'django_patient_id': str(prakriti_analysis.patient.id),
                'primary_dosha': prakriti_analysis.primary_dosha,
                'secondary_dosha': prakriti_analysis.secondary_dosha,
                'vata_score': prakriti_analysis.vata_score,
                'pitta_score': prakriti_analysis.pitta_score,
                'kapha_score': prakriti_analysis.kapha_score,
                'analysis_notes': prakriti_analysis.analysis_notes,
                'recommendations': prakriti_analysis.recommendations,
                'status': prakriti_analysis.status,
                'analyzed_by_id': doctor_supabase_id,
                'django_analyzed_by_id': str(prakriti_analysis.analyzed_by.id),
                'analysis_date': prakriti_analysis.analysis_date.isoformat(),
                'created_at': timezone.now().isoformat(),
                'updated_at': timezone.now().isoformat()
            }
            
            # Check if analysis already exists by django_id
            existing_analysis = self.client.table('prakriti_analyses').select('id').eq('django_id', str(prakriti_analysis.id)).execute()
            
            if existing_analysis.data:
                # Update existing analysis
                response = self.client.table('prakriti_analyses').update(analysis_data).eq('django_id', str(prakriti_analysis.id)).execute()
                self._log_operation("update_prakriti_analysis", analysis_data, success=True)
                return existing_analysis.data[0]['id']
            else:
                # Create new analysis
                response = self.client.table('prakriti_analyses').insert(analysis_data).execute()
                self._log_operation("create_prakriti_analysis", analysis_data, success=True)
                return analysis_uuid
            
        except Exception as e:
            self._log_operation("sync_prakriti_analysis", analysis_data if 'analysis_data' in locals() else {}, success=False, error=str(e))
            logger.error(f"Failed to sync Prakriti analysis {prakriti_analysis.id} to Supabase: {e}")
            return None
    
    def sync_disease_analysis(self, disease_analysis) -> Optional[str]:
        """Sync Django Disease analysis to Supabase"""
        if not self.is_available:
            self._log_operation("sync_disease_analysis", success=False, error="Supabase not available")
            return None
        
        try:
            import uuid
            analysis_uuid = str(uuid.uuid4())
            
            # Get patient's Supabase ID
            patient_supabase_id = None
            try:
                patient_response = self.client.table('unified_patients').select('id').eq('django_id', disease_analysis.patient.id).execute()
                if patient_response.data:
                    patient_supabase_id = patient_response.data[0]['id']
            except Exception as e:
                logger.warning(f"Could not find patient Supabase ID: {e}")
            
            # Get doctor's Supabase ID
            doctor_supabase_id = None
            try:
                doctor_response = self.client.table('unified_profiles').select('id').eq('django_id', disease_analysis.diagnosed_by.id).execute()
                if doctor_response.data:
                    doctor_supabase_id = doctor_response.data[0]['id']
            except Exception as e:
                logger.warning(f"Could not find doctor Supabase ID: {e}")
            
            analysis_data = {
                'id': analysis_uuid,
                'django_id': str(disease_analysis.id),
                'patient_id': patient_supabase_id,
                'django_patient_id': str(disease_analysis.patient.id),
                'disease_name': disease_analysis.disease_name,
                'icd_code': disease_analysis.icd_code,
                'severity': disease_analysis.severity,
                'status': disease_analysis.status,
                'symptoms': disease_analysis.symptoms,
                'diagnosis_notes': disease_analysis.diagnosis_notes,
                'treatment_plan': disease_analysis.treatment_plan,
                'medications': disease_analysis.medications if disease_analysis.medications else [],
                'follow_up_required': disease_analysis.follow_up_required,
                'follow_up_date': disease_analysis.follow_up_date.isoformat() if disease_analysis.follow_up_date else None,
                'diagnosed_by_id': doctor_supabase_id,
                'django_diagnosed_by_id': str(disease_analysis.diagnosed_by.id),
                'diagnosis_date': disease_analysis.diagnosis_date.isoformat(),
                'is_active': disease_analysis.is_active,
                'created_at': timezone.now().isoformat(),
                'updated_at': timezone.now().isoformat()
            }
            
            # Check if analysis already exists by django_id
            existing_analysis = self.client.table('disease_analyses').select('id').eq('django_id', str(disease_analysis.id)).execute()
            
            if existing_analysis.data:
                # Update existing analysis
                response = self.client.table('disease_analyses').update(analysis_data).eq('django_id', str(disease_analysis.id)).execute()
                self._log_operation("update_disease_analysis", analysis_data, success=True)
                return existing_analysis.data[0]['id']
            else:
                # Create new analysis
                response = self.client.table('disease_analyses').insert(analysis_data).execute()
                self._log_operation("create_disease_analysis", analysis_data, success=True)
                return analysis_uuid
            
        except Exception as e:
            self._log_operation("sync_disease_analysis", analysis_data if 'analysis_data' in locals() else {}, success=False, error=str(e))
            logger.error(f"Failed to sync Disease analysis {disease_analysis.id} to Supabase: {e}")
            return None
    
    def get_prakriti_analyses_with_joins(self, patient_django_id: str) -> List[Dict]:
        """Get Prakriti analyses with patient and doctor information using joins"""
        if not self.is_available:
            return []
        
        try:
            response = self.client.table('prakriti_analyses').select("""
                *,
                patient:unified_patients(id, patient_id, status, medical_data),
                doctor:unified_profiles(id, profile_type, profile_data)
            """).eq('django_patient_id', patient_django_id).order('analysis_date', desc=True).execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Failed to get Prakriti analyses with joins: {e}")
            return []
    
    def get_disease_analyses_with_joins(self, patient_django_id: str) -> List[Dict]:
        """Get Disease analyses with patient and doctor information using joins"""
        if not self.is_available:
            return []
        
        try:
            response = self.client.table('disease_analyses').select("""
                *,
                patient:unified_patients(id, patient_id, status, medical_data),
                doctor:unified_profiles(id, profile_type, profile_data)
            """).eq('django_patient_id', patient_django_id).order('diagnosis_date', desc=True).execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Failed to get Disease analyses with joins: {e}")
            return []
    
    def get_patient_analysis_status(self, patient_django_id: str) -> Dict[str, Any]:
        """Get comprehensive analysis status for a patient with verification"""
        if not self.is_available:
            return {'prakriti_completed': False, 'disease_completed': False, 'can_create_diet_chart': False}
        
        try:
            # Get Prakriti analyses
            prakriti_response = self.client.table('prakriti_analyses').select('id, status, analysis_date').eq('django_patient_id', patient_django_id).order('analysis_date', desc=True).execute()
            
            # Get Disease analyses
            disease_response = self.client.table('disease_analyses').select('id, status, diagnosis_date, is_active').eq('django_patient_id', patient_django_id).eq('is_active', True).order('diagnosis_date', desc=True).execute()
            
            prakriti_completed = False
            disease_completed = False
            
            # Check if Prakriti analysis is completed
            if prakriti_response.data:
                latest_prakriti = prakriti_response.data[0]
                prakriti_completed = latest_prakriti['status'] in ['completed', 'reviewed']
            
            # Check if Disease analysis is completed
            if disease_response.data:
                latest_disease = disease_response.data[0]
                disease_completed = latest_disease['status'] in ['active', 'chronic'] and latest_disease['is_active']
            
            return {
                'prakriti_completed': prakriti_completed,
                'disease_completed': disease_completed,
                'can_create_diet_chart': prakriti_completed and disease_completed,
                'prakriti_count': len(prakriti_response.data) if prakriti_response.data else 0,
                'disease_count': len(disease_response.data) if disease_response.data else 0,
                'latest_prakriti': prakriti_response.data[0] if prakriti_response.data else None,
                'latest_disease': disease_response.data[0] if disease_response.data else None
            }
            
        except Exception as e:
            logger.error(f"Failed to get patient analysis status: {e}")
            return {'prakriti_completed': False, 'disease_completed': False, 'can_create_diet_chart': False}
    
    def get_user_from_supabase(self, user_id: str) -> Optional[Dict]:
        """Get user data from Supabase"""
        if not self.is_available:
            return None
        
        try:
            response = self.client.table('users').select('*').eq('id', user_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Failed to get user {user_id} from Supabase: {e}")
            return None
    
    def delete_user_from_supabase(self, user_id: str) -> bool:
        """Delete user from Supabase"""
        if not self.is_available:
            return False
        
        try:
            # Delete related profiles first
            self.client.table('doctor_profiles').delete().eq('user_id', user_id).execute()
            self.client.table('patient_profiles').delete().eq('user_id', user_id).execute()
            
            # Delete user
            self.client.table('users').delete().eq('id', user_id).execute()
            
            self._log_operation("delete_user", {'user_id': user_id}, success=True)
            return True
        except Exception as e:
            self._log_operation("delete_user", {'user_id': user_id}, success=False, error=str(e))
            logger.error(f"Failed to delete user {user_id} from Supabase: {e}")
            return False
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Supabase connection and return status"""
        if not self.is_available:
            return {
                'status': 'error',
                'message': 'Supabase not available',
                'details': 'Client not initialized'
            }
        
        try:
            # Test basic connection
            response = self.client.table('users').select('count').execute()
            
            return {
                'status': 'success',
                'message': 'Supabase connection successful',
                'details': {
                    'tables_accessible': True,
                    'response_time': 'OK'
                }
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': 'Supabase connection failed',
                'details': str(e)
            }
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get comprehensive health status of Supabase integration"""
        return {
            'is_available': self.is_available,
            'client_initialized': self.client is not None,
            'debug_mode': self.debug_mode,
            'connection_test': self.test_connection()
        }

# Global instance
supabase_service = SupabaseService()