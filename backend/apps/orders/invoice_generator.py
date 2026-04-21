# apps/orders/invoice_generator.py
import os
import uuid
from datetime import datetime
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from django.template.loader import get_template
from django.core.files import File
from django.utils.translation import gettext_lazy as _
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm 
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
import logging

logger = logging.getLogger(__name__)


class InvoiceGenerator:
    """
    Generates professional PDF invoices for orders
    """
    
    @staticmethod
    def generate_invoice(order):
        """
        Generate a PDF invoice for an order
        
        Args:
            order: Order object
        
        Returns:
            str: Path to generated invoice file or None
        """
        try:
            # Check if invoice already exists
            if order.invoice_number and order.invoice_number != 'N/A':
                return order.invoice_number
            
            # Generate unique invoice number
            invoice_number = InvoiceGenerator._generate_invoice_number(order)
            
            # Create invoice directory if not exists
            invoice_dir = os.path.join(settings.MEDIA_ROOT, 'invoices')
            os.makedirs(invoice_dir, exist_ok=True)
            
            # Generate PDF file path
            filename = f"INVOICE_{invoice_number}.pdf"
            filepath = os.path.join(invoice_dir, filename)
            
            # Create PDF document
            doc = SimpleDocTemplate(
                filepath,
                pagesize=A4,
                topMargin=1.5*cm,
                bottomMargin=1.5*cm,
                leftMargin=2*cm,
                rightMargin=2*cm
            )
            
            # Build PDF content
            story = InvoiceGenerator._build_pdf_content(order, invoice_number)
            
            # Build PDF
            doc.build(story)
            
            # Update order with invoice information
            order.invoice_number = invoice_number
            order.invoice_date = timezone.now().date()
            order.save()
            
            logger.info(f"Invoice {invoice_number} generated for order {order.order_number}")
            return invoice_number
            
        except Exception as e:
            logger.error(f"Error generating invoice for order {order.order_number}: {str(e)}")
            return None
    
    @staticmethod
    def _generate_invoice_number(order):
        """
        Generate a unique invoice number
        Format: INV-YYYYMMDD-XXXXX
        """
        date_str = timezone.now().strftime('%Y%m%d')
        unique_id = str(uuid.uuid4())[:8].upper()
        return f"INV-{date_str}-{unique_id}"
    
    @staticmethod
    def _build_pdf_content(order, invoice_number):
        """
        Build the PDF content using ReportLab
        """
        styles = getSampleStyleSheet()
        
        # Create custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2c3e50'),
            alignment=TA_CENTER,
            spaceAfter=30
        )
        
        header_style = ParagraphStyle(
            'Header',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#34495e'),
            spaceAfter=12
        )
        
        normal_style = ParagraphStyle(
            'Normal',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=6
        )
        
        # Build story (content list)
        story = []
        
        # Add company header
        story.append(Paragraph("AgriGov - Agricultural Governance System", title_style))
        story.append(Paragraph("Official Agricultural Invoice", title_style))
        story.append(Spacer(1, 0.5*inch))
        
        # Invoice header information
        invoice_info = [
            ["Invoice Number:", invoice_number],
            ["Date:", timezone.now().strftime('%Y-%m-%d')],
            ["Order Number:", str(order.order_number)],
            ["Order Date:", order.order_date.strftime('%Y-%m-%d')],
        ]
        
        invoice_table = Table(invoice_info, colWidths=[2.5*inch, 4*inch])
        invoice_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(invoice_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Parties information
        parties_data = [
            ["<b>Buyer Information:</b>", "<b>Farmer Information:</b>"],
            [order.id_buyer.name, order.id_farmer.name],
            [order.id_buyer.email or '-', order.id_farmer.email or '-'],
            [order.id_buyer.phone or '-', order.id_farmer.phone or '-'],
            [order.id_buyer.address or '-', '']
        ]
        
        parties_table = Table(parties_data, colWidths=[3.5*inch, 3.5*inch])
        parties_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#ecf0f1')),
        ]))
        story.append(parties_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Items table
        story.append(Paragraph("Order Items", header_style))
        
        # Prepare table data
        table_data = [
            ['#', 'Product', 'Quantity', 'Unit Price', 'Subtotal']
        ]
        
        for idx, item in enumerate(order.items.all(), 1):
            product_name = getattr(item, 'product_name', 'N/A')
            table_data.append([
                str(idx),
                product_name,
                str(item.quantity_item),
                f"{item.price_item:.2f} DZD",
                f"{item.sub_total_item:.2f} DZD"
            ])
        
        # Add total row
        table_data.append([
            '',
            '',
            '',
            '<b>Total:</b>',
            f"<b>{order.total_amount:.2f} DZD</b>"
        ])
        
        # Create table
        items_table = Table(table_data, colWidths=[0.5*inch, 3*inch, 1*inch, 1.5*inch, 1.5*inch])
        
        # Style the table
        items_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -2), 1, colors.HexColor('#bdc3c7')),
            ('BACKGROUND', (3, -1), (4, -1), colors.HexColor('#f39c12')),
            ('FONTNAME', (3, -1), (4, -1), 'Helvetica-Bold'),
        ]))
        
        story.append(items_table)
        story.append(Spacer(1, 0.5*inch))
        
        # Payment information
        story.append(Paragraph("Payment Information", header_style))
        
        payment_info = [
            ["Payment Status:", order.payment_status.upper()],
            ["Payment Method:", "Bank Transfer / Cash on Delivery"],
            ["Payment Terms:", "Due upon receipt" if order.payment_status == 'pending' else "Paid in full"]
        ]
        
        payment_table = Table(payment_info, colWidths=[2.5*inch, 4*inch])
        payment_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(payment_table)
        story.append(Spacer(1, 0.5*inch))
        
        # Terms and conditions
        story.append(Paragraph("Terms and Conditions", header_style))
        terms_text = """
        1. This invoice is generated by the AgriGov system and is considered an official document.<br/>
        2. Products are subject to quality inspection upon delivery.<br/>
        3. Payment must be completed within 7 days of invoice date for pending payments.<br/>
        4. For any inquiries, please contact the AgriGov support team.<br/>
        5. This invoice is digitally signed and verified by the Ministry of Agriculture.
        """
        story.append(Paragraph(terms_text, normal_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Footer
        footer_text = """
        <b>AgriGov System</b><br/>
        Ministry of Agriculture - Official Agricultural Platform<br/>
        Contact: support@agrigov.gov.dz | Phone: +213 123 456 789<br/>
        This is a system-generated invoice and requires no physical signature.
        """
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#7f8c8d'),
            alignment=TA_CENTER
        )
        story.append(Paragraph(footer_text, footer_style))
        
        return story
    
    @staticmethod
    def generate_bulk_invoices(orders):
        """
        Generate invoices for multiple orders
        
        Args:
            orders: QuerySet of Order objects
        
        Returns:
            dict: {'success': list, 'failed': list}
        """
        results = {'success': [], 'failed': []}
        
        for order in orders:
            invoice_number = InvoiceGenerator.generate_invoice(order)
            if invoice_number:
                results['success'].append(order.order_number)
            else:
                results['failed'].append(order.order_number)
        
        return results