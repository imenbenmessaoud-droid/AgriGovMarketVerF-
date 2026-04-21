
 # apps/users/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import timedelta


# ============================================
# CUSTOM USER MANAGER
# ============================================
class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, user_type='buyer', **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, user_type=user_type, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'admin')
        return self.create_user(email, name, password, **extra_fields)

    def create_admin(self, email, name, password=None, role="Administrator", **extra_fields):
        extra_fields.setdefault('user_type', 'admin')
        user = self.create_user(email, name, password, **extra_fields)
        return user

    def create_farmer(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('user_type', 'farmer')
        return self.create_user(email, name, password, **extra_fields)

    def create_buyer(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('user_type', 'buyer')
        return self.create_user(email, name, password, **extra_fields)

    def create_transporter(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('user_type', 'transporter')
        return self.create_user(email, name, password, **extra_fields)


# ============================================
# USER MODEL
# ============================================
class User(AbstractBaseUser, PermissionsMixin):
    id_user = models.AutoField(primary_key=True, db_column='IdUser')
    name = models.CharField(max_length=255, db_column='Name')
    email = models.EmailField(unique=True, db_column='Email')
    phone = models.CharField(max_length=20, blank=True, db_column='Phone')
    address = models.CharField(max_length=500, blank=True, db_column='Address')
    password = models.CharField(max_length=255, db_column='Password')

    USER_TYPE_CHOICES = [
        ('farmer', 'Farmer'),
        ('buyer', 'Buyer'),
        ('transporter', 'Transporter'),
        ('admin', 'Administrator'),
    ]
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='buyer')

    is_validated = models.BooleanField(default=False)
    validated_by = models.ForeignKey(
        'Administrator', on_delete=models.SET_NULL, null=True, blank=True,
        related_name="validated_users", db_column='ValidatedBy'
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now, db_column='CreatedAt')
    updated_at = models.DateTimeField(auto_now=True, db_column='UpdatedAt')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'User'
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.name} ({self.get_user_type_display()})"

    def login(self, request=None):
        from django.contrib.auth import login
        if request:
            login(request, self)
        return True

    def logout(self, request=None):
        from django.contrib.auth import logout
        if request:
            logout(request)
        return True

    def update_profile(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key) and key not in ['password', 'id_user']:
                setattr(self, key, value)
        self.save()
        return self

    def reset_password(self, new_password):
        self.set_password(new_password)
        self.save()
        return True

    def register(self):
        self.save()
        return self

    @property
    def is_admin(self):
        return self.user_type == 'admin' or self.is_superuser


# ============================================
# SIGNALS
# ============================================
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.user_type == 'admin':
            Administrator.objects.get_or_create(user=instance, defaults={'role': 'Administrator'})
        elif instance.user_type == 'farmer':
            Farmer.objects.get_or_create(user=instance)
        elif instance.user_type == 'buyer':
            Buyer.objects.get_or_create(user=instance)
        elif instance.user_type == 'transporter':
            Transporter.objects.get_or_create(user=instance)


# ============================================
# ADMINISTRATOR MODEL
# ============================================
class Administrator(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name="admin_profile",
        db_column='IdUser'
    )
    role = models.CharField(max_length=100, default="Administrator", db_column='Role')

    class Meta:
        db_table = 'Administrator'
        verbose_name = "Administrator"
        verbose_name_plural = "Administrators"

    def __str__(self):
        return f"Admin: {self.user.name} - {self.role}"

    def validate_user(self, user):
        if user.user_type == 'admin':
            raise ValidationError("An administrator cannot validate another admin")
        if user.is_validated:
            raise ValidationError("This user is already validated")
        user.is_validated = True
        user.validated_by = self
        user.save()
        return user

    def set_official_price(self, product, min_price, max_price, price_unit='DZD/kg', valid_days=365):
        from apps.products.models import PriceOff
        
        if min_price <= 0 or max_price <= 0:
            raise ValidationError("Prices must be greater than 0")
        if min_price > max_price:
            raise ValidationError("Minimum price cannot be greater than maximum price")
        
        return PriceOff.objects.create(
            id_product=product,
            id_admin=self,
            min_price=min_price,
            max_price=max_price,
            price_unit=price_unit,
            date_set=timezone.now().date(),
            valid_until=timezone.now().date() + timedelta(days=valid_days)
        )

    def manage_categories(self):
        from apps.products.models import Category
        return Category.objects.all()

    def add_category(self, category_name, category_description=""):
        from apps.products.models import Category
        if not category_name:
            raise ValidationError("Category name is required")
        return Category.objects.create(
            category_name=category_name,
            category_description=category_description,
            id_admin=self
        )

    def update_category(self, category_id, **kwargs):
        from apps.products.models import Category
        try:
            category = Category.objects.get(id_category=category_id)
            for key, value in kwargs.items():
                if hasattr(category, key):
                    setattr(category, key, value)
            category.save()
            return category
        except Category.DoesNotExist:
            raise ValidationError("Category not found")

    def remove_category(self, category_id):
        from apps.products.models import Category
        try:
            category = Category.objects.get(id_category=category_id)
            if category.products.count() > 0:
                raise ValidationError("Cannot delete a category that contains products")
            category.delete()
            return True
        except Category.DoesNotExist:
            raise ValidationError("Category not found")

    def generate_reports(self, report_type, start_date=None, end_date=None):
        data = self._collect_report_data(report_type, start_date, end_date)
        return data

    def _collect_report_data(self, report_type, start_date=None, end_date=None):
        from apps.orders.models import Order
        from django.db.models import Sum
        
        data = {
            'users': {
                'total': User.objects.count(),
                'farmers': User.objects.filter(user_type='farmer').count(),
                'buyers': User.objects.filter(user_type='buyer').count(),
                'transporters': User.objects.filter(user_type='transporter').count(),
                'validated': User.objects.filter(is_validated=True).count(),
            },
            'sales': {
                'total': Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0,
            }
        }
        return data

    def view_statistical_dashboards(self):
        return {
            'users_summary': self._get_users_summary(),
            'sales_summary': self._get_sales_summary(),
        }

    def _get_users_summary(self):
        return {
            'total': User.objects.count(),
            'validated': User.objects.filter(is_validated=True).count(),
        }

    def _get_sales_summary(self):
        from apps.orders.models import Order
        from django.db.models import Sum
        return {
            'total_sales': Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0,
        }

    def monitor_transactions(self, start_date=None, end_date=None):
        from apps.orders.models import Order
        orders = Order.objects.all()
        if start_date and end_date:
            orders = orders.filter(order_date__range=[start_date, end_date])
        
        return [{
            'order_id': order.order_number,
            'date': order.order_date,
            'buyer': order.id_buyer.name,
            'farmer': order.id_farmer.name,
            'total': order.total_amount,
            'status': order.order_status,
        } for order in orders]

    def suspend_user(self, user):
        if user.user_type == 'admin':
            raise ValidationError("Cannot suspend an administrator")
        user.is_active = False
        user.save()
        return user

    def activate_user(self, user):
        user.is_active = True
        user.save()
        return user


# ============================================
# FARMER MODEL
# ============================================
class Farmer(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name="farmer_profile",
        primary_key=True,
        db_column='IdUser'
    )
    total_earnings = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0.0,
        validators=[MinValueValidator(0)],
        db_column='TotalEarnings'
    )

    class Meta:
        db_table = 'Farmer'
        verbose_name = "Farmer"
        verbose_name_plural = "Farmers"

    def __str__(self):
        return f"Farmer: {self.user.name}"

    def register_farm(self, farm_name, location_farm, size):
        from apps.farms.models import Farm
        return Farm.objects.create(
            id_farmer=self,
            farm_name=farm_name,
            location_farm=location_farm,
            size=size,
        )

    def publish_product(self, product_item):
        product_item.save()
        return product_item

    def manage_orders(self):
        from apps.orders.models import Order
        return Order.objects.filter(id_farmer=self)

    def track_sales(self):
        from apps.orders.models import Order
        from apps.core.constants import OrderStatusEnum
        return Order.objects.filter(id_farmer=self, order_status=OrderStatusEnum.CONFIRMED)


