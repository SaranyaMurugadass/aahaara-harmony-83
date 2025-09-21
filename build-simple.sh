#!/usr/bin/env bash
# Simple build script for deployment
# Exit on any error
set -o errexit

# Upgrade pip first
pip install --upgrade pip

# Install basic dependencies only
echo "Installing basic Python dependencies..."
pip install -r requirements-basic.txt

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Run database migrations
echo "Running database migrations..."
python manage.py migrate

echo "Build completed successfully!"
