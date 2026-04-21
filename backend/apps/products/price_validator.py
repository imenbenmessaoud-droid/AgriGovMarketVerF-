# apps/products/price_validator.py
# apps/products/price_validator.py
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from .models import PriceOff
import logging

logger = logging.getLogger(__name__)


class PriceValidator:
    """
    Validates product prices against official government price ranges
    """
    
    @staticmethod
    def validate_product_price(product_id, price, date=None):
        """
        Validate if a product price falls within the official price range
        
        Args:
            product_id: ID of the product
            price: Price to validate
            date: Date of the price (defaults to current date)
        
        Returns:
            bool: True if valid, False otherwise
        
        Raises:
            ValidationError: If price is outside official range
        """
        if date is None:
            date = timezone.now().date()
        
        try:
            # Get the latest valid official price for the product
            official_price = PriceOff.objects.filter(
                id_product=product_id,
                date_set__lte=date
            ).filter(
                Q(valid_until__isnull=True) | 
                Q(valid_until__gte=date)
            ).order_by('-date_set').first()
            
            if official_price:
                if official_price.min_price <= price <= official_price.max_price:
                    return True
                else:
                    raise ValidationError(
                        _('Price {price} is outside the official range ({min_price} - {max_price} {unit})').format(
                            price=price,
                            min_price=official_price.min_price,
                            max_price=official_price.max_price,
                            unit=official_price.price_unit
                        )
                    )
            else:
                # No official price set, allow any price
                logger.info(f"No valid official price found for product {product_id} on {date}")
                return True
                
        except PriceOff.DoesNotExist:
            logger.info(f"No official price found for product {product_id}")
            return True
    
    @staticmethod
    def get_price_range(product_id, date=None):
        """
        Get the official price range for a product
        
        Args:
            product_id: ID of the product
            date: Date to check (defaults to current date)
        
        Returns:
            dict: Price range information or None
        """
        if date is None:
            date = timezone.now().date()
        
        try:
            official_price = PriceOff.objects.filter(
                id_product=product_id,
                date_set__lte=date
            ).filter(
                Q(valid_until__isnull=True) | 
                Q(valid_until__gte=date)
            ).order_by('-date_set').first()
            
            if official_price:
                return {
                    'min_price': official_price.min_price,
                    'max_price': official_price.max_price,
                    'unit': official_price.price_unit,
                    'date_set': official_price.date_set,
                    'valid_until': official_price.valid_until,
                    'is_active': official_price.is_valid(date)
                }
        except PriceOff.DoesNotExist:
            pass
        
        return None
    
    @staticmethod
    def get_all_price_history(product_id):
        """
        Get all price history for a product
        
        Returns:
            list: List of price ranges with validity periods
        """
        prices = PriceOff.objects.filter(
            id_product=product_id
        ).order_by('-date_set')
        
        return [
            {
                'min_price': p.min_price,
                'max_price': p.max_price,
                'unit': p.price_unit,
                'date_set': p.date_set,
                'valid_until': p.valid_until,
                'is_active': p.is_valid()
            }
            for p in prices
        ]
    
    @staticmethod
    def get_current_valid_price(product_id, date=None):
        """
        Get the current valid official price
        
        Returns:
            PriceOff object or None
        """
        if date is None:
            date = timezone.now().date()
        
        return PriceOff.objects.filter(
            id_product=product_id,
            date_set__lte=date
        ).filter(
            Q(valid_until__isnull=True) | 
            Q(valid_until__gte=date)
        ).order_by('-date_set').first()
    
    @staticmethod
    def validate_bulk_prices(items):
        """
        Validate multiple product prices at once
        
        Args:
            items: List of dicts with 'product_id' and 'price' keys
        
        Returns:
            dict: Validation results with errors
        """
        errors = {}
        
        for idx, item in enumerate(items):
            try:
                PriceValidator.validate_product_price(
                    item['product_id'], 
                    item['price']
                )
            except ValidationError as e:
                errors[f'item_{idx}'] = str(e)
        
        return errors