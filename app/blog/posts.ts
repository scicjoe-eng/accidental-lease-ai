export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string // YYYY-MM-DD
  author: string
  category: string
  keywords: string[]
  contentHtml: string
}

const AUTHOR = "AcciLease AI Team"

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "suddenly-became-a-landlord",
    title: "Suddenly Became a Landlord? Here’s What to Do First",
    excerpt:
      "Unexpectedly became a landlord? Start with the legal basics, the property readiness checklist, and a practical plan for screening tenants and managing risk.",
    date: "2026-01-01",
    author: AUTHOR,
    category: "Landlord Basics",
    keywords: ["accidental landlord", "new landlord", "first steps", "tenant screening", "lease basics"],
    contentHtml: `
<p>Becoming a landlord isn’t always planned. A job relocation, an inherited property, or a slow sales market can turn you into an “accidental landlord” overnight.</p>
<p>This guide focuses on the first actions that reduce risk fast—before you worry about optimizing rent or buying fancy software.</p>

<h2>1) Learn the rules that apply to your address</h2>
<p>Landlord-tenant rules vary by state and often by city. Before advertising the home, confirm the basics in your jurisdiction:</p>
<ul>
  <li>Security deposit caps and return deadlines</li>
  <li>Notice requirements (entry, nonpayment, termination)</li>
  <li>Required disclosures (lead paint, mold, bedbugs, etc.)</li>
  <li>Habitability standards (heat, water, smoke/CO detectors)</li>
</ul>
<p>If you’re unsure, a short consult with a local attorney can be cheaper than one contested dispute.</p>

<h2>2) Make the property “rent-ready”</h2>
<p>Rent-ready means safe, clean, and functional. Do a documented walkthrough and fix obvious issues:</p>
<ul>
  <li>Test smoke/CO alarms, locks, windows, and egress</li>
  <li>Check plumbing leaks, water heater, and electrical outlets</li>
  <li>Service HVAC and replace filters</li>
  <li>Deep-clean and address pests</li>
  <li>Photograph every room before move-in</li>
 </ul>

<h2>3) Price rent based on comps, not feelings</h2>
<p>Look at comparable listings within the last 30–60 days. Adjust for bed/bath count, parking, yard, and upgrades. Price slightly under the top of the comp range if you want faster occupancy and more applicant volume.</p>

<h2>4) Use consistent, fair screening</h2>
<p>Define your criteria in advance and apply it the same way to every applicant. Typical screening includes:</p>
<ul>
  <li>Income verification (often 2.5–3× rent)</li>
  <li>Credit history and debt load</li>
  <li>Rental references and eviction history</li>
  <li>Background check where permitted</li>
</ul>

<h2>5) Put everything in a compliant lease</h2>
<p>A lease should match local law and clearly define payments, fees, maintenance responsibilities, entry notice, and what happens when rent is late. If you inherited a “template lease,” review it carefully—many templates miss required disclosures or use unenforceable clauses.</p>

<h2>6) Set up a simple operations system</h2>
<p>Keep it boring and consistent:</p>
<ul>
  <li>Written maintenance request channel</li>
  <li>Receipts + ledger for every expense</li>
  <li>Dedicated account for rental income/expenses</li>
  <li>Calendar reminders for inspections and renewals</li>
</ul>

<p>Accidental landlords succeed by avoiding preventable mistakes: unclear rules, weak screening, and messy documentation. Start there, then improve over time.</p>
`,
  },
  {
    slug: "renting-out-your-home-first-time",
    title: "Renting Out Your Home for the First Time: A Practical Checklist",
    excerpt:
      "A first-time landlord checklist covering property prep, rent pricing, marketing, screening, move-in documentation, and ongoing maintenance routines.",
    date: "2026-01-01",
    author: AUTHOR,
    category: "Landlord Basics",
    keywords: ["rent out my home", "first time landlord", "rental checklist", "move-in inspection", "lease"],
    contentHtml: `
<p>Renting out your own home is different from buying an investment property. You probably care about the condition of the house and want tenants who treat it well.</p>
<p>Use this checklist to stay organized and reduce surprises.</p>

<h2>Before you list</h2>
<ul>
  <li>Confirm local licensing/registration rules (if any)</li>
  <li>Verify smoke/CO detectors, locks, and safety items</li>
  <li>Fix leaks, electrical hazards, and trip risks</li>
  <li>Decide what appliances/furnishings stay</li>
  <li>Document condition with timestamped photos</li>
</ul>

<h2>Pricing and marketing</h2>
<ul>
  <li>Pull 5–10 comparable listings and recent rentals</li>
  <li>Write an accurate listing (avoid overpromising)</li>
  <li>Use clear photos of every room + exterior</li>
  <li>Set showing windows and a consistent application process</li>
</ul>

<h2>Screening tenants</h2>
<p>Write criteria down and follow it consistently. Common criteria include income level, minimum credit score, rental references, and occupancy limits.</p>

<h2>Lease and move-in</h2>
<ul>
  <li>Use a lease that matches your state/city rules</li>
  <li>Collect funds according to local limits (deposit, first month, fees)</li>
  <li>Do a move-in checklist together and both sign it</li>
  <li>Explain how maintenance requests work</li>
</ul>

<h2>Ongoing operations</h2>
<ul>
  <li>Keep receipts and a simple income/expense ledger</li>
  <li>Schedule periodic inspections where allowed</li>
  <li>Respond to repairs quickly to prevent bigger damage</li>
  <li>Plan renewal/notice timelines 60–90 days before lease end</li>
</ul>

<p>The goal isn’t perfection—it’s consistency. A clean process protects you and makes good tenants more likely to stay.</p>
`,
  },
  {
    slug: "accidental-landlord-tax-guide",
    title: "Accidental Landlord Tax Guide: Deductions, Depreciation, and Records",
    excerpt:
      "A clear overview of rental income reporting, common deductions, depreciation basics, and recordkeeping habits that make tax time easier.",
    date: "2026-01-01",
    author: AUTHOR,
    category: "Taxes",
    keywords: ["rental property taxes", "landlord tax deductions", "depreciation", "schedule e", "rental income"],
    contentHtml: `
<p>Rental income is taxable, but rental expenses can be deductible. The difference comes down to documentation and categorization.</p>

<h2>What usually counts as rental income</h2>
<ul>
  <li>Monthly rent</li>
  <li>Fees you keep (late fees, pet fees, etc.)</li>
  <li>Security deposit amounts you retain for damages or unpaid rent</li>
</ul>

<h2>Common deductible expenses (general overview)</h2>
<ul>
  <li>Mortgage interest (not principal)</li>
  <li>Property taxes</li>
  <li>Insurance</li>
  <li>Repairs and maintenance</li>
  <li>Utilities you pay (if the tenant doesn’t)</li>
  <li>Professional services (accounting/legal)</li>
  <li>Advertising and listing fees</li>
</ul>

<h2>Repairs vs. improvements</h2>
<p>Repairs keep the property in ordinary condition (fixing a leak). Improvements add value or extend useful life (major remodel). Improvements may need to be depreciated rather than deducted immediately.</p>

<h2>Depreciation basics</h2>
<p>Residential rental buildings in the U.S. are commonly depreciated over 27.5 years (land is not depreciated). The details can be nuanced—talk to a tax professional if you’re unsure about your basis.</p>

<h2>Recordkeeping habits that pay off</h2>
<ul>
  <li>Separate bank account or clear tagging in your ledger</li>
  <li>Receipts stored in a single folder (digital is fine)</li>
  <li>One spreadsheet with date, vendor, amount, category, and notes</li>
  <li>Move-in and move-out condition documentation</li>
</ul>

<p>This article is educational, not tax advice. For state-specific rules or complex scenarios, consult a qualified professional.</p>
`,
  },
  {
    slug: "accidental-landlord-checklist",
    title: "Accidental Landlord Checklist (Free, Practical, and Printable)",
    excerpt:
      "A practical checklist for accidental landlords: legal setup, property readiness, tenant screening, lease essentials, and operational routines.",
    date: "2026-01-01",
    author: AUTHOR,
    category: "Checklists",
    keywords: ["accidental landlord checklist", "landlord checklist", "move-in checklist", "lease checklist"],
    contentHtml: `
<p>Use this checklist as a quick “did I miss anything?” before you hand over keys.</p>

<h2>Legal and compliance</h2>
<ul>
  <li>Confirm state + local landlord-tenant rules</li>
  <li>Collect required disclosures and notices</li>
  <li>Understand security deposit rules and timelines</li>
  <li>Confirm fair housing compliance in marketing/screening</li>
</ul>

<h2>Property readiness</h2>
<ul>
  <li>Safety devices installed and tested (smoke/CO)</li>
  <li>Locks, windows, and doors function properly</li>
  <li>Water heater / HVAC serviced</li>
  <li>Photos taken of all rooms and exterior</li>
</ul>

<h2>Tenant screening</h2>
<ul>
  <li>Written screening criteria</li>
  <li>Income and employment verification</li>
  <li>Rental references</li>
  <li>Credit/background checks where permitted</li>
</ul>

<h2>Lease essentials</h2>
<ul>
  <li>Rent, due date, grace period, and late fee policy</li>
  <li>Deposit amount, allowed deductions, return timeline</li>
  <li>Maintenance responsibilities and reporting process</li>
  <li>Entry notice rules and communication channel</li>
</ul>

<h2>Operations</h2>
<ul>
  <li>Expense + income tracking system</li>
  <li>Preferred contractors list</li>
  <li>Calendar reminders for renewals and inspections</li>
</ul>
`,
  },

  // Additional content to avoid “3-post site” thin content.
  {
    slug: "security-deposit-rules-by-state",
    title: "Security Deposit Rules: What Landlords Commonly Get Wrong",
    excerpt:
      "Security deposits are one of the biggest sources of disputes. Learn the most common pitfalls and how to document deductions properly.",
    date: "2026-02-02",
    author: AUTHOR,
    category: "Legal Basics",
    keywords: ["security deposit", "deposit return", "deposit deductions", "landlord tenant law"],
    contentHtml: `
<p>Security deposits aren’t “extra income.” They’re a regulated tool meant to cover unpaid rent and certain damages—rules vary by state.</p>
<h2>Common mistakes</h2>
<ul>
  <li>Charging above the legal cap (where caps exist)</li>
  <li>Missing the required return deadline</li>
  <li>Deducting for normal wear and tear</li>
  <li>No itemized statement or insufficient photos</li>
</ul>
<h2>What good documentation looks like</h2>
<ul>
  <li>Move-in checklist with signatures</li>
  <li>Timestamped photos before move-in and after move-out</li>
  <li>Receipts/invoices for repairs</li>
  <li>Clear, itemized explanation of each deduction</li>
</ul>
<p>When in doubt, keep records and follow your jurisdiction’s process exactly.</p>
`,
  },
  {
    slug: "how-to-screen-tenants-fairly",
    title: "How to Screen Tenants Fairly (and Reduce Risk)",
    excerpt:
      "A practical tenant screening workflow: consistent criteria, documentation, and the red flags that matter most for landlords.",
    date: "2026-02-10",
    author: AUTHOR,
    category: "Screening",
    keywords: ["tenant screening", "rental application", "credit check", "rental references"],
    contentHtml: `
<p>Good screening is about consistency and verification—not gut feelings.</p>
<h2>Set criteria before you accept applications</h2>
<ul>
  <li>Income requirement (e.g., 3× rent)</li>
  <li>Minimum credit threshold (if used)</li>
  <li>Occupancy limits</li>
  <li>Pets policy</li>
  <li>Co-signer rules (if any)</li>
</ul>
<h2>Verify the core facts</h2>
<ul>
  <li>Pay stubs, offer letters, or bank statements</li>
  <li>Rental history and prior landlord references</li>
  <li>Credit + background checks where permitted</li>
</ul>
<p>Keep notes and apply the same steps to every applicant to reduce disputes.</p>
`,
  },
  {
    slug: "late-rent-policy-that-works",
    title: "A Late Rent Policy That Works: Notices, Fees, and Boundaries",
    excerpt:
      "A simple late rent framework: clear lease language, consistent follow-up, and the steps to take before problems escalate.",
    date: "2026-02-18",
    author: AUTHOR,
    category: "Operations",
    keywords: ["late rent", "rent collection", "lease late fee", "notice to pay or quit"],
    contentHtml: `
<p>Most late-rent issues get worse when expectations are unclear. Your lease should define the due date, any grace period, and late fees (where allowed).</p>
<h2>Best practices</h2>
<ul>
  <li>Send reminders before rent is due (optional but effective)</li>
  <li>Follow your local notice process exactly</li>
  <li>Keep all communication written and polite</li>
  <li>Enforce consistently—exceptions create confusion</li>
</ul>
<p>Local law controls notice content and timing. Make sure your process matches your state/city requirements.</p>
`,
  },
  {
    slug: "move-in-inspection-template",
    title: "Move-In Inspection: A Template and Photo Checklist",
    excerpt:
      "A move-in inspection template and photo checklist to reduce disputes over damages at move-out.",
    date: "2026-03-01",
    author: AUTHOR,
    category: "Checklists",
    keywords: ["move-in inspection", "rental walkthrough", "property condition checklist"],
    contentHtml: `
<p>The move-in inspection is your best defense against “it was already like that.” Do it with the tenant and document everything.</p>
<h2>Room-by-room checklist</h2>
<ul>
  <li>Walls/paint, floors, windows/screens</li>
  <li>Lights/switches/outlets</li>
  <li>Appliances and plumbing fixtures</li>
  <li>Smoke/CO detectors</li>
  <li>Keys/fobs count</li>
</ul>
<h2>Photo checklist</h2>
<ul>
  <li>Wide shot of each room + close-ups of any existing issues</li>
  <li>Serial numbers for appliances (optional)</li>
  <li>Exterior, yard, garage/storage</li>
</ul>
<p>Have both parties sign the inspection form and store it with the lease.</p>
`,
  },
]

export const BLOG_POSTS_BY_SLUG: Record<string, BlogPost> = Object.fromEntries(
  BLOG_POSTS.map((p) => [p.slug, p])
)

