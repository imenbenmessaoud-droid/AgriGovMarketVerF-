import sys
import os
import threading

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
import django
django.setup()

from rest_framework.test import APIClient
from apps.users.models import User
from apps.deliveries.models import DeliveryMission
from apps.core.constants import DeliveryStatusEnum

def test_concurrent_acceptance(mission_id):
    # Find two different transporters
    transporters = User.objects.filter(user_type='transporter')[:2]
    if len(transporters) < 2:
        print("Not enough transporters for test")
        return

    results = []

    def accept_mission(user, result_list):
        client = APIClient()
        client.force_authenticate(user=user)
        from django.urls import reverse
        try:
            url = reverse('deliverymission-accept', kwargs={'pk': mission_id})
        except:
            url = f"/api/deliveries/missions/{mission_id}/accept/"
        response = client.patch(url, {}, format='json')
        res_data = getattr(response, 'data', response.content)
        result_list.append((user.email, response.status_code, res_data))

    threads = []
    for t in transporters:
        thread = threading.Thread(target=accept_mission, args=(t, results))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

    for email, status, data in results:
        print(f"User: {email}, Status: {status}, Data: {data}")

    # Verify state in DB
    mission = DeliveryMission.objects.get(pk=mission_id)
    print(f"\nFinal Mission State:")
    print(f"Status: {mission.delivery_status}")
    print(f"Transporter: {mission.id_transporter.user.email if mission.id_transporter else 'None'}")

if __name__ == "__main__":
    # Create an open mission for test
    from apps.orders.models import Order
    order = Order.objects.first()
    mission = DeliveryMission.objects.create(id_order=order, delivery_location='Test Location', delivery_status=DeliveryStatusEnum.OPEN)
    mission_id = mission.mission_number
    print(f"Testing with mission ID: {mission_id}")
    
    # Try single acceptance first
    transporter = User.objects.filter(user_type='transporter').first()
    client = APIClient()
    client.force_authenticate(user=transporter)
    url = f"/api/deliveries/missions/{mission_id}/accept/"
    response = client.patch(url, {}, format='json')
    print(f"Single Test - User: {transporter.email}, Status: {response.status_code}, Data: {getattr(response, 'data', response.content)}")

    # Reset for concurrent test
    mission.delivery_status = DeliveryStatusEnum.OPEN
    mission.id_transporter = None
    mission.save()

    test_concurrent_acceptance(mission_id)
