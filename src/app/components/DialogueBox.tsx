import { motion } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";

import type { SceneEntryType } from "../types/story";

export function DialogueBox({
  entryType = "dialogue",
  speaker,
  text,
  onNext,
  onPrev,
  canNext,
  canPrev,
  isChoiceState,
}: {
  entryType?: SceneEntryType;
  speaker: string;
  text: string;
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  canPrev: boolean;
  isChoiceState: boolean;
}) {
  const isChapterCard = entryType === "chapter-card";
  const isThought = entryType === "thought";
  const isNarration = entryType === "narration";
  const showSpeaker = !isChapterCard && speaker.trim().length > 0;

  return (
    <div
      className={`w-full max-w-5xl mx-auto rounded-md overflow-hidden relative backdrop-blur-md transition-all duration-1000 ${
        isChoiceState ? "opacity-60 scale-95 blur-[1px]" : "opacity-100 scale-100 blur-0"
      }`}
    >
      {/* Background with slight paper/moonlight texture */}
      <div className="absolute inset-0 bg-[#e8e3d9]/5 mix-blend-screen" />
      <div className="absolute inset-0 bg-[#1f1b24]/70" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a3b5c6]/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#4a3e59]/50 to-transparent" />
      
      {/* Frame emboss */}
      <div className="absolute inset-0 border-[0.5px] border-[#a3b5c6]/10 rounded-md pointer-events-none" />

      <div
        className={`relative z-10 text-[#f2efe9] ${
          isChapterCard
            ? "px-8 py-10 md:px-12 md:py-14"
            : "p-8 md:p-10 flex flex-col md:flex-row gap-6 md:gap-12"
        }`}
      >
        {/* Name Plate */}
        {!isChapterCard && (
          <div className="w-32 md:w-40 flex-shrink-0 flex items-start pt-2">
            {showSpeaker ? (
              <motion.h3
                key={speaker}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`text-2xl font-serif tracking-widest relative ${
                  isThought ? "text-[#c7b7cf]" : isNarration ? "text-[#d5c8b1]" : "text-[#a3b5c6]"
                }`}
              >
                {speaker}
                <span
                  className={`absolute -bottom-2 left-0 w-8 h-[1px] ${
                    isThought ? "bg-[#7f5b7f]/80" : isNarration ? "bg-[#7b6654]/80" : "bg-[#4a3e59]/80"
                  }`}
                />
              </motion.h3>
            ) : (
              <div />
            )}
          </div>
        )}

        {/* Text Area */}
        <div
          className={`flex flex-col justify-between ${
            isChapterCard ? "min-h-[180px] items-center text-center" : "flex-1 min-h-[120px]"
          }`}
        >
          <motion.p
            key={`${entryType}:${text}`}
            initial={{ opacity: 0, y: isChapterCard ? 8 : 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className={`font-serif tracking-wide ${
              isChapterCard
                ? "max-w-3xl text-3xl leading-snug md:text-4xl"
                : isThought
                  ? "text-xl italic leading-loose text-[#efe4f0] md:text-[22px]"
                  : isNarration
                    ? "text-xl leading-relaxed text-[#f0e8da] md:text-[22px]"
                    : "text-xl leading-relaxed md:text-[22px]"
            }`}
            style={{ fontWeight: 300 }}
          >
            {text}
          </motion.p>

          {/* Navigation Controls */}
          <div
            className={`flex gap-6 mt-6 pt-4 border-t border-[#a3b5c6]/10 ${
              isChapterCard ? "w-full justify-center" : "justify-end"
            }`}
          >
            <button
              onClick={onPrev}
              disabled={!canPrev}
              className={`flex items-center gap-2 px-2 py-1 transition-all duration-300 ${
                canPrev ? "text-[#a3b5c6]/60 hover:text-[#f2efe9]" : "opacity-0 pointer-events-none"
              }`}
            >
              <ChevronLeft size={16} strokeWidth={1} />
              <span className="text-sm tracking-widest font-serif hidden md:inline">上一句</span>
            </button>
            
            <button
              onClick={onNext}
              disabled={!canNext}
              className={`group flex items-center gap-2 px-2 py-1 transition-all duration-300 ${
                canNext ? "text-[#a3b5c6]/90 hover:text-[#f2efe9]" : "opacity-0 pointer-events-none"
              }`}
            >
              <span className="text-sm tracking-widest font-serif hidden md:inline">下一句</span>
              <ChevronRight
                size={16}
                strokeWidth={1}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
