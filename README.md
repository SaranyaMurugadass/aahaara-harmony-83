# Aahaara360 - Comprehensive Ayurvedic Practice Management System

A modern, cloud-based practice management and nutrient analysis software tailored for Ayurvedic dietitians and healthcare professionals.

## 🌟 Features

### For Patients
- **Personalized Dashboard**: Track your wellness journey with real-time progress monitoring
- **Diet Chart Management**: Access and follow personalized Ayurvedic diet plans
- **Appointment Booking**: Schedule consultations with your healthcare provider
- **Health Tracking**: Monitor meals, streaks, and health metrics
- **Report Management**: Upload and download medical reports
- **Reminder System**: Get notified about meal times and appointments

### For Doctors/Dietitians
- **Patient Management**: Comprehensive patient profiles with health history
- **Prakriti Analysis**: Conduct detailed Ayurvedic constitution assessments
- **Disease Analysis**: Track and manage patient health conditions
- **AI-Powered Diet Chart Generation**: Create personalized diet plans based on patient analysis
- **Food Database**: Extensive database of Ayurvedic foods with dosha effects
- **Consultation Management**: Schedule and manage patient consultations
- **Analytics Dashboard**: Track practice metrics and patient progress

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching
- **React Router** for navigation
- **React Hook Form** for form management
- **Zod** for validation

### Backend
- **Django 5.2** with Python
- **Django REST Framework** for APIs
- **PostgreSQL** for production database
- **SQLite** for development
- **Background tasks** (Celery removed for minimal deployment)
- **Redis** for caching and message broker
- **Supabase** for additional cloud services

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL (for production)
- Redis (for background tasks)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aahaara-harmony-83
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp config.env.example config.env
   # Edit config.env with your configuration
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Environment Variables

Create a `config.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_PASSWORD=your_db_password

# Django Configuration
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/aahaara_db
USE_POSTGRES=False  # Set to True for production

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend Environment

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Aahaara360
VITE_APP_VERSION=1.0.0
```

## 🗄️ Database Schema

### Core Models

- **User**: Extended user model with role-based authentication
- **DoctorProfile**: Doctor-specific information and credentials
- **PatientProfile**: Patient health information and demographics
- **Patient**: Patient management and assignment
- **PrakritiAnalysis**: Ayurvedic constitution analysis
- **DiseaseAnalysis**: Health condition tracking
- **Consultation**: Doctor-patient consultation records
- **FoodItem**: Ayurvedic food database with dosha effects
- **DietChart**: Personalized diet plans
- **MealPlan**: Individual meal plans within diet charts
- **MealItem**: Specific food items in meal plans
- **DietRecommendation**: General dietary recommendations

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/patient/` - Patient registration
- `POST /api/auth/register/doctor/` - Doctor registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile

### Patients
- `GET /api/patients/` - List patients
- `GET /api/patients/{id}/` - Get patient details
- `GET /api/patients/{id}/summary/` - Get patient summary
- `POST /api/patients/{id}/prakriti/` - Create Prakriti analysis
- `POST /api/patients/{id}/diseases/` - Create disease analysis
- `POST /api/patients/{id}/consultations/` - Create consultation

### Diet Charts
- `GET /api/diet-charts/foods/` - List food items
- `GET /api/diet-charts/charts/` - List diet charts
- `POST /api/diet-charts/charts/` - Create diet chart
- `POST /api/diet-charts/generate/` - Generate diet chart
- `GET /api/diet-charts/recommendations/` - Get diet recommendations

## 🎨 UI Components

The frontend uses a comprehensive design system with:

- **Modern Design**: Clean, professional interface with Ayurvedic color schemes
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: WCAG compliant components
- **Dark/Light Mode**: Theme switching support
- **Interactive Elements**: Smooth animations and transitions

## 🔒 Security Features

- **Role-based Access Control**: Different permissions for patients and doctors
- **JWT Token Authentication**: Secure API access
- **Input Validation**: Comprehensive form validation
- **CORS Protection**: Configured for secure cross-origin requests
- **Data Encryption**: Sensitive data encrypted at rest

## 📊 Analytics & Monitoring

- **Real-time Dashboard**: Live updates of key metrics
- **Patient Progress Tracking**: Monitor health improvements
- **Practice Analytics**: Track consultation patterns and outcomes
- **Performance Monitoring**: Built-in logging and error tracking

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment**
   ```bash
   # Set production environment variables
   export USE_POSTGRES=True
   export DEBUG=False
   
   # Run migrations
   python manage.py migrate
   
   # Collect static files
   python manage.py collectstatic
   
   # Start with Gunicorn
   gunicorn aahaara_backend.wsgi:application
   ```

2. **Frontend Deployment**
   ```bash
   # Build for production
   npm run build
   
   # Serve with nginx or similar
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced UI and user experience
- **v1.2.0** - Added AI-powered diet chart generation
- **v1.3.0** - Comprehensive refactoring and modernization

## 🙏 Acknowledgments

- Traditional Ayurvedic practitioners for their wisdom
- Modern healthcare professionals for their feedback
- Open source community for the amazing tools and libraries