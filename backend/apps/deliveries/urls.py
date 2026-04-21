# apps/deliveries/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'missions', views.DeliveryMissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
