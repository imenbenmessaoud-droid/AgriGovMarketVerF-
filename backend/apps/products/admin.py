# apps/products/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from .models import Category, Product, PriceOff, ProductItem
from apps.users.models import Administrator


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for product categories"""
    list_display = ['id_category', 'category_name', 'category_description', 'admin_name']
    search_fields = ['category_name', 'category_description']
    list_filter = ['id_admin']
    
    def admin_name(self, obj):
        if obj.id_admin:
            return obj.id_admin.user.name if hasattr(obj.id_admin, 'user') else str(obj.id_admin)
        return '-'
    admin_name.short_description = _('Admin')
    admin_name.admin_order_field = 'id_admin__user__name'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin interface for products"""
    list_display = [
        'id_product',
        'product_name',
        'product_quality',
        'category_name',
        'is_active',
        'created_at'
    ]
    search_fields = ['product_name', 'product_description']
    list_filter = ['product_quality', 'is_active', 'id_category']
    list_editable = ['product_quality', 'is_active']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Product Information', {
            'fields': ('product_name', 'product_description', 'product_quality', 'id_category')
        }),
        ('Status', {
            'fields': ('is_active',),
        }),
        ('Dates', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at']
    
    def category_name(self, obj):
        return obj.id_category.category_name if obj.id_category else '-'
    category_name.short_description = _('Category')
    category_name.admin_order_field = 'id_category__category_name'


@admin.register(PriceOff)
class PriceOffAdmin(admin.ModelAdmin):
    """Admin interface for official prices"""
    list_display = [
        'id_product',
        'product_name',
        'min_price',
        'max_price',
        'price_unit',
        'date_set',
        'valid_until_display',
        'admin_name'
    ]
    list_filter = ['date_set', 'price_unit']
    search_fields = ['id_product__product_name', 'id_admin__user__name']
    date_hierarchy = 'date_set'
    
    fieldsets = (
        ('Price Information', {
            'fields': ('id_product', 'min_price', 'max_price', 'price_unit')
        }),
        ('Validity Period', {
            'fields': ('date_set', 'valid_until'),
            'description': 'Leave "Valid Until" blank for indefinite validity.'
        }),
        ('Administrative Information', {
            'fields': ('id_admin',),
        }),
    )
    
    readonly_fields = ['date_set']
    
    def product_name(self, obj):
        return obj.id_product.product_name
    product_name.short_description = _('Product')
    product_name.admin_order_field = 'id_product__product_name'
    
    def admin_name(self, obj):
        if obj.id_admin:
            return obj.id_admin.user.name if hasattr(obj.id_admin, 'user') else str(obj.id_admin)
        return '-'
    admin_name.short_description = _('Admin')
    
    def valid_until_display(self, obj):
        """Display valid until date with styling"""
        from django.utils import timezone
        if obj.valid_until:
            if obj.valid_until < timezone.now().date():
                return format_html(
                    '<span style="color: red; font-weight: bold;">⚠️ EXPIRED: {}</span>',
                    obj.valid_until
                )
            elif obj.valid_until < timezone.now().date() + timezone.timedelta(days=7):
                return format_html(
                    '<span style="color: orange;">⚠️ Expiring soon: {}</span>',
                    obj.valid_until
                )
            else:
                return format_html('<span style="color: green;">✓ {}</span>', obj.valid_until)
        return format_html('<span style="color: blue;">∞ Indefinite</span>')
    valid_until_display.short_description = _('Valid Until')
    
    def save_model(self, request, obj, form, change):
        """Save with current admin user as Administrator"""
        if not change:
            # Get or create Administrator instance for current user
            try:
                admin = Administrator.objects.get(user=request.user)
                obj.id_admin = admin
            except Administrator.DoesNotExist:
                # Create Administrator for superuser
                admin = Administrator.objects.create(
                    user=request.user,
                    role='Administrator'
                )
                obj.id_admin = admin
        # Handle empty valid_until (convert empty string to None)
        if hasattr(obj, 'valid_until') and obj.valid_until == '':
            obj.valid_until = None
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('id_product', 'id_admin', 'id_admin__user')


@admin.register(ProductItem)
class ProductItemAdmin(admin.ModelAdmin):
    """Admin interface for product items (inventory)"""
    list_display = [
        'id_product',
        'product_name',
        'quantity',
        'product_price',
        'item_date',
        'production_date',
        'farmer_name',
        'is_available'
    ]
    list_filter = ['item_date', 'production_date', 'id_product', 'is_available']
    search_fields = ['id_product__product_name', 'id_farmer__user__name']
    list_editable = ['product_price']
    date_hierarchy = 'item_date'
    
    fieldsets = (
        ('Product Information', {
            'fields': ('id_product', 'quantity', 'product_price', 'production_date')
        }),
        ('Farmer Information', {
            'fields': ('id_farmer',),
        }),
        ('Order Information', {
            'fields': ('id_order_item',),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_available',),
        }),
    )
    
    readonly_fields = ['item_date']
    
    def product_name(self, obj):
        return obj.id_product.product_name
    product_name.short_description = _('Product')
    
    def farmer_name(self, obj):
        if obj.id_farmer:
            return obj.id_farmer.user.name if hasattr(obj.id_farmer, 'user') else str(obj.id_farmer)
        return '-'
    farmer_name.short_description = _('Farmer')
    
    def save_model(self, request, obj, form, change):
        """Save product item with price validation"""
        try:
            super().save_model(request, obj, form, change)
        except Exception as e:
            from django.contrib import messages
            messages.error(request, f'Error saving product item: {str(e)}')
            raise
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'id_product', 
            'id_farmer', 
            'id_farmer__user'
        )
    
    actions = ['validate_prices', 'fix_invalid_prices']
    
    def validate_prices(self, request, queryset):
        """Validate selected product items against official prices"""
        from apps.products.price_validator import PriceValidator
        from django.core.exceptions import ValidationError
        
        valid_count = 0
        invalid_count = 0
        errors = []
        
        for item in queryset:
            try:
                PriceValidator.validate_product_price(
                    item.id_product.id_product,
                    item.product_price,
                    item.item_date
                )
                valid_count += 1
            except ValidationError as e:
                invalid_count += 1
                errors.append(f"{item.id_product.product_name}: {str(e)}")
        
        message = f'Validation complete: {valid_count} valid, {invalid_count} invalid'
        if errors:
            message += f'\nErrors: {", ".join(errors[:3])}'
        
        self.message_user(request, message)
    validate_prices.short_description = _('Validate against official prices')
    
    def fix_invalid_prices(self, request, queryset):
        """Fix invalid prices by adjusting to nearest valid price"""
        from apps.products.price_validator import PriceValidator
        
        fixed_count = 0
        for item in queryset:
            price_range = PriceValidator.get_price_range(item.id_product.id_product, item.item_date)
            if price_range:
                original_price = item.product_price
                if original_price < price_range['min_price']:
                    item.product_price = price_range['min_price']
                    item.save()
                    fixed_count += 1
                elif original_price > price_range['max_price']:
                    item.product_price = price_range['max_price']
                    item.save()
                    fixed_count += 1
        
        self.message_user(request, f'Fixed {fixed_count} invalid prices to nearest valid range')
    fix_invalid_prices.short_description = _('Fix invalid prices')