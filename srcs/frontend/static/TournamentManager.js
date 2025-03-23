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
	  
	  // Initialize blockchain - Async to avoid blocking
	  this.blockchainInitialized = false;
	  this.web3Instance = null;
	  this.contract = null;
	  this.loadWeb3();
	}
  
	// Load Web3 dynamically
	loadWeb3() {
	  // If Web3 doesn't exist, load it
	  if (typeof Web3 === 'undefined') {
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/web3@1.8.0/dist/web3.min.js';
		script.async = true;
		script.onload = () => {
		  console.log('Web3 loaded successfully');
		  // Once Web3 is loaded, try to initialize blockchain
		  this.initBlockchain();
		};
		script.onerror = () => {
		  console.error('Error loading Web3');
		};
		document.head.appendChild(script);
	  } else {
		// Web3 is already available
		this.initBlockchain();
	  }
	}
  
	// Initialize blockchain connection using MetaMask's window.ethereum
	async initBlockchain() {
	  try {
		// Check if MetaMask is installed
		if (typeof window.ethereum !== 'undefined') {
		  console.log('MetaMask is available');
		  
		  // Get network ID to ensure correct network
		  const networkId = await window.ethereum.request({ method: 'net_version' });
		  console.log('Connected to network ID:', networkId);
		  
		  // Configuration variables
		  // Update this to the contract address that matches your current network
		  this.contractAddress = "0xfebD24048bdeC746cCBa55a7Cd372D762400c8b4"; 
		  
		  // Complete contract ABI - ensure this matches your deployed contract
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
		  
		  // Only try to connect to MetaMask if not already initialized
		  if (!this.blockchainInitialized) {
			try {
			  // Get user's wallet address
			  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			  this.account = accounts[0];
			  
			  // Initialize Web3 instance
			  this.web3Instance = new Web3(window.ethereum);
			  
			  // Initialize contract instance
			  this.contract = new this.web3Instance.eth.Contract(
				this.contractABI, 
				this.contractAddress
			  );
			  
			  this.blockchainInitialized = true;
			  console.log('Account connected:', this.account);
			  
			  // Test a simple contract read to verify connection
			  try {
				const resultCount = await this.contract.methods.resultCount().call();
				console.log('Contract connection verified. Total results:', resultCount);
			  } catch (contractReadError) {
				console.error('Error reading from contract:', contractReadError);
				alert('Error connecting to the tournament contract. Please make sure you\'re on the correct network.');
				return;
			  }
			  
			  // Verify if the connected account is the contract owner
			  await this.checkOwnership();
			} catch (connectionError) {
			  console.error('Error connecting to MetaMask:', connectionError);
			  alert('Error connecting to MetaMask: ' + connectionError.message);
			}
		  }
		} else {
		  console.error('MetaMask is not installed');
		  alert('Please install MetaMask to use blockchain features.');
		}
	  } catch (error) {
		console.error('Error initializing blockchain:', error);
	  }
	}
  
	// Verify if the connected account is the contract owner
	async checkOwnership() {
	  try {
		if (!this.contract) {
		  console.error('Contract not initialized');
		  return false;
		}
		
		// Use a try-catch specifically for the owner call
		try {
		  const contractOwner = await this.contract.methods.owner().call();
		  console.log("Contract owner:", contractOwner);
		  console.log("Connected account:", this.account);
		  
		  if (contractOwner.toLowerCase() !== this.account.toLowerCase()) {
			console.warn("The connected account is not the contract owner!");
			alert("Warning: The connected account is not the contract owner. You may not be able to register tournaments.");
			return false;
		  }
		  
		  console.log("The connected account is the contract owner");
		  return true;
		} catch (ownerCallError) {
		  console.error("Error calling owner() function:", ownerCallError);
		  alert("Could not verify contract ownership. Make sure you're connected to the correct network.");
		  return false;
		}
	  } catch (error) {
		console.error("Error verifying ownership:", error);
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
		
		// When tournament is finished, record to blockchain
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
  
	// Record results on blockchain using web3
	async recordTournamentOnBlockchain() {
	  try {
		// Verify that we have the necessary information
		if (!this.web3Instance || !this.contract) {
		  console.error("Web3 or contract not initialized");
		  alert("Blockchain connection not ready. Trying to reconnect...");
		  await this.initBlockchain();
		  
		  // If still not initialized, quit
		  if (!this.web3Instance || !this.contract) {
			alert("Could not connect to blockchain. Results not recorded.");
			return;
		  }
		}
		
		// Prepare the data for the contract
		const first = this.playerPositions.first || "";
		const second = this.playerPositions.second || "";
		const third = this.playerPositions.third || "";
		const fourth = this.playerPositions.fourth || "";
		
		console.log("Sending positions to blockchain:", {first, second, third, fourth});
		
		// Make sure we're connected to MetaMask
		if (!this.account) {
		  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
		  this.account = accounts[0];
		}
		
		// Estimate the necessary gas (with a fallback if estimation fails)
		let gasEstimate;
		try {
		  gasEstimate = await this.contract.methods.record(first, second, third, fourth)
			.estimateGas({ from: this.account });
		  console.log("Gas estimate for transaction:", gasEstimate);
		} catch (gasError) {
		  console.warn("Gas estimation failed, using default:", gasError);
		  gasEstimate = 300000; // Default value if estimation fails
		}
		
		// Use 50% more gas than estimated to be safe
		const gasLimit = Math.ceil(gasEstimate * 1.5);
		
		// Call the contract with the configured gas limit
		const result = await this.contract.methods.record(first, second, third, fourth)
		  .send({ 
			from: this.account, 
			gas: gasLimit 
		  });
		  
		// Save the transaction result to a log
		this.saveTransactionLog(result.transactionHash);
		
		console.log("Tournament recorded on blockchain:", result.transactionHash);
		alert("Tournament successfully recorded on blockchain!");
		
		// Add a delay before verification to ensure the transaction has been processed
		setTimeout(async () => {
		  try {
			// Get the current resultCount, and the ID would be resultCount-1
			const resultCount = await this.contract.methods.resultCount().call();
			if (resultCount > 0) {
			  const resultId = resultCount - 1;
			  
			  // Verify that the tournament has been recorded correctly
			  await this.verifyTournamentRecord(resultId);
			} else {
			  console.error("No results found in contract");
			}
		  } catch (verifyError) {
			console.warn("Verification postponed because the transaction has not been confirmed yet:", verifyError);
		  }
		}, 5000); // Wait 5 seconds before trying to verify
		
	  } catch (error) {
		console.error("Error recording to blockchain:", error);
		alert("Error recording to blockchain: " + error.message);
	  }
	}
	
	// Verify that the tournament has been recorded correctly
	async verifyTournamentRecord(resultId) {
	  try {
		if (!this.contract) {
		  console.error("Contract not initialized");
		  return false;
		}
		
		// First verify if the resultId is valid
		let resultCount;
		try {
		  resultCount = await this.contract.methods.resultCount().call();
		} catch (countError) {
		  console.error("Error getting result count:", countError);
		  return false;
		}
		
		if (resultId >= resultCount) {
		  console.error(`Invalid result ID: ${resultId}. Total results: ${resultCount}`);
		  return false;
		}
		
		// Get the tournament result
		try {
		  const result = await this.contract.methods.getResult(resultId).call();
		  
		  console.log("Successful verification. Tournament data:", {
			first: result[0],
			second: result[1],
			third: result[2],
			fourth: result[3],
			timestamp: new Date(result[4] * 1000).toLocaleString()
		  });
		  
		  // Show the results in table format in the console
		  console.table({
			first: result[0],
			second: result[1],
			third: result[2],
			fourth: result[3],
			timestamp: new Date(result[4] * 1000).toLocaleString()
		  });
		  
		  return true;
		} catch (getResultError) {
		  console.error("Error getting result:", getResultError);
		  return false;
		}
	  } catch (error) {
		console.error("Error verifying tournament:", error);
		return false;
	  }
	}
	
	// Save transaction log
	saveTransactionLog(txHash) {
	  // Create object with data to save
	  const logData = {
		timestamp: new Date().toISOString(),
		transactionHash: txHash,
		playerPositions: { ...this.playerPositions },
		network: window.ethereum.networkVersion || "unknown"
	  };
	  
	  // Save to localStorage (simple solution without backend)
	  const logs = JSON.parse(localStorage.getItem('blockchainLogs') || '[]');
	  logs.push(logData);
	  localStorage.setItem('blockchainLogs', JSON.stringify(logs));
	  
	  // Show in console for debugging
	  console.table(logData);
	}
	
	// Get all registered tournament results
	async getAllTournamentResults() {
	  try {
		if (!this.contract) {
		  console.error("Contract not initialized");
		  await this.initBlockchain();
		  if (!this.contract) {
			return [];
		  }
		}
		
		// Get the total number of results
		let resultCount;
		try {
		  resultCount = await this.contract.methods.resultCount().call();
		  console.log(`Total registered tournaments: ${resultCount}`);
		} catch (countError) {
		  console.error("Error getting result count:", countError);
		  return [];
		}
		
		// Array to store all results
		const allResults = [];
		
		// Iterate over all results and get them
		for (let i = 0; i < resultCount; i++) {
		  try {
			const result = await this.contract.methods.getResult(i).call();
			
			allResults.push({
			  id: i,
			  first: result[0],
			  second: result[1],
			  third: result[2],
			  fourth: result[3],
			  timestamp: new Date(result[4] * 1000).toLocaleString()
			});
		  } catch (getResultError) {
			console.error(`Error getting result ${i}:`, getResultError);
			// Continue with the next result instead of stopping
			continue;
		  }
		}
		
		// Show all results in the console
		console.log("All tournament results:");
		console.table(allResults);
		
		return allResults;
	  } catch (error) {
		console.error("Error getting all results:", error);
		return [];
	  }
	}
	
	// Add a method to display tournament history in the UI
	displayTournamentHistory(containerId) {
	  // Get the container where the history will be displayed
	  const container = document.getElementById(containerId);
	  if (!container) {
		console.error(`Container ${containerId} not found`);
		return;
	  }
	  
	  // Clear the container
	  container.innerHTML = '<h2>Tournament History</h2><div id="loading">Loading...</div>';
	  
	  // Get all results
	  this.getAllTournamentResults()
		.then(results => {
		  // Remove the loading message
		  const loadingEl = document.getElementById('loading');
		  if (loadingEl) loadingEl.remove();
		  
		  if (results.length === 0) {
			container.innerHTML += '<p>No registered tournaments</p>';
			return;
		  }
		  
		  // Create a table to display the results
		  const table = document.createElement('table');
		  table.className = 'tournament-history';
		  
		  // Create the table header
		  const thead = document.createElement('thead');
		  thead.innerHTML = `
			<tr>
			  <th>ID</th>
			  <th>First Place</th>
			  <th>Second Place</th>
			  <th>Third Place</th>
			  <th>Fourth Place</th>
			  <th>Date</th>
			</tr>
		  `;
		  table.appendChild(thead);
		  
		  // Create the table body
		  const tbody = document.createElement('tbody');
		  results.forEach(result => {
			const row = document.createElement('tr');
			row.innerHTML = `
			  <td>${result.id}</td>
			  <td>${result.first}</td>
			  <td>${result.second}</td>
			  <td>${result.third}</td>
			  <td>${result.fourth}</td>
			  <td>${result.timestamp}</td>
			`;
			tbody.appendChild(row);
		  });
		  table.appendChild(tbody);
		  
		  // Add the table to the container
		  container.appendChild(table);
		})
		.catch(error => {
		  console.error("Error displaying history:", error);
		  container.innerHTML += '<p>Error loading tournament history</p>';
		});
	}
  }
//0xfebD24048bdeC746cCBa55a7Cd372D762400c8b4