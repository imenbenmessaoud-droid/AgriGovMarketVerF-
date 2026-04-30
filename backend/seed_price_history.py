import os
import django
from django.utils import timezone
from datetime import timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.products.models import Product, ProductPriceHistory, ProductItem
from django.db.models import Avg

def seed_history():
    products = Product.objects.all()
    today = timezone.localdate()
    
    for product in products:
        # Get current avg from items
        items = ProductItem.objects.filter(id_product=product)
        if items.exists():
            current_avg = items.aggregate(Avg('product_price'))['product_price__avg']
            
            # Create history for today
            ProductPriceHistory.objects.update_or_create(
                id_product=product,
                history_date=today,
                defaults={'average_price': current_avg}
            )
            
            # Create history for 7 days ago (with some variation to see green/red arrows)
            # We want some to go up and some to go down.
            # If variation is positive, the price WENT UP (prev was lower).
            # If variation is negative, the price WENT DOWN (prev was higher).
            variation = random.choice([-0.1, 0.1, -0.05, 0.05, 0.2, -0.2])
            prev_avg = current_avg * (1 - variation)
            
            ProductPriceHistory.objects.update_or_create(
                id_product=product,
                history_date=today - timedelta(days=7),
                defaults={'average_price': prev_avg}
            )
            
    print("Price history seeded successfully!")

if __name__ == '__main__':
    seed_history()
