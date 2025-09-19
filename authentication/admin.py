"""
Admin configuration for authentication app
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, DoctorProfile, PatientProfile

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Custom user admin"""
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'supabase_id')}),
    )

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    """Doctor profile admin"""
    list_display = ('user', 'qualification', 'specialization', 'experience_years', 'is_verified')
    list_filter = ('specialization', 'is_verified', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'license_number')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    """Patient profile admin"""
    list_display = ('user', 'age', 'gender', 'location', 'created_at')
    list_filter = ('gender', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'location')
    readonly_fields = ('created_at', 'updated_at')