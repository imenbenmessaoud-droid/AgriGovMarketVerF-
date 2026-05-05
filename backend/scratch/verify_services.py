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
    try:
        parsed = json.loads(response)
        print(f"INTENT MATCHED: {parsed.get('type')}")
        print(f"MESSAGE: {parsed.get('message')[:100]}...")
    except:
        print(f"RESPONSE: {response[:100]}...")
    print("-" * 30)

if __name__ == "__main__":
    test_query("what services does the platform offer")
