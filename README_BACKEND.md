# Aahaara Harmony - Django Backend

This is the Django backend for the Aahaara Harmony Ayurvedic diet management system.

## Features

- **Authentication System**: Patient and Doctor registration/login with Supabase integration
- **Patient Management**: Comprehensive patient profiles, Prakriti analysis, disease tracking
- **Doctor Management**: Doctor profiles with qualifications and specializations
- **Diet Chart Generation**: AI-powered diet chart creation based on Ayurvedic principles
- **Food Database**: Extensive database of Ayurvedic foods with dosha effects
- **Consultation Management**: Doctor-patient consultation records
- **REST API**: Complete REST API for frontend integration

## Setup Instructions

### 1. Environment Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### 2. Supabase Configuration

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and API keys
3. Update `config.env` with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. Database Setup

1. Run migrations:
```bash
python manage.py migrate
```

2. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

### 4. Start the Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register/patient/` - Register a new patient
- `POST /api/auth/register/doctor/` - Register a new doctor
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/update/` - Update user profile

### Patients
- `GET /api/patients/` - List patients
- `GET /api/patients/{id}/` - Get patient details
- `GET /api/patients/{id}/summary/` - Get patient summary
- `POST /api/patients/{id}/prakriti/` - Create Prakriti analysis
- `POST /api/patients/{id}/diseases/` - Create disease analysis
- `POST /api/patients/{id}/consultations/` - Create consultation

### Diet Charts
- `GET /api/diet-charts/food-database/` - Get food database
- `GET /api/diet-charts/foods/` - List food items
- `GET /api/diet-charts/charts/` - List diet charts
- `POST /api/diet-charts/charts/` - Create diet chart
- `POST /api/diet-charts/generate/` - Generate diet chart
- `GET /api/diet-charts/charts/{id}/meals/` - Get meal plans
- `POST /api/diet-charts/charts/{id}/meals/` - Create meal plan

## Models

### User Model
- Extended Django User model with role-based authentication
- Supports both patients and doctors
- Integrated with Supabase for authentication

### Patient Models
- **Patient**: Main patient record
- **PrakritiAnalysis**: Ayurvedic constitution analysis
- **DiseaseAnalysis**: Health condition tracking
- **Consultation**: Doctor-patient consultations

### Diet Chart Models
- **FoodItem**: Ayurvedic food database
- **DietChart**: Patient diet plans
- **MealPlan**: Individual meal plans
- **MealItem**: Food items in meals
- **DietRecommendation**: Dosha-based recommendations

## Frontend Integration

The frontend React app is configured to use this Django backend. Update the API base URL in `src/services/api.ts` if needed.

## Development

### Adding New Features
1. Create models in appropriate app
2. Create serializers for API responses
3. Create views for API endpoints
4. Add URL patterns
5. Run migrations
6. Update frontend API service

### Testing
```bash
python manage.py test
```

### Admin Interface
Access the Django admin at `http://localhost:8000/admin/` with your superuser credentials.

## Deployment

For production deployment:
1. Set `DEBUG=False` in settings
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving
4. Configure environment variables
5. Use a production WSGI server like Gunicorn

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
