#!/usr/bin/env bun
/**
 * Run Supabase Database Migration
 * Requires: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_REF
 */

import { readFile } from "fs/promises";
import { join } from "path";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_REF = process.env.SUPABASE_REF || "wpiqswsyepwravdgndje";
const PROJECT_DIR = "/Users/sunbin/myclaude/ai-api-price";

if (!SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  console.error("");
  console.error("Usage:");
  console.error(`  SUPABASE_SERVICE_ROLE_KEY=your_key bun run scripts/migrate.ts`);
  console.error("");
  console.error("Get your service_role key from:");
  console.error(`  https://app.supabase.com/project/${SUPABASE_REF}/settings/api`);
  process.exit(1);
}

async function runMigration() {
  console.log("📋 Running Supabase Database Migration\n");
  console.log(`Project: https://${SUPABASE_REF}.supabase.co`);
  console.log("");

  const sqlPath = join(PROJECT_DIR, "supabase/migrations/001_initial_schema.sql");
  const sqlContent = await readFile(sqlPath, "utf-8");

  // Use Supabase SQL API via pgbouncer
  const url = `https://${SUPABASE_REF}.supabase.co/rest/v1/`;

  // Execute via pgmeta SQL endpoint
  const pgMetaUrl = `https://${SUPABASE_REF}.supabase.co/api/pg/meta`;

  console.log("Executing SQL...");

  // Try SQL execution via admin interface
  const response = await fetch(`https://${SUPABASE_REF}.supabase.co/api/sql`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "apikey": SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      sql: sqlContent,
    }),
  });

  const result = await response.json();

  if (response.ok) {
    console.log("✅ Migration completed successfully!");
    console.log("");
    console.log("Tables created:");
    console.log("  - users");
    console.log("  - api_keys");
    console.log("  - price_tiers");
    console.log("  - requests");
    console.log("  - budgets");
    console.log("  - budget_alerts");
    console.log("");
    console.log("Dashboard: https://app.supabase.com/project/" + SUPABASE_REF);
  } else {
    console.log("⚠️ Response:", result);
    console.log("");
    console.log("If you see permission errors, please:");
    console.log("1. Verify you're using the service_role key (not anon key)");
    console.log("2. Or run the SQL manually in the Supabase SQL Editor");
    console.log(`   https://app.supabase.com/project/${SUPABASE_REF}/sql/new`);
  }
}

runMigration().catch(console.error);
