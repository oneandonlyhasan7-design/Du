# Overview

This is a real-time chat application built with a full-stack TypeScript architecture. The application provides instant messaging capabilities with user authentication, online presence tracking, and typing indicators. It features a modern React frontend with shadcn/ui components and an Express.js backend with WebSocket support for real-time communication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React and TypeScript, utilizing Vite as the build tool and development server. The application uses a component-based architecture with:

- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack Query for server state management and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: Native WebSocket API with custom hooks for connection management

The frontend follows a modular structure with separate directories for pages, components, hooks, and utilities. Components are organized by feature (chat-specific components) and reusable UI elements.

## Backend Architecture
The server is built with Express.js and TypeScript, featuring:

- **API Layer**: RESTful endpoints for authentication and message retrieval
- **Real-time Layer**: WebSocket server for instant messaging, typing indicators, and presence updates
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **Development Setup**: Vite integration for hot module replacement and development tooling

The backend uses a layered architecture separating concerns between route handlers, storage operations, and WebSocket management.

## Database Schema
The application uses Drizzle ORM with PostgreSQL schema definitions:

- **Users Table**: Stores user credentials, online status, and last seen timestamps
- **Messages Table**: Stores chat messages with user references and timestamps
- **Schema Validation**: Zod schemas for runtime type checking and API validation

The schema is designed for PostgreSQL but uses an in-memory storage implementation for development, allowing easy migration to a full database setup.

## Authentication System
Simple username/password authentication with automatic user creation:

- **Login Flow**: Users can log in with existing credentials or create new accounts automatically
- **Session Management**: Basic session handling with online status tracking
- **User Presence**: Real-time online/offline status updates via WebSocket connections

## Real-time Features
WebSocket-based real-time communication supporting:

- **Instant Messaging**: Real-time message delivery to all connected clients
- **Typing Indicators**: Shows when users are typing with automatic timeout
- **Online Presence**: Live updates of user online/offline status
- **Connection Management**: Automatic reconnection with exponential backoff

# External Dependencies

## UI and Styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **class-variance-authority**: Utility for creating component variants

## State Management and Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation and type inference

## Backend Framework
- **Express.js**: Web application framework for Node.js
- **WebSocket (ws)**: WebSocket library for real-time communication
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **@neondatabase/serverless**: PostgreSQL database driver for serverless environments

## Development Tools
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Static type checking and enhanced development experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Wouter**: Lightweight routing library for React applications

## Deployment
- **Vercel**: Deployment platform with static site generation and serverless functions
- **PostgreSQL**: Production database (Neon Database for serverless PostgreSQL)