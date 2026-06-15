# Family Wealth OS

家庭财富管理系统 - 一款专为家庭财务规划和管理设计的现代化 Web 应用。

## 📖 项目简介

Family Wealth OS 是一款功能全面的家庭财务管理平台，帮助用户实现：

- **财务可视化** - 实时掌握家庭财务状况
- **智能分析** - AI 驱动的投资建议和决策支持
- **目标管理** - 制定并追踪财务目标
- **家庭协作** - 多成员共同管理家庭财务
- **数据安全** - 企业级安全保障

## ✨ 功能特点

### 🏠 核心财务功能

| 模块 | 功能 | 描述 |
|------|------|------|
| **交易管理** | 收入/支出/转账 | 记录日常收支，支持多账户 |
| **资产管理** | 资产追踪 | 银行账户、投资、房产、股票 |
| **负债管理** | 负债追踪 | 房贷、车贷、信用卡、还款计划 |
| **预算系统** | 预算设置 | 月度/年度预算，超支提醒 |
| **目标追踪** | 财务目标 | 储蓄目标、进度追踪、里程碑 |
| **财务报告** | 数据分析 | 收支趋势、分类分析、资产负债表 |
| **FIRE 规划** | 财务自由 | 提前退休计算器、储蓄率分析 |

### 🤖 AI 智能分析

- **股票分析** - 基本面、技术面、情绪分析
- **加密货币分析** - BTC、ETH 等币种评估
- **黄金分析** - 避险资产评估
- **房产分析** - 购房决策支持
- **投资组合分析** - 风险评估、优化建议
- **自然语言咨询** - 任意财务问题问答

### 🔐 安全功能

- **用户认证** - Email/Password 登录注册
- **忘记密码** - 邮件重置密码
- **修改密码** - 旧密码验证
- **两步验证** - TOTP 认证支持
- **登录记录** - 查看登录历史
- **账户删除** - 安全删除账户
- **会话超时** - 自动登出保护

### ⚙️ 设置功能

- **个人资料** - 头像上传、姓名、邮箱
- **通知偏好** - 邮件通知、推送、周报、月报
- **分类管理** - 添加/编辑/删除收入支出分类
- **语言设置** - 中文/英文双语支持
- **主题设置** - 浅色/深色/系统主题

### 📱 体验优化

- **响应式设计** - 完美支持桌面和移动设备
- **下拉刷新** - 数据实时更新
- **自动同步** - 定时刷新数据
- **Mock 数据** - 无需数据库即可体验

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Supabase 账户（可选，用于数据持久化）
- DeepSeek API Key（可选，用于 AI 分析）

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd family-wealth-os
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```env
# Supabase 配置（可选）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 使用 Mock 数据（无需数据库）
NEXT_PUBLIC_USE_MOCK_DATA=true

# AI 分析配置（可选）
NEXT_PUBLIC_AI_ENABLED=false
NEXT_PUBLIC_AI_PROVIDER=deepseek
NEXT_PUBLIC_AI_API_KEY=your-deepseek-api-key
```

