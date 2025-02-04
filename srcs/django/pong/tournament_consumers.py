import json
from channels.generic.websocket import AsyncWebsocketConsumer #Crear consumidores de WebSockets asincronos
import logging
import asyncio
import random

logger = logging.getLogger(__name__)

tournament_counter = 0
num_players = 4
waiting_tournaments = {} #Ejemplo: { "tournament_1": [player1, player2, ...] }
tournament_brackets = {} #Ejemplo: { "tournament_1": { "quarterfinals": [...], "semifinals":[...], "final": [...]} }
lock = asyncio.Lock()

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        global num_players
        global tournament_counter
        if self.scope['user'].is_anonymous:
            logger.debug("User is anonymous, closing connection")
            await self.close()
            return
        
        async with lock:
            self.room_name = None
            logger.debug("Looking for a tournament to join")

            # Buscamos un torneo en espera
            for tournament_id, players in waiting_tournaments.items():
                if len(players) < num_players: #Cambiar en caso de querer más jugadores
                    self.room_name = tournament_id
                    players.append(self.channel_name)
                    logger.debug(f"Player added to existing tournament {self.room_name}")
                    break
            # Si no hay torneos disponibles, crear uno nuevo
            if self.room_name is None:
                tournament_counter += 1
                self.room_name = f"tournament_{tournament_counter}"
                waiting_tournaments[self.room_name] = [self.channel_name]
                logger.debug(f"Created new tournament: {self.room_name}")
        
            self.room_group_name = f"tournament_{self.room_name}"
        
        # Nos unimos a la sala websocket del torneo
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Si el torneo está lleno, empezar el torneo
        if len(waiting_tournaments[self.room_name]) == num_players:
            await self.start_tournament()

    #Genera el bracket y asigna los primeros partidos
    async def start_tournament(self):
        players = waiting_tournaments[self.room_name]
        random.shuffle(players) # Mezclar jugadores

        # Generar bracket
        if num_players == 8:
            tournament_brackets[self.room_name] = {
                "quarterfinals": [[players[i], players[i + 1]] for i in range(0, len(players), 2)], # Lista de listas de 2 jugadores
                "semifinals": [],
                "final": [],
                "winner": None
            }
            logger.debug(f"Generated bracket for 8 players: {tournament_brackets[self.room_name]}")
        elif num_players == 4:
            tournament_brackets[self.room_name] = {
                "semifinals": [[players[i], players[i + 1]] for i in range(0, len(players), 2)],
                "final": [],
                "winner": None
            }
            logger.debug(f"Generated bracket for 4 players: {tournament_brackets[self.room_name]}")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'start_bracket',
                'bracket': tournament_brackets[self.room_name]
            }
        )

        if num_players == 8:
            await self.start_next_round("quarterfinals")
        elif num_players == 4:
            await self.start_next_round("semifinals")


    # Envia el bracket inicial a los jugadores
    async def start_bracket(self, event):
        logger.debug(f"Sending bracket to players: {event['bracket']}")
        await self.send(text_data=json.dumps({
            "type": "bracket",
            "bracket": event["bracket"]
        }))

    # Crea las partidas de la siguiente ronda
    async def start_next_round(self, round_name):
        matches = tournament_brackets[self.room_name][round_name]
        logger.debug(f"Starting {round_name} with matches: {matches}")
        for match in matches:
            # Creamos el nombre de cada partida
            room_name = f"{self.room_name}_{round_name}_{matches.index(match)}"
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "match_start",
                    "match": match,
                    "room": room_name
                }
            )

    # Notifica a los jugadores que la partida ha comenzado
    async def match_start(self, event):
        logger.debug(f"Match started: {event['match']} in room {event['room']}")
        await self.send(text_data=json.dumps({
            "type": "match",
            "match": event["match"],
            "room": event["room"]
        }))

    # Recibe mensajes de los jugadores
    async def receive(self, text_data):
        data = json.loads(text_data)
        logger.debug(f"Received data: {data}")

        if data["type"] == "match_result":
            await self.process_match_result(data["winner"])
    
    # Actualiza el bracket y avanza a la siguiente ronda
    async def process_match_result(self, winner):
        logger.debug(f"Processing match result: {winner} wins")
        for round_name in ["quarterfinals", "semifinals", "final"]:
            # Buscamos el partido en que participó el ganador y lo elimina
            matches = tournament_brackets[self.room_name][round_name]
            for match in matches:
                if winner in match:
                    matches.remove(match)
                    # Determina la siguiente ronda
                    if round_name == "quarterfinals":
                        next_round = "semifinals"
                    elif round_name == "semifinals":
                        next_round = "final"
                    else:
                        tournament_brackets[self.room_name]["winner"] = winner
                        await self.announce_winner(winner)
                        return

                    if next_round == "semifinals":
                        tournament_brackets[self.room_name]["semifinals"].append([winner])
                    elif next_round == "final":
                        tournament_brackets[self.room_name]["final"].append([winner])
                    
                    logger.debug(f"Advancing {winner} to {next_round}")

                    await self.start_next_round(next_round)
                    return

    # Anuncia al ganador del torneo
    async def announce_winner(self, winner):
        logger.debug(f"Announcing tournament winner: {winner}")
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "tournament_winner",
                "winner": winner
            }
        )

    # Envia el mensaje de ganador a los jugadores
    async def tournament_winner(self, event):
        logger.debug(f"Sending winner message: {event['winner']}")
        await self.send(text_data=json.dumps({
            "type": "winner",
            "winner": event["winner"]
        }))

    async def disconnect(self, close_code):
        global tournament_counter
        async with lock:
            if self.room_name in waiting_tournaments:
                # Eliminamos el jugador de la sala
                waiting_tournaments[self.room_name].remove(self.channel_name)
                logger.debug(f"Player disconnected, removed from {self.room_name}")

                # Si no hay jugadores en la sala, la eliminamos
                if not waiting_tournaments[self.room_name]:
                    del waiting_tournaments[self.room_name]
                    logger.debug(f"Tournament {self.room_name} has no players left and is deleted")

                    if not waiting_tournaments:
                        tournament_counter = 0
                        logger.debug("No more tournaments, resetting counter")


        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        