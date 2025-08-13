# Helios Game - 赫利俄斯

> 一个意识探索与演化的沙盒 - "意识的棱镜"

## 项目简介

"赫利俄斯"不是一个传统的游戏，而是一个**意识探索与演化的沙盒**。玩家投入的是纯粹的**意识之光**，这束光透过他们内心独特的**信念系统（棱镜）**，折射出独一无二的个人体验。

### MVP目标 - "棱镜之心"

创建一个包含**2个核心NPC**和**1个简单场景**的微型世界，让玩家体验完整的核心循环：
**基于信念的行动** → **认知失调** → **回响之室自省** → **信念演化**

## 技术架构

- **统一平台**: Vercel
- **前端**: Next.js (`packages/web`)
- **后端**: Python FastAPI (`packages/api`)
- **数据库**: Supabase (PostgreSQL + pgvector)
- **记忆引擎**: Zep
- **工作流引擎**: n8n
- **AI网关**: Vercel AI Gateway

## 快速开始

### 环境要求

- Node.js v20.x+
- Python 3.11+
- Git

### 开发环境设置

1. **克隆仓库**
   ```bash
   git clone https://github.com/Mike1075/helios-game.git
   cd helios-game
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发环境**
   ```bash
   npm run dev
   # 或
   vercel dev
   ```

### 项目结构

```
helios-game/
├── packages/
│   ├── web/          # Next.js 前端应用
│   │   ├── src/app/  # App Router 页面
│   │   └── src/components/
│   └── api/          # FastAPI 后端
│       ├── main.py   # API 入口
│       └── requirements.txt
├── docs/             # 项目文档
├── CLAUDE.md         # Claude Code 开发指南
├── package.json      # 根 package.json
└── vercel.json       # Vercel 部署配置
```

## 核心系统组件

### 1. 信念系统 (Belief System)
- Belief DSL: 结构化定义角色信念网络
- Belief Compiler: 将信念编译为LLM系统提示词
- 演化机制: 记录认知失调事件

### 2. 代理核心 (Agent Core)
- API端点: `/api/chat`
- 信念加载、记忆检索、LLM调用、日志记录

### 3. 回响之室 (Chamber of Echoes)
- API端点: `/api/echo`
- 生成主观的、第一人称因果解释

### 4. 导演引擎 (Director Engine)
- n8n工作流监听认知失调事件
- 自动触发"回响之室"机会

## 开发协作流程

### 分支规范
- `feature/[姓名]/[功能描述]`
- `fix/[姓名]/[修复描述]`

### 开发流程
1. 同步最新代码: `git checkout main && git pull origin main`
2. 创建功能分支: `git checkout -b feature/your-name/your-feature`
3. 本地开发: 使用 `vercel dev` 进行实时测试
4. 提交推送: `git push origin feature/your-name/your-feature`
5. 创建Pull Request到main分支
6. 等待审查和合并

## 环境变量

所有敏感信息通过Vercel环境变量管理：
- `VERCEL_AI_GATEWAY_URL`: AI网关端点
- `VERCEL_AI_GATEWAY_API_KEY`: API认证密钥
- `SUPABASE_URL`: 数据库URL
- `SUPABASE_ANON_KEY`: 数据库公钥
- `ZEP_API_KEY`: 记忆服务密钥

## MVP成功标准

1. **信念一致性**: NPC行为与其信念系统高度一致
2. **"Aha!"时刻**: 玩家在"回响之室"中产生"原来是我的想法导致了这一切"的感悟
3. **技术可行性**: 整个技术栈协同工作顺畅

## 贡献

请阅读 [项目协作开发说明书](./Helios项目协作开发说明书1.0.md) 了解详细的开发规范和流程。

## 项目文档

- [MVP需求文档 PRD](./Helios项目MVP说明书PRD1.0.md)
- [协作开发说明书](./Helios项目协作开发说明书1.0.md)
- [Claude Code 开发指南](./CLAUDE.md)

## 许可证

本项目为私有项目，仅供团队内部开发使用。

---

**让我们一起，用代码和AI，为这个世界注入第一缕意识之光。**

*Mike - Helios项目负责人*