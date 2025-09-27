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
# Install dependencies
npm install

# Development server (runs on http://localhost:4200)
npm start

# Build for production
npm run build

# Run tests with Karma/Jasmine
npm test

# Watch mode for continuous building
npm run watch

# Angular CLI commands
npx ng generate component <name>
npx ng generate service <name>
npx ng build --configuration production
```

### Database Management
```bash
# Database setup workflow (run in Supabase SQL Editor):
# 1. Reset database (WARNING: deletes all data)
#    Run: database/reset-database.sql
# 2. Create schema and structure
#    Run: database/supabase-schema.sql
# 3. Populate with sample data
#    Run: database/seed.sql

# Quick development reset sequence:
# database/reset-database.sql → database/supabase-schema.sql → database/seed.sql
```

## Technology Stack

- **Frontend**: Angular 20+ with standalone components
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth
- **Testing**: Jasmine/Karma

## Environment Setup

The application uses a dynamic configuration loading approach:

- **No environment files**: Configuration is loaded from `/assets/config/app-config.json`
- **ConfigService**: Handles dynamic configuration loading with fallback to defaults
- **Supabase Integration**: Direct integration without separate environment files
- **Database Setup**: Execute SQL scripts in order from `database/` folder in Supabase SQL Editor

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

- **Angular Architecture**: Standalone components (no NgModules) with lazy-loaded routes
- **TypeScript**: Strict mode enabled with comprehensive compiler options
- **Styling**: Tailwind CSS v4+ with utility-first approach and PostCSS
- **Code Quality**: Prettier with 100 character line width, Angular HTML parser
- **Route Guards**: AuthGuard and GuestGuard for access control
- **State Management**: RxJS with BehaviorSubjects for reactive state

## Project Structure Details

```
src/app/
├── components/
│   ├── application-list/        # Application CRUD operations
│   ├── auth/                   # Complete auth flow (login, register, forgot-password)
│   ├── config-management/      # Environment-based config value editing
│   ├── config-keys/           # Schema definition and group management
│   ├── dashboard/             # Main landing page
│   └── navigation/            # App navigation with routing
├── guards/
│   └── auth.guard.ts          # Route protection (AuthGuard, GuestGuard)
├── models/
│   └── config.models.ts       # TypeScript interfaces for all entities
└── services/
    ├── auth.service.ts        # Authentication handling
    ├── config.service.ts      # Dynamic configuration loading
    └── supabase.service.ts    # Main database client and operations
```

## Database Schema Architecture

Core entities with relationships:
- **users** → **applications** (1:many)
- **applications** → **config_groups** (1:many)
- **config_groups** → **config_keys** (1:many)
- **config_keys** × **environments** → **config_values** (many:many)
- **config_history** tracks all changes with full audit trail
- **config_deployments** manages deployment snapshots

## Common Development Tasks

### Adding New Components
```bash
# Generate new component with Angular CLI
npx ng generate component components/my-feature

# Component follows standalone pattern - no module imports needed
# Add route to src/app/app.routes.ts with lazy loading
```

### Working with Database
```bash
# 1. Make schema changes in database/supabase-schema.sql
# 2. Test locally by running reset → schema → seed sequence
# 3. Update TypeScript models in src/app/models/config.models.ts
# 4. Update services if needed for new operations
```

### Troubleshooting

**Database Issues:**
- If SQL scripts fail, check for VALUES list length mismatches in INSERT statements
- Ensure all foreign key references exist before inserting dependent records
- Run scripts in exact order: reset → schema → seed

**Build Issues:**
- TypeScript strict mode is enabled - all types must be properly defined
- Use `npm run watch` for continuous rebuilding during development
- Check Angular compiler options in tsconfig.json for strict template checking

**Authentication Issues:**
- Verify Supabase configuration in ConfigService
- Check RLS policies are properly set up in database
- Ensure auth guards are applied to protected routes