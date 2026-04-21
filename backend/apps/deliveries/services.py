# apps/deliveries/services.py
from django.db import transaction
from django.utils import timezone
from .models import DeliveryMission
from apps.orders.models import Order
from apps.users.models import Transporter

class DeliveryService:
    
    @staticmethod
    @transaction.atomic
    def create_delivery_mission(order_number, delivery_location, transporter_id=None):
        """Create a new delivery mission for an order"""
        try:
            order = Order.objects.get(order_number=order_number)
            
            # Check if delivery mission already exists
            if DeliveryMission.objects.filter(id_order=order).exists():
                raise ValueError("Delivery mission already exists for this order")
            
            transporter = None
            if transporter_id:
                transporter = Transporter.objects.get(id_user=transporter_id)
            
            mission = DeliveryMission.objects.create(
                delivery_location=delivery_location,
                id_order=order,
                id_transporter=transporter
            )
            
            return mission
            
        except Order.DoesNotExist:
            raise ValueError("Order not found")
        except Transporter.DoesNotExist:
            raise ValueError("Transporter not found")

    @staticmethod
    def update_delivery_status(mission_number, status):
        """Update delivery status"""
        try:
            mission = DeliveryMission.objects.get(mission_number=mission_number)
            mission.delivery_status = status
            
            if status == 'delivered':
                mission.delivery_date = timezone.now().date()
            
            mission.save()
            return mission
        except DeliveryMission.DoesNotExist:
            raise ValueError("Delivery mission not found")

    @staticmethod
    def assign_transporter(mission_number, transporter_id):
        """Assign a transporter to a delivery mission"""
        try:
            mission = DeliveryMission.objects.get(mission_number=mission_number)
            transporter = Transporter.objects.get(id_user=transporter_id)
            
            mission.id_transporter = transporter
            mission.save()
            
            return mission
        except (DeliveryMission.DoesNotExist, Transporter.DoesNotExist) as e:
            raise ValueError(str(e))

    @staticmethod
    def get_transporter_missions(transporter_id):
        """Get all missions assigned to a transporter"""
        return DeliveryMission.objects.filter(
            id_transporter=transporter_id
        ).select_related('id_order')