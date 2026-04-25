 # apps/farms/models.py
from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.users.models import Farmer


class Farm(models.Model):
    """Farm Model"""
    
    IdFarm = models.AutoField(primary_key=True, verbose_name="Farm ID")
    
    FarmName = models.CharField(
        max_length=200,
        db_index=True,
        verbose_name="Farm Name"
    )
    LocationFarm = models.TextField(verbose_name="Location")
    Size = models.FloatField(
        validators=[MinValueValidator(0.01)],
        verbose_name="Size (hectares)",
        help_text="Size in hectares, minimum 0.01 ha"
    )
    address = models.TextField(blank=True, verbose_name="Address")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Phone Number")
    email = models.EmailField(blank=True, verbose_name="Email Address")
    
    # Relationship with Farmer (1 → 1..*)
    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name='farms',
        db_index=True,
        verbose_name="Farmer"
    )
    
    # Farm description (optional)
    description = models.TextField(
        blank=True,
        verbose_name="Description",
        help_text="Detailed description of the farm"
    )
    
    # Geographic coordinates (optional - for future extension)
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        verbose_name="Latitude",
        help_text="GPS latitude coordinate"
    )
    
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        verbose_name="Longitude",
        help_text="GPS longitude coordinate"
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name="Is Active"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Creation Date"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Modification Date"
    )
    
    class Meta:
        db_table = 'farms'
        verbose_name = "Farm"
        verbose_name_plural = "Farms"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['FarmName'], name='idx_farm_name'),
            models.Index(fields=['farmer', 'created_at'], name='idx_farmer_created'),
        ]
    
    def __str__(self):
        return f"{self.FarmName} - {self.farmer.user.name}"
    
    def UpdateFarmInfo(self, **kwargs):
        """Update farm information"""
        allowed_fields = ['FarmName', 'LocationFarm', 'Size', 'description', 
                          'latitude', 'longitude', 'is_active', 'address', 'phone', 'email']
        
        for key, value in kwargs.items():
            if key in allowed_fields and hasattr(self, key):
                setattr(self, key, value)
        
        self.save()
        return self
    
    def CreateFarm(self):
        """Create the farm"""
        self.save()
        return self
    
    def DeleteFarm(self):
        """Delete the farm"""
        # Check if farm has products
        if hasattr(self, 'products') and self.products.exists():
            raise ValidationError(
                "Cannot delete a farm that has products. "
                "Please delete the products first."
            )
        
        self.delete()
        return True