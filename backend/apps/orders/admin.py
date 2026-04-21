# apps/orders/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['quantity_item', 'price_item', 'sub_total_item']
    can_delete = False
    fields = ['product_name_snapshot', 'quantity_item', 'price_item', 'sub_total_item']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number',
        'order_date',
        'order_status',
        'total_amount',
        'payment_status',
        'buyer_name',
        'farmer_name'
    ]
    list_filter = ['order_status', 'payment_status', 'order_date']
    search_fields = ['order_number', 'id_buyer__user__name', 'id_farmer__user__name']
    readonly_fields = ['order_number', 'order_date', 'total_amount', 'invoice_date']
    inlines = [OrderItemInline]
    date_hierarchy = 'order_date'

    def buyer_name(self, obj):
        return obj.id_buyer.user.name if obj.id_buyer and hasattr(obj.id_buyer, 'user') else '-'
    buyer_name.short_description = _('Buyer')
    buyer_name.admin_order_field = 'id_buyer__user__name'

    def farmer_name(self, obj):
        return obj.id_farmer.user.name if obj.id_farmer and hasattr(obj.id_farmer, 'user') else '-'
    farmer_name.short_description = _('Farmer')
    farmer_name.admin_order_field = 'id_farmer__user__name'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('id_buyer', 'id_farmer')


# ✅ إضافة OrderItem إلى Admin
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id_order_item', 'id_order', 'quantity_item', 'price_item', 'sub_total_item', 'product_name_snapshot']
    list_filter = ['id_order__order_status']
    search_fields = ['id_order__order_number', 'product_name_snapshot']
    readonly_fields = ['sub_total_item']
    