import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Socket;

  connectedClients: { clientId: string; username: string | null }[] = [];
  messages: { clientId: string; username: string; text: string | null }[] = [];

  @SubscribeMessage('chat-client')
  handleClient(
    client: any,
    payload: string,
  ): { clientId: string; username: string | null } | boolean {
    if (payload == null || payload == '') return false;
    // allow to register username only if it is not taken
    const usernameTaken = this.connectedClients.find(
      (connectedClient) => connectedClient.username === payload,
    );
    if (usernameTaken) return false;

    // update username for the connected client
    const updatedClient = {
      ...this.connectedClients.find(
        (connectedClient) => connectedClient.clientId === client.id,
      ),
      username: payload,
    };

    this.connectedClients = this.connectedClients.map((connectedClient) =>
      connectedClient.clientId === client.id ? updatedClient : connectedClient,
    );

    this.server.emit('chat-client', this.connectedClients);
    return updatedClient;
  }

  @SubscribeMessage('chat-message')
  handleMessage(client: any, payload: string): string {
    // check if username is set for the client
    const username = this.connectedClients.find(
      (connectedClient) => connectedClient.clientId === client.id,
    )?.username;
    if (!username) {
      return 'You need to set username first';
    }

    const newMessage = {
      clientId: client.id,
      username: this.connectedClients.find(
        (connectedClient) => connectedClient.clientId == client.id,
      ).username,
      text: payload,
    };

    // add message to the list
    this.messages = [...this.messages, newMessage];

    this.server.emit('chat-message', newMessage);
  }

  @SubscribeMessage('chat-messages-history')
  handleMessagesHistory() {}

  handleConnection(client: any) {
    // add connected client to the list
    this.connectedClients = [
      ...this.connectedClients,
      { clientId: client.id, username: null },
    ];

    // notify all clients about the new list of connected clients
    this.server.emit('chat-client', this.connectedClients);

    // send all messages to the connected client
    this.server.emit('chat-messages-history', this.messages);

    console.log('client connected', client.id);
  }

  handleDisconnect(client: any) {
    // remove connected client from the list
    this.connectedClients = this.connectedClients.filter(
      (connectedClient) => connectedClient.clientId !== client.id,
    );

    // notify all clients about the new list of connected clients
    this.server.emit('chat-client', this.connectedClients);

    console.log('client disconnected', client.id);
  }
}
