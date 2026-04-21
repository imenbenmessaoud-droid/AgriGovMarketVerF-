# apps/deliveries/admin.py
# apps/deliveries/admin.py
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import DeliveryMission


@admin.register(DeliveryMission)
class DeliveryMissionAdmin(admin.ModelAdmin):
    """
    Admin interface for delivery missions
    """
    # Fields displayed in the mission list
    list_display = [
        'mission_number',
        'get_order_info',
        'get_transporter_info',
        'delivery_status',
        'delivery_date',
        'delivery_location',
        'get_order_total'
    ]
    
    # Side filters
    list_filter = [
        'delivery_status',
        'delivery_date',
        'id_transporter'
    ]
    
    # Searchable fields
    search_fields = [
        'mission_number',
        'id_order__order_number',
        'id_transporter__user__name',
        'delivery_location'
    ]
    
    # Default ordering
    ordering = ['-delivery_date', 'delivery_status']
    
    # Fields editable directly from the list
    list_editable = ['delivery_status']
    
    # Items per page
    list_per_page = 25
    
    # Fields displayed in the detail form
    fieldsets = (
        ('Mission Information', {
            'fields': (
                'mission_number',
                'delivery_status',
                'delivery_date',
                'delivery_location'
            )
        }),
        ('Order Information', {
            'fields': (
                'id_order',
            ),
            'classes': ('collapse',)
        }),
        ('Transporter Information', {
            'fields': (
                'id_transporter',
            ),
            'classes': ('collapse',)
        }),
        ('Tracking Information', {
            'fields': (
                'current_location_lat',
                'current_location_lng',
                'last_location_update',
                'tracking_enabled'
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Read-only fields
    readonly_fields = [
        'mission_number',
        'delivery_date',
        'last_location_update'
    ]
    
    def get_order_info(self, obj):
        """Display order information in a compact format"""
        try:
            return format_html(
                '<strong>#{}</strong><br/>{}',
                obj.id_order.order_number,
                obj.id_order.order_date.strftime('%Y/%m/%d')
            )
        except (AttributeError, ValueError):
            return '-'
    get_order_info.short_description = _('Order')
    get_order_info.admin_order_field = 'id_order__order_number'
    
    def get_transporter_info(self, obj):
        """Display transporter information"""
        if obj.id_transporter:
            try:
                transporter_name = obj.id_transporter.user.name if hasattr(obj.id_transporter, 'user') else str(obj.id_transporter)
                return format_html(
                    '<strong>{}</strong>',
                    transporter_name
                )
            except (AttributeError, ValueError):
                return str(obj.id_transporter)
        return format_html('<span style="color: red;">Not Assigned</span>')
    get_transporter_info.short_description = _('Transporter')
    
    def get_order_total(self, obj):
        """Display order total amount"""
        try:
            total = obj.id_order.total_amount
            if total is None:
                total = 0
            return format_html(
                '<strong>{:.2f} DZD</strong>',
                float(total)
            )
        except (AttributeError, ValueError, TypeError):
            return format_html('<strong>0.00 DZD</strong>')
    get_order_total.short_description = _('Total Amount')
    
    def get_order_total_display(self, obj):
        """Display formatted order total"""
        try:
            total = obj.id_order.total_amount
            if total is None:
                total = 0
            return format_html(
                '<h3 style="color: green;">{:.2f} DZD</h3>',
                float(total)
            )
        except (AttributeError, ValueError, TypeError):
            return format_html('<h3 style="color: green;">0.00 DZD</h3>')
    get_order_total_display.short_description = _('Total Amount')
    
    def get_order_details_display(self, obj):
        """Display detailed order information"""
        try:
            order = obj.id_order
            buyer_name = order.id_buyer.user.name if hasattr(order.id_buyer, 'user') else str(order.id_buyer)
            farmer_name = order.id_farmer.user.name if hasattr(order.id_farmer, 'user') else str(order.id_farmer)
            
            items_html = '<ul>'
            for item in order.items.all():
                product_name = getattr(item, 'product_name_snapshot', '-')
                items_html += f'<li>Product: {product_name} - Quantity: {item.quantity_item}</li>'
            items_html += '</ul>'
            
            return format_html(
                '<div><strong>Order Number:</strong> {}<br/>'
                '<strong>Date:</strong> {}<br/>'
                '<strong>Buyer:</strong> {}<br/>'
                '<strong>Farmer:</strong> {}<br/>'
                '<strong>Items:</strong>{}</div>',
                order.order_number,
                order.order_date,
                buyer_name,
                farmer_name,
                items_html
            )
        except (AttributeError, ValueError):
            return '-'
    get_order_details_display.short_description = _('Order Details')
    
    def get_transporter_details_display(self, obj):
        """Display detailed transporter information"""
        if obj.id_transporter:
            try:
                transporter = obj.id_transporter
                transporter_name = transporter.user.name if hasattr(transporter, 'user') else str(transporter)
                return format_html(
                    '<div><strong>Name:</strong> {}<br/>'
                    '<strong>Vehicle Type:</strong> {}<br/>'
                    '<strong>Capacity:</strong> {} tons<br/>'
                    '<strong>Service Area:</strong> {}<br/>'
                    '<strong>License Number:</strong> {}</div>',
                    transporter_name,
                    getattr(transporter, 'vehicle_type', '-'),
                    getattr(transporter, 'vehicle_capacity', '-'),
                    getattr(transporter, 'area_service', '-'),
                    getattr(transporter, 'license_number', '-')
                )
            except (AttributeError, ValueError):
                return str(obj.id_transporter)
        return format_html('<span style="color: red;">No transporter assigned</span>')
    get_transporter_details_display.short_description = _('Transporter Details')
    
    # Custom actions
    actions = ['mark_as_picked_up', 'mark_as_in_transit', 'mark_as_delivered']
    
    def mark_as_picked_up(self, request, queryset):
        """Mark selected missions as 'picked up'"""
        updated = queryset.update(delivery_status='picked up')
        self.message_user(request, f'{updated} mission(s) marked as picked up')
    mark_as_picked_up.short_description = _('Mark as picked up')
    
    def mark_as_in_transit(self, request, queryset):
        """Mark selected missions as 'in transit'"""
        updated = queryset.update(delivery_status='in transit')
        self.message_user(request, f'{updated} mission(s) marked as in transit')
    mark_as_in_transit.short_description = _('Mark as in transit')
    
    def mark_as_delivered(self, request, queryset):
        """Mark selected missions as 'delivered'"""
        updated = queryset.update(delivery_status='delivered')
        self.message_user(request, f'{updated} mission(s) marked as delivered')
    mark_as_delivered.short_description = _('Mark as delivered')
    
    # Customize save behavior
    def save_model(self, request, obj, form, change):
        """Customize save operation"""
        if not change:
            pass
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        """Optimize queries with select_related"""
        return super().get_queryset(request).select_related(
            'id_order',
            'id_order__id_buyer',
            'id_order__id_buyer__user',
            'id_order__id_farmer',
            'id_order__id_farmer__user',
            'id_transporter',
            'id_transporter__user'
        ).prefetch_related('id_order__items')