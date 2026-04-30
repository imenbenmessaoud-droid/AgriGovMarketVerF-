from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Report
from .serializers import ReportSerializer

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        report = self.get_object()
        report.downloads += 1
        report.save()
        # In a real app, you would serve the file here
        # For now, we just return the file URL
        return Response({'file_url': report.file.url})
