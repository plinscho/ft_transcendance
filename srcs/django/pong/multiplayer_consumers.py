import json
from channels.generic.websocket import AsyncWebsocketConsumer #Crear consumidores de WebSockets asincronos
import logging
import asyncio
from .ball_physics import BallPhysics

logger = logging.getLogger(__name__)

# ROOM MANAGER
# --------------------------------------------------------------------------------------------
class RoomManager:
    def __init__(self):
        self.waiting_rooms = {} #Ejemplo: { "room_1": ["player1", "player2"] }
        self.room_counter = 0
        self.lock = asyncio.Lock()
        self.games = {}

    # Se llama en el connect
    async def join_or_create_room(self, channel_name):
        room_name = None
        player_type = None

        # Miramos si hay alguna sala donde meterse
        for room_id, players in self.waiting_rooms.items():
            if len(players) == 1:
                room_name = room_id
                players.append(channel_name)
                player_type = "Player2"
        
        # Si no hay salas para unirse, crea una
        if room_name is None:
            self.room_counter += 1
            room_name = f"room_{self.room_counter}"
            self.waiting_rooms[room_name] = [channel_name] # Repasar
            self.games[room_name] = BallPhysics()
            player_type = "Player1"
        
        return room_name, player_type
    
    async def remove_player_from_room(self, room_name, channel_name):
        async with self.lock:
            if room_name in self.waiting_rooms and channel_name in self.waiting_rooms[room_name]:
                self.waiting_rooms[room_name].remove(channel_name)
                if len(self.waiting_rooms[room_name]) == 0:
                    del self.waiting_rooms[room_name]
                    del self.games[room_name]
                    return None
                elif len(self.waiting_rooms[room_name]) == 1:
                    remaining_player = self.waiting_rooms[room_name][0]
                    return remaining_player
            return None

    def is_room_full(self, room_name):
        if (len(self.waiting_rooms[room_name]) == 2):
            return True
        return False
    
    def get_game_from_room(self, room_name):
        return self.games.get(room_name)
    
    def get_opponent_from_room(self, room_name, channel_name):
        players = self.waiting_rooms.get(room_name)
        if len(players) != 2: return None
        if channel_name == players[0]:
            return players[1]
        else:
            return players[0]


# GAME MANAGER (OPCIONAL SI SE SOBRECARGA EL CONSUMIDOR)
# --------------------------------------------------------------------------------------------


# PONG CONSUMER
# --------------------------------------------------------------------------------------------

# Clase que hereda de AsyncWebsocketConsumer para crear un consumidor de WebSockets y define tres metodos
#   Connect: Se llama cuando un cliente se conecta al servidor con un WebSocket. Se acepta la conexión
#   Disconnect: Se llama cuando un cliente se desconecta del servidor. No se hace nada especial
#   Receive: Se llama cuando el servidor recibe un mensaje del cliente. Se envía el mismo mensaje de vuelta al cliente
class PongConsumer(AsyncWebsocketConsumer):
    #Método que se llama cuando un cliente se conecta al servidor a travś de un WebSocket
    async def connect(self):
        #Recibe el JWT y mira si el usuario esta autenticado o si no cerramos la conexión
        if self.scope['user'].is_anonymous:
            logger.debug("User is anonymous, closing connection")
            await self.close()
            return
        
        #El self.channel_name es un identificador único para el canal de WebSocket asignado por Django Channels
        self.room_name, player_type = await room_management.join_or_create_room(self.channel_name)
        #Creamos el nombre del grupo de la sala. Ex: pong_room_1
        self.room_group_name = f"pong_{self.room_name}"

        #Unimos al jugador al grupo WebSocket de la sala
        #Todos los jugadores de la misma sala reciban los mismos mensajes
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        logger.debug(f"WebSocket connected, joined {self.room_name}")
        await asyncio.sleep(0.5)
        await self.assign_player(player_type)
        await self.start_match()
#_____________________________________________________________________________
    async def assign_player(self, player_type):
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
#_____________________________________________________________________________
    # Metodo para decir que jugador somos
    async def player_1(self, event):
        await self.send(text_data=json.dumps({'type': 'PLAYER_ONE'}))

    async def player_2(self, event):
        await self.send(text_data=json.dumps({'type': 'PLAYER_TWO'}))
#_____________________________________________________________________________
    async def start_match(self):
        if room_management.is_room_full(self.room_name):
            await self.channel_layer.group_send(
            self.room_group_name,
                {
                    'type': 'start_game'
                }
            )
            asyncio.create_task(self.start_countdown())
        else:
            await self.send(text_data=json.dumps({"status": "waiting", "room": self.room_group_name}))

    # Metodo para enviar mensaje de que empieza el juego
    async def start_game(self, event):
        await self.send(text_data=json.dumps({'type': 'START_GAME'}))
