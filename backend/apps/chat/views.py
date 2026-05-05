import re
import os
import random
import json
import logging
import urllib.request
import urllib.error
import time
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from django.db.models import Count, Sum, Max, Min, Q

from apps.users.models import User, Farmer, Buyer, Transporter, TransporterVehicle
from apps.farms.models import Farm
from apps.products.models import Product, ProductItem, Category
from apps.orders.models import Order, OrderItem
from apps.deliveries.models import DeliveryMission
from apps.core.constants import OrderStatusEnum, DeliveryStatusEnum, UserTypeEnum

logger = logging.getLogger(__name__)

class ChatView(APIView):
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            user = request.user
            is_guest = not user.is_authenticated
            role = getattr(user, 'user_type', 'guest')
            message = request.data.get('message', '')
            history = request.data.get('history', [])

            if not message:
                return Response({"response": "I didn't hear anything. How can I help you today?"}, status=status.HTTP_200_OK)

            # 0. CACHE CHECK (Safe access to ID)
            user_id = getattr(user, 'id_user', 'guest') if not is_guest else 'guest'
            cache_key = f"chat_{user_id}_{hash(message.strip().lower())}"
            
            cached_response = cache.get(cache_key)
            if cached_response:
                return Response({"response": cached_response}, status=status.HTTP_200_OK)

            # 1. SMART BRIDGE (Data retrieval & Intent Detection)
            context, is_direct = self._smart_bridge(user, role, message)
            
            if is_direct:
                if "⚠️" not in context:
                    cache.set(cache_key, context, 300)
                return Response({"response": context}, status=status.HTTP_200_OK)

            # 2. AI INFERENCE
            ai_response = self._call_groq(user, role, message, context, history)

            # 3. CACHE RESULT
            error_markers = ["API Error", "Connection Error", "⚠️", "busy", "مشغول"]
            if not any(marker in ai_response for marker in error_markers):
                cache.set(cache_key, ai_response, 300)

            return Response({"response": ai_response}, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            print(f"CRITICAL CHAT ERROR: {str(e)}")
            traceback.print_exc()
            return Response({
                "response": "⚠️ The assistant encountered an internal error. Please try again or ask a simpler question about products."
            }, status=status.HTTP_200_OK)

    def _detect_language(self, message):
        if re.search(r'[\u0600-\u06FF]', message):
            return 'ar'
            
        fr_keywords = ['prix', 'marché', 'tendance', 'commande', 'livraison', 'ferme', 'produit', 'suivi', 'bonjour', 'salut', 'quel', 'sera', 'les', 'des', 'dans', 'votre', 'avis', 'pomme', 'terre']
        
        message_lower = message.lower()
        if any(re.search(rf'\b{word}\b', message_lower) for word in fr_keywords):
            return 'fr'
            
        return 'en'

    def _smart_bridge(self, user, role, message):
        """
        Main logic dispatcher that handles intent detection, entity extraction, and permission enforcement.
        """
        
        # 1. IDENTIFY INTENT & TARGET
        intent_map = {
            'agriculture_advice': ['planting', 'grow', 'disease', 'black', 'best time', 'when to', 'fertilizer', 'soil', 'seed', 'water', 'improve', 'increase', 'yield', 'productivity', 'agricultural', 'نصيحة', 'زراعة', 'نمو', 'مرض', 'طقس', 'سماد', 'تربة', 'سقي', 'موسم', 'كيف', 'نبات'],
            'advice': ['tips', 'help', 'suggest', 'how to', 'conseil', 'astuce', 'aide', 'comment', 'نصيحة', 'نصائح', 'مساعدة'],
            'analytics': ['analytics', 'summary', 'global', 'overview', 'تحليل', 'إحصائيات', 'منصة', 'statistiques', 'global'],
            'accounts': ['user', 'farmer', 'buyer', 'transporter', 'carrier', 'validation', 'accounts', 'utilisateur', 'agriculteur', 'acheteur', 'transporteur', 'مستخدم', 'فلاح', 'مشتري', 'ناقل', 'active', 'pending', 'rejected', 'breakdown'],
            'inventory': ['product', 'stock', 'inventory', 'categories', 'category', 'vegetable', 'fruit', 'item', 'list of vegetables', 'list of products', 'سلع', 'منتج', 'مخزون', 'produit', 'légume', 'fruit', 'catégorie', 'inventaire', 'show', 'latest', 'popular'],
            'finance': ['order', 'commande', 'sales', 'revenue', 'earnings', 'volume', 'price', 'prices', 'money', 'طلبية', 'مبيعات', 'سيولة', 'سعر', 'أرخص', 'أغلى', 'بكم', 'history', 'range', 'cancelled', 'canceled', 'pending', 'delivered', 'confirmed'],
            'delivery': ['deliver', 'deliveries', 'mission', 'cargo', 'area', 'route', 'fleet', 'truck', 'vehicle', 'capacity', 'livraison', 'camion', 'véhicule', 'capacité', 'توصيل', 'شاحنة', 'مركبة', 'shipping', 'transport', 'track', 'livraisons', 'logistics', 'missions'],
            'farms': ['farm', 'مزرعة', 'ferme', 'domain', 'terrain', 'information', 'details', 'info', 'tell me about', 'معلومات', 'تفاصيل', 'origin', 'where from', 'where do', 'source', 'مصدر', 'من أين'],
            'monitoring': ['report', 'reports', 'issue', 'complaint', 'problem', 'rapport', 'problème', 'بلاغ', 'شكوى', 'مشكلة'],
            'visitor': ['what is', 'how does', 'work', 'trusted', 'official', 'who manages', 'agrisouk', 'deliver', 'area', 'pay', 'account', 'register', 'contact', 'help', 'ما هو', 'كيف يعمل', 'موثوق', 'من يدير', 'توصيل', 'دفع', 'حساب', 'اتصال', 'مساعدة']
        }

        # Force intent to 'finance' if an explicit order ID is present
        if re.search(r'(?:order|commande|طلبية|id)\s*#?(?:ord-)?(\d+)', message, re.IGNORECASE):
            intent = 'finance'
        else:
            intent = None
            message_lower = message.lower()
            for key, keywords in intent_map.items():
                if any(word.lower() in message_lower for word in keywords):
                    intent = key
                    break
            
            # Fallback: Detect product-specific intent
            if not intent and self._extract_product(message):
                intent = 'inventory'

        # DEFAULT: If no intent matched, set to general to trigger AI
        if not intent:
            intent = 'general'
            
        self._last_intent = intent

        target_users = self._extract_users(message)
        target_user = target_users[0] if target_users else None
        
        # 2. ATTEMPT SPECIFIC ENTITY LOOKUPS (Highest Priority)
        # These can work even without an intent
        specific_response = self._handle_specific_lookups(user, role, message, target_users)
        if specific_response:
            return specific_response, True

        # 3. ENFORCE REDLINE (RBAC) & FETCH DATA
        return self._route_request(user, role, intent, message, target_user)

    def _handle_specific_lookups(self, user, role, message, target_users=[]):
        """Attempts to find a Farm, Order, or multiple Users directly from the message."""
        from apps.farms.models import Farm
        from apps.orders.models import Order
        from apps.core.constants import UserTypeEnum
        
        # 1. Multi-User Info Lookup (Highest Priority for information queries)
        contact_keywords = ['info', 'details', 'tell me about', 'معلومات', 'تفاصيل', 'who is', 'من هو', 'contact', 'phone', 'email', 'رقم', 'هاتف', 'اتصال']
        if any(w in message.lower() for w in contact_keywords):
            if target_users:
                if role != UserTypeEnum.ADMIN:
                    # Contextual Permission Check:
                    # Allow Transporters/Farmers to see contacts of their stakeholders in assigned missions/orders
                    shared_users = []
                    for u in target_users:
                        if u == user:
                            shared_users.append(u)
                            continue
                            
                        # Check shared missions
                        is_stakeholder = False
                        if role == UserTypeEnum.TRANSPORTER:
                            from apps.deliveries.models import DeliveryMission
                            # Is the target user the farmer or buyer of one of my missions?
                            if DeliveryMission.objects.filter(
                                id_transporter__user=user,
                                id_order__id_buyer__user=u
                            ).exists() or DeliveryMission.objects.filter(
                                id_transporter__user=user,
                                id_order__id_farmer__user=u
                            ).exists():
                                is_stakeholder = True
                        
                        elif role == UserTypeEnum.FARMER:
                            # Is the target user the buyer or transporter of one of my orders?
                            if Order.objects.filter(id_farmer__user=user, id_buyer__user=u).exists():
                                is_stakeholder = True
                            # Check transporter via mission
                            from apps.deliveries.models import DeliveryMission
                            if DeliveryMission.objects.filter(id_order__id_farmer__user=user, id_transporter__user=u).exists():
                                is_stakeholder = True

                        if is_stakeholder:
                            shared_users.append(u)
                    
                    if not shared_users:
                        return "Security: You do not have permission to view other users' private profiles unless they are part of your assigned missions."
                    target_users = shared_users

                res = "👤 User Information Profiles:\n"
                show_contacts = any(w in message.lower() for w in ['phone', 'email', 'contact', 'رقم', 'هاتف', 'اتصال'])
                for u in target_users:
                    res += f"\n--- {u.name} ---\n"
                    res += f"Type: {u.get_user_type_display()}\n"
                    res += f"Wilaya: {u.wilaya or 'N/A'}\n"
                    res += f"Status: {'Active ✅' if u.is_active else 'Inactive ❌'}\n"
                    if role == UserTypeEnum.ADMIN and show_contacts:
                        res += f"Phone: {u.phone or 'N/A'}\n"
                        res += f"Email: {u.email}\n"
                return res

        # 2. Specific Farm Lookup
        farms = Farm.objects.all()
        for f in farms:
            if re.search(rf'\b{re.escape(f.FarmName)}\b', message, re.IGNORECASE):
                if role == UserTypeEnum.ADMIN or f.farmer.user == user:
                    return f"""
                    [FARM DATA FOUND]
                    Farm Name: {f.FarmName}
                    Location: {f.LocationFarm}
                    Size: {f.Size} hectares
                    Status: {'Active' if f.is_active else 'Inactive'}
                    """
                else:
                    return "Security: You do not have permission to view the details of this specific farm."

        # 2. Specific Order ID Lookup
        order_match = re.search(r'(?:order|id|ord)\s*#?(?:ord-)?(\d+)', message, re.IGNORECASE)
        if order_match:
            order_id = int(order_match.group(1))
            order_context = self._get_specific_order_context(user, role, order_id)
            if order_context:
                return order_context
                
        return None

    def _route_request(self, user, role, intent, message, target_user=None):
        # A. GUEST / VISITOR HANDLING (Dynamic Mode)
        if role == 'guest':
            res, is_direct = self._handle_visitor_request(message, intent)
            print(f"DEBUG | Visitor Handler Response | Direct: {is_direct}")
            return res, is_direct

        # B. ROLE-SPECIFIC HANDLERS
        
        if role == UserTypeEnum.ADMIN:
            role_context, is_direct = self._handle_admin_request(intent, message, target_user)
        elif role == UserTypeEnum.FARMER:
            role_context, is_direct = self._handle_farmer_request(user, intent, message)
        elif role == UserTypeEnum.BUYER:
            role_context, is_direct = self._handle_buyer_request(user, intent, message, target_user)
        elif role == UserTypeEnum.TRANSPORTER:
            role_context, is_direct = self._handle_transporter_request(user, intent, message, target_user)

        if role_context:
            return role_context, is_direct
        
        # C. GLOBAL FALLBACK (If role-specific handler didn't catch it)
        # If it's advice or general, we want it to go to AI (is_direct=False)
        if intent in ['agriculture_advice', 'advice', 'general']:
            return f"The user is asking for {intent}. Provide a helpful, concise response based on this message: {message}. If it's a farming question, provide expert agricultural advice.", False

        if intent == 'inventory':
            return self._handle_pricing_analytics(message, target_user)
        elif intent == 'analytics':
            return self._handle_global_stats()
            
        # Default fallback context for simple queries
        if any(w in message.lower() for w in ['hello', 'hi', 'hey', 'سلام', 'bonjour']):
             return "[GREETING] No specific data needed. Just be friendly.", False

        return "I found the intent but no specific data handler matched your request. Please try asking about products, orders, or agricultural advice.", False


    # ============================================
    # ENTITY EXTRACTION HELPERS
    # ============================================
    def _extract_product(self, message):
        """Extracts a Product object from the message using synonyms."""
        from apps.products.models import Product
        
        synonyms = {
            'patate': 'Patates', 'patates': 'Patates', 'potato': 'Patates', 'potatoes': 'Patates', 'بطاطا': 'Patates',
            'tomato': 'Tomatoes', 'tomatoes': 'Tomatoes', 'طماطم': 'Tomatoes', 'tomate': 'Tomatoes',
            'apple': 'Apple', 'apples': 'Apple', 'تفاح': 'Apple', 'pomme': 'Apple',
            'pepper': 'Pepper', 'peppers': 'Pepper', 'piment': 'Pepper', 'فلفل': 'Pepper',
            'carrot': 'Carrot', 'carrots': 'Carrot', 'جزر': 'Carrot', 'carotte': 'Carrot',
            'onion': 'Onion', 'onions': 'Onion', 'بصل': 'Onion', 'oignon': 'Onion',
            'garlic': 'Garlic', 'ثوم': 'Garlic', 'ail': 'Garlic',
            'banana': 'Banana', 'banane': 'Banana', 'موز': 'Banana',
            'pear': 'Pear', 'pears': 'Pear', 'poire': 'Pear', 'إجاص': 'Pear',
            'orange': 'Orange', 'برتقال': 'Orange',
            'date': 'Dates', 'دجلة': 'Dates', 'تمر': 'Dates'
        }
        
        msg_lower = message.lower()
        for syn, actual_name in synonyms.items():
            if f" {syn} " in f" {msg_lower} " or msg_lower.endswith(syn) or msg_lower.startswith(syn):
                return Product.objects.filter(product_name__icontains=actual_name).first()
        return None

    def _extract_user(self, message):
        users = self._extract_users(message)
        return users[0] if users else None

    def _extract_users(self, message):
        """Extracts a list of User objects from the message."""
        from apps.users.models import User
        users = User.objects.all()
        msg_lower = message.lower()
        found = []
        
        # Sort users by name length (descending) to avoid partial matches
        for u in sorted(users, key=lambda x: len(x.name), reverse=True):
            pattern = rf'\b{re.escape(u.name.lower())}\b'
            if len(u.name) > 3 and re.search(pattern, msg_lower):
                if u not in found:
                    found.append(u)
        return found

    # ============================================
    # GLOBAL MARKET QUERIES
    # ============================================
    def _handle_global_market_request(self, intent, message, target_user=None):
        """Handles dynamic marketplace queries that any stakeholder can ask."""
        lang = self._detect_language(message)
        
        if intent == 'products' or intent == 'market' or self._extract_product(message):
            p = self._extract_product(message)
            if p:
                # 1. Official Ministry Price (PriceOff)
                from apps.products.models import PriceOff
                official = PriceOff.objects.filter(id_product=p).first()
                official_info = ""
                if official:
                    official_info = f"\n🏛 Official Range (Ministry): {official.min_price} - {official.max_price} DZD/kg"
                
                # 2. Current Market Items
                from apps.products.models import ProductItem
                from django.db.models import Sum, Avg, Min, Max
                
                # If target_user is provided, filter by that farmer
                if target_user:
                    items = ProductItem.objects.filter(id_product=p, id_farmer__user=target_user)
                    total_stock = items.aggregate(t=Sum('quantity'))['t'] or 0
                    if lang == 'fr':
                        return f"📦 Inventaire de {target_user.name} : {p.product_name}\nStock actuel : {total_stock} kg", True
                    elif lang == 'ar':
                        return f"📦 مخزون {target_user.name}: {p.product_name}\nالمخزون الحالي: {total_stock} كغ", True
                    else:
                        return f"📦 {target_user.name}'s Inventory: {p.product_name}\nCurrent Stock: {total_stock} kg", True
                
                items = ProductItem.objects.filter(id_product=p)
                if items.exists():
                    lowest = items.aggregate(m=Min('product_price'))['m']
                    highest = items.aggregate(m=Max('product_price'))['m']
                    total_stock = items.aggregate(t=Sum('quantity'))['t'] or 0
                        
                    if lang == 'fr':
                        return f"📈 Surveillance des prix : {p.product_name}\nFourchette de prix actuelle : {lowest} - {highest} DZD/kg{official_info}\nStock disponible : {total_stock} unités", True
                    elif lang == 'ar':
                        return f"📈 مراقبة الأسعار: {p.product_name}\nنطاق السعر الحالي: {lowest} - {highest} دج/كغ{official_info}\nالمخزون المتاح: {total_stock} وحدة", True
                    else:
                        return f"📈 Market Data: {p.product_name}\nCurrent Market Range: {lowest} - {highest} DZD/kg{official_info}\nStock Available: {total_stock} units", True
                
                if official:
                    return f"📈 Price Info: {p.product_name}{official_info}\nCurrently, there is no active stock listed on the marketplace.", True
                
                if lang == 'fr':
                    return f"Le produit {p.product_name} existe, mais il n'y a pas de stock actif pour déterminer les prix.", True
                elif lang == 'ar':
                    return f"المنتج {p.product_name} موجود، ولكن لا يوجد مخزون نشط لتحديد الأسعار.", True
                return f"The product {p.product_name} exists, but there is no active stock to determine prices.", True
                
                if lang == 'fr':
                    return f"Je n'ai trouvé aucun produit correspondant à '{product_name}'.", False
                elif lang == 'ar':
                    return f"لم أتمكن من العثور على أي منتجات مطابقة لـ '{product_name}'.", False
                return f"I couldn't find any products matching '{product_name}'.", False
                
            cat_match = re.search(r'(how many|list the|search for|list of all|list all|list|liste des|combien de|بحث عن)\s+([a-zA-Z\s\u0600-\u06FF]+)', message)
            if cat_match:
                cat_name = cat_match.group(2).strip('? ')
                if 'order' in cat_name.lower() or 'commande' in cat_name.lower() or 'طلبات' in cat_name.lower():
                    return None
                    
                if cat_name in ['categories', 'category', 'product categories', 'catégories', 'catégorie', 'فئات', 'الفئات']:
                    categories = Category.objects.all()
                    
                    if lang == 'fr':
                        cat_list = "\n".join([f"- {c.category_name}: {c.products.count()} produits" for c in categories])
                        return f"📊 Aperçu des Catégories\nNous prenons actuellement en charge {categories.count()} catégories :\n{cat_list}"
                    elif lang == 'ar':
                        cat_list = "\n".join([f"- {c.category_name}: {c.products.count()} منتجات" for c in categories])
                        return f"📊 نظرة عامة على الفئات\nنحن ندعم حاليًا {categories.count()} فئات:\n{cat_list}"
                    else:
                        cat_list = "\n".join([f"- {c.category_name}: {c.products.count()} products" for c in categories])
                        return f"📊 Category Overview\nWe currently support {categories.count()} categories:\n{cat_list}"
                    
                category = Category.objects.filter(category_name__icontains=cat_name).first()
                if category:
                    prod_count = Product.objects.filter(id_category=category).count()
                    item_count = ProductItem.objects.filter(id_product__id_category=category, is_available=True).aggregate(t=Sum('quantity'))['t'] or 0
                    prod_names = ", ".join([p.product_name for p in Product.objects.filter(id_category=category)[:5]])
                    
                    if lang == 'fr':
                        return f"📊 Recherche de Catégorie : {category.category_name}\nTypes de produits : {prod_count}\nUnités disponibles : {item_count}\nExemples : {prod_names}"
                    elif lang == 'ar':
                        return f"📊 البحث في الفئات: {category.category_name}\nأنواع المنتجات: {prod_count}\nالوحدات المتاحة: {item_count}\nأمثلة: {prod_names}"
                    else:
                        return f"📊 Category Search: {category.category_name}\nTotal Product Types: {prod_count}\nTotal Units Available: {item_count}\nExamples: {prod_names}"
                
                if lang == 'fr':
                    return None
                elif lang == 'ar':
                    return None
                return None
                
            if intent == 'market' and ('trends' in message or 'tendance' in message or 'اتجاهات' in message):
                items = ProductItem.objects.filter(is_available=True)
                if items.exists():
                    lowest = items.aggregate(m=Min('product_price'))['m']
                    highest = items.aggregate(m=Max('product_price'))['m']
                    analytics = self._get_mock_analytics(lowest)
                    
                    if lang == 'fr':
                        return f"📈 Tendances du Marché\nPrix le plus bas (30j) : {lowest} DZD/kg\nPrix le plus élevé (30j) : {highest} DZD/kg\nNote moyenne : {analytics['rating']} ⭐ ({analytics['review_count']} avis)\nTendance : Les légumes sont actuellement très demandés !"
                    elif lang == 'ar':
                        return f"📈 اتجاهات السوق\nأدنى سعر (30 يوم): {lowest} دج/كغ\nأعلى سعر (30 يوم): {highest} دج/كغ\nمتوسط التقييم: {analytics['rating']} ⭐ ({analytics['review_count']} مراجعة)\nالاتجاه: الخضروات مطلوبة بشدة حاليًا!"
                    else:
                        return f"📈 Market Trends\n30-Day Lowest Price: {lowest} DZD/kg\n30-Day Highest Price: {highest} DZD/kg\nAverage Rating: {analytics['rating']} ⭐ ({analytics['review_count']} reviews)\nCategory Trend: Vegetables are currently high in demand!"
        return None

    # ============================================
    # MOCK ANALYTICS ENGINE
    # ============================================
    def _get_mock_analytics(self, seed_val):
        """Generates realistic analytics data based on a seed value (e.g. farm size)"""
        random.seed(seed_val)
        return {
            'yield': round(random.uniform(5.0, 50.0) * (seed_val or 1), 2),
            'efficiency': random.randint(75, 98),
            'quality': random.choice(['Grade A (Premium)', 'Grade B (Standard)', 'Grade A+ (Export Quality)']),
            'rating': round(random.uniform(3.5, 5.0), 1),
            'review_count': random.randint(10, 500)
        }

    # ============================================
    # FARMER HANDLER
    # ============================================
    def _handle_farmer_request(self, user, intent, message):
        farmer_profile = Farmer.objects.get(user=user)
        
        if intent == 'dashboard' or 'stat' in message or 'percentage' in message or 'نسبة' in message:
            farms = Farm.objects.filter(farmer=farmer_profile)
            total_size = sum([f.Size for f in farms]) if farms else 0
            analytics = self._get_mock_analytics(total_size)
            
            orders = Order.objects.filter(id_farmer=farmer_profile)
            net_revenue = orders.filter(order_status=OrderStatusEnum.DELIVERED).aggregate(total=Sum('total_amount'))['total'] or 0
            total_orders_count = orders.count()
            
            # Category Breakdown (REAL SALES - Matching frontend/SalesStats.jsx logic)
            cat_map = {'Vegetables': 0, 'Fruits': 0, 'Other': 0}
            confirmed_orders = orders.filter(Q(order_status=OrderStatusEnum.CONFIRMED) | Q(order_status=OrderStatusEnum.DELIVERED))
            total_confirmed_rev = confirmed_orders.aggregate(s=Sum('total_amount'))['s'] or 0
            
            for o in confirmed_orders:
                for i in o.items.all():
                    name = (i.product_name_snapshot or "").lower()
                    amt = i.sub_total_item or 0
                    if re.search(r'tomato|potato|carrot|onion|pepper|lettuce|cucumber|garlic|cabbage|squash|corn|bean|pea|patate', name):
                        cat_map['Vegetables'] += amt
                    elif re.search(r'apple|orange|fruit|banana|lemon|date|deglet|watermelon|melon|grape|peach|cherry|pomme', name):
                        cat_map['Fruits'] += amt
                    else:
                        cat_map['Other'] += amt
            
            cat_stats = ""
            if total_confirmed_rev > 0:
                cat_stats = "\n".join([f"- {k}: {round(v/total_confirmed_rev*100, 1)}%" for k, v in cat_map.items() if v > 0])
            
            is_direct = any(w in message.lower() for w in ['total', 'how many', 'count', 'list', 'summary', 'كم', 'نسبة'])
            return f"""
            📊 Farmer Sales Analytics
            Total Orders: {total_orders_count}
            Total Confirmed Revenue: {total_confirmed_rev:,.2f} DZD
            Net Delivered Revenue: {net_revenue:,.2f} DZD
            
            Category Breakdown (Actual Sales):
            {cat_stats or 'No category sales data yet.'}
            """, is_direct

        if intent == 'farms':
            farms = Farm.objects.filter(farmer=farmer_profile)
            count = farms.count()
            farm_list = "\n".join([f"- {f.FarmName} | {f.LocationFarm} | {f.Size}ha" for f in farms[:5]])
            return f"🚜 Your Farms ({count} Active)\n{farm_list}", True

        if intent == 'orders' or 'revenue' in message:
            orders = Order.objects.filter(id_farmer=farmer_profile).order_by('-created_at')
            
            is_pending = any(w in message.lower() for w in ['pending', 'en attente', 'waiting', 'process', 'معلقة'])
            is_delivered = any(w in message.lower() for w in ['delivered', 'livrée', 'complete', 'shipped', 'expédié', 'مشحونة', 'تم التوصيل'])
            is_confirmed = any(w in message.lower() for w in ['confirmed', 'confirme', 'مؤكدة'])
            is_cancelled = any(w in message.lower() for w in ['cancelled', 'cancel', 'annule', 'ملغاة'])
            
            filtered_orders = orders
            status_str = "Total"
            
            if is_pending:
                filtered_orders = filtered_orders.filter(order_status=OrderStatusEnum.PENDING)
                status_str = "Pending"
            elif is_delivered:
                filtered_orders = filtered_orders.filter(order_status=OrderStatusEnum.DELIVERED)
                status_str = "Delivered"
            elif is_confirmed:
                filtered_orders = filtered_orders.filter(order_status=OrderStatusEnum.CONFIRMED)
                status_str = "Confirmed"
            elif is_cancelled:
                filtered_orders = filtered_orders.filter(order_status=OrderStatusEnum.CANCELLED)
                status_str = "Cancelled"

            is_revenue = any(w in message.lower() for w in ['revenue', 'earnings', 'moula', 'money', 'profit', 'ربح', 'دخل', 'مبيعات'])
            count = filtered_orders.count()

            if is_revenue:
                # Dashboard Logic Sync
                financial_orders = filtered_orders
                if status_str == "Total":
                    financial_orders = financial_orders.filter(order_status=OrderStatusEnum.CONFIRMED)
                    status_str = "Confirmed"
                
                revenue = financial_orders.aggregate(total=Sum('total_amount'))['total'] or 0
                profit = revenue * 0.7
                return f"💰 Your {status_str} Financials\nTotal Revenue: {revenue:,.2f} DZD\nTotal Profit: {profit:,.2f} DZD\nMatching Dashboard Stats (Orders: {count})", True

            if 'total' in message or 'count' in message or 'how many' in message or 'summary' in message:
                t = orders.count()
                p = orders.filter(order_status=OrderStatusEnum.PENDING).count()
                c = orders.filter(order_status=OrderStatusEnum.CONFIRMED).count()
                d = orders.filter(order_status=OrderStatusEnum.DELIVERED).count()
                return f"📦 Orders Summary: Total {t} (Pending: {p}, Confirmed: {c}, Delivered: {d})", True
            
            sample = ""
            if count > 0 and count <= 10:
                sample = "\n" + "\n".join([f"- #{o.order_number} ({o.total_amount:,.0f} DZD)" for o in filtered_orders[:5]])
                
            return f"📦 {status_str} Orders: {count}{sample}", True

        if intent == 'products':
            # Priority: Product-specific query
            target_product = self._extract_product(message)
            if target_product:
                # Fall through to global handler for price/stock monitoring
                # OR handle it here if we want farmer-specific stock
                return None, False

            items = ProductItem.objects.filter(id_farmer=farmer_profile)
            
            # Dynamic Category Filtering
            is_veg = any(w in message.lower() for w in ['vegetable', 'خضار', 'خضر', 'légume'])
            is_fruit = any(w in message.lower() for w in ['fruit', 'فواكه', 'فاكهة'])
            
            if is_veg and not is_fruit:
                items = items.filter(id_product__id_category__category_name__icontains='vegetable')
            elif is_fruit and not is_veg:
                items = items.filter(id_product__id_category__category_name__icontains='fruit')

            # Priority: Specific product lookup for this farmer
            target_p = self._extract_product(message)
            if target_p:
                specific_items = items.filter(id_product=target_p)
                stock_specific = specific_items.aggregate(total=Sum('quantity'))['total'] or 0
                return f"📦 Your Inventory: {target_p.product_name}\nCurrent Stock: {stock_specific} kg", True

            stock_count = items.aggregate(total=Sum('quantity'))['total'] or 0
            cat_name = "Vegetable " if is_veg and not is_fruit else ("Fruit " if is_fruit and not is_veg else "")
            
            # If they asked for a list or names
            if any(w in message.lower() for w in ['list', 'names', 'what are', 'show', 'قائمة', 'ما هي']):
                prod_list = "\n".join([f"- {i.id_product.product_name}: {i.quantity} units (@ {i.product_price} DZD)" for i in items[:15]])
                return f"📦 Your {cat_name.strip()} Inventory\n{prod_list or 'No items found.'}", True
                
            return f"📦 {cat_name.strip() or 'Product'} Inventory: You have {items.values('id_product').distinct().count()} product types with {stock_count} total units in stock.", True

        if intent == 'market':
            return None, False
            
        if intent == 'deliveries' or 'delivery' in message or 'livraison' in message:
            from apps.deliveries.models import DeliveryMission
            orders_qs = Order.objects.filter(id_farmer=farmer_profile)
            missions = DeliveryMission.objects.filter(id_order__in=orders_qs).order_by('-delivery_date')
            
            if not missions.exists():
                return "There are no transport missions currently assigned to your orders.", True
            
            active = missions.filter(delivery_status__in=['assigned', 'picked_up', 'in_transit', 'out_for_delivery'])
            if active.exists():
                m = active.first()
                return f"🚛 Active Delivery Found\nMission #{m.mission_number} for Order #{m.id_order.order_number}\nStatus: In Transit 🚚\nTransporter: {m.id_transporter.user.name}\nDestination: {m.delivery_location}", False
            
            return f"🚛 Delivery Overview\nTotal Missions: {missions.count()}\nCompleted: {missions.filter(delivery_status=DeliveryStatusEnum.DELIVERED).count()}\nPending: {missions.filter(delivery_status=DeliveryStatusEnum.PENDING).count()}", False

        # Redline check
        if 'all users' in message or 'admin' in message or 'other' in message:
            return "I'm sorry, I don't have permission to share administrative or financial data for other users. I can, however, help you manage your own farms and products.", False

        return None, False

    # ============================================
    # TRANSPORTER HANDLER
    # ============================================
    def _handle_transporter_request(self, user, intent, message, target_user=None):
        # Use target_user if provided (e.g. "my deliveries" or "deliveries of Amir Ali")
        effective_user = target_user if target_user else user
        try:
            transporter_profile = Transporter.objects.get(user=effective_user)
        except Transporter.DoesNotExist:
            # Fallback: if they are asking about someone else, they might not be a transporter
            return None, False

        if intent == 'deliveries' or any(w in message.lower() for w in ['mission', 'route', 'cargo', 'توصيل', 'livraison', 'earnings', 'vehicle', 'truck', 'شاحنة', 'fleet']):
            from apps.deliveries.models import DeliveryMission
            missions = DeliveryMission.objects.filter(id_transporter=transporter_profile)
            
            # 1. Vehicle Info (Consolidated & Direct)
            if any(w in message.lower() for w in ['vehicle', 'truck', 'fleet', 'شاحنة', 'مركبة']):
                vehicles = transporter_profile.vehicles.all()
                if vehicles.exists():
                    v_list = "\n".join([f"- {v.license_number} ({v.get_vehicle_type_display()}) | {v.capacity} Tons" for v in vehicles])
                    return f"🚛 Your Fleet ({vehicles.count()} Vehicles)\n{v_list}", True
                return f"Your registered capacity is {transporter_profile.vehicle_capacity} Tons.", True

            # 2. Specific Mission ID Lookup
            mission_match = re.search(r'(?:mission|id|#)\s*(\d+)', message, re.IGNORECASE)
            if mission_match:
                m_id = int(mission_match.group(1))
                m = missions.filter(mission_number=m_id).first()
                if m:
                    farmer = m.id_order.id_farmer.user
                    buyer = m.id_order.id_buyer.user
                    earning = float(m.id_order.total_amount) * 0.1
                    return f"🚛 Mission Details: #{m.mission_number}\nStatus: {m.get_delivery_status_display()}\nEarning: {earning:,.2f} DZD (10% Commission)\nRoute:\n🟢 From: {farmer.address} ({farmer.name})\n🔴 To: {m.delivery_location} ({buyer.name})\nItems: {m.id_order.items.count()} items | Total Value: {m.id_order.total_amount:,.2f} DZD", True
                return f"I couldn't find mission #{m_id} in your assigned list.", True

            # 3. Earnings Calculation
            if 'earning' in message.lower() or 'ربح' in message or 'دخل' in message:
                delivered = missions.filter(delivery_status='delivered')
                total_rev = delivered.aggregate(total=Sum('id_order__total_amount'))['total'] or 0
                total_earnings = float(total_rev) * 0.1
                return f"💰 Earnings Overview\nTotal Commission (10%): {total_earnings:,.2f} DZD\nVerified from {delivered.count()} completed deliveries.", True

            # 5. Actions Guide (Accept/Start/Complete)
            if any(w in message.lower() for w in ['accept', 'start', 'complete', 'finish', 'ابدأ', 'وافق', 'أكمل']):
                return "🛠 Action Guide:\n- To Accept a mission, go to 'Available Missions' and select a vehicle.\n- To Start or Complete, use the 'Update Status' button in your Active Hub.\n- Note: AI cannot modify database state directly for security reasons.", True

            # 6. Time-based Filters & Available Missions
            is_today = 'today' in message.lower() or 'اليوم' in message
            is_week = 'week' in message.lower() or 'أسبوع' in message
            is_available = 'available' in message.lower() or 'disponible' in message or 'متاحة' in message
            is_cancelled = 'cancelled' in message.lower() or 'ملغية' in message or 'annulée' in message
            
            if is_available:
                available_count = DeliveryMission.objects.filter(id_transporter__isnull=True, delivery_status='open').count()
                return f"📦 Available Missions\nThere are {available_count} new missions available for pickup. You can accept them from the 'Available Missions' tab in your dashboard.", True

            if is_cancelled:
                cancelled_qs = missions.filter(delivery_status='cancelled')
                count = cancelled_qs.count()
                return f"❌ Cancelled Missions\nYou have {count} cancelled missions.{' Recent: ' + ', '.join(['#'+str(m.mission_number) for m in cancelled_qs[:3]]) if count > 0 else ''}", True

            if is_today:
                today_missions = missions.filter(delivery_date=timezone.now().date())
                return f"📅 Today's Activity\nTotal: {today_missions.count()} missions\nCompleted: {today_missions.filter(delivery_status='delivered').count()}\nActive: {today_missions.filter(delivery_status__in=['assigned', 'picked_up', 'in_transit', 'out_for_delivery']).count()}", True

            if is_week:
                week_ago = timezone.now() - timedelta(days=7)
                weekly_delivered = missions.filter(delivery_status='delivered', actual_delivery_time__gte=week_ago)
                count = weekly_delivered.count()
                earnings = float(weekly_delivered.aggregate(total=Sum('id_order__total_amount'))['total'] or 0) * 0.1
                return f"📊 Weekly Performance (Last 7 Days)\nCompleted Deliveries: {count}\nEarnings: {earnings:,.2f} DZD\nStatus: On Track", True

            is_active = any(w in message.lower() for w in ['active', 'current', 'progress', 'transit', 'في الطريق', 'جارية', 'en cours'])
            is_total = any(w in message.lower() for w in ['total', 'all', 'summary', 'performance', 'كم', 'إجمالي', 'stats'])
            is_list = any(w in message.lower() for w in ['list', 'show', 'عرض', 'قائمة', 'history', 'deliveries'])
            
            delivered_count = missions.filter(delivery_status='delivered').count()
            active_count = missions.filter(delivery_status__in=['assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered']).count()
            in_progress = missions.filter(delivery_status__in=['assigned', 'picked_up', 'in_transit', 'out_for_delivery']).count()

            if is_active:
                if active_count > 0:
                    sample = "\n".join([f"- Mission #{m.mission_number}: {m.get_delivery_status_display()} -> {m.delivery_location}" for m in missions.filter(delivery_status__in=['assigned', 'picked_up', 'in_transit', 'out_for_delivery'])[:3]])
                    more = f"\n...and {in_progress - 3} more in progress" if in_progress > 3 else ""
                    return f"🚛 Active Missions Hub\nYou have {active_count} missions listed in your active hub.\nCurrently in progress: {in_progress} missions.\n\nRecent:\n{sample}{more}", True
                return "You have no active missions at the moment.", True

            if is_list and not is_total:
                # Return a detailed list of recent missions
                recent_missions = missions.order_by('-delivery_date')[:5]
                list_str = "\n".join([f"- #{m.mission_number}: {m.get_delivery_status_display()} to {m.delivery_location} ({m.delivery_date})" for m in recent_missions])
                return f"📋 Your Delivery List (Recent 5)\n{list_str}\n\n*Total Missions Found: {missions.count()}*", True

            if is_total:
                return f"📊 Logistics Performance Summary\nTotal Completed: {delivered_count}\nActive Mission Hub: {active_count}\nCurrently in Transit: {in_progress}\n(Matches Dashboard Stats)", True

            return f"🚛 Logistics Performance Summary\nTotal Completed: {delivered_count}\nActive Mission Hub: {active_count}\nCurrently in Transit: {in_progress}", True

        return None, False

    # ============================================
    # BUYER HANDLER
    # ============================================
    def _handle_buyer_request(self, user, intent, message, target_user=None):
        from apps.users.models import Buyer
        from apps.products.models import Product, ProductItem, Category
        from apps.orders.models import Order, OrderStatusEnum
        from apps.deliveries.models import DeliveryMission
        from django.db.models import Min, Max, Avg, Q
        
        buyer_profile = Buyer.objects.get(user=user)
        msg_lower = message.lower()
        is_count = any(w in msg_lower for w in ['total', 'count', 'عدد', 'كم'])
        is_list = any(w in msg_lower for w in ['list', 'show', 'قائمة', 'عرض'])
        is_top = any(w in msg_lower for w in ['top', 'best', 'أرخص', 'أفضل'])

        # 1. Structured Insights (Cards/Lists for Frontend)
        # ------------------------------------
        if any(w in msg_lower for w in ['market insights', 'price insights', 'prices overview', 'إحصائيات الأسعار', 'نظرة عامة على الأسعار']):
            return self._handle_market_insights(), True

        if any(w in msg_lower for w in ['top orders', 'highest orders', 'biggest purchases', 'أفضل الطلبيات', 'أكبر المشتريات']):
            return self._handle_top_orders(buyer_profile), True

        # 2. Pricing & Comparison (High Priority for Buyer)
        # ------------------------------------
        if any(w in msg_lower for w in ['price', 'cheap', 'compare', 'سعر', 'أرخص', 'بكم']):
            target_p = self._extract_product(message)
            if target_p:
                if is_top:
                    best = ProductItem.objects.filter(id_product=target_p, is_available=True).order_by('product_price').first()
                    if best:
                        return f"💎 Best Deal for {target_p.product_name}\nPrice: {best.product_price:,.2f} DZD\nFarmer: {best.id_farmer.user.name}\nLocation: {best.id_farmer.user.wilaya}\n\n*This is the lowest price currently available on the platform.*", True
                return self._handle_pricing_analytics(message, target_user)

        # 2. Order & Delivery Tracking
        # ------------------------------------
        if any(w in msg_lower for w in ['track', 'where', 'delivery', 'status', 'توصيل', 'أين', 'حالة']):
            order_match = re.search(r'(?:order|id|#)\s*#?(?:ord-)?(\d+)', message, re.IGNORECASE)
            target_order = None
            if order_match:
                order_id = int(order_match.group(1))
                target_order = Order.objects.filter(id_buyer=buyer_profile, order_number=order_id).first()
            else:
                # If no ID, track the latest order
                target_order = Order.objects.filter(id_buyer=buyer_profile).order_by('-created_at').first()

            if target_order:
                mission = target_order.delivery_missions.first()
                status_icon = "🟢" if target_order.order_status == OrderStatusEnum.DELIVERED else "🟡"
                res = f"📦 Tracking Order: #{target_order.order_number}\n"
                res += f"Status: {status_icon} {target_order.get_order_status_display()}\n"
                res += f"Total: {target_order.total_amount:,.2f} DZD\n"
                res += f"Farmer: {target_order.id_farmer.user.name}\n"
                if mission:
                    res += f"🚚 Delivery Status: {mission.get_delivery_status_display()}\n"
                    if mission.id_transporter:
                        res += f"🚛 Transporter: {mission.id_transporter.user.name} ({mission.id_transporter.user.phone or 'N/A'})\n"
                else:
                    res += f"🚚 Delivery: Not yet assigned to a transporter.\n"
                return res, True
            return "You don't have any orders to track yet.", True

        # 3. My Orders / Purchases
        # ------------------------------------
        if intent in ['orders', 'finance'] or any(w in msg_lower for w in ['order', 'purchase', 'history', 'delivered', 'pending', 'confirmed', 'cancelled', 'canceled', 'shipping', 'طلب', 'طلبيات']):
            orders = Order.objects.filter(id_buyer=buyer_profile).order_by('-created_at')
            
            is_pending = any(w in msg_lower for w in ['pending', 'en attente', 'معلقة'])
            is_delivered = any(w in msg_lower for w in ['delivered', 'livrée', 'تم التوصيل'])
            is_confirmed = any(w in msg_lower for w in ['confirmed', 'confirmé', 'مؤكدة', 'مؤكد'])
            is_cancelled = any(w in msg_lower for w in ['cancelled', 'canceled', 'annulé', 'إلغاء', 'ملغاة'])
            is_shipping = any(w in msg_lower for w in ['shipping', 'shipped', 'en cours', 'مشحونة', 'في الطريق'])
            
            if is_count:
                if is_pending: return f"⏳ Pending Orders: {orders.filter(order_status=OrderStatusEnum.PENDING).count()}", True
                if is_delivered: return f"✅ Delivered Orders: {orders.filter(order_status=OrderStatusEnum.DELIVERED).count()}", True
                if is_confirmed: return f"👍 Confirmed Orders: {orders.filter(order_status=OrderStatusEnum.CONFIRMED).count()}", True
                if is_cancelled: return f"❌ Cancelled Orders: {orders.filter(order_status=OrderStatusEnum.CANCELLED).count()}", True
                if is_shipping: return f"🚚 Orders on Shipping: {orders.filter(order_status__in=[OrderStatusEnum.SHIPPED, OrderStatusEnum.PROCESSING]).count()}", True
                return f"🛍 Total Purchases: {orders.count()}", True

            if is_pending:
                pending_orders = orders.filter(order_status=OrderStatusEnum.PENDING)
                if pending_orders.exists():
                    res = "⏳ Your Pending Orders:\n" + "\n".join([f"- Order #{o.order_number} ({o.total_amount:,.2f} DZD)" for o in pending_orders[:5]])
                    return res, True
                return "You have no pending orders.", True

            if is_delivered:
                delivered_orders = orders.filter(order_status=OrderStatusEnum.DELIVERED)
                if delivered_orders.exists():
                    res = "✅ Your Delivered Orders:\n" + "\n".join([f"- Order #{o.order_number} ({o.total_amount:,.2f} DZD)" for o in delivered_orders[:5]])
                    return res, True
                return "You have no delivered orders yet.", True
                
            if is_confirmed:
                confirmed_orders = orders.filter(order_status=OrderStatusEnum.CONFIRMED)
                if confirmed_orders.exists():
                    res = "👍 Your Confirmed Orders:\n" + "\n".join([f"- Order #{o.order_number} ({o.total_amount:,.2f} DZD)" for o in confirmed_orders[:5]])
                    return res, True
                return "You have no confirmed orders.", True

            if is_cancelled:
                cancelled_orders = orders.filter(order_status=OrderStatusEnum.CANCELLED)
                if cancelled_orders.exists():
                    res = "❌ Your Cancelled Orders:\n" + "\n".join([f"- Order #{o.order_number} ({o.total_amount:,.2f} DZD)" for o in cancelled_orders[:5]])
                    return res, True
                return "You have no cancelled orders.", True

            if is_shipping:
                shipping_orders = orders.filter(order_status__in=[OrderStatusEnum.SHIPPED, OrderStatusEnum.PROCESSING])
                if shipping_orders.exists():
                    res = "🚚 Your Orders on Shipping:\n" + "\n".join([f"- Order #{o.order_number} ({o.total_amount:,.2f} DZD)" for o in shipping_orders[:5]])
                    return res, True
                return "You have no orders currently shipping.", True

            if orders.exists():
                latest = orders.first()
                count = orders.count()
                pending = orders.filter(order_status=OrderStatusEnum.PENDING).count()
                return f"🛍 Your Purchase Summary\nTotal Orders: {count}\n🟡 Pending: {pending}\n\nLatest Order (#{latest.order_number}):\nStatus: {latest.get_order_status_display()}\nTotal: {latest.total_amount:,.2f} DZD", True
            return "You haven't placed any orders yet.", True

        # 4. Product Discovery (Search/Filter)
        # ------------------------------------
        if intent == 'inventory' or any(w in msg_lower for w in ['product', 'منتج', 'سلعة', 'list', 'show', 'find', 'search', 'buy', 'قائمة', 'خضر', 'فواكه', 'منتجات']):
            cat_target = None
            if any(w in msg_lower for w in ['vegetable', 'خضر', 'légume']): cat_target = 'Vegetables'
            elif any(w in msg_lower for w in ['fruit', 'فواكه']): cat_target = 'Fruits'
            
            # Handle Count Specifically
            if is_count:
                if cat_target:
                    count = ProductItem.objects.filter(id_product__id_category__category_name__icontains=cat_target, is_available=True).count()
                    return f"📊 Total Available {cat_target}: {count}", True
                return f"📦 Total Active Product Listings: {ProductItem.objects.filter(is_available=True).count()}", True

            target_p = self._extract_product(message)
            if target_p:
                items = ProductItem.objects.filter(id_product=target_p, is_available=True).order_by('product_price')
                if items.exists():
                    res = f"🛒 Available {target_p.product_name} Listings:\n"
                    for item in items[:5]:
                        res += f"- {item.product_price:,.2f} DZD by {item.id_farmer.user.name} ({item.quantity} available)\n"
                    return res + f"\n💡 *Tip: Ask for 'cheapest {target_p.product_name}' for the best deal.*", True
                return f"No active listings for {target_p.product_name}.", True

            if cat_target:
                items = ProductItem.objects.filter(id_product__id_category__category_name__icontains=cat_target, is_available=True).select_related('id_product')[:10]
                if items.exists():
                    res = f"🥗 Top {cat_target} Listings:\n"
                    for item in items:
                        res += f"- {item.id_product.product_name}: {item.product_price:,.2f} DZD ({item.id_farmer.user.name})\n"
                    return res, True
                return f"No active {cat_target} listings found.", True
            
            if is_list or not message.strip():
                products = Product.objects.filter(is_active=True).values_list('product_name', flat=True)
                return f"📦 Available on AgriSouk DZ:\n" + ", ".join(sorted(products)), True

        if intent in ['analytics', 'dashboard']:
             return f"📊 Buyer Insights\nTotal Purchases: {Order.objects.filter(id_buyer=buyer_profile).count()}\nAccount Balance: {buyer_profile.buyer_balance:,.2f} DZD", True

        return None, False

    # ============================================
    # ADMIN HANDLER (Ministry Oversight)
    # ============================================
    def _handle_admin_request(self, intent, message, target_user=None):
        from apps.users.models import User
        from apps.orders.models import Order
        from apps.products.models import ProductItem, Category, Product, PriceOff
        from apps.deliveries.models import DeliveryMission
        from django.db.models import Sum, Avg, Count, Q

        # ============================================
        # DOMAIN-FIRST ANALYTICS HANDLER
        # ============================================
        msg_lower = message.lower()
        is_count_query = any(w in msg_lower for w in ['total', 'how many', 'count', 'عدد', 'كم'])

        # 1. LOGISTICS DOMAIN (Deliveries, Missions, Logistics)
        # ------------------------------------
        if intent == 'logistics' or any(w in msg_lower for w in ['delivery', 'deliveries', 'mission', 'توصيل', 'شحنة']):
            if 'active' in msg_lower or 'pending' in msg_lower:
                # DASHBOARD SYNC: Active = Open + Pending missions (Matches 9 in dashboard image)
                count = DeliveryMission.objects.filter(delivery_status__in=['open', 'pending']).count()
                return f"🚛 Active Deliveries: {count}", True
            if 'completed' in msg_lower or 'delivered' in msg_lower:
                count = DeliveryMission.objects.filter(delivery_status='delivered').count()
                return f"✅ Completed Missions: {count}", True
            if is_count_query or 'list' in msg_lower:
                return f"📦 Total Delivery Missions: {DeliveryMission.objects.count()}", True
            return self._handle_logistics_analytics()

        # 2. FINANCE DOMAIN (Orders, Volume, Revenue, Pricing)
        # ------------------------------------
        if intent == 'finance' or any(w in msg_lower for w in ['order', 'volume', 'sales', 'revenue', 'سيولة', 'مبيعات']):
            if 'volume' in msg_lower or 'total' in msg_lower:
                vol = Order.objects.filter(order_status__in=['confirmed', 'delivered']).aggregate(s=Sum('total_amount'))['s'] or 0
                return f"💰 Total Platform Volume: {vol:,.2f} DZD", True
            if 'active' in msg_lower or 'pending' in msg_lower:
                count = Order.objects.filter(order_status__in=['pending', 'confirmed', 'processing']).count()
                return f"🛒 Active Orders: {count}", True
            if is_count_query:
                return f"📋 Total Platform Orders: {Order.objects.count()}", True
            
            # Pricing logic is part of Finance domain
            if any(w in msg_lower for w in ['price', 'cost', 'سعر', 'بكم']):
                return self._handle_pricing_analytics(message)

        # 3. INVENTORY DOMAIN (Products, Stocks, Categories)
        # ------------------------------------
        if intent == 'inventory' or any(w in msg_lower for w in ['product', 'stock', 'منتج', 'مخزون']):
            # List all products (Atomic)
            if any(w in msg_lower for w in ['list of', 'show all', 'قائمة']):
                products = Product.objects.filter(is_active=True).values_list('product_name', flat=True)
                return f"📦 Platform Product List:\n" + "\n".join([f"- {p}" for p in sorted(products)]), True
            
            if 'category' in msg_lower or 'صنف' in msg_lower:
                return f"📁 Total Categories: {Category.objects.count()}", True
            
            if 'low stock' in msg_lower or 'alert' in msg_lower:
                low_stock = ProductItem.objects.filter(quantity__lt=10, is_available=True)
                return f"⚠️ Low Stock Alerts: {low_stock.count()} items currently below threshold.", True
            
            # Specific Product handling
            p = self._extract_product(message)
            if p:
                if is_count_query:
                    total_stock = ProductItem.objects.filter(id_product=p, is_available=True).aggregate(s=Sum('quantity'))['s'] or 0
                    return f"📦 Total {p.product_name} Stock: {total_stock:,.1f} units", True
                return self._handle_pricing_analytics(message)
            
            if is_count_query:
                return f"📦 Total Active Products: {Product.objects.filter(is_active=True).count()}", True

        # 4. ACCOUNTS DOMAIN (Users, Profiles, Statuses)
        # ------------------------------------
        if intent == 'accounts' or any(w in msg_lower for w in ['user', 'farmer', 'buyer', 'مستخدم', 'فلاح']):
            if target_user:
                if any(w in msg_lower for w in ['info', 'contact', 'details', 'profile', 'معلومات']):
                    return f"👤 User Profile: {target_user.name} | Role: {target_user.get_user_type_display()}\nContact: {target_user.phone or 'N/A'}\nEmail: {target_user.email}", True
                return f"👤 User Found: {target_user.name} ({target_user.get_user_type_display()})", True
            
            # Precise Status Filtering (Approved/Pending/Rejected)
            status_target = None
            status_label = ""
            if 'active' in msg_lower or 'approved' in msg_lower or 'نشط' in msg_lower:
                status_target = {'is_active': True, 'is_validated': True}
                status_label = "Active/Approved"
            elif 'pending' in msg_lower or 'قيد' in msg_lower:
                status_target = {'is_active': True, 'is_validated': False}
                status_label = "Pending"
            elif 'rejected' in msg_lower or 'مرفوض' in msg_lower:
                status_target = {'is_active': False, 'is_validated': False}
                status_label = "Rejected"

            if status_target:
                role_target = None
                if 'farmer' in msg_lower or 'فلاح' in msg_lower: role_target = 'farmer'
                elif 'buyer' in msg_lower or 'مشتري' in msg_lower: role_target = 'buyer'
                elif 'transporter' in msg_lower or 'ناقل' in msg_lower: role_target = 'transporter'
                
                if role_target:
                    count = User.objects.filter(user_type=role_target, **status_target).count()
                    return f"📊 {status_label} {role_target.capitalize()}s: {count}", True

            if is_count_query:
                return f"📊 Total Platform Users: {User.objects.count()}", True
            
            if any(w in msg_lower for w in ['breakdown', 'analytics', 'distribution']):
                return self._handle_user_analytics()

        # 5. MONITORING DOMAIN (Reports, Issues)
        # ------------------------------------
        if intent == 'monitoring' or any(w in msg_lower for w in ['report', 'issue', 'بلاغ', 'شكوى']):
            from apps.reports.models import Report
            if is_count_query:
                return f"📑 Total System Reports: {Report.objects.count()}", True

        # 6. GLOBAL ANALYTICS (Catch-all)
        # ------------------------------------
        if intent == 'analytics' or any(w in msg_lower for w in ['global', 'summary', 'overview', 'إحصائيات']):
            return self._handle_global_stats()

        return None, False

    def _get_platform_summary(self):
        from apps.users.models import User
        from apps.farms.models import Farm
        from apps.products.models import ProductItem
        from apps.orders.models import Order
        from django.db.models import Sum
        
        try:
            return f'''
            [PLATFORM LIVE STATE]
            - Total Users: {User.objects.count()}
            - Total Registered Farms: {Farm.objects.count()}
            - Active Product Listings: {ProductItem.objects.filter(is_available=True).count()}
            - Total Orders Processed: {Order.objects.count()}
            - Platform Transaction Volume: {Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0:,.2f} DZD
            - System Health: Optimal
            - Latest Feature: Data-First Analytics Integrated
            '''
        except Exception as e:
            return f"[PLATFORM LIVE STATE] Error: {str(e)}"

    def _get_specific_order_context(self, user, role, order_id):
        from apps.orders.models import Order
        import json
        order = Order.objects.filter(order_number=order_id).first()
        if not order:
            return None
            
        is_involved = False
        if role == 'admin': is_involved = True
        elif role == 'farmer' and order.id_farmer.user == user: is_involved = True
        elif role == 'buyer' and order.id_buyer.user == user: is_involved = True
        elif role == 'transporter':
            mission = order.delivery_missions.first()
            if mission and mission.id_transporter and mission.id_transporter.user == user: is_involved = True
        
        if not is_involved: return "Security: Access denied."

        # Fetch Items
        items_data = [
            {
                "name": item.product_name_snapshot,
                "quantity": item.quantity_item,
                "unit": item.quantity_unit,
                "price": float(item.price_item),
                "subtotal": float(item.sub_total_item)
            }
            for item in order.items.all()
        ]

        # Fetch Logistics
        mission = order.delivery_missions.first()
        logistics_data = {
            "transporter": mission.id_transporter.user.name if mission and mission.id_transporter else "Not Assigned",
            "status": mission.get_delivery_status_display() if mission else "Pending",
            "origin": order.id_farmer.user.address or "Verified Farm Location",
            "destination": order.delivery_address or order.id_buyer.user.address or "Verified Buyer Address"
        }

        # Full Structured JSON
        details = {
            "type": "order_details",
            "data": {
                "id": order.order_number,
                "status": order.get_order_status_display(),
                "date": order.created_at.strftime("%Y-%m-%d"),
                "buyer_name": order.id_buyer.user.name,
                "farmer_name": order.id_farmer.user.name,
                "farm_name": getattr(order.id_farmer.farms.first(), 'FarmName', 'N/A') if order.id_farmer.farms.exists() else "N/A",
                "items": items_data,
                "financials": {
                    "subtotal": float(order.total_amount),
                    "delivery_fee": 500.0,
                    "total": float(order.total_amount) + 500.0
                },
                "logistics": logistics_data
            }
        }

        return json.dumps(details)

    # ============================================
    # ANALYTICS HANDLERS (Data-First)
    # ============================================
    def _handle_global_stats(self):
        from apps.users.models import User
        from apps.products.models import Product, Category, ProductItem
        from apps.orders.models import Order
        from apps.deliveries.models import DeliveryMission
        from apps.reports.models import Report
        
        try:
            return f"📊 Global Platform Statistics\n" \
                   f"- Total Users: {User.objects.count()}\n" \
                   f"- Total Orders: {Order.objects.count()}\n" \
                   f"- Total Deliveries: {DeliveryMission.objects.count()}\n" \
                   f"- Active Products: {ProductItem.objects.filter(is_available=True).count()}\n" \
                   f"- Categories: {Category.objects.count()}\n" \
                   f"- Total Reports: {Report.objects.count()}\n" \
                   f"Platform Status: Operational 🟢", True
        except Exception as e:
            return f"Error fetching global stats: {str(e)}", True

    def _handle_user_analytics(self):
        from apps.users.models import User
        def get_stats(u_type):
            base = User.objects.filter(user_type=u_type)
            return f"{base.filter(is_active=True).count()} Active | {base.filter(is_validated=False).count()} Pending | {base.filter(is_active=False).count()} Rejected"

        return f"👥 User Breakdown Analysis\n" \
               f"👨‍🌾 Farmers: {get_stats('farmer')}\n" \
               f"🛒 Buyers: {get_stats('buyer')}\n" \
               f"🚛 Transporters: {get_stats('transporter')}", True

    def _handle_pricing_analytics(self, message, target_user=None):
        from apps.products.models import ProductItem, ProductPriceHistory, PriceOff
        from apps.users.models import Farmer
        from django.db.models import Min, Max, Avg
        msg_lower = message.lower()
        target_p = self._extract_product(message)

        if target_user and target_p:
            # Handle Specific Farmer Price Request
            try:
                farmer_p = Farmer.objects.get(user=target_user)
                item = ProductItem.objects.filter(id_product=target_p, id_farmer=farmer_p, is_available=True).first()
                if item:
                    res = f"📍 {target_p.product_name} Price from {target_user.name}\n"
                    res += f"Price: {item.product_price:,.2f} DZD\n"
                    res += f"Availability: {item.quantity} units in stock.\n\n"
                    
                    # Also include Ministry context for comparison
                    official = PriceOff.objects.filter(id_product=target_p).order_by('-date_set').first()
                    if official:
                        res += f"🏛 Ministry Regulation:\n- Official Range: {official.min_price} - {official.max_price} DZD\n"
                        status = "✅ Within Range" if official.min_price <= item.product_price <= official.max_price else "⚠️ Outside Regulation"
                        res += f"- Status: {status}"
                    return res, True
                return f"Farmer {target_user.name} does not currently have any active listings for {target_p.product_name}.", True
            except Farmer.DoesNotExist:
                pass
        
        if not target_p:
            avg_global = ProductItem.objects.filter(is_available=True).aggregate(avg=Avg('product_price'))['avg'] or 0
            return f"💰 Global Market Pricing\nAverage unit price: {avg_global:.2f} DZD", True

        # Internal Helpers for Formatting
        def get_ministry_data(p):
            official = PriceOff.objects.filter(id_product=p).order_by('-date_set').first()
            if official:
                target_margin = (official.min_price + official.max_price) / 2
                return f"🏛 Official Ministry Pricing\n" \
                       f"- Pricing Thresholds: {official.min_price:.2f} - {official.max_price:.2f} {official.price_unit}\n" \
                       f"- Target Margin: ~{target_margin:.2f} {official.price_unit}\n" \
                       f"- Status: Regulatory Limit ⚠️"
            return "🏛 Official Ministry Pricing: Not yet established for this product."

        def get_market_data(p):
            items = ProductItem.objects.filter(id_product=p, is_available=True)
            stats = items.aggregate(min_p=Min('product_price'), max_p=Max('product_price'), avg_p=Avg('product_price'))
            return f"💰 Live Market Analytics\n" \
                   f"- Lowest: {stats['min_p'] or 0:,.2f} DZD\n" \
                   f"- Highest: {stats['max_p'] or 0:,.2f} DZD\n" \
                   f"- Average: {stats['avg_p'] or 0:,.2f} DZD\n" \
                   f"- Source: Real-time platform data 📈"

        # 1. BOTH: Ministry + Market (Triggered by plural 'prices')
        if any(w in msg_lower for w in ['prices', 'أسعار', 'أثمان', 'all price', 'كل الأسعار']):
            res = f"📊 Price Comparison: {target_p.product_name}\n\n"
            res += get_ministry_data(target_p) + "\n\n"
            res += get_market_data(target_p) + "\n\n"
            res += "💡 *Note: Farmers must align their live prices with the official ministry thresholds.*"
            return res, True

        # 2. ONLY MINISTRY (Official)
        if any(w in msg_lower for w in ['ministry', 'official', 'وزارة', 'رسمي']):
            return get_ministry_data(target_p) + f"\n\n📅 Date Set: {timezone.now().strftime('%Y-%m-%d')}", True

        # 3. ONLY MARKET (Live)
        return get_market_data(target_p) + f"\n\n💡 *Tip: Ask for 'ministry price' to see official regulations.*", True

    def _handle_market_analytics(self, message):
        from apps.orders.models import Order, OrderItem
        from apps.products.models import Category
        from django.db.models import Sum, Count
        categories = Category.objects.all()[:5]
        cat_data = []
        for c in categories:
            # Note: productitem is the default related name from ProductItem to OrderItem
            rev = OrderItem.objects.filter(productitem__id_product__id_category=c, id_order__order_status='delivered').aggregate(s=Sum('sub_total_item'))['s'] or 0
            cat_data.append(f"- {c.category_name}: {rev:,.2f} DZD")
        top_regions = Order.objects.values('delivery_address').annotate(count=Count('order_number')).order_by('-count')[:3]
        reg_str = "\n".join([f"- {r['delivery_address'] or 'National'}: {r['count']} orders" for r in top_regions])
        return f"📈 Market Performance Analytics\n\nRevenue per Category:\n" + "\n".join(cat_data) + f"\n\nTop Delivery Regions:\n{reg_str}", True

    def _handle_farmers_analytics(self, target_user=None):
        from apps.users.models import User
        from apps.farms.models import Farm
        from apps.products.models import ProductItem
        from django.db.models import Sum
        if target_user and target_user.user_type == 'farmer':
            farms = Farm.objects.filter(id_farmer__user=target_user)
            products = ProductItem.objects.filter(id_farmer__user=target_user)
            return f"🚜 Farmer Insights: {target_user.name}\n- Registered Farms: {farms.count()}\n- Active Listings: {products.count()}\n- Total Inventory: {products.aggregate(s=Sum('quantity'))['s'] or 0} units", True
        total_farmers = User.objects.filter(user_type='farmer').count()
        total_farms = Farm.objects.count()
        avg = total_farms/total_farmers if total_farmers else 0
        return f"🚜 Agricultural Oversight\n- Total Registered Farmers: {total_farmers}\n- Total Managed Farms: {total_farms}\n- Average Farms per Farmer: {avg:.1f}", True

    def _handle_market_insights(self):
        from apps.products.models import Product, ProductItem, ProductPriceHistory
        from django.db.models import Avg, Min, Max
        import json
        
        products = Product.objects.filter(is_active=True)
        data = []
        
        for p in products:
            # Current Average Price from active listings
            current_avg = ProductItem.objects.filter(id_product=p, is_available=True).aggregate(avg=Avg('product_price'))['avg'] or 0
            
            # 30-day History Stats
            history = ProductPriceHistory.objects.filter(id_product=p).order_by('-history_date')[:30]
            prices = [h.average_price for h in history]
            
            min_p = min(prices) if prices else current_avg
            max_p = max(prices) if prices else current_avg
            
            # Simple Trend Calculation
            trend = 0
            if len(prices) >= 2:
                latest = prices[0]
                prev = prices[1]
                if prev > 0:
                    trend = round(((latest - prev) / prev) * 100, 1)
            
            data.append({
                "name": p.product_name,
                "current_price": round(current_avg, 2),
                "min": round(min_p, 2),
                "max": round(max_p, 2),
                "trend": trend,
                "category": p.id_category.category_name
            })
            
        return json.dumps({
            "type": "market_insights",
            "data": data
        })

    def _handle_top_orders(self, buyer_profile):
        from apps.orders.models import Order, OrderStatusEnum
        import json
        
        # Parity Check: Dashboard filters only 'DELIVERED' for top orders
        orders = Order.objects.filter(id_buyer=buyer_profile, order_status=OrderStatusEnum.DELIVERED).order_by('-total_amount')[:5]
        data = [
            {
                "id": o.order_number,
                "date": o.created_at.strftime("%Y-%m-%d"),
                "total": float(o.total_amount),
                "status": o.get_order_status_display()
            }
            for o in orders
        ]
        
        return json.dumps({
            "type": "top_orders",
            "data": data
        })

    def _handle_logistics_analytics(self):
        from apps.deliveries.models import DeliveryMission
        from django.db.models import Count
        stats = DeliveryMission.objects.values('delivery_status').annotate(count=Count('mission_number'))
        stat_str = "\n".join([f"- {s['delivery_status'].capitalize()}: {s['count']}" for s in stats])
        return f"🚚 Logistics Network Analytics\n\nMission Status Breakdown:\n{stat_str}", True
    def _call_groq(self, user, role, message, context, history=[]):
        """
        Calls Groq API to generate a human-like response based on data context and conversation history.
        """
        api_key = getattr(settings, 'GROQ_API_KEY', None)
        api_url = getattr(settings, 'GROQ_API_URL', 'https://api.groq.com/openai/v1/chat/completions')
        model = getattr(settings, 'GROQ_MODEL', 'llama-3.3-70b-versatile')

        if not api_key:
            return "AI Error: Groq API Key not configured. Please check backend settings."

        # Detect User Language for the System Prompt
        lang = self._detect_language(message)
        
        # Ensure context is provided to the AI
        if not context:
            context = "[NO SPECIFIC DATA FOUND IN DATABASE]"

        user_name = user.name if user.is_authenticated else "Guest"
        
        system_prompt = f"""
        You are the AgriSouk DZ Smart Assistant.
        You are directly connected to the platform's real-time database to assist users with agricultural data, inventory, and market insights.
        
        CRITICAL DATA HANDLING:
        - The [LIVE CONTEXT] below contains the most up-to-date data for the current user.
        - "Sales Data" refers to completed orders and revenue.
        - "Inventory Stock" refers to items currently available for sale.
        - ALWAYS prioritize data in [LIVE CONTEXT] over any previous knowledge.
        - NEVER mention internal tag names like "[REAL_SALES_DATA_FROM_DATABASE]" or "[LIVE CONTEXT]" in your response.
        - If no data is found in the context, politely inform the user or encourage them to register/login to see their personal stats.

        USER PROFILE: {user_name} | ROLE: {role}
        SYSTEM TIME: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}

        [LIVE CONTEXT]
        {context}

        RESPONSE RULES:
        1. LANGUAGE: Match the user's language (Arabic, French, English, or Darja).
        2. DATA SUPREMACY: If the context contains a list of products or orders, use those specific details in your answer.
        3. SECURITY: Never disclose PII (passwords, private emails) or internal system paths.
        """

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "AgriSoukDZAssistant/1.0"
        }

        messages = [
            {"role": "system", "content": system_prompt},
        ]
        
        # Add conversation history
        for h in history:
            messages.append(h)
            
        # Add current message
        messages.append({"role": "user", "content": message})

        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 1024,
            "top_p": 1,
            "stream": False
        }

        max_retries = 3
        for attempt in range(max_retries):
            try:
                req = urllib.request.Request(api_url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
                with urllib.request.urlopen(req, timeout=10) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    return result['choices'][0]['message']['content']
            except urllib.error.HTTPError as e:
                error_body = e.read().decode('utf-8')
                if e.code == 429 and attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    logger.warning(f"Groq API 429 Error. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                
                logger.error(f"Groq API HTTP Error: {e.code} - {error_body}")
                return self._smart_fallback(message, context, lang, f"API Error {e.code}")
            except Exception as e:
                logger.error(f"Groq API Error: {str(e)}")
                return self._smart_fallback(message, context, lang, "Connection Error")

    def _handle_visitor_request(self, message, intent=None):
        import json
        from django.db.models import Q
        from apps.products.models import Product
        msg_lower = message.lower()
        
        # 1. VISITOR INTENT DETECTION (Highly Granular mapping)
        visitor_intents = {
            # 1. SPECIFIC ACTIONS / LOGISTICS (Highest Priority)
            'delivery_today': ['available today', 'deliver today', 'توصيل اليوم'],
            'delivery_schedule': ['choose time', 'delivery time', 'اختيار الوقت'],
            'delivery_missed': ['not at home', 'missed', 'إذا لم أكن'],
            'delivery_area': ['my area', 'regions', 'wilaya', 'منطقتي', 'ولاية'],
            'delivery_time': ['how long', 'delivery time', 'وقت التوصيل'],
            'who_delivers': ['who delivers', 'delivery man', 'من يوصل'],
            
            'cash_on_delivery': ['cash on delivery', 'cod', 'الدفع عند الاستلام'],
            'payment_timing': ['before or after', 'when pay', 'قبل أم بعد'],
            'payment_security': ['secure', 'safe payment', 'آمن'],
            'payment_methods': ['how pay', 'payment', 'دفع'],

            'farmer_verification': ['verified', 'farmers verified', 'موثقين', 'فلاحين موثقين'],
            'commission': ['commission', 'fee', 'percentage', 'عمولة', 'نسبة'],
            'farmer_registration': ['register as a farmer', 'farmer register', 'تسجيل فلاح', 'how join as a farmer'],
            'sell_products': ['sell my product', 'can i sell', 'marketplace', 'أريد البيع', 'بيع', 'sell here'],
            
            # 2. ADVICE & HELP (Priority for AI passthrough)
            'agriculture_advice': ['planting', 'grow', 'disease', 'black', 'best time', 'when to', 'fertilizer', 'soil', 'seed', 'water', 'improve', 'increase', 'yield', 'productivity', 'agricultural', 'نصيحة', 'زراعة', 'نمو', 'مرض', 'طقس', 'سماد', 'تربة', 'سقي', 'موسم', 'كيف', 'نبات'],
            'advice': ['tips', 'help', 'suggest', 'how to', 'نصيحة', 'نصائح', 'مساعدة'],

            # 3. ABOUT & PLATFORM
            'trusted': ['trusted', 'safe', 'is it safe', 'reliable', 'موثوق', 'آمن'],
            'management': ['who manages', 'who is behind', 'owner', 'من يدير', 'صاحب'],
            'different': ['what makes', 'different', 'why agrisouk', 'بماذا يختلف', 'لماذا'],
            'what_is_agrisouk': ['what is agrisouk', 'tell me about', 'ماهو أغري سوق', 'تعريف'],
            'how_works': ['how work', 'how platform', 'كيف يعمل'],

            # 4. PRODUCT DETAILS
            'organic': ['organic', 'natural', 'عضوية', 'طبيعية'],
            'freshness': ['fresh', 'quality', 'picked', 'طازجة', 'جودة'],
            'official_prices': ['controlled', 'official', 'regulated', 'مراقبة', 'رسمية'],
            'pricing': ['affordable', 'cheap', 'cost', 'expensive', 'رخيصة', 'ثمن'],
            'origin': ['where from', 'source', 'origin', 'من أين', 'مصدر'],
            
            # 5. GENERAL CATEGORIES (Lowest Priority)
            'fruits_veggies': ['fruits', 'vegetables', 'خضر', 'فواكه'],
            'products': ['available', 'product', 'kind of', 'variety', 'متوفر'],
            
            # 6. HELP & GETTING STARTED
            'use_without_account': ['without account', 'no login', 'بدون حساب'],
            'browse_where': ['where browse', 'where look', 'أين أتصفح'],
            'start_buying': ['how start buying', 'how buy', 'كيف أشتري'],
            'create_account': ['create account', 'sign up', 'register', 'فتح حساب', 'تسجيل'],
            'customer_support': ['support', 'customer service', 'دعم'],
            'help_where': ['where get help', 'help me', 'أحتاج مساعدة'],
            'contact': ['contact', 'email', 'phone', 'اتصال'],
            'mobile_app': ['mobile app', 'application', 'تطبيق'],
            'service_regions': ['all regions', 'everywhere', 'كل الولايات'],
            'is_free': ['is it free', 'cost to use', 'مجاني'],
            'what_can_i_do': ['what can i do', 'features', 'ماذا يمكنني'],
            'where_start': ['where start', 'guide', 'من أين أبدأ'],
            'not_understood': ['not understand', 'didnt understand', 'لم أفهم']
        }

        # If it came from smart bridge as 'visitor', let's find a more specific one
        target_intent = 'how_works' if 'work' in msg_lower or 'how' in msg_lower else 'what_is_agrisouk'
        
        intent_found = False
        for key, keywords in visitor_intents.items():
            if any(all(subword in msg_lower for subword in k.split()) for k in keywords):
                intent = key
                intent_found = True
                break
        
        if not intent_found:
            if intent == 'visitor':
                intent = target_intent
            elif intent == 'farms':
                intent = 'origin'

        # Override intent for specific mapping
        if intent in ['inventory', 'products']:
            intent = 'products'
        elif intent == 'agriculture_advice':
            intent = 'advice'
        
        # Check for simple "how work" match manually if subword check fails
        if intent in ['general', 'what_is_agrisouk'] and 'work' in msg_lower and ('how' in msg_lower or 'platform' in msg_lower or 'it' in msg_lower):
            intent = 'how_works'

        # AI PASSTHROUGH: If it's a general question or advice, let AI handle it
        conversational_intents = ['advice', 'agriculture_advice', 'general']
        if intent in conversational_intents:
            return f"The user is a visitor asking about {intent}. Message: {message}. Please provide expert agricultural or platform advice. Keep it friendly and encourage registration.", False

        # 2. MULTI-LINGUAL RESPONSES
        responses = {
            'how_works': {
                'en': "AgriSouk works by connecting farmers directly with buyers. 1. Farmers list products. 2. Buyers place orders. 3. Transporters deliver the goods. 4. Payment is made on delivery.",
                'fr': "AgriSouk fonctionne en connectant directement les agriculteurs aux acheteurs.",
                'ar': "يعمل أغري سوق من خلال ربط الفلاحين مباشرة بالمشترين. 1. الفلاحون يعرضون المنتجات. 2. المشترون يقدمون الطلبات. 3. الناقلون يوصلون السلع. 4. الدفع عند الاستلام.",
                'buttons': [{"label": "Learn More", "action": "learn_more"}, {"label": "Browse Products", "action": "browse_products"}]
            },
            'what_is_agrisouk': {
                'en': "AgriSouk DZ is Algeria's leading digital marketplace that connects local farmers directly with consumers and businesses. Our mission is to promote local agriculture through technology.",
                'fr': "AgriSouk DZ est le principal marché numérique d'Algérie qui connecte directement les agriculteurs locaux aux consommateurs.",
                'ar': "أغري سوق دي زاد هي منصة رقمية جزائرية رائدة تربط الفلاحين المحليين مباشرة بالمستهلكين والشركات.",
                'buttons': [{"label": "Learn More", "action": "learn_more"}, {"label": "Browse Products", "action": "browse_products"}]
            },
            'management': {
                'en': "The platform is managed by a dedicated team of Algerian agricultural and tech experts committed to digitizing and improving the local food supply chain.",
                'fr': "La plateforme est gérée par une équipe d'experts algériens en agriculture et en technologie.",
                'ar': "تدار المنصة من طرف فريق متخصص من الخبراء الجزائريين في الفلاحة والتكنولوجيا الملتزمين برقمنة وتحسين سلسلة التوريد الغذائي.",
                'buttons': [{"label": "Learn More", "action": "learn_more"}]
            },
            'different': {
                'en': "Unlike traditional markets, we cut out middlemen to ensure farmers get better pay and buyers get fresher products at fairer prices through a transparent system.",
                'fr': "Contrairement aux marchés traditionnels, nous supprimons les intermédiaires pour garantir des produits plus frais à des prix plus justes.",
                'ar': "على عكس الأسواق التقليدية، نحن نلغي الوسطاء لضمان حصول الفلاحين على مداخيل أفضل والمشترين على منتجات طازجة بأسعار عادلة.",
                'buttons': [{"label": "Learn More", "action": "learn_more"}, {"label": "Browse Marketplace", "action": "browse_products"}]
            },
            'trusted': {
                'en': "Yes! We verify all farmers and transporters on our platform. We also use a transparent rating system and secure payment methods to ensure a safe experience.",
                'fr': "Oui ! Nous vérifions tous les agriculteurs et transporteurs. Nous utilisons également un système de notation transparent.",
                'ar': "نعم! نحن نوثق جميع الفلاحين والناقلين على منصتنا. كما نستخدم نظام تقييم شفاف وطرق دفع آمنة لضمان تجربة موثوقة.",
                'buttons': [{"label": "Create Account", "action": "register"}]
            },
            'fruits_veggies': {
                'en': "We have a wide range of seasonal fruits and vegetables directly from Algerian farms. You can find everything from potatoes and onions to seasonal fruits like dates and citrus.",
                'fr': "Nous avons une large gamme de fruits et légumes de saison. Vous pouvez tout trouver, des pommes de terre aux dattes.",
                'ar': "لدينا تشكيلة واسعة من الخضر والفواكه الموسمية مباشرة من المزارع الجزائرية. يمكنك العثور على كل شيء من البطاطس والبصل إلى التمور والحوامض.",
                'buttons': [{"label": "Browse Products", "action": "browse_products"}]
            },
            'products': {
                'en': "We offer a wide variety of fresh agricultural products including seasonal fruits, vegetables, and local farm goods directly from verified Algerian producers.",
                'fr': "Nous proposons une grande variété de produits agricoles frais, notamment des fruits de saison, des légumes et des produits fermiers locaux.",
                'ar': "نقدم تشكيلة واسعة من المنتجات الفلاحية الطازجة بما في ذلك الفواكه الموسمية، الخضر، والمنتجات الريفية المحلية.",
                'buttons': [{"label": "Browse Products", "action": "browse_products"}]
            },
            'freshness': {
                'en': "Absolutely! Our products are harvested daily and delivered directly from the farm to ensure they reach you in the freshest possible condition.",
                'fr': "Absolument ! Nos produits sont récoltés quotidiennement et livrés directement de la ferme pour garantir une fraîcheur maximale.",
                'ar': "بالتأكيد! يتم جني منتجاتنا يومياً وتوصيلها مباشرة من المزرعة لضمان وصولها إليكم في أفضل حالة طازجة ممكنة.",
                'buttons': [{"label": "Shop Fresh", "action": "browse_products"}]
            },
            'organic': {
                'en': "Many of our farmers use traditional, natural methods. While not all are certified 'organic', they prioritize natural growth and minimal chemical use.",
                'fr': "Beaucoup de nos agriculteurs utilisent des méthodes traditionnelles. Bien que tous ne soient pas certifiés 'bio', ils privilégient la croissance naturelle.",
                'ar': "يعتمد الكثير من فلاحينا على طرق تقليدية وطبيعية. رغم أن البعض ليس لديه شهادة 'عضوي' رسمية، إلا أنهم يعطون الأولوية للنمو الطبيعي.",
                'buttons': [{"label": "Browse Marketplace", "action": "browse_products"}]
            },
            'pricing': {
                'en': "Our prices are highly competitive because we connect you directly with farmers, eliminating middlemen costs. You get the best value for fresh local products!",
                'fr': "Nos prix sont très compétitifs car nous vous mettons en relation directe avec les agriculteurs. Vous bénéficiez du meilleur rapport qualité-prix !",
                'ar': "أسعارنا تنافسية للغاية لأننا نربطكم مباشرة بالفلاحين، مما يلغي تكاليف الوسطاء. ستحصلون على أفضل قيمة للمنتجات المحلية!",
                'buttons': [{"label": "View Market", "action": "browse_products"}]
            },
            'official_prices': {
                'en': "We monitor market trends to ensure fair pricing. While prices vary by farm, our platform encourages transparency and follows government guidelines for essential goods.",
                'fr': "Nous surveillons les tendances du marché pour garantir des prix équitables. Notre plateforme encourage la transparence et suit les directives gouvernementales.",
                'ar': "نحن نراقب اتجاهات السوق لضمان أسعار عادلة. منصتنا تشجع الشفافية وتتبع الإرشادات الحكومية فيما يخص السلع الأساسية.",
                'buttons': [{"label": "Check Prices", "action": "market_prices"}]
            },
            'origin': {
                'en': "Our products come directly from verified local Algerian farms. We prioritize local sourcing to support our farmers and ensure you get the freshest produce possible.",
                'fr': "Nos produits proviennent directement de fermes algériennes locales vérifiées. Nous privilégions l'approvisionnement local.",
                'ar': "تأتي منتجاتنا مباشرة من المزارع الجزائرية المحلية الموثقة. نحن نعطي الأولوية للمصدر المحلي لدعم فلاحينا وضمان حصولكم على طازج المنتجات.",
                'buttons': [{"label": "Browse Marketplace", "action": "browse_products"}]
            },
            'create_account': {
                'en': "Creating an account is easy! Just click the 'Register' button, choose your role (Buyer, Farmer, or Transporter), and fill in your details to get started.",
                'fr': "Créer un compte est facile ! Cliquez sur 'S'inscrire', choisissez votre rôle et remplissez vos coordonnées.",
                'ar': "إنشاء حساب سهل جداً! ما عليك سوى الضغط على زر 'التسجيل'، واختيار دورك (مشتري، فلاح، أو ناقل)، وملء بياناتك للبدء.",
                'buttons': [{"label": "Register Now", "action": "register"}]
            },
            'delivery_area': {
                'en': "We deliver to multiple major wilayas including Algiers, Blida, Oran, Constantine, and Sétif. We are constantly expanding our reach!",
                'fr': "Nous livrons dans plusieurs wilayas majeures (Alger, Blida, Oran...). Nous élargissons constamment notre portée !",
                'ar': "نحن نوصل إلى عدة ولايات كبرى بما في ذلك الجزائر، البليدة، وهران، قسنطينة، وسطيف. ونحن بصدد التوسع باستمرار!",
                'buttons': [{"label": "Browse Marketplace", "action": "browse_products"}]
            },
            'delivery_time': {
                'en': "Standard delivery takes between 24 to 48 hours depending on your location and the farm's location.",
                'fr': "La livraison standard prend entre 24 et 48 heures selon votre emplacement.",
                'ar': "يستغرق التوصيل العادي ما بين 24 إلى 48 ساعة حسب موقعك وموقع المزرعة.",
                'buttons': [{"label": "Shop Now", "action": "browse_products"}]
            },
            'delivery_today': {
                'en': "Orders placed early in the day might be eligible for fast processing, but standard delivery is usually the next day.",
                'fr': "Les commandes passées tôt peuvent être traitées rapidement, mais la livraison est généralement le lendemain.",
                'ar': "الطلبات التي يتم تقديمها في وقت مبكر من اليوم قد تكون مؤهلة للمعالجة السريعة، لكن التوصيل العادي يكون عادة في اليوم التالي.",
                'buttons': [{"label": "Browse Products", "action": "browse_products"}]
            },
            'who_delivers': {
                'en': "Products are delivered by our network of verified independent transporters who specialize in agricultural logistics.",
                'fr': "Les produits sont livrés par notre réseau de transporteurs indépendants vérifiés.",
                'ar': "يتم توصيل المنتجات من طرف شبكتنا من الناقلين المستقلين الموثقين المتخصصين في اللوجستيك الفلاحي.",
                'buttons': [{"label": "Learn More", "action": "learn_more"}]
            },
            'delivery_schedule': {
                'en': "Yes, you can coordinate the best delivery time directly with the transporter once your order is confirmed.",
                'fr': "Oui, vous pouvez coordonner l'heure de livraison directement avec le transporteur.",
                'ar': "نعم، يمكنك تنسيق أفضل وقت للتوصيل مباشرة مع الناقل بمجرد تأكيد طلبك.",
                'buttons': [{"label": "Start Buying", "action": "browse_products"}]
            },
            'delivery_missed': {
                'en': "If you're not at home, the transporter will contact you to reschedule or arrange a safe drop-off location.",
                'fr': "Si vous n'êtes pas chez vous, le transporteur vous contactera pour reprogrammer.",
                'ar': "إذا لم تكن في المنزل، سيتصل بك الناقل لإعادة جدولة التوصيل أو ترتيب مكان تسليم آمن.",
                'buttons': [{"label": "Contact Support", "action": "contact_page"}]
            },
            'payment_methods': {
                'en': "We primarily support Cash on Delivery (COD), allowing you to pay in cash once you receive and verify your products.",
                'fr': "Nous acceptons principalement le paiement à la livraison (COD).",
                'ar': "نحن ندعم بشكل أساسي الدفع عند الاستلام (COD)، مما يتيح لك الدفع نقداً بمجرد استلام وتفحص منتجاتك.",
                'buttons': [{"label": "Browse Products", "action": "browse_products"}]
            },
            'cash_on_delivery': {
                'en': "Yes! Cash on Delivery is our standard payment method to ensure maximum trust and convenience for our users.",
                'fr': "Oui ! Le paiement à la livraison est notre méthode standard.",
                'ar': "نعم! الدفع عند الاستلام هو طريقتنا القياسية لضمان أقصى درجات الثقة والراحة لمستخدمينا.",
                'buttons': [{"label": "Shop Now", "action": "browse_products"}]
            },
            'payment_timing': {
                'en': "You pay only AFTER the products are delivered to your door and you have verified the quality.",
                'fr': "Vous ne payez qu'APRÈS la livraison des produits et vérification de la qualité.",
                'ar': "أنت تدفع فقط بعد توصيل المنتجات إلى باب منزلك وتأكدك من الجودة.",
                'buttons': [{"label": "Start Shopping", "action": "browse_products"}]
            },
            'payment_security': {
                'en': "Payment is very secure because you pay cash directly to the transporter only when you have the goods in hand.",
                'fr': "Le paiement est très sécurisé car vous payez en espèces à la livraison.",
                'ar': "الدفع آمن جداً لأنك تدفع نقداً مباشرة للناقل فقط عندما تستلم السلع بيدك.",
                'buttons': [{"label": "Create Account", "action": "register"}]
            },
            'start_buying': {
                'en': "To start buying, simply browse our products, add items to your cart, and proceed to checkout. You'll need to create a buyer account to finalize your order.",
                'fr': "Pour commencer à acheter, parcourez nos produits, ajoutez-les au panier et passez à la caisse.",
                'ar': "لبدء الشراء، ما عليك سوى تصفح منتجاتنا، وإضافة العناصر إلى سلتك، ثم إتمام الطلب. ستحتاج لإنشاء حساب مشتري لتأكيد طلبك.",
                'buttons': [{"label": "Browse Products", "action": "browse_products"}, {"label": "Create Account", "action": "register"}]
            },
            'browse_where': {
                'en': "You can browse all available fresh products in our Marketplace. Just click the button below to see what's in stock today!",
                'fr': "Vous pouvez parcourir tous les produits frais dans notre Marketplace.",
                'ar': "يمكنك تصفح جميع المنتجات الطازجة المتوفرة في سوقنا. فقط اضغط على الزر أدناه لرؤية المتوفر اليوم!",
                'buttons': [{"label": "Browse Marketplace", "action": "browse_products"}]
            },
            'use_without_account': {
                'en': "You can browse products and check prices without an account, but you'll need to register to place an order or sell products.",
                'fr': "Vous pouvez consulter les produits sans compte, mais vous devrez vous inscrire pour commander.",
                'ar': "يمكنك تصفح المنتجات والتحقق من الأسعار بدون حساب، لكن ستحتاج للتسجيل لتقديم طلب أو بيع المنتجات.",
                'buttons': [{"label": "Browse Products", "action": "browse_products"}, {"label": "Register Now", "action": "register"}]
            },
            'farmer_verification': {
                'en': "Yes! We manually verify every farmer's identity and farm details to ensure the quality and authenticity of the products listed on AgriSouk.",
                'fr': "Oui ! Nous vérifions manuellement l'identité de chaque agriculteur.",
                'ar': "نعم! نحن نوثق يدوياً هوية كل فلاح وتفاصيل مزرعته لضمان جودة ومصداقية المنتجات المعروضة على أغري سوق.",
                'buttons': [{"label": "Learn More", "action": "learn_more"}]
            },
            'commission': {
                'en': "We charge a very small commission on successful sales to maintain the platform and logistics. Registration is completely free for everyone!",
                'fr': "Nous prélevons une très petite commission sur les ventes réussies. L'inscription est gratuite !",
                'ar': "نحن نقتطع عمولة صغيرة جداً على المبيعات الناجحة لصيانة المنصة والخدمات اللوجستية. التسجيل مجاني تماماً للجميع!",
                'buttons': [{"label": "Farmer Register", "action": "register_farmer"}]
            },
            'customer_support': {
                'en': "Our customer support team is available from 8 AM to 6 PM to help you with any issues. You can reach us via the contact page.",
                'fr': "Notre équipe de support client est disponible de 8h à 18h.",
                'ar': "فريق دعم الزبائن لدينا متوفر من الساعة 8 صباحاً حتى 6 مساءً لمساعدتك في أي مشكلة. يمكنك التواصل معنا عبر صفحة الاتصال.",
                'buttons': [{"label": "Contact Us", "action": "contact_page"}]
            },
            'help_where': {
                'en': "If you need help, you can check our 'About' page for guides or click the 'Contact Us' button to speak with a representative.",
                'fr': "Si vous avez besoin d'aide, consultez notre page 'À propos' ou contactez-nous.",
                'ar': "إذا كنت بحاجة للمساعدة، يمكنك مراجعة صفحة 'من نحن' للحصول على أدلة أو الضغط على زر 'اتصل بنا' للتحدث مع أحد ممثلينا.",
                'buttons': [{"label": "Contact Support", "action": "contact_page"}, {"label": "Learn More", "action": "learn_more"}]
            },
            'mobile_app': {
                'en': "We are currently developing a mobile app for iOS and Android. For now, our website is fully mobile-responsive and works perfectly on your phone!",
                'fr': "Nous développons actuellement une application mobile. Pour l'instant, notre site est optimisé pour mobile.",
                'ar': "نحن نقوم حالياً بتطوير تطبيق للهاتف المحمول لنظامي iOS و Android. في الوقت الحالي، موقعنا متوافق تماماً مع الهواتف ويعمل بشكل مثالي!",
                'buttons': [{"label": "Browse Products", "action": "browse_products"}]
            },
            'service_regions': {
                'en': "Currently, our full logistics service is available in major northern wilayas, but we are expanding to cover all of Algeria very soon.",
                'fr': "Actuellement, notre service logistique est disponible dans les wilayas du nord.",
                'ar': "حالياً، تتوفر خدمتنا اللوجستية الكاملة في الولايات الشمالية الكبرى، لكننا نتوسع لتغطية كل الجزائر قريباً جداً.",
                'buttons': [{"label": "Browse Products", "action": "browse_products"}]
            },
            'is_free': {
                'en': "Yes! Registering and browsing on AgriSouk is 100% free for buyers, farmers, and transporters.",
                'fr': "Oui ! L'inscription et la navigation sur AgriSouk sont 100% gratuites.",
                'ar': "نعم! التسجيل والتصفح على أغري سوق مجاني 100% للمشترين والفلاحين والناقلين.",
                'buttons': [{"label": "Create Account", "action": "register"}]
            },
            'what_can_i_do': {
                'en': "You can browse fresh products, check real-time market prices, register as a farmer to sell, or join as a transporter to deliver goods.",
                'fr': "Vous pouvez parcourir des produits frais, consulter les prix du marché ou vous inscrire pour vendre.",
                'ar': "يمكنك تصفح المنتجات الطازجة، التحقق من أسعار السوق في الوقت الحقيقي، التسجيل كفلاح للبيع، أو الانضمام كناقل لتوصيل السلع.",
                'buttons': [{"label": "Start Now", "action": "register"}, {"label": "Browse Marketplace", "action": "browse_products"}]
            },
            'where_start': {
                'en': "The best place to start is by creating an account or browsing our marketplace to see what's available today!",
                'fr': "Le meilleur endroit pour commencer est de créer un compte ou de parcourir notre marketplace.",
                'ar': "أفضل مكان للبدء هو إنشاء حساب أو تصفح سوقنا لرؤية ما هو متوفر اليوم!",
                'buttons': [{"label": "Browse Products", "action": "browse_products"}, {"label": "Create Account", "action": "register"}]
            },
            'not_understood': {
                'en': "I'm sorry, I didn't quite catch that. Could you please rephrase your question or choose one of the options below?",
                'fr': "Désolé, je n'ai pas bien compris. Pourriez-vous reformuler ou choisir une option ?",
                'ar': "عذراً، لم أفهم ذلك تماماً. هل يمكنك إعادة صياغة سؤالك أو اختيار أحد الخيارات أدناه؟",
                'buttons': [{"label": "Browse Products", "action": "browse_products"}, {"label": "Learn More", "action": "learn_more"}]
            },
            'getting_started': {
                'en': "Creating an account is simple 👇\n\n1. Click on 'register'\n2. Choose your role (Buyer / Farmer / Transporter)\n3. Fill in your information\n4. Confirm your account\n\n✅ You can start using the platform immediately after registration.",
                'fr': "Créer un compte est simple 👇\n\n1. Cliquez sur 'register'\n2. Choisissez votre rôle (Acheteur / Agriculteur / Transporteur)\n3. Remplissez vos informations\n4. Confirmez votre compte\n\n✅ Vous pouvez commencer à utiliser la plateforme immédiatement après l'inscription.",
                'ar': "إنشاء حساب سهل جداً 👇\n\n1. اضغط على 'register'\n2. اختر صفتك (مشتري / فلاح / ناقل)\n3. املأ معلوماتك الشخصية\n4. قم بتأكيد حسابك\n\n✅ يمكنك البدء في استخدام المنصة مباشرة بعد التسجيل.",
                'buttons': [
                    {"label": "Create Account", "action": "register"},
                    {"label": "Browse Products", "action": "browse_products"}
                ]
            },
            'sell_products': {
                'en': "Yes, you can sell your products on AgriSouk! You need to create a farmer account and get verified to start reaching more customers.",
                'fr': "Oui, vous pouvez vendre vos produits sur AgriSouk ! Vous devez créer un compte agriculteur et être vérifié pour commencer.",
                'ar': "نعم، يمكنك بيع منتجاتك على منصة أغري سوق! تحتاج فقط لإنشاء حساب فلاح وتوثيقه للبدء في الوصول إلى المزيد من الزبائن.",
                'buttons': [ {"label": "Farmer Register", "action": "register_farmer"} ]
            },
            'farmer_registration': {
                'en': "To register as a farmer:\n\n1. Click 'Farmer Register' below\n2. Choose the 'Farmer' role\n3. Fill in your farm details\n4. Submit for verification\n\nOnce verified, you can list your products!",
                'fr': "Pour s'inscrire en tant qu'agriculteur :\n\n1. Cliquez sur 'S'inscrire'\n2. Choisissez le rôle 'Agriculteur'\n3. Remplissez les détails de votre ferme\n4. Soumettez pour vérification\n\nUne fois vérifié, vous pourrez lister vos produits !",
                'ar': "للتسجيل كفلاح:\n\n1. اضغط على زر التسجيل بالأسفل\n2. اختر دور 'فلاح'\n3. أدخل معلومات مزرعتك\n4. أرسل طلبك للتوثيق\n\nبمجرد توثيق حسابك، يمكنك عرض منتجاتك!",
                'buttons': [ {"label": "Farmer Register", "action": "register_farmer"} ]
            },
            'contact': {
                'en': "Need help? Contact our customer support via the contact page or call our hotline. We're here for you!",
                'fr': "Besoin d'aide ? Contactez notre support client via la page contact ou appelez notre hotline. Nous sommes là pour vous !",
                'ar': "تحتاج مساعدة؟ اتصل بدعم الزبائن عبر صفحة الاتصال أو اتصل بالرقم المباشر. نحن هنا لخدمتكم!",
                'buttons': [
                    {"label": "Contact Us", "action": "contact_page"}
                ]
            },
            'general': {
                'en': "I'm not sure I understood. I can help with information about products, how the platform works, or registration. What would you like to know?",
                'fr': "Je ne suis pas sûr d'avoir compris. Je peux vous aider avec des informations sur les produits, le fonctionnement de la plateforme ou l'inscription.",
                'ar': "لم أفهم طلبك جيداً. يمكنني مساعدتك بمعلومات عن المنتجات، طريقة عمل المنصة، أو كيفية التسجيل. ماذا تود أن تعرف؟",
                'buttons': [
                    {"label": "How it works", "action": "how_it_works"},
                    {"label": "Browse Products", "action": "browse_products"},
                    {"label": "Create Account", "action": "register"}
                ]
            }
        }

        # Dynamic Product List
        if intent == 'products':
            is_veg = 'vegetable' in msg_lower or 'خضر' in msg_lower
            is_fruit = 'fruit' in msg_lower or 'فواكه' in msg_lower
            
            cat_q = Q()
            cat_name = ""
            
            if is_veg and is_fruit:
                cat_q = Q(id_category__category_name__icontains='Vegetable') | Q(id_category__category_name__icontains='Fruit')
                cat_name = "vegetables and fruits"
            elif is_veg:
                cat_q = Q(id_category__category_name__icontains='Vegetable')
                cat_name = "vegetables"
            elif is_fruit:
                cat_q = Q(id_category__category_name__icontains='Fruit')
                cat_name = "fruits"
            
            prods = Product.objects.filter(cat_q)[:6]
            if prods.exists():
                p_list = ", ".join([p.product_name for p in prods])
                responses['products']['en'] = f"We have fresh {cat_name or 'products'} available, including: {p_list} and more!\n\n👇 Click the 'Browse Products' button below to explore the full Marketplace."
                responses['products']['fr'] = f"Nous avons des {cat_name or 'produits'} frais disponibles, notamment: {p_list} et plus encore !\n\n👇 Cliquez sur le bouton 'Parcourir les Produits' ci-dessous pour explorer le marché."
                responses['products']['ar'] = f"لدينا {cat_name or 'منتجات'} طازجة متوفرة، تشمل: {p_list} وغيرها الكثير!\n\n👇 اضغط على زر 'تصفح المنتجات' بالأسفل للانتقال إلى السوق المفتوح."

        lang = self._detect_language(message)
        res_data = responses.get(intent, responses['general'])
        
        return json.dumps({
            "type": "guest_info",
            "message": res_data.get(lang, res_data['en']),
            "buttons": res_data['buttons']
        }), True

    def _smart_fallback(self, message, context, lang, error_type):
        """Returns a helpful static answer when AI services fail, especially for farming advice."""
        
        msg_lower = message.lower()
        is_farming = any(w in msg_lower for w in ['plant', 'grow', 'soil', 'seed', 'water', 'advice', 'نصيحة', 'زراعة', 'نمو', 'تربة', 'سقي'])
        
        if is_farming:
            messages = {
                'ar': "🌱 نصيحة زراعية سريعة: لضمان نمو جيد، تأكد من جودة التربة ومواعيد السقي المناسبة حسب نوع المحصول. للحصول على تفاصيل دقيقة، يرجى التسجيل في المنصة.",
                'fr': "🌱 Conseil agricole : Pour une bonne croissance, assurez-vous de la qualité du sol et des horaires d'arrosage. Pour plus de détails, inscrivez-vous sur la plateforme.",
                'en': "🌱 Quick Agri Advice: For best results, ensure soil quality and proper irrigation schedules based on your crop type. Register on the platform for detailed guides."
            }
            return messages.get(lang, messages['en'])

        messages = {
            'ar': "⚠️ السيرفر مشغول حالياً، يرجى المحاولة بعد لحظات أو الاستفسار عن المنتجات والتسجيل.",
            'fr': "⚠️ Le serveur est actuellement surchargé, veuillez réessayer dans quelques instants ou poser des questions sur les produits.",
            'en': "⚠️ The server is currently busy, please try again in a few moments or ask about products and registration."
        }
        return messages.get(lang, messages['en'])
