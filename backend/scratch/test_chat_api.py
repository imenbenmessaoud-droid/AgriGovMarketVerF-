import os
import sys
import django
import json

# Setup Django
sys.path.append(r'c:\Users\MY LAPTOP\AgriGovMarketVerF-\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from django.test import RequestFactory
from apps.chat.views import ChatView
from django.contrib.auth.models import AnonymousUser

def test_api():
    factory = RequestFactory()
    request = factory.post('/api/chat/', json.dumps({
        "message": "What are the best fertilizers for wheat?",
        "history": []
    }), content_type='application/json')
    request.user = AnonymousUser()

    view = ChatView.as_view()
    response = view(request)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Data: {response.data}")

if __name__ == "__main__":
    test_api()
