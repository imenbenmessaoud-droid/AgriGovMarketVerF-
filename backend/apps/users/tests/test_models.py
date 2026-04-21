from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone
from apps.users.models import User, Farmer, Buyer, Transporter, Administrator
import logging

logger = logging.getLogger(__name__)


class UserModelTest(TestCase):
    """Tests pour le modèle User"""
    
    def setUp(self):
        """Configuration initiale"""
        self.user_data = {
            'email': 'test@example.com',
            'name': 'Test User',
            'password': 'testpass123'
        }
    
    def test_create_user(self):
        """Test création d'un utilisateur normal"""
        user = User.objects.create_user(**self.user_data)
        
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.name, 'Test User')
        self.assertTrue(user.check_password('testpass123'))
        self.assertEqual(user.user_type, 'buyer')  # Default
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_validated)
    
    def test_create_user_without_email(self):
        """Test création sans email → erreur"""
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', name='Test', password='pass')
    
    def test_create_superuser(self):
        """Test création d'un superutilisateur"""
        admin = User.objects.create_superuser(
            email='admin@example.com',
            name='Admin',
            password='adminpass'
        )
        
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_staff)
        self.assertEqual(admin.user_type, 'admin')
    
    def test_create_farmer(self):
        """Test création d'un agriculteur"""
        farmer_user = User.objects.create_farmer(
            email='farmer@example.com',
            name='Farmer Test',
            password='farmerpass'
        )
        
        self.assertEqual(farmer_user.user_type, 'farmer')
        self.assertTrue(hasattr(farmer_user, 'farmer'))
    
    def test_create_buyer(self):
        """Test création d'un acheteur"""
        buyer_user = User.objects.create_buyer(
            email='buyer@example.com',
            name='Buyer Test',
            password='buyerpass'
        )
        
        self.assertEqual(buyer_user.user_type, 'buyer')
        self.assertTrue(hasattr(buyer_user, 'buyer'))
    
    def test_create_transporter(self):
        """Test création d'un transporteur"""
        transporter_user = User.objects.create_transporter(
            email='transporter@example.com',
            name='Transporter Test',
            password='transpass'
        )
        
        self.assertEqual(transporter_user.user_type, 'transporter')
        self.assertTrue(hasattr(transporter_user, 'transporter'))
    
    def test_create_admin(self):
        """Test création d'un administrateur"""
        admin_user = User.objects.create_admin(
            email='admin@example.com',
            name='Admin Test',
            password='adminpass'
        )
        
        self.assertEqual(admin_user.user_type, 'admin')
        self.assertTrue(hasattr(admin_user, 'admin_profile'))
    
    def test_update_profile(self):
        """Test mise à jour du profil"""
        user = User.objects.create_user(**self.user_data)
        
        user.UpdateProfile(
            name='New Name',
            phone='0555123456',
            address='Alger, Algeria'
        )
        
        user.refresh_from_db()
        self.assertEqual(user.name, 'New Name')
        self.assertEqual(user.phone, '0555123456')
        self.assertEqual(user.address, 'Alger, Algeria')
    
    def test_reset_password(self):
        """Test réinitialisation du mot de passe"""
        user = User.objects.create_user(**self.user_data)
        old_password = user.password
        
        user.ResetPassword('newpassword123')
        
        user.refresh_from_db()
        self.assertNotEqual(user.password, old_password)
        self.assertTrue(user.check_password('newpassword123'))
    
    def test_properties(self):
        """Test les propriétés"""
        user = User.objects.create_user(**self.user_data)
        
        self.assertFalse(user.is_admin)
        self.assertFalse(user.is_farmer)
        self.assertTrue(user.is_buyer)  # Default
        
        farmer_user = User.objects.create_farmer(
            email='farmer@test.com',
            name='Farmer',
            password='pass'
        )
        self.assertTrue(farmer_user.is_farmer)


class FarmerModelTest(TestCase):
    """Tests pour le modèle Farmer"""
    
    def setUp(self):
        self.farmer_user = User.objects.create_farmer(
            email='farmer@test.com',
            name='Farmer Test',
            password='farmerpass'
        )
        self.farmer = self.farmer_user.farmer
    
    def test_farmer_creation(self):
        """Test création d'un agriculteur"""
        self.assertEqual(self.farmer.user.name, 'Farmer Test')
        self.assertEqual(self.farmer.TotalEarnings, 0)
    
    def test_register_farm(self):
        """Test enregistrement d'une ferme"""
        farm = self.farmer.RegisterFarm(
            FarmName='Ferme Test',
            LocationFarm='Alger',
            Size=10.5
        )
        
        self.assertEqual(farm.FarmName, 'Ferme Test')
        self.assertEqual(farm.farmer, self.farmer)
        self.assertEqual(farm.Size, 10.5)
    
    def test_update_statistics(self):
        """Test mise à jour des statistiques"""
        initial_earnings = self.farmer.TotalEarnings
        
        self.farmer.update_statistics()
        
        self.assertEqual(self.farmer.TotalEarnings, initial_earnings)