4. **启动开发服务器**
```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

### 可选配置

**启用数据库持久化**：
1. 登录 [Supabase](https://supabase.com) 创建新项目
2. 执行 `supabase/schema.sql` 中的建表语句
3. 设置 `NEXT_PUBLIC_USE_MOCK_DATA=false`

**启用 AI 分析**：
1. 访问 [DeepSeek](https://platform.deepseek.com/) 获取 API Key
2. 设置 `NEXT_PUBLIC_AI_ENABLED=true`
3. 填入您的 API Key

## 📁 项目结构

```
Family Wealth OS/
├── src/                        # Next.js 前端代码
│   ├── app/                    # Next.js App Router 页面
│   │   ├── dashboard/          # 财务概览
│   │   ├── transactions/       # 交易记录
│   │   ├── assets/             # 资产管理
│   │   ├── liabilities/        # 负债管理
│   │   ├── budget/             # 预算管理
│   │   ├── goals/              # 目标追踪
│   │   ├── reports/            # 财务报告
│   │   ├── analytics/          # 量化分析
│   │   ├── ai-analysis/        # AI 智能分析
│   │   ├── fire/               # FIRE 计算器
│   │   ├── family/             # 家庭成员
│   │   ├── settings/           # 设置
│   │   ├── login/              # 登录
│   │   ├── register/           # 注册
│   │   └── forgot-password/    # 忘记密码
│   │
│   ├── components/             # React 组件
│   ├── contexts/               # React Context
│   ├── hooks/                  # 自定义 Hooks
│   ├── i18n/                   # 国际化
│   ├── lib/                    # 工具库
│   ├── services/               # 业务服务层
│   ├── types/                  # TypeScript 类型定义
│   ├── data/                   # Mock 数据
│   └── tests/                  # 单元测试
│
├── supabase/                   # Supabase 数据库配置
│   └── schema.sql             # 数据库 Schema
│
├── TradingAgents-main/         # AI 股票分析后端服务（Python）
│   ├── cli/                   # 命令行接口
│   ├── tradingagents/         # 核心 AI 模块
│   ├── tests/                 # 测试用例
│   └── requirements.txt       # Python 依赖
│
└── public/                    # 静态资源
```

### 🤖 TradingAgents 集成

项目集成了 **TradingAgents** - 一个强大的 AI 股票分析框架：

**功能特性：**
- 基本面分析 - 评估公司财务和业绩指标
- 技术分析 - MACD、RSI 等技术指标
- 情绪分析 - 新闻和社交媒体情绪
- 风险管理 - 投资组合风险评估
- 多 LLM 支持 - GPT-4、Gemini、Claude、DeepSeek

**启动 TradingAgents 服务：**
```bash
cd TradingAgents-main
pip install -r requirements.txt
python -m cli.main
```

**配置前端连接：**
```env
NEXT_PUBLIC_TRADING_AGENTS_URL=http://localhost:8000
```

## 🛠️ 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| **框架** | Next.js | 15 |
| **UI** | React | 18 |
| **语言** | TypeScript | 5.x |
| **样式** | Tailwind CSS | 3.x |
| **组件库** | Radix UI | 1.x |
| **图表** | Recharts | 2.x |
| **后端** | Supabase | - |
| **状态管理** | React Context | - |
| **测试** | Vitest | 1.x |
| **图标** | Lucide React | 0.265 |

## 🔧 命令参考

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm run test

# 测试监听模式
npm run test:watch

# 代码检查
npm run lint

# 类型检查
npm run typecheck
```

## 📊 数据库 Schema

### 核心表结构

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `transactions` | 交易记录 | id, type, amount, category, account_id |
| `accounts` | 账户信息 | id, name, type, balance, currency |
| `assets` | 资产记录 | id, name, type, value, category |
| `liabilities` | 负债记录 | id, name, type, total_amount, remaining_amount |
| `budgets` | 预算记录 | id, category, amount, period |
| `goals` | 财务目标 | id, name, target_amount, current_amount, deadline |
| `family_members` | 家庭成员 | id, user_id, name, role |
| `categories` | 分类信息 | id, name, type, icon, color |
| `user_settings` | 用户设置 | id, user_id, preferences, theme, locale |
| `login_history` | 登录记录 | id, user_id, ip, device, login_time |

### Row Level Security (RLS)

所有表都配置了严格的 RLS 策略：
- 用户只能访问自己的数据
- 家庭成员共享数据通过角色权限控制
- 管理员可以管理所有数据

## 🌐 国际化支持

支持以下语言：
- **中文 (zh-CN)** - 默认语言
- **英文 (en-US)** - 完整翻译

语言切换在设置页面进行，自动保存到 localStorage。

## 🌙 主题支持

- **浅色模式** - 明亮清爽的界面
- **深色模式** - 护眼舒适的夜间体验
- **系统主题** - 跟随系统自动切换

## 🧪 测试覆盖

测试文件位于 `src/tests/` 目录：

```bash
npm run test
```

测试内容：
- 股票代码标准化
- 投资组合风险计算
- 货币格式化
- 数据验证

## 🚢 部署指南

### Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 一键部署

### Docker 部署

```bash
# 构建镜像
docker build -t family-wealth-os .

# 运行容器
docker run -p 3000:3000 family-wealth-os
```

### 手动部署

```bash
# 构建
npm run build

# 启动
npm start
```

## 🔒 安全说明

- **密码安全**: Supabase Auth 托管，加密存储
- **数据隔离**: RLS 策略确保用户只能访问自己的数据
- **HTTPS**: 强制使用 HTTPS
- **会话管理**: 自动超时登出
- **操作日志**: 记录所有关键操作

## 🔄 数据同步

- **实时同步**: Supabase 实时订阅
- **下拉刷新**: 移动端手势支持
- **定时同步**: 自动更新数据

## 📈 性能优化

- **代码分割**: Next.js 自动优化
- **缓存策略**: 静态资源缓存
- **懒加载**: 按需加载组件
- **响应式设计**: 移动端优化

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

- [Supabase](https://supabase.com) - 后端即服务
- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 无样式组件库
- [Lucide](https://lucide.dev/) - 图标库
- [DeepSeek](https://platform.deepseek.com/) - AI 服务

## 📞 联系方式

如有问题或建议，欢迎提交 Issue 或联系开发者。

---

**家庭财富管理，从这里开始 🏠💰**
