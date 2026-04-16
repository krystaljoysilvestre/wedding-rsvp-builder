"use client";

import { WeddingProvider } from "@/context/WeddingContext";
import ChatPanel from "@/components/chat/ChatPanel";
import WeddingPreview from "@/components/preview/WeddingPreview";

export default function Home() {
  return (
    <WeddingProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Chat — left side */}
        <div className="w-full flex-shrink-0 md:w-[400px] lg:w-[420px]">
          <ChatPanel />
        </div>

        {/* Preview — right side */}
        <div className="hidden flex-1 md:block">
          <WeddingPreview />
        </div>
      </div>
    </WeddingProvider>
  );
}
