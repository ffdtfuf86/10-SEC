# Dark Timer Challenge

## Overview

Dark Timer Challenge is a competitive timing game where players attempt to stop a timer at exactly 10.00 seconds. The application features a leaderboard system that tracks player performance, ranking players based on how quickly they achieve their first perfect 10-second stop. Built with a modern full-stack architecture, it combines real-time game mechanics with persistent player statistics and social features like custom victory messages.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React with TypeScript for type-safe component development
- Wouter for lightweight client-side routing
- Single-page application architecture with conditional rendering based on game state

**State Management**
- React hooks (useState, useEffect, useRef) for local component state
- TanStack Query (React Query) for server state management and data fetching
- Real-time timer state managed via setInterval with useRef for cleanup

**UI Component System**
- Shadcn/ui component library with Radix UI primitives for accessible, composable components
- Tailwind CSS for utility-first styling with custom design tokens
- Dark-mode-first design with pure black backgrounds and high-contrast colors (red timer, gold highlights, green rank indicators)
- Monospace font for timer display to ensure consistent digit width

**Game Flow Components**
- NameInput: Initial screen for player identification
- TimerGame: Main game interface with timer, controls, and dynamic feedback
- Top1Banner: Displays current leaderboard leader's achievement
- RankDisplay: Shows player's current rank after successful attempts
- TimerDisplay: Large format countdown/timer visualization

### Backend Architecture

**Server Framework**
- Express.js with TypeScript running on Node.js
- ESM module system for modern JavaScript features
- Vite integration for development with HMR (Hot Module Replacement)

**API Design**
- RESTful endpoints for game state management
- POST /api/attempt: Validates timer stops, updates player records, determines rankings
- GET /api/leaderboard: Retrieves current standings and top player information
- Content filtering system for inappropriate messages using keyword blacklist

**Business Logic**
- Perfect 10 validation: Exact 10.00 second match required (previously ±0.05s tolerance)
- Ranking algorithm: Players ranked by fewest attempts to achieve first perfect 10
- Player record management: Tracks total attempts, perfect attempts, and best times
- New record detection: Compares current attempt against existing leaderboard champion

### Data Storage Solutions

**ORM & Database Access**
- Drizzle ORM for type-safe database operations
- Neon Serverless PostgreSQL as the database provider
- Connection pooling via @neondatabase/serverless for efficient resource usage

**Schema Design**
- Users table: Authentication-ready structure (id, username, password)
- Players table: Game statistics (name, total_attempts, perfect_attempts, first_perfect_attempt, best_time, message)
- Attempts table: Historical game data (player_id, time, is_perfect, attempt_number)
- UUID primary keys generated via PostgreSQL's gen_random_uuid()

**Data Access Patterns**
- Storage interface abstraction (IStorage) for potential future implementations
- DbStorage class implements all database operations
- Atomic updates for player records with conditional logic for personal bests

### Authentication & Authorization

**Current State**
- User schema exists but authentication is not actively implemented
- Players identified by name input only (no login required)
- Session management infrastructure present (connect-pg-simple) but unused

**Security Measures**
- Content filtering for user-submitted victory messages
- Input validation on all API endpoints
- Prepared statements via Drizzle ORM prevent SQL injection

### Development & Build System

**Build Tools**
- Vite for frontend bundling with React plugin
- esbuild for backend bundling in production builds
- TypeScript compilation with strict mode enabled
- Path aliases configured for clean imports (@/, @shared/, @assets/)

**Development Workflow**
- tsx for TypeScript execution in development
- Runtime error overlay for better debugging experience (Replit-specific plugins)
- Separate client and server build outputs (dist/public and dist/)

**Environment Configuration**
- DATABASE_URL required for Neon PostgreSQL connection
- NODE_ENV-based configuration switching
- Drizzle Kit for database migrations and schema management

## External Dependencies

### Database Services
- **Neon Serverless PostgreSQL**: Cloud-hosted PostgreSQL database with serverless driver for edge compatibility

### UI & Component Libraries
- **Radix UI**: Headless component primitives (dialogs, dropdowns, tooltips, etc.) for accessible UI patterns
- **Shadcn/ui**: Pre-styled component system built on Radix UI with Tailwind CSS
- **Tailwind CSS**: Utility-first CSS framework with custom configuration for dark theme

### Development Tools
- **Drizzle ORM**: TypeScript-first ORM with Zod schema validation integration
- **TanStack Query**: Asynchronous state management for data fetching and caching
- **Wouter**: Minimalist routing library (~1.5KB alternative to React Router)

### Form Management
- **React Hook Form**: Form state management with validation
- **Zod**: TypeScript-first schema validation for form inputs and API data

### Build & Tooling
- **Vite**: Next-generation frontend build tool with fast HMR
- **esbuild**: Ultra-fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins

### Utility Libraries
- **date-fns**: Modern date utility library for timestamp formatting
- **clsx & tailwind-merge**: Conditional className utilities for component styling
- **class-variance-authority**: Type-safe variant styling for components
- **nanoid**: Secure, URL-friendly unique ID generation