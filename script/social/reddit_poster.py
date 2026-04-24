#!/usr/bin/env python3
"""
Reddit Social Automation — Auto-Post to Subreddits
Supports: Lease contract tips, state law guides, accidental landlord content

Usage:
  # Post to a single subreddit (dry run / ask mode)
  python3 script/social/reddit_poster.py --subreddit landlord --template tool_recommendation --state CA --dry-run

  # Post for real (requires --confirm)
  python3 script/social/reddit_poster.py --subreddit landlord --template tool_recommendation --state CA --confirm

  # Auto-generate for all subreddits (dry run)
  python3 script/social/reddit_poster.py --auto --state CA --dry-run

Environment:
  REDDIT_CLIENT_ID
  REDDIT_CLIENT_SECRET
  REDDIT_USERNAME
  REDDIT_PASSWORD
  REDDIT_USER_AGENT  (e.g. "AcciLease/1.0")
"""

import argparse
import json
import os
import random
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

import praw

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
CANONICAL_DIR = SCRIPT_DIR.parent.parent / "app/data/state_laws_canonical"
APP_URL = os.getenv("APP_URL", "https://accidentallease.com")
STATE_LAWS_URL = os.getenv("STATE_LAWS_URL", "https://accidentallease.com/landlord-tenant-laws/states")

SUBREDDITS = [
    "realestateinvesting",
    "landlord",
    "firsttimehomebuyer",
    "frugal",
]

