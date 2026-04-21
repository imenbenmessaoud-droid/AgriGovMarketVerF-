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
        DeliveryMission.objects.create(
            id_order=order,
            delivery_location=order.delivery_address or 'To be confirmed',
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

        all_orders = Order.objects.all()
        total_rev = all_orders.filter(order_status='confirmed').aggregate(total=Sum('total_amount'))['total'] or 0
        real_farmers_count = Farmer.objects.count()
        real_users_count = User.objects.count()

        stats = {
            'total_orders': all_orders.count(),
            'total_revenue': total_rev,
            'active_deliveries': all_orders.filter(order_status='confirmed').count(),
            'registered_farmers': real_farmers_count,
        }
        
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
            'counts': {
                'farmers': real_farmers_count,
                'products': 0, # Cannot calculate easily here without importing ProductItem, but not breaking
                'users': real_users_count
            }
        })