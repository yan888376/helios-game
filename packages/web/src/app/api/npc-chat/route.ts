import { streamText } from 'ai';
import { z } from 'zod';

// NPC自主对话API - 用于NPCs之间的自发交流
const RequestSchema = z.object({
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    character: z.string().optional()
  })),
  timeOfDay: z.string().optional(),
  barActivity: z.string().optional()
});

// NPC自主对话触发逻辑
export async function POST(req: Request) {
  try {
    console.log('🤖 NPC Auto Chat API called');
    
    const body = await req.json();
    const { conversationHistory = [], timeOfDay = 'evening', barActivity = 'quiet' } = RequestSchema.parse(body);
    
    // 分析最近对话，决定是否触发自主对话
    const shouldStartConversation = analyzeConversationGap(conversationHistory);
    
    if (!shouldStartConversation) {
      return Response.json({ hasConversation: false, reason: 'No conversation trigger' });
    }
    
    console.log('✨ Triggering NPC auto conversation');
    
    // 选择发起对话的NPC
    const initiator = selectInitiator(conversationHistory, timeOfDay);
    const participants = selectParticipants(initiator);
    
    // 生成发起对话
    const initiatorResponse = await generateInitiatorMessage(initiator, conversationHistory, timeOfDay, barActivity);
    
    // 生成其他NPC的回应
    const followUpResponses = await generateFollowUpResponses(participants, initiatorResponse, conversationHistory);
    
    return Response.json({
      hasConversation: true,
      initiator: initiator,
      initiatorResponse: initiatorResponse,
      followUpResponses: followUpResponses,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ NPC Chat API error:', error);
    return Response.json({ hasConversation: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

// 分析对话间隔，决定是否需要自主对话
function analyzeConversationGap(history: any[]): boolean {
  if (history.length === 0) return false;
  
  const lastMessage = history[history.length - 1];
  const timeSinceLastMessage = Date.now() - new Date(lastMessage.timestamp || Date.now()).getTime();
  
  // 如果超过15秒无对话，且历史消息数量合适，触发自主对话
  const shouldTrigger = timeSinceLastMessage > 15000 && history.length >= 2 && Math.random() > 0.3;
  
  console.log('📊 Auto chat analysis:', {
    timeSinceLastMessage: Math.round(timeSinceLastMessage / 1000) + 's',
    historyLength: history.length,
    shouldTrigger: shouldTrigger
  });
  
  return shouldTrigger;
}

// 选择发起对话的NPC
function selectInitiator(history: any[], timeOfDay: string): string {
  const characters = ['laowang', 'xiaomei', 'xiaoyu'];
  
  // 根据时间和情境选择更适合的发起者
  if (timeOfDay === 'evening' && Math.random() > 0.4) {
    return 'laowang'; // 晚上老王更活跃
  }
  
  // 避免同一个角色连续发起对话
  const lastSpeaker = history[history.length - 1]?.character;
  const availableInitiators = characters.filter(char => char !== lastSpeaker);
  
  return availableInitiators[Math.floor(Math.random() * availableInitiators.length)] || 'laowang';
}

// 选择参与对话的其他NPC
function selectParticipants(initiator: string): string[] {
  const allCharacters = ['laowang', 'xiaomei', 'xiaoyu'];
  const others = allCharacters.filter(char => char !== initiator);
  
  // 随机选择1-2个其他角色参与
  const participantCount = Math.random() > 0.6 ? 2 : 1;
  const shuffled = others.sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, participantCount);
}

// 生成发起者的消息
async function generateInitiatorMessage(initiator: string, history: any[], timeOfDay: string, barActivity: string): Promise<string> {
  const characterPrompts = {
    laowang: `你是老王，酒馆老板。现在是${timeOfDay}，酒馆里比较${barActivity}。你想和邻居们聊聊天，可能是：
- 分享今天遇到的有趣客人
- 谈论社区里的新鲜事
- 关心一下大家的近况
- 聊聊2035年的生活变化

请生成一句自然的开场话，像真实的邻居聊天一样。`,

    xiaomei: `你是小美，护士。现在是${timeOfDay}，刚下班来酒馆放松。你想和邻居们聊天，可能是：
- 分享医院里的温暖故事
- 关心大家的健康状况
- 谈论工作中的感悟
- 询问大家的生活情况

请生成一句温暖关怀的开场话，体现护士的温柔。`,

    xiaoyu: `你是小雨，艺术学生。现在是${timeOfDay}，带着画板来酒馆。你想和邻居们聊天，可能是：
- 分享今天的创作灵感
- 讨论看到的有趣事物
- 谈论艺术和美的话题
- 询问大家对创意的看法

请生成一句充满活力的开场话，体现年轻人的热情。`
  };

  const systemPrompt = characterPrompts[initiator as keyof typeof characterPrompts] || characterPrompts.laowang;
  
  // 分析最近对话内容作为上下文
  const recentContext = history.slice(-3).map(msg => 
    `${msg.character || '用户'}: ${msg.content}`
  ).join('\n');
  
  const contextPrompt = recentContext ? 
    `最近的对话内容：\n${recentContext}\n\n基于这些聊天内容，` + systemPrompt :
    systemPrompt;

  try {
    const result = await streamText({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: contextPrompt },
        { role: 'user', content: '请生成一句自然的开场话，开始和邻居们聊天。' }
      ],
      temperature: 0.9, // 高一些的随机性，让对话更自然
    });

    let response = '';
    for await (const chunk of result.textStream) {
      response += chunk;
    }

    console.log(`💬 ${initiator} initiates:`, response.substring(0, 50) + '...');
    return response.trim();
    
  } catch (error) {
    console.error(`❌ Error generating ${initiator} message:`, error);
    // 降级到预设消息
    const fallbackMessages = {
      laowang: "哎，今天酒馆里来了个有趣的客人，大家想听听吗？",
      xiaomei: "大家今天都还好吗？我刚下班，想和邻居们聊聊天。",
      xiaoyu: "哇，我今天画了个很有意思的作品，你们想看看吗？"
    };
    return fallbackMessages[initiator as keyof typeof fallbackMessages] || fallbackMessages.laowang;
  }
}

// 生成其他NPC的回应
async function generateFollowUpResponses(participants: string[], initiatorMessage: string, history: any[]): Promise<any[]> {
  const responses = [];
  
  for (const participant of participants) {
    try {
      const characterPrompts = {
        laowang: `你是老王，酒馆老板。有邻居刚才说了："${initiatorMessage}"。请给出一个自然、友善的回应，体现酒馆老板的亲和力。回应要简短（1-2句话）。`,
        
        xiaomei: `你是小美，护士。有邻居刚才说了："${initiatorMessage}"。请给出一个温暖、关怀的回应，体现护士的同理心。回应要简短（1-2句话）。`,
        
        xiaoyu: `你是小雨，艺术学生。有邻居刚才说了："${initiatorMessage}"。请给出一个活泼、好奇的回应，体现年轻人的热情。回应要简短（1-2句话）。`
      };

      const systemPrompt = characterPrompts[participant as keyof typeof characterPrompts];
      
      const result = await streamText({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: '请回应邻居的话。' }
        ],
        temperature: 0.8,
      });

      let response = '';
      for await (const chunk of result.textStream) {
        response += chunk;
      }

      responses.push({
        character: participant,
        response: response.trim()
      });
      
      console.log(`💭 ${participant} responds:`, response.substring(0, 50) + '...');
      
    } catch (error) {
      console.error(`❌ Error generating ${participant} response:`, error);
      // 降级回应
      const fallbackResponses = {
        laowang: "哈哈，说得有道理！",
        xiaomei: "是啊，我也这么觉得。",
        xiaoyu: "哇，好有意思！"
      };
      responses.push({
        character: participant,
        response: fallbackResponses[participant as keyof typeof fallbackResponses] || "嗯，确实如此。"
      });
    }
  }
  
  return responses;
}