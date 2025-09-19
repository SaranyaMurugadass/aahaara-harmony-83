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
            test_response = self.client.table('users').select('id').limit(1).execute()
            self.is_available = True
            
            if self.debug_mode:
                logger.info("✅ Supabase client initialized successfully")
                logger.info(f"Supabase URL: {supabase_url}")
                logger.info(f"Supabase Key: {supabase_key[:10]}...")
            
        except ImportError as e:
            logger.error(f"❌ Supabase package not installed: {e}")
            self.is_available = False
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {e}")
            self.is_available = False
    
    def _log_operation(self, operation: str, data: Dict = None, success: bool = True, error: str = None):
        """Log Supabase operations for debugging"""
        if not self.debug_mode:
            return
        
        status = "✅" if success else "❌"
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
            existing_user = self.client.table('users').select('id').eq('django_id', user.id).execute()
            
            if existing_user.data:
                # Update existing user
                response = self.client.table('users').update(user_data).eq('django_id', user.id).execute()
                self._log_operation("update_user", user_data, success=True)
                return existing_user.data[0]['id']
            else:
                # Create new user
                response = self.client.table('users').insert(user_data).execute()
                self._log_operation("create_user", user_data, success=True)
                return user_uuid
            
        except Exception as e:
            self._log_operation("sync_user", user_data if 'user_data' in locals() else {}, success=False, error=str(e))
            logger.error(f"Failed to sync user {user.id} to Supabase: {e}")
            return None
    
    def sync_doctor_profile(self, doctor_profile) -> Optional[str]:
        """Sync Django doctor profile to Supabase"""
        if not self.is_available:
            self._log_operation("sync_doctor_profile", success=False, error="Supabase not available")
            return None
        
        try:
            import uuid
            profile_uuid = str(uuid.uuid4())
            
            profile_data = {
                'id': profile_uuid,
                'django_id': doctor_profile.id,
                'django_user_id': doctor_profile.user.id,
                'qualification': doctor_profile.qualification,
                'experience_years': doctor_profile.experience_years,
                'license_number': doctor_profile.license_number,
                'specialization': doctor_profile.specialization,
                'bio': doctor_profile.bio,
                'consultation_fee': float(doctor_profile.consultation_fee),
                'created_at': timezone.now().isoformat(),
                'updated_at': timezone.now().isoformat()
            }
            
            # Check if profile already exists by django_id
            existing_profile = self.client.table('doctor_profiles').select('id').eq('django_id', doctor_profile.id).execute()
            
            if existing_profile.data:
                # Update existing profile
                response = self.client.table('doctor_profiles').update(profile_data).eq('django_id', doctor_profile.id).execute()
                self._log_operation("update_doctor_profile", profile_data, success=True)
                return existing_profile.data[0]['id']
            else:
                # Create new profile
                response = self.client.table('doctor_profiles').insert(profile_data).execute()
                self._log_operation("create_doctor_profile", profile_data, success=True)
                return profile_uuid
            
        except Exception as e:
            self._log_operation("sync_doctor_profile", profile_data if 'profile_data' in locals() else {}, success=False, error=str(e))
            logger.error(f"Failed to sync doctor profile {doctor_profile.id} to Supabase: {e}")
            return None
    
    def sync_patient_profile(self, patient_profile) -> Optional[str]:
        """Sync Django patient profile to Supabase"""
        if not self.is_available:
            self._log_operation("sync_patient_profile", success=False, error="Supabase not available")
            return None
        
        try:
            import uuid
            profile_uuid = str(uuid.uuid4())
            
            profile_data = {
                'id': profile_uuid,
                'django_id': patient_profile.id,
                'django_user_id': patient_profile.user.id,
                'age': patient_profile.age,
                'gender': patient_profile.gender,
                'location': patient_profile.location,
                'phone_number': patient_profile.phone_number,
                'created_at': timezone.now().isoformat(),
                'updated_at': timezone.now().isoformat()
            }
            
            # Check if profile already exists by django_id
            existing_profile = self.client.table('patient_profiles').select('id').eq('django_id', patient_profile.id).execute()
            
            if existing_profile.data:
                # Update existing profile
                response = self.client.table('patient_profiles').update(profile_data).eq('django_id', patient_profile.id).execute()
                self._log_operation("update_patient_profile", profile_data, success=True)
                return existing_profile.data[0]['id']
            else:
                # Create new profile
                response = self.client.table('patient_profiles').insert(profile_data).execute()
                self._log_operation("create_patient_profile", profile_data, success=True)
                return profile_uuid
            
        except Exception as e:
            self._log_operation("sync_patient_profile", profile_data if 'profile_data' in locals() else {}, success=False, error=str(e))
            logger.error(f"Failed to sync patient profile {patient_profile.id} to Supabase: {e}")
            return None
    
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