export class TournamentManager {
	constructor(state, players) {
		this.players = players;
		this.state = state;
		this.brackets;
		this.finalPlayers = [null, null];
		this.games = 3;
		this.firstPlace = null;
		this.secondPlace = null;
		this.playerPositions = {
			"first": null,
			"second": null,
			"third": null,
			"fourth": null
		};
		this.playerBrackets = this.players.sort(() => Math.random() - 0.5);
		this.state.tournamentNicksGame = [this.playerBrackets[0], this.playerBrackets[1]];
	}

	next() {
		if (this.games == 2)
		{
			return [this.playerBrackets[2], this.playerBrackets[3]];
		}
		else if (this.games == 1)
		{
			return this.finalPlayers;
		}
	}

	setWinner(winnerResult) {
		if (this.games === 3) {
			this.playerPositions["fourth"] = winnerResult[1];
			this.finalPlayers[0] = winnerResult[0];
			this.games--;
		}
		else if (this.games === 2)
		{
			this.playerPositions["third"] = winnerResult[1];
			this.finalPlayers[1] = winnerResult[0];
			this.games--;
		}
		else if (this.games === 1)
		{
			this.firstPlace = winnerResult[0];
			this.secondPlace = winnerResult[1];
			this.playerPositions["first"] = winnerResult[0];
			this.playerPositions["second"] = winnerResult[1];
			this.games--;
		}
	}

	finished() {
		if (this.games === 0)
			return true;
		return false;
	}

}
