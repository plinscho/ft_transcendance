import { ip } from './host.js';

const URL = 'wss://' + ip.ip + ':8000';

export class NetworkManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.socket = null;
        this.messageCallback = null;
        this.isTournament = false;
    }

    connect(isTournament) {
        if (this.socket) {
            this.disconnect();
        }
        if (isTournament) {
            this.socket = new WebSocket(
                URL + '/ws/tournament/?authToken=' + this.token
            );
            this.socket.onopen = () => {};
        } else {
            this.socket = new WebSocket(
                URL +'/ws/pong/?authToken=' + this.token
            );
            this.socket.onopen = () => {};

        }

        this.socket.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            //console.log("Server data:", data);
            /*if (data.type !== "MOVE")
                    console.log("Server data:", data);*/

            if (this.messageCallback) {
                this.messageCallback(data);
            } else {
                //console.warn("No message callback set for received data:", data);
            }
        };

        this.socket.onerror = (error) => {
            //console.error("WebSocket error:", error);
        };

        this.socket.onclose = (event) => {
            //console.warn("WebSocket closed:", event.reason || "No reason provided");
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
            //console.warn("WebSocket is not connected. Message not sent:", data);
        }
    }
}