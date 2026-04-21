# apps/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import Group, Permission
from django.utils.translation import gettext_lazy as _
from django.db.models import Sum
from .models import User, Administrator, Farmer, Buyer, Transporter, Notification


# ============================================================
# USER SERIALIZERS
# ============================================================

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User"""
    full_name = serializers.SerializerMethodField()
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id_user', 'name', 'email', 'phone', 'address',
            'user_type', 'user_type_display', 'is_validated',
            'is_active', 'created_at', 'updated_at', 'full_name'
        ]
        read_only_fields = ['id_user', 'created_at', 'updated_at', 'is_validated']
    
    def get_full_name(self, obj):
        return obj.name


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'password_confirm', 'phone', 'address', 'user_type']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists"})
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        
        if not user:
            raise serializers.ValidationError(_("Invalid credentials"))
        
        if not user.is_active:
            raise serializers.ValidationError(_("Account has been rejected or disabled by the administrator."))
            
        if not user.is_validated and user.user_type != 'admin':
            raise serializers.ValidationError(_("Account is pending approval. Please wait for an administrator to approve your account."))
        
        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords do not match"})
        return data


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for requesting a password reset"""
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset with token"""
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords do not match"})
        return data


class ProfileSerializer(serializers.Serializer):
    """Serializer for combined user profile"""
    user = UserSerializer()
    profile = serializers.SerializerMethodField()
    
    def get_profile(self, obj):
        user = obj
        if user.user_type == 'farmer' and hasattr(user, 'farmer_profile'):
            return FarmerSerializer(user.farmer_profile).data
        elif user.user_type == 'buyer' and hasattr(user, 'buyer_profile'):
            return BuyerSerializer(user.buyer_profile).data
        elif user.user_type == 'transporter' and hasattr(user, 'transporter_profile'):
            return TransporterSerializer(user.transporter_profile).data
        elif user.user_type == 'admin' and hasattr(user, 'admin_profile'):
            return AdministratorSerializer(user.admin_profile).data
        return None


# ============================================================
# PROFILE SERIALIZERS
# ============================================================

class AdministratorSerializer(serializers.ModelSerializer):
    """Serializer for Administrator"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Administrator
        fields = ['user', 'role']


class FarmerSerializer(serializers.ModelSerializer):
    """Serializer for Farmer"""
    user = UserSerializer(read_only=True)
    farms_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Farmer
        fields = ['user', 'total_earnings', 'farms_count']
        read_only_fields = ['total_earnings']
    
    def get_farms_count(self, obj):
        return obj.farms.count() if hasattr(obj, 'farms') else 0


class BuyerSerializer(serializers.ModelSerializer):
    """Serializer for Buyer"""
    user = UserSerializer(read_only=True)
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    
    class Meta:
        model = Buyer
        fields = ['user', 'buyer_balance', 'total_orders', 'total_spent']
        read_only_fields = ['buyer_balance', 'total_orders', 'total_spent']
    
    def get_total_orders(self, obj):
        return obj.orders.count() if hasattr(obj, 'orders') else 0
    
    def get_total_spent(self, obj):
        total = obj.orders.aggregate(total=Sum('total_amount'))['total'] or 0
        return float(total)


class TransporterSerializer(serializers.ModelSerializer):
    """Serializer for Transporter"""
    user = UserSerializer(read_only=True)
    total_deliveries = serializers.SerializerMethodField()
    
    class Meta:
        model = Transporter
        fields = ['user', 'area_service', 'delivery_earnings', 'vehicle_type',
                  'vehicle_capacity', 'license_number', 'total_deliveries']
        read_only_fields = ['delivery_earnings']
    
    def get_total_deliveries(self, obj):
        return obj.delivery_missions.count() if hasattr(obj, 'delivery_missions') else 0


# ============================================================
# GROUP & PERMISSION SERIALIZERS
# ============================================================

class PermissionSerializer(serializers.ModelSerializer):
    """Serializer for permissions"""
    content_type_app = serializers.CharField(source='content_type.app_label', read_only=True)
    content_type_model = serializers.CharField(source='content_type.model', read_only=True)
    
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type_app', 'content_type_model']


class GroupSerializer(serializers.ModelSerializer):
    """Serializer for groups"""
    permissions = PermissionSerializer(many=True, read_only=True)
    permissions_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        source='permissions',
        write_only=True,
        many=True,
        required=False
    )
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permissions_ids', 'user_count']
    
    def get_user_count(self, obj):
        """Get number of users in this group"""
        return obj.user_set.count()


class GroupCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating groups"""
    permissions = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True,
        required=False
    )
    
    class Meta:
        model = Group
        fields = ['name', 'permissions']
    
    def create(self, validated_data):
        permissions = validated_data.pop('permissions', [])
        group = Group.objects.create(**validated_data)
        group.permissions.set(permissions)
        return group


class GroupUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating groups"""
    permissions = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True,
        required=False
    )
    
    class Meta:
        model = Group
        fields = ['name', 'permissions']
    
    def update(self, instance, validated_data):
        permissions = validated_data.pop('permissions', None)
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        
        if permissions is not None:
            instance.permissions.set(permissions)
        
        return instance


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notifications"""
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']