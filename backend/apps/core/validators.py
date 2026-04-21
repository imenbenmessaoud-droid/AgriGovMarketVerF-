from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import re


def validate_phone_number(value):
    """Valider un numéro de téléphone algérien"""
    if not value:
        return
    
    pattern = r'^(0|(\+213))[5-7]\d{8}$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Numéro de téléphone invalide. Exemple: 0555123456 ou +213555123456'),
            code='invalid_phone'
        )


def validate_positive_number(value):
    """Valider que le nombre est positif"""
    if value <= 0:
        raise ValidationError(
            _('La valeur doit être supérieure à 0'),
            code='positive_number_required'
        )


def validate_price(value):
    """Valider un prix"""
    if value <= 0:
        raise ValidationError(
            _('Le prix doit être supérieur à 0'),
            code='invalid_price'
        )
    
    if value > 1000000:
        raise ValidationError(
            _('Le prix ne peut pas dépasser 1,000,000 DZD'),
            code='price_too_high'
        )


def validate_quantity(value):
    """Valider une quantité"""
    if value <= 0:
        raise ValidationError(
            _('La quantité doit être supérieure à 0'),
            code='invalid_quantity'
        )
    
    if value > 10000:
        raise ValidationError(
            _('La quantité ne peut pas dépasser 10,000 unités'),
            code='quantity_too_high'
        )


def validate_license_number(value):
    """Valider un numéro de licence"""
    if not value:
        return
    
    pattern = r'^[A-Za-z0-9\-]{5,20}$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Numéro de licence invalide. 5-20 caractères (lettres, chiffres, tirets)'),
            code='invalid_license'
        )


def validate_coordinates(latitude=None, longitude=None):
    """Valider les coordonnées géographiques"""
    if latitude and (latitude < -90 or latitude > 90):
        raise ValidationError(
            _('Latitude invalide. Doit être entre -90 et 90'),
            code='invalid_latitude'
        )
    
    if longitude and (longitude < -180 or longitude > 180):
        raise ValidationError(
            _('Longitude invalide. Doit être entre -180 et 180'),
            code='invalid_longitude'
        )


def validate_email(value):
    """Valider un email"""
    if not value:
        return
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Adresse email invalide'),
            code='invalid_email'
        )