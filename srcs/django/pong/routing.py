#Archivo para definir las rutas de los websockets

from django.urls import path
from pong import consumers

websocket_urlpatterns = [
    path('ws/pong/<str:room_name>/', consumers.PongConsumer.as_asgi()),
]
