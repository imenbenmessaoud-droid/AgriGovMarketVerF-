import os
import csv
from datetime import datetime
from django.conf import settings
from django.db.models import Sum

class PlatformReportGenerator:
    @staticmethod
    def generate_master_report():
        """Generates a comprehensive platform PDF report with real data"""
        try:
            # Delay imports to avoid circular issues
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

            from apps.orders.models import Order  # type: ignore
            from apps.users.models import User  # type: ignore
            from apps.products.models import Product  # type: ignore

            filename = f"Master_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            media_path = str(settings.MEDIA_ROOT)
            reports_dir = os.path.join(media_path, 'reports')
            
            if not os.path.exists(reports_dir):
                os.makedirs(reports_dir, exist_ok=True)
                
            filepath = os.path.join(reports_dir, filename)
            
            doc = SimpleDocTemplate(filepath, pagesize=letter)
            styles = getSampleStyleSheet()
            elements = []

            title_style = ParagraphStyle(
                'TitleStyle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#065f46'),
                spaceAfter=20
            )
            elements.append(Paragraph("Ministry Platform: Master Performance Report", title_style))
            elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%d %B %Y, %H:%M')}", styles['Normal']))
            elements.append(Spacer(1, 20))

            elements.append(Paragraph("1. Platform Overview", styles['Heading2']))
            
            total_orders = Order.objects.count()
            total_revenue = Order.objects.filter(order_status='confirmed').aggregate(total=Sum('total_amount'))['total'] or 0
            total_users = User.objects.count()
            total_products = Product.objects.count()

            overview_data = [
                ['Metric', 'Current Value'],
                ['Total Registered Users', str(total_users)],
                ['Total Orders Placed', str(total_orders)],
                ['Gross Revenue (Confirmed)', f"{float(total_revenue):,.2f} DZD"],
                ['Product Catalog Size', str(total_products)]
            ]
            
            t1 = Table(overview_data, colWidths=[200, 200])
            t1.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#065f46')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey)
            ]))
            elements.append(t1)
            elements.append(Spacer(1, 20))

            elements.append(Paragraph("2. User Demographics", styles['Heading2']))
            
            farmers = User.objects.filter(user_type='farmer').count()
            buyers = User.objects.filter(user_type='buyer').count()
            transporters = User.objects.filter(user_type='transporter').count()

            demo_data = [
                ['User Type', 'Total Count', 'Status'],
                ['Farmers', str(farmers), 'Active'],
                ['Buyers', str(buyers), 'Active'],
                ['Transporters', str(transporters), 'Active']
            ]
            
            t2 = Table(demo_data, colWidths=[130, 130, 130])
            t2.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#047857')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
            ]))
            elements.append(t2)
            elements.append(Spacer(1, 20))

            elements.append(Spacer(1, 40))
            elements.append(Paragraph("End of Official Report", styles['Italic']))

            doc.build(elements)
            
            return filename, filepath, os.path.getsize(filepath), 'PDF'

        except (ImportError, ModuleNotFoundError):
            # Fallback to CSV if reportlab is still not detected
            return PlatformReportGenerator.generate_csv_report()

    @staticmethod
    def generate_csv_report():
        """Generates a comprehensive platform CSV report"""
        from apps.orders.models import Order  # type: ignore
        from apps.users.models import User  # type: ignore
        from apps.products.models import Product  # type: ignore

        filename = f"Master_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        media_path = str(settings.MEDIA_ROOT)
        reports_dir = os.path.join(media_path, 'reports')
        
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir, exist_ok=True)
            
        filepath = os.path.join(reports_dir, filename)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['AgriGov Platform Master Report'])
            writer.writerow(['Generated on', datetime.now().strftime('%Y-%m-%d %H:%M')])
            writer.writerow([])
            
            writer.writerow(['--- Platform Overview ---'])
            writer.writerow(['Metric', 'Value'])
            writer.writerow(['Total Users', User.objects.count()])
            writer.writerow(['Total Orders', Order.objects.count()])
            total_rev = Order.objects.filter(order_status='confirmed').aggregate(total=Sum('total_amount'))['total'] or 0
            writer.writerow(['Gross Revenue', f"{float(total_rev):.2f} DZD"])
            writer.writerow(['Product Catalog Size', Product.objects.count()])
            writer.writerow([])
            
            writer.writerow(['--- User Breakdown ---'])
            writer.writerow(['User Type', 'Count'])
            writer.writerow(['Farmers', User.objects.filter(user_type='farmer').count()])
            writer.writerow(['Buyers', User.objects.filter(user_type='buyer').count()])
            writer.writerow(['Transporters', User.objects.filter(user_type='transporter').count()])

        return filename, filepath, os.path.getsize(filepath), 'Excel'
