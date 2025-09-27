# Database Scripts

This folder contains all SQL scripts for the Configuration Management System database.

## 📋 **Scripts Overview**

### **1. reset-database.sql**
- **Purpose**: Completely reset the database
- **Usage**: Run when you want to start fresh
- **Warning**: ⚠️ Deletes ALL data and tables

### **2. supabase-schema.sql**
- **Purpose**: Create the complete database schema
- **Usage**: Run after reset or for initial setup
- **Includes**: Tables, triggers, indexes, RLS policies

### **3. seed.sql**
- **Purpose**: Populate database with sample data
- **Usage**: Run after schema creation for testing
- **Includes**: Sample apps, environments, configs, users

## 🚀 **Setup Instructions**

### **Fresh Installation**
```sql
-- 1. Create schema
-- Run: supabase-schema.sql

-- 2. Add sample data
-- Run: seed.sql
```

### **Reset Database**
```sql
-- 1. Reset everything
-- Run: reset-database.sql

-- 2. Recreate schema
-- Run: supabase-schema.sql

-- 3. Add sample data
-- Run: seed.sql
```

## 📝 **How to Run Scripts**

1. **Open Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste script content**
4. **Click "Run" button**
5. **Check results in the output panel**

## ⚡ **Quick Reset Workflow**

For development, use this sequence:
1. `reset-database.sql` - Clean slate
2. `supabase-schema.sql` - Rebuild structure
3. `seed.sql` - Add test data

## 🔐 **Security Notes**

- **Development**: Scripts use permissive RLS policies
- **Production**: Review and tighten security policies
- **Credentials**: Sample data uses placeholder secrets

## 📊 **Sample Data Included**

- **6 Applications**: e-commerce, user-service, notifications, etc.
- **4 Environments**: development, testing, staging, production
- **100+ Config Keys**: Database, API, security settings
- **3 Sample Users**: Admin, John Doe, Jane Smith
- **Environment-specific values**: Dev vs prod configurations