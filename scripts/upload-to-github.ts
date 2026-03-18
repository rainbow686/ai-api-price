#!/usr/bin/env bun
/**
 * Upload local files to GitHub via API
 */

import { readFile, readdir } from "fs/promises";
import { join } from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "rainbow686";
const REPO = "ai-api-price";
const PROJECT_DIR = "/Users/sunbin/myclaude/ai-api-price";

async function getFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
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

async function uploadFile(path: string, content: string, message: string) {
  const relativePath = path.replace(PROJECT_DIR + '/', '');

  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${relativePath}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
    }),
  });

  return response.ok;
}

async function main() {
  console.log("📤 Uploading files to GitHub...\n");

  const files = await getFiles(PROJECT_DIR);

  // Filter for specific files to upload
  const filesToUpload = files.filter(f => {
    const rel = f.replace(PROJECT_DIR + '/', '');
    return rel.startsWith('scripts/') ||
           rel.endsWith('DEPLOYMENT_STATUS.md') ||
           rel.endsWith('SETUP_COMPLETE.md');
  });

  console.log(`Found ${filesToUpload.length} files to upload:\n`);

  for (const file of filesToUpload) {
    const rel = file.replace(PROJECT_DIR + '/', '');
    console.log(`   - ${rel}`);
  }

  console.log("");

  for (const file of filesToUpload) {
    const rel = file.replace(PROJECT_DIR + '/', '');
    try {
      const content = await readFile(file, 'utf-8');
      const success = await uploadFile(file, content, `Add ${rel}`);
      console.log(`${success ? '✅' : '❌'} ${rel}`);
    } catch (e) {
      console.log(`❌ ${rel}: ${e.message}`);
    }
  }

  console.log("\n✅ Upload complete!\n");
  console.log(`View at: https://github.com/${OWNER}/${REPO}`);
}

main().catch(console.error);
