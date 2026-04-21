# apps/users/views.py
from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.contrib.auth.models import Group, Permission
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .models import User, Administrator, Farmer, Buyer, Transporter, Notification
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, ChangePasswordSerializer,
    FarmerSerializer, BuyerSerializer, TransporterSerializer, AdministratorSerializer,
    ProfileSerializer, GroupSerializer, GroupCreateSerializer, GroupUpdateSerializer,
    PermissionSerializer, NotificationSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer
)
from .permissions import IsAdmin, IsOwnerOrAdmin
from .services import UserService
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes


# ============================================================
# USER VIEWS
# ============================================================

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'], url_path='me')
    def get_me(self, request):
        """Get current user profile"""
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'], url_path='me')
    def update_me(self, request):
        """Update current user profile"""
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if user.check_password(serializer.validated_data['old_password']):
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                return Response({'message': 'Password changed successfully'})
            return Response({'error': 'Old password is incorrect'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(generics.CreateAPIView):
    """User registration view"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(generics.GenericAPIView):
    """User login view"""
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                login(request, user)
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'user': UserSerializer(user).data,
                    'token': token.key,
                    'message': 'Login successful'
                })
                
            errors = str(serializer.errors)
            if 'pending approval' in errors:
                email = request.data.get('email')
                user = User.objects.filter(email=email).first()
                if user:
                    admins = User.objects.filter(user_type='admin')
                    msg = f"User {user.name} ({user.get_user_type_display()}) attempted to log in and requires validation."
                    for admin in admins:
                        exists = Notification.objects.filter(
                            user=admin,
                            message=msg,
                            notification_type='system',
                            is_read=False
                        ).exists()
                        
                        if not exists:
                            Notification.objects.create(
                                user=admin,
                                title="New User Pending Validation",
                                message=msg,
                                notification_type='system'
                            )
                        
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': f'Internal Error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(generics.GenericAPIView):
    """User logout view"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            request.user.auth_token.delete()
        except:
            pass
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


class PasswordResetRequestView(generics.GenericAPIView):
    """View to request a password reset email"""
    serializer_class = PasswordResetSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Generate token and uid
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.id_user))
            
            # Construct reset link (adjust base URL for your frontend)
            # Link format: /reset-password/:uid/:token
            reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"
            
            # Send email
            if UserService.send_password_reset_email(user, reset_link):
                return Response({'message': 'Password reset email sent'})
            return Response({'error': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(generics.GenericAPIView):
    """View to reset password using token"""
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Token is invalid or expired'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password has been reset successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# PROFILE VIEWSETS
# ============================================================

class FarmerViewSet(viewsets.ModelViewSet):
    """ViewSet for farmers"""
    queryset = Farmer.objects.all()
    serializer_class = FarmerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Farmer.objects.all()
        return Farmer.objects.filter(user=self.request.user)


class BuyerViewSet(viewsets.ModelViewSet):
    """ViewSet for buyers"""
    queryset = Buyer.objects.all()
    serializer_class = BuyerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Buyer.objects.all()
        return Buyer.objects.filter(user=self.request.user)


class TransporterViewSet(viewsets.ModelViewSet):
    """ViewSet for transporters"""
    queryset = Transporter.objects.all()
    serializer_class = TransporterSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Transporter.objects.all()
        return Transporter.objects.filter(user=self.request.user)

    @action(detail=False, methods=['patch'], url_path='update_my_profile')
    def update_my_profile(self, request):
        """Update current transporter profile, creating if missing"""
        transporter, created = Transporter.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(transporter, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdministratorViewSet(viewsets.ModelViewSet):
    """ViewSet for administrators"""
    queryset = Administrator.objects.all()
    serializer_class = AdministratorSerializer
    permission_classes = [IsAdmin]

    @action(detail=False, methods=['get'], url_path='registrations')
    def registrations(self, request):
        """List all non-admin users for validation tracking"""
        users = User.objects.exclude(user_type='admin').order_by('-created_at')
        from .serializers import UserSerializer
        return Response(UserSerializer(users, many=True).data)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        try:
            user = get_object_or_404(User, id_user=pk)
            admin, created = Administrator.objects.get_or_create(user=request.user)
            admin.validate_user(user)
            return Response({'status': 'User approved successfully'})
        except ValidationError as e:
            return Response({'detail': str(e.message if hasattr(e, 'message') else e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        user = get_object_or_404(User, id_user=pk)
        user.is_active = False # Mark as rejected
        user.save()
        return Response({'status': 'User rejected'})


# ============================================================
# GROUP & PERMISSION VIEWSETS
# ============================================================

class GroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing groups
    """
    queryset = Group.objects.all()
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return GroupCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return GroupUpdateSerializer
        return GroupSerializer
    
    @action(detail=True, methods=['post'], url_path='add-users')
    def add_users(self, request, pk=None):
        """Add users to a group"""
        group = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        if not user_ids:
            return Response(
                {'error': 'user_ids list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        users = User.objects.filter(id_user__in=user_ids)
        group.user_set.add(*users)
        
        return Response({
            'message': f'{len(users)} user(s) added to group {group.name}',
            'user_count': group.user_set.count()
        })
    
    @action(detail=True, methods=['post'], url_path='remove-users')
    def remove_users(self, request, pk=None):
        """Remove users from a group"""
        group = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        if not user_ids:
            return Response(
                {'error': 'user_ids list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        users = User.objects.filter(id_user__in=user_ids)
        group.user_set.remove(*users)
        
        return Response({
            'message': f'{len(users)} user(s) removed from group {group.name}',
            'user_count': group.user_set.count()
        })
    
    @action(detail=True, methods=['get'], url_path='users')
    def list_users(self, request, pk=None):
        """List all users in a group"""
        group = self.get_object()
        users = group.user_set.all()
        serializer = UserSerializer(users, many=True)
        return Response({
            'group': group.name,
            'users': serializer.data,
            'total': users.count()
        })


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing permissions"""
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'], url_path='by-app')
    def by_app(self, request):
        """Get permissions grouped by app"""
        permissions_by_app = {}
        for perm in Permission.objects.all().select_related('content_type'):
            app_label = perm.content_type.app_label
            if app_label not in permissions_by_app:
                permissions_by_app[app_label] = []
            permissions_by_app[app_label].append({
                'id': perm.id,
                'name': perm.name,
                'codename': perm.codename
            })
        return Response(permissions_by_app)


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})

    @action(detail=False, methods=['patch'])
    def mark_all_read(self, request):
        """Mark all notification for user as read"""
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})