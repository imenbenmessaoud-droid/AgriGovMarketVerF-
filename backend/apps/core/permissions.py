from rest_framework import permissions


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
        if hasattr(obj, 'farmer'):
            return obj.farmer.user == request.user
        return request.user.user_type == 'farmer'


class IsBuyer(permissions.BasePermission):
    """Permission pour les acheteurs"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'buyer'


class IsTransporter(permissions.BasePermission):
    """Permission pour les transporteurs"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'transporter'


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Propriétaire peut modifier, les autres seulement lecture"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
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