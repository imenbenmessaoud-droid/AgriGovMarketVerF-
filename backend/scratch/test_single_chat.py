import os
import django
import sys

# Fix sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "agrigov.settings")
django.setup()

from apps.chat.views import ChatView
from apps.users.models import User

buyer = User.objects.filter(user_type='buyer').first()
viewset = ChatView()

q = "Can I change the quantity after placing an order?"

try:
    # 1. SMART BRIDGE (Data retrieval & Intent Detection)
    context, is_direct = viewset._smart_bridge(buyer, 'buyer', q)
    print(f"Smart Bridge - is_direct: {is_direct}")
    print(f"Smart Bridge - context: {context[:100]}...")
    
    if is_direct:
        print(f"Direct Response: {context}")
    else:
        # 2. AI INFERENCE
        print("Sending to Groq for inference...")
        ai_response = viewset._call_groq(buyer, 'buyer', q, context, [])
        print(f"Groq AI Response: {ai_response}")
        
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
