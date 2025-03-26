import asyncio
import random

delta_time = 0.016
BALL_SPEED = 2

class BallPhysics:
	def __init__(self):
		self.ball_position = {'x': 0, 'z': 0}
		self.paddle1_position = {'x': -190, 'z': 0}
		self.paddle2_position = {'x': 180, 'z': 0}
		self.field_x = 400
		self.field_z = 300
		self.ball_dir_x = 1
		self.ball_dir_z = 1
		self.ball_speed = BALL_SPEED
		self.ball_paused = False
		self.paddle_x = 10
		self.paddle_z = 60
		self.paddle1_dir_z = 0
		self.paddle2_dir_z = 0
		self.score1 = 0
		self.score2 = 0
		self.winner = None
		self.goalFlag = False
		self.score_winner = 5
		self.endgame = False
		self.gameStarted = False
		self.isImpact = False
		self.isPaddleBallImpact = False

	def get_paddle1_position_z(self):
		return self.paddle1_position['z']

	def get_paddle2_position_z(self):
		return self.paddle2_position['z']
	
	def set_paddle1_position_z(self, new_z):
		self.paddle1_position['z'] = new_z

	def set_paddle2_position_z(self, new_z):
		self.paddle2_position['z'] = new_z
	
	def paddlePhysics(self):
		if not self.endgame:
			if self.paddle1_position['x'] <= self.ball_position['x'] <= self.paddle1_position['x'] + self.paddle_x:
				if self.paddle1_position['z'] - self.paddle_z / 2 <= self.ball_position['z'] <= self.paddle1_position['z'] + self.paddle_z / 2:
					if self.ball_dir_x < 0:
						impact = (self.ball_position['z'] - self.paddle1_position['z']) / (self.paddle_z / 2)
						self.ball_dir_z = impact * 1.5
						self.ball_dir_z += self.paddle1_dir_z * 0.2
						self.isPaddleBallImpact = True
						
						if abs(self.ball_dir_z) < 0.2:
							self.ball_dir_z = 0.2 * (1 if self.ball_dir_z >= 0 else -1)
						self.ball_dir_x = -self.ball_dir_x * 1.05
						self.ball_speed = max(self.ball_speed, self.ball_speed + abs(self.paddle1_dir_z) * 0.2) * 1.02
			if self.paddle2_position['x'] <= self.ball_position['x'] <= self.paddle2_position['x'] + self.paddle_x:
				if self.paddle2_position['z'] - self.paddle_z / 2 <= self.ball_position['z'] <= self.paddle2_position['z'] + self.paddle_z / 2:
					if self.ball_dir_x > 0:
						impact = (self.ball_position['z'] - self.paddle2_position['z']) / (self.paddle_z / 2)
						self.ball_dir_z = impact * 1.5
						self.ball_dir_z += self.paddle2_dir_z * 0.5
						self.isPaddleBallImpact = True
						
						if abs(self.ball_dir_z) < 0.2:
							self.ball_dir_z = 0.2 * (1 if self.ball_dir_z >= 0 else -1)
						
						self.ball_dir_x = -self.ball_dir_x * 1.05
						self.ball_speed = max(self.ball_speed, self.ball_speed + abs(self.paddle2_dir_z) * 0.2) * 1.02

	def ball_physics(self):
		if not self.endgame:
			if self.ball_paused:
				return        
			if self.ball_position['x'] <= -self.field_x / 2:
				self.score2 += 1
				self.reset_ball(2)
				self.goalFlag = True
			if self.ball_position['x'] >= self.field_x / 2:
				self.score1 += 1
				self.reset_ball(1)
				self.goalFlag = True
			if self.score1 == self.score_winner:
				self.winner = "Player1"
				self.endgame = True
			elif self.score2 == self.score_winner:
				self.winner = "Player2"
				self.endgame = True
			if self.ball_position['z'] <= -self.field_z / 2 or self.ball_position['z'] >= self.field_z / 2:
				self.ball_dir_z = -self.ball_dir_z
				self.isImpact = True
			self.ball_position['x'] += self.ball_dir_x * self.ball_speed  #* delta_time
			self.ball_position['z'] += self.ball_dir_z * self.ball_speed  #* delta_time        
			if self.ball_dir_z > self.ball_speed * 2:
				self.ball_dir_z = self.ball_speed * 2
			elif self.ball_dir_z < -self.ball_speed * 2:
				self.ball_dir_z = -self.ball_speed * 2


	def reset_ball(self, loser):
		self.ball_paused = True
		self.ball_position = {'x': 0, 'z': 0}
		self.ball_speed = BALL_SPEED

		if loser == 1:
			self.ball_dir_x = -1 * random.uniform(0.8, 1.2)
			self.ball_dir_z = random.choice([-1, 1]) * random.uniform(0.5, 1.0)
		else:
			self.ball_dir_x = 1 * random.uniform(0.8, 1.2)
			self.ball_dir_z = random.choice([-1, 1]) * random.uniform(0.5, 1.0)
		asyncio.create_task(self.resume_ball())

	async def resume_ball(self):
			await asyncio.sleep(3)  # Pausa de 3 segundos
			self.ball_paused = False