import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Sitemap: https://accidental-lease-ai.com/sitemap.xml",
    "",
  ].join("\n")

  return new NextResponse(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  })
}

