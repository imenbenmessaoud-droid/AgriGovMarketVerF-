# apps/products/__init__.py
"""
Products Management Application

This application handles all product-related functionality including:
- Product categories management
- Product catalog and inventory
- Official price ranges set by the ministry
- Product items tracking for farmers
- Price validation against official rates

Key Features:
- Category management with admin oversight
- Product catalog with quality classification
- Official price range management
- Inventory tracking per farmer
- Automatic price validation
- Market price analysis
"""

default_app_config = 'apps.products.apps.ProductsConfig'