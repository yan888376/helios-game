# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Helios** ("赫利俄斯") is a philosophical game project that creates a "consciousness exploration sandbox" - a "Prism of Consciousness" universe. Players invest their pure consciousness through unique belief systems, creating highly subjective experiences that together form an evolving shared reality.

The MVP goal is "Prism Heart" - a minimal world with 2 core NPCs and 1 simple scenario to validate the core experience loop: belief-based actions → cognitive dissonance → "Chamber of Echoes" self-reflection → belief evolution.

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
vercel dev  # Starts both frontend and backend with Vercel environment variables
```

### Local Development
```bash
vercel dev  # Primary development command - runs entire stack locally
```

## Core System Components

### 1. Belief System (信念系统)
- **Belief DSL**: YAML/JSON format for defining character belief networks
- **Belief Compiler**: Python script converting belief files to LLM system prompts
- **Components**: World-view beliefs, Self-perception beliefs, Value beliefs
- **Evolution Tracking**: Records cognitive dissonance events in `agent_logs`

### 2. Agent Core (代理核心)
- **Primary API**: `/api/chat` (receives `player_id` and `message`)
- **Process Flow**: Load beliefs from Supabase → Retrieve conversation history from Zep → Call LLM via Vercel AI Gateway → Log interaction
- **Response Requirement**: Fast, belief-consistent NPC responses

### 3. Chamber of Echoes (回响之室)
- **API Endpoint**: `/api/echo` (receives `player_id` and `event_id`)
- **Function**: Generates subjective, first-person causal explanations based on player's belief system
- **Output**: Subjective attribution + 1-2 supporting "memory evidence" events

### 4. Director Engine (导演引擎)
- **Implementation**: n8n workflow monitoring `agent_logs`
- **Trigger Logic**: Detects cognitive dissonance (positive actions → negative feedback)
- **Action**: Inserts records into `events` table to trigger Chamber of Echoes opportunities

## Mandatory Development Contracts

### Environment Variables (Managed by Mike via Vercel)
- `VERCEL_AI_GATEWAY_URL`: AI Gateway endpoint
- `VERCEL_AI_GATEWAY_API_KEY`: Gateway authentication
- `SUPABASE_URL`: Database URL
- `SUPABASE_ANON_KEY`: Database public key
- `ZEP_API_KEY`: Memory service key

**Note**: Never hardcode secrets. Use `vercel dev` for automatic environment variable sync.

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

### Pull Request Process
1. Sync: `git checkout main && git pull origin main`
2. Create branch: `git checkout -b feature/your-name/your-feature`
3. Develop with `vercel dev`
4. Push: `git push origin feature/your-name/your-feature`
5. Create PR with Vercel preview deployment link
6. Wait for Mike's approval and merge

**Critical**: Never push directly to `main` branch. All changes go through Pull Requests.

## MVP Scope

### ✅ In Scope
- Text-only frontend interface
- Simple belief system generation
- One scenario (tavern setting)
- Two NPCs with Belief DSL-defined personalities
- Complete core loop: conversation → logging → conflict detection → Chamber of Echoes trigger → subjective attribution

### ❌ Out of Scope
- Graphics, images, visual content
- Offline AI agents
- Complex world-building systems
- Multiple scenes/NPCs
- Combat, inventory, quest systems

## Success Criteria

1. **Belief Consistency**: NPCs demonstrate clear alignment between behavior and defined belief systems
2. **"Aha!" Moments**: Players experience "my thoughts created this outcome" realizations in Chamber of Echoes
3. **Technical Viability**: Full stack integration (Vercel, Supabase, n8n, Zep) operates smoothly

## Key Files to Watch

- `vercel.json`: Deployment configuration
- `packages/api/main.py`: FastAPI backend entry point
- `packages/api/requirements.txt`: Python dependencies
- `packages/web/`: Next.js frontend application