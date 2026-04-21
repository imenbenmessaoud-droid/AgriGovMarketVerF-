from rest_framework import permissions
from django.core.exceptions import PermissionDenied


class IsAdmin(permissions.BasePermission):
    """Permission pour les administrateurs"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'
    
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'


class IsFarmer(permissions.BasePermission):
    """Permission pour les agriculteurs"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'farmer'
    
    def has_object_permission(self, request, view, obj):
        # Vérifier si l'objet appartient à l'agriculteur
        if hasattr(obj, 'farmer'):
            return obj.farmer.user == request.user
        if hasattr(obj, 'user') and hasattr(obj.user, 'farmer'):
            return obj.user == request.user
        return request.user.user_type == 'farmer'


class IsBuyer(permissions.BasePermission):
    """Permission pour les acheteurs"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'buyer'
    
    def has_object_permission(self, request, view, obj):
        # Vérifier si l'objet appartient à l'acheteur
        if hasattr(obj, 'buyer'):
            return obj.buyer.user == request.user
        return request.user.user_type == 'buyer'


class IsTransporter(permissions.BasePermission):
    """Permission pour les transporteurs"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'transporter'
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'transporter'):
            return obj.transporter.user == request.user
        return request.user.user_type == 'transporter'


class IsValidated(permissions.BasePermission):
    """Permission pour les utilisateurs validés uniquement"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_validated
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_validated


class IsActive(permissions.BasePermission):
    """Permission pour les comptes actifs uniquement"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_active
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_active


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission: Propriétaire ou Admin peuvent modifier"""
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin peut tout faire
        if request.user.user_type == 'admin':
            return True
        
        # Vérifier si l'utilisateur est le propriétaire
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'farmer') and hasattr(obj.farmer, 'user'):
            return obj.farmer.user == request.user
        if hasattr(obj, 'buyer') and hasattr(obj.buyer, 'user'):
            return obj.buyer.user == request.user
        
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """Admin peut tout faire, les autres seulement lecture"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'


class CanManageUsers(permissions.BasePermission):
    """Permission pour gérer les utilisateurs (Admin seulement)"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'
    
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'


class CanViewReports(permissions.BasePermission):
    """Permission pour voir les rapports (Admin et Ministry)"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.user_type in ['admin', 'ministry']