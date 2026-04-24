import { NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"

const SITE = "https://accidental-lease-ai.com"

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

type UrlEntry = {
  loc: string
  lastmod?: string
  priority?: number
}

async function getLastmodFromFile(absPath: string): Promise<string | undefined> {
  try {
    const st = await fs.stat(absPath)
    return st.mtime.toISOString()
  } catch {
    return undefined
  }
}

async function generateSitemap(): Promise<string> {
  const now = new Date()
  const staticLastmod = now.toISOString().slice(0, 10)

  const core: UrlEntry[] = [
    { loc: `${SITE}/`, priority: 1.0, lastmod: staticLastmod },
    { loc: `${SITE}/accidental-landlord-guide`, priority: 0.9, lastmod: staticLastmod },
    { loc: `${SITE}/landlord-tenant-laws`, priority: 0.9, lastmod: staticLastmod },
    { loc: `${SITE}/lease-guide`, priority: 0.9, lastmod: staticLastmod },
    { loc: `${SITE}/features`, priority: 0.8, lastmod: staticLastmod },
    { loc: `${SITE}/features/lease-analyzer`, priority: 0.8, lastmod: staticLastmod },
    { loc: `${SITE}/blog`, priority: 0.7, lastmod: staticLastmod },
    { loc: `${SITE}/blog/accidental-landlord-checklist`, priority: 0.7, lastmod: staticLastmod },
    { loc: `${SITE}/blog/suddenly-became-a-landlord`, priority: 0.7, lastmod: staticLastmod },
    { loc: `${SITE}/blog/accidental-landlord-tax-guide`, priority: 0.7, lastmod: staticLastmod },
    { loc: `${SITE}/blog/renting-out-your-home-first-time`, priority: 0.7, lastmod: staticLastmod },
    { loc: `${SITE}/about`, priority: 0.6, lastmod: staticLastmod },
    { loc: `${SITE}/privacy`, priority: 0.6, lastmod: staticLastmod },
  ]

  const statesDir = path.join(process.cwd(), "app", "data", "states")
  const files = (await fs.readdir(statesDir)).filter((f) => f.endsWith(".json") && f !== "index.json")

  const stateEntries: UrlEntry[] = []
  for (const f of files) {
    const slug = f.replace(/\.json$/i, "")
    const abs = path.join(statesDir, f)
    const lastmod = await getLastmodFromFile(abs)
    stateEntries.push({
      loc: `${SITE}/landlord-tenant-laws/states/${slug}`,
      lastmod,
      priority: 0.8,
    })
  }

  const all = [...core, ...stateEntries]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    all
      .map((u) => {
        const parts = [
          "  <url>",
          `    <loc>${escapeXml(u.loc)}</loc>`,
          u.lastmod ? `    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : null,
          typeof u.priority === "number" ? `    <priority>${u.priority.toFixed(1)}</priority>` : null,
          "  </url>",
        ].filter(Boolean)
        return parts.join("\n")
      })
      .join("\n") +
    `\n</urlset>\n`
  return xml
}

export const runtime = "nodejs"

export async function GET() {
  const sitemap = await generateSitemap()

  return new NextResponse(sitemap, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  })
}