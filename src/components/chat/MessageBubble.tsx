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

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[88%] space-y-2.5">
        <div
          className={`
            rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed
            ${
              isUser
                ? "bg-[#1A1A1A] text-white rounded-br-md"
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
              {message.quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => onQuickReply?.(reply)}
                  className="rounded-full border border-[#DDD5CA] bg-white px-3 py-1.5 text-[12px] font-medium text-[#5C4F3D] transition-all duration-200 hover:border-[#B8A48E] hover:bg-[#FAF7F2]"
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
