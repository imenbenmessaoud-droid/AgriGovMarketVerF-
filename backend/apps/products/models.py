# apps/products/models.py
# apps/products/models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from apps.core.constants import ProductQualityEnum
from apps.users.models import Farmer, Administrator


class Category(models.Model):
    """Product Category"""
    id_category = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=100, verbose_name="Category Name")
    category_description = models.CharField(max_length=255, blank=True, null=True, verbose_name="Description")
    id_admin = models.ForeignKey(
        Administrator, 
        on_delete=models.SET_NULL, 
        null=True, 
        db_column='IdAdmin',
        related_name='categories',
        verbose_name="Admin"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['category_name']

    def __str__(self):
        return self.category_name


class Product(models.Model):
    """Agricultural Product"""
    id_product = models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=150, verbose_name="Product Name")
    product_description = models.TextField(blank=True, null=True, verbose_name="Description")
    product_quality = models.CharField(
        max_length=20,
        choices=ProductQualityEnum.choices,
        default=ProductQualityEnum.STANDARD,
        verbose_name="Quality"
    )
    id_category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        null=True, 
        db_column='IdCategory',
        related_name='products',
        verbose_name="Category"
    )
    is_active = models.BooleanField(default=True, verbose_name="Active")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        db_table = 'Product'
        ordering = ['product_name']
        verbose_name = "Product"
        verbose_name_plural = "Products"

    def __str__(self):
        return self.product_name


# apps/products/models.py - PriceOff model (complete corrected)

class PriceOff(models.Model):
    max_price = models.FloatField(db_column='MaxPrice', verbose_name="Maximum Price")
    min_price = models.FloatField(db_column='MinPrice', verbose_name="Minimum Price")
    price_unit = models.CharField(max_length=20, db_column='PriceUnit', default='DZD/kg', verbose_name="Price Unit")
    date_set = models.DateField(db_column='DateSet', auto_now_add=True, verbose_name="Date Set")
    valid_until = models.DateField(
        db_column='ValidUntil', 
        null=True, 
        blank=True,
        verbose_name="Valid Until"
    )
    id_product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        db_column='IdProduct',
        related_name='prices',
        verbose_name="Product"
    )
    id_admin = models.ForeignKey(
        Administrator, 
        on_delete=models.CASCADE, 
        db_column='IdAdmin',
        verbose_name="Admin"
    )

    class Meta:
        db_table = 'PriceOff'
        unique_together = ['id_product', 'date_set']
        ordering = ['-date_set']
        verbose_name = "Official Price"
        verbose_name_plural = "Official Prices"

    def clean(self):
        """Validate price range and dates"""
        # Validate price range
        if float(self.min_price) > float(self.max_price):
            raise ValidationError('Minimum price cannot be greater than maximum price')
        
        # Validate valid_until date (only if valid_until is not None)
        # date_set is auto_now_add, so it will be set when saving
        if self.valid_until is not None and self.date_set is not None:
            if self.valid_until < self.date_set:
                raise ValidationError('Valid until date cannot be before date set')

    def save(self, *args, **kwargs):
        """Save with validation"""
        # Convert empty string to None for valid_until
        if hasattr(self, 'valid_until') and self.valid_until == '':
            self.valid_until = None
        # Call clean before saving
        self.clean()
        super().save(*args, **kwargs)
    
    def is_valid(self, date=None):
        """Check if price is valid for a given date"""
        check_date = date or timezone.now().date()
        
        if self.valid_until:
            return self.date_set <= check_date <= self.valid_until
        return self.date_set <= check_date
    
    def __str__(self):
        validity = f" (until {self.valid_until})" if self.valid_until else " (indefinite)"
        return f"{self.id_product.product_name}: {self.min_price} - {self.max_price} {self.price_unit}{validity}"


class ProductItem(models.Model):
    """Product Item (Inventory)"""
    quantity = models.FloatField(db_column='Quantity', verbose_name="Quantity")
    product_price = models.FloatField(db_column='ProductPrice', verbose_name="Unit Price")
    item_date = models.DateField(db_column='ItemDate', auto_now_add=True, verbose_name="Item Date")
    production_date = models.DateField(db_column='ProductionDate', verbose_name="Production Date")
    id_product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        db_column='IdProduct',
        related_name='items',
        verbose_name="Product"
    )
    id_farmer = models.ForeignKey(
        Farmer, 
        on_delete=models.CASCADE, 
        db_column='IdFarmer',
        related_name='product_items',
        verbose_name="Farmer"
    )
    id_farm = models.ForeignKey(
        'farms.Farm',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='IdFarm',
        related_name='product_items',
        verbose_name="Farm Source"
    )
    product_image = models.ImageField(upload_to='product_items/', null=True, blank=True, verbose_name="Product Image")
    id_order_item = models.ForeignKey(
        'orders.OrderItem', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_column='IdOrderItem',
        verbose_name="Order Item"
    )
    is_available = models.BooleanField(default=True, verbose_name="Available")

    class Meta:
        db_table = 'ProductItem'
        ordering = ['-item_date']
        verbose_name = "Product Item"
        verbose_name_plural = "Product Items"

    def validate_price(self):
        """Validate price against official price range"""
        from .price_validator import PriceValidator
        PriceValidator.validate_product_price(
            self.id_product.id_product,
            self.product_price,
            self.item_date
        )

    def save(self, *args, **kwargs):
        """Save with price validation"""
        self.validate_price()
        super().save(*args, **kwargs)
    
    @property
    def total_value(self):
        """Total inventory value"""
        return self.quantity * self.product_price
    
    def __str__(self):
        return f"{self.id_product.product_name} - {self.quantity} units @ {self.product_price} DZD"