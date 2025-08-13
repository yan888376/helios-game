

### **“赫利俄斯”项目协作开发说明书 v1.0**

**致所有创世成员（以及辅助你们的AI伙伴）：**

欢迎来到“赫利俄斯”项目。我们正在创造的不是一个游戏，而是一个“意识的棱镜”。我们的开发模式同样是革命性的：**以人类智慧为舵，以AI能力为帆**。

本说明书是我们协作的唯一“契约”，旨在确保我们16人的团队能像一个高效的意识共同体一样运作。请你和你的AI编程伙伴仔细阅读并严格遵守。

#### **一、 核心协作流程总览**

我们的整个开发流程基于**GitHub的分支与拉取请求（Pull Request）**模型，由Vercel进行全自动预览和部署。

**流程：**
**创建分支 → 本地开发 → 推送分支 → 创建PR → 团队审查 → 合并分支 → 自动部署**

在这个流程中，**`main`分支是神圣的**，它代表了我们“活性世界”的当前稳定版本。任何人（包括Mike）都**绝不能**直接向`main`分支推送代码。

#### **二、 本地开发环境设置（一次性）**

你的AI编程助手可以辅助你完成以下所有步骤。

**1. 先决条件:**
请确保你的电脑已安装以下软件：

* **Git:** 用于版本控制。
* **Node.js:** (建议 v20.x 或更高) 用于运行前端。
* **Python:** (建议 v3.11 或更高) 用于运行后端API。
* **Vercel CLI:** 在终端运行 `npm install -g vercel` 进行全局安装。

**2. 克隆中央仓库:**
打开你的终端，运行以下命令：

```bash
git clone https://github.com/Mike1075/helios-game.git
cd helios-game
```

**3. 项目结构说明:**
这是一个统一代码库（Monorepo）。所有代码都在 `packages` 文件夹下：

* `packages/web`: 我们的Next.js前端应用。
* `packages/api`: 我们的Python/FastAPI后端应用 (Agent Core, 回响之室)。

**4. 初始化项目 (首次设置):**
由于仓库是空的，请在你克隆下来的`helios-game`根目录下，创建以下文件和文件夹结构。你可以直接让你的AI助手帮你完成。

**文件1: `package.json` (在根目录)**

```json
{
  "name": "helios-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "vercel dev"
  },
  "devDependencies": {
    "vercel": "^34.0.0"
  }
}
```

**文件2: `vercel.json` (在根目录)**

```json
{
  "builds": [
    {
      "src": "packages/web/next.config.js",
      "use": "@vercel/next"
    },
    {
      "src": "packages/api/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "packages/api/main.py"
    },
    {
      "src": "/(.*)",
      "dest": "packages/web"
    }
  ]
}
```

**文件3: `packages/api/requirements.txt`**

```
fastapi
uvicorn
pydantic
python-dotenv
requests 
# 稍后会添加 supabase, zep 等库
```

*请先创建`packages/api`文件夹，再在其中创建此文件。*

**5. 启动本地开发环境:**
在项目根目录运行 `npm install` 安装依赖，然后运行：

```bash
vercel dev
```

此命令会同时启动前端和后端，并自动加载Vercel云端的环境变量。你的本地开发环境现在已经完全模拟了线上环境。

#### **三、 项目契约：我们共同遵守的法则**

**契约一：环境变量（由Mike在Vercel云端统一管理）**

所有敏感信息都作为环境变量存储在Vercel上。**任何人都不得在代码中硬编码密钥。**

* `VERCEL_AI_GATEWAY_URL`: Vercel AI Gateway的统一API端点地址。
* `VERCEL_AI_GATEWAY_API_KEY`: Vercel AI Gateway的认证令牌。
* `SUPABASE_URL`: 你Supabase项目的URL。
* `SUPABASE_ANON_KEY`: 你Supabase项目的匿名公钥。
* `ZEP_API_KEY`: Zep服务的API密钥。

**对于本地开发：** 你无需关心这些密钥的值。`vercel dev`命令会自动将它们同步到你的本地环境。

**契约二：Vercel AI Gateway 调用规范**

所有对大模型的调用，**必须**通过Vercel AI Gateway。以下是Python示例代码，请你和你的AI助手参考。

```python
# In packages/api/main.py
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
    response.raise_for_status() # Will raise an exception for HTTP error codes

    return response.json()["choices"][0]["message"]["content"]

# Example usage:
# reply = call_llm(
#     model_name="anthropic/claude-3-5-sonnet",
#     system_prompt="You are a helpful assistant.",
#     user_prompt="Why is the sky blue?"
# )
```

**契约三：Git分支与PR规范**

1. **分支命名：** `类型/你的名字/简短功能描述`。例如：
   * `feature/ethan/agent-core-base`
   * `fix/rabbit/npc-prompt-typo`
2. **PR标题：** 清晰说明PR的目的。例如：`feat: Implement base Agent Core API`。
3. **PR描述：**
   * **What:** 这个PR做了什么？
   * **Why:** 为什么要做？
   * **How:** 是如何实现的？
   * **最重要的：** 附上Vercel自动生成的**预览部署链接**，供团队测试。

#### **四、 你的第一次贡献流程**

1. **同步最新代码：** `git checkout main` 然后 `git pull origin main`。
2. **创建你的分支：** `git checkout -b feature/your-name/your-feature`。
3. **本地开发：** 在你的分支上，与你的AI伙伴一起编写代码。使用 `vercel dev` 进行实时测试。
4. **提交并推送：** `git add .` -> `git commit -m "feat: your commit message"` -> `git push origin feature/your-name/your-feature`。
5. **创建PR：** 在GitHub上，为你推送的分支创建一个指向`main`分支的Pull Request。
6. **审查与迭代：** 等待Vercel生成预览链接，粘贴到PR描述中。与团队成员（特别是Mike和正方形）进行讨论和修改。
7. **等待合并：** 一旦PR被批准，Mike会将其合并。恭喜，你的代码已成为“赫利俄斯”世界的一部分！

---

这份说明书是我们高效协作的基础。请严格遵守。让我们一起，用代码和AI，为这个世界注入第一缕意识之光。

**Mike**
**赫利俄斯项目负责人**
