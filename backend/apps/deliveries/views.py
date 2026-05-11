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
            if ',' in status_filter:
                status_list = status_filter.split(',')
                queryset = queryset.filter(delivery_status__in=status_list)
            else:
                queryset = queryset.filter(delivery_status=status_filter)

        return queryset

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Transporters see open missions with no assigned transporter"""
        missions = DeliveryMission.objects.filter(
            id_transporter__isnull=True,
            delivery_status=DeliveryStatusEnum.OPEN
        )
        serializer = self.get_serializer(missions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def accept(self, request, pk=None):
        """Transporter accepts a delivery mission with atomic validation"""
        from django.db import transaction
        
        user = request.user
        if not hasattr(user, 'transporter_profile'):
            return Response(
                {'error': 'Only transporters can accept missions'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        transporter = user.transporter_profile

        try:
            with transaction.atomic():
                # Lock the mission row for update
                mission = DeliveryMission.objects.select_for_update().get(pk=pk)

                if mission.id_transporter or mission.delivery_status != DeliveryStatusEnum.OPEN:
                    return Response(
                        {'error': 'This mission has already been assigned or is no longer open'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # 1. Calculate total payload for the mission
                from django.db.models import Sum
                total_quantity = mission.id_order.items.aggregate(total=Sum('quantity_item'))['total'] or 0

                # 2. Handle Vehicle Assignment
                vehicle_id = request.data.get('vehicle_id')
                vehicle = None
                if vehicle_id:
                    from apps.users.models import TransporterVehicle
                    try:
                        vehicle = TransporterVehicle.objects.get(id=vehicle_id, transporter=transporter)
                    except TransporterVehicle.DoesNotExist:
                        return Response({'error': 'Selected vehicle not found in your fleet'}, status=status.HTTP_404_NOT_FOUND)
                
                # 3. Capacity Validation
                effective_capacity = 0
                if vehicle:
                    effective_capacity = float(vehicle.capacity or 0)
                else:
                    effective_capacity = float(transporter.vehicle_capacity or 0)

                if effective_capacity > 0 and total_quantity > effective_capacity:
                    cap_source = f"Vehicle {vehicle.license_number}" if vehicle else "Profile"
                    return Response(
                        {'error': f'{cap_source} capacity ({effective_capacity}) is insufficient for this load ({total_quantity}).'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # 4. Service Area Validation
                effective_service_area = vehicle.area_service if vehicle else transporter.area_service
                if effective_service_area:
                    regions = [r.strip().lower() for r in effective_service_area.split(',')]
                    dest_lower = mission.delivery_location.lower()
                    if not any(region in dest_lower for region in regions):
                        area_source = f"Vehicle {vehicle.license_number}" if vehicle else "Profile"
                        return Response(
                            {'error': f'Destination ({mission.delivery_location}) is outside the service area of this { "vehicle" if vehicle else "transporter" } ({effective_service_area}).'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                # 5. Save snapshot and assign
                mission.id_transporter = transporter
                mission.vehicle_license_snapshot = vehicle.license_number if vehicle else (transporter.license_number or "N/A")
                mission.delivery_status = DeliveryStatusEnum.ASSIGNED
                mission.save()

                # Update order status
                order = mission.id_order
                order.order_status = OrderStatusEnum.SHIPPED
                order.save()

                # Create notifications
                from apps.users.models import Notification
                # Notification for buyer
                Notification.objects.create(
                    user=order.id_buyer.user,
                    title="Order Shipped",
                    message=f"A transporter has picked up your order #{order.order_number} and is on the way.",
                    notification_type='order'
                )
                # Notification for farmer
                Notification.objects.create(
                    user=order.id_farmer.user,
                    title="Mission Assigned",
                    message=f"Transporter {transporter.user.name} has accepted the delivery for order #{order.order_number}.",
                    notification_type='delivery'
                )

                return Response(DeliveryMissionSerializer(mission).data)
        except DeliveryMission.DoesNotExist:
            return Response({'error': 'Mission not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['patch'])
    def refuse(self, request, pk=None):
        """Transporter refuses a delivery mission"""
        mission = self.get_object()
        user = request.user
        if not hasattr(user, 'transporter_profile'):
            return Response(
                {'error': 'Only transporters can refuse missions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Reset mission back to OPEN so other transporters can pick it up
        mission.id_transporter = None
        mission.delivery_status = DeliveryStatusEnum.OPEN
        mission.vehicle_license_snapshot = None
        mission.save()

        # Ensure order stays CONFIRMED (never set to cancelled on mission refusal)
        order = mission.id_order
        from apps.core.constants import OrderStatusEnum
        if order.order_status not in [OrderStatusEnum.CONFIRMED]:
            order.order_status = OrderStatusEnum.CONFIRMED
            order.save()

        # Create notifications
        from apps.users.models import Notification
        # Notification for buyer
        Notification.objects.create(
            user=order.id_buyer.user,
            title="Mission Update",
            message=f"A logistics partner has declined the current mission for order #{order.order_number}. We are re-assigning it.",
            notification_type='order'
        )
        # Notification for farmer
        Notification.objects.create(
            user=order.id_farmer.user,
            title="Mission Declined",
            message=f"Transporter {user.name} has declined the mission for order #{order.order_number}.",
            notification_type='delivery'
        )
        
        return Response({'status': 'mission reset to open and stakeholders notified'})

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

    @action(detail=True, methods=['patch'])
    def update_location(self, request, pk=None):
        """Update transporter current location and sync with mission"""
        mission = self.get_object()
        user = request.user
        
        if not hasattr(user, 'transporter_profile') or mission.id_transporter != user.transporter_profile:
            return Response(
                {'error': 'Not authorized to update this mission location'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        
        if lat is not None and lng is not None:
            mission.current_location_lat = float(lat)
            mission.current_location_lng = float(lng)
            mission.last_location_update = timezone.now()
            mission.save()
            return Response({'status': 'location updated'})
            
        return Response({'error': 'latitude and longitude required'}, status=status.HTTP_400_BAD_REQUEST)

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