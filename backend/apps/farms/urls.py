# apps/farms/urls.py
# apps/farms/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Liste publique des fermes
    path('', views.FarmListView.as_view(), name='farm-list'),
    
    # Détails d'une ferme
    path('<int:IdFarm>/', views.FarmDetailView.as_view(), name='farm-detail'),
    
    # Mes fermes (farmer connecté)
    path('my-farms/', views.MyFarmsView.as_view(), name='my-farms'),
    
    # Créer une ferme
    path('create/', views.FarmCreateView.as_view(), name='farm-create'),
    
    # Mettre à jour une ferme
    path('<int:IdFarm>/update/', views.FarmUpdateView.as_view(), name='farm-update'),
    
    # Supprimer une ferme
    path('<int:IdFarm>/delete/', views.FarmDeleteView.as_view(), name='farm-delete'),
    
    # Statistiques des fermes
    path('stats/', views.FarmStatsView.as_view(), name='farm-stats'),
]