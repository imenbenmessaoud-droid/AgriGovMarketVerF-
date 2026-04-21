# apps/orders/models.py
# apps/orders/models.py
from django.db import models
from django.utils import timezone
from apps.core.constants import OrderStatusEnum, PaymentStatusEnum, UnitEnum  # Added UnitEnum
from apps.users.models import Buyer, Farmer

class Order(models.Model):
    """Order Model"""
    order_number = models.IntegerField(primary_key=True, db_column='OrderNumber')
    order_date = models.DateField(auto_now_add=True, db_column='OrderDate')
    order_status = models.CharField(
        max_length=20, 
        choices=OrderStatusEnum.choices, 
        default=OrderStatusEnum.PENDING,
        db_column='OrderStatus'
    )
    total_amount = models.FloatField(db_column='TotalAmount', null=True, blank=True)
    payment_status = models.CharField(
        max_length=20, 
        choices=PaymentStatusEnum.choices, 
        default=PaymentStatusEnum.PENDING,
        db_column='PaymentStatus'
    )
    invoice_number = models.CharField(max_length=100, null=True, blank=True, db_column='InvoiceNumber')
    invoice_date = models.DateField(null=True, blank=True, db_column='InvoiceDate')
    id_buyer = models.ForeignKey(
        Buyer, 
        on_delete=models.CASCADE, 
        db_column='IdBuyer',
        related_name='orders'
    )
    id_farmer = models.ForeignKey(
        Farmer, 
        on_delete=models.CASCADE, 
        db_column='IdFarmer',
        related_name='orders'
    )
    notes = models.TextField(blank=True, null=True)
    delivery_address = models.CharField(max_length=500, blank=True, null=True, db_column='DeliveryAddress')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '`Order`'
        ordering = ['-order_date']

    def save(self, *args, **kwargs):
        if not self.order_number:
            last_order = Order.objects.all().order_by('-order_number').first()
            self.order_number = last_order.order_number + 1 if last_order else 1000
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.order_number}"


class OrderItem(models.Model):
    """Order Item Model"""
    id_order_item = models.AutoField(primary_key=True, db_column='IdOrderItem')
    quantity_item = models.FloatField(db_column='QuantityItem')
    quantity_unit = models.CharField(
        max_length=20, 
        choices=UnitEnum.choices, 
        default=UnitEnum.KG,
        db_column='QuantityUnit'
    )
    price_item = models.FloatField(db_column='PriceItem')
    sub_total_item = models.FloatField(db_column='SubTotalItem', null=True, blank=True)
    id_order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        db_column='IdOrder',
        related_name='items'
    )
    product_name_snapshot = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'OrderItem'

    def save(self, *args, **kwargs):
        self.sub_total_item = self.quantity_item * self.price_item
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.product_name_snapshot} - {self.quantity_item} units"


class Appraisal(models.Model):
    """Buyer Appraisal/Feedback for an Order"""
    id_appraisal = models.AutoField(primary_key=True, db_column='IdAppraisal')
    id_order = models.OneToOneField(
        Order, 
        on_delete=models.CASCADE, 
        db_column='IdOrder',
        related_name='appraisal'
    )
    id_buyer = models.ForeignKey(
        Buyer, 
        on_delete=models.CASCADE, 
        db_column='IdBuyer',
        related_name='appraisals'
    )
    id_farmer = models.ForeignKey(
        Farmer, 
        on_delete=models.CASCADE, 
        db_column='IdFarmer',
        related_name='appraisals'
    )
    rating = models.IntegerField(
        db_column='Rating',
        choices=[(i, str(i)) for i in range(1, 6)],
        default=5
    )
    feedback = models.TextField(db_column='Feedback', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column='CreatedAt')

    class Meta:
        db_table = 'Appraisal'
        verbose_name = "Appraisal"
        verbose_name_plural = "Appraisals"

    def __str__(self):
        return f"Appraisal for Order #{self.id_order.order_number} - {self.rating} Stars"