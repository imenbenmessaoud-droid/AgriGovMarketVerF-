import sys
import os
import django

sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from rest_framework.test import APIClient
from apps.users.models import User
from apps.deliveries.models import DeliveryMission
from apps.core.constants import DeliveryStatusEnum

def run_test():
    transporter = User.objects.filter(user_type='transporter').first()
    order = DeliveryMission.objects.first().id_order
    mission = DeliveryMission.objects.create(id_order=order, delivery_location='Test', delivery_status=DeliveryStatusEnum.OPEN)
    
    client = APIClient()
    client.force_authenticate(user=transporter)
    
    # Check detail
    res_detail = client.get(f"/api/deliveries/missions/{mission.mission_number}/")
    print(f"Detail Status: {res_detail.status_code}")
    
    url = f"/api/deliveries/missions/{mission.mission_number}/accept/"
    print(f"PATCH {url}")
    response = client.patch(url, {}, format='json')
    print(f"Status: {response.status_code}")
    print(f"Content: {response.content}")

    mission.refresh_from_db()
    print(f"Mission Status: {mission.delivery_status}")
    print(f"Transporter: {mission.id_transporter}")

if __name__ == "__main__":
    run_test()
