# apps/deliveries/serializers.py
from rest_framework import serializers
from .models import DeliveryMission


class DeliveryMissionSerializer(serializers.ModelSerializer):
    order_number = serializers.IntegerField(source='id_order.order_number', read_only=True)
    buyer_name = serializers.CharField(source='id_order.id_buyer.user.name', read_only=True)
    farmer_name = serializers.CharField(source='id_order.id_farmer.user.name', read_only=True)
    farmer_phone = serializers.CharField(source='id_order.id_farmer.user.phone', read_only=True)
    farmer_email = serializers.CharField(source='id_order.id_farmer.user.email', read_only=True)
    farmer_address = serializers.SerializerMethodField()
    transporter_name = serializers.CharField(source='id_transporter.user.name', read_only=True)
    order_total_amount = serializers.DecimalField(source='id_order.total_amount', max_digits=12, decimal_places=2, read_only=True)
    load_type = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryMission
        fields = [
            'mission_number', 'delivery_date', 'delivery_status',
            'delivery_location', 'id_order', 'order_number',
            'buyer_name', 'farmer_name', 'farmer_phone', 'farmer_email', 'farmer_address',
            'id_transporter', 'transporter_name', 'vehicle_license_snapshot',
            'actual_delivery_time', 'notes', 'order_total_amount', 'load_type'
        ]
        read_only_fields = ['mission_number', 'delivery_date']

    def get_load_type(self, obj):
        first_item = obj.id_order.items.first()
        if first_item:
            return first_item.product_name_snapshot
        return "Standard Agricultural Produce"

    def get_farmer_address(self, obj):
        # Try to get the address from the farmer's farm first
        farmer = obj.id_order.id_farmer
        first_farm = farmer.farms.first()
        if first_farm:
            return first_farm.address or first_farm.LocationFarm
        
        # Fallback to the farmer's user profile address
        user_address = farmer.user.address
        if user_address and user_address != "Your current address":
            return user_address
            
        return f"{farmer.user.name}'s Collection Point"