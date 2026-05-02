import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.reports.report_generator import PlatformReportGenerator

try:
    print("Starting manual report generation...")
    filename, filepath, filesize = PlatformReportGenerator.generate_master_report()
    print(f"Success! File created at: {filepath}")
    print(f"Size: {filesize} bytes")
except Exception as e:
    print(f"Error during report generation: {e}")
    import traceback
    traceback.print_exc()
