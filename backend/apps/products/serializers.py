# apps/products/serializers.py
from rest_framework import serializers
from .models import Category, Product, PriceOff, ProductItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id_category', 'category_name', 'category_description']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='id_category.category_name', read_only=True)
    current_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id_product', 'product_name', 'product_description',
            'product_quality', 'id_category', 'category_name', 'is_active',
            'current_price'
        ]

    def get_current_price(self, obj):
        from django.utils import timezone
        from django.db.models import Q
        current_date = timezone.now().date()
        current_price = PriceOff.objects.filter(
            id_product=obj,
            date_set__lte=current_date
        ).filter(
            Q(valid_until__isnull=True) | Q(valid_until__gte=current_date)
        ).order_by('-date_set').first()
        if current_price:
            return PriceOffSerializer(current_price).data
        return None


class PriceOffSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='id_product.product_name', read_only=True)

    class Meta:
        model = PriceOff
        fields = [
            'max_price', 'min_price', 'price_unit',
            'date_set', 'valid_until', 'id_product', 'product_name'
        ]


class ProductItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='id_product.product_name', read_only=True)
    product_quality = serializers.CharField(source='id_product.product_quality', read_only=True)
    product_description = serializers.CharField(source='id_product.product_description', read_only=True)
    category_name = serializers.CharField(source='id_product.id_category.category_name', read_only=True)
    farmer_name = serializers.CharField(source='id_farmer.user.name', read_only=True)
    farmer_id = serializers.IntegerField(source='id_farmer.user.id_user', read_only=True)
    farm_name = serializers.CharField(source='id_farm.FarmName', read_only=True)

    class Meta:
        model = ProductItem
        fields = [
            'id', 'id_order_item', 'quantity', 'product_price', 'item_date',
            'production_date', 'is_available', 'product_image',
            'id_product', 'product_name', 'product_quality',
            'product_description', 'category_name',
            'id_farmer', 'farmer_name', 'farmer_id',
            'id_farm', 'farm_name'
        ]
        read_only_fields = ['item_date', 'id_order_item', 'id_farmer']