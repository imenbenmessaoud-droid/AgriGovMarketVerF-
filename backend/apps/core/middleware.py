import logging
import json
from django.utils import timezone
from django.http import JsonResponse
from django.core.exceptions import PermissionDenied
import traceback

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """Middleware pour logger les requêtes"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        start_time = timezone.now()
        
        # Log avant requête
        logger.info(f"→ {request.method} {request.path} - User: {request.user if request.user.is_authenticated else 'Anonymous'}")
        
        response = self.get_response(request)
        
        # Log après requête
        duration = (timezone.now() - start_time).total_seconds()
        logger.info(f"← {response.status_code} - {duration:.3f}s")
        
        return response


class ExceptionHandlingMiddleware:
    """Middleware pour gérer les exceptions globalement"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        return self.get_response(request)
    
    def process_exception(self, request, exception):
        """Traiter les exceptions"""
        
        # Log l'erreur
        logger.error(f"Exception: {str(exception)}")
        logger.error(traceback.format_exc())
        
        # Retourner une réponse JSON
        return JsonResponse({
            'error': 'Erreur interne du serveur',
            'detail': str(exception) if request.user.is_superuser else None
        }, status=500)


class APITimeoutMiddleware:
    """Middleware pour limiter le temps d'exécution"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        import signal
        
        def timeout_handler(signum, frame):
            raise TimeoutError("Request timeout")
        
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(30)  # 30 secondes
        
        try:
            response = self.get_response(request)
            signal.alarm(0)
            return response
        except TimeoutError:
            return JsonResponse({'error': 'Request timeout'}, status=408)