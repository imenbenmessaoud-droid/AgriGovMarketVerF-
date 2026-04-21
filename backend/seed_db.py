
import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.users.models import User, Administrator, Farmer, Buyer, Transporter
from apps.products.models import Category, Product, ProductItem

def seed():
    # 1. Create Users
    if not User.objects.filter(email='admin@agrigov.com').exists():
        admin_user = User.objects.create_superuser(
            email='admin@agrigov.com',
            password='adminpassword',
            name='Super Admin'
        )
        Administrator.objects.get_or_create(user=admin_user)
        print("Created Admin: admin@agrigov.com / adminpassword")

    if not User.objects.filter(email='farmer@agrigov.com').exists():
        farmer_user = User.objects.create_user(
            email='farmer@agrigov.com',
            password='password123',
            name='Ahmed the Farmer',
            user_type='Farmer'
        )
        Farmer.objects.get_or_create(user=farmer_user)
        print("Created Farmer: farmer@agrigov.com / password123")

    if not User.objects.filter(email='buyer@agrigov.com').exists():
        buyer_user = User.objects.create_user(
            email='buyer@agrigov.com',
            password='password123',
            name='Mehdi the Buyer',
            user_type='Buyer'
        )
        Buyer.objects.get_or_create(user=buyer_user)
        print("Created Buyer: buyer@agrigov.com / password123")

    if not User.objects.filter(email='transporter@agrigov.com').exists():
        transporter_user = User.objects.create_user(
            email='transporter@agrigov.com',
            password='password123',
            name='Samir the Transporter',
            user_type='Transporter'
        )
        Transporter.objects.get_or_create(
            user=transporter_user,
            area_service='Algiers, Blida',
            vehicle_type='Refrigerated Truck',
            vehicle_capacity=2000.0,
            license_number='TR-12345678'
        )
        print("Created Transporter: transporter@agrigov.com / password123")

    # 2. Create Categories
    veg, _ = Category.objects.get_or_create(category_name='Vegetables', category_description='Fresh farm vegetables')
    fru, _ = Category.objects.get_or_create(category_name='Fruits', category_description='Seasonal organic fruits')
    
    # 3. Create Products (Blueprints)
    tomato, _ = Product.objects.get_or_create(product_name='Premium Tomatoes', id_category=veg, product_quality='premium')
    potato, _ = Product.objects.get_or_create(product_name='Russet Potatoes', id_category=veg, product_quality='standard')
    apple, _ = Product.objects.get_or_create(product_name='Red Apples', id_category=fru, product_quality='premium')

    # 4. Create Product Items (Active Offers)
    f_profile = Farmer.objects.get(user__email='farmer@agrigov.com')
    prod_date = timezone.now().date() - timedelta(days=2)
    
    ProductItem.objects.get_or_create(
        id_product=tomato, id_farmer=f_profile, 
        quantity=100, product_price=120, is_available=True,
        production_date=prod_date
    )
    ProductItem.objects.get_or_create(
        id_product=potato, id_farmer=f_profile, 
        quantity=500, product_price=65, is_available=True,
        production_date=prod_date
    )
    ProductItem.objects.get_or_create(
        id_product=apple, id_farmer=f_profile, 
        quantity=50, product_price=250, is_available=True,
        production_date=prod_date
    )

    print("Database seeded successfully!")

if __name__ == '__main__':
    seed()
