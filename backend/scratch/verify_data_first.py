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
    
    # Get test users
    admin_user = User.objects.filter(user_type='admin').first()
    farmer_user = User.objects.filter(user_type='farmer').first()
    
    if not admin_user or not farmer_user:
        print("Missing test users")
        return
        
    print("--- Testing Admin: Total Products ---")
    message = "total products"
    content, is_direct = view._smart_bridge(admin_user, UserTypeEnum.ADMIN, message)
    print(f"Is Direct: {is_direct}")
    print(f"Content:\n{content.encode('ascii', 'ignore').decode('ascii')}")
    
    print("\n--- Testing Farmer: My Orders ---")
    message = "how many orders do i have"
    content, is_direct = view._smart_bridge(farmer_user, UserTypeEnum.FARMER, message)
    print(f"Is Direct: {is_direct}")
    print(f"Content:\n{content.encode('ascii', 'ignore').decode('ascii')}")

    print("\n--- Testing Admin: User Lookup ---")
    message = "total orders of saleh eddine"
    content, is_direct = view._smart_bridge(admin_user, UserTypeEnum.ADMIN, message)
    print(f"Is Direct: {is_direct}")
    print(f"Content:\n{content.encode('ascii', 'ignore').decode('ascii')}")

if __name__ == "__main__":
    run_tests()
