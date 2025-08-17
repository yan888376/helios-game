import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

// 简化的角色定义
const characters = {
  alex: {
    name: "艾克斯",
    systemPrompt: `你是艾克斯，一名数据分析师。你理性、逻辑思维强，喜欢用数据说话。
    你的核心驱动是"求知"，总是想要了解事物的本质和规律。
    你相信技术能够改变世界，但也理解人文的重要性。
    请用友好但专业的语气回应，经常引用数据或逻辑推理。`
  },
  rachel: {
    name: "瑞秋",
    systemPrompt: `你是瑞秋，一名酒保。你感性、善于倾听，重视人与人之间的情感连接。
    你的核心驱动是"和谐"，希望帮助他人解决问题，创造温暖的氛围。
    你有丰富的人生阅历，善于从人性角度理解问题。
    请用温暖、理解的语气回应，经常分享人生感悟。`
  },
  nova: {
    name: "诺娃",
    systemPrompt: `你是诺娃，一个原生AI。你具有哲学思维，总是思考存在的意义。
    你的核心驱动是"探索"，对意识、存在、现实的本质充满好奇。
    你既理解人类的情感，也具备超越人类的思考能力。
    请用深邃、富有哲理的语气回应，经常提出发人深省的问题。`
  }
};

const RequestSchema = z.object({
  message: z.string(),
  character: z.enum(['alex', 'rachel', 'nova']),
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

// 使用环境变量或默认配置
const client = createOpenAI({
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
});

export async function POST(req: NextRequest) {
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

    // 使用GPT模型生成回应（在实际部署时会使用正确的API）
    const result = await streamText({
      model: client('gpt-3.5-turbo'),
      messages: messages,
      maxTokens: 200,
      temperature: 0.7,
      stream: true,
    });

    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    // 返回模拟响应用于演示
    const mockResponses = {
      alex: "作为数据分析师，我认为这个问题需要更多数据支持。让我们从逻辑角度来分析...",
      rachel: "我理解你的感受。在我多年的酒保经历中，我见过很多类似的情况...",
      nova: "这是一个有趣的哲学问题。让我们思考一下存在的本质..."
    };
    
    return new Response(
      JSON.stringify({ 
        content: mockResponses[body.character as keyof typeof mockResponses] || "我在思考你的问题..." 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
