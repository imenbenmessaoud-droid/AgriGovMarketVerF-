# apps/orders/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import models
from django.db.models import Q
from .models import Order, OrderItem, Appraisal
from .serializers import OrderSerializer, CreateOrderSerializer, OrderItemSerializer, AppraisalSerializer
from .services import OrderService
from apps.core.constants import OrderStatusEnum


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing orders"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.user_type == 'buyer' and hasattr(user, 'buyer_profile'):
            queryset = queryset.filter(id_buyer=user.buyer_profile)
        elif user.user_type == 'farmer' and hasattr(user, 'farmer_profile'):
            queryset = queryset.filter(id_farmer=user.farmer_profile)

        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(order_status=status_filter)

        return queryset

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        """Create a new order from cart"""
        serializer = CreateOrderSerializer(data=request.data)
        if serializer.is_valid():
            try:
                order = OrderService.create_order(
                    buyer_id=request.user.id_user,
                    farmer_id=serializer.validated_data['farmer_id'],
                    items=serializer.validated_data['items'],
                    delivery_address=serializer.validated_data.get('delivery_address', '')
                )
                return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def accept(self, request, pk=None):
        """Farmer accepts an order"""
        order = self.get_object()
        user = request.user
        if not hasattr(user, 'farmer_profile'):
            return Response({'error': 'Only farmers can accept orders'}, status=status.HTTP_403_FORBIDDEN)
        
        order.order_status = OrderStatusEnum.CONFIRMED
        order.save()

        # Deduct stock now that farmer has accepted
        from apps.products.models import ProductItem
        for item in order.items.all():
            product_item = item.productitem_set.first()
            if product_item:
                multiplier = 1000.0 if item.quantity_unit == 'ton' else 1.0
                deduction = item.quantity_item * multiplier
                # Atomic F()-based update bypasses custom save() validators
                ProductItem.objects.filter(pk=product_item.pk).update(
                    quantity=models.F('quantity') - deduction
                )
        
        # Create delivery task
        from apps.deliveries.models import DeliveryMission
        
        # Priority: 1. Order delivery address, 2. Buyer profile address, 3. Generic fallback
        dest = order.delivery_address
        if not dest and hasattr(order.id_buyer.user, 'address'):
            dest = order.id_buyer.user.address
            
        DeliveryMission.objects.create(
            id_order=order,
            delivery_location=dest or 'AgriGov Distribution Point',
        )

        # Create notifications for all transporters
        from apps.users.models import User, Notification
        transporters = User.objects.filter(user_type='transporter')
        notifications = [
            Notification(
                user=t,
                title="New Mission Alert",
                message=f"A new delivery mission is available for Order #{order.order_number}.",
                notification_type='delivery'
            ) for t in transporters
        ]
        Notification.objects.bulk_create(notifications)
        
        # Create notification for buyer
        farm = order.id_farmer.farms.first()
        farm_name = farm.FarmName if farm else order.id_farmer.user.name
        Notification.objects.create(
            user=order.id_buyer.user,
            title="Order Accepted",
            message=f"Farmer {farm_name} has accepted your order #{order.order_number}.",
            notification_type='order'
        )

        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['patch'])
    def refuse(self, request, pk=None):
        """Farmer refuses an order"""
        order = self.get_object()
        user = request.user
        if not hasattr(user, 'farmer_profile'):
            return Response({'error': 'Only farmers can refuse orders'}, status=status.HTTP_403_FORBIDDEN)
        order.order_status = OrderStatusEnum.CANCELLED
        order.save()
        
        # Create notification for buyer
        from apps.users.models import Notification
        farm = order.id_farmer.farms.first()
        farm_name = farm.FarmName if farm else order.id_farmer.user.name
        Notification.objects.create(
            user=order.id_buyer.user,
            title="Order Refused",
            message=f"Farmer {farm_name} has refused your order #{order.order_number}.",
            notification_type='order'
        )
        
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def submit_appraisal(self, request, pk=None):
        """Buyer submits an appraisal for an order"""
        order = self.get_object()
        user = request.user

        if user.user_type != 'buyer' or order.id_buyer.user != user:
            return Response({'error': 'Only the buyer who placed this order can submit an appraisal'}, 
                            status=status.HTTP_403_FORBIDDEN)

        if hasattr(order, 'appraisal'):
            return Response({'error': 'This order has already been appraised'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        # Allow appraisal only for DELIVERED orders
        if order.order_status != OrderStatusEnum.DELIVERED:
            return Response({'error': 'Order must be delivered to be appraised'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = AppraisalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                id_order=order,
                id_buyer=order.id_buyer,
                id_farmer=order.id_farmer
            )
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get current user's orders based on their user type"""
        user = request.user
        if user.user_type == 'buyer' and hasattr(user, 'buyer_profile'):
            orders = Order.objects.filter(id_buyer=user.buyer_profile)
        elif user.user_type == 'farmer' and hasattr(user, 'farmer_profile'):
            orders = Order.objects.filter(id_farmer=user.farmer_profile)
        else:
            return Response({'error': 'No corresponding profile found for your account type'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get order statistics for the current user's role"""
        user = request.user
        
        if user.user_type == 'farmer' and hasattr(user, 'farmer_profile'):
            orders = Order.objects.filter(id_farmer=user.farmer_profile)
        elif user.user_type == 'buyer' and hasattr(user, 'buyer_profile'):
            orders = Order.objects.filter(id_buyer=user.buyer_profile)
        else:
            return Response({'error': 'Role profile not found'}, status=status.HTTP_403_FORBIDDEN)
        
        stats = {
            'total_orders': orders.count(),
            'pending_orders': orders.filter(order_status=OrderStatusEnum.PENDING).count(),
            'confirmed_orders': orders.filter(order_status=OrderStatusEnum.CONFIRMED).count(),
            'cancelled_orders': orders.filter(order_status=OrderStatusEnum.CANCELLED).count(),
            'total_revenue': orders.filter(order_status=OrderStatusEnum.CONFIRMED).aggregate(total=models.Sum('total_amount'))['total'] or 0,
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def market_overview(self, request):
        """Get global platform statistics (Ministry/Admin)"""
        from django.db.models import Count, Sum
        from apps.users.models import Farmer, User
        from django.utils import timezone

        all_orders = Order.objects.all()
        total_rev = all_orders.filter(order_status='confirmed').aggregate(total=Sum('total_amount'))['total'] or 0
        
        # User Counts breakdown
        def get_user_stats(u_type):
            base_qs = User.objects.filter(user_type=u_type)
            return {
                'total': base_qs.count(),
                'active': base_qs.filter(is_validated=True, is_active=True).count(),
                'pending': base_qs.filter(is_validated=False, is_active=True).count(),
                'rejected': base_qs.filter(is_active=False).count()
            }

        farmer_stats = get_user_stats('farmer')
        transporter_stats = get_user_stats('transporter')
        buyer_stats = get_user_stats('buyer')
        
        total_users = User.objects.count()
        new_today = User.objects.filter(created_at__date=timezone.now().date()).count()

        stats = {
            'total_orders': all_orders.count(),
            'total_revenue': total_rev,
            'active_deliveries': all_orders.filter(order_status='confirmed').count(),
            'registered_farmers': farmer_stats['total'],
        }
        
        # Top Regions breakdown with fallback detection
        raw_regions = all_orders.values('id_buyer__user__wilaya', 'delivery_address')\
            .annotate(count=Count('order_number'))
        
        region_counts = {}
        major_cities = ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Batna', 'Blida', 'Sétif', 'Biskra', 'Medea']
        
        for item in raw_regions:
            city = item['id_buyer__user__wilaya']
            if not city:
                # Try fallback from delivery address
                addr = item['delivery_address'] or ''
                found = False
                for mc in major_cities:
                    if mc.lower() in addr.lower():
                        city = mc
                        found = True
                        break
                if not found:
                    city = 'Other'
            
            region_counts[city] = region_counts.get(city, 0) + item['count']

        top_regions_data = [
            {'city': city, 'count': count}
            for city, count in sorted(region_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        # Aggregations for charts
        from django.db.models.functions import TruncMonth
        
        monthly_volume = all_orders.filter(order_status='confirmed')\
            .annotate(month=TruncMonth('order_date'))\
            .values('month')\
            .annotate(volume=Count('order_number'), total=Sum('total_amount'))\
            .order_by('month')

        monthly_data = [
            {
                'month': item['month'].strftime('%b'),
                'volume': item['volume'],
                'revenue': item['total']
            } for item in monthly_volume
        ]

        return Response({
            'stats': stats,
            'monthly_data': monthly_data,
            'top_regions': top_regions_data,
            'counts': {
                'farmers': farmer_stats,
                'transporters': transporter_stats,
                'buyers': buyer_stats,
                'users': total_users,
                'new_today': new_today
            }
        })