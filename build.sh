#!/usr/bin/env bash
# Exit on any error
set -o errexit

# Upgrade pip first
pip install --upgrade pip

# Install dependencies with retry logic
echo "Installing Python dependencies..."
pip install -r requirements.txt || {
    echo "First attempt failed, trying with --no-cache-dir..."
    pip install --no-cache-dir -r requirements.txt
}

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Run database migrations
echo "Running database migrations..."
python manage.py migrate

# Create superuser if it doesn't exist (optional)
# python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin123')"

echo "Build completed successfully!"
