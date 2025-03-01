export class NetworkManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.socket = null;
        this.messageCallback = null;
        this.isTournament = false;
    }

    connect(isTournament) {
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
            if (data.type !== "MOVE")
                    console.log("Server data:", data);

            if (this.messageCallback) {
                this.messageCallback(data);
            }
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }


    onMessage(callback) {
        this.messageCallback = callback;
    }

    sendData(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
}