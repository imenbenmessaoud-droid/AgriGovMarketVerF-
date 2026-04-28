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
            
            # Use a robust try-catch block for IntegrityError to bypass any timezone discrepancy issues.
            # We try to create the new price. If the database blocks it because a price for today
            # already exists (UNIQUE constraint on id_product + date_set), we catch that error 
            # and update the latest existing price instead.
            from django.db import IntegrityError, transaction
            
            try:
                with transaction.atomic():
                    price_off = PriceOff.objects.create(
                        id_product=product,
                        max_price=max_price,
                        min_price=min_price,
                        price_unit=price_unit,
                        id_admin=admin
                    )
            except IntegrityError:
                # The constraint failed, meaning a record for "today" (whatever date the DB is using) exists.
                # Just fetch the latest one and update it.
                existing_price = PriceOff.objects.filter(id_product=product).order_by('-date_set').first()
                if existing_price:
                    existing_price.min_price = min_price
                    existing_price.max_price = max_price
                    existing_price.price_unit = price_unit
                    existing_price.id_admin = admin
                    existing_price.save()
                    price_off = existing_price
                else:
                    raise ValueError("Database constraint error: Could not save the official price.")

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