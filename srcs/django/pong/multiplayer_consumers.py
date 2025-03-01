#Se define el consumidor o consumidores de WebSockets y sus métodos (Lógica del Juego)

import json
from channels.generic.websocket import AsyncWebsocketConsumer #Crear consumidores de WebSockets asincronos
import logging
import asyncio
from .ball_physics import BallPhysics

logger = logging.getLogger(__name__)

waiting_rooms = {} #Ejemplo: { "room_1": ["player1", "player2"] }
lock = asyncio.Lock() # Lock para sincronizar accesos a waiting_rooms
room_counter = 0 #Contador de salas

game = BallPhysics()

#Clase que hereda de AsyncWebsocketConsumer para crear un consumidor de WebSockets y define tres metodos
#Connect: Se llama cuando un cliente se conecta al servidor con un WebSocket. Se acepta la conexión
#Disconnect: Se llama cuando un cliente se desconecta del servidor. No se hace nada especial
#Receive: Se llama cuando el servidor recibe un mensaje del cliente. Se envía el mismo mensaje de vuelta al cliente
class PongConsumer(AsyncWebsocketConsumer):
    #Método que se llama cuando un cliente se conecta al servidor a travś de un WebSocket
    #Recibe el JWT y mira si el usuario esta autenticado
    #El self.channel_name es un identificador único para el canal de WebSocket asignado por Django Channels
    async def connect(self):
        global room_counter
        #Miramos que el user este autenticado, sino cerramos la conexión
        if self.scope['user'].is_anonymous:
            logger.debug("User is anonymous, closing connection")
            await self.close()
            return
        
        
        #Usamos un lock para evitar problemas de concurrencia
        async with lock:
            self.room_name = None
            #Miramos si ya hay un jugador esperando
            for room_id, players in waiting_rooms.items():
                if len(players) == 1:
                    self.room_name = room_id #Asignamos la id al nuevo jugador
                    players.append(self.channel_name) #Añadimos el nuevo jugador a la sala
                    player_type = 'Player2'
                    break
        
            #Si no hay un jugador esperando (room_name = None), creamos una nueva sala:
            if self.room_name is None:
                room_counter += 1
                self.room_name = f"room_{room_counter}" #Creamos identificador de la sala
                waiting_rooms[self.room_name] = [self.channel_name]
                player_type = 'Player1'

        #Creamos el nombre del grupo de la sala. Ex: pong_room_1
        self.room_group_name = f"pong_{self.room_name}"

        #Unimos al jugador al grupo WebSocket de la sala
        #Todos los jugadores de la misma sala reciban los mismos mensajes
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        #Aceptamos la conexión
        await self.accept()

        if player_type == "Player1":
            await self.channel_layer.send(
                        self.channel_name,
                        {
                            "type": "player_1",
                        }
                    )
        elif player_type == "Player2":
            await self.channel_layer.send(
                        self.channel_name,
                        {
                            "type": "player_2",
                        }
                    )

        logger.debug(f"WebSocket connected, joined {self.room_name}")
        await asyncio.sleep(0.1)

        #Si hay dos jugadores en la sala, empezamos el juego mandando un mensaje al grupo
        if len(waiting_rooms[self.room_name]) == 2:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'start_game'
                }
            )
            asyncio.create_task(self.start_countdown())
        else:
            await self.send(text_data=json.dumps({"status": "waiting" , "room": self.room_name}))

    async def start_countdown(self):
            #await asyncio.sleep(1)
            start_game_timer = 5
            while start_game_timer >= 0:
                logger.debug(f"Vuelta con timer = {start_game_timer}\n")
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'start_game_timer',
                        'countdown': start_game_timer
                    }
                )
                await asyncio.sleep(1)
                start_game_timer -= 1


    # Metodo para decir que jugador somos
    async def player_1(self, event):
        await self.send(text_data=json.dumps({'type': 'PLAYER_ONE'}))

    async def player_2(self, event):
        await self.send(text_data=json.dumps({'type': 'PLAYER_TWO'}))

    # Metodo para enviar mensaje de que empieza el juego
    async def start_game(self, event):
        await self.send(text_data=json.dumps({'type': 'START_GAME'}))

    async def start_game_timer(self, event):
        await self.send(text_data=json.dumps({'type': 'START_GAME_TIMER', 'countdown': event["countdown"]}))
    
    
    #El metodo se llama cuando un jugador se desconecta de la sala
    async def disconnect(self, close_code):
        logger.debug(f"Disconnecting from room: {self.room_name}")
        global room_counter

        async with lock:
            #Eliminamos al jugador de la sala
            if self.room_name in waiting_rooms and self.channel_name in waiting_rooms[self.room_name]:
                waiting_rooms[self.room_name].remove(self.channel_name)
                #Si no hay jugadores en la sala, la eliminamos
                if len(waiting_rooms[self.room_name]) == 0:
                    del waiting_rooms[self.room_name]
                #Si aun hay un jugador le decimos que el oponente se desconectó
                elif len(waiting_rooms[self.room_name]) == 1:
                    player = waiting_rooms[self.room_name][0]
                    await self.channel_layer.send(
                        player,
                        {
                            'type': 'opponent_disconnected'
                        }
                    )
        #Eliminamos el canal de los WebSockets
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        #Si no hay salas, reiniciamos el contador
        if len(waiting_rooms) == 0:
            room_counter = 0
            
    #El metodo se llama cuando el servidor recibe un mensaje del cliente
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            return
        
        if "type" not in data:
            logger.error("Message missing 'type' field")
            return
        

        message_type = data.get("type")

        if message_type == "message" and data.get("message") == "PING":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'ping_message',
                    'message': 'PONG'
                }
            )
        #    await self.send(text_data=json.dumps({"message": "PONG"}))
        #    return

        # Si el mensaje es un movimiento del jugador
        if message_type == "MOVE":
            async with lock:
                players = waiting_rooms.get(self.room_name, [])
                if len(players) == 2:
                    opponent = players[0] if players[1] == self.channel_name else players[1]
                    
                    # Actualizar la posición del paddle en la física del juego
                    if data["isPlayer1"]:
                        game.paddle1_position['z'] = data["paddleZ"]
                        game.paddle1_dir_z = data["paddleZ"] - game.paddle1_position['z']
                    else:
                        game.paddle2_position['z'] = data["paddleZ"]
                        game.paddle2_dir_z = data["paddleZ"] - game.paddle2_position['z']
                    
                    # Llamamos a las funciones que haran los cambios
                    game.paddlePhysics()
                    game.ball_physics()
                    
                    update_data = {
                        "type": "MOVE",
                        "opponentPaddleZ": game.paddle1_position['z'] if not data["isPlayer1"] else game.paddle2_position['z'],
                        "ballX": game.ball_position['x'],
                        "ballZ": game.ball_position['z'],
                        "ballDirX": game.ball_dir_x,
                        "ballDirZ": game.ball_dir_z,
                        #"ballSpeed": game.ball_speed,
                    }
                    # Enviar el mensaje completo al oponente
                    await self.channel_layer.send(
                        opponent,
                        {
                            "type": "player_move",
                            "data": update_data  # Reenviamos exactamente lo que recibimos
                        }
                    )

                    if game.goalFlag:
                        game.goalFlag = False
                        goalData = {
                            "type": "GOAL",
                            "player1_score": game.score1,
                            "player2_score": game.score2,
                            #"winner": 
                        }
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'goal_notification',
                                'data': 'PONG'
                            }
                        )
            return
        
        if message_type == 'QUIT':
            logger.info(f"Player {self.channel_name} quit the game")
            await self.close()
            return

        logger.warning(f"Unknown message type received: {message_type}")
        
    # Metodo para enviar direccion de movimiento a los jugadores
    async def player_move(self, event):
        await self.send(text_data=json.dumps(event["data"]))  # Envía el mensaje JSON al otro jugador

    async def goal_notification(self, event):
        await self.send(text_data=json.dumps(event["data"]))

    # Metodo para enviar mensaje de que el oponente se desconectó
    async def opponent_disconnected(self, event):
        await self.send(text_data=json.dumps({'type': 'OPPONENT_DISCONNECTED'}))

    async def ping_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message,
            'from': self.scope['user'].username
        }))
