export class NetworkManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.socket = null;
        this.messageCallback = null;
        this.isTournament = false;
    }

    connect(isTournament) {
        this.messageCallback = null;
        if (isTournament) {
            this.socket = new WebSocket(
                'ws://localhost:8000/ws/tournament/?authToken=' + this.token
            );
            this.socket.onopen = () => console.log('Connected to tournament server');
        } else {
            this.socket = new WebSocket(
                'ws://localhost:8000/ws/pong/?authToken=' + this.token
            );
            this.socket.onopen = () => console.log('Connected to multiplayer server');

        }
        // Esto siempre está disponible porque ya existe el websocket (la conexión)
        this.socket.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            console.log("Server data:", data);
            /*if (data.type !== "MOVE")
                    console.log("Server data:", data);*/

            if (this.messageCallback) {
                this.messageCallback(data);
            }
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        this.socket.onclose = (event) => {
            console.warn("WebSocket closed:", event.reason || "No reason provided");
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.onopen = null;
            this.socket.onmessage = null;
            this.socket.onclose = null;
            this.socket.onerror = null;
            this.socket.close();
            this.socket = null;
        }
    }

    onMessage(callback) {
        this.messageCallback = callback;
    }

    sendData(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
        else {
            console.warn("WebSocket is not connected. Message not sent:", data);
        }
    }
}