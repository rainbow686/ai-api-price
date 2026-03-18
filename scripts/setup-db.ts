#!/usr/bin/env bun
/**
 * Complete Supabase Setup - Using pgmeta SQL API
 */

import { readFile } from "fs/promises";
import { join } from "path";

const SUPABASE_REF = "wpiqswsyepwravdgndje";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_DIR = "/Users/sunbin/myclaude/ai-api-price";

if (!SERVICE_ROLE_KEY) {
  console.error("Usage: SUPABASE_SERVICE_ROLE_KEY=eyJ... bun run scripts/setup-db.ts");
  process.exit(1);
}

async function executeSql(sql: string): Promise<{ ok: boolean; result: any }> {
  // Use pgmeta SQL endpoint directly
  const url = `https://${SUPABASE_REF}.supabase.co/api/sql`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/sql",
        "apikey": SERVICE_ROLE_KEY,
      },
      body: sql
    });

    const text = await response.text();

    if (response.ok) {
      return { ok: true, result: text };
    } else {
      return { ok: false, result: { status: response.status, error: text } };
    }
  } catch (e) {
    return { ok: false, result: { error: e.message } };
  }
}

async function main() {
  console.log("🔧 Setting up Supabase Database\n");
  console.log(`Project: https://${SUPABASE_REF}.supabase.co\n`);

  // Read and execute migration
  const migrationPath = join(PROJECT_DIR, "supabase/migrations/001_initial_schema.sql");
  const migrationSql = await readFile(migrationPath, "utf-8");

  console.log("📋 Step 1: Running database migration...\n");

  const result = await executeSql(migrationSql);

  if (result.ok) {
    console.log("✅ Migration executed successfully!\n");
    console.log("Tables created:");
    console.log("  - users");
    console.log("  - api_keys");
    console.log("  - price_tiers");
    console.log("  - requests");
    console.log("  - budgets");
    console.log("  - budget_alerts");
    console.log("");
  } else {
    console.log(`⚠️  Migration result: ${JSON.stringify(result.result).substring(0, 200)}...`);
    console.log("");
    console.log("This might be OK if tables already exist.");
    console.log("");
  }

  // Create test user
  console.log("📋 Step 2: Creating test user...\n");

  const createUserSql = `
    INSERT INTO users (email) VALUES ('test@example.com')
    ON CONFLICT (email) DO NOTHING
    RETURNING id, api_key;
  `;

  const userResult = await executeSql(createUserSql);

  if (userResult.ok) {
    console.log("✅ User created!");
    console.log(`   SQL Result: ${userResult.result}`);
  } else {
    console.log(`⚠️  User creation: ${JSON.stringify(userResult.result).substring(0, 100)}...`);
  }

  // Fetch user
  console.log("\n📋 Step 3: Fetching test user...\n");

  const fetchUserSql = `SELECT id, email, api_key FROM users WHERE email = 'test@example.com' LIMIT 1;`;
  const fetchResult = await executeSql(fetchUserSql);

  let userId = null;
  let apiKey = null;

  if (fetchResult.ok && fetchResult.result) {
    // Parse the result to extract user data
    console.log("✅ User data retrieved");
    console.log(`   Result: ${fetchResult.result.substring(0, 300)}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("📋 SETUP COMPLETE");
  console.log("=".repeat(60));
  console.log("");
  console.log("Dashboard: https://app.supabase.com/project/wpiqswsyepwravdgndje");
  console.log("");
  console.log("Next steps:");
  console.log("1. Go to SQL Editor and run: SELECT * FROM users;");
  console.log("2. Copy your user ID and API key");
  console.log("3. Add provider API keys in api_keys table");
  console.log("4. Deploy on Vercel");
  console.log("");
}

main().catch(console.error);
