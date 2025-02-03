#Se define el consumidor o consumidores de WebSockets y sus métodos (Lógica del Juego)

import json
from channels.generic.websocket import AsyncWebsocketConsumer #Crear consumidores de WebSockets asincronos
from pong.game import PongGame
import logging

logger = logging.getLogger(__name__)

waiting_rooms = {} #Ejemplo: { "room_1": ["player1", "player2"] }

#Clase que hereda de AsyncWebsocketConsumer para crear un consumidor de WebSockets y define tres metodos
#Connect: Se llama cuando un cliente se conecta al servidor con un WebSocket. Se acepta la conexión
#Disconnect: Se llama cuando un cliente se desconecta del servidor. No se hace nada especial
#Receive: Se llama cuando el servidor recibe un mensaje del cliente. Se envía el mismo mensaje de vuelta al cliente
class PongConsumer(AsyncWebsocketConsumer):

    #Método que se llama cuando un cliente se conecta al servidor a travś de un WebSocket
    #Recibe el JWT y mira si el usuario esta autenticado
    #El self.channel_name es un identificador único para el canal de WebSocket asignado por Django Channels
    async def connect(self):
        #Miramos que el user este autenticado, sino cerramos la conexión
        if self.scope['user'].is_anonymous:
            logger.debug("User is anonymous, closing connection")
            await self.close()
            return
        
        self.room_name = None
        #Miramos si ya hay un jugador esperando:
        for room_id, players in waiting_rooms.items():
            if len(players) == 1:
                self.room_name = room_id #Asignamos la id al nuevo jugador
                players.append(self.channel_name) #Añadimos el nuevo jugador a la sala
                break
        
        #Si no hay un jugador esperando (room_name = None), creamos una nueva sala:
        if self.room_name is None:
            self.room_name = f"room_{len(waiting_rooms) + 1}" #Creamos identificador de la sala
            waiting_rooms[self.room_name] = [self.channel_name]

        #Creamos el nombre del grupo de la sala
        self.room_group_name = f"pong_{self.room_name}"

        #Unimos al jugador al grupo WebSocket de la sala
        #Todos los jugadores de la misma sala reciban los mismos mensajes
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        #Aceptamos la conexión
        await self.accept()

        logger.debug(f"WebSocket connected, joined {self.room_name}")

        #Si hay dos jugadores en la sala, empezamos el juego mandando un mensaje al grupo
        if len(waiting_rooms[self.room_name]) == 2:
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "start_game"}
            )
        else:
            await self.send(text_data=json.dumps({"status": "waiting" , "room": self.room_name}))


    
            

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
