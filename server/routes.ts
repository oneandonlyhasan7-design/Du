import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMessageSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  username?: string;
}

interface ClientMessage {
  type: 'message' | 'join' | 'typing' | 'stopTyping';
  content?: string;
  username?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      let user = await storage.getUserByUsername(username);
      
      if (!user) {
        // Create new user if doesn't exist
        user = await storage.createUser({ username, password });
      }
      
      // In a real app, you'd verify the password here
      await storage.updateUserOnlineStatus(user.id, true);
      
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username 
        } 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Login failed" 
      });
    }
  });

  // Get messages endpoint
  app.get("/api/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getMessages(limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch messages" 
      });
    }
  });

  // Get online users endpoint
  app.get("/api/users/online", async (req, res) => {
    try {
      const onlineUsers = await storage.getOnlineUsers();
      res.json(onlineUsers);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch online users" 
      });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  const connectedClients = new Set<ExtendedWebSocket>();
  const typingUsers = new Set<string>();

  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('New WebSocket connection');
    connectedClients.add(ws);

    ws.on('message', async (data) => {
      try {
        const message: ClientMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join':
            if (message.username) {
              const user = await storage.getUserByUsername(message.username);
              if (user) {
                ws.userId = user.id;
                ws.username = user.username;
                await storage.updateUserOnlineStatus(user.id, true);
                
                // Broadcast user joined
                broadcast({
                  type: 'userJoined',
                  user: { id: user.id, username: user.username }
                }, ws);
                
                // Send updated online users list
                const onlineUsers = await storage.getOnlineUsers();
                broadcast({
                  type: 'onlineUsers',
                  users: onlineUsers
                });
              }
            }
            break;
            
          case 'message':
            if (ws.userId && message.content?.trim()) {
              try {
                const newMessage = await storage.createMessage({
                  content: message.content.trim(),
                  userId: ws.userId
                });
                
                const user = await storage.getUser(ws.userId);
                if (user) {
                  const messageWithUser = {
                    ...newMessage,
                    user: {
                      id: user.id,
                      username: user.username
                    }
                  };
                  
                  // Broadcast message to all clients
                  broadcast({
                    type: 'message',
                    message: messageWithUser
                  });
                }
              } catch (error) {
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Failed to send message'
                }));
              }
            }
            break;
            
          case 'typing':
            if (ws.username) {
              typingUsers.add(ws.username);
              broadcast({
                type: 'typing',
                username: ws.username,
                isTyping: true
              }, ws);
            }
            break;
            
          case 'stopTyping':
            if (ws.username) {
              typingUsers.delete(ws.username);
              broadcast({
                type: 'typing',
                username: ws.username,
                isTyping: false
              }, ws);
            }
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', async () => {
      console.log('WebSocket connection closed');
      connectedClients.delete(ws);
      
      if (ws.userId && ws.username) {
        await storage.updateUserOnlineStatus(ws.userId, false);
        typingUsers.delete(ws.username);
        
        // Broadcast user left
        broadcast({
          type: 'userLeft',
          user: { id: ws.userId, username: ws.username }
        });
        
        // Send updated online users list
        const onlineUsers = await storage.getOnlineUsers();
        broadcast({
          type: 'onlineUsers',
          users: onlineUsers
        });
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  function broadcast(data: any, excludeWs?: ExtendedWebSocket) {
    const message = JSON.stringify(data);
    connectedClients.forEach((client) => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  return httpServer;
}
