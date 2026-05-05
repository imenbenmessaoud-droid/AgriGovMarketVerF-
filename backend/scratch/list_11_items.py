import os
import sys
import django

# Setup Django
sys.path.append(r'c:\Users\MY LAPTOP\AgriGovMarketVerF-\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.products.models import ProductItem

items = ProductItem.objects.filter(is_available=True).select_related('id_product', 'id_product__id_category')
print(f"Total Available Listings: {items.count()}")
for i, item in enumerate(items, 1):
    cat_name = item.id_product.id_category.category_name if item.id_product.id_category else "No Category"
    print(f"{i}. {item.id_product.product_name} ({cat_name}) - Farmer: {item.id_farmer.user.name} - Price: {item.product_price} DZD")
