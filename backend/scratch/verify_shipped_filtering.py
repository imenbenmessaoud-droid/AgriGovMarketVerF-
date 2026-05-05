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

    print("\n--- Testing Admin: shipped orders of saleh eddine ---")
    message = "shipped orders of saleh eddine"
    content, is_direct = view._handle_admin_request('orders', message)
    print(f"Is Direct: {is_direct}")
    print(content.encode('ascii', 'ignore').decode('ascii'))

    # Test as Farmer (Saleh eddine himself)
    saleh = User.objects.filter(name='Saleh eddine').first()
    if saleh:
        print("\n--- Testing Farmer (Saleh): shipped orders ---")
        message = "shipped orders"
        content, is_direct = view._handle_farmer_request(saleh, 'orders', message)
        print(f"Is Direct: {is_direct}")
        print(content.encode('ascii', 'ignore').decode('ascii'))

if __name__ == "__main__":
    run_tests()
