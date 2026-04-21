# apps/deliveries/__init__.py
"""
Deliveries Management Application

This application handles all delivery-related operations including:
- Delivery mission creation and management
- Transporter assignment and tracking
- Real-time location tracking
- Delivery status updates
- Route history and optimization
- ETA calculations
- Delivery notifications

Key Features:
- Real-time GPS tracking with Redis
- Transporter assignment based on service area
- Delivery status workflow (Picked Up → In Transit → Delivered)
- Location history tracking
- Distance calculation and ETA estimation
- Automatic delivery notifications
- Transporter performance statistics
"""

default_app_config = 'apps.deliveries.apps.DeliveriesConfig'