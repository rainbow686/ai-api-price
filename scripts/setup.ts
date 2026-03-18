#!/usr/bin/env bun
/**
 * AI Cost Optimizer - Automated Setup Script
 *
 * This script automates:
 * 1. GitHub repository creation
 * 2. Supabase project setup
 * 3. Vercel project deployment
 */

import { $ } from "bun";
import { writeFile, mkdir, existsSync } from "fs/promises";
import { join } from "path";

const PROJECT_DIR = "/Users/sunbin/myclaude/ai-api-price";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const SUPABASE_TOKEN = process.env.SUPABASE_TOKEN;

console.log("🚀 AI Cost Optimizer - Automated Setup\n");

// Step 1: Check authentication
async function checkAuth() {
  console.log("📝 Checking authentication...");

  if (!GITHUB_TOKEN) {
    console.log("⚠️  GITHUB_TOKEN not set. You'll need to create a token at: https://github.com/settings/tokens");
  } else {
    console.log("✅ GitHub token found");
  }

  if (!VERCEL_TOKEN) {
    console.log("⚠️  VERCEL_TOKEN not set. You'll need to create a token at: https://vercel.com/account/tokens");
  } else {
    console.log("✅ Vercel token found");
  }

  if (!SUPABASE_TOKEN) {
    console.log("⚠️  SUPABASE_TOKEN not set. You'll need to get it from: https://app.supabase.com/account/tokens");
  } else {
    console.log("✅ Supabase token found");
  }
}

// Step 2: Initialize Git repository
async function initGit() {
  console.log("\n📁 Initializing Git repository...");

  try {
    await $`git init`.cwd(PROJECT_DIR);
    console.log("✅ Git initialized");
  } catch (e) {
    console.log("⚠️  Git may already be initialized or error occurred");
  }
}

// Step 3: Create GitHub repository
async function createGitHubRepo() {
  console.log("\n🐙 Creating GitHub repository...");

  if (!GITHUB_TOKEN) {
    console.log("⚠️  Skipping - no GitHub token");
    return null;
  }

  const repoName = "ai-api-price";

  try {
    const response = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: repoName,
        description: "AI Cost Optimizer - Real-time AI API cost tracking and budget management",
        private: false,
        auto_init: false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Repository created: ${data.html_url}`);
      return data;
    } else if (response.status === 422) {
      console.log("⚠️  Repository already exists");
      return { html_url: `https://github.com/${GITHUB_TOKEN.split(':')[0]}/${repoName}` };
    } else {
      console.error(`❌ Failed to create repo: ${response.statusText}`);
      return null;
    }
  } catch (e) {
    console.error(`❌ Error: ${e}`);
    return null;
  }
}

// Step 4: Push code to GitHub
async function pushToGithub(repoUrl: string) {
  console.log("\n📤 Pushing code to GitHub...");

  try {
    // Add remote
    await $`git remote remove origin`.cwd(PROJECT_DIR).nothrow();
    await $`git remote add origin ${repoUrl}`.cwd(PROJECT_DIR);

    // Add all files
    await $`git add .`.cwd(PROJECT_DIR);

    // Create commit
    await $`git commit -m "Initial commit: AI Cost Optimizer MVP"`.cwd(PROJECT_DIR).nothrow();

    // Push to main
    await $`git push -u origin main`.cwd(PROJECT_DIR);

    console.log("✅ Code pushed to GitHub");
  } catch (e) {
    console.log(`⚠️  Push may have issues: ${e}`);
  }
}

// Step 5: Create Supabase project
async function createSupabaseProject() {
  console.log("\n🗄️  Setting up Supabase...");

  if (!SUPABASE_TOKEN) {
    console.log("⚠️  Skipping - no Supabase token");
    console.log("📋 Manual setup instructions:");
    console.log("   1. Go to https://supabase.com");
    console.log("   2. Create a new project");
    console.log("   3. Run the SQL migration from: supabase/migrations/001_initial_schema.sql");
    return null;
  }

  // Supabase project creation via API
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
        db_pass: "SecurePassword123!", // Should be randomized
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Supabase project created: ${data.id}`);
      return data;
    } else {
      console.log(`⚠️  Supabase API: ${response.statusText}`);
      return null;
    }
  } catch (e) {
    console.log(`⚠️  Supabase setup error: ${e}`);
    return null;
  }
}

// Step 6: Create Vercel project
async function createVercelProject() {
  console.log("\n▲ Setting up Vercel...");

  if (!VERCEL_TOKEN) {
    console.log("⚠️  Skipping - no Vercel token");
    console.log("📋 Manual setup instructions:");
    console.log("   1. Go to https://vercel.com/new");
    console.log("   2. Import your GitHub repository");
    console.log("   3. Configure environment variables");
    return null;
  }

  try {
    const response = await fetch("https://api.vercel.com/v9/projects", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "ai-cost-optimizer",
        gitRepository: {
          type: "github",
          repo: "ai-api-price",
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Vercel project created: ${data.name}`);
      console.log(`   Dashboard: https://vercel.com/${data.owner.username}/${data.name}`);
      return data;
    } else {
      const error = await response.text();
      console.log(`⚠️  Vercel API: ${response.statusText} - ${error}`);
      return null;
    }
  } catch (e) {
    console.log(`⚠️  Vercel setup error: ${e}`);
    return null;
  }
}

// Step 7: Create .env.example file
async function createEnvExample() {
  console.log("\n📝 Creating .env.example...");

  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Provider API Keys (optional - can be set per-user)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Email Service (for budget alerts)
RESEND_API_KEY=re_...
`;

  await writeFile(join(PROJECT_DIR, ".env.example"), envContent);
  console.log("✅ .env.example created");
}

// Main execution
async function main() {
  await checkAuth();
  await createEnvExample();

  const repo = await createGitHubRepo();

  if (repo) {
    await pushToGithub(repo.html_url);
  }

  const supabase = await createSupabaseProject();
  const vercel = await createVercelProject();

  console.log("\n" + "=".repeat(50));
  console.log("📋 SETUP SUMMARY");
  console.log("=".repeat(50));

  if (repo) {
    console.log(`✅ GitHub: ${repo.html_url}`);
  } else {
    console.log("❌ GitHub: Not configured");
  }

  if (supabase) {
    console.log(`✅ Supabase: ${supabase.id || supabase.name}`);
  } else {
    console.log("❌ Supabase: Manual setup required");
  }

  if (vercel) {
    console.log(`✅ Vercel: https://vercel.com/${vercel.owner?.username || 'dashboard'}/${vercel.name}`);
  } else {
    console.log("❌ Vercel: Manual setup required");
  }

  console.log("\n📚 Next steps:");
  console.log("   1. Set up environment variables in Vercel dashboard");
  console.log("   2. Run Supabase migration: supabase/migrations/001_initial_schema.sql");
  console.log("   3. Configure your provider API keys");
  console.log("\n🎉 Setup complete!\n");
}

main().catch(console.error);
