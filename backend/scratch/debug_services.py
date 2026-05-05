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
        # Safely print keys and message length
        print(f"KEYS: {list(parsed.keys())}")
        print(f"TYPE: {parsed.get('type')}")
        # Print first few chars of message if they are ascii
        msg_text = parsed.get('message', '')
        print(f"MSG LEN: {len(msg_text)}")
        if all(ord(c) < 128 for c in msg_text[:10]):
            print(f"START: {msg_text[:20]}")
        else:
            print("START: (Contains non-ASCII characters)")
    except Exception as e:
        print(f"JSON ERROR: {e}")
        print(f"RAW LEN: {len(response)}")
    print("-" * 30)

if __name__ == "__main__":
    test_query("what services does the platform offer")
    test_query("vegetables")
