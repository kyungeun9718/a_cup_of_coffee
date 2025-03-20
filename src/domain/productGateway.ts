import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ProductService } from '../domain/product/product.service';

@WebSocketGateway({ cors: { origin: '*' } }) // 모든 클라이언트에서 접근 가능하도록 CORS 설정
export class ProductGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  /**
   * 클라이언트가 WebSocket 서버에 연결될 때 실행됨
   */
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  /**
   * 클라이언트가 WebSocket 서버에서 연결 해제될 때 실행됨
   */
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * 클라이언트가 특정 상품을 구독할 때 실행됨
   */
  @SubscribeMessage('subscribeToProduct')
  handleSubscribe(
    @MessageBody() productNo: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client subscribed to product: ${productNo}`);
    client.join(productNo); // 해당 제품 방에 클라이언트 추가
  }

  /**
   * 특정 상품 정보를 업데이트하여 구독한 클라이언트에게 전송
   */
  sendProductUpdate(productNo: string, productDetails: any) {
    console.log(`Sending product update to room: ${productNo}`);
    if (this.server) {
      this.server.to(productNo).emit('productUpdate', productDetails);
    } else {
      console.error('WebSocket 서버가 초기화되지 않았습니다.');
    }
  }
}
