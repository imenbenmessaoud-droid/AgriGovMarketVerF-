from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.users.models import User, Farmer, Buyer

User = get_user_model()


class AuthenticationViewTest(TestCase):
    """Tests pour les vues d'authentification"""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        
        self.user_data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'user_type': 'buyer'
        }
    
    def test_register_success(self):
        """Test inscription réussie"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)
        self.assertEqual(User.objects.count(), 1)
    
    def test_register_password_mismatch(self):
        """Test inscription avec mots de passe différents"""
        data = self.user_data.copy()
        data['password_confirm'] = 'different'
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
    
    def test_register_existing_email(self):
        """Test inscription avec email existant"""
        User.objects.create_user(
            email='test@example.com',
            name='Existing',
            password='pass'
        )
        
        response = self.client.post(self.register_url, self.user_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Email', response.data)
    
    def test_login_success(self):
        """Test connexion réussie"""
        # Créer un utilisateur
        User.objects.create_user(
            email='test@example.com',
            name='Test',
            password='testpass123'
        )
        
        response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
    
    def test_login_invalid_credentials(self):
        """Test connexion avec identifiants invalides"""
        response = self.client.post(self.login_url, {
            'email': 'wrong@example.com',
            'password': 'wrongpass'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_logout_success(self):
        """Test déconnexion réussie"""
        user = User.objects.create_user(
            email='test@example.com',
            name='Test',
            password='testpass123'
        )
        self.client.force_authenticate(user=user)
        
        response = self.client.post(self.logout_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Déconnexion réussie')


class UserViewSetTest(TestCase):
    """Tests pour UserViewSet"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@example.com',
            name='Normal User',
            password='pass123'
        )
        self.admin = User.objects.create_admin(
            email='admin@example.com',
            name='Admin',
            password='admin123'
        )
        self.users_url = reverse('user-list')
    
    def test_get_users_as_admin(self):
        """Test récupération des utilisateurs par admin"""
        self.client.force_authenticate(user=self.admin)
        
        response = self.client.get(self.users_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_get_users_as_normal_user(self):
        """Test récupération des utilisateurs par utilisateur normal"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(self.users_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_get_me(self):
        """Test récupération de son propre profil"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(reverse('user-get-me'))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], 'user@example.com')
    
    def test_update_me(self):
        """Test mise à jour de son propre profil"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.put(reverse('user-update-me'), {
            'name': 'Updated Name',
            'phone': '0555123456'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, 'Updated Name')
    
    def test_change_password(self):
        """Test changement de mot de passe"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(reverse('user-change-password'), {
            'old_password': 'pass123',
            'new_password': 'newpass123',
            'new_password_confirm': 'newpass123'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass123'))


class FarmerViewSetTest(TestCase):
    """Tests pour FarmerViewSet"""
    
    def setUp(self):
        self.client = APIClient()
        self.farmer_user = User.objects.create_farmer(
            email='farmer@example.com',
            name='Farmer',
            password='pass'
        )
        self.farmers_url = reverse('farmer-list')
    
    def test_get_farmer_profile(self):
        """Test récupération du profil agriculteur"""
        self.client.force_authenticate(user=self.farmer_user)
        
        response = self.client.get(self.farmers_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class BuyerViewSetTest(TestCase):
    """Tests pour BuyerViewSet"""
    
    def setUp(self):
        self.client = APIClient()
        self.buyer_user = User.objects.create_buyer(
            email='buyer@example.com',
            name='Buyer',
            password='pass'
        )
        self.buyers_url = reverse('buyer-list')
    
    def test_get_buyer_profile(self):
        """Test récupération du profil acheteur"""
        self.client.force_authenticate(user=self.buyer_user)
        
        response = self.client.get(self.buyers_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TransporterViewSetTest(TestCase):
    """Tests pour TransporterViewSet"""
    
    def setUp(self):
        self.client = APIClient()
        self.transporter_user = User.objects.create_transporter(
            email='transporter@example.com',
            name='Transporter',
            password='pass'
        )
        self.transporters_url = reverse('transporter-list')
    
    def test_get_transporter_profile(self):
        """Test récupération du profil transporteur"""
        self.client.force_authenticate(user=self.transporter_user)
        
        response = self.client.get(self.transporters_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PermissionTest(TestCase):
    """Tests pour les permissions"""
    
    def setUp(self):
        self.client = APIClient()
        self.farmer = User.objects.create_farmer(
            email='farmer@test.com',
            name='Farmer',
            password='pass'
        )
        self.buyer = User.objects.create_buyer(
            email='buyer@test.com',
            name='Buyer',
            password='pass'
        )
        self.admin = User.objects.create_admin(
            email='admin@test.com',
            name='Admin',
            password='pass'
        )
    
    def test_farmer_cannot_access_buyer_data(self):
        """Test qu'un agriculteur ne peut pas accéder aux données acheteur"""
        self.client.force_authenticate(user=self.farmer)
        
        response = self.client.get(reverse('buyer-list'))
        
        # Peut voir la liste mais seulement ses données
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_admin_can_access_all(self):
        """Test que l'admin peut accéder à tout"""
        self.client.force_authenticate(user=self.admin)
        
        response = self.client.get(reverse('user-list'))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)