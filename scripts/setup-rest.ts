#!/usr/bin/env bun
/**
 * Supabase Setup - Using REST API directly
 * Creates tables via REST API bulk insert
 */

const SUPABASE_REF = "wpiqswsyepwravdgndje";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("Usage: SUPABASE_SERVICE_ROLE_KEY=eyJ... bun run scripts/setup-rest.ts");
  process.exit(1);
}

// Helper for REST API calls
async function restCall(endpoint: string, options: any = {}) {
  const url = `https://${SUPABASE_REF}.supabase.co/rest/v1/${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "apikey": SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      "Prefer": options.method === "POST" ? "return=representation" : "return=representation"
    }
  });

  return {
    ok: response.ok,
    status: response.status,
    data: await response.json().catch(() => ({})),
    text: await response.text().catch(() => "")
  };
}

async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await restCall(tableName + "?select=count&limit=1");
  return result.status !== 404;
}

async function main() {
  console.log("🔧 Setting up Supabase via REST API\n");
  console.log(`Project: ${SUPABASE_REF}\n`);

  // Check if tables exist
  console.log("Checking existing tables...\n");

  const tables = ["users", "api_keys", "price_tiers", "requests", "budgets", "budget_alerts"];

  for (const table of tables) {
    const result = await restCall(`${table}?select=*&limit=0`);
    if (result.ok) {
      console.log(`   ✅ ${table} exists`);
    } else if (result.status === 404) {
      console.log(`   ❌ ${table} NOT found`);
    } else {
      console.log(`   ⚠️  ${table}: ${result.status}`);
    }
  }

  console.log("");

  // Insert price data (this should work if table exists)
  console.log("Inserting price data...\n");

  const prices = [
    { provider: "openai", model: "gpt-4", input_price_per_1k: 0.03, output_price_per_1k: 0.06 },
    { provider: "openai", model: "gpt-4-turbo", input_price_per_1k: 0.01, output_price_per_1k: 0.03 },
    { provider: "openai", model: "gpt-3.5-turbo", input_price_per_1k: 0.0005, output_price_per_1k: 0.0015 },
    { provider: "openai", model: "gpt-4o", input_price_per_1k: 0.005, output_price_per_1k: 0.015 },
    { provider: "openai", model: "gpt-4o-mini", input_price_per_1k: 0.00015, output_price_per_1k: 0.0006 },
    { provider: "anthropic", model: "claude-3-opus", input_price_per_1k: 0.015, output_price_per_1k: 0.075 },
    { provider: "anthropic", model: "claude-3-sonnet", input_price_per_1k: 0.003, output_price_per_1k: 0.015 },
    { provider: "anthropic", model: "claude-3-haiku", input_price_per_1k: 0.00025, output_price_per_1k: 0.00125 },
    { provider: "anthropic", model: "claude-3-5-sonnet", input_price_per_1k: 0.003, output_price_per_1k: 0.015 },
    { provider: "google", model: "gemini-pro", input_price_per_1k: 0.0005, output_price_per_1k: 0.0015 },
    { provider: "google", model: "gemini-ultra", input_price_per_1k: 0.002, output_price_per_1k: 0.008 },
  ];

  const priceResult = await restCall("price_tiers", {
    method: "POST",
    body: JSON.stringify(prices)
  });

  if (priceResult.ok) {
    console.log(`✅ Inserted ${prices.length} price entries\n`);
  } else {
    console.log(`⚠️  Price insert: ${priceResult.status}\n`);
    console.log(`   ${JSON.stringify(priceResult.data).substring(0, 200)}...\n`);
  }

  // Create test user
  console.log("Creating test user...\n");

  const userResult = await restCall("users", {
    method: "POST",
    body: JSON.stringify({ email: "test@example.com" })
  });

  if (userResult.ok) {
    console.log("✅ User created!");
    console.log(`   ${JSON.stringify(userResult.data, null, 2)}\n`);
  } else {
    // Try to fetch existing user
    console.log("Fetching existing user...\n");

    const fetchUserResult = await restCall("users?select=*&email=eq.test@example.com");

    if (fetchUserResult.ok && Array.isArray(fetchUserResult.data) && fetchUserResult.data.length > 0) {
      console.log("✅ Found existing user:");
      console.log(`   ${JSON.stringify(fetchUserResult.data[0], null, 2)}\n`);
    } else {
      console.log(`⚠️  Could not create/fetch user: ${fetchUserResult.status}\n`);
    }
  }

  console.log("=".repeat(60));
  console.log("Setup complete!");
  console.log("=".repeat(60));
  console.log("");
  console.log("Dashboard: https://app.supabase.com/project/wpiqswsyepwravdgndje");
  console.log("");
  console.log("Next steps:");
  console.log("1. Add your AI provider API keys");
  console.log("2. Set up budget limits");
  console.log("3. Deploy to Vercel");
  console.log("");
}

main().catch(console.error);
