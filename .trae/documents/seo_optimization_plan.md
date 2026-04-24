# SEO优化计划

## 1. 项目现状分析

AcciLease AI 是一个基于 Next.js 16.2.4 的 AI 合同生成和审核系统，主要功能包括：
- 住宅租赁合同生成（支持 50 个州 + DC 的法律要求）
- PDF 合同审核和风险评估
- 用户认证和订阅管理
- PWA 支持

**当前 SEO 状态**：
- 基本元数据已配置，但缺乏详细的 SEO 优化
- 网站架构需要按照要求重新组织
- 缺少技术 SEO 基础建设（如 XML Sitemap、robots.txt 等）
- 缺少结构化数据实现
- 核心网页指标需要优化

## 2. SEO 优化计划

### 2.1 网站架构优化

**目标架构**：
```
accidental-lease-ai.com/
├── /（首页 - AI分析核心工具）
├── /accidental-landlord-guide（意外房东指南支柱页）
├── /landlord-tenant-laws（50州法律支柱页）
│   └── /states/[state-slug]（程序化SEO子页，51个）
├── /lease-guide（租约指南支柱页）
├── /features/（功能介绍）
│   └── /features/lease-analyzer
├── /blog/（博客集群）
│   └── /blog/[slug]
├── /about
├── /privacy
└── /sitemap.xml
```

**实施步骤**：
1. **创建支柱页面**：
   - `/accidental-landlord-guide`
   - `/landlord-tenant-laws`
   - `/lease-guide`

2. **创建功能页面**：
   - `/features/`
   - `/features/lease-analyzer`

3. **创建博客系统**：
   - `/blog/`
   - `/blog/[slug]`

4. **创建法律状态页面**：
   - `/landlord-tenant-laws/states/[state-slug]`

5. **创建关于和隐私页面**：
   - `/about`
   - `/privacy`

**URL 规则**：
- 全小写，连字符（-）分隔
- 无下划线，无特殊字符
- 层级深度不超过 3 层
- 所有重要页面从首页 3 次点击内可达

### 2.2 技术 SEO 基础建设

**HTTPS 配置**：
- 确保全站强制 HTTPS，实现 301 跳转

**XML Sitemap**：
- 动态生成 sitemap.xml
- 包含所有核心页面
- 提交至 Google Search Console 和 Bing Webmaster Tools

**robots.txt**：
- 允许爬取所有核心内容页
- 屏蔽 `/admin`、`/api`、`/?*` 参数页

**规范链接（canonical）**：
- 为所有页面添加 canonical 标签
- 防止重复内容，尤其是分页、状态筛选页

**结构化数据（Schema）**：
- **Organization** — 首页品牌信息
- **WebApplication** — AI 工具描述
- **FAQPage** — 所有 FAQ 模块
- **HowTo** — 操作指南类文章
- **Article** — 博客文章
- **BreadcrumbList** — 全站面包屑导航

**Open Graph / Twitter Card**：
- 为所有页面添加社交分享预览

**hreflang**：
- 为英语地区（英国、加拿大、澳大利亚）添加 hreflang 标签

### 2.3 核心网页指标优化

**LCP（最大内容绘制）**：
- 目标：< 2.5s
- 关键措施：
  - 图片 WebP 格式 + CDN
  - 关键 CSS 内联
  - 服务器响应 < 200ms
  - 首屏使用服务端渲染（SSR）或静态生成（SSG）
  - AI 分析功能采用懒加载策略
  - 使用 next/image 或等效优化组件

**INP（交互到下一帧）**：
- 目标：< 200ms
- 关键措施：
  - 避免主线程阻塞
  - JS 代码分割
  - 延迟加载非关键脚本

**CLS（累计布局偏移）**：
- 目标：< 0.1
- 关键措施：
  - 所有图片、广告位预留固定尺寸
  - 不使用动态注入内容

### 2.4 内容优化

**支柱页面优化**：
- 每个支柱页面包含详细的主题内容
- 合理的内容结构和内部链接
- 针对目标关键词进行优化

**程序化 SEO 页面**：
- 为 51 个州的法律页面创建结构化模板
- 确保每个页面有独特的内容
- 优化州法律相关的关键词

**博客内容**：
- 创建与意外房东相关的高质量博客文章
- 针对长尾关键词进行优化
- 建立博客内容集群

