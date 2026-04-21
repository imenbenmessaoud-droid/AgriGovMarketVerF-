from django.db import models


class ActiveManager(models.Manager):
    """Manager pour les objets actifs"""
    
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)


class ValidatedManager(models.Manager):
    """Manager pour les objets validés"""
    
    def get_queryset(self):
        return super().get_queryset().filter(is_validated=True)


class AvailableManager(models.Manager):
    """Manager pour les objets disponibles"""
    
    def get_queryset(self):
        return super().get_queryset().filter(is_available=True)


class FarmerManager(models.Manager):
    """Manager pour les agriculteurs"""
    
    def get_queryset(self):
        return super().get_queryset().filter(user__user_type='farmer')
    
    def with_farms(self):
        return self.get_queryset().filter(farms__isnull=False).distinct()
    
    def top_earners(self, limit=10):
        return self.get_queryset().order_by('-TotalEarnings')[:limit]


class BuyerManager(models.Manager):
    """Manager pour les acheteurs"""
    
    def get_queryset(self):
        return super().get_queryset().filter(user__user_type='buyer')
    
    def with_orders(self):
        return self.get_queryset().filter(orders__isnull=False).distinct()
    
    def top_spenders(self, limit=10):
        return self.get_queryset().order_by('-total_spent')[:limit]