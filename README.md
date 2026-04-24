# Accidental Lease AI (AcciLease)

面向「意外房东」的 AI 租赁工具应用，帮助生成符合当地法律的租赁合同，并对 PDF 合同进行风险审计。

## 功能特性

- **租约生成** - AI 辅助生成符合各州法律的租赁合同
- **PDF 审计** - 上传租赁合同进行风险评估和合规检查
- **用户系统** - 登录认证（基于 Supabase）
- **订阅管理** - 免费版 vs Pro 版（Gumroad 支付）
- **PWA 支持** - 可作为离线应用使用
- **双 AI 提供商** - 支持 DeepSeek 和 DashScope (Qwen)

## 技术栈

| 类别 | 技术 |
|-----|------|
| 框架 | Next.js 16.2.4, React 19.2.4 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4, class-variance-authority |
| AI | @ai-sdk/openai, DeepSeek / DashScope (Qwen) |
| 数据库/认证 | Supabase |
| PDF | pdf-lib, pdf-parse, pdfjs-dist |
| 表单 | react-hook-form, zod |
| 支付 | Gumroad |
| UI 组件 | shadcn/ui, lucide-react, sonner |
| PWA | @ducanh2912/next-pwa |

## 快速开始

### 前置要求

- Node.js 18+
- npm 或其他包管理器

### 安装步骤

1. 克隆或下载项目
2. 安装依赖：

```bash
npm install
```

3. 配置环境变量：

```bash
# 复制模板
cp .env.example .env.local
# 编辑 .env.local，填入真实配置值
```

4. 运行开发服务器：

```bash
npm run dev
```

5. 打开浏览器访问：[http://localhost:3000](http://localhost:3000)

## 环境变量配置

完整的环境变量列表请参考 `.env.example`。以下是关键配置项：

### Supabase 配置

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### AI 配置

选择一个 AI 提供商：

#### DeepSeek (默认)

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your-deepseek-api-key
```

#### DashScope (阿里云百炼/Qwen)

```env
AI_PROVIDER=dashscope
DASHSCOPE_API_KEY=your-dashscope-api-key
```

### Gumroad 配置

```env
GUMROAD_PRODUCT_ID=ipvqkqd
NEXT_PUBLIC_GUMROAD_CHECKOUT_URL=https://your-gumroad-url
```

## 数据库设置

项目使用 Supabase 作为数据库。需要执行以下 SQL 脚本：

- `script/sql/subscription_gumroad.sql` - 订阅相关表
- `script/sql/state_laws_add_key_clauses.sql` - 州法律数据
- `script/sql/increment_subscription_feature_usage.sql` - 使用量计数函数

导入州法律数据：

```bash
npm run laws:generate
npm run laws:validate
npm run import-laws
```

说明：
- `laws:generate`：以 `app/data/state_laws_canonical/*.json` 为唯一真源，同步生成/更新
  - `app/data/states/*.json`（州法律页面内容）
  - `app/data/state_laws.json`（RAG 数据集，用于导入 Supabase）
- `laws:validate`：校验 canonical、页面 JSON、RAG 数据集三者一致性（防止 WA 这类“文本=30天但结构化=14天”的漂移）
- `import-laws`：把 `app/data/state_laws.json` 导入 Supabase `state_laws`（含 embedding），供 RAG 运行时检索使用

州法律数据更新 SOP（推荐流程）：

```bash
# 1) 只改 canonical（单一真源）
#    app/data/state_laws_canonical/<STATE_CODE>.json

# 2) 生成（会同步刷新页面 JSON + RAG 数据集）
npm run laws:generate

# 3) 校验一致性（必须通过）
npm run laws:validate

# 4) 重建 Supabase 向量库（可重复、无漂移）
npm run import-laws

# 5) 可选：再跑一次构建确保一切正常
npm run build
```

## 开发脚本

| 命令 | 说明 |
|-----|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 运行生产服务器 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run import-laws` | 导入州法律数据 |
| `npm run laws:generate` | 从 canonical 生成页面 JSON + RAG 数据集 |
| `npm run laws:validate` | 校验 canonical / 页面 / RAG 数据一致性 |
| `npm run generate-pwa-icons` | 生成 PWA 图标 |

## 项目结构

```
.
├── app/                           # Next.js App Router
│   ├── api/lease/generate/        # 租约生成 API
│   ├── audit/                     # 审计页面
│   ├── dashboard/                 # 仪表盘
│   ├── data/state_laws.json       # 州法律数据
│   ├── data/state_laws_canonical/ # 州法律 canonical 真源（每州一文件）
│   ├── data/states/               # 州法律页面 JSON（由 canonical 生成）
│   ├── generate/                  # 租约生成页面
│   ├── lib/                       # 核心业务逻辑
│   ├── login/                     # 登录页
│   ├── settings/                  # 设置页
│   ├── upgrade/                   # 升级页
│   └── page.tsx                   # 首页
├── components/                    # React 组件
│   ├── ui/                        # shadcn/ui 组件库
│   └── ...
├── public/                        # 静态资源
├── script/                        # 脚本和 SQL
├── next.config.ts                 # Next.js 配置
└── package.json
```

## 部署

### Vercel (推荐)

1. Fork 或导入项目到 GitHub/GitLab
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署！

### 其他平台

确保构建命令为 `npm run build`，启动命令为 `npm start`。

## 免费版 vs Pro 版

| 功能 | 免费版 | Pro 版 |
|-----|-------|-------|
| 租约生成 | 5 次/月 | 99 次/月 |
| 合同审计 | 2 次/月 | 99 次/月 |
| 水印 | 有 | 无 |

## 许可证

TODO
