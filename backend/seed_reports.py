import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.reports.models import Report
from django.core.files.base import ContentFile

def seed_reports():
    reports_data = [
        {'name': 'National Agricultural Yield Q1 2026', 'type': 'PDF', 'category': 'Yield', 'size': '2.4 MB', 'downloads': 145},
        {'name': 'Price Fluctuation Analysis - Tomatoes', 'type': 'Excel', 'category': 'Pricing', 'size': '1.1 MB', 'downloads': 89},
        {'name': 'Monthly Registered Logistics Capacity', 'type': 'PDF', 'category': 'Logistics', 'size': '3.8 MB', 'downloads': 234},
        {'name': 'Regional Crop Distribution Report', 'type': 'Excel', 'category': 'Distribution', 'size': '4.5 MB', 'downloads': 67},
        {'name': 'Annual Farmer Revenue Estimations 2025', 'type': 'PDF', 'category': 'Revenue', 'size': '8.2 MB', 'downloads': 312},
        {'name': 'Market Demand Forecast Q2 2026', 'type': 'Excel', 'category': 'Forecast', 'size': '1.8 MB', 'downloads': 56},
        {'name': 'Transporter Performance Report', 'type': 'PDF', 'category': 'Logistics', 'size': '2.1 MB', 'downloads': 78},
    ]

    for data in reports_data:
        report, created = Report.objects.get_or_create(
            name=data['name'],
            defaults={
                'report_type': data['type'],
                'category': data['category'],
                'size': data['size'],
                'downloads': data['downloads']
            }
        )
        if created:
            # Create a dummy file
            report.file.save(f"{data['name'].replace(' ', '_')}.{data['type'].lower()}", ContentFile(b"Dummy report content"))
            print(f"Created report: {data['name']}")
        else:
            print(f"Report already exists: {data['name']}")

if __name__ == '__main__':
    seed_reports()