### 2.5 技术实现计划

**文件结构调整**：
1. **创建新页面目录**：
   - `app/accidental-landlord-guide/page.tsx`
   - `app/landlord-tenant-laws/page.tsx`
   - `app/landlord-tenant-laws/states/[state-slug]/page.tsx`
   - `app/lease-guide/page.tsx`
   - `app/features/page.tsx`
   - `app/features/lease-analyzer/page.tsx`
   - `app/blog/page.tsx`
   - `app/blog/[slug]/page.tsx`
   - `app/about/page.tsx`
   - `app/privacy/page.tsx`

2. **创建 SEO 相关文件**：
   - `app/sitemap.xml/route.ts`
   - `public/robots.txt`

3. **更新现有文件**：
   - `app/metadata.ts` — 完善元数据
   - `app/layout.tsx` — 添加结构化数据和面包屑导航

**技术实现**：
1. **XML Sitemap 生成**：
   - 使用 Next.js 的 API 路由动态生成 sitemap.xml
   - 包含所有核心页面的 URL

2. **robots.txt 配置**：
   - 创建 `public/robots.txt` 文件
   - 配置爬取规则

3. **结构化数据实现**：
   - 在 `app/layout.tsx` 中添加基础结构化数据
   - 在各页面中添加特定的结构化数据

4. **核心网页指标优化**：
   - 优化图片加载
   - 实现代码分割
   - 优化首屏加载

## 3. 实施步骤

### 3.1 第一阶段：网站架构调整
1. 创建新的页面目录结构
2. 实现基本页面框架
3. 配置路由和导航

### 3.2 第二阶段：技术 SEO 基础建设
1. 实现 XML Sitemap
2. 创建 robots.txt
3. 添加规范链接
4. 实现结构化数据
5. 配置 Open Graph / Twitter Card

### 3.3 第三阶段：核心网页指标优化
1. 优化图片加载
2. 实现代码分割
3. 优化首屏加载
4. 减少 CLS

### 3.4 第四阶段：内容优化
1. 完善支柱页面内容
2. 实现程序化 SEO 页面
3. 创建博客内容
4. 优化内部链接结构

### 3.5 第五阶段：验证和提交
1. 验证所有 SEO 元素
2. 提交 sitemap 至搜索引擎
3. 监控核心网页指标
4. 进行 SEO 审计

## 4. 技术依赖和考虑因素

### 4.1 技术依赖
- **Next.js 16.2.4**：使用 App Router 实现页面路由
- **React 19.2.4**：前端框架
- **Tailwind CSS 4**：样式框架
- **Supabase**：数据库和认证
- **next-sitemap**（可选）：生成 sitemap

### 4.2 考虑因素
- **性能优化**：确保 SEO 优化不会影响网站性能
- **用户体验**：SEO 优化应与用户体验保持平衡
- **维护性**：确保 SEO 实现易于维护和更新
- **兼容性**：确保在所有主流浏览器中正常工作

## 5. 预期成果

- **网站架构**：符合 SEO 最佳实践的清晰结构
- **技术 SEO**：完整的技术 SEO 基础建设
- **核心网页指标**：达到 Google 推荐的指标目标
- **内容优化**：高质量的 SEO 友好内容
- **搜索引擎可见性**：提高搜索引擎排名和 organic 流量

## 6. 风险评估和应对策略

### 6.1 潜在风险
- **技术实现复杂度**：结构化数据和程序化 SEO 页面的实现可能较为复杂
- **性能影响**：某些 SEO 优化可能对性能产生负面影响
- **内容质量**：程序化生成的内容可能缺乏质量

### 6.2 应对策略
- **分阶段实施**：逐步实施 SEO 优化，确保每个阶段都能正常工作
- **性能监控**：在实施过程中持续监控性能指标
- **内容质量控制**：为程序化生成的内容添加人工审核环节
- **测试和验证**：在每个阶段进行充分的测试和验证

## 7. 结论

通过实施本 SEO 优化计划，AcciLease AI 项目将获得更好的搜索引擎可见性，吸引更多目标用户，提高网站流量和转化率。同时，优化后的网站架构和技术实现将为用户提供更好的体验，为项目的长期发展奠定坚实基础。