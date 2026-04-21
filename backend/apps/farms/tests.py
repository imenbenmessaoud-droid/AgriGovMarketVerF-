# apps/farms/tests.py
# apps/farms/tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from apps.users.models import Farmer
from .models import Farm

User = get_user_model()


# ============================================================
# 1. MODEL TESTS
# ============================================================

class FarmModelTest(TestCase):
    """Farm model tests"""
    
    def setUp(self):
        """Set up test data before each test"""
        self.user = User.objects.create_user(
            email='farmer@test.com',
            name='Test Farmer',
            password='test123',
            user_type='farmer'
        )
        self.farmer = Farmer.objects.get(user=self.user)
        self.farm = Farm.objects.create(
            FarmName='Test Farm',
            LocationFarm='Algiers',
            Size=10.5,
            farmer=self.farmer
        )
    
    def test_creation_farm(self):
        """Test 1: Verify farm creation"""
        self.assertEqual(self.farm.FarmName, 'Test Farm')
        self.assertEqual(self.farm.Size, 10.5)
        self.assertIsNotNone(self.farm.created_at)
        self.assertIsNotNone(self.farm.updated_at)
    
    def test_relation_farmer(self):
        """Test 2: Verify relation with Farmer"""
        self.assertEqual(self.farm.farmer, self.farmer)
        self.assertEqual(self.farmer.farms.count(), 1)
    
    def test_update_farm_info(self):
        """Test 3: Verify farm information update"""
        self.farm.FarmName = 'Updated Farm'
        self.farm.Size = 20.0
        self.farm.save()
        self.farm.refresh_from_db()
        self.assertEqual(self.farm.FarmName, 'Updated Farm')
        self.assertEqual(self.farm.Size, 20.0)
    
    def test_delete_farm(self):
        """Test 4: Verify farm deletion"""
        farm_id = self.farm.IdFarm
        self.farm.delete()
        self.assertEqual(Farm.objects.filter(IdFarm=farm_id).count(), 0)
    
    def test_size_validation(self):
        """Test 5: Verify size cannot be negative"""
        farm = Farm(
            FarmName='Test',
            LocationFarm='Test',
            Size=-5.0,
            farmer=self.farmer
        )
        with self.assertRaises(ValidationError):
            farm.full_clean()
    
    def test_farm_str_method(self):
        """Test 6: Verify __str__ method"""
        self.assertEqual(str(self.farm), 'Test Farm')


# ============================================================
# 2. API TESTS
# ============================================================

class FarmAPITest(APITestCase):
    """Farm API tests"""
    
    def setUp(self):
        """Set up API client and test data"""
        self.user = User.objects.create_user(
            email='farmer@test.com',
            name='Test Farmer',
            password='test123',
            user_type='farmer'
        )
        self.farmer = Farmer.objects.get(user=self.user)
        self.farm = Farm.objects.create(
            FarmName='API Test Farm',
            LocationFarm='Algiers',
            Size=10.5,
            farmer=self.farmer
        )
        self.client.force_authenticate(user=self.user)
    
    def test_list_farms(self):
        """Test 7: Retrieve farms list"""
        url = reverse('farm-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_farm(self):
        """Test 8: Create a new farm"""
        url = reverse('farm-create')
        data = {
            'FarmName': 'New Farm',
            'LocationFarm': 'Blida',
            'Size': 20.0
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Farm.objects.count(), 2)
    
    def test_update_farm(self):
        """Test 9: Update a farm"""
        url = reverse('farm-update', args=[self.farm.IdFarm])
        data = {'FarmName': 'Updated Farm Name'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.farm.refresh_from_db()
        self.assertEqual(self.farm.FarmName, 'Updated Farm Name')
    
    def test_delete_farm(self):
        """Test 10: Delete a farm"""
        url = reverse('farm-delete', args=[self.farm.IdFarm])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Farm.objects.count(), 0)
    
    def test_get_my_farms(self):
        """Test 11: Get current farmer's farms"""
        url = reverse('my-farms')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_farm_stats(self):
        """Test 12: Get farm statistics"""
        url = reverse('farm-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_farms'], 1)
        self.assertEqual(response.data['total_size'], 10.5)


# ============================================================
# 3. PERMISSIONS TESTS
# ============================================================

