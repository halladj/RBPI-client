import * as net from 'net';
import fetch from 'node-fetch';
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Request"] = 0] = "Request";
    MessageType[MessageType["Response"] = 1] = "Response";
    MessageType[MessageType["Command"] = 2] = "Command";
    MessageType[MessageType["Identify"] = 3] = "Identify";
    MessageType[MessageType["Error"] = 4] = "Error";
    MessageType[MessageType["Update"] = 5] = "Update";
})(MessageType || (MessageType = {}));
class TCPServer {
    constructor(port, host) {
        this.port = port;
        this.host = host;
        this.server = net.createServer((sock) => this.onConnection(sock));
        this.server.on('error', (err) => this.onError(err));
    }
    start() {
        this.server.listen(this.port, this.host, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
    onConnection(sock) {
        console.log(`CONNECTED: ${sock.remoteAddress}:${sock.remotePort}`);
        let buffer = '';
        sock.on('data', (data) => {
            buffer += data.toString();
            let boundary = buffer.indexOf('\n');
            while (boundary !== -1) {
                const message = buffer.substring(0, boundary);
                buffer = buffer.substring(boundary + 1);
                this.processMessage(message, sock);
                boundary = buffer.indexOf('\n');
            }
        });
        sock.on('close', () => {
            console.log(`CLOSED: ${sock.remoteAddress} ${sock.remotePort}`);
        });
        sock.on('error', (err) => {
            console.error(`ERROR from ${sock.remoteAddress}: ${err.message}`);
        });
    }
    processMessage(message, sock) {
        try {
            const parsedMessage = JSON.parse(message);
            console.log(`Received message type: ${MessageType[parsedMessage.messageType]}, data: ${parsedMessage.data}`);
            //console.log(`Action Type ${parsedMessage.data.action}`);
            switch (parsedMessage.messageType) {
                case MessageType.Request:
                    this.sendMessage({ messageType: MessageType.Response, data: { result: "3.14455" } }, sock);
                    break;
                case MessageType.Identify:
                    console.log(parsedMessage);
                    this.VerifyIdentity(parsedMessage.data.id, parsedMessage.data.lisence)
                        .then((val) => {
                        this.r = val.message;
                        console.log(val);
                        this.sendMessage({ messageType: MessageType.Response, data: { result: val.message } }, sock);
                    });
                //this.sendMessage({ messageType: MessageType.Response, data: {result:"hambiza"} }, sock);
            }
        }
        catch (error) {
            console.error(`Error parsing message: ${error.message}`);
        }
    }
    sendMessage(message, socket) {
        const serializedMessage = JSON.stringify(message) + '\n';
        socket.write(serializedMessage);
    }
    onError(err) {
        console.error(`Server error: ${err.message}`);
    }
    async VerifyIdentity(id, lisence) {
        const body = { id: id, lisence: lisence };
        const response = await fetch('http://localhost:3000/verify', {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log(data);
        return data;
    }
}
const server = new TCPServer(7070, '172.20.10.12');
import { Bonjour } from 'bonjour-service';
const instance = new Bonjour();
const service = instance.publish({ name: 'Auth', type: 'http', port: 7070, protocol: "tcp", txt: {} });
service.start();
server.start();
