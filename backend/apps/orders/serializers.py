# apps/orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem, Appraisal


class OrderItemSerializer(serializers.ModelSerializer):
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id_order_item', 'quantity_item', 'quantity_unit', 'price_item',
                  'sub_total_item', 'product_name_snapshot', 'product_image']

    def get_product_image(self, obj):
        # ProductItem has FK id_order_item -> OrderItem, so reverse is productitem_set
        product_item = obj.productitem_set.first()
        if product_item and product_item.product_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(product_item.product_image.url)
            return product_item.product_image.url
        return None


class AppraisalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appraisal
        fields = ['id_appraisal', 'rating', 'feedback', 'created_at']
        read_only_fields = ['id_appraisal', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    buyer_name = serializers.CharField(source='id_buyer.user.name', read_only=True)
    farmer_name = serializers.CharField(source='id_farmer.user.name', read_only=True)
    tracking_info = serializers.SerializerMethodField()
    appraisal = AppraisalSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'order_number', 'order_date', 'order_status', 'total_amount',
            'payment_status', 'id_buyer', 'buyer_name', 'id_farmer',
            'farmer_name', 'notes', 'delivery_address', 'created_at', 
            'items', 'tracking_info', 'appraisal'
        ]
        read_only_fields = ['order_number', 'order_date', 'created_at']

    def get_tracking_info(self, obj):
        mission = obj.delivery_missions.all().order_by('-delivery_date').first()
        if mission:
            return {
                'status': mission.delivery_status,
                'transporter_name': mission.id_transporter.user.name if mission.id_transporter else None,
                'transporter_phone': mission.id_transporter.user.phone if mission.id_transporter else None,
                'transporter_email': mission.id_transporter.user.email if mission.id_transporter else None,
                'transporter_address': mission.id_transporter.user.address if mission.id_transporter else None
            }
        return None


class CreateOrderSerializer(serializers.Serializer):
    farmer_id = serializers.IntegerField()
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField()
    )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item")
        for item in value:
            if 'product_item_id' not in item or 'quantity' not in item:
                raise serializers.ValidationError(
                    "Each item must have 'product_item_id' and 'quantity'"
                )
        return value