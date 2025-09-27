# Configuration Management Application

A modern web application for managing hierarchical configuration data with versioning, environment separation, and audit trails. Built with Angular, Tailwind CSS, and Supabase.

## Features

- **Application Management**: Create and manage multiple applications with their configurations
- **Environment Support**: Configure different environments (development, staging, production) with priority levels
- **Configuration Groups**: Organize related configurations into logical groups
- **Data Types**: Support for string, integer, boolean, JSON, and encrypted values
- **Sensitive Data**: Special handling for passwords, API keys, and other sensitive information
- **Audit Trail**: Complete history of all configuration changes
- **Real-time Updates**: Live configuration management with Supabase real-time capabilities

## Technology Stack

- **Frontend**: Angular 20+ with standalone components
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL database with real-time features)
- **Authentication**: Supabase Auth (ready for implementation)
- **Deployment**: Vercel/Netlify compatible

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd config-management-app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Execute the database schema by running the SQL in `supabase-schema.sql` in your Supabase SQL editor

### 3. Configure Environment Variables

Update the environment files with your Supabase credentials:

**src/environments/environment.ts**:
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

**src/environments/environment.prod.ts**:
```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
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

## Database Schema

The application uses a hierarchical configuration management schema:

- **Applications**: Top-level services/applications
- **Environments**: Different deployment environments with priorities
- **Config Groups**: Logical groupings of related configurations
- **Config Keys**: Configuration parameter definitions
- **Config Values**: Actual values per environment
- **Config History**: Audit trail of all changes

See `supabase-schema.sql` for the complete database structure with indexes, triggers, and Row Level Security policies.

## Application Structure

```
src/app/
├── components/
│   ├── application-list/     # List and create applications
│   ├── config-management/    # Manage configuration values
│   ├── config-keys/         # Define configuration keys and groups
│   └── navigation/          # Main navigation component
├── models/                  # TypeScript interfaces
├── services/               # Supabase service layer
└── environments/           # Environment configuration
```

## Key Components

### Application List
- View all applications
- Create new applications
- Navigate to configuration management

### Configuration Management
- View configurations by environment
- Edit configuration values inline
- Filter by environment
- Real-time updates

### Configuration Keys
- Define configuration schema
- Create configuration groups
- Set data types and validation rules
- Mark sensitive configurations

## Security Features

- Row Level Security (RLS) enabled on all tables
- Sensitive data masking in the UI
- Encrypted value storage for sensitive configurations
- Audit trail for all configuration changes

## Development

### Adding New Features

1. Create new components in `src/app/components/`
2. Add routes in `src/app/app.routes.ts`
3. Update the Supabase service for new data operations
4. Follow the existing patterns for error handling and loading states

### Styling Guidelines

- Uses Tailwind CSS utility classes
- Consistent color scheme: blue for primary, gray for neutral
- Responsive design with mobile-first approach
- Accessible form controls and navigation

## Deployment

### Vercel
```bash
npm run build
# Deploy the dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy the dist/ folder to Netlify
```

Make sure to set the environment variables in your deployment platform.

## License

MIT License - see LICENSE file for details.