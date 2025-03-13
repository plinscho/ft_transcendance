// tournamentManager.js - Modificado para usar JavaScript vanilla con Web3
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
	
	// Inicializar blockchain sin npm
	this.initBlockchain();
}

// Inicializar conexión con blockchain usando el objeto window.ethereum de MetaMask
async initBlockchain() {
	try {
	// Comprobar si MetaMask está instalado
	if (typeof window.ethereum !== 'undefined') {
		console.log('MetaMask está disponible');
		
		// Variables de configuración
		this.contractAddress = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B"; // Reemplazar con la dirección real
		
		// ABI mínimo necesario para la función que vamos a usar
		this.contractABI = [
		{
			"inputs": [
			{"name": "_first", "type": "string"},
			{"name": "_second", "type": "string"},
			{"name": "_third", "type": "string"},
			{"name": "_fourth", "type": "string"}
			],
			"name": "recordPositions",
			"outputs": [{"name": "", "type": "uint256"}],
			"stateMutability": "nonpayable",
			"type": "function"
		}
		];
		
		// Obtener la dirección de la wallet del usuario
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
		this.account = accounts[0];
		console.log('Cuenta conectada:', this.account);
	} else {
		console.error('MetaMask no está instalado');
	}
	} catch (error) {
	console.error('Error al inicializar blockchain:', error);
	}
}

next() {
	if (this.games == 2) {
	return [this.playerBrackets[2], this.playerBrackets[3]];
	}
	else if (this.games == 1) {
	return this.finalPlayers;
	}
}

setWinner(winnerResult) {
	if (this.games === 3) {
	this.playerPositions["fourth"] = winnerResult[1];
	this.finalPlayers[0] = winnerResult[0];
	this.games--;
	}
	else if (this.games === 2) {
	this.playerPositions["third"] = winnerResult[1];
	this.finalPlayers[1] = winnerResult[0];
	this.games--;
	}
	else if (this.games === 1) {
	this.firstPlace = winnerResult[0];
	this.secondPlace = winnerResult[1];
	this.playerPositions["first"] = winnerResult[0];
	this.playerPositions["second"] = winnerResult[1];
	this.games--;
	
	// Al finalizar el torneo, registrar en blockchain
	if (this.games === 0) {
		this.recordTournamentOnBlockchain();
	}
	}
}

finished() {
	if (this.games === 0)
	return true;
	return false;
}

// Registrar resultados en blockchain usando web3 desde window
async recordTournamentOnBlockchain() {
	try {
	  // Verificar que tenemos la información necesaria
	  if (!window.ethereum || !this.contractAddress) {
		console.error("No se puede conectar a blockchain");
		return;
	  }
	  
	  // Cargar Web3 desde CDN
	  if (typeof Web3 === 'undefined') {
		console.error("Web3 no está cargado");
		return;
	  }
	  
	  const web3 = new Web3(window.ethereum);
	  const contract = new web3.eth.Contract(this.contractABI, this.contractAddress);
	  
	  // Preparar los datos para el contrato
	  const first = this.playerPositions.first || "";
	  const second = this.playerPositions.second || "";
	  const third = this.playerPositions.third || "";
	  const fourth = this.playerPositions.fourth || "";
	  
	  console.log("Enviando posiciones a blockchain:", {first, second, third, fourth});
	  
	  // Estimar el gas necesario (con un fallback por si falla la estimación)
	  const gasEstimate = await contract.methods.recordPositions(first, second, third, fourth)
		.estimateGas({ from: this.account })
		.catch(() => 300000); // Valor por defecto si falla la estimación
	  
	  // Usar un 50% más de gas de lo estimado para estar seguros
	  const gasLimit = Math.ceil(gasEstimate * 1.5);
	  
	  // Llamar al contrato con el límite de gas configurado
	  const result = await contract.methods.recordPositions(first, second, third, fourth)
		.send({ 
		  from: this.account,
		  gas: gasLimit
		});
	  
	  // Guardar el resultado en un log
	  this.saveTransactionLog(result.transactionHash);
	  
	  console.log("Torneo registrado en blockchain:", result.transactionHash);
	  alert("¡Torneo registrado en blockchain con éxito!");
	  
	} catch (error) {
	  console.error("Error al registrar en blockchain:", error);
	  alert("Error al registrar en blockchain: " + error.message);
	}
  }
  
// Guardar log de la transacción
saveTransactionLog(txHash) {
	// Crear objeto con los datos a guardar
	const logData = {
	timestamp: new Date().toISOString(),
	transactionHash: txHash,
	playerPositions: { ...this.playerPositions }
	};
	
	// Guardar en localStorage (solución simple sin backend)
	const logs = JSON.parse(localStorage.getItem('blockchainLogs') || '[]');
	logs.push(logData);
	localStorage.setItem('blockchainLogs', JSON.stringify(logs));
	
	// También mostramos en consola para debugging
	console.table(logData);
	
	// Si tienes un backend, podrías hacer una petición para guardar el log
	// fetch('/api/blockchain/log', {
	//   method: 'POST',
	//   headers: { 'Content-Type': 'application/json' },
	//   body: JSON.stringify(logData)
	// });
}
}

//0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B