#_____________________________________________________________________________
    async def start_countdown(self):
            start_game_timer = 5
            while start_game_timer >= 0:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'start_game_timer',
                        'countdown': start_game_timer
                    }
                )
                await asyncio.sleep(1)
                start_game_timer -= 1
            room_management.games[self.room_name].gameStarted = True
            # interval set to 1/60 (60 fps)
            asyncio.create_task(self.send_ball(1/60))
#_____________________________________________________________________________

    async def start_game_timer(self, event):
        await self.send(text_data=json.dumps({'type': 'START_GAME_TIMER', 'countdown': event["countdown"]}))
#_____________________________________________________________________________

    # Enviamos la pelota
    async def send_ball(self, interval):
        game = room_management.games.get(self.room_name, None)
        if not game: return

        while not game.endgame:
            if game.isPaddleBallImpact:
                logger.debug(f"\n\n\n\n\nPaddle {game.isPaddleBallImpact}\n\n\n\n\n")
            if game.isImpact:
                logger.debug(f"\n\n\n\n\nWall {game.isImpact}\n\n\n\n\n")
            data = {
                "ballX": game.ball_position['x'],
                "ballZ": game.ball_position['z'],
                "ballDirX": game.ball_dir_x,
                "ballDirZ": game.ball_dir_z,
                "wallImpact": game.isImpact,
                "paddleBallImpact": game.isPaddleBallImpact,
            }
            await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'ball_movement',
                            'data': data
                        }
                    )
            game.isImpact = False
            game.isPaddleBallImpact = False
            #logger.debug(game.isImpact)
            game.paddlePhysics()
            game.ball_physics()
            if game.goalFlag:
                game.goalFlag = False
                goal_data = {
                    "type": "GOAL",
                    "score1": game.score1,
                    "score2": game.score2,
                    "winner": game.winner,
                    "endgame": game.endgame,
                }
                await self.channel_layer.group_send(
                    f"pong_{self.room_name}",
                    {
                        'type': 'goal_notification',
                        'data': goal_data
                    }
                )
            await asyncio.sleep(interval)
    
    async def ball_movement(self, event):
        await self.send(text_data=json.dumps({'type': 'BALL', 'data': event["data"]}))
#_____________________________________________________________________________
    #El metodo se llama cuando el servidor recibe un mensaje del cliente
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if "type" not in data:
                logger.error("Message missing 'type' field")
                return
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            return
        message_type = data.get("type")
        if message_type == "message" and data.get("message") == "PING":
            self.handle_ping()
        elif message_type == "MOVE":
            await self.process_move(data)
        elif message_type == "QUIT":
            logger.info(f"Player {self.channel_name} quit the game")
            await self.close()
        else:
            logger.info(f"Unknow message type received: {message_type}.")
#_____________________________________________________________________________
    async def handle_ping(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'ping_message',
                'message': 'PONG'
            }
        )
#_____________________________________________________________________________
    async def ping_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message,
            'from': self.scope['user'].username
        }))
#_____________________________________________________________________________
    # Funcion larga
    async def process_move(self, data):
        pong_game = room_management.get_game_from_room(self.room_name)
        if not pong_game: return

        opponent = room_management.get_opponent_from_room(self.room_name, self.channel_name)
        if not opponent: return

        if data["isPlayer1"]:
            prev_z = pong_game.get_paddle1_position_z()
            pong_game.set_paddle1_position_z(data['paddleZ'])
        else:
            prev_z = pong_game.get_paddle2_position_z()
            pong_game.set_paddle2_position_z(data['paddleZ'])

        # ya se hace en send_ball(interval) no?
        #pong_game.paddlePhysics()
        #pong_game.ball_physics()

        update_data = {
            "type": "MOVE",
            "isPlayer1": data["isPlayer1"],
            "paddleZ": data['paddleZ'], 
        }
        await self.channel_layer.send(
            opponent,
            {
                "type": "player_move",
                "data": update_data
            }
        )

#_____________________________________________________________________________
    #El metodo se llama cuando un jugador se desconecta de la sala
    async def disconnect(self, close_code):
        logger.debug(f"Disconnecting from room: {self.room_name}")
        game = room_management.get_game_from_room(self.room_name)
        remaining_player = await room_management.remove_player_from_room(self.room_name, self.channel_name)
        
        
        if remaining_player:
            await self.channel_layer.send(
                remaining_player,
                {
                    'type': 'opponent_disconnected',
                    'winner': str(remaining_player)
                }
            )
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
#_____________________________________________________________________________
    # Metodo para enviar direccion de movimiento a los jugadores
    async def player_move(self, event):
        await self.send(text_data=json.dumps(event["data"]))  # Envía el mensaje JSON al otro jugador
#_____________________________________________________________________________
    async def goal_notification(self, event):
        await self.send(text_data=json.dumps(event["data"]))
#_____________________________________________________________________________
    # Metodo para enviar mensaje de que el oponente se desconectó
    async def opponent_disconnected(self, event):
        await self.send(text_data=json.dumps({'type': 'OPPONENT_DISCONNECTED', 'winner': event['winner']}))
#_____________________________________________________________________________

room_management = RoomManager()