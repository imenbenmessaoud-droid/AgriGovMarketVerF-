import sys
import os
import django
import threading

sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from apps.users.models import User, Transporter
from apps.deliveries.models import DeliveryMission
from apps.deliveries.views import DeliveryMissionViewSet
from apps.core.constants import DeliveryStatusEnum

def test_concurrent_acceptance():
    # Find two different transporters and ensure they have profiles
    transporters = list(User.objects.filter(user_type='transporter')[:2])
    if len(transporters) < 2:
        print("Not enough transporters for test")
        return
    
    for t in transporters:
        profile, _ = Transporter.objects.get_or_create(user=t)
        profile.area_service = 'Algiers'
        profile.save()

    # Create an open mission with a location that matches 'National'
    from apps.orders.models import Order
    order = Order.objects.first()
    # 'National' matches 'Algeria' if we use the same logic
    mission = DeliveryMission.objects.create(id_order=order, delivery_location='Algiers, Algeria', delivery_status=DeliveryStatusEnum.OPEN)
    mission_id = str(mission.mission_number)
    print(f"Testing with mission ID: {mission_id}")

    results = []

    def accept_mission(user, result_list):
        factory = APIRequestFactory()
        request = factory.patch(f'/api/deliveries/missions/{mission_id}/accept/', {}, format='json')
        force_authenticate(request, user=user)
        
        view = DeliveryMissionViewSet.as_view({'patch': 'accept'})
        try:
            response = view(request, pk=mission_id)
            result_list.append((user.email, response.status_code, response.data if hasattr(response, 'data') else response.content))
        except Exception as e:
            import traceback
            result_list.append((user.email, 500, traceback.format_exc()))

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
    mission.refresh_from_db()
    print(f"\nFinal Mission State:")
    print(f"Status: {mission.delivery_status}")
    print(f"Transporter: {mission.id_transporter.user.email if mission.id_transporter else 'None'}")

if __name__ == "__main__":
    test_concurrent_acceptance()
