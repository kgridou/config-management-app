# Configuration Management System - Documentation

A modern web application for managing hierarchical configuration data with versioning, environment separation, and audit trails. Built with Angular, Tailwind CSS, and Supabase.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Authentication Setup](#authentication-setup)
- [Database Management](#database-management)
- [Application Architecture](#application-architecture)
- [API Documentation](#api-documentation)
- [User Guide](#user-guide)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

The Configuration Management System provides a centralized platform for managing application configurations across different environments. It supports hierarchical organization, version tracking, audit trails, and secure handling of sensitive data.

### Key Concepts

- **Applications**: Top-level services or applications that need configuration
- **Environments**: Different deployment contexts (development, staging, production)
- **Configuration Groups**: Logical groupings of related configurations
- **Configuration Keys**: Parameter definitions with data types and validation
- **Configuration Values**: Actual values per environment with versioning
- **Audit Trail**: Complete history of all configuration changes

## ✨ Features

### Core Features
- **Multi-Application Support**: Manage configurations for multiple applications
- **Environment Management**: Separate configurations by environment with priority levels
- **Hierarchical Organization**: Group related configurations logically
- **Data Type Support**: String, integer, boolean, JSON, and encrypted values
- **Sensitive Data Protection**: Special handling for passwords, API keys, and secrets
- **Version Control**: Track all configuration changes with full audit trails
- **Real-time Updates**: Live configuration management with Supabase

### Security Features
- **Row Level Security (RLS)**: Database-level access control
- **Sensitive Data Masking**: Hide sensitive values in the UI
- **Encrypted Storage**: Secure storage for sensitive configurations
- **User Authentication**: Supabase Auth integration
- **Audit Logging**: Complete change tracking with user attribution

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Intuitive Navigation**: Easy-to-use configuration management
- **Real-time Feedback**: Immediate updates and error handling
- **Accessibility**: WCAG compliant design patterns

## 🛠 Technology Stack

### Frontend
- **Angular 20+**: Modern web framework with standalone components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **RxJS**: Reactive programming for data flow

### Backend
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Relational database with advanced features
- **Row Level Security**: Database-level access control
- **Real-time Subscriptions**: Live data updates

### Development Tools
- **Angular CLI**: Project scaffolding and build tools
- **PostCSS**: CSS processing and optimization
- **npm**: Package management

## 📋 Prerequisites

- **Node.js 18+** and npm
- **Supabase account** and project
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd config-management-app
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API** to get your project credentials
3. Update the configuration file:

**`public/assets/config/app-config.json`**:
```json
{
  "production": false,
  "supabase": {
    "url": "YOUR_SUPABASE_URL",
    "anonKey": "YOUR_SUPABASE_ANON_KEY"
  },
  "api": {
    "baseUrl": "http://localhost:3000",
    "timeout": 30000
  },
  "features": {
    "debugMode": true,
    "enableLogging": true
  }
}
```

### 3. Set Up Database

Run the database scripts in order in your Supabase SQL Editor:

1. **Reset Database** (if needed):
   ```sql
   -- Run: database/reset-database.sql
   ```

2. **Create Schema**:
   ```sql
   -- Run: database/supabase-schema.sql
   ```

3. **Add Sample Data**:
   ```sql
   -- Run: database/seed.sql
   ```

### 4. Run the Application

```bash
# Development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The application will be available at `http://localhost:4200`.

## 🔐 Authentication Setup

### Enable Authentication in Supabase

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure **Site URL**: `http://localhost:4200`
3. Add **Redirect URLs**: `http://localhost:4200/**`

### Create Demo Users

In Supabase Dashboard → **Authentication** → **Users**:

1. **System Administrator**
   - Email: `admin@company.com`
   - Password: `password123`
   - Metadata: `{"full_name": "System Administrator"}`

2. **John Doe**
   - Email: `john.doe@company.com`
   - Password: `password123`
   - Metadata: `{"full_name": "John Doe"}`

3. **Jane Smith**
   - Email: `jane.smith@company.com`
   - Password: `password123`
   - Metadata: `{"full_name": "Jane Smith"}`

### User Registration

Users can also register through the app:
1. Navigate to `/auth/register`
2. Fill in the registration form
3. Verify email (if email confirmation is enabled)

## 🗄 Database Management

### Database Scripts

All database scripts are located in the `database/` folder:

- **`reset-database.sql`**: Completely reset the database
- **`supabase-schema.sql`**: Create the database schema
- **`seed.sql`**: Populate with sample data

### Database Schema Overview

```
users                    # User profile information
├── applications         # Applications/services
│   ├── config_groups    # Configuration groupings
│   └── config_keys      # Configuration definitions
│       └── config_values # Actual configuration values
│           └── config_history # Change audit trail
└── environments         # Deployment environments
```

### Reset Workflow

To completely reset the database:

1. Run `database/reset-database.sql`
2. Run `database/supabase-schema.sql`
3. Run `database/seed.sql`

## 🏗 Application Architecture

### Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── application-list/  # Application management
│   │   ├── config-management/ # Configuration values
│   │   ├── config-keys/       # Configuration schema
│   │   └── navigation/        # Navigation component
│   ├── guards/
│   │   └── auth.guard.ts      # Route protection
│   ├── models/
│   │   └── config.models.ts   # TypeScript interfaces
│   ├── services/
│   │   ├── auth.service.ts    # Authentication service
│   │   ├── config.service.ts  # Configuration service
│   │   └── supabase.service.ts # Database service
│   └── app.routes.ts          # Application routing
├── assets/
│   └── config/
│       └── app-config.json    # Application configuration
└── database/                  # Database scripts
```

### Key Services

#### AuthService
- Manages user authentication state
- Handles sign in/out, registration
- Provides user information and session management

#### ConfigService
- Loads application configuration from JSON
- Provides environment-specific settings
- Handles configuration hot-reloading

#### SupabaseService
- Database operations and queries
- Real-time subscriptions
- API layer for all data operations

### Component Architecture

- **Standalone Components**: Modern Angular architecture
- **Reactive Forms**: Type-safe form handling
- **Route Guards**: Authentication and authorization
- **Lazy Loading**: Optimized bundle splitting

## 📖 API Documentation

### Applications

```typescript
// Get all applications
getApplications(): Promise<Application[]>

// Create new application
createApplication(app: CreateApplicationRequest): Promise<Application>
```

### Environments

```typescript
// Get all environments
getEnvironments(): Promise<Environment[]>

// Create new environment
createEnvironment(env: CreateEnvironmentRequest): Promise<Environment>
```

### Configuration Management

```typescript
// Get configuration keys for an application
getConfigKeys(applicationId: number): Promise<ConfigKey[]>

// Get configuration values
getConfigValues(applicationId: number, environmentId?: number): Promise<ConfigValue[]>

// Update configuration value
updateConfigValue(id: number, updates: UpdateConfigValueRequest): Promise<ConfigValue>

// Get configuration history
getConfigHistory(configValueId?: number): Promise<ConfigHistory[]>
```

### Data Models

#### Application
```typescript
interface Application {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
```

#### ConfigKey
```typescript
interface ConfigKey {
  id: number;
  key_name: string;
  application_id: number;
  data_type: 'string' | 'integer' | 'boolean' | 'json' | 'encrypted';
  description?: string;
  is_required: boolean;
  is_sensitive: boolean;
  default_value?: string;
}
```

## 👥 User Guide

### Getting Started

1. **Sign In**: Use the authentication system to access the application
2. **Create Application**: Add your first application to manage
3. **Define Configuration Schema**: Create configuration keys and groups
4. **Set Values**: Configure values for different environments
5. **Manage Changes**: Track and audit configuration changes

### Managing Applications

1. Navigate to **Applications** page
2. Click **"Add Application"** to create new applications
3. Fill in application name and description
4. Access **"Manage Configs"** to set configuration values
5. Access **"Config Keys"** to define the configuration schema

### Configuration Management

#### Creating Configuration Schema

1. Go to **Applications** → Select App → **Config Keys**
2. Create **Configuration Groups** to organize related settings
3. Add **Configuration Keys** with appropriate data types:
   - **String**: Text values (URLs, names, etc.)
   - **Integer**: Numeric values (ports, timeouts, etc.)
   - **Boolean**: True/false values (feature flags, etc.)
   - **JSON**: Complex objects (API responses, etc.)
   - **Encrypted**: Sensitive data (passwords, API keys, etc.)

#### Setting Configuration Values

1. Go to **Applications** → Select App → **Manage Configs**
2. Select target **Environment** from dropdown
3. Click **Edit** on any configuration row
4. Update the value and click **Save**
5. Changes are automatically tracked in the audit trail

#### Environment Management

- **Development**: Local development settings
- **Testing**: Automated testing configurations
- **Staging**: Pre-production environment
- **Production**: Live production settings

### Security Best Practices

1. **Mark Sensitive Data**: Use the "Sensitive" flag for passwords and API keys
2. **Use Appropriate Data Types**: Choose the correct data type for validation
3. **Environment Separation**: Keep production secrets separate from development
4. **Regular Audits**: Review configuration changes regularly
5. **Access Control**: Use proper authentication and authorization

## 👨‍💻 Development Guide

### Running in Development

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

### Code Style

- **TypeScript**: Strict type checking enabled
- **Angular Style Guide**: Follow official Angular conventions
- **Tailwind CSS**: Use utility classes for styling
- **Reactive Patterns**: Prefer observables for data flow

### Adding New Features

1. **Create Models**: Define TypeScript interfaces in `models/`
2. **Add Service Methods**: Extend `SupabaseService` for data operations
3. **Create Components**: Build UI components with proper routing
4. **Add Tests**: Write unit tests for new functionality
5. **Update Documentation**: Document new features and APIs

### Database Changes

1. **Update Schema**: Modify `database/supabase-schema.sql`
2. **Update Seed Data**: Modify `database/seed.sql` if needed
3. **Update Models**: Sync TypeScript interfaces
4. **Update Services**: Add new service methods for data access

### Environment Configuration

The application uses JSON-based configuration:

```json
{
  "production": false,
  "supabase": {
    "url": "your-supabase-url",
    "anonKey": "your-anon-key"
  },
  "features": {
    "debugMode": true,
    "enableLogging": true
  }
}
```

## 🚀 Deployment

### Production Checklist

- [ ] Update Supabase configuration in `app-config.json`
- [ ] Set `production: true` in configuration
- [ ] Review and tighten RLS policies
- [ ] Configure proper authentication settings
- [ ] Set up proper domain and SSL
- [ ] Configure email templates in Supabase
- [ ] Test all functionality in production environment

### Deployment Platforms

#### Vercel
```bash
npm run build
# Deploy the dist/ folder to Vercel
```

#### Netlify
```bash
npm run build
# Deploy the dist/ folder to Netlify
```

#### Custom Server
```bash
npm run build
# Serve the dist/ folder with any web server
```

### Environment Variables

For production deployments, consider using environment-specific configuration files or environment variables for sensitive settings.

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
- **Problem**: Cannot connect to Supabase
- **Solution**: Check configuration in `app-config.json`
- **Check**: Verify Supabase URL and anon key are correct

#### Authentication Errors
- **Problem**: Cannot sign in/register
- **Solution**: Check Supabase Auth settings
- **Check**: Verify redirect URLs and site URL in Supabase

#### RLS Policy Errors
- **Problem**: "new row violates row-level security policy"
- **Solution**: Run `database/reset-database.sql` and recreate schema
- **Check**: Ensure RLS policies allow the required operations

#### Build Errors
- **Problem**: TypeScript compilation errors
- **Solution**: Check for missing imports and type definitions
- **Check**: Ensure all dependencies are installed

### Debug Mode

Enable debug mode in configuration:
```json
{
  "features": {
    "debugMode": true,
    "enableLogging": true
  }
}
```

This will:
- Show detailed console logs
- Display additional debug information
- Enable development-specific features

### Database Debugging

1. **Check Table Structure**: Use Supabase Table Editor
2. **Review RLS Policies**: Check Authentication → Policies
3. **Monitor Real-time**: Use Supabase Logs tab
4. **SQL Debugging**: Use SQL Editor for direct queries

### Getting Help

1. **Check Console**: Look for JavaScript errors in browser console
2. **Check Network**: Review network requests in browser dev tools
3. **Check Supabase Logs**: Monitor database and auth logs
4. **Reset Database**: Use reset script to start fresh

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using Angular, Tailwind CSS, and Supabase**