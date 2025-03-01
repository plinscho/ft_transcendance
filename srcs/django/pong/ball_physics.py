import asyncio

class BallPhysics:
	def __init__(self):
		self.ball_position = {'x': 0, 'z': 0}
		self.paddle1_position = {'x': 0, 'z': 0}
		self.paddle2_position = {'x': 0, 'z': 0}
		self.field_x = 400
		self.field_z = 300
		self.ball_dir_x = 1
		self.ball_dir_z = 1
		self.ball_speed = 2.0
		self.ball_paused = False
		self.paddle_x = 10
		self.paddle_z = 10
		#self.paddle_y = 50
		self.paddle1_dir_z = 0
		self.paddle2_dir_z = 0
		self.score1 = 0
		self.score2 = 0
		self.winner = None
		self.goalFlag = False
		self.score_winner = 5
		self.endgame = False

	def paddlePhysics(self):
		if self.paddle1_position['x'] <= self.ball_position['x'] <= self.paddle1_position['x'] + self.paddle_x:
			if self.paddle1_position['z'] - self.paddle_z / 2 <= self.ball_position['z'] <= self.paddle1_position['z'] + self.paddle_z / 2:
				if self.ball_dir_x < 0:
					impact = (self.ball_position['z'] - self.paddle1_position['z']) / (self.paddle_z / 2)
					self.ball_dir_z = impact * 1.5
					self.ball_dir_z += self.paddle1_dir_z * 0.2
					self.ball_dir_x = -self.ball_dir_x * 1.05
					self.ball_speed = max(self.ball_speed, self.ball_speed + abs(self.paddle1_dir_z) * 0.2) * 1.02

		if self.paddle2_position['x'] <= self.ball_position['x'] <= self.paddle2_position['x'] + self.paddle_x:
			if self.paddle2_position['z'] - self.paddle_z / 2 <= self.ball_position['z'] <= self.paddle2_position['z'] + self.paddle_z / 2:
				if self.ball_dir_x > 0:
					impact = (self.ball_position['z'] - self.paddle2_position['z']) / (self.paddle_z / 2)
					self.ball_dir_z = impact * 1.5
					self.ball_dir_z += self.paddle2_dir_z * 0.5
					self.ball_dir_x = -self.ball_dir_x * 1.05
					self.ball_speed = max(self.ball_speed, self.ball_speed + abs(self.paddle2_dir_z) * 0.2) * 1.02
					#self.ball_speed = 10

	def ball_physics(self):
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
		self.ball_position['x'] += self.ball_dir_x * self.ball_speed # * self.delta_time
		self.ball_position['z'] += self.ball_dir_z * self.ball_speed # * self.delta_time        
		if self.ball_dir_z > self.ball_speed * 2:
			self.ball_dir_z = self.ball_speed * 2
		elif self.ball_dir_z < -self.ball_speed * 2:
			self.ball_dir_z = -self.ball_speed * 2


	def reset_ball(self, loser):
		self.ball_paused = True
		self.ball_position = {'x': 0, 'z': 0}
		self.ball_speed = 2.0

		if loser == 1:
			self.ball_dir_x = -1
			self.ball_dir_z = 1
		else:
			self.ball_dir_x = 1
			self.ball_dir_z = 1
		asyncio.create_task(self.resume_ball())

	async def resume_ball(self):
			await asyncio.sleep(1)  # Pausa de 2 segundos
			self.ball_paused = False