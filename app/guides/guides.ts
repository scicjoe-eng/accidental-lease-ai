export type Guide = {
  slug: string
  title: string
  excerpt: string
  keywords: string[]
  contentHtml: string
}

export const GUIDES: Guide[] = [
  {
    slug: "lease-agreement-basics",
    title: "Lease Agreement Basics (What to Include)",
    excerpt:
      "A practical guide to the clauses most leases should include: rent terms, deposits, maintenance, entry notice, and dispute processes.",
    keywords: ["lease agreement", "lease clauses", "landlord guide", "rental contract"],
    contentHtml: `
<p>A lease is your operating system. It sets expectations and reduces disputes by defining responsibilities and timelines.</p>
<h2>Core sections most leases need</h2>
<ul>
  <li>Parties, property address, and occupancy rules</li>
  <li>Term (fixed vs month-to-month), renewal, and termination</li>
  <li>Rent amount, due date, grace period, and late fees (if allowed)</li>
  <li>Security deposit amount, allowable deductions, and return process</li>
  <li>Maintenance responsibilities and how requests are submitted</li>
  <li>Rules: pets, smoking, noise, guests, parking, subletting</li>
  <li>Entry notice process and emergency access rules</li>
  <li>Required disclosures (varies by state/city)</li>
</ul>
<p>Local law can override lease terms. Make sure your lease matches your jurisdiction.</p>
`,
  },
  {
    slug: "tenant-screening-workflow",
    title: "Tenant Screening Workflow (Step-by-Step)",
    excerpt:
      "A step-by-step screening workflow you can reuse consistently, with the documents to request and the red flags to verify.",
    keywords: ["tenant screening", "rental application", "background check", "credit check"],
    contentHtml: `
<p>Good screening is consistent screening. The goal is to verify ability to pay and likelihood of a stable tenancy.</p>
<h2>Recommended workflow</h2>
<ol>
  <li>Publish clear criteria (income, credit, occupancy, pets)</li>
  <li>Collect a complete application (everyone 18+)</li>
  <li>Verify income and employment</li>
  <li>Check rental history and references</li>
  <li>Run credit/background checks where permitted</li>
  <li>Approve or deny with consistent documentation</li>
</ol>
<p>Keep written records of your criteria and your decision basis.</p>
`,
  },
  {
    slug: "move-in-move-out-documentation",
    title: "Move-In & Move-Out Documentation (Photos + Checklist)",
    excerpt:
      "How to document condition at move-in and move-out so security deposit deductions are defensible and disputes are minimized.",
    keywords: ["move-in inspection", "move-out inspection", "security deposit", "property condition"],
    contentHtml: `
<p>Most deposit disputes are documentation disputes. Make the condition obvious with checklists and photos.</p>
<h2>What to document</h2>
<ul>
  <li>Room-by-room condition checklist</li>
  <li>Close-ups of any pre-existing damage</li>
  <li>Appliance condition and serial numbers (optional)</li>
  <li>Keys/fobs count</li>
</ul>
<p>Have the tenant sign the move-in checklist. Store it with the lease.</p>
`,
  },
  {
    slug: "maintenance-request-process",
    title: "Maintenance Requests: A Simple Process Tenants Will Use",
    excerpt:
      "A low-friction maintenance request process that keeps written records, reduces emergencies, and helps you prioritize repairs.",
    keywords: ["maintenance requests", "repairs", "landlord operations", "property management"],
    contentHtml: `
<p>Maintenance becomes chaos when requests arrive across texts, calls, and social apps. Pick one channel and stick to it.</p>
<h2>Simple process</h2>
<ul>
  <li>One written request channel (email or form)</li>
  <li>Required fields: location, severity, photos, availability</li>
  <li>Response SLA: acknowledge quickly, schedule clearly</li>
  <li>Emergency definitions and after-hours contact rules</li>
  <li>Receipt storage and vendor notes</li>
</ul>
<p>Clear expectations reduce frustration for both sides.</p>
`,
  },
]

export const GUIDES_BY_SLUG: Record<string, Guide> = Object.fromEntries(GUIDES.map((g) => [g.slug, g]))

