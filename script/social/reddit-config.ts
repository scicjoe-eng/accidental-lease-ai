/**
 * Reddit Social Automation — Configuration
 * 
 * SUBREDDITS: 美国房东/房地产相关社区
 * FLAIRS: 可选帖子标签
 */

export const REDDIT_SUBREDDITS = [
  { name: "realestateinvesting", label: "房地产投资", priority: 1 },
  { name: "landlord", label: "房东", priority: 2 },
  { name: "firsttimehomebuyer", label: "首次购房", priority: 3 },
  { name: "frugal", label: "省钱/被动收入", priority: 4 },
] as const

export const POST_TEMPLATES = {
  // 帖子类型
  types: [
    {
      id: "state_guide",
      label: "州法律指南",
      titlePattern: "{state_name} Landlord-Tenant Laws: What Every {state_name} Landlord Needs to Know",
      bodyPattern: `I'm a landlord in {state_name} and had to navigate the local landlord-tenant laws — they're quite specific and vary a lot from other states.

If you're renting out property in {state_name}, here are some key things I learned:

{facts_summary}

The full details: {state_url}

Hope this saves someone the headaches I ran into. Happy to answer questions from fellow {state_name} landlords.`,
    },
    {
      id: "tool_recommendation",
      label: "工具推荐",
      titlePattern: "Built a tool to auto-generate legally-compliant lease contracts — feedback wanted",
      bodyPattern: `Been building a tool specifically for "accidental landlords" — people who didn't plan to be landlords but ended up renting out a property.

It auto-generates lease contracts that comply with {state_name} landlord-tenant laws, and includes a PDF audit feature.

Currently covers all 50 states. Would love feedback from fellow landlords on what's most important to get right.

Check it out: {app_url}

(Also curious — what do you wish you'd known when you became a landlord?)`,
    },
    {
      id: "tips_and_learnings",
      label: "经验分享",
      titlePattern: "What I learned renting out my first property in {state_name} (the legal stuff they don't tell you)",
      bodyPattern: `Became a "landlord by accident" last year — inherited a property, decided to rent it rather than sell.

Here are the {state_name}-specific things I wish I'd known sooner:

{facts_summary}

Full breakdown of {state_name} landlord-tenant laws I've been studying: {state_url}

What surprised you most when you became a landlord?`,
    },
  ],
} as const

export const ENGAGEMENT_SETTINGS = {
  // 发帖间隔（分钟）
  postIntervalMinutes: 60,
  // 每天最大发帖数
  maxPostsPerDay: 3,
  // 是否自动回复评论
  autoReply: false,
  // 自动投票（谨慎使用）
  autoVote: false,
}

export const CONTENT_SETTINGS = {
  // 是否包含主站链接
  includeAppLink: true,
  // 是否包含州法律页面链接
  includeStateLink: true,
  // 最大字数
  maxBodyLength: 9800,
  // 最小facts摘要条数
  minFactsSummaryItems: 3,
}
