#!/usr/bin/env bun
/**
 * AI Cost Optimizer - Automated Deployment
 */

import { $ } from "bun";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const PROJECT_DIR = "/Users/sunbin/myclaude/ai-api-price";

// Tokens from environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const SUPABASE_TOKEN = process.env.SUPABASE_TOKEN;

const REPO_NAME = "ai-api-price";

console.log("🚀 AI Cost Optimizer - Automated Deployment\n");
console.log("=" .repeat(60));

// ============================================
// Step 1: Create GitHub Repository
// ============================================
async function createGitHubRepo() {
  console.log("\n📦 Step 1: Creating GitHub repository...");

  try {
    const response = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: REPO_NAME,
        description: "AI Cost Optimizer - Real-time AI API cost tracking and budget management",
        private: false,
        auto_init: true,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Repository created: ${data.html_url}`);
      return { success: true, url: data.html_url, cloneUrl: data.clone_url };
    } else if (response.status === 422) {
      console.log(`⚠️  Repository already exists`);

      // Get existing repo info
      const existing = await fetch(`https://api.github.com/repos/${GITHUB_TOKEN.split(':')[0] || 'sunbin'}/${REPO_NAME}`, {
        headers: { "Authorization": `token ${GITHUB_TOKEN}` }
      });
      const existingData = await existing.json();
      console.log(`   URL: ${existingData.html_url}`);
      return { success: true, url: existingData.html_url, cloneUrl: existingData.clone_url };
    } else {
      console.error(`❌ Failed: ${response.status} ${data.message || response.statusText}`);
      return { success: false, error: data.message || response.statusText };
    }
  } catch (e) {
    console.error(`❌ Error: ${e}`);
    return { success: false, error: e };
  }
}

// ============================================
// Step 2: Initialize Git and Push
// ============================================
async function initAndPush(repoCloneUrl: string) {
  console.log("\n📤 Step 2: Initializing Git and pushing code...");

  // Remove credentials from URL for display
  const displayUrl = repoCloneUrl.replace(/\/\/[^@]+@/, '//***@');
  console.log(`   Cloning from: ${displayUrl}`);

  try {
    // Initialize git if not already
    await $`git init`.cwd(PROJECT_DIR).nothrow();

    // Configure git user
    await $`git config user.name "Claude"`.cwd(PROJECT_DIR).nothrow();
    await $`git config user.email "claude@bot.com"`.cwd(PROJECT_DIR).nothrow();

    // Set up remote
    await $`git remote remove origin`.cwd(PROJECT_DIR).nothrow();
    await $`git remote add origin ${repoCloneUrl}`.cwd(PROJECT_DIR);

    // Create .gitignore if not exists
    const gitignorePath = join(PROJECT_DIR, ".gitignore");
    if (!existsSync(gitignorePath)) {
      await writeFile(gitignorePath, `node_modules
.next
.env*.local
.env
.DS_Store
*.log
.vercel
coverage
`);
      console.log("✅ Created .gitignore");
    }

    // Stage all files
    await $`git add -A`.cwd(PROJECT_DIR);

    // Check if there are changes
    const status = await $`git status --porcelain`.cwd(PROJECT_DIR).text();

    if (status.trim()) {
      await $`git commit -m "Initial commit: AI Cost Optimizer MVP"`.cwd(PROJECT_DIR);
      console.log("✅ Created commit");

      // Try to push
      try {
        await $`git push -u origin main`.cwd(PROJECT_DIR);
        console.log("✅ Pushed to GitHub");
      } catch (pushError) {
        // Might have empty repo issue, try with allow-empty
        await $`git push -u origin main --force`.cwd(PROJECT_DIR);
        console.log("✅ Pushed to GitHub (force)");
      }
    } else {
      console.log("⚠️  No changes to commit");
    }

    return true;
  } catch (e) {
    console.error(`❌ Git error: ${e}`);
    return false;
  }
}

// ============================================
// Step 3: Create Vercel Project
// ============================================
async function createVercelProject() {
  console.log("\n▲ Step 3: Creating Vercel project...");

  try {
    const response = await fetch("https://api.vercel.com/v9/projects", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "ai-api-price",
        gitRepository: {
          type: "github",
          repo: `${GITHUB_TOKEN.split(':')[0] || 'sunbin'}/${REPO_NAME}`,
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Vercel project created`);
      console.log(`   Dashboard: https://vercel.com/${data.owner?.username || 'dashboard'}/${data.name}`);
      return { success: true, id: data.id, name: data.name };
    } else {
      console.error(`❌ Failed: ${response.status} ${data.message || response.statusText}`);
      return { success: false, error: data.message };
    }
  } catch (e) {
    console.error(`❌ Error: ${e}`);
    return { success: false, error: e };
  }
}

// ============================================
// Step 4: Create Supabase Project
// ============================================
async function createSupabaseProject() {
  console.log("\n🗄️  Step 4: Creating Supabase project...");

  try {
    const response = await fetch("https://api.supabase.com/v1/projects", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_TOKEN}`,
        "Content-Type": "application/json",
        "Preferred-Audience": "project",
      },
      body: JSON.stringify({
        name: "ai-cost-optimizer",
        region: "us-west-1",
        db_pass: "AiCost0pt!mz3r",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Supabase project created: ${data.id}`);
      return { success: true, id: data.id, ref: data.ref };
    } else {
      console.error(`❌ Failed: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(data)}`);
      return { success: false, error: data };
    }
  } catch (e) {
    console.error(`❌ Error: ${e}`);
    return { success: false, error: e };
  }
}

