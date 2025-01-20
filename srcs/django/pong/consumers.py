#Se define el consumidor o consumidores de WebSockets y sus métodos (Lógica del Juego)

import json
from channels.generic.websocket import AsyncWebsocketConsumer #Crear consumidores de WebSockets asincronos
from pong.game import PongGame

#Clase que hereda de AsyncWebsocketConsumer para crear un consumidor de WebSockets y define tres metodos
#Connect: Se llama cuando un cliente se conecta al servidor con un WebSocket. Se acepta la conexión
#Disconnect: Se llama cuando un cliente se desconecta del servidor. No se hace nada especial
#Receive: Se llama cuando el servidor recibe un mensaje del cliente. Se envía el mismo mensaje de vuelta al cliente
class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    #La función es el punto de entrada para todos los mensajes que llegan a través del WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'move':
            await self.handle_move(data)
        elif message_type == 'chat':
            await self.handle_chat(data)
        else:
            await self.send(text_data=json.dumps({
                'error': 'Unknown message type'
            }))

    #Funciones auxiliares para realizar acciones en el juego (Ejemplos que no estan bien implementados)

    async def handle_move(self, data):
        # Lógica para manejar movimientos en el juego
        move = data['move']
        # Procesa el movimiento y envía una respuesta
        await self.send(text_data=json.dumps({
            'type': 'move',
            'move': move
        }))

    async def handle_chat(self, data):
        # Lógica para manejar mensajes de chat
        message = data['message']
        # Procesa el mensaje de chat y envía una respuesta
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message
        }))()

