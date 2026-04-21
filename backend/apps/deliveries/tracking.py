# apps/deliveries/tracking.py
import json
import redis
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .models import DeliveryMission
import logging

logger = logging.getLogger(__name__)

class DeliveryTrackingService:
    """
    Real-time shipment tracking service
    """
    
    def __init__(self):
        """Initialize Redis connection for real-time tracking"""
        try:
            self.redis_client = redis.Redis(
                host=getattr(settings, 'REDIS_HOST', 'localhost'),
                port=getattr(settings, 'REDIS_PORT', 6379),
                db=getattr(settings, 'REDIS_DB', 0),
                decode_responses=True
            )
        except:
            self.redis_client = None
            logger.warning("Redis unavailable, using local cache")
    
    def update_location(self, mission_number, latitude, longitude, speed=None, heading=None):
        """
        Update shipment location in real-time
        """
        try:
            location_data = {
                'latitude': latitude,
                'longitude': longitude,
                'speed': speed,
                'heading': heading,
                'timestamp': timezone.now().isoformat(),
                'mission_id': mission_number
            }
            
            # Store in Redis
            if self.redis_client:
                key = f"tracking:{mission_number}"
                self.redis_client.hset(key, mapping=location_data)
                self.redis_client.expire(key, 3600)  # 1 hour expiry
                
                # Add to location history
                history_key = f"tracking_history:{mission_number}"
                self.redis_client.lpush(history_key, json.dumps(location_data))
                self.redis_client.ltrim(history_key, 0, 99)  # Keep last 100 locations
                self.redis_client.expire(history_key, 86400)  # 24 hours expiry
            
            # Update delivery status based on location
            self.update_delivery_status(mission_number, latitude, longitude)
            
            return True
        except Exception as e:
            logger.error(f"Error updating location: {str(e)}")
            return False
    
    def get_current_location(self, mission_number):
        """
        Get current location of a shipment
        """
        try:
            if self.redis_client:
                key = f"tracking:{mission_number}"
                location = self.redis_client.hgetall(key)
                if location:
                    return location
            
            # Get from database if not in Redis
            mission = DeliveryMission.objects.get(mission_number=mission_number)
            if hasattr(mission, 'current_location_lat'):
                return {
                    'latitude': mission.current_location_lat,
                    'longitude': mission.current_location_lng,
                    'timestamp': mission.last_location_update
                }
        except Exception as e:
            logger.error(f"Error getting location: {str(e)}")
        return None
    
    def get_route_history(self, mission_number):
        """
        Get complete route history of a shipment
        """
        try:
            if self.redis_client:
                history_key = f"tracking_history:{mission_number}"
                route = self.redis_client.lrange(history_key, 0, -1)
                return [json.loads(point) for point in route]
        except Exception as e:
            logger.error(f"Error getting route history: {str(e)}")
        return []
    
    def update_delivery_status(self, mission_number, latitude, longitude):
        """
        Update delivery status based on location
        """
        try:
            mission = DeliveryMission.objects.get(mission_number=mission_number)
            
            # Check if reached delivery location
            if hasattr(mission, 'delivery_latitude'):
                distance = self.calculate_distance(
                    latitude, longitude,
                    mission.delivery_latitude,
                    mission.delivery_longitude
                )
                
                # If distance is less than 100 meters
                if distance < 0.1 and mission.delivery_status != 'delivered':
                    mission.delivery_status = 'delivered'
                    mission.actual_delivery_time = timezone.now()
                    mission.save()
                    
                    # Send notification
                    self.send_delivery_notification(mission)
            
            # Update location in database
            mission.current_location_lat = latitude
            mission.current_location_lng = longitude
            mission.last_location_update = timezone.now()
            mission.save(update_fields=['current_location_lat', 'current_location_lng', 'last_location_update'])
            
        except DeliveryMission.DoesNotExist:
            logger.warning(f"Mission {mission_number} not found")
    
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """
        Calculate distance between two points using Haversine formula
        """
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in kilometers
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    def send_delivery_notification(self, mission):
        """
        Send notification when delivery is completed
        """
        # Send notifications via WebSocket, Email, SMS
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        
        # Notify buyer
        async_to_sync(channel_layer.group_send)(
            f"user_{mission.id_order.id_buyer.id_user}",
            {
                'type': 'delivery_completed',
                'message': f'Your order #{mission.id_order.order_number} has been delivered successfully',
                'order_id': mission.id_order.order_number,
                'mission_id': mission.mission_number
            }
        )
        
        # Notify farmer
        async_to_sync(channel_layer.group_send)(
            f"user_{mission.id_order.id_farmer.id_user}",
            {
                'type': 'delivery_completed',
                'message': f'Order #{mission.id_order.order_number} has been delivered to the buyer',
                'order_id': mission.id_order.order_number,
                'mission_id': mission.mission_number
            }
        )
    
    def estimate_arrival_time(self, mission_number):
        """
        Estimate remaining arrival time
        """
        try:
            current_location = self.get_current_location(mission_number)
            if not current_location:
                return None
            
            mission = DeliveryMission.objects.get(mission_number=mission_number)
            
            if not hasattr(mission, 'delivery_latitude'):
                return None
            
            distance = self.calculate_distance(
                float(current_location['latitude']),
                float(current_location['longitude']),
                mission.delivery_latitude,
                mission.delivery_longitude
            )
            
            # Estimate time based on average speed of 60 km/h
            remaining_minutes = (distance / 60) * 60
            
            return {
                'distance_remaining': distance,
                'estimated_minutes': int(remaining_minutes),
                'estimated_arrival': timezone.now() + timedelta(minutes=remaining_minutes)
            }
        except Exception as e:
            logger.error(f"Error estimating arrival time: {str(e)}")
            return None
    
    def get_transporter_statistics(self, transporter_id, date_from=None, date_to=None):
        """
        Get delivery statistics for a specific transporter
        """
        try:
            missions = DeliveryMission.objects.filter(
                id_transporter=transporter_id
            )
            
            if date_from:
                missions = missions.filter(delivery_date__gte=date_from)
            if date_to:
                missions = missions.filter(delivery_date__lte=date_to)
            
            statistics = {
                'total_missions': missions.count(),
                'completed_missions': missions.filter(delivery_status='delivered').count(),
                'in_progress': missions.filter(delivery_status__in=['picked up', 'in transit']).count(),
                'total_distance': 0,  # Can be calculated from routes
                'average_delivery_time': None,  # Can be calculated from time differences
                'missions_by_day': {}
            }
            
            # Calculate missions per day
            for mission in missions:
                day = mission.delivery_date.strftime('%Y-%m-%d')
                statistics['missions_by_day'][day] = statistics['missions_by_day'].get(day, 0) + 1
            
            return statistics
            
        except Exception as e:
            logger.error(f"Error getting transporter statistics: {str(e)}")
            return None