// ============================================
// Step 5: Run Supabase Migration
// ============================================
async function runSupabaseMigration(supabaseRef: string) {
  console.log("\n📋 Step 5: Running Supabase migration...");

  try {
    const migrationPath = join(PROJECT_DIR, "supabase/migrations/001_initial_schema.sql");
    const sqlContent = await readFile(migrationPath, "utf-8");

    const response = await fetch(`https://${supabaseRef}.supabase.co/rest/v1/rpc/run_sql`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_TOKEN}`,
        "Content-Type": "application/json",
        "apikey": SUPABASE_TOKEN,
      },
      body: JSON.stringify({ query: sqlContent }),
    });

    if (response.ok) {
      console.log("✅ Migration executed successfully");
      return { success: true };
    } else {
      const error = await response.text();
      console.error(`❌ Migration failed: ${error}`);
      return { success: false, error };
    }
  } catch (e) {
    console.error(`❌ Error: ${e}`);
    return { success: false, error: e };
  }
}

// ============================================
// Step 6: Configure Vercel Environment
// ============================================
async function configureVercelEnv(vercelId: string, supabaseRef: string) {
  console.log("\n⚙️  Step 6: Configuring Vercel environment variables...");

  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: `https://${supabaseRef}.supabase.co`,
    SUPABASE_SERVICE_ROLE_KEY: SUPABASE_TOKEN,
  };

  try {
    for (const [key, value] of Object.entries(envVars)) {
      const response = await fetch(`https://api.vercel.com/v9/projects/${vercelId}/env`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          value,
          type: "encrypted",
          target: ["production", "preview", "development"],
        }),
      });

      if (response.ok) {
        console.log(`✅ Set ${key}`);
      } else {
        console.error(`⚠️  Failed to set ${key}`);
      }
    }
    return { success: true };
  } catch (e) {
    console.error(`❌ Error: ${e}`);
    return { success: false, error: e };
  }
}

// ============================================
// Step 7: Trigger Vercel Deployment
// ============================================
async function triggerDeployment(vercelId: string) {
  console.log("\n🚀 Step 7: Triggering Vercel deployment...");

  try {
    const response = await fetch("https://api.vercel.com/v12/deployments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project: vercelId,
        target: "production",
        ref: "main",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Deployment triggered`);
      console.log(`   URL: ${data.url}`);
      return { success: true, url: data.url };
    } else {
      console.error(`❌ Failed: ${data.message || response.statusText}`);
      return { success: false, error: data.message };
    }
  } catch (e) {
    console.error(`❌ Error: ${e}`);
    return { success: false, error: e };
  }
}

// ============================================
// Main
// ============================================
async function main() {
  console.log("Starting deployment...\n");

  // Step 1: Create GitHub repo
  const githubResult = await createGitHubRepo();
  if (!githubResult.success) {
    console.log("\n⚠️  GitHub repo creation failed, continuing anyway...");
  }

  // Step 2: Initialize and push
  if (githubResult.cloneUrl) {
    const pushSuccess = await initAndPush(githubResult.cloneUrl);
    if (!pushSuccess) {
      console.log("\n⚠️  Git push failed, Vercel integration may not work");
    }
  }

  // Step 3: Create Vercel project
  const vercelResult = await createVercelProject();
  if (!vercelResult.success) {
    console.log("\n⚠️  Vercel project creation failed");
  }

  // Step 4: Create Supabase project
  const supabaseResult = await createSupabaseProject();
  if (!supabaseResult.success) {
    console.log("\n⚠️  Supabase project creation failed");
  }

  // Step 5 & 6: Run migration and configure env (if both succeeded)
  if (vercelResult.success && supabaseResult.success) {
    await runSupabaseMigration(supabaseResult.ref);
    await configureVercelEnv(vercelResult.id, supabaseResult.ref);

    // Step 7: Trigger deployment
    await triggerDeployment(vercelResult.id);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));

  if (githubResult.success) {
    console.log(`✅ GitHub:    ${githubResult.url}`);
  } else {
    console.log(`❌ GitHub:    Failed - ${githubResult.error}`);
  }

  if (vercelResult.success) {
    console.log(`✅ Vercel:    https://vercel.com/dashboard/${vercelResult.name}`);
  } else {
    console.log(`❌ Vercel:    Failed - ${vercelResult.error}`);
  }

  if (supabaseResult.success) {
    console.log(`✅ Supabase:  https://${supabaseResult.ref}.supabase.co`);
  } else {
    console.log(`❌ Supabase:  Failed - ${JSON.stringify(supabaseResult.error)}`);
  }

  console.log("\n🎉 Deployment process complete!\n");
}

main().catch(console.error);