class BuyerModelTest(TestCase):
    """Tests pour le modèle Buyer"""
    
    def setUp(self):
        self.buyer_user = User.objects.create_buyer(
            email='buyer@test.com',
            name='Buyer Test',
            password='buyerpass'
        )
        self.buyer = self.buyer_user.buyer
        
        self.farmer_user = User.objects.create_farmer(
            email='farmer@test.com',
            name='Farmer',
            password='pass'
        )
        self.farmer = self.farmer_user.farmer
    
    def test_buyer_creation(self):
        """Test création d'un acheteur"""
        self.assertEqual(self.buyer.user.name, 'Buyer Test')
        self.assertEqual(self.buyer.BuyerBalance, 0)
    
    def test_add_balance(self):
        """Test ajout de solde"""
        self.buyer.AddBalance(1000)
        
        self.assertEqual(self.buyer.BuyerBalance, 1000)
    
    def test_deduct_balance(self):
        """Test déduction de solde"""
        self.buyer.AddBalance(1000)
        result = self.buyer.DeductBalance(300)
        
        self.assertTrue(result)
        self.assertEqual(self.buyer.BuyerBalance, 700)
    
    def test_deduct_balance_insufficient(self):
        """Test déduction avec solde insuffisant"""
        self.buyer.BuyerBalance = 100
        self.buyer.save()
        
        result = self.buyer.DeductBalance(200)
        
        self.assertFalse(result)
        self.assertEqual(self.buyer.BuyerBalance, 100)
    
    def test_search_product(self):
        """Test recherche de produits"""
        # Note: à compléter avec des produits réels
        products = self.buyer.SearchProduct('blé')
        self.assertIsNotNone(products)


class TransporterModelTest(TestCase):
    """Tests pour le modèle Transporter"""
    
    def setUp(self):
        self.transporter_user = User.objects.create_transporter(
            email='transporter@test.com',
            name='Transporter Test',
            password='transpass'
        )
        self.transporter = self.transporter_user.transporter
        
        # Ajouter les informations du transporteur
        self.transporter.AreaService = 'Alger, Blida'
        self.transporter.VehicleType = 'Camion'
        self.transporter.VehicleCapacity = 5000
        self.transporter.LicenseNumber = 'ABC12345'
        self.transporter.save()
    
    def test_transporter_creation(self):
        """Test création d'un transporteur"""
        self.assertEqual(self.transporter.user.name, 'Transporter Test')
        self.assertEqual(self.transporter.AreaService, 'Alger, Blida')
        self.assertEqual(self.transporter.VehicleType, 'Camion')
    
    def test_register_trans_capacity(self):
        """Test enregistrement de capacité"""
        self.transporter.RegisterTransCapacity(8000)
        
        self.assertEqual(self.transporter.VehicleCapacity, 8000)
    
    def test_register_service_area(self):
        """Test enregistrement de zone de service"""
        self.transporter.RegisterServiceArea('Oran, Mostaganem')
        
        self.assertEqual(self.transporter.AreaService, 'Oran, Mostaganem')
    
    def test_update_vehicle_info(self):
        """Test mise à jour des informations du véhicule"""
        self.transporter.UpdateVehicleInfo(
            VehicleType='Camion frigorifique',
            VehicleCapacity=10000
        )
        
        self.transporter.refresh_from_db()
        self.assertEqual(self.transporter.VehicleType, 'Camion frigorifique')
        self.assertEqual(self.transporter.VehicleCapacity, 10000)


class AdministratorModelTest(TestCase):
    """Tests pour le modèle Administrator"""
    
    def setUp(self):
        self.admin_user = User.objects.create_admin(
            email='admin@test.com',
            name='Admin Test',
            password='adminpass'
        )
        self.admin = self.admin_user.admin_profile
        
        self.farmer_user = User.objects.create_farmer(
            email='farmer@test.com',
            name='Farmer',
            password='pass'
        )
        self.farmer = self.farmer_user
    
    def test_admin_creation(self):
        """Test création d'un administrateur"""
        self.assertEqual(self.admin.user.name, 'Admin Test')
        self.assertEqual(self.admin.Role, 'Administrator')
    
    def test_validate_user(self):
        """Test validation d'un utilisateur"""
        self.assertFalse(self.farmer.is_validated)
        
        self.admin.ValidateUser(self.farmer)
        
        self.farmer.refresh_from_db()
        self.assertTrue(self.farmer.is_validated)
        self.assertEqual(self.farmer.validated_by, self.admin)
    
    def test_validate_admin_error(self):
        """Test validation d'un admin par un autre admin → erreur"""
        other_admin = User.objects.create_admin(
            email='admin2@test.com',
            name='Admin 2',
            password='pass'
        )
        
        with self.assertRaises(ValidationError):
            self.admin.ValidateUser(other_admin)
    
    def test_suspend_user(self):
        """Test suspension d'un utilisateur"""
        self.assertTrue(self.farmer.is_active)
        
        self.admin.SuspendUser(self.farmer)
        
        self.farmer.refresh_from_db()
        self.assertFalse(self.farmer.is_active)
    
    def test_activate_user(self):
        """Test activation d'un utilisateur"""
        self.admin.SuspendUser(self.farmer)
        self.assertFalse(self.farmer.is_active)
        
        self.admin.ActivateUser(self.farmer)
        
        self.farmer.refresh_from_db()
        self.assertTrue(self.farmer.is_active)


class SignalTest(TestCase):
    """Tests pour les signaux"""
    
    def test_profile_created_on_user_creation(self):
        """Test que le profil est créé automatiquement"""
        # Farmer
        farmer_user = User.objects.create_user(
            email='farmer@test.com',
            name='Farmer',
            password='pass',
            user_type='farmer'
        )
        self.assertTrue(hasattr(farmer_user, 'farmer'))
        
        # Buyer
        buyer_user = User.objects.create_user(
            email='buyer@test.com',
            name='Buyer',
            password='pass',
            user_type='buyer'
        )
        self.assertTrue(hasattr(buyer_user, 'buyer'))
        
        # Transporter
        transporter_user = User.objects.create_user(
            email='transporter@test.com',
            name='Transporter',
            password='pass',
            user_type='transporter'
        )
        self.assertTrue(hasattr(transporter_user, 'transporter'))
        
        # Admin
        admin_user = User.objects.create_user(
            email='admin@test.com',
            name='Admin',
            password='pass',
            user_type='admin'
        )
        self.assertTrue(hasattr(admin_user, 'admin_profile'))