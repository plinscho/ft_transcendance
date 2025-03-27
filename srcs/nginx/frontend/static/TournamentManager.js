export class TournamentManager {
	constructor(state, players) {
	  this.players = players;
	  this.state = state;
	  this.playerBrackets = this.players.sort(() => Math.random() - 0.5);
	  this.state.tournamentNicksGame = [this.playerBrackets[0], this.playerBrackets[1]];
	  
	  // Configuración de blockchain
	  this.blockchainInitialized = false;
	  this.web3Instance = null;
	  this.contract = null;

	  // Iniciar carga de Web3
	  this.loadWeb3();

	  //Seguimiento de posiciones de jugadores
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
	}
  
	// Cargar Web3 dinámicamente
	loadWeb3() {
	  if (typeof Web3 === 'undefined') {
		// Cargar script de Web3 si no está disponible
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/web3@1.8.0/dist/web3.min.js';
		script.async = true;
		script.onload = () => {
		  this.initBlockchain();
		};
		document.head.appendChild(script);
	  } else {
		this.initBlockchain();
	  }
	}
  
	// Inicialización de conexión blockchain
	async initBlockchain() {
	  try {
		// Verificar si MetaMask está instalado
		if (typeof window.ethereum !== 'undefined') {
		  
		  // Configuraciones de contrato
		  this.contractAddress = "0xfebD24048bdeC746cCBa55a7Cd372D762400c8b4";
		  this.contractABI = [
			{
			  "inputs": [],
			  "stateMutability": "nonpayable",
			  "type": "constructor"
			},
			{
			  "anonymous": false,
			  "inputs": [
				{
				  "indexed": false,
				  "internalType": "uint256",
				  "name": "id",
				  "type": "uint256"
				}
			  ],
			  "name": "ResultStored",
			  "type": "event"
			},
			{
			  "inputs": [
				{
				  "internalType": "uint256",
				  "name": "_id",
				  "type": "uint256"
				}
			  ],
			  "name": "getResult",
			  "outputs": [
				{
				  "internalType": "string",
				  "name": "",
				  "type": "string"
				},
				{
				  "internalType": "string",
				  "name": "",
				  "type": "string"
				},
				{
				  "internalType": "string",
				  "name": "",
				  "type": "string"
				},
				{
				  "internalType": "string",
				  "name": "",
				  "type": "string"
				},
				{
				  "internalType": "uint256",
				  "name": "",
				  "type": "uint256"
				}
			  ],
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "inputs": [],
			  "name": "owner",
			  "outputs": [
				{
				  "internalType": "address",
				  "name": "",
				  "type": "address"
				}
			  ],
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "inputs": [
				{
				  "internalType": "string",
				  "name": "_first",
				  "type": "string"
				},
				{
				  "internalType": "string",
				  "name": "_second",
				  "type": "string"
				},
				{
				  "internalType": "string",
				  "name": "_third",
				  "type": "string"
				},
				{
				  "internalType": "string",
				  "name": "_fourth",
				  "type": "string"
				}
			  ],
			  "name": "record",
			  "outputs": [
				{
				  "internalType": "uint256",
				  "name": "",
				  "type": "uint256"
				}
			  ],
			  "stateMutability": "nonpayable",
			  "type": "function"
			},
			{
			  "inputs": [],
			  "name": "resultCount",
			  "outputs": [
				{
				  "internalType": "uint256",
				  "name": "",
				  "type": "uint256"
				}
			  ],
			  "stateMutability": "view",
			  "type": "function"
			},
			{
			  "inputs": [
				{
				  "internalType": "uint256",
				  "name": "",
				  "type": "uint256"
				}
			  ],
			  "name": "results",
			  "outputs": [
				{
				  "internalType": "string",
				  "name": "first",
				  "type": "string"
				},
				{
				  "internalType": "string",
				  "name": "second",
				  "type": "string"
				},
				{
				  "internalType": "string",
				  "name": "third",
				  "type": "string"
				},
				{
				  "internalType": "string",
				  "name": "fourth",
				  "type": "string"
				},
				{
				  "internalType": "uint256",
				  "name": "timestamp",
				  "type": "uint256"
				}
			  ],
			  "stateMutability": "view",
			  "type": "function"
			}
		  ];
		  // Solicitar conexión de cuenta de usuario
		  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
		  this.account = accounts[0];
		  
		  // Inicializar instancias de Web3 y contrato
		  this.web3Instance = new Web3(window.ethereum);
		  this.contract = new this.web3Instance.eth.Contract(
			this.contractABI, 
			this.contractAddress
		  );
		  
		  this.blockchainInitialized = true;
		  
		  // Verificar conexión y propiedad del contrato
		  await this.checkOwnership();
		} else {
		  alert('Por favor, instala MetaMask para usar funciones blockchain');
		}
	  } catch (error) {
	  }
	}
  
	// Verificar si la cuenta conectada es propietaria del contrato
	async checkOwnership() {
	  try {
		const contractOwner = await this.contract.methods.owner().call();
		
		if (contractOwner.toLowerCase() !== this.account.toLowerCase()) {
		  alert("Advertencia: La cuenta conectada no es propietaria del contrato");
		  return false;
		}
		
		return true;
	  } catch (error) {
		return false;
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
  
	// Establecer ganadores de cada ronda
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
		
		// Cuando el torneo termina, registrar en blockchain
		if (this.games === 0) {
		  this.recordTournamentOnBlockchain();
		}
	  }
	}
  
	// Verificar si el torneo ha terminado
	finished() {
	  return this.games === 0;
	}
  
	// Registrar resultados del torneo en blockchain
	async recordTournamentOnBlockchain() {
		try {
		  // Verificar que web3 y contrato estén inicializados
		  if (!this.web3Instance || !this.contract) {
			await this.initBlockchain();
			
			// Si aún no se inicializa, salir
			if (!this.web3Instance || !this.contract) {
			  return;
			}
		  }
		  
		  // Preparar datos para el contrato
		  const { first, second, third, fourth } = this.playerPositions;
		  
		  // Asegurar conexión a MetaMask
		  if (!this.account) {
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			this.account = accounts[0];
		  }
		  
		  // Estimar gas
		  let gasEstimate;
		  try {
			gasEstimate = await this.contract.methods.record(first, second, third, fourth)
			  .estimateGas({ from: this.account });
		  } catch (gasError) {
			gasEstimate = 300000; // Valor por defecto si falla la estimación
		  }
		  
		  const gasLimit = Math.ceil(gasEstimate * 1.5);
		  
		  // Enviar transacción al contrato
		  const result = await this.contract.methods.record(first, second, third, fourth)
			.send({ 
			  from: this.account, 
			  gas: gasLimit 
			});
		  
		  this.saveTransactionLog(result.transactionHash);
		  
		  // console.log("Torneo registrado en blockchain:", result.transactionHash);
		  
		  // Añadir un retraso antes de la verificación
		  setTimeout(async () => {
			try {
			  // Obtener el número actual de resultados
			  const resultCount = await this.contract.methods.resultCount().call();
			  if (resultCount > 0) {
				// El ID del resultado sería resultCount - 1
				const resultId = resultCount - 1;
				
				// Verificar que el torneo se ha registrado correctamente
				await this.verifyTournamentRecord(resultId);
			  } else {
				//console.error("No se encontraron resultados en el contrato");
			  }
			} catch (verifyError) {
			  //console.warn("Verificación pospuesta porque la transacción aún no se ha confirmado:", verifyError);
			}
		  }, 5000); // Esperar 5 segundos antes de verificar
		  
		} catch (error) {
		  //console.error("Error registrando en blockchain:", error);
		}
	}

	// Verificar registro del torneo
	async verifyTournamentRecord(resultId) {
	  try {
		if (!this.contract) {
		  // console.error("Contrato no inicializado");
		  return false;
		}
		
		// Verificar si el resultId es válido
		let resultCount;
		try {
		  resultCount = await this.contract.methods.resultCount().call();
		} catch (countError) {
		 // console.error("Error obteniendo número de resultados:", countError);
		  return false;
		}
		
		if (resultId >= resultCount) {
		  // console.error(`ID de resultado inválido: ${resultId}. Total de resultados: ${resultCount}`);
		  return false;
		}
		
		// Obtener resultado del torneo
		try {
		  const result = await this.contract.methods.getResult(resultId).call();
		  
		  /*console.log("Verificación exitosa. Datos del torneo:", {
			first: result[0],
			second: result[1],
			third: result[2],
			fourth: result[3],
			timestamp: new Date(result[4] * 1000).toLocaleString()
		  });*/
		  
		  // Mostrar resultados en formato de tabla en la consola
		  console.table({
			first: result[0],
			second: result[1],
			third: result[2],
			fourth: result[3],
			timestamp: new Date(result[4] * 1000).toLocaleString()
		  });
		  
		  return true;
		} catch (getResultError) {
		  //console.error("Error obteniendo resultado:", getResultError);
		  return false;
		}
	  } catch (error) {
		//console.error("Error verificando torneo:", error);
		return false;
	  }
	}
  
	// Guardar registro de transacción en localStorage
	saveTransactionLog(txHash) {
	  const logData = {
		timestamp: new Date().toISOString(),
		transactionHash: txHash,
		playerPositions: { ...this.playerPositions },
		network: window.ethereum.networkVersion || "desconocida"
	  };
	  
	  const logs = JSON.parse(localStorage.getItem('blockchainLogs') || '[]');
	  logs.push(logData);
	  localStorage.setItem('blockchainLogs', JSON.stringify(logs));
	  
	  //console.table(logData);
	}
}

//Contract: 0xfebD24048bdeC746cCBa55a7Cd372D762400c8b4