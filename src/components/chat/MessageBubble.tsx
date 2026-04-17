"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  onQuickReply?: (text: string) => void;
  isLatest: boolean;
}

export default function MessageBubble({
  message,
  onQuickReply,
  isLatest,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const ref = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = isUser ? "translateX(12px)" : "translateX(-12px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 500ms ease, transform 600ms cubic-bezier(0.4, 0, 0.2, 1)";
      el.style.opacity = "1";
      el.style.transform = "translateX(0)";
    });
  }, [isUser]);

  return (
    <div ref={ref} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[88%] space-y-2.5">
        <div
          className={`
            rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed
            transition-shadow duration-300
            ${
              isUser
                ? "bg-[#1A1A1A] text-white rounded-br-md shadow-sm"
                : "bg-[#F5F3EF] text-[#2C2C2C] rounded-bl-md"
            }
          `}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Quick replies — only show on the latest assistant message */}
        {!isUser &&
          isLatest &&
          message.quickReplies &&
          message.quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {message.quickReplies.map((reply, i) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => onQuickReply?.(reply)}
                  className="quick-reply-btn rounded-full border border-[#DDD5CA] bg-white px-3 py-1.5 text-[12px] font-medium text-[#5C4F3D] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B8A48E] hover:bg-[#FAF7F2] hover:shadow-sm"
                  style={{
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
