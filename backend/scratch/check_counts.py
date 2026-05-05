import os
import sys
import django

# Setup Django
sys.path.append(r'c:\Users\MY LAPTOP\AgriGovMarketVerF-\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.products.models import Product, ProductItem, Category

print("--- Product Counts (Unique Types) ---")
print(f"Total Active Products: {Product.objects.filter(is_active=True).count()}")
for cat in Category.objects.all():
    count = Product.objects.filter(id_category=cat, is_active=True).count()
    print(f"{cat.category_name}: {count}")

print("\n--- ProductItem Counts (Listings) ---")
print(f"Total Available Listings: {ProductItem.objects.filter(is_available=True).count()}")
for cat in Category.objects.all():
    count = ProductItem.objects.filter(id_product__id_category=cat, is_available=True).count()
    print(f"{cat.category_name}: {count}")
