#Archivo para definir las rutas de los websockets

from django.urls import path
from pong import consumers

websocket_urlpatterns = [
    path('ws/pong/', consumers.PongConsumer.as_asgi()),
]

