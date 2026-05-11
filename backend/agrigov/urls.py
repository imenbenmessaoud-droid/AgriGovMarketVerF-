from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.chat.views import ChatView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/deliveries/', include('apps.deliveries.urls')),
    path('api/farms/', include('apps.farms.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('chat/', ChatView.as_view(), name='root_chat'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

