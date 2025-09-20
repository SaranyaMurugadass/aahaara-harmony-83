#!/usr/bin/env python3
"""
Script to import food data from CSV into the Django database
"""

import os
import sys
import django
import csv
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aahaara_backend.settings')
django.setup()

from food_database.models import FoodItem
from authentication.models import User

def import_food_data(csv_file_path):
    """Import food data from CSV file"""
    
    # Get or create a system user for imports
    system_user, created = User.objects.get_or_create(
        username='system_import',
        defaults={
            'email': 'system@aahaara.com',
            'first_name': 'System',
            'last_name': 'Import',
            'role': 'doctor',
            'is_active': True,
            'is_staff': True
        }
    )
    
    imported_count = 0
    errors = []
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row_num, row in enumerate(reader, start=2):  # Start from 2 because of header
                try:
                    # Parse the data
                    food_data = {
                        'name': row['name'].strip(),
                        'serving_size': row['serving_size'].strip(),
                        'calories': int(float(row['calories'])),
                        'protein_g': Decimal(str(row['protein_g'])),
                        'carbs_g': Decimal(str(row['carbs_g'])),
                        'fat_g': Decimal(str(row['fat_g'])),
                        'fiber_g': Decimal(str(row['fiber_g'])),
                        'rasa': [r.strip() for r in row['rasa'].split(';') if r.strip()],
                        'guna': [g.strip() for g in row['guna'].split(';') if g.strip()],
                        'virya': row['virya'].strip(),
                        'vata_effect': row['vata_effect'].strip(),
                        'pitta_effect': row['pitta_effect'].strip(),
                        'kapha_effect': row['kapha_effect'].strip(),
                        'meal_types': [m.strip() for m in row['meal_type'].split(';') if m.strip()],
                        'food_category': row['food_category'].strip(),
                        'tags': [t.strip() for t in row['tags'].split(';') if t.strip()],
                        'created_by': system_user
                    }
                    
                    # Create the food item
                    food_item = FoodItem.objects.create(**food_data)
                    imported_count += 1
                    
                    if imported_count % 50 == 0:
                        print(f"Imported {imported_count} food items...")
                        
                except Exception as e:
                    error_msg = f"Row {row_num}: {str(e)}"
                    errors.append(error_msg)
                    print(f"Error in row {row_num}: {str(e)}")
    
    except FileNotFoundError:
        print(f"Error: CSV file '{csv_file_path}' not found.")
        return
    except Exception as e:
        print(f"Error reading CSV file: {str(e)}")
        return
    
    print(f"\nImport completed!")
    print(f"Successfully imported: {imported_count} food items")
    print(f"Errors: {len(errors)}")
    
    if errors:
        print("\nFirst 10 errors:")
        for error in errors[:10]:
            print(f"  - {error}")

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print("Usage: python import_food_data.py <csv_file_path>")
        print("Example: python import_food_data.py 'Indian_Foods_500 (1).csv'")
        sys.exit(1)
    
    csv_file_path = sys.argv[1]
    
    if not os.path.exists(csv_file_path):
        print(f"Error: File '{csv_file_path}' does not exist.")
        sys.exit(1)
    
    print(f"Starting import from: {csv_file_path}")
    print("This may take a few minutes...")
    
    import_food_data(csv_file_path)

if __name__ == '__main__':
    main()

