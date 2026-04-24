/**
 * One-shot import: `app/data/state_laws.json` → Supabase `state_laws`.
 *
 * Prerequisites in `.env.local` (or env):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - OPENAI_API_KEY (for text-embedding-3-small, 1536-d)
 *
 * Run from repo root:
 *   npx tsx script/import-laws.ts
 *   npx tsx script/import-laws.ts --skip-embed   # rows only, no vectors
 *
 * If upserts fail on `key_clauses`, run `script/sql/state_laws_add_key_clauses.sql` in the Supabase SQL Editor.
 *
 * Expected table (you already have this):
 *   state_laws (
 *     id uuid primary key default gen_random_uuid(),
 *     state_code text unique not null,
 *     state_name text not null,
 *     content text not null,
 *     key_clauses jsonb not null default '{}',
 *     embedding vector(1536)
 *   );
 */

import { readFileSync, existsSync } from "fs"
import path from "path"

import { createServiceRoleSupabase } from "../app/lib/supabase-service"
import {
  buildStateLawImportPayload,
  embedStateLawContent,
} from "../app/lib/rag"

function parseEnvLines(raw: string, overrideExisting: boolean): void {
  for (let line of raw.split("\n")) {
    line = line.replace(/\r$/, "")
    let s = line.trim()
    if (!s || s.startsWith("#")) continue
    if (s.startsWith("export ")) s = s.slice(7).trim()
    const i = s.indexOf("=")
    if (i <= 0) continue
    const key = s.slice(0, i).trim()
    let val = s.slice(i + 1).trim()
    const hash = val.search(/\s+#/)
    if (hash !== -1 && !/^["']/.test(val)) {
      val = val.slice(0, hash).trim()
    }
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (overrideExisting || process.env[key] === undefined) {
      process.env[key] = val
    }
  }
}

/** Mimic Next: `.env` then `.env.local` (local wins for same keys). */
function loadProjectEnvFiles(): void {
  const root = process.cwd()
  const envPath = path.join(root, ".env")
  const localPath = path.join(root, ".env.local")
  if (existsSync(envPath)) {
    parseEnvLines(readFileSync(envPath, "utf8"), false)
  }
  if (existsSync(localPath)) {
    parseEnvLines(readFileSync(localPath, "utf8"), true)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function assertStateLawsKeyClausesColumn(
  supabase: ReturnType<typeof createServiceRoleSupabase>
): Promise<void> {
  const { error } = await supabase.from("state_laws").select("key_clauses").limit(1)
  if (!error) return
  const msg = error.message ?? String(error)
  const sqlRel = "script/sql/state_laws_add_key_clauses.sql"
  const sqlPath = path.join(process.cwd(), sqlRel)
  if (
    msg.includes("key_clauses") ||
    msg.toLowerCase().includes("schema cache")
  ) {
    console.error(
      "[import-laws] Column `key_clauses` is not exposed on `state_laws` (missing column or stale API schema).\n\n" +
        "Fix:\n" +
        `  1. Supabase → SQL Editor → run the file: ${sqlRel}\n` +
        `     (full path: ${sqlPath})\n` +
        "  2. Wait ~10–60s for the API schema to refresh, then rerun `npm run import-laws`.\n"
    )
    process.exit(1)
  }
  console.error("[import-laws] Could not read state_laws.key_clauses:", msg)
  process.exit(1)
}

type LawsFile = {
  jurisdictions?: Record<string, unknown>[]
}

async function main(): Promise<void> {
  loadProjectEnvFiles()
  if (
    !existsSync(path.join(process.cwd(), ".env.local")) &&
    !existsSync(path.join(process.cwd(), ".env"))
  ) {
    console.warn(
      "[import-laws] No .env or .env.local in project root — using process env only."
    )
  }

  const skipEmbed = process.argv.includes("--skip-embed")
  const jsonPath = path.join(process.cwd(), "app/data/state_laws.json")
  if (!existsSync(jsonPath)) {
    console.error("[import-laws] Missing file:", jsonPath)
    process.exit(1)
  }

  const raw = JSON.parse(readFileSync(jsonPath, "utf8")) as LawsFile
  const jurisdictions = raw.jurisdictions
  if (!Array.isArray(jurisdictions)) {
    console.error("[import-laws] Invalid JSON: expected jurisdictions[]")
    process.exit(1)
  }

  const supabase = createServiceRoleSupabase()
  await assertStateLawsKeyClausesColumn(supabase)

  let ok = 0
  let fail = 0

  console.log("[import-laws] Upserting", jurisdictions.length, "jurisdictions…")

  for (const entry of jurisdictions) {
    if (!entry || typeof entry !== "object") continue
    const row = entry as Record<string, unknown>
    try {
      const payload = buildStateLawImportPayload(row)
      const { error } = await supabase.from("state_laws").upsert(
        {
          state_code: payload.state_code,
          state_name: payload.state_name,
          content: payload.content,
          key_clauses: payload.key_clauses,
        },
        { onConflict: "state_code" }
      )
      if (error) {
        console.error("[import-laws] upsert", payload.state_code, error.message)
        fail++
        continue
      }
      ok++
      console.log("[import-laws] upsert ok", payload.state_code, payload.state_name)
    } catch (e) {
      console.error("[import-laws] row error", e)
      fail++
    }
  }

  console.log("[import-laws] Upsert done. ok=", ok, "fail=", fail)

  if (skipEmbed) {
    console.log("[import-laws] --skip-embed: skipping OpenAI embeddings.")
    process.exit(fail > 0 ? 1 : 0)
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.warn(
      "[import-laws] OPENAI_API_KEY missing — skip embedding pass. Run again with key set."
    )
    process.exit(fail > 0 ? 1 : 0)
  }

  console.log("[import-laws] Embedding pass (text-embedding-3-small, 1536)…")

  for (const entry of jurisdictions) {
    if (!entry || typeof entry !== "object") continue
    const row = entry as Record<string, unknown>
    let code: string
    try {
      code = buildStateLawImportPayload(row).state_code
    } catch {
      continue
    }

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from("state_laws")
        .select("content")
        .eq("state_code", code)
        .maybeSingle()

      if (fetchErr || !existing?.content) {
        console.warn("[import-laws] skip embed, no content for", code, fetchErr?.message)
        continue
      }

      const content = existing.content as string
      const vector = await embedStateLawContent(content)

      const { error: upErr } = await supabase
        .from("state_laws")
        .update({ embedding: vector })
        .eq("state_code", code)

      if (upErr) {
        console.error("[import-laws] embed update failed", code, upErr.message)
        fail++
      } else {
        console.log("[import-laws] embedded", code, "dim=", vector.length)
      }
    } catch (e) {
      console.error("[import-laws] embed error", code, e)
      fail++
    }

    await sleep(120)
  }

  console.log("[import-laws] Finished.")
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error("[import-laws] fatal", e)
  process.exit(1)
})
