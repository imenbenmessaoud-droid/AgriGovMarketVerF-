# apps/farms/admin.py
from django.contrib import admin
from .models import Farm


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    """Admin configuration for Farm"""
    
    list_display = ['IdFarm', 'FarmName', 'farmer', 'Size', 'created_at']
    list_filter = ['farmer', 'created_at']
    search_fields = ['FarmName', 'LocationFarm']
    readonly_fields = ['IdFarm', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Farm Information', {
            'fields': ('FarmName', 'LocationFarm', 'Size', 'farmer')
        }),
        ('Description', {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
        ('GPS Coordinates', {
            'fields': ('latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )