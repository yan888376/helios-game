# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Helios** ("赫利俄斯") - **《日识》2035年新弧光城生活模拟器**

### 核心理念
**"第二次投胎"体验** - 用户穿越到2035年新弧光城社区，在自然生活中发现真实自我。这不是游戏，而是一面"本我之镜"，通过AI观察玩家真实行为，动态发现并映照内在信念系统。

### 核心创新
- **完全隐蔽的信念观察**：用户感觉在真实生活，实际被AI深度分析
- **个性化剧情生成**：基于信念系统的完全个性化体验路径  
- **自然觉醒机制**：像《失控玩家》一样水到渠成的自我觉醒
- **2035年真实社区**：AI无处不在但保持人情味的未来生活

### MVP目标
**"迷雾酒馆的邻里生活"** - 8个生活化NPC + 1个2035年社区酒馆场景，验证核心体验循环：
```
自然行为 → 隐蔽观察 → 信念积累 → 个性化事件 → 自然觉醒 → 自我发现
```

## Technical Architecture

- **Platform**: Vercel (unified deployment)
- **Frontend**: Next.js (`packages/web`)
- **Backend**: Python FastAPI on Vercel Serverless Functions (`packages/api`)
- **Database**: Supabase (PostgreSQL + pgvector)
- **Memory Engine**: Zep (conversation history)
- **AI Gateway**: Vercel AI Gateway (mandatory for all LLM calls)
- **Workflow Engine**: n8n (cognitive dissonance triggers)

## Monorepo Structure

```
packages/
├── web/          # Next.js frontend
└── api/          # Python/FastAPI backend
```

## Development Commands

### Setup and Installation
```bash
# Initial setup (from root)
npm install
```

### Local Development (Zero-Trust Mode)
```bash
# Frontend development (UI debugging)
npm run dev:web

# Backend development (API logic, requires: pip install uvicorn fastapi)
npm run dev:api
```

**Important**: Local development runs without API keys. External API calls will fail (expected behavior). Complete functionality testing is done via GitHub PR Vercel preview environments.

## 2035年新弧光城设定

### 🏙️ 世界观
**新弧光城**：中国东南沿海的AI试点城市，2035年人机共生的真实社区。不是科幻乌托邦，而是AI技术普及后的真实生活场景。

**核心场景：迷雾酒馆**
- 2035年版社区客厅，各种背景邻居的聚集地
- 传统酒馆 + 未来科技元素（量子调酒、情感音响）
- 酒馆老板老王：最会观察人的角色，15年酒馆经验

### 👥 8个生活化社区居民（NPC）

#### 核心设计原则
不是功能性NPC，而是真实的2035年邻居，每个人都有自己的生活困扰和AI时代适应问题。

**角色列表**：
1. **老王** (50岁) - 酒馆老板，最会观察人际关系模式
2. **小美** (32岁) - 护士，测试用户同理心和助人倾向  
3. **小林** (28岁) - AI公司程序员，观察技术伦理态度
4. **阿华** (35岁) - 外卖员，最接地气，测试社会责任感
5. **张师傅** (65岁) - 退休工人，代表传统智慧和价值观
6. **小雨** (22岁) - 艺术生，测试创新精神和审美观
7. **陈叔** (45岁) - 出租车司机，观察适应能力和务实态度
8. **小江** (38岁) - 全职妈妈，测试责任感和教育理念

## Core System Components

### 1. 隐蔽信念观察系统
- **InvisibleBeliefTracker**: 完全隐蔽的行为分析引擎
- **信念维度**: 同理心、正义感、独立思考、创新精神、责任感
- **数据收集**: 从自然对话选择中提取信念信号
- **用户无感知**: 用户感觉只是在和邻居聊天

### 2. 个性化事件生成引擎
- **API**: `/api/chat` - 核心对话交互
- **处理流程**: 记录选择 → 分析信念 → 匹配事件 → 生成个性化内容
- **动态剧情**: 基于用户信念特征生成完全不同的故事线

### 3. 自然觉醒触发机制
- **四阶段觉醒**: 日常积累 → 信念强化 → 临界积累 → 自然觉醒
- **触发条件**: 信念积累达到阈值时自动解锁突破性选项
- **觉醒表现**: 从规则遵守者变为规则挑战者

### 4. 用户信念档案生成
- **最终输出**: 基于真实行为的深度信念分析报告
- **呈现方式**: "2035年AI助手个性化设定"的形式
- **价值**: 让用户发现真实自我，获得深刻洞察

## Mandatory Development Contracts

