# apps/farms/serializers.py
from rest_framework import serializers
from .models import Farm
from apps.users.models import Farmer


class FarmSerializer(serializers.ModelSerializer):
    """Sérializer pour Farm"""
    
    farmer_name = serializers.CharField(source='farmer.user.name', read_only=True)
    farmer_id = serializers.IntegerField(source='farmer.user.id', read_only=True)
    
    class Meta:
        model = Farm
        fields = [
            'IdFarm', 'FarmName', 'LocationFarm', 'Size',
            'farmer', 'farmer_id', 'farmer_name',
            'description', 'latitude', 'longitude', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['IdFarm', 'created_at', 'updated_at']


class FarmCreateSerializer(serializers.ModelSerializer):
    """Sérializer pour la création d'une ferme"""
    
    class Meta:
        model = Farm
        fields = [
            'FarmName', 'LocationFarm', 'Size',
            'description', 'latitude', 'longitude'
        ]
    
    def validate_Size(self, value):
        """Vérifier que la taille est positive"""
        if value <= 0:
            raise serializers.ValidationError("La taille doit être supérieure à 0")
        return value
    
    def validate_FarmName(self, value):
        """Vérifier que le nom n'est pas vide"""
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom de la ferme est obligatoire")
        return value.strip()
    
    def create(self, validated_data):
        """Créer une ferme avec le farmer connecté"""
        request = self.context.get('request')
        farmer = request.user.farmer_profile
        validated_data['farmer'] = farmer
        return super().create(validated_data)


class FarmUpdateSerializer(serializers.ModelSerializer):
    """Sérializer pour la mise à jour d'une ferme"""
    
    class Meta:
        model = Farm
        fields = [
            'FarmName', 'LocationFarm', 'Size',
            'description', 'latitude', 'longitude', 'is_active'
        ]
    
    def validate_Size(self, value):
        if value <= 0:
            raise serializers.ValidationError("La taille doit être supérieure à 0")
        return value


class FarmListSerializer(serializers.ModelSerializer):
    """Sérializer simplifié pour la liste des fermes"""
    
    farmer_name = serializers.CharField(source='farmer.user.name', read_only=True)
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Farm
        fields = [
            'IdFarm', 'FarmName', 'LocationFarm', 'Size',
            'farmer_name', 'products_count', 'is_active', 'created_at'
        ]
    
    def get_products_count(self, obj):
        """Nombre de produits dans la ferme"""
        if hasattr(obj, 'product_items'):
            return obj.product_items.filter(is_available=True).count()
        return 0