#Archivo para definir las rutas de los websockets

from django.urls import path
from pong import multiplayer_consumers
from pong import tournament_consumers

websocket_urlpatterns = [
    path('ws/pong/', multiplayer_consumers.PongConsumer.as_asgi()),
    path('ws/tournament/', tournament_consumers.TournamentConsumer.as_asgi()),
]
