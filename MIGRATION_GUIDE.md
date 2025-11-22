# Password Hashing Migration Guide

This guide will help you migrate from plain text passwords to hashed passwords using bcrypt.

## ✅ What's Been Implemented

- Password hashing utility functions (`lib/password.ts`)
- Updated login page to compare hashed passwords
- Password hashing script for creating admin accounts

## 🔄 Migration Steps

### Step 1: Hash Your Existing Admin Password

If you have an existing admin account with a plain text password, you need to:

1. **Hash the password** using the provided script:
   ```bash
   npx tsx scripts/hash-password.ts your_current_password
   ```

2. **Copy the hashed password** from the output

3. **Update the admin record in Supabase**:
   - Go to your Supabase dashboard
   - Navigate to Table Editor → `admins`
   - Find your admin account
   - Replace the `password_hash` field with the new hashed password
   - Save the changes

### Step 2: Create New Admin Accounts

For new admin accounts, always use hashed passwords:

1. **Hash the password**:
   ```bash
   npx tsx scripts/hash-password.ts new_password_here
   ```

2. **Insert into Supabase** using SQL Editor:
   ```sql
   INSERT INTO admins (username, password_hash)
   VALUES ('newadmin', 'paste_hashed_password_here')
   ON CONFLICT (username) DO NOTHING;
   ```

   Or use the Table Editor and paste the hashed password directly.

### Step 3: Test Login

1. Try logging in with your username and **plain text password** (not the hash)
2. The system will automatically compare it with the hashed version
3. If login works, migration is successful!

## 📝 Example

Let's say you want to create an admin with password `mypassword123`:

```bash
# Step 1: Hash the password
npx tsx scripts/hash-password.ts mypassword123

# Output will be something like:
# ✅ Password hashed successfully!
# Original password: mypassword123
# Hashed password: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

Then in Supabase SQL Editor:

```sql
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (username) DO NOTHING;
```

Now you can login with:
- Username: `admin`
- Password: `mypassword123` (plain text - the system handles the comparison)

## 🔒 Security Notes

1. **Never store plain text passwords** - Always hash them before storing
2. **Never commit hashed passwords** to version control if they're for production
3. **Use strong passwords** - The hashing doesn't make weak passwords secure
4. **Keep the hash script secure** - Don't share it publicly if it contains sensitive info

## 🛠️ Troubleshooting

### "Invalid username or password" after migration

- Verify the hashed password was copied correctly (no extra spaces)
- Make sure you're using the plain text password to login (not the hash)
- Check that the password_hash field in the database contains the full hash

### Script not working

- Make sure you've installed dependencies: `npm install`
- Try using `tsx` directly: `npm install -g tsx` then `tsx scripts/hash-password.ts password`

### Need to update multiple admins

You can update multiple admins at once:

```sql
-- Update specific admin
UPDATE admins 
SET password_hash = 'your_hashed_password_here'
WHERE username = 'admin_username';

-- Or update all admins (use with caution!)
-- You'll need to hash each password individually first
```

## ✅ Verification

After migration, verify:

1. ✅ Can login with plain text password
2. ✅ Cannot login with incorrect password
3. ✅ Cannot login with the hashed password (must use plain text)
4. ✅ Password hash in database is different from plain text

---

**Note**: The login system now automatically handles password comparison. You always login with your **plain text password**, and the system compares it with the stored hash.

