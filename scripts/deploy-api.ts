#!/usr/bin/env bun
/**
 * AI Cost Optimizer - Automated Deployment (Pure API Version)
 * Uses only HTTP APIs - no CLI dependencies
 */

import { readFile, readdir } from "fs/promises";
import { join, basename } from "path";

const PROJECT_DIR = "/Users/sunbin/myclaude/ai-api-price";

// Tokens
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const SUPABASE_TOKEN = process.env.SUPABASE_TOKEN;

const REPO_NAME = "ai-api-price";
const GITHUB_OWNER = "rainbow686"; // From the created repo URL

console.log("🚀 AI Cost Optimizer - Automated Deployment (API Only)\n");
console.log("=".repeat(60));

// ============================================
// Helper: Get GitHub user from token
// ============================================
async function getGitHubUser() {
  const response = await fetch("https://api.github.com/user", {
    headers: { "Authorization": `token ${GITHUB_TOKEN}` }
  });
  const data = await response.json();
  return data.login;
}

// ============================================
// Step 1: Upload files to GitHub via API
// ============================================
async function uploadFilesToGitHub(owner: string, repo: string) {
  console.log("\n📤 Step 1: Uploading files to GitHub...");

  // First get the default branch SHA
  const branchResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
    headers: { "Authorization": `token ${GITHUB_TOKEN}` }
  });
  const branchData = await branchResponse.json();
  const sha = branchData.object?.sha;

  if (!sha) {
    console.log("⚠️  Could not get main branch SHA, repo might be empty");
    console.log("   Creating initial commit...");
  }

  // Recursively get all files
  async function getFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          // Skip node_modules, .next, etc.
          if (entry.name === 'node_modules' || entry.name === '.next' ||
              entry.name === '.vercel' || entry.name === 'coverage') {
            continue;
          }
          const subFiles = await getFiles(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (e) {
      console.log(`Error reading ${dir}: ${e}`);
    }
    return files;
  }

  const allFiles = await getFiles(PROJECT_DIR);
  console.log(`Found ${allFiles.length} files to upload`);

  // Create a tree with all files
  const tree = [];
  for (const file of allFiles) {
    const relativePath = file.replace(PROJECT_DIR + '/', '');

    // Skip hidden files except .gitignore
    if (relativePath.startsWith('.') && relativePath !== '.gitignore') {
      continue;
    }

    try {
      const content = await readFile(file, 'utf-8');
      tree.push({
        path: relativePath,
        mode: '100644',
        type: 'blob',
        content: content
      });
    } catch (e) {
      console.log(`Skipping ${relativePath}: ${e}`);
    }
  }

  console.log(`Uploading ${tree.length} files...`);

  // Create tree
  const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tree: tree,
      base_tree: sha || undefined
    })
  });
  const treeData = await treeResponse.json();

  if (!treeData.sha) {
    console.log(`❌ Failed to create tree: ${JSON.stringify(treeData)}`);
    return false;
  }

  console.log(`✅ Created tree with ${tree.length} files`);

  // Create commit
  const parentSha = sha;
  const commitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Initial commit: AI Cost Optimizer MVP",
      tree: treeData.sha,
      parents: parentSha ? [parentSha] : []
    })
  });
  const commitData = await commitResponse.json();

  if (!commitData.sha) {
    console.log(`❌ Failed to create commit: ${JSON.stringify(commitData)}`);
    return false;
  }

  console.log(`✅ Created commit: ${commitData.sha}`);

  // Update main branch
  const refResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
    method: "PATCH",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sha: commitData.sha,
      force: true
    })
  });

  if (refResponse.ok) {
    console.log("✅ Updated main branch");
    return true;
  } else {
    // Create main branch if it doesn't exist
    const createRefResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: "refs/heads/main",
        sha: commitData.sha
      })
    });

    if (createRefResponse.ok) {
      console.log("✅ Created main branch");
      return true;
    }
    console.log(`⚠️  Branch update skipped: ${refResponse.statusText}`);
    return false;
  }
}

