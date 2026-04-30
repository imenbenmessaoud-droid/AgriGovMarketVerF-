from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Avg
from apps.products.models import Product, ProductItem, ProductPriceHistory

class Command(BaseCommand):
    help = 'Take a snapshot of current average prices for all products'

    def handle(self, *args, **options):
        products = Product.objects.filter(is_active=True)
        today = timezone.localdate()
        count = 0

        for product in products:
            avg_price = ProductItem.objects.filter(
                id_product=product, 
                is_available=True
            ).aggregate(Avg('product_price'))['product_price__avg']

            if avg_price is not None:
                ProductPriceHistory.objects.update_or_create(
                    id_product=product,
                    history_date=today,
                    defaults={'average_price': avg_price}
                )
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully took price snapshots for {count} products'))
