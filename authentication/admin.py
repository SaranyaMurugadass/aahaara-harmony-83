"""
Admin configuration for authentication app
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, DoctorProfile, PatientProfile, UnifiedProfile, UnifiedPatient

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Custom user admin"""
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'password_hash')}),
    )

@admin.register(UnifiedProfile)
class UnifiedProfileAdmin(admin.ModelAdmin):
    """Unified profile admin"""
    list_display = ('user', 'profile_type', 'created_at')
    list_filter = ('profile_type', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(UnifiedPatient)
class UnifiedPatientAdmin(admin.ModelAdmin):
    """Unified patient admin"""
    list_display = ('user', 'patient_id', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'user__email', 'patient_id')
    readonly_fields = ('created_at', 'updated_at')

# Disable admin for legacy models since they're now managed=False
# @admin.register(DoctorProfile)
# class DoctorProfileAdmin(admin.ModelAdmin):
#     """Doctor profile admin - DISABLED (legacy model)"""
#     pass

# @admin.register(PatientProfile)
# class PatientProfileAdmin(admin.ModelAdmin):
#     """Patient profile admin - DISABLED (legacy model)"""
#     pass