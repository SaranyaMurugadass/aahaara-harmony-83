#!/usr/bin/env bash
# Ultra simple build script - only essential packages
set -o errexit

echo "Installing ultra-minimal dependencies..."
pip install --upgrade pip
pip install -r requirements-ultra-minimal.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate

echo "Build completed successfully!"
