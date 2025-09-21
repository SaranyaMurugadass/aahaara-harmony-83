@echo off
REM Build script for Render deployment

REM Install dependencies
pip install -r requirements.txt

REM Collect static files
python manage.py collectstatic --noinput

REM Run database migrations
python manage.py migrate

REM Create superuser if it doesn't exist (optional)
REM python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin123')"

echo Build completed successfully!
