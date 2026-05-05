import os
import sys
import django
import json

# Setup Django
sys.path.append(r'c:\Users\MY LAPTOP\AgriGovMarketVerF-\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.chat.views import ChatView
from django.contrib.auth.models import AnonymousUser

def test_query(msg):
    user = AnonymousUser()
    role = 'guest'
    cv = ChatView()
    
    response, is_direct = cv._smart_bridge(user, role, msg)
    print(f"QUERY: {msg}")
    print(f"IS DIRECT: {is_direct}")
    print(f"RESPONSE START: {response[:100]}...")
    print("-" * 30)

if __name__ == "__main__":
    test_query("What is the best time for planting?")
    test_query("how it works")
