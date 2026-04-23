# apps/products/services.py
from django.db import transaction
from django.utils import timezone
from .models import Category, Product, PriceOff, ProductItem
from apps.users.models import Administrator, Farmer

class ProductService:
    
    @staticmethod
    def create_category(category_name, description, admin_id):
        """Create a new product category"""
        try:
            admin = Administrator.objects.get(user__id_user=admin_id)
            category = Category.objects.create(
                category_name=category_name,
                category_description=description,
                id_admin=admin
            )
            return category
        except Administrator.DoesNotExist:
            raise ValueError("Admin not found")

    @staticmethod
    def create_product(product_name, description, quality, category_id):
        """Create a new product"""
        try:
            category = Category.objects.get(id_category=category_id)
            product = Product.objects.create(
                product_name=product_name,
                product_description=description,
                product_quality=quality,
                id_category=category
            )
            return product
        except Category.DoesNotExist:
            raise ValueError("Category not found")

    @staticmethod
    def set_official_price(product_id, admin_id, min_price, max_price, price_unit):
        """Set official price range for a product"""
        try:
            product = Product.objects.get(id_product=product_id)
            # Use get_or_create to ensure the profile exists
            admin, _ = Administrator.objects.get_or_create(user_id=admin_id)
            
            # Allow updating the same day's price record instead of failing
            price_off, created = PriceOff.objects.update_or_create(
                id_product=product,
                date_set=timezone.now().date(),
                defaults={
                    'max_price': max_price,
                    'min_price': min_price,
                    'price_unit': price_unit,
                    'id_admin': admin
                }
            )

            # Notify farmers who are actively selling this product
            from apps.users.models import Notification
            farmers = Farmer.objects.filter(
                product_items__id_product=product,
                product_items__is_available=True
            ).distinct()

            for farmer in farmers:
                Notification.objects.create(
                    user=farmer.user,
                    title=f"Official Price Update: {product.product_name}",
                    message=f"The Ministry has updated the official price for {product.product_name}. New range: {min_price} - {max_price} {price_unit}.",
                    notification_type='system'
                )

            return price_off
        except Product.DoesNotExist:
            raise ValueError("Product not found")
        except Exception as e:
            raise ValueError(str(e))

    @staticmethod
    def add_product_item(farmer_id, product_id, quantity, price, production_date):
        """Add a new product item to farmer's inventory"""
        try:
            farmer = Farmer.objects.get(user__id_user=farmer_id)
            product = Product.objects.get(id_product=product_id)
            
            product_item = ProductItem.objects.create(
                quantity=quantity,
                product_price=price,
                production_date=production_date,
                id_product=product,
                id_farmer=farmer
            )
            return product_item
        except (Farmer.DoesNotExist, Product.DoesNotExist) as e:
            raise ValueError(str(e))

    @staticmethod
    def get_available_products():
        """Get all products with available stock"""
        return ProductItem.objects.filter(quantity__gt=0).select_related(
            'id_product', 'id_farmer'
        )