# Aahaara Harmony - Render Deployment Guide

This guide will help you deploy the Aahaara Harmony Django backend to Render.

## Prerequisites

1. A Render account (free tier available)
2. A GitHub repository with your code
3. Supabase account for database and storage

## Step 1: Prepare Your Repository

Make sure your repository contains all the necessary files:

- `requirements.txt` - Python dependencies
- `build.sh` - Build script for deployment
- `Procfile` - Process file for Render
- `runtime.txt` - Python version specification
- `render.yaml` - Render configuration (optional)

## Step 2: Create a PostgreSQL Database on Render

1. Go to your Render dashboard
2. Click "New +" → "PostgreSQL"
3. Choose the **Free** plan
4. Name your database: `aahaara-db`
5. Note down the database credentials

## Step 3: Deploy the Backend Service

1. Go to your Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

### Basic Settings:

- **Name**: `aahaara-backend`
- **Environment**: `Python 3`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (root of repo)

### Build & Deploy:

- **Build Command**: `./build.sh`
- **Start Command**: `gunicorn aahaara_backend.wsgi:application`

### Environment Variables:

Add these environment variables in the Render dashboard:

```
DJANGO_SETTINGS_MODULE=aahaara_backend.settings_production
SECRET_KEY=your-super-secret-key-here
DEBUG=False
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@aahaara.com
```

### Advanced Settings:

- **Auto-Deploy**: Yes (deploys on every push to main branch)
- **Health Check Path**: `/api/` (optional)

## Step 4: Configure CORS

Update the CORS settings in your production settings to include your frontend URL:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-app.onrender.com",
    "http://localhost:5173",  # For local development
]
```

## Step 5: Deploy the Frontend (Optional)

If you want to deploy your React frontend to Render as well:

1. Create a new **Static Site** service
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd src && npm install && npm run build`
   - **Publish Directory**: `src/dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://your-backend-app.onrender.com
     ```

## Step 6: Update Frontend API URL

Update your frontend to use the production API URL:

```typescript
// In your API client
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://your-backend-app.onrender.com";
```

## Step 7: Test Your Deployment

1. Visit your backend URL: `https://your-backend-app.onrender.com/api/`
2. Test the API endpoints
3. Check the logs in Render dashboard for any errors

## Environment Variables Reference

### Required Variables:

- `SECRET_KEY`: Django secret key (generate a new one for production)
- `DATABASE_URL`: PostgreSQL connection string from Render
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Optional Variables:

- `EMAIL_HOST_USER`: Email for sending notifications
- `EMAIL_HOST_PASSWORD`: Email app password
- `DEFAULT_FROM_EMAIL`: Default sender email

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check the build logs in Render dashboard
2. **Database Connection Error**: Verify DATABASE_URL is correct
3. **CORS Errors**: Update CORS_ALLOWED_ORIGINS with your frontend URL
4. **Static Files Not Loading**: Ensure WhiteNoise is properly configured

### Debugging:

1. Check the service logs in Render dashboard
2. Use Django's `DEBUG=True` temporarily (remember to set back to False)
3. Test API endpoints using curl or Postman

## Security Considerations

1. **Never commit secrets** to your repository
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** (automatic on Render)
4. **Set DEBUG=False** in production
5. **Use strong SECRET_KEY**

## Monitoring

Render provides basic monitoring for free tier:

- Service uptime
- Response times
- Error logs
- Resource usage

## Scaling

For production use:

1. Upgrade to a paid plan for better performance
2. Use Redis for caching (add Redis service)
3. Set up proper monitoring and alerting
4. Configure CDN for static files

## Support

- Render Documentation: https://render.com/docs
- Django Deployment: https://docs.djangoproject.com/en/stable/howto/deployment/
- Supabase Documentation: https://supabase.com/docs
