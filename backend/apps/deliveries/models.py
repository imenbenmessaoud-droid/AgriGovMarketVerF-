# apps/deliveries/models.py
# apps/deliveries/models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.core.constants import DeliveryStatusEnum  # Changed from DeliveryStatus
from apps.users.models import Transporter
from apps.orders.models import Order

class DeliveryMission(models.Model):
    """Delivery Mission Model"""
    mission_number = models.AutoField(primary_key=True, db_column='MissionNumber')
    delivery_date = models.DateField(auto_now_add=True, db_column='DeliveryDate')
    delivery_status = models.CharField(
        max_length=20, 
        choices=DeliveryStatusEnum.choices, 
        default=DeliveryStatusEnum.PENDING,
        db_column='DeliveryStatus'
    )
    delivery_location = models.CharField(max_length=255, db_column='DeliveryLocation')
    id_order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        db_column='IdOrder',
        related_name='delivery_missions'
    )
    id_transporter = models.ForeignKey(
        Transporter, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_column='IdTransporter',
        related_name='delivery_missions'
    )
    
    # Tracking fields
    current_location_lat = models.FloatField(null=True, blank=True)
    current_location_lng = models.FloatField(null=True, blank=True)
    last_location_update = models.DateTimeField(null=True, blank=True)
    delivery_latitude = models.FloatField(null=True, blank=True)
    delivery_longitude = models.FloatField(null=True, blank=True)
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)
    actual_delivery_time = models.DateTimeField(null=True, blank=True)
    tracking_enabled = models.BooleanField(default=True)
    
    vehicle_license_snapshot = models.CharField(
        max_length=50, 
        null=True, 
        blank=True, 
        db_column='VehicleLicenseSnapshot'
    )
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'DeliveryMission'
        ordering = ['-delivery_date']

    def clean(self):
        if self.delivery_status == DeliveryStatusEnum.DELIVERED and not self.actual_delivery_time:
            raise ValidationError(_('Actual delivery time is required for delivered status'))
        
        if self.tracking_enabled and self.delivery_latitude:
            if not (-90 <= self.delivery_latitude <= 90):
                raise ValidationError(_('Latitude must be between -90 and 90'))
            if self.delivery_longitude and not (-180 <= self.delivery_longitude <= 180):
                raise ValidationError(_('Longitude must be between -180 and 180'))

    def save(self, *args, **kwargs):
        if self.delivery_status == DeliveryStatusEnum.DELIVERED and not self.actual_delivery_time:
            self.actual_delivery_time = timezone.now()
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Mission #{self.mission_number} - {self.get_delivery_status_display()}"
    
    @property
    def is_trackable(self):
        """Check if mission can be tracked"""
        return self.tracking_enabled and self.delivery_status not in [
            DeliveryStatusEnum.DELIVERED, 
            DeliveryStatusEnum.FAILED, 
            DeliveryStatusEnum.RETURNED
        ]
        