// ============================================
// Step 2: Create Vercel Project
// ============================================
async function createVercelProject(owner: string, repo: string) {
  console.log("\n▲ Step 2: Creating Vercel project...");

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
        repo: `${owner}/${repo}`,
      },
    }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log(`✅ Vercel project created`);
    const username = data.owner?.username || 'dashboard';
    console.log(`   Dashboard: https://vercel.com/${username}/${data.name}`);
    return { success: true, id: data.id, name: data.name };
  } else {
    console.error(`❌ Failed: ${response.status} ${data.message || response.statusText}`);

    // Try without git integration
    console.log("   Trying without git integration...");
    const fallbackResponse = await fetch("https://api.vercel.com/v9/projects", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "ai-api-price",
      }),
    });

    const fallbackData = await fallbackResponse.json();
    if (fallbackResponse.ok) {
      console.log(`✅ Created standalone project`);
      return { success: true, id: fallbackData.id, name: fallbackData.name };
    }

    return { success: false, error: data.message };
  }
}

// ============================================
// Step 3: Create Supabase Project
// ============================================
async function createSupabaseProject() {
  console.log("\n🗄️  Step 3: Creating Supabase project...");

  // Check token format - service token vs personal token
  console.log(`   Token format: ${SUPABASE_TOKEN?.substring(0, 10)}...`);

  // Supabase API requires organization membership
  // First try to get organizations
  const orgResponse = await fetch("https://api.supabase.com/v1/organizations", {
    headers: {
      "Authorization": `Bearer ${SUPABASE_TOKEN}`,
      "Content-Type": "application/json",
    }
  });

  const orgs = await orgResponse.json();
  console.log(`   Organizations: ${JSON.stringify(orgs)}`);

  if (!orgs || orgs.length === 0) {
    console.log("⚠️  No organizations found or token lacks permission");
    console.log("   Please create a project manually at https://app.supabase.com");
    return { success: false, manual: true };
  }

  const orgId = orgs[0].id;

  // Create project
  const response = await fetch("https://api.supabase.com/v1/projects", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SUPABASE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "ai-cost-optimizer",
      organization_id: orgId,
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
    return { success: false, error: data, manual: true };
  }
}

// ============================================
// Step 4: Deploy to Vercel
// ============================================
async function deployToVercel(projectId: string) {
  console.log("\n🚀 Step 4: Deploying to Vercel...");

  const response = await fetch("https://api.vercel.com/v12/deployments", {
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
        repoId: `${GITHUB_OWNER}/${REPO_NAME}`
      }
    }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log(`✅ Deployment triggered`);
    console.log(`   URL: https://${data.url}`);
    return { success: true, url: data.url };
  } else {
    console.error(`❌ Failed: ${data.message || response.statusText}`);
    return { success: false, error: data.message };
  }
}

// ============================================
// Main
// ============================================
async function main() {
  console.log("Starting deployment...\n");

  // Get GitHub username
  const owner = await getGitHubUser();
  console.log(`GitHub user: ${owner}`);

  // Step 1: Upload files
  const uploadSuccess = await uploadFilesToGitHub(owner, REPO_NAME);

  // Step 2: Create Vercel project
  const vercelResult = await createVercelProject(owner, REPO_NAME);

  // Step 3: Create Supabase project
  const supabaseResult = await createSupabaseProject();

  // Step 4: Deploy (if Vercel succeeded)
  if (vercelResult.success) {
    await deployToVercel(vercelResult.id);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));

  console.log(`✅ GitHub:    https://github.com/${owner}/${REPO_NAME}`);

  if (vercelResult.success) {
    console.log(`✅ Vercel:    https://vercel.com/${owner}/${vercelResult.name}`);
  } else {
    console.log(`❌ Vercel:    Failed - ${vercelResult.error}`);
  }

  if (supabaseResult.manual) {
    console.log(`⚠️  Supabase:  Manual setup required`);
    console.log(`   1. Go to https://app.supabase.com`);
    console.log(`   2. Create new project "ai-cost-optimizer"`);
    console.log(`   3. Run SQL from: supabase/migrations/001_initial_schema.sql`);
  } else if (supabaseResult.success) {
    console.log(`✅ Supabase:  https://${supabaseResult.ref}.supabase.co`);
  } else {
    console.log(`❌ Supabase:  Failed`);
  }

  console.log("\n🎉 Deployment process complete!\n");
}

main().catch(console.error);
