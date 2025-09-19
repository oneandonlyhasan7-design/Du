import { type User, type InsertUser, type Message, type InsertMessage, type MessageWithUser, type OnlineUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void>;
  getOnlineUsers(): Promise<OnlineUser[]>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(limit?: number): Promise<MessageWithUser[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    
    // Create some default users for testing
    this.createDefaultUsers();
  }

  private async createDefaultUsers() {
    const defaultUsers = [
      { username: "john_doe", password: "password123" },
      { username: "alice_smith", password: "password123" },
      { username: "bob_johnson", password: "password123" },
      { username: "carol_williams", password: "password123" },
    ];

    for (const userData of defaultUsers) {
      try {
        await this.createUser(userData);
      } catch (error) {
        // User might already exist, continue
      }
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if username already exists
    const existingUser = await this.getUserByUsername(insertUser.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      isOnline: false,
      lastSeen: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date();
      this.users.set(id, user);
    }
  }

  async getOnlineUsers(): Promise<OnlineUser[]> {
    return Array.from(this.users.values())
      .filter(user => user.isOnline)
      .map(user => ({
        id: user.id,
        username: user.username,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(limit: number = 50): Promise<MessageWithUser[]> {
    const messages = Array.from(this.messages.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);

    const messagesWithUsers: MessageWithUser[] = [];
    
    for (const message of messages) {
      const user = await this.getUser(message.userId);
      if (user) {
        messagesWithUsers.push({
          ...message,
          user: {
            id: user.id,
            username: user.username
          }
        });
      }
    }

    return messagesWithUsers;
  }
}

export const storage = new MemStorage();
