// Modified by LocalPitch, 2026
// Install docs/localpitch/roles/*.md as account skills, except the main assistant
// (that file is the Grana bot's instructions).

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const rolesDir = join(here, "../roles");

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Set ${name}`);
  return value;
}

function originOf(value) {
  const url = new URL(value);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !local) throw new Error("AGENT_ORIGIN must be https");
  return url.origin;
}

function skillName(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  const name = match?.[1]?.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  if (!name) throw new Error("Role file is missing a name");
  return name.replace(/^["']|["']$/g, "");
}

async function rpc(origin, cookie, path, input) {
  const response = await fetch(new URL(`/rpc/${path}`, origin), {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ json: input ?? {} }),
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!response.ok) {
    const detail = typeof body === "string" ? body : JSON.stringify(body);
    throw new Error(`${path} failed (${response.status}): ${detail.slice(0, 400)}`);
  }
  return body && typeof body === "object" && "json" in body ? body.json : body;
}

async function main() {
  const origin = originOf(required("AGENT_ORIGIN"));
  const cookie = required("SESSION_COOKIE");
  const existing = await rpc(origin, cookie, "agentSkills/list", {});
  const names = new Set(
    (Array.isArray(existing) ? existing : []).map((skill) => String(skill.name).toLowerCase()),
  );
  const files = readdirSync(rolesDir)
    .filter((name) => name.endsWith(".md") && name !== "main-assistant.md")
    .sort();
  for (const file of files) {
    const content = readFileSync(join(rolesDir, file), "utf8");
    const name = skillName(content);
    if (names.has(name.toLowerCase())) {
      console.log(`Skill ${name} already exists.`);
      continue;
    }
    await rpc(origin, cookie, "agentSkills/create", { content });
    console.log(`Installed skill ${name}.`);
  }
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Install failed");
    process.exit(1);
  });
}
