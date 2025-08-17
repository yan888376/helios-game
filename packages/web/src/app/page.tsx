'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';

// NPC角色定义 - 基于信念系统档案
const characters = {
  alex: {
    name: "艾克斯",
    occupation: "数据分析师",
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
    borderColor: "border-blue-400",
    textColor: "text-blue-400",
    description: "理性、逻辑思维强，专注技术和数据"
  },
  rachel: {
    name: "瑞秋", 
    occupation: "酒保",
    color: "pink",
    gradient: "from-pink-500 to-red-500",
    borderColor: "border-pink-400",
    textColor: "text-pink-400",
    description: "感性、重视人情，善于倾听和理解"
  },
  nova: {
    name: "诺娃",
    occupation: "原生AI", 
    color: "purple",
    gradient: "from-purple-500 to-indigo-500",
    borderColor: "border-purple-400",
    textColor: "text-purple-400",
    description: "哲学思维，探索存在的意义"
  }
} as const;

type CharacterKey = keyof typeof characters;

export default function YuhanChatMVP() {
  const [activeNPC, setActiveNPC] = useState<CharacterKey>('alex');
  const [relationships, setRelationships] = useState({
    alex: 0,
    rachel: 0,
    nova: 0
  });
  
  const [userTendency, setUserTendency] = useState({
    tech: 0,
    human: 0,
    philosophy: 0
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      character: activeNPC,
      context: {
        userTendency,
        relationships
      }
    }
  });

  // 自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            钰涵的Helios聊天MVP
          </h1>
          <p className="text-gray-300">
            基于信念系统档案的AI角色对话实验
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* 角色选择面板 */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-center">选择对话角色</h3>
            <div className="space-y-3">
              {Object.entries(characters).map(([key, char]) => (
                <button
                  key={key}
                  onClick={() => setActiveNPC(key as CharacterKey)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    activeNPC === key 
                      ? `${char.borderColor} bg-gradient-to-r ${char.gradient} bg-opacity-20` 
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className={`font-semibold ${char.textColor}`}>
                    {char.name}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {char.occupation}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {char.description}
                  </div>
                </button>
              ))}
            </div>

            {/* 关系状态 */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="text-sm font-semibold mb-3 text-gray-300">关系状态</h4>
              {Object.entries(relationships).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs mb-2">
                  <span className={characters[key as CharacterKey].textColor}>
                    {characters[key as CharacterKey].name}
                  </span>
                  <span className={value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'}>
                    {value > 0 ? '+' : ''}{value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 聊天区域 */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg h-[600px] flex flex-col">
              {/* 当前角色信息 */}
              <div className={`p-4 bg-gradient-to-r ${characters[activeNPC].gradient} bg-opacity-20 border-b border-gray-700`}>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${characters[activeNPC].gradient} bg-gradient-to-r mr-3`}></div>
                  <div>
                    <div className={`font-semibold ${characters[activeNPC].textColor}`}>
                      正在与 {characters[activeNPC].name} 对话
                    </div>
                    <div className="text-sm text-gray-400">
                      {characters[activeNPC].occupation} - {characters[activeNPC].description}
                    </div>
                  </div>
                </div>
              </div>

              {/* 消息列表 */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <p>开始与 {characters[activeNPC].name} 对话吧！</p>
                    <p className="text-sm mt-2">这是基于信念系统档案的AI角色对话实验</p>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : `bg-gray-700 ${characters[activeNPC].textColor} border ${characters[activeNPC].borderColor}`
                      }`}
                    >
                      {message.role !== 'user' && (
                        <div className="text-xs opacity-75 mb-1">
                          {characters[activeNPC].name}
                        </div>
                      )}
                      <div className="text-sm">{message.content}</div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-700 ${characters[activeNPC].textColor} border ${characters[activeNPC].borderColor}`}>
                      <div className="text-xs opacity-75 mb-1">
                        {characters[activeNPC].name}
                      </div>
                      <div className="text-sm">正在思考...</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 输入区域 */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder={`与${characters[activeNPC].name}对话...`}
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    发送
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🎯 这是钰涵基于Helios信念系统档案创建的聊天MVP</p>
          <p>🌿 分支: feature/yuhan/chat-mvp | 📅 {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </main>
  );
}