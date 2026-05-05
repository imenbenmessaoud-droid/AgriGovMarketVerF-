import os
import sys
import django

# Setup Django
sys.path.append(r'c:\Users\MY LAPTOP\AgriGovMarketVerF-\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.chat.views import ChatView

def test_fallback(msg):
    cv = ChatView()
    # Simulate a fallback call for a farming query
    response = cv._smart_fallback(msg, "", "en", "API_ERROR")
    print(f"QUERY: {msg}")
    print(f"FALLBACK RESPONSE: {response}")
    print("-" * 30)

if __name__ == "__main__":
    test_fallback("What is the best time for planting?")
    test_fallback("hello")
