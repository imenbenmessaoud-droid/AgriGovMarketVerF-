# apps/farms/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Farm
from .serializers import (
    FarmSerializer, FarmCreateSerializer, 
    FarmUpdateSerializer, FarmListSerializer
)
from apps.core.permissions import IsFarmer, IsAdmin


class FarmListView(generics.ListAPIView):
    """Liste des fermes (public)"""
    serializer_class = FarmListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Farm.objects.all()
        
        # Filtrage par nom
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(FarmName__icontains=search)
        
        # Filtrage par localisation
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(LocationFarm__icontains=location)
        
        # Filtrage par taille minimale
        min_size = self.request.query_params.get('min_size')
        if min_size:
            queryset = queryset.filter(Size__gte=min_size)
        
        return queryset


class FarmDetailView(generics.RetrieveAPIView):
    """Détails d'une ferme"""
    serializer_class = FarmSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'IdFarm'
    
    def get_queryset(self):
        return Farm.objects.all()


class MyFarmsView(generics.ListAPIView):
    """Liste des fermes de l'agriculteur connecté"""
    serializer_class = FarmListSerializer
    permission_classes = [IsFarmer]
    
    def get_queryset(self):
        return Farm.objects.filter(farmer=self.request.user.farmer_profile)


class FarmCreateView(generics.CreateAPIView):
    """Créer une nouvelle ferme (Farmer uniquement)"""
    serializer_class = FarmCreateSerializer
    permission_classes = [IsFarmer]
    
    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user.farmer_profile)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'message': 'Ferme créée avec succès',
            'data': FarmSerializer(serializer.instance).data
        }, status=status.HTTP_201_CREATED)


class FarmUpdateView(generics.UpdateAPIView):
    """Mettre à jour une ferme"""
    serializer_class = FarmUpdateSerializer
    permission_classes = [IsFarmer]
    lookup_field = 'IdFarm'
    
    def get_queryset(self):
        return Farm.objects.filter(farmer=self.request.user.farmer_profile)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'message': 'Ferme mise à jour avec succès',
            'data': FarmSerializer(instance).data
        })


class FarmDeleteView(generics.DestroyAPIView):
    """Supprimer une ferme"""
    permission_classes = [IsFarmer]
    lookup_field = 'IdFarm'
    
    def get_queryset(self):
        return Farm.objects.filter(farmer=self.request.user.farmer_profile)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.DeleteFarm()
        
        return Response({
            'success': True,
            'message': 'Ferme supprimée avec succès'
        }, status=status.HTTP_200_OK)


class FarmStatsView(APIView):
    """Statistiques des fermes pour un farmer"""
    permission_classes = [IsFarmer]
    
    def get(self, request):
        farmer = request.user.farmer_profile
        farms = farmer.farms.all()
        
        stats = {
            'total_farms': farms.count(),
            'total_products': 0,
            'total_size': sum(farm.Size for farm in farms),
            'farms': [
                {
                    'id': farm.IdFarm,
                    'name': farm.FarmName,
                    'size': farm.Size,
                    'products_count': farm.get_products_count()
                }
                for farm in farms
            ]
        }
        
        return Response(stats)