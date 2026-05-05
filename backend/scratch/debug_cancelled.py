import os
import sys
import django

# Setup Django
sys.path.append(r'c:\Users\MY LAPTOP\AgriGovMarketVerF-\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.chat.views import ChatView
from apps.users.models import User
from apps.core.constants import UserTypeEnum

def test_query(msg, role=UserTypeEnum.BUYER):
    user = User.objects.filter(user_type=role).first()
    cv = ChatView()
    response, is_direct = cv._smart_bridge(user, role, msg)
    print(f"QUERY: {msg}")
    print(f"IS DIRECT: {is_direct}")
    print(f"RESPONSE: {response}")
    print("-" * 30)

if __name__ == "__main__":
    test_query("total cancelled")
