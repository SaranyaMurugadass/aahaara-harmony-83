from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.utils import timezone
import json


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Health check endpoint for monitoring services.
    Returns the status of the application and its dependencies.
    """
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Check if all required environment variables are set
    import os
    required_env_vars = ['SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_KEY']
    missing_env_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    env_status = "healthy" if not missing_env_vars else f"missing: {', '.join(missing_env_vars)}"
    
    # Overall status
    overall_status = "healthy" if db_status == "healthy" and env_status == "healthy" else "unhealthy"
    
    response_data = {
        "status": overall_status,
        "timestamp": str(timezone.now()),
        "version": "1.0.0",
        "services": {
            "database": db_status,
            "environment": env_status,
        }
    }
    
    status_code = 200 if overall_status == "healthy" else 503
    
    return JsonResponse(response_data, status=status_code)
