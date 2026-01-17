# Database Setup Instructions

## Problem
Getting "Internal server error" when trying to log in? This means the database tables haven't been created yet.

## Solution
You need to create the database tables in your Neon PostgreSQL database.

### Steps:

1. **Go to your Neon Dashboard**: https://console.neon.tech/
2. **Select your project** (the one for ArielSpace)
3. **Click on "SQL Editor"** in the left sidebar
4. **Copy and paste** the entire contents of `setup-database.sql` into the SQL editor
5. **Click "Run"** to execute the SQL
6. **Verify** the tables were created by checking the output messages

### What this does:
- Creates the `users` table to store user accounts
- Creates the `listings` table to store internship/project listings  
- Creates indexes for better performance
- Inserts the admin user account (`admin@arielspace.com`)
- The admin password `$+davfil98+$` is hardcoded in the application, not stored in the database

### After setup:
1. Wait a few minutes for Netlify to finish deploying
2. Go to your ArielSpace site
3. Click "Sign In"
4. Use credentials:
   - **Email**: `admin@arielspace.com`
   - **Password**: `$+davfil98+$`
5. You should now be able to log in successfully!

### For regular users:
Regular users need to sign up first before they can log in. The signup process will create their account in the database.

## Troubleshooting

### Still getting errors after setup?
1. Check that DATABASE_URL is set correctly in Netlify environment variables
2. Make sure the Netlify deployment completed successfully
3. Check the Netlify function logs for specific error messages

### How to check Netlify environment variables:
1. Go to Netlify dashboard
2. Select your site
3. Go to Site configuration > Environment variables
4. Verify `DATABASE_URL` is set to your Neon connection string

### How to find your Neon connection string:
1. Go to Neon dashboard
2. Select your project
3. Click "Connection string" 
4. Copy the connection string (should start with `postgresql://`)
5. Make sure it ends with `?sslmode=require`
