from django.db import models

class Report(models.Model):
    REPORT_TYPES = (
        ('PDF', 'PDF Document'),
        ('Excel', 'Excel Spreadsheet'),
    )
    
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='reports/')
    report_type = models.CharField(max_length=10, choices=REPORT_TYPES)
    category = models.CharField(max_length=100)
    size = models.CharField(max_length=20, blank=True)
    downloads = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
