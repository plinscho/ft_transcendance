#File donde definiremos y crearemos el juego

class PongGame:
    def __init__(self):
        self.players = {}
        self.ball_position = [0.0]
        self.ball_velocity = [1,1]
        self.player_velocity = 1