import * as net from 'net';
import fetch from 'node-fetch';


enum MessageType {
     Request,
     Response,
     Command,
     Identify,
     Error,
     Update
}

export interface RequestType{
         messageType: MessageType;
         data: {id: string, lisence: string};
}

interface ResponseType{
    messageType: MessageType;
    data: { result:string };
}

class TCPServer {
    private server: net.Server;
    private port: number;
    private host: string;

    private r:string;

    constructor(port: number, host: string) {
        this.port = port;
        this.host = host;
        this.server = net.createServer((sock: net.Socket) => this.onConnection(sock));
        this.server.on('error', (err) => this.onError(err));
    }

    start() {
        this.server.listen(this.port, this.host, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }

    private onConnection(sock: net.Socket) {
        console.log(`CONNECTED: ${sock.remoteAddress}:${sock.remotePort}`);
        let buffer = '';

        sock.on('data', (data: Buffer) => {
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

        sock.on('error', (err: Error) => {
            console.error(`ERROR from ${sock.remoteAddress}: ${err.message}`);
        });
    }

    private processMessage(message: string, sock: net.Socket) {
        try {
            const parsedMessage: RequestType= JSON.parse(message);
            console.log(`Received message type: ${MessageType[parsedMessage.messageType]}, data: ${parsedMessage.data}`);
            //console.log(`Action Type ${parsedMessage.data.action}`);
            switch (parsedMessage.messageType) {
                case MessageType.Request:
                    this.sendMessage({ messageType: MessageType.Response, data: {result:"3.14455"} }, sock);
                    break;
                case MessageType.Identify:
                  console.log(parsedMessage);
                    this.VerifyIdentity(
                      parsedMessage.data.id, 
                      parsedMessage.data.lisence)
                .then((val) => {
                  this.r = val.message;
                  console.log(val);
                  this.sendMessage({ messageType: MessageType.Response, data: {result:val.message} }, sock);
                })
                    //this.sendMessage({ messageType: MessageType.Response, data: {result:"hambiza"} }, sock);
            }
        } catch (error) {
            console.error(`Error parsing message: ${error.message}`);
        }
    }

    private sendMessage(message: ResponseType, socket: net.Socket) {
        const serializedMessage = JSON.stringify(message) + '\n';
        socket.write(serializedMessage);
    }

    private onError(err: Error) {
        console.error(`Server error: ${err.message}`);
    }

    private async VerifyIdentity(id:string, lisence:string ):(Promise<any>){ 
      const body:{id:string, lisence:string } = {id:id, lisence:lisence};


      const response = await fetch('http://localhost:3000/verify',{
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

import {Bonjour} from 'bonjour-service'
const instance = new Bonjour();

const service = instance.publish({ name: 'Auth', type: 'http',port: 7070, protocol:"tcp", txt:{}})
service.start()

server.start();
