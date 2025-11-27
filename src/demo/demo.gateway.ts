import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // autorise toutes les origines, attention en prod
  },
})
export class DemoGateway {
  @WebSocketServer()
  server: Server;

  // Événement pour rejoindre une room
  @SubscribeMessage('connectionRoom')
  connection(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    socket.join(data.room);
    this.server.to(data.room).emit('events', {
      user: 'server',
      message: `${data.user} joined`,
    });
  }

  // Événement pour envoyer un message dans une room
  @SubscribeMessage('events')
  findAll(@MessageBody() data: any) {
    this.server.to(data.room).emit('events', data);
  }
}
