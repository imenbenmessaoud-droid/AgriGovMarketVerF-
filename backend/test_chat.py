import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.chat.views import ChatView
from apps.users.models import User
from rest_framework.test import APIRequestFactory, force_authenticate

def test_chat():
    factory = APIRequestFactory()
    view = ChatView.as_view()
    
    # Get a test user (Admin or any existing user)
    user = User.objects.first()
    if not user:
        print("No users found in database.")
        return

    print(f"Testing chat with user: {user.name} ({user.user_type})")
    
    request = factory.post('/api/chat/', {'message': 'What price do you expect apple to cost in the coming days?'}, format='json')
    force_authenticate(request, user=user)
    
    response = view(request)
    resp_text = response.data.get('response', '')
    with open('chat_response.txt', 'w', encoding='utf-8') as f:
        f.write(resp_text)
    print("\nResponse saved to chat_response.txt")

if __name__ == "__main__":
    test_chat()
