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
    if not user:
        print(f"No user found for role {role}")
        return
    cv = ChatView()
    response, is_direct = cv._smart_bridge(user, role, msg)
    print(f"QUERY: {msg}")
    clean_response = response.encode('ascii', 'ignore').decode('ascii')
    print(f"RESPONSE:\n{clean_response}")
    print("-" * 30)

if __name__ == "__main__":
    test_queries = [
        "total fruits",
        "total vegetables",
        "total products"
    ]
    
    for q in test_queries:
        test_query(q)
