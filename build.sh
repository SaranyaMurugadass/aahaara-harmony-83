#!/usr/bin/env bash
# Exit on any error
set -o errexit

# Upgrade pip first
pip install --upgrade pip

# Install dependencies with fallback strategy
echo "Installing Python dependencies..."

# Try full requirements first
if pip install -r requirements.txt; then
    echo "✅ Full requirements installed successfully"
else
    echo "❌ Full requirements failed, trying with --no-cache-dir..."
    if pip install --no-cache-dir -r requirements.txt; then
        echo "✅ Full requirements installed with --no-cache-dir"
    else
        echo "❌ Full requirements failed, trying basic requirements..."
        if pip install -r requirements-basic.txt; then
            echo "✅ Basic requirements installed successfully"
        else
            echo "❌ Basic requirements failed, trying minimal requirements..."
            if pip install -r requirements-minimal.txt; then
                echo "✅ Minimal requirements installed successfully"
            else
                echo "❌ All installation attempts failed"
                exit 1
            fi
        fi
    fi
fi

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Run database migrations
echo "Running database migrations..."
python manage.py migrate

# Create superuser if it doesn't exist (optional)
# python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin123')"

echo "Build completed successfully!"
