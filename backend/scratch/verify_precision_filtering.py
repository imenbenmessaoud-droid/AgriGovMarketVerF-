import os
import sys
import django

# Set up Django environment
sys.path.append(r'c:\Users\MY LAPTOP\AgriGovMarketVerF-\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.chat.views import ChatView
from apps.users.models import User
from apps.core.constants import UserTypeEnum

def run_tests():
    view = ChatView()
    
    # Test as Admin
    admin_user = User.objects.filter(user_type='admin').first()
    if not admin_user:
        print("Admin user not found")
        return

    print("\n--- Testing Admin: list saleh eddine products ---")
    message = "list saleh eddine products"
    content, is_direct = view._smart_bridge(admin_user, UserTypeEnum.ADMIN, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

    print("\n--- Testing Global: price of apple ---")
    message = "price of apple"
    # price of apple contains 'price' so intent is 'market'
    content, is_direct = view._smart_bridge(admin_user, UserTypeEnum.ADMIN, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

    print("\n--- Testing Global: apple ---")
    message = "apple"
    # 'apple' doesn't have keywords, so intent might be None
    content, is_direct = view._smart_bridge(admin_user, UserTypeEnum.ADMIN, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

    print("\n--- Testing Global: prices patates ---")
    message = "prices patates"
    # 'prices' is in market intent keywords
    content, is_direct = view._smart_bridge(admin_user, UserTypeEnum.ADMIN, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

    print("\n--- Testing Admin: stock of apple of Israa ---")
    message = "stock of apple of Israa"
    content, is_direct = view._smart_bridge(admin_user, UserTypeEnum.ADMIN, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

    print("\n--- Testing Global: information of firma city ---")
    message = "information of firma city"
    content, is_direct = view._smart_bridge(admin_user, UserTypeEnum.ADMIN, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

    print("\n--- Testing Admin: Total Revenue of saleh eddine ---")
    message = "Total Revenue of saleh eddine"
    content, is_direct = view._smart_bridge(admin_user, UserTypeEnum.ADMIN, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

    print("\n--- Testing Admin: total deliveries of Amir Ali ---")
    message = "total deliveries of Amir Ali"
    content, is_direct = view._smart_bridge(admin_user, UserTypeEnum.ADMIN, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

    print("\n--- Testing Admin: active missions ---")
    message = "active missions"
    content, is_direct = view._smart_bridge(admin_user, UserTypeEnum.ADMIN, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

if __name__ == "__main__":
    run_tests()