### Environment Variables (Managed by Mike via Vercel)
**Backend Variables** (Python `os.environ.get()`):
- `VERCEL_AI_GATEWAY_URL`: AI Gateway endpoint
- `VERCEL_AI_GATEWAY_API_KEY`: Gateway authentication
- `SUPABASE_URL`: Database URL
- `SUPABASE_SERVICE_KEY`: Database service key
- `ZEP_API_KEY`: Memory service key

**Frontend Variables** (Next.js `process.env.`):
- `NEXT_PUBLIC_SUPABASE_URL`: Public database URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public database key

**Note**: Never hardcode secrets. Variables are only available in Vercel preview/production environments, not locally.

### LLM Call Standard
All AI model calls **MUST** go through Vercel AI Gateway:

```python
import os
import requests

VERCEL_AI_GATEWAY_URL = os.environ.get("VERCEL_AI_GATEWAY_URL")
VERCEL_AI_GATEWAY_API_KEY = os.environ.get("VERCEL_AI_GATEWAY_API_KEY")

def call_llm(model_name: str, system_prompt: str, user_prompt: str):
    headers = {
        "Authorization": f"Bearer {VERCEL_AI_GATEWAY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": 2048
    }
    
    response = requests.post(f"{VERCEL_AI_GATEWAY_URL}/chat/completions", headers=headers, json=payload)
    response.raise_for_status()
    
    return response.json()["choices"][0]["message"]["content"]
```

## Git Workflow

### Branch Naming Convention
- `feature/[name]/[description]` - New features
- `fix/[name]/[description]` - Bug fixes
- Example: `feature/ethan/agent-core-base`

### Zero-Trust Development Workflow
1. **Sync**: `git checkout main && git pull origin main`
2. **Create branch**: `git checkout -b feature/your-name/your-feature`
3. **Local coding**: Use `npm run dev:web` or `npm run dev:api` for development
4. **Push**: `git push origin feature/your-name/your-feature`
5. **Create PR**: Submit PR with Vercel preview deployment link for cloud testing
6. **Code review**: Wait for Mike's approval and merge

**Critical**: 
- Never push directly to `main` branch
- Local development is for coding only
- Full functionality testing happens in Vercel preview environments

## MVP核心功能

### ✅ 必须实现
- **2035年酒馆场景**: 简洁2D界面，营造未来社区氛围
- **8个生活化NPC**: 每个角色有独特的观察维度和测试目标
- **隐蔽信念分析**: 从用户自然选择推断5大信念维度
- **个性化事件生成**: 根据用户特征动态生成不同剧情
- **自然觉醒机制**: 四阶段积累，水到渠成的突破时刻
- **完整体验循环**: 自然行为 → 信念观察 → 个性化剧情 → 自我觉醒

### ❌ 暂不实现
- 复杂3D场景和视觉效果
- 多场景切换（专注酒馆一个场景）
- 游戏化元素（等级、积分、任务系统）
- 多人在线互动
- 离线AI代理活动

### 🎯 核心验证目标
- 用户感觉在真实生活（非测试）> 85%
- 信念分析与用户自评匹配度 > 80%  
- 觉醒体验自然度 > 75%
- 完整流程完成率 > 70%

## MVP成功标准

### 🎯 体验质量指标
1. **沉浸感验证**:
   - 90% 用户感觉真的生活在2035年
   - 85% 用户认为NPC像真实邻居
   - 80% 用户认为AI技术使用自然流畅
   - 75% 用户主动探索超过60分钟

2. **信念分析效果**:
   - 用户行为与日常一致性 > 85%
   - AI分析与用户自评匹配度 > 80%
   - 用户获得重要自我洞察 > 70%
   - 用户未感到"被测试" > 90%

3. **觉醒体验质量**:
   - 觉醒时机感觉自然 > 75%
   - 觉醒后能成功挑战规则 > 80%
   - 不同用户体验明显不同剧情 > 90%

### 🌟 理想用户体验
**用户应该说**: "我以为我在体验未来，没想到我发现了自己。在2035年的社区里，我活出了最真实的模样。这不是游戏，这是人生的另一种可能。"

### 🔧 技术性能指标
- AI对话响应 < 3秒 (95%情况)
- 支持200个同时在线用户  
- 99.5%系统可用时间
- 信念分析准确率 > 85%

## Key Files to Watch

- `vercel.json`: Deployment configuration
- `packages/api/main.py`: FastAPI backend entry point
- `packages/api/requirements.txt`: Python dependencies
- `packages/web/`: Next.js frontend application