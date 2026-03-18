#!/usr/bin/env bun
/**
 * Commit and push deployment status to GitHub
 */

import { $ } from "bun";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_URL = `https://${GITHUB_TOKEN}@github.com/rainbow686/ai-api-price.git`;

async function commitAndPush() {
  console.log("📤 Committing deployment status to GitHub...\n");

  try {
    // Add file
    await $`git add DEPLOYMENT_STATUS.md scripts/`.cwd("/Users/sunbin/myclaude/ai-api-price");

    // Commit
    await $`git commit -m "Add deployment scripts and status"`.cwd("/Users/sunbin/myclaude/ai-api-price");

    // Push
    await $`git push ${REPO_URL} main`.cwd("/Users/sunbin/myclaude/ai-api-price");

    console.log("✅ Deployment status committed and pushed!\n");
  } catch (e) {
    console.log("⚠️  Git operation skipped or failed:", e.message);
  }
}

commitAndPush().catch(console.error);
