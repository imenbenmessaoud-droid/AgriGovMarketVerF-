# apps/products/views.py
# apps/products/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from django.utils import timezone
from .models import Category, Product, PriceOff, ProductItem
from .serializers import *
from .services import ProductService
from .price_validator import PriceValidator

class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing product categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing products
    """
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(id_category=category_id)
        quality = self.request.query_params.get('quality', None)
        if quality:
            queryset = queryset.filter(product_quality=quality)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(product_name__icontains=search)
        return queryset

    @action(detail=True, methods=['post'])
    def set_price(self, request, pk=None):
        """
        Set official price range for a product
        """
        product = self.get_object()
        try:
            price_off = ProductService.set_official_price(
                product_id=product.id_product,
                admin_id=request.user.id_user,
                min_price=request.data.get('min_price'),
                max_price=request.data.get('max_price'),
                price_unit=request.data.get('price_unit')
            )
            serializer = PriceOffSerializer(price_off)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def price_history(self, request, pk=None):
        """
        Get price history for a product
        """
        product = self.get_object()
        prices = PriceOff.objects.filter(id_product=product).order_by('-date_set')
        serializer = PriceOffSerializer(prices, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def current_price(self, request, pk=None):
        """
        Get current valid price for a product
        """
        product = self.get_object()
        current_date = timezone.now().date()
        current_price = PriceOff.objects.filter(
            id_product=product,
            date_set__lte=current_date
        ).filter(
            Q(valid_until__isnull=True) | Q(valid_until__gte=current_date)
        ).order_by('-date_set').first()
        
        if current_price:
            serializer = PriceOffSerializer(current_price)
            return Response(serializer.data)
        return Response({'message': 'No active price found'}, status=status.HTTP_404_NOT_FOUND)


class ProductItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for farmer product offers (what buyers browse)
    """
    queryset = ProductItem.objects.filter(is_available=True, quantity__gt=0)
    serializer_class = ProductItemSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product', None)
        if product_id:
            queryset = queryset.filter(id_product=product_id)
        farmer_id = self.request.query_params.get('farmer', None)
        if farmer_id:
            queryset = queryset.filter(id_farmer=farmer_id)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(id_product__product_name__icontains=search)
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(id_product__id_category=category)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'farmer_profile'):
            serializer.save(id_farmer=user.farmer_profile)
        else:
            raise PermissionError("Only farmers can add product items")

    @action(detail=False, methods=['get'])
    def available(self, request):
        """
        Get all available products (with stock > 0)
        """
        available_items = ProductService.get_available_products()
        
        # Filter by product name if provided
        product_name = request.query_params.get('product_name', None)
        if product_name:
            available_items = available_items.filter(id_product__product_name__icontains=product_name)
        
        # Filter by farmer if provided
        farmer_id = request.query_params.get('farmer', None)
        if farmer_id:
            available_items = available_items.filter(id_farmer=farmer_id)
        
        serializer = self.get_serializer(available_items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def validate_price(self, request, pk=None):
        """
        Validate price against official range
        """
        item = self.get_object()
        try:
            PriceValidator.validate_product_price(
                item.id_product.id_product,
                item.product_price,
                item.item_date
            )
            return Response({
                'status': 'valid',
                'message': 'Price is within official range'
            })
        except Exception as e:
            return Response({
                'status': 'invalid',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_items(self, request):
        """
        Get current user's product items (for farmers)
        """
        user = request.user
        if hasattr(user, 'farmer_profile'):
            items = ProductItem.objects.filter(id_farmer=user.farmer_profile)
            serializer = self.get_serializer(items, many=True)
            return Response(serializer.data)
        return Response({'error': 'Only farmers can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)