#Se define el consumidor o consumidores de WebSockets y sus métodos (Lógica del Juego)

import json
from channels.generic.websocket import AsyncWebsocketConsumer #Crear consumidores de WebSockets asincronos
from pong.game import PongGame
import logging

logger = logging.getLogger(__name__)

#Clase que hereda de AsyncWebsocketConsumer para crear un consumidor de WebSockets y define tres metodos
#Connect: Se llama cuando un cliente se conecta al servidor con un WebSocket. Se acepta la conexión
#Disconnect: Se llama cuando un cliente se desconecta del servidor. No se hace nada especial
#Receive: Se llama cuando el servidor recibe un mensaje del cliente. Se envía el mismo mensaje de vuelta al cliente
class PongConsumer(AsyncWebsocketConsumer):
    #Método que se llama cuando un cliente se conecta al servidor a travś de un WebSocket
    #Recibe el JWT y mira si el usuario esta autenticado
    async def connect(self):
        if self.scope['user'].is_anonymous:
            logger.debug("User is anonymous, closing connection")
            await self.close()
        else:
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'pong_{self.room_name}'
            logger.debug(f"Connecting to room: {self.room_name}")

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
            logger.debug("WebSocket connection accepted")

    async def disconnect(self, close_code):
        logger.debug(f"Disconnecting from room: {self.room_name}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        logger.debug(f"Received message: {message}")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']
        logger.debug(f"Sending message to clients: {message}")
        await self.send(text_data=json.dumps({
            'message': message
        }))
