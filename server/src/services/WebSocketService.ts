import { WebSocketServer, WebSocket } from 'ws';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

export class WebSocketService {
  private wsServer: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(wsServer: WebSocketServer) {
    this.wsServer = wsServer;
    this.setupEventHandlers();
    console.log('✅ WebSocket service initialized');
  }

  private setupEventHandlers() {
    this.wsServer.on('connection', (ws: WebSocket) => {
      console.log('🔌 New WebSocket connection');
      this.clients.add(ws);

      // Send welcome message
      this.send(ws, 'connected', {
        message: 'Connected to AutoPrint WebSocket server',
        timestamp: new Date()
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('❌ Invalid WebSocket message:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send periodic ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000); // 30 seconds
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    const { type, payload } = message;

    switch (type) {
      case 'ping':
        this.send(ws, 'pong', { timestamp: new Date() });
        break;

      case 'subscribe':
        this.handleSubscription(ws, payload);
        break;

      case 'getQueueStatus':
        this.handleQueueStatusRequest(ws);
        break;

      default:
        console.log(`ℹ️ Unhandled WebSocket message type: ${type}`);
    }
  }

  private handleSubscription(ws: WebSocket, payload: any) {
    const { channel } = payload;
    console.log(`📡 Client subscribed to: ${channel}`);
    
    // Store subscription info in WebSocket object
    (ws as any).subscriptions = (ws as any).subscriptions || new Set();
    (ws as any).subscriptions.add(channel);

    this.send(ws, 'subscribed', { channel });
  }

  private async handleQueueStatusRequest(ws: WebSocket) {
    // This would typically fetch data from QueueService
    // For now, send a placeholder response
    this.send(ws, 'queueStatus', {
      waiting: 0,
      active: 0,
      completed: 0
    });
  }

  // Send message to specific client
  send(ws: WebSocket, type: string, payload: any) {
    if (ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: new Date()
      };

      ws.send(JSON.stringify(message));
    }
  }

  // Broadcast message to all connected clients
  broadcast(type: string, payload: any, channel?: string) {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date()
    };

    const messageStr = JSON.stringify(message);

    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        // If channel is specified, only send to subscribed clients
        if (channel) {
          const subscriptions = (ws as any).subscriptions;
          if (!subscriptions || !subscriptions.has(channel)) {
            return;
          }
        }

        ws.send(messageStr);
      }
    });

    console.log(`📡 Broadcasted ${type} to ${this.clients.size} client(s)`);
  }

  // Send queue update to all clients
  broadcastQueueUpdate(queueData: any) {
    this.broadcast('queueUpdate', queueData, 'queue');
  }

  // Send job update to all clients
  broadcastJobUpdate(jobData: any) {
    this.broadcast('jobUpdate', jobData, 'jobs');
  }

  // Send notification to specific client by phone number
  sendNotificationToUser(phoneNumber: string, notification: any) {
    // In a real implementation, you'd map phone numbers to WebSocket connections
    this.broadcast('userNotification', {
      phoneNumber,
      notification
    }, 'notifications');
  }

  // Get connection statistics
  getStats() {
    return {
      totalConnections: this.clients.size,
      activeConnections: Array.from(this.clients).filter(ws => ws.readyState === WebSocket.OPEN).length
    };
  }

  // Close all connections
  closeAll() {
    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.clients.clear();
  }
}
