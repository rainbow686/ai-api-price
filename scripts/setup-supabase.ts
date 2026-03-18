#!/usr/bin/env bun
/**
 * Run Supabase Migration and Configure Vercel
 */

import { readFile } from "fs/promises";
import { join } from "path";

const SUPABASE_TOKEN = process.env.SUPABASE_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_DIR = "/Users/sunbin/myclaude/ai-api-price";

// From previous output
const SUPABASE_REF = "wpiqswsyepwravdgndje";
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || "prj_123456"; // Will get dynamically

console.log("🔧 Running Supabase Migration and Vercel Configuration\n");

// ============================================
// Step 1: Run Supabase Migration
// ============================================
async function runMigration() {
  console.log("📋 Step 1: Running database migration...\n");

  const sqlPath = join(PROJECT_DIR, "supabase/migrations/001_initial_schema.sql");
  const sqlContent = await readFile(sqlPath, "utf-8");

  // Split SQL into individual statements (remove comments and empty lines)
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  console.log(`Executing ${statements.length} SQL statements...\n`);

  // Execute each statement via Supabase SQL Editor API
  // Note: We need to use the service role key for DDL operations
  const url = `https://${SUPABASE_REF}.supabase.co/rest/v1/rpc/run_sql`;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const truncated = statement.substring(0, 60).replace(/\n/g, ' ');
    console.log(`   [${i + 1}/${statements.length}] ${truncated}...`);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUPABASE_TOKEN}`,
          "Content-Type": "application/json",
          "apikey": SUPABASE_TOKEN,
          "Prefer": "return=representation"
        },
        body: JSON.stringify({ query: statement })
      });

      if (response.ok) {
        console.log(`        ✅ OK`);
      } else {
        const error = await response.text();
        console.log(`        ⚠️  ${response.status}: ${error.substring(0, 100)}`);
      }
    } catch (e) {
      console.log(`        ❌ Error: ${e}`);
    }
  }

  console.log("\n✅ Migration complete!\n");
}

// ============================================
// Step 2: Get Vercel Project ID
// ============================================
async function getVercelProjectId() {
  console.log("🔍 Step 2: Getting Vercel project ID...");

  const response = await fetch("https://api.vercel.com/v9/projects", {
    headers: {
      "Authorization": `Bearer ${VERCEL_TOKEN}`,
    }
  });

  const data = await response.json();

  if (response.ok) {
    // Find ai-api-price project
    const project = data.projects?.find((p: any) => p.name === "ai-api-price");
    if (project) {
      console.log(`   Found project: ${project.id}`);
      return project.id;
    }
  }

  console.log("   ⚠️  Could not find project");
  return null;
}

// ============================================
// Step 3: Configure Vercel Environment Variables
// ============================================
async function configureEnvVars(projectId: string) {
  console.log("\n⚙️  Step 3: Configuring Vercel environment variables...\n");

  const supabaseUrl = `https://${SUPABASE_REF}.supabase.co`;

  const envVars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", value: supabaseUrl },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: SUPABASE_TOKEN },
    { key: "SUPABASE_SERVICE_ROLE_KEY", value: SUPABASE_TOKEN },
  ];

  for (const env of envVars) {
    console.log(`   Setting ${env.key}...`);

    const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: env.key,
        value: env.value,
        type: "encrypted",
        target: ["production", "preview", "development"],
      }),
    });

    if (response.ok) {
      console.log(`        ✅ OK`);
    } else {
      const error = await response.text();
      console.log(`        ⚠️  ${response.status}`);
    }
  }
}

// ============================================
// Step 4: Trigger Vercel Deployment
// ============================================
async function triggerDeployment(projectId: string) {
  console.log("\n🚀 Step 4: Triggering Vercel deployment...\n");

  const response = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project: projectId,
      target: "production",
      gitSource: {
        type: "github",
        ref: "main",
        repoId: "rainbow686/ai-api-price"
      }
    }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log(`   ✅ Deployment triggered`);
    console.log(`   URL: https://${data.url}`);
    console.log(`   Dashboard: https://vercel.com/rainbow686/ai-api-price/deployments`);
    return { success: true, url: data.url };
  } else {
    console.log(`   ⚠️  ${data.message || response.statusText}`);
    console.log(`   Manual deploy: https://vercel.com/rainbow686/ai-api-price`);
    return { success: false };
  }
}

// ============================================
// Main
// ============================================
async function main() {
  // Step 1: Migration
  await runMigration();

  // Step 2: Get Vercel project
  const projectId = await getVercelProjectId();

  if (projectId) {
    // Step 3: Configure env vars
    await configureEnvVars(projectId);

    // Step 4: Deploy
    await triggerDeployment(projectId);
  } else {
    console.log("\n⚠️  Skipping Vercel configuration (project not found)");
    console.log("   Go to https://vercel.com/rainbow686/ai-api-price to configure manually");
  }

  console.log("\n" + "=".repeat(60));
  console.log("📋 CONFIGURATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Supabase: https://${SUPABASE_REF}.supabase.co`);
  console.log(`   Dashboard: https://app.supabase.com/project/${SUPABASE_REF}`);
  console.log(`✅ Vercel:   https://vercel.com/rainbow686/ai-api-price`);

  console.log("\n🎉 Setup complete!\n");
  console.log("Next steps:");
  console.log("1. Add provider API keys (OpenAI, Anthropic, Google) in Supabase");
  console.log("2. Configure Resend API key for email alerts");
  console.log("3. Test the gateway endpoint");
}

main().catch(console.error);
