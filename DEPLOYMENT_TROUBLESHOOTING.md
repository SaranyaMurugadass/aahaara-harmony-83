# 🚨 Deployment Troubleshooting Guide

## Common Build Issues and Solutions

### 1. **Package Installation Errors**

**Error**: `KeyError: '__version__'` or `Getting requirements to build wheel: finished with status 'error'`

**Solution**: This is often caused by package version compatibility issues with Python 3.13.

**For Render Deployment**:

1. **Try the fallback build script**: The updated `build.sh` now tries multiple requirements files
2. **Use basic requirements**: If full requirements fail, try `requirements-basic.txt`
3. **Use minimal requirements**: As a fallback, try `requirements-minimal.txt`
4. **Use ultra-minimal requirements**: As last resort, try `requirements-ultra-minimal.txt`
5. **Use ultra-simple build script**: Try `build-ultra-simple.sh` which only installs absolute essentials

**Alternative Build Commands for Render**:
- `./build-ultra-simple.sh` - Only essential packages
- `pip install -r requirements-ultra-minimal.txt && python manage.py collectstatic --noinput && python manage.py migrate`

### 2. **realtime Package Version Error**

**Error**: `ERROR: No matching distribution found for realtime==1.0.7`

**Solution**: ✅ **FIXED** - Updated to `realtime==2.7.0` in requirements.txt

### 3. **Build Script Issues**

**Error**: Build script fails during dependency installation

**Solution**: The updated `build.sh` now includes:

- Pip upgrade before installation
- Retry logic with `--no-cache-dir` flag
- Better error handling and logging

### 4. **Environment Variables Missing**

**Error**: `KeyError: 'SECRET_KEY'` or similar

**Solution**: Ensure all required environment variables are set in Render dashboard:

**Required Variables**:

```
DJANGO_SETTINGS_MODULE=aahaara_backend.settings_production
SECRET_KEY=your-super-secret-key-here
DEBUG=False
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 5. **Database Connection Issues**

**Error**: `django.db.utils.OperationalError: could not connect to server`

**Solution**:

1. Verify `DATABASE_URL` is correct
2. Check if PostgreSQL service is running on Render
3. Ensure database credentials are properly formatted

### 6. **Static Files Issues**

**Error**: `django.core.exceptions.ImproperlyConfigured: You're using the staticfiles app without having set the STATIC_ROOT setting`

**Solution**: ✅ **FIXED** - Static files configuration is properly set up in production settings.

### 7. **CORS Issues**

**Error**: `Access to fetch at 'https://your-backend.onrender.com' from origin 'https://your-frontend.onrender.com' has been blocked by CORS policy`

**Solution**: Update CORS settings in production:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-app.onrender.com",
    "http://localhost:5173",  # For local development
]
```

## Testing Your Deployment

### 1. **Health Check**

Visit: `https://your-app.onrender.com/api/health/`

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-21T...",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "environment": "healthy"
  }
}
```

### 2. **API Endpoints Test**

```bash
# Test basic API
curl https://your-app.onrender.com/api/

# Test authentication
curl -X POST https://your-app.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

### 3. **Database Test**

```bash
# Test database connection
curl https://your-app.onrender.com/api/patients/
```

## Render-Specific Issues

### 1. **Build Timeout**

**Error**: Build process times out

**Solution**:

- Render free tier has build time limits
- Consider upgrading to paid plan for faster builds
- Optimize requirements.txt to only include necessary packages

### 2. **Memory Issues**

**Error**: Out of memory during build

**Solution**:

- Remove unnecessary packages from requirements.txt
- Use `--no-cache-dir` flag in pip install
- Consider upgrading to paid plan

### 3. **Service Sleep**

**Error**: Service appears to be sleeping

**Solution**:

- Free tier services sleep after 15 minutes of inactivity
- First request after sleep may take 30+ seconds
- Consider upgrading to paid plan to prevent sleeping

## Local Development Setup

### Windows Users:

```bash
# Install development requirements
pip install -r requirements-dev.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Linux/Mac Users:

```bash
# Install requirements
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

## Getting Help

1. **Check Render Logs**: Go to your service dashboard → Logs
2. **Test Health Endpoint**: Visit `/api/health/` to check service status
3. **Verify Environment Variables**: Ensure all required variables are set
4. **Check Database Connection**: Verify PostgreSQL service is running
5. **Review Build Logs**: Look for specific error messages during deployment

## Quick Fixes

### If Build Fails:

1. Check the build logs in Render dashboard
2. Verify all environment variables are set
3. Ensure requirements.txt has correct package versions
4. Try redeploying with a clean build

### If Service Won't Start:

1. Check the service logs
2. Verify `DJANGO_SETTINGS_MODULE` is set correctly
3. Ensure `SECRET_KEY` is provided
4. Check database connection

### If API Returns 500 Errors:

1. Check service logs for specific error messages
2. Verify database is accessible
3. Check if all required environment variables are set
4. Test with health check endpoint first

Remember: The deployment is configured to work on Render's Linux environment. Local Windows issues with `psycopg2-binary` won't affect the Render deployment.
