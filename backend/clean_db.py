
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.products.models import ProductItem, Product

def clean():
    print("Starting database cleanup...")
    
    # Delete all ProductItems (Inventory listings)
    count_items = ProductItem.objects.all().count()
    ProductItem.objects.all().delete()
    print(f"Deleted {count_items} ProductItem records.")
    
    # Delete Products (Blueprints) that might be placeholder
    # we'll keep the categories for now as they are structural
    count_prods = Product.objects.all().count()
    Product.objects.all().delete()
    print(f"Deleted {count_prods} Product records.")
    
    print("Database cleanup completed successfully.")

if __name__ == '__main__':
    clean()
