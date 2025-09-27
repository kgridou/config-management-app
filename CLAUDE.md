# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a complete configuration management system with both a PostgreSQL database schema and an Angular web application. The system provides hierarchical configuration management with versioning, environment separation, audit trails, and a modern web interface.

## Repository Structure

- **`config_mgmt_schema.sql`**: Complete PostgreSQL database schema with sample data
- **`config-management-app/`**: Angular 20+ web application with Supabase integration

## Database Architecture

The configuration management system is built around these core entities:

- **Applications**: Services/apps that have configurations
- **Environments**: Different deployment environments (dev, staging, prod) with priority levels
- **Config Groups**: Organizational units for related configurations within an application
- **Config Keys**: Configuration parameter definitions with data types and validation
- **Config Values**: Actual configuration values per environment with versioning
- **Config History**: Complete audit trail of all configuration changes
- **Config Deployments**: Deployment tracking with snapshots

## Web Application Architecture

The Angular application uses a modern standalone component architecture:

- **Components**: Located in `src/app/components/` with feature-based organization
  - `application-list/`: Application management
  - `config-management/`: Configuration value editing
  - `config-keys/`: Configuration schema definition
  - `auth/`: Authentication components (login, register, forgot-password)
  - `dashboard/`: Main dashboard
  - `navigation/`: App navigation
- **Services**: Business logic and API integration in `src/app/services/`
  - `supabase.service.ts`: Main database client
  - `config.service.ts`: Configuration management
  - `auth.service.ts`: Authentication handling
- **Models**: TypeScript interfaces in `src/app/models/config.models.ts`
- **Guards**: Route protection in `src/app/guards/auth.guard.ts`

## Development Commands

### Frontend (Angular App)
```bash
cd config-management-app

# Install dependencies
npm install

# Development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Watch mode for continuous building
npm run watch
```

## Technology Stack

- **Frontend**: Angular 20+ with standalone components
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth
- **Testing**: Jasmine/Karma

## Environment Setup

The application requires Supabase configuration. Environment files should be created:

- Create environment files in `src/environments/` with Supabase URL and anon key
- The ConfigService handles dynamic configuration loading
- Database schema from `config_mgmt_schema.sql` must be executed in Supabase

## Key Features

- **Hierarchical Organization**: Applications → Groups → Keys → Values per Environment
- **Data Type Support**: string, integer, boolean, json, encrypted values
- **Security**: Row Level Security (RLS), sensitive data masking, encryption support
- **Real-time Updates**: Live configuration changes via Supabase subscriptions
- **Audit Trail**: Complete history tracking with triggers
- **Environment Priority**: Higher priority environments can override lower ones

## Route Structure

- `/dashboard`: Main application dashboard
- `/applications`: Application list and creation
- `/apps/:id/configs`: Configuration value management
- `/apps/:id/keys`: Configuration schema definition
- `/auth/*`: Authentication flows

## Code Conventions

- Uses Angular standalone components (no NgModules)
- Lazy-loaded routes for performance
- TypeScript strict mode enabled
- Prettier configuration with 100 character line width
- Tailwind CSS for styling with utility-first approach