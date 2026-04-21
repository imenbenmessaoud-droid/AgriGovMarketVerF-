# apps/farms/services.py
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Farm
from apps.users.models import Farmer


class FarmService:
    """Service pour la gestion des fermes"""
    
    @staticmethod
    def get_farms_by_farmer(farmer_id):
        """Récupérer toutes les fermes d'un agriculteur"""
        try:
            farmer = Farmer.objects.get(user_id=farmer_id)
            return farmer.farms.all()
        except Farmer.DoesNotExist:
            return []
    
    @staticmethod
    def get_farm_with_products(farm_id):
        """Récupérer une ferme avec ses produits"""
        try:
            farm = Farm.objects.get(IdFarm=farm_id)
            products = farm.product_items.filter(is_available=True)
            return farm, products
        except Farm.DoesNotExist:
            return None, []
    
    @staticmethod
    def get_farms_by_location(location):
        """Récupérer les fermes par localisation"""
        return Farm.objects.filter(LocationFarm__icontains=location)
    
    @staticmethod
    def get_farms_by_min_size(min_size):
        """Récupérer les fermes par taille minimale"""
        return Farm.objects.filter(Size__gte=min_size)
    
    @staticmethod
    def get_farm_statistics(farmer_id):
        """Statistiques des fermes pour un agriculteur"""
        farms = FarmService.get_farms_by_farmer(farmer_id)
        
        if not farms:
            return {
                'total_farms': 0,
                'total_size': 0,
                'average_size': 0,
                'farms': []
            }
        
        total_size = sum(farm.Size for farm in farms)
        
        return {
            'total_farms': farms.count(),
            'total_size': total_size,
            'average_size': total_size / farms.count(),
            'farms': [
                {
                    'id': farm.IdFarm,
                    'name': farm.FarmName,
                    'size': farm.Size,
                    'location': farm.LocationFarm,
                    'created_at': farm.created_at
                }
                for farm in farms
            ]
        }
    
    @staticmethod
    @transaction.atomic
    def transfer_farm_ownership(farm_id, new_farmer_id):
        """Transférer la propriété d'une ferme à un autre agriculteur"""
        try:
            farm = Farm.objects.get(IdFarm=farm_id)
            new_farmer = Farmer.objects.get(user_id=new_farmer_id)
            
            old_farmer = farm.farmer
            farm.farmer = new_farmer
            farm.save()
            
            return {
                'success': True,
                'message': f'Ferme transférée de {old_farmer.user.name} à {new_farmer.user.name}',
                'farm': farm
            }
        except Farm.DoesNotExist:
            return {'success': False, 'message': 'Ferme non trouvée'}
        except Farmer.DoesNotExist:
            return {'success': False, 'message': 'Nouvel agriculteur non trouvé'}