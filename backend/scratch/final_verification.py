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
    try:
        parsed = json.loads(response)
        # Safely check message content
        message = parsed.get('message', '')
        print(f"MESSAGE START: {message[:50]}...")
        if "available, including:" in message:
             print("SUCCESS: Found dynamic products list!")
        elif "AgriSouk DZ works in" in message:
             print("SUCCESS: Found explanation!")
    except Exception as e:
        print(f"ERROR: {e}")
    print("-" * 30)

if __name__ == "__main__":
    test_query("what vegetables do you have?")
    test_query("how it works")
    test_query("xyz")
