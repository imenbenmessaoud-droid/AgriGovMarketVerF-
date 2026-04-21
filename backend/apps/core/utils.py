import re
import random
import string
from datetime import datetime, timedelta
from django.utils.text import slugify


def generate_order_number():
    """Générer un numéro de commande unique"""
    prefix = 'ORD'
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_digits = ''.join(random.choices(string.digits, k=4))
    return f"{prefix}-{timestamp}-{random_digits}"


def generate_invoice_number(order_id):
    """Générer un numéro de facture"""
    prefix = 'INV'
    year = datetime.now().year
    random_digits = ''.join(random.choices(string.digits, k=6))
    return f"{prefix}-{year}-{order_id}-{random_digits}"


def generate_mission_number():
    """Générer un numéro de mission de livraison"""
    prefix = 'MIS'
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_digits = ''.join(random.choices(string.digits, k=4))
    return f"{prefix}-{timestamp}-{random_digits}"


def validate_algerian_phone(phone):
    """Valider un numéro de téléphone algérien"""
    pattern = r'^(0|(\+213))[5-7]\d{8}$'
    return bool(re.match(pattern, phone))


def format_price(price, currency='DZD'):
    """Formater un prix"""
    return f"{price:,.2f} {currency}"


def calculate_tax(amount, tax_rate=0.19):
    """Calculer la taxe"""
    return amount * tax_rate


def calculate_delivery_fee(distance_km, weight_kg, delivery_type='standard'):
    """Calculer les frais de livraison"""
    base_fee = 100
    distance_fee = distance_km * 5
    weight_fee = weight_kg * 10
    
    multipliers = {'standard': 1, 'express': 2, 'same_day': 3}
    multiplier = multipliers.get(delivery_type, 1)
    
    return (base_fee + distance_fee + weight_fee) * multiplier


def get_date_range(period='month'):
    """Obtenir une plage de dates"""
    today = datetime.now().date()
    
    if period == 'week':
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
    elif period == 'month':
        start = today.replace(day=1)
        if start.month == 12:
            end = start.replace(year=start.year+1, month=1, day=1) - timedelta(days=1)
        else:
            end = start.replace(month=start.month+1, day=1) - timedelta(days=1)
    elif period == 'year':
        start = today.replace(month=1, day=1)
        end = today.replace(month=12, day=31)
    else:
        start = today
        end = today
    
    return start, end


def slugify_name(name):
    """Convertir un nom en slug"""
    return slugify(name)


def get_client_ip(request):
    """Récupérer l'IP du client"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip