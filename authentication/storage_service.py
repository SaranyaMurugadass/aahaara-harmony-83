"""
Supabase Storage Service for Aahaara Harmony
Handles file uploads, downloads, and management for patient reports
"""
import os
import logging
from typing import Optional, Dict, Any, List, BinaryIO
from django.conf import settings
from django.utils import timezone
from datetime import datetime
import uuid

# Configure logging
logger = logging.getLogger(__name__)

class SupabaseStorageService:
    """Supabase Storage integration service for file management"""
    
    def __init__(self):
        self.client = None
        self.is_available = False
        self.debug_mode = getattr(settings, 'DEBUG', False)
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client with storage capabilities"""
        try:
            from supabase import create_client, Client
            
            supabase_url = getattr(settings, 'SUPABASE_URL', None)
            supabase_key = getattr(settings, 'SUPABASE_KEY', None)
            
            if not supabase_url or not supabase_key:
                logger.warning("Supabase credentials not found in settings")
                self.is_available = False
                return
            
            self.client = create_client(supabase_url, supabase_key)
            self.is_available = True
            
            if self.debug_mode:
                logger.info("Supabase Storage client initialized successfully")
                logger.info(f"Supabase URL: {supabase_url}")
                logger.info(f"Supabase Key: {supabase_key[:10]}...")
            
        except ImportError as e:
            logger.error(f"Supabase package not installed: {e}")
            self.is_available = False
        except Exception as e:
            logger.error(f"Failed to initialize Supabase Storage client: {e}")
            self.is_available = False
    
    def upload_report_file(self, file_content: bytes, file_name: str, patient_id: str, 
                          report_type: str, file_type: str = None) -> Dict[str, Any]:
        """
        Upload a patient report file to Supabase storage
        
        Args:
            file_content: The file content as bytes
            file_name: Original file name
            patient_id: Patient ID for organizing files
            report_type: Type of report (blood-test, xray, etc.)
            file_type: MIME type of the file
            
        Returns:
            Dict containing upload result with file path and metadata
        """
        if not self.is_available:
            raise Exception("Supabase Storage service not available")
        
        try:
            # Generate unique file path
            file_extension = os.path.splitext(file_name)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            # Create organized path: patient_id/report_type/year/month/filename
            now = datetime.now()
            file_path = f"{patient_id}/{report_type}/{now.year}/{now.month:02d}/{unique_filename}"
            
            # Upload to Supabase storage
            result = self.client.storage.from_("REPORT").upload(
                path=file_path,
                file=file_content,
                file_options={
                    "content-type": file_type or "application/octet-stream",
                    "cache-control": "3600",
                    "upsert": False
                }
            )
            
            if result.get('error'):
                raise Exception(f"Upload failed: {result['error']}")
            
            # Get public URL
            public_url = self.client.storage.from_("REPORT").get_public_url(file_path)
            
            upload_result = {
                'success': True,
                'file_path': file_path,
                'public_url': public_url,
                'file_name': file_name,
                'unique_filename': unique_filename,
                'file_size': len(file_content),
                'uploaded_at': timezone.now().isoformat(),
                'patient_id': patient_id,
                'report_type': report_type
            }
            
            if self.debug_mode:
                logger.info(f"File uploaded successfully: {file_path}")
            
            return upload_result
            
        except Exception as e:
            logger.error(f"Failed to upload file: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def download_report_file(self, file_path: str) -> Dict[str, Any]:
        """
        Download a file from Supabase storage
        
        Args:
            file_path: Path to the file in storage
            
        Returns:
            Dict containing file content and metadata
        """
        if not self.is_available:
            raise Exception("Supabase Storage service not available")
        
        try:
            # Download file from storage
            result = self.client.storage.from_("REPORT").download(file_path)
            
            if result.get('error'):
                raise Exception(f"Download failed: {result['error']}")
            
            return {
                'success': True,
                'file_content': result,
                'file_path': file_path
            }
            
        except Exception as e:
            logger.error(f"Failed to download file: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_report_file(self, file_path: str) -> Dict[str, Any]:
        """
        Delete a file from Supabase storage
        
        Args:
            file_path: Path to the file in storage
            
        Returns:
            Dict containing deletion result
        """
        if not self.is_available:
            raise Exception("Supabase Storage service not available")
        
        try:
            # Delete file from storage
            result = self.client.storage.from_("REPORT").remove([file_path])
            
            if result.get('error'):
                raise Exception(f"Delete failed: {result['error']}")
            
            return {
                'success': True,
                'file_path': file_path,
                'deleted_at': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to delete file: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_report_files(self, patient_id: str, report_type: str = None) -> Dict[str, Any]:
        """
        List files for a patient from Supabase storage
        
        Args:
            patient_id: Patient ID to list files for
            report_type: Optional report type filter
            
        Returns:
            Dict containing list of files
        """
        if not self.is_available:
            raise Exception("Supabase Storage service not available")
        
        try:
            # Build search path
            search_path = patient_id
            if report_type:
                search_path = f"{patient_id}/{report_type}"
            
            # List files in storage
            result = self.client.storage.from_("REPORT").list(search_path)
            
            if result.get('error'):
                raise Exception(f"List failed: {result['error']}")
            
            files = []
            for item in result:
                if item.get('name'):  # Skip directories
                    file_path = f"{search_path}/{item['name']}"
                    public_url = self.client.storage.from_("REPORT").get_public_url(file_path)
                    
                    files.append({
                        'name': item['name'],
                        'path': file_path,
                        'public_url': public_url,
                        'size': item.get('metadata', {}).get('size', 0),
                        'created_at': item.get('created_at'),
                        'updated_at': item.get('updated_at')
                    })
            
            return {
                'success': True,
                'files': files,
                'count': len(files)
            }
            
        except Exception as e:
            logger.error(f"Failed to list files: {e}")
            return {
                'success': False,
                'error': str(e),
                'files': []
            }
    
    def get_public_url(self, file_path: str) -> str:
        """
        Get public URL for a file in storage
        
        Args:
            file_path: Path to the file in storage
            
        Returns:
            Public URL string
        """
        if not self.is_available:
            return ""
        
        try:
            return self.client.storage.from_("REPORT").get_public_url(file_path)
        except Exception as e:
            logger.error(f"Failed to get public URL: {e}")
            return ""

# Global instance
storage_service = SupabaseStorageService()
