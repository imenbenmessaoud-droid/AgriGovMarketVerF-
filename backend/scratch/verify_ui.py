import os
import sys
import django

# Setup Django
sys.path.append(r'c:\Users\MY LAPTOP\AgriGovMarketVerF-\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.chat.views import ChatView
from apps.users.models import User

def test_query(msg, role='admin'):
    user = User.objects.filter(user_type=role).first()
    cv = ChatView()
    response, is_direct = cv._smart_bridge(user, role, msg)
    print(f"QUERY: {msg}")
    # Strip emojis for Windows terminal
    clean_response = response.encode('ascii', 'ignore').decode('ascii')
    print(f"RESPONSE:\n{clean_response}")
    print("-" * 30)

if __name__ == "__main__":
    test_query("ministry price of apple")
    test_query("price of apple")
