from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


class EmailAuthBackend(BaseBackend):
    """
    Authentification par email (au lieu de username)
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authentifier un utilisateur par son email
        """
        try:
            # Chercher l'utilisateur par email
            user = User.objects.get(email=username)
            
            # Vérifier le mot de passe
            if user.check_password(password):
                # Vérifier que le compte est actif
                if user.is_active:
                    logger.info(f"User {user.email} authenticated successfully")
                    return user
                else:
                    logger.warning(f"User {user.email} is inactive")
                    raise ValidationError("Compte désactivé")
            else:
                logger.warning(f"Invalid password for {user.email}")
                return None
                
        except User.DoesNotExist:
            logger.warning(f"User {username} does not exist")
            return None
    
    def get_user(self, user_id):
        """Récupérer l'utilisateur par ID"""
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class RoleBasedAuthenticationBackend(BaseBackend):
    """
    Authentification avec vérification du rôle
    """
    
    def authenticate(self, request, username=None, password=None, user_type=None, **kwargs):
        """
        Authentifier un utilisateur et vérifier son type
        """
        try:
            user = User.objects.get(email=username)
            
            if user.check_password(password) and user.is_active:
                # Vérifier le type d'utilisateur si spécifié
                if user_type and user.user_type != user_type:
                    logger.warning(f"User {user.email} tried to login as {user_type} but is {user.user_type}")
                    return None
                
                logger.info(f"User {user.email} authenticated as {user.user_type}")
                return user
                
        except User.DoesNotExist:
            return None
        
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class TokenAuthenticationBackend(BaseBackend):
    """
    Authentification par token (pour API)
    """
    
    def authenticate(self, request, token=None, **kwargs):
        """
        Authentifier un utilisateur par token
        """
        from rest_framework.authtoken.models import Token
        
        if token:
            try:
                token_obj = Token.objects.get(key=token)
                user = token_obj.user
                
                if user.is_active:
                    logger.info(f"User {user.email} authenticated via token")
                    return user
                else:
                    logger.warning(f"User {user.email} is inactive")
                    return None
                    
            except Token.DoesNotExist:
                logger.warning(f"Invalid token: {token}")
                return None
        
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None