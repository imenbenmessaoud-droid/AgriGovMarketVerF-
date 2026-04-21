 # apps/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Administrator, Farmer, Buyer, Transporter


# ============================================
# CUSTOM MEDIA FOR CSS
# ============================================
class Media:
    css = {
        'all': ('admin/css/custom_admin.css',)
    }


class UserAdmin(BaseUserAdmin):
    """Admin interface for custom User model"""
    
    ordering = ['email']
    list_display = ['id_user', 'name', 'email', 'user_type', 'is_active', 'is_validated']
    list_filter = ['user_type', 'is_active', 'is_validated']
    search_fields = ['name', 'email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Personal Information'), {
            'fields': ('name', 'email', 'phone', 'address')
        }),
        (_('Account'), {
            'fields': ('user_type', 'is_active', 'is_validated', 'validated_by')
        }),
        (_('Permissions'), {
            'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        (_('Important dates'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (_('Create User'), {
            'fields': ('name', 'email', 'password1', 'password2', 'user_type')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('validated_by')
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


# Register the custom User admin
admin.site.register(User, UserAdmin)


@admin.register(Administrator)
class AdministratorAdmin(admin.ModelAdmin):
    list_display = ['user', 'role']
    search_fields = ['user__name', 'user__email']
    list_filter = ['role']
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_earnings']
    search_fields = ['user__name', 'user__email']
    readonly_fields = ['total_earnings']
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


@admin.register(Buyer)
class BuyerAdmin(admin.ModelAdmin):
    list_display = ['user', 'buyer_balance']
    search_fields = ['user__name', 'user__email']
    readonly_fields = ['buyer_balance']
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


@admin.register(Transporter)
class TransporterAdmin(admin.ModelAdmin):
    list_display = ['user', 'vehicle_type', 'vehicle_capacity', 'area_service']
    search_fields = ['user__name', 'user__email', 'license_number']
    list_filter = ['vehicle_type']
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }