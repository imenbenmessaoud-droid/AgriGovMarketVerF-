import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "agrigov.settings")
django.setup()

from apps.chat.views import ChatViewSet
from apps.users.models import User, Buyer

# Get any buyer
buyer = User.objects.filter(user_type='buyer').first()
if not buyer:
    print("No buyer found")
    sys.exit()

viewset = ChatViewSet()

questions = [
    "Do you have fresh tomatoes today?",
    "I want to buy potatoes in bulk, what is the price?",
    "Are there any discounts on vegetables this week?",
    "Where can I buy organic fruits?",
    "Are your products locally produced or imported?",
    "What is the price per kilogram of apples?",
    "Do you offer discounts for wholesale purchases?",
    "How can I pay? Cash or online?",
    "Is your payment system secure?",
    "Does the price change depending on quantity?",
    "How long does delivery take?",
    "Is delivery available to M’sila?",
    "Who delivers the products, the farmer or a transporter?",
    "How much does delivery cost?",
    "Can I choose the delivery time?"
]

print("# Chatbot Real Responses (Buyer Persona)\n")
for q in questions:
    print(f"**Q: {q}**")
    # Simulate routing
    try:
        # Detect intent using smart bridge
        intent, confidence, keywords = viewset._smart_bridge(q)
        res, is_direct = viewset._route_request(user=buyer, role='buyer', intent=intent, message=q)
        
        if res is None:
            # Fallback to groq
            res = viewset._call_groq(user=buyer, role='buyer', message=q, context="")
            
        print(f"**A:** {res}\n")
        print("---")
    except Exception as e:
        print(f"**A:** [Error processing query: {e}]\n")
