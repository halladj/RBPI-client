//import * as net from 'net';
//// Define enumeration and interface for custom messages
//enum MessageType {
//Greeting,
//Response,
//Command,
//Error,
//Update  // Example of additional message type
//}
//interface CustomMessage {
//messageType: MessageType;
//data: string;
//}
//const port = 7070;
//const host = '127.0.0.1';
//// Backoff configuration
//let connectionAttempts = 0;
//const maxConnectionAttempts = 5;
//let backoffInterval = 1000; // Start with 1 second
//const maxBackoffInterval = 30000; // Max backoff interval set to 30 seconds
//const server = net.createServer();
//server.on('connection', (sock: net.Socket) => {
//console.log(`CONNECTED: ${sock.remoteAddress}:${sock.remotePort}`);
//connectionAttempts = 0; // Reset connection attempts on a successful connection
//let buffer = '';
//sock.on('data', (data: Buffer) => {
//buffer += data.toString();
//let boundary = buffer.indexOf('\n');
//while (boundary !== -1) {
//const message = buffer.substring(0, boundary);
//buffer = buffer.substring(boundary + 1);
//processMessage(message, sock);
//boundary = buffer.indexOf('\n');
//}
//});
//sock.on('close', () => {
//console.log(`CLOSED: ${sock.remoteAddress} ${sock.remotePort}`);
//});
//sock.on('error', (err: Error) => {
//console.error(`ERROR from ${sock.remoteAddress}: ${err.message}`);
//});
//});
//server.on('error', (err) => {
//console.error(`Server error: ${err.message}`);
//if (connectionAttempts++ < maxConnectionAttempts) {
//console.log(`Retrying to start server in ${backoffInterval} ms`);
//setTimeout(() => {
//server.close(() => {
//server.listen(port, host);
//});
//}, backoffInterval);
//backoffInterval = Math.min(backoffInterval * 2, maxBackoffInterval); // Exponential increase
//} else {
//console.error('Maximum retry attempts reached, not restarting server');
//}
//});
//server.listen(port, host, () => {
//console.log(`Server running on port ${port}`);
//backoffInterval = 1000; // Reset backoff interval upon successful start
//connectionAttempts = 0; // Reset connection attempts
//});
//function processMessage(message: string, sock: net.Socket) {
//try {
//const parsedMessage: CustomMessage = JSON.parse(message);
//console.log(`Received message type: ${MessageType[parsedMessage.messageType]}, data: ${parsedMessage.data}`);
//// Respond based on message type
//switch (parsedMessage.messageType) {
//case MessageType.Greeting:
//sendCustomMessage({ messageType: MessageType.Response, data: 'Hello to you too!' }, sock);
//break;
//case MessageType.Command:
//// Handle commands here
//break;
//// Add more cases as needed
//}
//} catch (error) {
//console.error(`Error parsing message: ${error.message}`);
//}
//}
//// Sending messages
//function sendCustomMessage(message: CustomMessage, socket: net.Socket): void {
//const serializedMessage = JSON.stringify(message) + '\n'; // Append a newline as delimiter
//socket.write(serializedMessage);
//}
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
            console.log(`Action Type ${parsedMessage.data.action}`);
            switch (parsedMessage.messageType) {
                case MessageType.Request:
                    this.sendMessage({ messageType: MessageType.Response, data: { result: "3.14455" } }, sock);
                    break;
                case MessageType.Identify:
                    this.VerifyIdentity("191934032196", "MTkxOTM0MDMyMTk2.T59NDzBQAi18UPZ9G/oepIp2YJtj3i+gbjSFYq2SoEeyOc8mjwq9q0P5Aj9aYDfWC9zdyJ9cYwd9hswPnnpBDw==");
                    this.sendMessage({ messageType: MessageType.Response, data: { result: "hambiza" } }, sock);
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
    }
}
//const server = new TCPServer(7070, '172.20.10.12');
const server = new TCPServer(7070, '172.20.10.12');
import { Bonjour } from 'bonjour-service';
const instance = new Bonjour();
const service = instance.publish({ name: 'Magical', type: 'http', port: 7070 });
service.start();
server.start();
