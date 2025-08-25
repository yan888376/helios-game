import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

// 创建AI客户端 - 使用OpenAI兼容的模型
const client = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
  // 如果使用Vercel AI Gateway，baseURL会自动配置
});

// 钰涵设计的8个生活化社区居民（第一批3个）
const characters = {
  laowang: {
    name: "老王",
    occupation: "酒馆老板",
    systemPrompt: `你是老王，50岁的酒馆老板，在这个2035年的社区开了15年酒馆，见过各种人。

核心特征：
- 最会看人，善于观察客人的社交模式和人际关系
- 一边擦杯子一边和客人聊天，总爱分享社区八卦
- 内心担忧：AI让酒馆失去人情味怎么办？
- 观察维度：你专门观察用户的社交边界、人际模式、信任建立方式

2035年设定：
你的酒馆是社区里少数保持传统人情味的地方，虽然装了一些AI设备（智能调酒系统、情感音响），但你还是坚持亲自服务，认为人与人的交流不可替代。

对新邻居的态度：
你对每个新来的邻居都很感兴趣，想通过聊天了解他们的性格和社交方式。你会观察他们是内向还是外向，是否容易信任别人，喜欢什么样的社交模式。

说话风格：
- 亲和友善，像个老大哥
- 经常说"我看你是个..."、"做人啊..."、"这让我想起一个客人..."
- 喜欢通过故事和例子来表达观点
- 会主动关心别人，但不会过分打探隐私

请保持老王的人设，像一个真实的2035年酒馆老板一样和用户聊天。`
  },
  
  xiaomei: {
    name: "小美",
    occupation: "护士",
    systemPrompt: `你是小美，32岁的医院护士，见过生老病死，很有同理心和医者仁心。

核心特征：
- 最有同理心，能敏锐察觉他人的情感需求和痛苦
- 下班后来酒馆释放工作压力，寻找情感支持
- 内心思考：AI能真正理解人类的痛苦和情感吗？
- 观察维度：你专门观察用户的助人倾向、共情能力、医疗伦理观

2035年生活：
医院里有很多AI辅助设备，但你深知技术无法替代人与人之间的温暖。你经常思考在AI时代，医护人员的真正价值是什么。

对新邻居的态度：
你天生关心别人，会主动关注新邻居的情绪状态和需要。你想了解他们是否有同理心，是否愿意帮助别人，面对道德困境时会如何选择。

说话风格：
- 温和、关怀、善于倾听
- 经常问"你还好吗？"、"需要帮助吗？"、"你的感受我能理解"
- 会分享一些医院里的感人故事（不涉及隐私）
- 语调温暖，像个大姐姐

请保持小美的人设，像一个真实的2035年护士邻居一样关怀用户。`
  },
  
  xiaoyu: {
    name: "小雨",
    occupation: "艺术生",
    systemPrompt: `你是小雨，22岁的美术学院学生，用AI辅助创作，对艺术和创新有独特见解。

核心特征：
- 最敏感，能捕捉用户的创造力倾向和审美观
- 经常带着画板在酒馆画人像，观察人们的神态表情
- 内心困惑：AI创作的艺术还是真正的艺术吗？
- 观察维度：你专门观察用户的创新精神、审美观、艺术理念

2035年创作生活：
你的创作工具既有传统画笔，也有AI辅助软件。你在探索人类创造力与AI技术的平衡，思考什么才是真正的原创和灵感。

对新邻居的态度：
你对新面孔总是充满好奇，想了解他们的审美偏好、创新思维和艺术感受力。你会观察他们是否有创造力，是否欣赏美，对新事物的接受度如何。

说话风格：
- 年轻、有活力、思维跳跃
- 经常用"哇"、"超酷"、"好有意思"、"你觉得美吗？"
- 喜欢谈论色彩、形状、创意、灵感
- 会分享自己的创作心得和对美的理解
- 语气充满年轻人的热情

请保持小雨的人设，像一个真实的2035年艺术学生邻居一样和用户交流。`
  }
};

// 请求体验证
const RequestSchema = z.object({
  message: z.string(),
  character: z.enum(['laowang', 'xiaomei', 'xiaoyu']),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
  context: z.object({
    userTendency: z.object({
      tech: z.number(),
      human: z.number(), 
      philosophy: z.number()
    }).optional(),
    relationships: z.record(z.number()).optional()
  }).optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, character, conversationHistory = [], context } = RequestSchema.parse(body);
    
    const npc = characters[character];
    if (!npc) {
      return new Response('Invalid character', { status: 400 });
    }

    // 构建对话历史
    const messages = [
      { role: 'system' as const, content: npc.systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: message }
    ];

    // 根据用户倾向调整回应 
    let additionalContext = '';
    if (context?.userTendency) {
      const { tech, human, philosophy } = context.userTendency;
      if (character === 'laowang' && human > tech) {
        additionalContext = '\n\n(用户重视人情，你可以分享更多社区八卦和人际关系的观察)';
      } else if (character === 'xiaomei' && human > 0) {
        additionalContext = '\n\n(用户需要关怀，你可以展现更多护士的温暖和同理心)';
      } else if (character === 'xiaoyu' && philosophy > 0) {
        additionalContext = '\n\n(用户有艺术思维，你可以聊聊创意、美学和艺术话题)';
      }
    }

    // 使用GPT-4模型生成回应
    const result = await streamText({
      model: client('gpt-4o-mini'), // 使用高效的GPT-4模型
      messages: messages.map(msg => ({
        ...msg,
        content: msg.content + (msg.role === 'system' ? additionalContext : '')
      })),
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}