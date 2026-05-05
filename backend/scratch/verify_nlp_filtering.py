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
    buyer_user = User.objects.filter(user_type='buyer').first()
    
    if not buyer_user:
        print("Missing test user")
        return
        
    print("\n--- Testing Global Market: Price of Patates ---")
    message = "price of patates"
    content, is_direct = view._smart_bridge(buyer_user, UserTypeEnum.BUYER, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))
    
    print("\n--- Testing Global Market: Stock of Tomatoes ---")
    message = "stock of tomatoes"
    content, is_direct = view._smart_bridge(buyer_user, UserTypeEnum.BUYER, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

    print("\n--- Testing Buyer Orders: Pending count vs Detail ---")
    message = "pending orders"
    content, is_direct = view._smart_bridge(buyer_user, UserTypeEnum.BUYER, message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

if __name__ == "__main__":
    run_tests()
