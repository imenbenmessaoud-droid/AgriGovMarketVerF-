from django.db import models


class OrderStatusEnum(models.TextChoices):
    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    PROCESSING = 'processing', 'Processing'
    SHIPPED = 'shipped', 'Shipped'
    DELIVERED = 'delivered', 'Delivered'
    CANCELLED = 'cancelled', 'Cancelled'


class PaymentStatusEnum(models.TextChoices):
    PENDING = 'pending', 'Pending'
    PAID = 'paid', 'Paid'
    FAILED = 'failed', 'Failed'
    REFUNDED = 'refunded', 'Refunded'
    PARTIAL = 'partial', 'Partial'


class DeliveryStatusEnum(models.TextChoices):
    PENDING = 'pending', 'Pending'
    PICKED_UP = 'picked_up', 'Picked Up'
    IN_TRANSIT = 'in_transit', 'In Transit'
    OUT_FOR_DELIVERY = 'out_for_delivery', 'Out for Delivery'
    DELIVERED = 'delivered', 'Delivered'
    FAILED = 'failed', 'Delivery Failed'
    RETURNED = 'returned', 'Returned'


class ProductQualityEnum(models.TextChoices):
    PREMIUM = 'premium', 'Premium'
    STANDARD = 'standard', 'Standard'
    ECONOMY = 'economy', 'Economy'


class FarmTypeEnum(models.TextChoices):
    CEREALS = 'cereals', 'Cereals'
    VEGETABLES = 'vegetables', 'Vegetables'
    FRUITS = 'fruits', 'Fruits'
    LIVESTOCK = 'livestock', 'Livestock'
    MIXED = 'mixed', 'Mixed'
    ORGANIC = 'organic', 'Organic'


class UserTypeEnum(models.TextChoices):
    FARMER = 'farmer', 'Farmer'
    BUYER = 'buyer', 'Buyer'
    TRANSPORTER = 'transporter', 'Transporter'
    ADMIN = 'admin', 'Administrator'


class UserStatusEnum(models.TextChoices):
    PENDING = 'pending', 'Pending'
    ACTIVE = 'active', 'Active'
    SUSPENDED = 'suspended', 'Suspended'
    BLOCKED = 'blocked', 'Blocked'


MIN_PRICE = 0.01
MAX_PRICE = 1000000
MAX_QUANTITY = 10000

VAT_RATE = 0.19
AGRICULTURAL_TAX = 0.05
PLATFORM_COMMISSION = 0.03

LOCAL_ZONE = 50
REGIONAL_ZONE = 300
NATIONAL_ZONE = 2000

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

CACHE_SHORT_TTL = 300
CACHE_MEDIUM_TTL = 3600
CACHE_LONG_TTL = 86400

RATE_LIMIT_ANON = '100/hour'
RATE_LIMIT_USER = '1000/hour'
RATE_LIMIT_ADMIN = '5000/hour'

MAX_IMAGE_SIZE_MB = 5
ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']

ALGERIAN_REGIONS = {
    'north': ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Tizi Ouzou', 'Blida'],
    'high_plateaus': ['Setif', 'Djelfa', 'Msila', 'Bordj Bou Arreridj'],
    'sahara': ['Ouargla', 'Ghardaia', 'Tamanrasset', 'Adrar', 'Bechar'],
}

from django.db import models

# ============================================
# ENUMS FOR ORDERS (according to diagram)
# ============================================
class OrderStatusEnum(models.TextChoices):
    """Order Status"""
    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    PROCESSING = 'processing', 'Processing'
    SHIPPED = 'shipped', 'Shipped'
    DELIVERED = 'delivered', 'Delivered'
    CANCELLED = 'cancelled', 'Cancelled'


class PaymentStatusEnum(models.TextChoices):
    """Payment Status"""
    PENDING = 'pending', 'Pending'
    PAID = 'paid', 'Paid'
    FAILED = 'failed', 'Failed'
    REFUNDED = 'refunded', 'Refunded'
    PARTIAL = 'partial', 'Partial'


class DeliveryStatusEnum(models.TextChoices):
    """Delivery Status"""
    PENDING = 'pending', 'Pending'
    PICKED_UP = 'picked_up', 'Picked Up'
    IN_TRANSIT = 'in_transit', 'In Transit'
    OUT_FOR_DELIVERY = 'out_for_delivery', 'Out for Delivery'
    DELIVERED = 'delivered', 'Delivered'
    FAILED = 'failed', 'Delivery Failed'
    RETURNED = 'returned', 'Returned'


class ProductQualityEnum(models.TextChoices):
    """Product Quality"""
    PREMIUM = 'premium', 'Premium'
    STANDARD = 'standard', 'Standard'
    ECONOMY = 'economy', 'Economy'


class FarmTypeEnum(models.TextChoices):
    """Farm Type"""
    CEREALS = 'cereals', 'Cereals'
    VEGETABLES = 'vegetables', 'Vegetables'
    FRUITS = 'fruits', 'Fruits'
    LIVESTOCK = 'livestock', 'Livestock'
    MIXED = 'mixed', 'Mixed'
    ORGANIC = 'organic', 'Organic'


class UserTypeEnum(models.TextChoices):
    """User Type"""
    FARMER = 'farmer', 'Farmer'
    BUYER = 'buyer', 'Buyer'
    TRANSPORTER = 'transporter', 'Transporter'
    ADMIN = 'admin', 'Administrator'


class UserStatusEnum(models.TextChoices):
    """User Account Status"""
    PENDING = 'pending', 'Pending'
    ACTIVE = 'active', 'Active'
    SUSPENDED = 'suspended', 'Suspended'
    BLOCKED = 'blocked', 'Blocked'


class UnitEnum(models.TextChoices):
    """Quantity Units"""
    KG = 'kg', 'Kilogram (kg)'
    TON = 'ton', 'Ton (t)'
    LITRE = 'litre', 'Litre (L)'


# ============================================
# GLOBAL CONSTANTS
# ============================================

MIN_PRICE = 0.01
MAX_PRICE = 1000000
MAX_QUANTITY = 10000

VAT_RATE = 0.19
AGRICULTURAL_TAX = 0.05
PLATFORM_COMMISSION = 0.03

LOCAL_ZONE = 50
REGIONAL_ZONE = 300
NATIONAL_ZONE = 2000

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

CACHE_SHORT_TTL = 300
CACHE_MEDIUM_TTL = 3600
CACHE_LONG_TTL = 86400

RATE_LIMIT_ANON = '100/hour'
RATE_LIMIT_USER = '1000/hour'
RATE_LIMIT_ADMIN = '5000/hour'

MAX_IMAGE_SIZE_MB = 5
ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']

ALGERIAN_REGIONS = {
    'north': ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Tizi Ouzou', 'Blida'],
    'high_plateaus': ['Setif', 'Djelfa', 'Msila', 'Bordj Bou Arreridj'],
    'sahara': ['Ouargla', 'Ghardaia', 'Tamanrasset', 'Adrar', 'Bechar']
}