POST_TEMPLATES = {
    "tool_recommendation": """Built a tool to auto-generate legally-compliant lease contracts — feedback wanted

Been building a tool specifically for "accidental landlords" — people who didn't plan to be landlords but ended up renting out property they own.

It auto-generates lease contracts that comply with {state_name} landlord-tenant laws and includes a PDF audit feature for existing leases. Currently covers all 50 states.

Would love genuine feedback from fellow landlords on what's most important to get right — the legal details are honestly overwhelming.

Check it out: {app_url}

(Also curious: what do you wish you'd known when you became a landlord?)""",

    "state_guide": """{state_name} Landlord-Tenant Laws: What Every {state_name} Landlord Needs to Know

I'm a landlord in {state_name} and had to navigate the local landlord-tenant laws — they're surprisingly detailed and vary significantly from other states.

Key highlights for {state_name} landlords:

{facts_summary}

The full breakdown of {state_name} landlord-tenant laws I've been studying: {state_url}

Happy to answer questions or share more about what I've learned.""",

    "tips_and_learnings": """What I learned renting out my first property in {state_name} (the legal stuff they don't tell you)

Became a "landlord by accident" last year — inherited a property, decided to rent it rather than sell.

Here are the {state_name}-specific things I wish I'd known sooner:

{facts_summary}

Full breakdown: {state_url}

What surprised you most when you became a landlord?""",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_state_canonical(state_code: str) -> dict:
    """Load canonical state law JSON."""
    path = CANONICAL_DIR / f"{state_code.upper()}.json"
    if not path.exists():
        raise FileNotFoundError(f"Canonical file not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_facts_summary(state_data: dict, max_items: int = 5) -> str:
    """Extract a short plain-text facts summary for Reddit posts."""
    lines = []
    facts = state_data.get("facts", {})

    def extract(field: str, label: str) -> Optional[str]:
        val = facts.get(field)
        if not val or val in ("varies", None, "", "unknown"):
            return None
        if isinstance(val, str) and len(val) > 120:
            val = val[:120] + "..."
        if val:
            lines.append(f"- **{label}**: {val}")
            return True
        return False

    # Security deposit
    sd = facts.get("security_deposit", {})
    if sd:
        if sd.get("return_deadline_days"):
            extract("security_deposit.return_deadline_days", "Security deposit return deadline")
        if sd.get("cap_rule"):
            extract("security_deposit.cap_rule", "Security deposit cap")
        if sd.get("itemized_statement_required"):
            extract("security_deposit.itemized_statement_required", "Itemized statement required")

    # Eviction
    ev = facts.get("eviction", {})
    if ev:
        if ev.get("judicial_process_required"):
            extract("eviction.judicial_process_required", "Eviction process type")
        if ev.get("self_help_eviction_prohibited"):
            extract("eviction.self_help_eviction_prohibited", "Self-help eviction")

    # Landlord entry
    le = facts.get("landlord_entry", {})
    if le:
        if le.get("advance_notice_required"):
            extract("landlord_entry.advance_notice_required", "Entry notice required")
        if le.get("emergency_entry_allowed"):
            extract("landlord_entry.emergency_entry_allowed", "Emergency entry")

    # Rent
    rent = facts.get("rent_control", {})
    if rent:
        if rent.get("rent_increase_notice_days"):
            extract("rent_control.rent_increase_notice_days", "Rent increase notice")

    if not lines:
        lines.append(f"- {state_data.get('state_name', state_data.get('state_code'))} has specific landlord-tenant requirements — check the full guide for details.")

    return "\n".join(lines[:max_items])


def build_post_content(template_id: str, state_code: str, dry_run: bool = False) -> tuple[str, str, str]:
    """Build Reddit post title and body."""
    state_data = load_state_canonical(state_code)
    state_name = state_data.get("state_name", state_code)
    state_slug = state_data.get("state_slug", state_code.lower())
    template = POST_TEMPLATES.get(template_id, POST_TEMPLATES["tool_recommendation"])

    facts_summary = extract_facts_summary(state_data)

    body = template.format(
        state_name=state_name,
        state_code=state_code,
        state_slug=state_slug,
        app_url=APP_URL,
        state_url=f"{STATE_LAWS_URL}/{state_slug}",
        facts_summary=facts_summary,
    )

    # Auto-generate title from template if not provided
    if template_id == "tool_recommendation":
        title = "Built a tool to auto-generate legally-compliant lease contracts — feedback wanted"
    elif template_id == "state_guide":
        title = f"{state_name} Landlord-Tenant Laws: What Every {state_name} Landlord Needs to Know"
    elif template_id == "tips_and_learnings":
        title = f"What I learned renting out my first property in {state_name} (the legal stuff they don't tell you)"
    else:
        title = f"Landlord Tips for {state_name}"

    mode_label = "[DRY RUN] " if dry_run else ""
    title = f"{mode_label}{title}"

    body = body[:9800]

    return title, body, state_slug


def get_reddit_client() -> praw.Reddit:
    """Create authenticated Reddit client."""
    required = ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USERNAME", "REDDIT_PASSWORD"]
    missing = [k for k in required if not os.getenv(k)]
    if missing:
        print(f"❌ Missing env vars: {missing}")
        print("   Set them in .env.local or export them in your shell.")
        sys.exit(1)

    reddit = praw.Reddit(
        client_id=os.getenv("REDDIT_CLIENT_ID"),
        client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
        username=os.getenv("REDDIT_USERNAME"),
        password=os.getenv("REDDIT_PASSWORD"),
        user_agent=os.getenv("REDDIT_USER_AGENT", "AcciLease/1.0 (https://accidentallease.com)"),
    )
    return reddit


# ---------------------------------------------------------------------------
# Poster
# ---------------------------------------------------------------------------

def post_to_subreddit(
    reddit: praw.Reddit,
    subreddit_name: str,
    title: str,
    body: str,
    dry_run: bool = False,
    link_flair_id: Optional[str] = None,
) -> Optional[str]:
    """Submit a post to a subreddit. Returns post URL on success."""
    subreddit = reddit.subreddit(subreddit_name)
    if dry_run:
        print(f"   [DRY RUN] Would post to r/{subreddit_name}:")
        print(f"   Title: {title[:80]}...")
        print(f"   Body preview: {body[:200]}...")
        print()
        return None

    try:
        submission = subreddit.submit(
            title=title,
            selftext=body,
            link_flair_id=link_flair_id,
        )
        print(f"✅ Posted to r/{subreddit_name}: {submission.url}")
        return submission.url
    except Exception as e:
        print(f"❌ Failed to post to r/{subreddit_name}: {e}")
        return None


def auto_post(
    state_code: str,
    subreddit: Optional[str] = None,
    template: str = "tool_recommendation",
    dry_run: bool = True,
    interval_minutes: int = 60,
) -> None:
    """Auto-generate and post content for all subreddits or a specific one."""
    title, body, state_slug = build_post_content(template, state_code, dry_run)

    targets = [subreddit] if subreddit else SUBREDDITS

    print(f"\n{'='*60}")
    print(f"Reddit Auto-Post — {state_code} | Template: {template}")
    print(f"{'='*60}")
    print(f"Title: {title}")
    print(f"Body preview (first 300 chars): {body[:300]}")
    print(f"\nTarget subreddits: {targets}")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE (will post for real)'}")
    print(f"{'='*60}\n")

    if dry_run:
        for sub in targets:
            post_to_subreddit(get_reddit_client(), sub, title, body, dry_run=True)
        print("\n⚠️  Re-run with --confirm to actually post.")
    else:
        reddit = get_reddit_client()
        posted_urls = []
        for sub in targets:
            url = post_to_subreddit(reddit, sub, title, body, dry_run=False)
            if url:
                posted_urls.append(url)
            time.sleep(interval_minutes * 60)  # respect rate limits

        print(f"\n📬 Posted {len(posted_urls)} times.")
        if posted_urls:
            print("Post URLs:")
            for u in posted_urls:
                print(f"  {u}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="AcciLease Reddit Auto-Poster")
    parser.add_argument("--subreddit", default=None, help="Target subreddit (default: all)")
    parser.add_argument("--template", default="tool_recommendation",
                        choices=["tool_recommendation", "state_guide", "tips_and_learnings"],
                        help="Post template to use")
    parser.add_argument("--state", default="CA", help="2-letter state code (default: CA)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview only — does not actually post")
    parser.add_argument("--confirm", action="store_true",
                        help="Actually post (required to bypass dry-run)")
    parser.add_argument("--auto", action="store_true",
                        help="Auto mode: generate for all configured subreddits")
    parser.add_argument("--interval", type=int, default=60,
                        help="Minutes between posts when auto-posting (default: 60)")
    args = parser.parse_args()

    if args.dry_run and args.confirm:
        print("❌ Cannot use --dry-run and --confirm at the same time.")
        sys.exit(1)

    dry_run = not args.confirm

    if args.auto:
        auto_post(
            state_code=args.state.upper(),
            subreddit=args.subreddit,
            template=args.template,
            dry_run=dry_run,
            interval_minutes=args.interval,
        )
    else:
        title, body, _ = build_post_content(args.template, args.state.upper(), dry_run)
        target = args.subreddit or SUBREDDITS[0]
        reddit = get_reddit_client()
        post_to_subreddit(reddit, target, title, body, dry_run=dry_run)


if __name__ == "__main__":
    main()
