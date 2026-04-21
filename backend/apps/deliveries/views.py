# apps/deliveries/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from apps.core.constants import DeliveryStatusEnum, OrderStatusEnum
from .models import DeliveryMission
from .serializers import DeliveryMissionSerializer


class DeliveryMissionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing delivery missions"""
    queryset = DeliveryMission.objects.all()
    serializer_class = DeliveryMissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = DeliveryMission.objects.all()

        if hasattr(user, 'transporter_profile'):
            from django.db.models import Q
            queryset = queryset.filter(
                Q(id_transporter=user.transporter_profile) | Q(id_transporter__isnull=True)
            )

        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(delivery_status=status_filter)

        return queryset

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Transporters see pending missions with no assigned transporter"""
        missions = DeliveryMission.objects.filter(
            id_transporter__isnull=True,
            delivery_status=DeliveryStatusEnum.PENDING
        )
        serializer = self.get_serializer(missions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def accept(self, request, pk=None):
        """Transporter accepts a delivery mission with capacity validation"""
        mission = self.get_object()
        user = request.user
        
        if not hasattr(user, 'transporter_profile'):
            return Response(
                {'error': 'Only transporters can accept missions'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        transporter = user.transporter_profile

        if mission.id_transporter:
            return Response(
                {'error': 'This mission is already assigned'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Calculate total payload for the mission (Sum of OrderItems)
        from django.db.models import Sum
        total_quantity = mission.id_order.items.aggregate(total=Sum('quantity_item'))['total'] or 0

        # 2. Validate capacity
        if transporter.vehicle_capacity and total_quantity > float(transporter.vehicle_capacity):
            return Response(
                {'error': f'Vehicle capacity ({transporter.vehicle_capacity}) is insufficient for this mission load ({total_quantity}).'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # 3. Save snapshot and assign
        mission.id_transporter = transporter
        mission.vehicle_license_snapshot = transporter.license_number or "N/A"
        mission.delivery_status = DeliveryStatusEnum.IN_TRANSIT
        mission.save()

        # Update order status
        order = mission.id_order
        order.order_status = OrderStatusEnum.SHIPPED
        order.save()

        return Response(DeliveryMissionSerializer(mission).data)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Transporter updates delivery status"""
        mission = self.get_object()
        user = request.user
        if not hasattr(user, 'transporter_profile'):
            return Response(
                {'error': 'Only transporters can update delivery status'},
                status=status.HTTP_403_FORBIDDEN
            )
        new_status = request.data.get('status')
        if not new_status:
            return Response(
                {'error': 'status field required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        mission.delivery_status = new_status
        if new_status == DeliveryStatusEnum.DELIVERED:
            mission.actual_delivery_time = timezone.now()
            # Update order status
            order = mission.id_order
            order.order_status = OrderStatusEnum.DELIVERED
            order.save()
        
        mission.save()
        return Response(DeliveryMissionSerializer(mission).data)

    @action(detail=False, methods=['get'])
    def my_missions(self, request):
        """Get current transporter's missions"""
        user = request.user
        if not hasattr(user, 'transporter_profile'):
            return Response(
                {'error': 'Only transporters can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        missions = self.get_queryset().filter(
            id_transporter=user.transporter_profile
        )
        serializer = self.get_serializer(missions, many=True)
        return Response(serializer.data)