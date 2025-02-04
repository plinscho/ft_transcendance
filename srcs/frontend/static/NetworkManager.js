export class NetworkManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.socket = null;
        this.messageCallback = null;
    }

    connect() {
        this.socket = new WebSocket(
            'ws://localhost:8000/ws/pong/?authToken=' + this.token
        );

        this.socket.onopen = () => console.log('Connected to server');

        this.socket.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
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