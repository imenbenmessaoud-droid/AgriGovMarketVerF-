# apps/orders/__init__.py
"""
Orders Management Application

This application manages all order-related operations including:
- Order creation and processing
- Order item management
- Payment processing
- Invoice generation
- Order status tracking
- Payment status verification

Key Features:
- Multi-step order workflow (Pending → Confirmed → Cancelled)
- Payment integration with multiple gateways
- Automatic invoice generation
- Real-time order status updates
- Comprehensive order history
- Integration with products inventory
"""

default_app_config = 'apps.orders.apps.OrdersConfig'