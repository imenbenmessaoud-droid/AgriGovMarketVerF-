from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'farmers', views.FarmerViewSet, basename='farmer')
router.register(r'buyers', views.BuyerViewSet, basename='buyer')
router.register(r'transporters', views.TransporterViewSet, basename='transporter')
router.register(r'administrators', views.AdministratorViewSet, basename='administrator')
router.register(r'groups', views.GroupViewSet, basename='group')
router.register(r'permissions', views.PermissionViewSet, basename='permission') 
router.register(r'notifications', views.NotificationViewSet, basename='notification') 
router.register(r'vehicles', views.TransporterVehicleViewSet, basename='vehicle')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/<uidb64>/<token>/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]