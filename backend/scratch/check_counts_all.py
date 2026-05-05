import os
import sys
import django

# Setup Django
sys.path.append(r'c:\Users\MY LAPTOP\AgriGovMarketVerF-\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.products.models import Product, ProductItem, Category

print("--- Product Counts (ALL) ---")
print(f"Total: {Product.objects.count()}")
for cat in Category.objects.all():
    count = Product.objects.filter(id_category=cat).count()
    print(f"{cat.category_name}: {count}")
