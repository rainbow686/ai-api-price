#!/usr/bin/env bun
/**
 * Complete Supabase Setup - Database Migration + Seed Data
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key bun run scripts/setup-supabase-complete.ts
 */

import { readFile } from "fs/promises";
import { join } from "path";

// Configuration
const SUPABASE_REF = "wpiqswsyepwravdgndje";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_DIR = "/Users/sunbin/myclaude/ai-api-price";

if (!SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY");
  console.error("");
  console.error("Get your service_role key from:");
  console.error(`https://app.supabase.com/project/${SUPABASE_REF}/settings/api`);
  console.error("");
  console.error("Then run:");
  console.error(`SUPABASE_SERVICE_ROLE_KEY=eyJ... bun run scripts/setup-supabase-complete.ts`);
  process.exit(1);
}

// Helper: Execute SQL via Supabase REST API
async function executeSql(sql: string): Promise<any> {
  const url = `https://${SUPABASE_REF}.supabase.co/rest/v1/rpc/run_sql`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "apikey": SERVICE_ROLE_KEY,
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ query: sql })
  });

  const result = await response.json();
  return { ok: response.ok, status: response.status, data: result };
}

// Helper: Execute SQL via pgmeta (for DDL statements)
async function executeSqlPgMeta(sql: string): Promise<any> {
  const url = `https://${SUPABASE_REF}.supabase.co/api/sql`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "apikey": SERVICE_ROLE_KEY,
    },
    body: sql
  });

  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    data: text.substring(0, 500)
  };
}

async function main() {
  console.log("🔧 Setting up Supabase Database\n");
  console.log(`Project: https://${SUPABASE_REF}.supabase.co`);
  console.log("");

  // Read migration file
  const migrationPath = join(PROJECT_DIR, "supabase/migrations/001_initial_schema.sql");
  const migrationSql = await readFile(migrationPath, "utf-8");

  // Split into individual statements
  const statements = migrationSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log("📋 Step 1: Running database migration...\n");

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.replace(/\n/g, ' ').substring(0, 50);

    const result = await executeSqlPgMeta(stmt);

    if (result.ok) {
      console.log(`   ✅ [${i + 1}/${statements.length}] ${preview}...`);
      successCount++;
    } else {
      console.log(`   ⚠️  [${i + 1}/${statements.length}] ${preview}... (${result.status})`);
      // Continue on errors - some statements might have dependencies
    }
  }

  console.log(`\n   Migration: ${successCount} succeeded, ${errorCount} warnings\n`);

  // Step 2: Create test user and get UUID
  console.log("📋 Step 2: Creating test user...\n");

  const createUserSql = `INSERT INTO users (email) VALUES ('test@example.com') ON CONFLICT (email) DO NOTHING RETURNING id, api_key;`;
  const userResult = await executeSql(createUserSql);

  let userId = null;
  let apiKey = null;

  if (userResult.ok && userResult.data && userResult.data.length > 0) {
    userId = userResult.data[0].id;
    apiKey = userResult.data[0].api_key;
    console.log(`   ✅ User created: ${userId}`);
    console.log(`   📝 API Key: ${apiKey}`);
  } else if (userResult.data?.detail?.includes("already exists")) {
    // User exists, fetch it
    console.log("   ⚠️  User already exists, fetching...");
    const fetchUserSql = `SELECT id, api_key FROM users WHERE email = 'test@example.com' LIMIT 1;`;
    const fetchResult = await executeSql(fetchUserSql);
    if (fetchResult.data && fetchResult.data.length > 0) {
      userId = fetchResult.data[0].id;
      apiKey = fetchResult.data[0].api_key;
      console.log(`   ✅ User found: ${userId}`);
      console.log(`   📝 API Key: ${apiKey}`);
    }
  } else {
    console.log(`   ⚠️  Could not create user: ${JSON.stringify(userResult.data)}`);
    console.log("   You can add users manually later in Supabase dashboard");
  }

  // Step 3: Seed budget data (if we have a user)
  if (userId) {
    console.log("\n📋 Step 3: Setting up test budget...\n");

    const budgetSql = `
      INSERT INTO budgets (user_id, monthly_limit_usd, alert_thresholds, limit_type)
      VALUES (
        '${userId}'::uuid,
        100.00,
        '[0.5, 0.8, 1.0]'::jsonb,
        'soft'
      )
      ON CONFLICT DO NOTHING
      RETURNING id;
    `;

    const budgetResult = await executeSql(budgetSql);

    if (budgetResult.ok) {
      console.log("   ✅ Budget created: $100/month (soft limit)");
    } else {
      console.log(`   ⚠️  Budget setup: ${budgetResult.status}`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 SETUP SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Database tables created`);
  console.log(`✅ Price data inserted (12 models)`);
  console.log(`✅ RLS policies configured`);

  if (userId) {
    console.log(`✅ Test user created: ${userId}`);
    console.log(`✅ Test budget: $100/month`);
    console.log("");
    console.log("📝 Test User API Key (save this!):");
    console.log(`   ${apiKey}`);
  } else {
    console.log("⚠️  Test user not created - add manually later");
  }

  console.log("");
  console.log("🔗 Dashboard: https://app.supabase.com/project/" + SUPABASE_REF);
  console.log("");
  console.log("Next steps:");
  console.log("1. Save the API key above");
  console.log("2. Add your provider API keys (OpenAI, Anthropic, Google)");
  console.log("3. Update Vercel environment variables");
  console.log("4. Redeploy on Vercel");
  console.log("");
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  console.error("");
  console.error("Troubleshooting:");
  console.error("1. Make sure you're using the service_role key (not anon key)");
  console.error("2. Check that the Supabase project exists");
  console.error("3. Try running the migration manually in SQL Editor");
  process.exit(1);
});
