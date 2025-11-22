/**
 * Utility script to hash passwords for admin accounts
 * 
 * Usage:
 * 1. Run: npx tsx scripts/hash-password.ts <password>
 * 2. Copy the hashed password
 * 3. Use it in Supabase SQL or when creating admin accounts
 */

import { hashPassword } from '../lib/password'

async function main() {
  const password = process.argv[2]
  
  if (!password) {
    console.error('Usage: npx tsx scripts/hash-password.ts <password>')
    process.exit(1)
  }

  try {
    const hashedPassword = await hashPassword(password)
    console.log('\n✅ Password hashed successfully!\n')
    console.log('Original password:', password)
    console.log('Hashed password:', hashedPassword)
    console.log('\n📋 Use this hashed password in your Supabase admin table\n')
  } catch (error) {
    console.error('Error hashing password:', error)
    process.exit(1)
  }
}

main()

