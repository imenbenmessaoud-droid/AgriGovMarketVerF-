# apps/orders/services.py
from django.db import transaction
from django.utils import timezone
from .models import Order, OrderItem
from apps.users.models import Buyer, Farmer
from apps.products.models import ProductItem

class OrderService:
    
    @staticmethod
    @transaction.atomic
    def create_order(buyer_id, farmer_id, items, delivery_address=""):
        """Create a new order with items"""
        try:
            buyer = Buyer.objects.select_for_update().get(pk=buyer_id)
            farmer = Farmer.objects.select_for_update().get(pk=farmer_id)
            
            # Create order
            order = Order.objects.create(
                id_buyer=buyer,
                id_farmer=farmer,
                delivery_address=delivery_address
            )
            
            total_amount = 0
            
            # Create order items and update stock
            for item in items:
                product_item_id = item.get('product_item_id')
                quantity = float(item.get('quantity', 0))
                unit = item.get('unit', 'kg').lower()
                
                # Conversion multiplier (base unit is kg/litre)
                multiplier = 1000.0 if unit == 'ton' else 1.0
                base_quantity = quantity * multiplier
                
                product_item = ProductItem.objects.select_for_update().get(
                    id=product_item_id,
                    id_farmer=farmer
                )
                
                if product_item.quantity < base_quantity:
                    raise ValueError(f"Insufficient stock for product {product_item.id_product.product_name}")
                
                order_item = OrderItem.objects.create(
                    quantity_item=quantity,
                    quantity_unit=unit,
                    price_item=product_item.product_price,
                    product_name_snapshot=product_item.id_product.product_name,
                    id_order=order
                )
                
                # Calculate subtotal using multiplier
                order_item.sub_total_item = quantity * product_item.product_price * multiplier
                order_item.save()
                
                total_amount += order_item.sub_total_item
                
                # Link product item to order item (stock NOT deducted yet — deducted on farmer accept)
                ProductItem.objects.filter(pk=product_item.pk).update(id_order_item=order_item)
            
            order.total_amount = total_amount
            order.save()
            
            return order
            
        except (Buyer.DoesNotExist, Farmer.DoesNotExist) as e:
            raise ValueError("Buyer or Farmer not found")
        except ProductItem.DoesNotExist:
            raise ValueError("Product not available")

    @staticmethod
    def update_order_status(order_number, status):
        """Update order status"""
        try:
            order = Order.objects.get(order_number=order_number)
            order.order_status = status
            order.save()
            return order
        except Order.DoesNotExist:
            raise ValueError("Order not found")

    @staticmethod
    def update_payment_status(order_number, payment_status):
        """Update payment status"""
        try:
            order = Order.objects.get(order_number=order_number)
            order.payment_status = payment_status
            if payment_status == 'paid':
                order.invoice_date = timezone.now().date()
            order.save()
            return order
        except Order.DoesNotExist:
            raise ValueError("Order not found")