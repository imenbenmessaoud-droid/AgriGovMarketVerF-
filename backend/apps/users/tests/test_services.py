from django.test import TestCase
from django.core import mail
from django.conf import settings
from apps.users.models import User, Farmer, Buyer, Transporter
from apps.users.services import UserService, FarmerService, BuyerService, TransporterService


class UserServiceTest(TestCase):
    """Tests pour UserService"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            password='testpass'
        )
    
    def test_send_validation_email(self):
        """Test envoi d'email de validation"""
        result = UserService.send_validation_email(self.user)
        
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Bienvenue sur AgriGov Market', mail.outbox[0].subject)
    
    def test_get_user_statistics(self):
        """Test récupération des statistiques"""
        # Créer des utilisateurs supplémentaires
        User.objects.create_farmer(email='farmer@test.com', name='Farmer', password='pass')
        User.objects.create_buyer(email='buyer@test.com', name='Buyer', password='pass')
        
        stats = UserService.get_user_statistics()
        
        self.assertEqual(stats['total_users'], 3)
        self.assertEqual(stats['farmers'], 1)
        self.assertEqual(stats['buyers'], 1)
        self.assertEqual(stats['transporters'], 0)
    
    def test_get_user_by_type(self):
        """Test récupération des utilisateurs par type"""
        farmer = User.objects.create_farmer(email='farmer@test.com', name='Farmer', password='pass')
        
        farmers = UserService.get_user_by_type('farmer')
        
        self.assertEqual(farmers.count(), 1)
        self.assertEqual(farmers.first().email, 'farmer@test.com')


class FarmerServiceTest(TestCase):
    """Tests pour FarmerService"""
    
    def setUp(self):
        self.farmer_user = User.objects.create_farmer(
            email='farmer@test.com',
            name='Farmer Test',
            password='pass'
        )
        self.farmer = self.farmer_user.farmer
    
    def test_get_farmer_statistics(self):
        """Test récupération des statistiques d'un agriculteur"""
        stats = FarmerService.get_farmer_statistics(self.farmer)
        
        self.assertEqual(stats['total_earnings'], 0)
        self.assertEqual(stats['farms_count'], 0)
        self.assertEqual(stats['products_count'], 0)
    
    def test_verify_farmer(self):
        """Test vérification d'un agriculteur"""
        self.assertFalse(self.farmer.is_verified)
        
        FarmerService.verify_farmer(self.farmer)
        
        self.farmer.refresh_from_db()
        self.assertTrue(self.farmer.is_verified)
        self.assertIsNotNone(self.farmer.verified_at)


class BuyerServiceTest(TestCase):
    """Tests pour BuyerService"""
    
    def setUp(self):
        self.buyer_user = User.objects.create_buyer(
            email='buyer@test.com',
            name='Buyer Test',
            password='pass'
        )
        self.buyer = self.buyer_user.buyer
    
    def test_get_buyer_statistics(self):
        """Test récupération des statistiques d'un acheteur"""
        stats = BuyerService.get_buyer_statistics(self.buyer)
        
        self.assertEqual(stats['balance'], 0)
        self.assertEqual(stats['total_orders'], 0)
        self.assertEqual(stats['total_spent'], 0)
    
    def test_add_balance(self):
        """Test ajout de solde"""
        BuyerService.add_balance(self.buyer, 500)
        
        self.assertEqual(self.buyer.BuyerBalance, 500)
    
    def test_add_balance_negative(self):
        """Test ajout de solde négatif → erreur"""
        with self.assertRaises(ValueError):
            BuyerService.add_balance(self.buyer, -100)


class TransporterServiceTest(TestCase):
    """Tests pour TransporterService"""
    
    def setUp(self):
        self.transporter_user = User.objects.create_transporter(
            email='transporter@test.com',
            name='Transporter Test',
            password='pass'
        )
        self.transporter = self.transporter_user.transporter
        self.transporter.AreaService = 'Alger'
        self.transporter.VehicleType = 'Camion'
        self.transporter.VehicleCapacity = 5000
        self.transporter.LicenseNumber = 'ABC123'
        self.transporter.save()
    
    def test_get_transporter_statistics(self):
        """Test récupération des statistiques d'un transporteur"""
        stats = TransporterService.get_transporter_statistics(self.transporter)
        
        self.assertEqual(stats['delivery_earnings'], 0)
        self.assertEqual(stats['total_deliveries'], 0)
        self.assertTrue(stats['is_available'])
    
    def test_update_rating(self):
        """Test mise à jour de la note"""
        rating = TransporterService.update_rating(self.transporter)
        
        self.assertEqual(rating, 0)  # Pas de livraisons encore