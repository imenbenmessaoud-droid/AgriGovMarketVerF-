# apps/orders/payment_processor.py
import hashlib
import hmac
import json
import requests
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import Order
from .invoice_generator import InvoiceGenerator
import logging

logger = logging.getLogger(__name__)


class PaymentProcessor:
    """
    Handles payment processing for orders
    Supports multiple payment gateways
    """
    
    # Payment gateway configurations
    GATEWAYS = {
        'bank_transfer': {
            'enabled': True,
            'requires_approval': True
        },
        'credit_card': {
            'enabled': getattr(settings, 'CREDIT_CARD_ENABLED', False),
            'api_key': getattr(settings, 'PAYMENT_API_KEY', ''),
            'api_secret': getattr(settings, 'PAYMENT_API_SECRET', ''),
            'gateway_url': getattr(settings, 'PAYMENT_GATEWAY_URL', '')
        },
        'cash_on_delivery': {
            'enabled': True,
            'requires_approval': False
        },
        'edahabia': {
            'enabled': getattr(settings, 'EDAHABIA_ENABLED', False),
            'merchant_id': getattr(settings, 'EDAHABIA_MERCHANT_ID', ''),
            'gateway_url': getattr(settings, 'EDAHABIA_GATEWAY_URL', '')
        }
    }
    
    @classmethod
    def process_payment(cls, order, payment_method, payment_data=None):
        """
        Process payment for an order
        
        Args:
            order: Order object
            payment_method: 'credit_card', 'bank_transfer', 'cash_on_delivery', 'edahabia'
            payment_data: Additional payment data (card details, etc.)
        
        Returns:
            dict: {'success': bool, 'message': str, 'transaction_id': str}
        """
        try:
            # Validate order status
            if order.payment_status == 'paid':
                return {
                    'success': False,
                    'message': _('Order already paid')
                }
            
            if order.order_status == 'cancelled':
                return {
                    'success': False,
                    'message': _('Cannot pay for cancelled order')
                }
            
            # Process based on payment method
            if payment_method == 'credit_card':
                return cls._process_credit_card_payment(order, payment_data)
            elif payment_method == 'bank_transfer':
                return cls._process_bank_transfer(order, payment_data)
            elif payment_method == 'cash_on_delivery':
                return cls._process_cash_on_delivery(order)
            elif payment_method == 'edahabia':
                return cls._process_edahabia_payment(order, payment_data)
            else:
                return {
                    'success': False,
                    'message': _('Invalid payment method')
                }
                
        except Exception as e:
            logger.error(f"Payment processing error for order {order.order_number}: {str(e)}")
            return {
                'success': False,
                'message': str(e)
            }
    
    @classmethod
    def _process_credit_card_payment(cls, order, payment_data):
        """
        Process credit card payment via external gateway
        """
        if not cls.GATEWAYS['credit_card']['enabled']:
            return {
                'success': False,
                'message': _('Credit card payments are currently disabled')
            }
        
        try:
            # Validate payment data
            if not payment_data or not payment_data.get('card_number'):
                return {
                    'success': False,
                    'message': _('Card information required')
                }
            
            # Prepare payment request
            payment_request = {
                'amount': order.total_amount,
                'currency': 'DZD',
                'order_id': order.order_number,
                'card_number': payment_data.get('card_number')[-4:],  # Masked for logging
                'expiry_month': payment_data.get('expiry_month'),
                'expiry_year': payment_data.get('expiry_year'),
                'cvv': payment_data.get('cvv')
            }
            
            # Simulate payment gateway call (replace with actual API call)
            # response = requests.post(
            #     cls.GATEWAYS['credit_card']['gateway_url'],
            #     json=payment_request,
            #     headers={
            #         'Authorization': f"Bearer {cls.GATEWAYS['credit_card']['api_key']}"
            #     }
            # )
            
            # For demo purposes, simulate successful payment
            if payment_data.get('card_number', '').startswith('4'):
                transaction_id = f"CC_{order.order_number}_{timezone.now().timestamp()}"
                
                # Update order status
                order.payment_status = 'paid'
                order.save()
                
                # Generate invoice
                InvoiceGenerator.generate_invoice(order)
                
                return {
                    'success': True,
                    'message': _('Payment processed successfully'),
                    'transaction_id': transaction_id
                }
            else:
                return {
                    'success': False,
                    'message': _('Payment declined by bank')
                }
                
        except Exception as e:
            logger.error(f"Credit card payment error: {str(e)}")
            return {
                'success': False,
                'message': _('Payment gateway error')
            }
    
    @classmethod
    def _process_bank_transfer(cls, order, payment_data):
        """
        Process bank transfer payment (creates payment reference)
        """
        try:
            # Generate payment reference
            reference = f"BT_{order.order_number}_{timezone.now().strftime('%Y%m%d%H%M%S')}"
            
            # Store payment reference (in a real system, store in Payment model)
            # For now, just update order notes or a separate payment tracking model
            
            # Bank details
            bank_details = {
                'bank_name': 'Banque d\'Algérie',
                'account_name': 'AgriGov System',
                'account_number': '123 456 789 01',
                'iban': 'DZ 1234 5678 9012 3456 7890',
                'swift': 'BNADZALG',
                'reference': reference,
                'amount': order.total_amount,
                'currency': 'DZD'
            }
            
            # Don't mark as paid yet - requires approval
            order.payment_status = 'pending'  # Keep as pending until verification
            order.save()
            
            return {
                'success': True,
                'message': _('Bank transfer instructions generated'),
                'reference': reference,
                'bank_details': bank_details
            }
            
        except Exception as e:
            logger.error(f"Bank transfer error: {str(e)}")
            return {
                'success': False,
                'message': _('Error generating bank transfer details')
            }
    
    @classmethod
    def _process_cash_on_delivery(cls, order):
        """
        Process cash on delivery payment
        """
        try:
            # Cash on delivery doesn't require immediate payment
            # Just mark as pending with COD note
            order.payment_status = 'pending'
            order.save()
            
            return {
                'success': True,
                'message': _('Cash on delivery selected. Pay upon delivery.'),
                'payment_type': 'cash_on_delivery'
            }
            
        except Exception as e:
            logger.error(f"COD processing error: {str(e)}")
            return {
                'success': False,
                'message': _('Error processing cash on delivery')
            }
    
    @classmethod
    def _process_edahabia_payment(cls, order, payment_data):
        """
        Process Edahabia payment (Algerian electronic payment)
        """
        if not cls.GATEWAYS['edahabia']['enabled']:
            return {
                'success': False,
                'message': _('Edahabia payments are currently disabled')
            }
        
        try:
            # Prepare Edahabia payment request
            payment_request = {
                'merchant_id': cls.GATEWAYS['edahabia']['merchant_id'],
                'order_id': order.order_number,
                'amount': order.total_amount,
                'currency': 'DZD',
                'description': f'Payment for order #{order.order_number}',
                'customer_name': order.id_buyer.name,
                'customer_email': order.id_buyer.email,
                'customer_phone': order.id_buyer.phone
            }
            
            # Generate signature for security
            signature = cls._generate_signature(payment_request)
            payment_request['signature'] = signature
            
            # In production, redirect to Edahabia payment page
            # For now, simulate successful payment
            if payment_data and payment_data.get('phone_number'):
                transaction_id = f"ED_{order.order_number}_{timezone.now().timestamp()}"
                
                order.payment_status = 'paid'
                order.save()
                
                InvoiceGenerator.generate_invoice(order)
                
                return {
                    'success': True,
                    'message': _('Edahabia payment successful'),
                    'transaction_id': transaction_id
                }
            else:
                return {
                    'success': False,
                    'message': _('Please provide your Edahabia phone number')
                }
                
        except Exception as e:
            logger.error(f"Edahabia payment error: {str(e)}")
            return {
                'success': False,
                'message': _('Edahabia payment gateway error')
            }
    
    @classmethod
    def _generate_signature(cls, data):
        """
        Generate HMAC signature for payment request
        """
        # Sort data by key
        sorted_data = {k: data[k] for k in sorted(data.keys())}
        
        # Convert to string
        data_string = json.dumps(sorted_data, separators=(',', ':'))
        
        # Generate signature
        secret = cls.GATEWAYS['credit_card']['api_secret'].encode('utf-8')
        signature = hmac.new(
            secret,
            data_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return signature
    
    @classmethod
    def verify_payment(cls, order, transaction_id):
        """
        Verify payment with gateway
        """
        # In production, call gateway to verify payment
        # For demo, assume payment is verified
        return {
            'success': True,
            'verified': True,
            'message': _('Payment verified successfully')
        }
    
    @classmethod
    def refund_payment(cls, order, amount=None):
        """
        Process refund for an order
        """
        if order.payment_status != 'paid':
            return {
                'success': False,
                'message': _('Order is not paid')
            }
        
        if order.order_status == 'delivered':
            return {
                'success': False,
                'message': _('Cannot refund delivered order')
            }
        
        refund_amount = amount or order.total_amount
        
        # Process refund (simulated)
        # In production, call payment gateway refund API
        
        # Update order status
        order.payment_status = 'refunded'
        order.save()
        
        return {
            'success': True,
            'message': _('Refund processed successfully'),
            'refund_amount': refund_amount,
            'refund_date': timezone.now().date()
        }