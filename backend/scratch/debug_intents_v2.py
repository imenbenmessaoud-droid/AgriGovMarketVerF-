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
    
    # Check what intents are being detected
    msg_lower = msg.lower()
    visitor_intents = {
        'products': ['vegetable', 'fruit', 'product', 'kind of', 'sell', 'fresh', 'organic', 'come from', 'affordable', 'price', 'browse products', 'shop now', 'خضر', 'فواكه', 'طازجة', 'عضوية', 'من أين', 'أسعار', 'رخيصة', 'officiel'],
        'explanation': ['how work', 'how platform', 'how it work', 'how does it work', 'process', 'steps', 'mechanism', 'طريقة العمل', 'كيفية العمل', 'كيف تعمل'],
        'delivery': ['deliver', 'area', 'how long', 'available today', 'who delivers', 'time', 'home', 'delivery info', 'توصيل', 'منطقة', 'كم من الوقت', 'اليوم', 'من يوصل', 'وقت', 'خارج'],
        'payment': ['pay', 'cash on delivery', 'before or after', 'secure', 'دفع', 'عند الاستلام', 'قبل أم بعد', 'آمن', 'طريقة', 'cod'],
        'about': ['what is', 'trusted', 'official', 'who manages', 'agrisouk', 'learn more', 'services', 'offer', 'features', 'ما هو', 'موثوق', 'من يدير', 'فرق', 'different', 'خدمات', 'عرض'],
        'getting_started': ['create account', 'sign up', 'register', 'how join', 'account', 'فتح حساب', 'شراء', 'تصفح', 'بدون حساب', 'كيف أبدأ'],
        'farmers': ['sell my product', 'register as a farmer', 'commission', 'farmer register', 'أريد البيع', 'تسجيل فلاح', 'عمولة', 'موثق', 'verified', 'بيع'],
        'contact': ['contact', 'support', 'help', 'contact us', 'اتصال', 'دعم', 'مساعدة', 'أين', 'سؤال', 'question']
    }
    
    intent = 'general'
    for key, keywords in visitor_intents.items():
        if any(all(subword in msg_lower for subword in k.split()) for k in keywords):
            intent = key
            break
    print(f"QUERY: {msg}")
    print(f"DETECTED INTENT IN SCRIPT: {intent}")
    
    response, is_direct = cv._smart_bridge(user, role, msg)
    print(f"IS DIRECT: {is_direct}")
    try:
        parsed = json.loads(response)
        print(f"JSON TYPE: {parsed.get('type')}")
        print(f"JSON MSG LEN: {len(parsed.get('message', ''))}")
    except Exception as e:
        print(f"NOT JSON: {e}")
        print(f"RAW LEN: {len(response)}")
    print("-" * 30)

if __name__ == "__main__":
    test_query("what services does the platform offer")
