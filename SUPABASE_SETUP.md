# Supabase Setup Guide for Aahaara Harmony

This guide will help you set up Supabase database integration for the Aahaara Harmony project.

## Prerequisites

1. Supabase account and project
2. Python virtual environment activated
3. Django backend running

## Step 1: Get Your Supabase Database Password

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Find your database password (or reset it if needed)
4. Copy the password

## Step 2: Update Environment Variables

Update your `config.env` file with your Supabase database password:

```env
SUPABASE_DB_PASSWORD=your_actual_database_password_here
```

## Step 3: Create Database Tables

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_schema.sql` into the editor
4. Click **Run** to execute the SQL

### Option B: Using Django Management Command

```bash
python manage.py setup_supabase --create-tables
```

## Step 4: Set Up Row Level Security (RLS)

1. In Supabase SQL Editor, copy and paste the contents of `supabase_rls_policies.sql`
2. Click **Run** to execute the RLS policies

## Step 5: Create Database Functions

1. In Supabase SQL Editor, copy and paste the contents of `supabase_functions.sql`
2. Click **Run** to execute the functions

## Step 6: Create Sample Data

### Option A: Using Supabase Dashboard

1. In Supabase SQL Editor, run:
```sql
SELECT create_sample_food_items();
```

### Option B: Using Django Management Command

```bash
python manage.py setup_supabase --create-sample-data
```

## Step 7: Test the Integration

1. Start your Django server:
```bash
python manage.py runserver
```

2. Test user registration:
```bash
curl -X POST http://localhost:8000/api/auth/register/patient/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testpatient",
    "email": "test@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "first_name": "Test",
    "last_name": "Patient",
    "age": 25,
    "gender": "male",
    "location": "Test City"
  }'
```

3. Check your Supabase dashboard to see if the user was created in the `users` table

## Step 8: Verify Tables in Supabase

Go to your Supabase dashboard → **Table Editor** and verify these tables exist:

- `users`
- `doctor_profiles`
- `patient_profiles`
- `patients`
- `disease_analysis`
- `prakriti_analysis`
- `consultations`
- `food_items`
- `diet_charts`
- `diet_recommendations`
- `meal_plans`
- `meal_items`

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your `SUPABASE_DB_PASSWORD` is correct
   - Check if your Supabase project is active

2. **Table Already Exists Error**
   - Drop existing tables or use `CREATE TABLE IF NOT EXISTS`

3. **Permission Denied Error**
   - Ensure RLS policies are set up correctly
   - Check if your service role key has proper permissions

### Getting Help

1. Check Django logs for detailed error messages
2. Check Supabase logs in the dashboard
3. Verify all environment variables are set correctly

## Next Steps

Once setup is complete:

1. Test user registration and login
2. Test data synchronization between Django and Supabase
3. Set up real-time subscriptions if needed
4. Configure additional Supabase features (Storage, Edge Functions, etc.)

## Database Schema Overview

The Supabase database includes:

- **User Management**: Users, doctor profiles, patient profiles
- **Medical Records**: Patients, disease analysis, prakriti analysis, consultations
- **Diet Management**: Food items, diet charts, meal plans, recommendations
- **Security**: Row Level Security policies for data access control
- **Functions**: Helper functions for common operations

All tables are properly indexed and have triggers for `updated_at` timestamps.
