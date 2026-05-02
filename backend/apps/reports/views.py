from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Report
from .serializers import ReportSerializer
import os
from datetime import datetime

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        report = self.get_object()
        report.downloads += 1
        report.save()
        return Response({'file_url': report.file.url})

    @action(detail=False, methods=['post'])
    def generate_custom_report(self, request):
        """Triggers real-time PDF or Excel generation based on platform data"""
        from .report_generator import PlatformReportGenerator
        
        report_format = request.data.get('format', 'PDF')
        
        try:
            if report_format == 'PDF':
                filename, filepath, filesize, r_type = PlatformReportGenerator.generate_master_report()
            else:
                filename, filepath, filesize, r_type = PlatformReportGenerator.generate_csv_report()
            
            # Save to database
            # We use forward slashes for Django FileField
            relative_path = f"reports/{filename}"
            
            new_report = Report.objects.create(
                name=f"Master Platform Analysis - {datetime.now().strftime('%b %Y')}",
                file=relative_path,
                report_type=r_type,
                category='Revenue',
                size=f"{round(filesize / 1024, 1)} KB"
            )
            
            return Response(ReportSerializer(new_report).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