class FarmPermissionTest(APITestCase):
    """Farm permission tests"""
    
    def setUp(self):
        """Set up test users and farms"""
        # Farmer 1
        self.user1 = User.objects.create_user(
            email='farmer1@test.com',
            name='Farmer 1',
            password='test123',
            user_type='farmer'
        )
        self.farmer1 = Farmer.objects.get(user=self.user1)
        
        # Farmer 2
        self.user2 = User.objects.create_user(
            email='farmer2@test.com',
            name='Farmer 2',
            password='test123',
            user_type='farmer'
        )
        self.farmer2 = Farmer.objects.get(user=self.user2)
        
        # Farm owned by farmer1
        self.farm = Farm.objects.create(
            FarmName='Test Farm',
            LocationFarm='Algiers',
            Size=10.0,
            farmer=self.farmer1
        )
    
    def test_farmer_can_update_own_farm(self):
        """Test 13: Farmer can update their own farm"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('farm-update', args=[self.farm.IdFarm])
        response = self.client.patch(url, {'FarmName': 'New Name'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_farmer_cannot_update_other_farm(self):
        """Test 14: Farmer cannot update another farmer's farm"""
        self.client.force_authenticate(user=self.user2)
        url = reverse('farm-update', args=[self.farm.IdFarm])
        response = self.client.patch(url, {'FarmName': 'New Name'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_farmer_can_delete_own_farm(self):
        """Test 15: Farmer can delete their own farm"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('farm-delete', args=[self.farm.IdFarm])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_farmer_cannot_delete_other_farm(self):
        """Test 16: Farmer cannot delete another farmer's farm"""
        self.client.force_authenticate(user=self.user2)
        url = reverse('farm-delete', args=[self.farm.IdFarm])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_unauthenticated_cannot_create(self):
        """Test 17: Unauthenticated user cannot create a farm"""
        self.client.force_authenticate(user=None)
        url = reverse('farm-create')
        data = {'FarmName': 'Test', 'LocationFarm': 'Test', 'Size': 10.0}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_unauthenticated_can_view_public_farms(self):
        """Test 18: Unauthenticated user can view public farm list"""
        self.client.force_authenticate(user=None)
        url = reverse('farm-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_non_farmer_cannot_create_farm(self):
        """Test 19: Non-farmer user cannot create a farm"""
        buyer = User.objects.create_user(
            email='buyer@test.com',
            name='Test Buyer',
            password='test123',
            user_type='buyer'
        )
        self.client.force_authenticate(user=buyer)
        url = reverse('farm-create')
        data = {'FarmName': 'Test', 'LocationFarm': 'Test', 'Size': 10.0}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ============================================================
# 4. FILTER TESTS
# ============================================================

class FarmFilterTest(APITestCase):
    """Farm filter tests"""
    
    def setUp(self):
        """Set up test data for filters"""
        self.user = User.objects.create_user(
            email='farmer@test.com',
            name='Test Farmer',
            password='test123',
            user_type='farmer'
        )
        self.farmer = Farmer.objects.get(user=self.user)
        
        # Create multiple farms
        self.farm1 = Farm.objects.create(
            FarmName='Farm Algiers',
            LocationFarm='Algiers',
            Size=5.0,
            farmer=self.farmer
        )
        self.farm2 = Farm.objects.create(
            FarmName='Farm Oran',
            LocationFarm='Oran',
            Size=15.0,
            farmer=self.farmer
        )
        self.farm3 = Farm.objects.create(
            FarmName='Farm Blida',
            LocationFarm='Blida',
            Size=8.0,
            farmer=self.farmer
        )
        self.client.force_authenticate(user=self.user)
    
    def test_filter_by_search(self):
        """Test 20: Filter farms by search term"""
        url = reverse('farm-list')
        response = self.client.get(url, {'search': 'Algiers'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['FarmName'], 'Farm Algiers')
    
    def test_filter_by_location(self):
        """Test 21: Filter farms by location"""
        url = reverse('farm-list')
        response = self.client.get(url, {'location': 'Oran'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_filter_by_min_size(self):
        """Test 22: Filter farms by minimum size"""
        url = reverse('farm-list')
        response = self.client.get(url, {'min_size': 10})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['FarmName'], 'Farm Oran')
    
    def test_filter_by_farmer(self):
        """Test 23: Filter farms by farmer"""
        url = reverse('farm-list')
        response = self.client.get(url, {'farmer': self.farmer.id_user})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3)
    
    def test_multiple_filters(self):
        """Test 24: Apply multiple filters together"""
        url = reverse('farm-list')
        response = self.client.get(url, {
            'search': 'Farm',
            'min_size': 5,
            'location': 'Algiers'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ============================================================
# 5. EDGE CASES TESTS
# ============================================================

class FarmEdgeCaseTest(APITestCase):
    """Edge cases tests"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            email='farmer@test.com',
            name='Test Farmer',
            password='test123',
            user_type='farmer'
        )
        self.farmer = Farmer.objects.get(user=self.user)
        self.client.force_authenticate(user=self.user)
    
    def test_create_farm_without_name(self):
        """Test 25: Cannot create farm without name"""
        url = reverse('farm-create')
        data = {
            'LocationFarm': 'Algiers',
            'Size': 10.0
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_farm_with_zero_size(self):
        """Test 26: Cannot create farm with zero size"""
        url = reverse('farm-create')
        data = {
            'FarmName': 'Zero Size Farm',
            'LocationFarm': 'Algiers',
            'Size': 0
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_nonexistent_farm(self):
        """Test 27: Cannot update non-existent farm"""
        url = reverse('farm-update', args=[9999])
        response = self.client.patch(url, {'FarmName': 'New'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_delete_nonexistent_farm(self):
        """Test 28: Cannot delete non-existent farm"""
        url = reverse('farm-delete', args=[9999])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_nonexistent_farm_details(self):
        """Test 29: Cannot get details of non-existent farm"""
        url = reverse('farm-detail', args=[9999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)