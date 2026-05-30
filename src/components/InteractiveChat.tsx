import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Copy, Check, Info } from "lucide-react";
import { Message } from "../types";

interface InteractiveChatProps {
  chatMessages: Message[];
  setChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isChatSending: boolean;
  onSendChatMessage: (text: string) => void;
}

export default function InteractiveChat({
  chatMessages,
  setChatMessages,
  isChatSending,
  onSendChatMessage,
}: InteractiveChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatSending]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isChatSending) return;
    onSendChatMessage(inputValue.trim());
    setInputValue("");
  };

  const handleChipClick = (placeholderQuery: string) => {
    if (isChatSending) return;
    onSendChatMessage(placeholderQuery);
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptChips = [
    "What is the primary baseline compared against?",
    "Break down the core mathematical theorems or logic.",
    "Describe the dataset size, source, and limitations.",
    "What hardware or compute specifications were utilized?",
  ];

  return (
    <div className="flex flex-col h-full min-h-[450px]">
      
      {/* Context Bounds Alert */}
      <div className="flex items-start space-x-3 rounded-none bg-[#F5F5F0] border border-[#E5E5E1] p-4 mb-5 text-xs text-[#1A1A1A]">
        <Info className="h-4 w-4 text-[#1A1A1A] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold uppercase tracking-widest font-mono text-[9px] text-[#1A1A1A] block">Strict Grounding Confines:</span>
          <p className="font-sans text-[#666660] mt-1">
            PaperPilot AI reviews queries exclusively through facts in the uploaded paper text. If information isn't present, the AI will clearly declare so.
          </p>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 min-h-[250px] overflow-y-auto mb-5 border border-[#E5E5E1] rounded-none bg-[#FDFDFB] p-5 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
            <div className="flex h-11 w-11 items-center justify-center rounded-none bg-[#F5F5F0] text-[#1A1A1A] border border-[#E5E5E1] mb-2">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h4 className="font-serif italic text-base font-semibold text-[#1A1A1A]">Initiate Dialogue</h4>
            <p className="font-sans text-xs text-[#666660] max-w-sm mt-1 leading-relaxed">
              Query specific aspects of this research paper—claims, equations, tables, performance results or definitions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-none p-4 shadow-none relative group ${
                    isUser
                      ? "bg-[#1A1A1A] text-white border border-[#1A1A1A]"
                      : "bg-[#F5F5F0] border border-[#E5E5E1] text-[#1A1A1A]"
                  }`}>
                    
                    {/* Role Header */}
                    <div className={`flex items-center justify-between mb-2 border-b pb-1 font-mono text-[9px] uppercase tracking-wider ${
                      isUser ? "border-zinc-700 text-zinc-350" : "border-stone-300 text-stone-500"
                    }`}>
                      <span className="font-bold">
                        {isUser ? "Researcher" : "PaperPilot Review Board"}
                      </span>
                      <span>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* text content */}
                    <p className={`font-sans text-xs leading-relaxed whitespace-pre-wrap select-text ${isUser ? 'text-zinc-200' : 'text-[#444440]'}`}>
                      {msg.text}
                    </p>

                    {/* Copy action for assistant answers */}
                    {!isUser && (
                      <button
                        onClick={() => copyMessage(msg.text, msg.id)}
                        className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition flex h-5 w-5 items-center justify-center rounded-none border border-[#E5E5E1] bg-white hover:bg-[#F5F5F0] text-[#1A1A1A]"
                        title="Copy text answer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}

                  </div>
                </div>
              );
            })}

            {/* loading state inside chat */}
            {isChatSending && (
              <div className="flex justify-start">
                <div className="rounded-none border border-[#E5E5E1] bg-[#F5F5F0] px-4 py-3.5 shadow-none">
                  <div className="flex items-center space-x-1.5 font-mono text-[9px] uppercase tracking-wider text-[#888880] mb-2 border-b border-stone-300 pb-1">
                    <span className="font-bold text-[#1A1A1A]">PaperPilot Review Board</span>
                    <span>&bull; Reasoning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1A1A1A]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1A1A1A] [animation-delay:0.2s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1A1A1A] [animation-delay:0.4s]" />
                    </div>
                    <span className="font-sans text-xs text-[#666660]">Retrieving paper constraints...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      {chatMessages.length === 0 && (
        <div className="mb-4">
          <span className="font-serif italic text-xs font-bold text-[#888880] block mb-2">
            Suggested Context Exploration Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                disabled={isChatSending}
                className="rounded-none border border-[#E5E5E1] bg-white hover:bg-[#F5F5F0] px-3 py-1.5 font-sans text-xs text-[#1A1A1A] hover:border-[#1A1A1A] transition-all text-left cursor-pointer disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input console */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isChatSending ? "Awaiting review resolution..." : "Ask questions directly inside the bounds of this paper..."}
          disabled={isChatSending}
          className="flex-1 rounded-none border border-[#E5E5E1] px-4 py-2.5 font-sans text-xs text-[#1A1A1A] placeholder-stone-400 bg-white focus:outline-none focus:border-black disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isChatSending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-[#1A1A1A] text-white hover:bg-black transition-all cursor-pointer disabled:bg-[#F5F5F0] disabled:text-[#888880] disabled:border-[#E5E5E1]"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