# ============================================
# BUYER MODEL
# ============================================
class Buyer(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name="buyer_profile",
        primary_key=True,
        db_column='IdUser'
    )
    buyer_balance = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0.0,
        validators=[MinValueValidator(0)],
        db_column='BuyerBalance'
    )

    class Meta:
        db_table = 'Buyer'
        verbose_name = "Buyer"
        verbose_name_plural = "Buyers"

    def __str__(self):
        return f"Buyer: {self.user.name}"

    def search_product(self, query):
        from apps.products.models import Product
        return Product.objects.filter(product_name__icontains=query)

    def compare_product(self, product_ids):
        from apps.products.models import Product
        return Product.objects.filter(id_product__in=product_ids)

    def place_order(self, farmer, items):
        from apps.orders.models import Order, OrderItem
        
        total_amount = 0
        for item in items:
            total_amount += item.get('price', 0) * item.get('quantity', 0)
        
        if self.buyer_balance < total_amount:
            raise ValidationError("Insufficient balance")
        
        order = Order.objects.create(
            id_buyer=self, 
            id_farmer=farmer,
            total_amount=total_amount
        )
        
        for item in items:
            OrderItem.objects.create(
                id_order=order,
                quantity_item=item['quantity'],
                price_item=item['price'],
                sub_total_item=item['price'] * item['quantity']
            )
        
        self.buyer_balance -= total_amount
        self.save()
        
        return order

    def track_deliveries(self):
        from apps.deliveries.models import DeliveryMission
        return DeliveryMission.objects.filter(id_order__id_buyer=self)

    def get_order_history(self):
        from apps.orders.models import Order
        return Order.objects.filter(id_buyer=self)

    def access_invoice(self, order_id):
        from apps.orders.models import Order
        return Order.objects.get(order_number=order_id, id_buyer=self)


