# Supabase Setup Guide

This guide will help you connect your Loyalty Program application to Supabase for storing admin details and customer information.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com) if you don't have one)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Loyalty Program (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to you
4. Click "Create new project" and wait for it to be set up (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find two important values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## Step 3: Set Up Environment Variables

1. In your project root directory, create a file named `.env.local`
2. Add the following content (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTIzNDU2NywiZXhwIjoxOTYwODEwNTY3fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `supabase-schema.sql` file
4. Click "Run" (or press Ctrl+Enter)
5. You should see "Success. No rows returned" - this means the tables were created successfully

## Step 5: Verify Tables Were Created

1. Go to **Table Editor** in your Supabase dashboard
2. You should see two tables:
   - `admins` - for storing admin login credentials (username, password_hash)
   - `customers` - for storing customer information (name, points, join_date)

## Step 6: Test the Default Admin Account

The schema includes a default admin account:

- **Username**: `admin`
- **Password**: `admin123`

You can verify this in the Table Editor by looking at the `admins` table.

## Step 7: Run Your Application

1. Make sure you've installed dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)
4. Try logging in with:
   - Username: `admin`
   - Password: `admin123`

## Security Notes

⚠️ **Important Security Considerations:**

1. **Password Hashing**: The current implementation stores passwords as plain text for simplicity. **For production use**, you should:

   - Use a proper password hashing library like `bcrypt`
   - Hash passwords before storing them in the database
   - Compare hashed passwords during login

2. **Row Level Security (RLS)**: The schema includes RLS policies that allow all authenticated users to access data. You may want to:

   - Restrict access based on user roles
   - Add more specific policies for your use case

3. **Environment Variables**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Adding More Admins

To add more admin accounts, you can:

1. Use the Supabase Table Editor to manually insert rows into the `admins` table
2. Or run this SQL in the SQL Editor:

```sql
INSERT INTO admins (username, password_hash)
VALUES ('newadmin', 'newpassword123');
```

## Troubleshooting

### "Missing Supabase environment variables" error

- Make sure `.env.local` exists in the project root
- Verify the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your development server after creating/updating `.env.local`

### "Failed to load customers" error

- Check that you've run the SQL schema in Step 4
- Verify the `customers` table exists in your Supabase dashboard
- Check the browser console for more detailed error messages

### Login not working

- Verify the `admins` table has the default admin record
- Check that the username and password match exactly (case-sensitive)
- Check the browser console for error messages

## Next Steps

- Consider implementing proper password hashing
- Set up more granular RLS policies
- Implement customer search and filtering
- Add transaction history for points changes

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Check the browser console for detailed error messages
