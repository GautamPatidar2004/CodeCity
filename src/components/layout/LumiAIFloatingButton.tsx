import React, { useState } from 'react'
import { LumiPixelBot } from '../brand/PixelArtAvatars'
import {
  X,
  Send,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export const LumiAIFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMsg, setInputMsg] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'lumi' | 'user'; text: string; time: string }>>([
    {
      role: 'lumi',
      text: "Beep boop! 🤖 I'm Lumi, your personal coding mentor. Stuck on a quest, need syntax help, or want to brainstorm a game build? Ask me anything!",
      time: 'Just now',
    },
  ])
  const [isTyping, setIsTyping] = useState(false)

  const quickPrompts = [
    'Explain Python Loops simply 🐍',
    'How do arrays work in JavaScript? 📦',
    'Give me a hint for "Loops & Logic" 💡',
  ]

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMsg
    if (!text.trim()) return

    const userMessage = {
      role: 'user' as const,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInputMsg('')
    setIsTyping(true)

    setTimeout(() => {
      let reply = "Great question! In programming, breaking down the problem into smaller functions helps keep logic clear. Let's look at how loops iterate over data step-by-step!"
      if (text.toLowerCase().includes('loop')) {
        reply = "In Python, a `for` loop lets you repeat actions cleanly:\n```python\nfor quest in range(3):\n    print('Conquering quest #', quest + 1)\n```\nIt continues until the condition is met. You're 78% of the way through!"
      } else if (text.toLowerCase().includes('array')) {
        reply = "Arrays in JavaScript are zero-indexed ordered lists. Example:\n```javascript\nconst inventory = ['Sword', 'Potion', 'Shield'];\nconsole.log(inventory[0]); // 'Sword'\n```"
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'lumi',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsTyping(false)
    }, 900)
  }

  return (
    <>
      {/* 1. Global Floating Pill Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 select-none">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981] hover:bg-[#059669] active:bg-emerald-800 text-white shadow-[0_6px_20px_rgba(16,185,129,0.35)] border border-emerald-400/80 transition-all duration-300 cursor-pointer",
            isOpen && "scale-95 bg-slate-900 border-slate-700 hover:bg-slate-800"
          )}
          title="Ask Lumi AI Mentor"
        >
          <img src="/extracted/lumi_bot.png" alt="Lumi" className="w-6 h-6 object-contain" />
          <span className="font-bold text-xs tracking-wide pr-0.5">
            {isOpen ? 'Close' : 'Ask Lumi'}
          </span>
        </button>
      </div>

      {/* 2. Slide-out Interactive AI Mentor Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-32px)] h-[520px] bg-white rounded-3xl border-2 border-[#ece7df] shadow-2xl flex flex-col overflow-hidden text-left animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Drawer Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <LumiPixelBot size={28} glowing={false} />
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>Lumi AI Companion</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/30 text-emerald-100 text-[8.5px] font-pixel">
                    ONLINE
                  </span>
                </div>
                <div className="text-[10px] text-emerald-100/80 font-medium">Coding Conflicts AI Mentor</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#faf8f4]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex flex-col max-w-[85%] text-xs",
                  m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-xs",
                    m.role === 'user'
                      ? "bg-emerald-600 text-white rounded-br-xs"
                      : "bg-white text-stone-800 border border-[#ece7df] rounded-bl-xs font-sans"
                  )}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-stone-400 mt-1 px-1 font-mono">{m.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="mr-auto flex items-center gap-1 p-2.5 rounded-2xl bg-white border border-[#ece7df] text-stone-400 text-xs">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
              </div>
            )}
          </div>

          {/* Quick Starter Chips */}
          <div className="px-3 py-2 bg-white border-t border-[#ece7df] flex items-center gap-1.5 overflow-x-auto">
            {quickPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10.5px] font-semibold shrink-0 transition-colors cursor-pointer border border-emerald-200/60"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="p-3 bg-white border-t border-[#ece7df] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask Lumi about code, syntax, quests..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