# ============================================
# TRANSPORTER MODEL
# ============================================
class Transporter(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name="transporter_profile",
        primary_key=True,
        db_column='IdUser'
    )
    area_service = models.CharField(max_length=255, db_column='AreaService', null=True, blank=True)
    delivery_earnings = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0.0,
        validators=[MinValueValidator(0)],
        db_column='DeliveryEarnings'
    )
    vehicle_type = models.CharField(max_length=100, db_column='VehicleType', null=True, blank=True)
    vehicle_capacity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0)],
        db_column='VehicleCapacity',
        null=True, blank=True
    )
    license_number = models.CharField(max_length=50, unique=True, db_column='LicenseNumber', null=True, blank=True)

    class Meta:
        db_table = 'Transporter'
        verbose_name = "Transporter"
        verbose_name_plural = "Transporters"

    def __str__(self):
        return f"Transporter: {self.user.name}"

    def register_trans_capacity(self, capacity):
        if capacity <= 0:
            raise ValidationError("Capacity must be positive")
        self.vehicle_capacity = capacity
        self.save()
        return self.vehicle_capacity

    def register_service_area(self, area):
        if not area:
            raise ValidationError("Service area is required")
        self.area_service = area
        self.save()
        return self.area_service

    def receive_delivery_requests(self):
        from apps.deliveries.models import DeliveryMission
        from apps.core.constants import DeliveryStatusEnum
        return DeliveryMission.objects.filter(
            id_transporter=self, 
            delivery_status=DeliveryStatusEnum.PENDING
        )

    def process_mission(self, mission, accept):
        from apps.core.constants import DeliveryStatusEnum
        if accept:
            mission.delivery_status = DeliveryStatusEnum.IN_TRANSIT
            mission.id_transporter = self
            mission.assigned_at = timezone.now()
        else:
            mission.id_transporter = None
            mission.delivery_status = DeliveryStatusEnum.PENDING
        mission.save()
        return mission

    def update_delivery_status(self, mission, status):
        from apps.core.constants import DeliveryStatusEnum
        mission.delivery_status = status
        if status == DeliveryStatusEnum.DELIVERED:
            mission.actual_delivery_time = timezone.now()
        mission.save()
        return mission

    def update_vehicle_info(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.save()
        return self


# ============================================
# NOTIFICATION MODEL
# ============================================
class Notification(models.Model):
    """System Notifications for Users"""
    NOTIFICATION_TYPES = [
        ('delivery', 'Delivery Request'),
        ('order', 'Order Update'),
        ('system', 'System Alert'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
        db_column='IdUser'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20, 
        choices=NOTIFICATION_TYPES, 
        default='system'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Notification'
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.name}: {self.title}"