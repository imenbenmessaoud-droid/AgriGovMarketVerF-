from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
import logging
from .models import User, Farmer, Buyer, Transporter

logger = logging.getLogger(__name__)


class UserService:
    """Service pour la gestion des utilisateurs"""
    
    @staticmethod
    def send_validation_email(user):
        """Envoyer un email de validation"""
        try:
            subject = 'Bienvenue sur AgriGov Market'
            message = f"""
            Bonjour {user.name},
            
            Votre compte a été créé avec succès.
            Un administrateur va valider votre compte prochainement.
            
            Cordialement,
            L'équipe AgriGov Market
            """
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            logger.info(f"Validation email sent to {user.email}")
            return True
        except Exception as e:
            logger.error(f"Error sending email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_password_reset_email(user, reset_link):
        """Envoyer un email de réinitialisation de mot de passe"""
        try:
            subject = 'Réinitialisation de votre mot de passe'
            message = f"""
            Bonjour {user.name},
            
            Cliquez sur le lien suivant pour réinitialiser votre mot de passe:
            {reset_link}
            
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            
            Cordialement,
            L'équipe AgriGov Market
            """
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            logger.error(f"Error sending reset email: {str(e)}")
            return False
    
    @staticmethod
    def get_user_statistics():
        """Obtenir les statistiques des utilisateurs"""
        return {
            'total_users': User.objects.count(),
            'farmers': User.objects.filter(user_type='farmer').count(),
            'buyers': User.objects.filter(user_type='buyer').count(),
            'transporters': User.objects.filter(user_type='transporter').count(),
            'admins': User.objects.filter(user_type='admin').count(),
            'validated': User.objects.filter(is_validated=True).count(),
            'active': User.objects.filter(is_active=True).count(),
        }
    
    @staticmethod
    def get_user_by_type(user_type):
        """Obtenir les utilisateurs par type"""
        return User.objects.filter(user_type=user_type)


class FarmerService:
    """Service pour les agriculteurs"""
    
    @staticmethod
    def get_farmer_statistics(farmer):
        """Obtenir les statistiques d'un agriculteur"""
        from apps.orders.models import OrderItem
        from django.db.models import Sum
        
        total_sales = OrderItem.objects.filter(
            product__farmer=farmer,
            order__OrderStatus='delivered'
        ).aggregate(total=Sum('SubTotalItem'))['total'] or 0
        
        return {
            'total_earnings': farmer.TotalEarnings,
            'total_sales': total_sales,
            'farms_count': farmer.farms.count(),
            'products_count': farmer.products.count(),
            'orders_count': farmer.orders.count(),
        }
    
    @staticmethod
    def verify_farmer(farmer):
        """Vérifier un agriculteur"""
        farmer.is_verified = True
        farmer.verified_at = timezone.now()
        farmer.save()
        return farmer


class BuyerService:
    """Service pour les acheteurs"""
    
    @staticmethod
    def get_buyer_statistics(buyer):
        """Obtenir les statistiques d'un acheteur"""
        return {
            'balance': buyer.BuyerBalance,
            'total_orders': buyer.total_orders,
            'total_spent': buyer.total_spent,
            'orders_count': buyer.orders.count(),
        }
    
    @staticmethod
    def add_balance(buyer, amount):
        """Ajouter du solde"""
        if amount <= 0:
            raise ValueError("Le montant doit être positif")
        buyer.BuyerBalance += amount
        buyer.save()
        return buyer.BuyerBalance


class TransporterService:
    """Service pour les transporteurs"""
    
    @staticmethod
    def get_transporter_statistics(transporter):
        """Obtenir les statistiques d'un transporteur"""
        return {
            'delivery_earnings': transporter.DeliveryEarnings,
            'total_deliveries': transporter.total_deliveries,
            'rating': transporter.rating,
            'is_available': transporter.is_available,
        }
    
    @staticmethod
    def update_rating(transporter):
        """Mettre à jour la note du transporteur"""
        from apps.deliveries.models import DeliveryMission
        
        missions = DeliveryMission.objects.filter(
            transporter=transporter,
            DeliveryStatus='delivered'
        )
        
        if missions.exists():
            # Calculer la moyenne des notes
            total_rating = sum(m.rating for m in missions if hasattr(m, 'rating'))
            transporter.rating = total_rating / missions.count()
            transporter.save()
        
        return transporter.rating