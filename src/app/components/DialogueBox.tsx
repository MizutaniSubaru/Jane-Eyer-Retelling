import { motion } from "motion/react";

import type { SceneEntryType } from "../types/story";

function getSpeakerTone(speaker: string) {
  if (speaker.includes("简")) {
    return {
      textClass: "text-[#bec8df]",
      ruleClass: "bg-[#8794b0]/80",
    };
  }

  if (speaker.includes("罗切斯特")) {
    return {
      textClass: "text-[#d9c2a0]",
      ruleClass: "bg-[#8b7258]/80",
    };
  }

  return {
    textClass: "text-[#d9c6ae]",
    ruleClass: "bg-[#7b6654]/80",
  };
}

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
  const showSpeaker = !isChapterCard && !isNarration && speaker.trim().length > 0;
  const speakerTone = getSpeakerTone(speaker);

  return (
    <div
      data-testid="dialogue-box"
      onClick={canNext ? (event) => {
        event.stopPropagation();
        onNext();
      } : undefined}
      className={`w-full max-w-5xl mx-auto rounded-md overflow-hidden relative backdrop-blur-md transition-all duration-1000 ${
        isChoiceState ? "opacity-60 scale-95 blur-[1px]" : "opacity-100 scale-100 blur-0"
      } ${canNext ? "cursor-pointer" : ""}`}
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
            : "px-6 py-5 md:px-8 md:py-6"
        }`}
      >
        {/* Text Area */}
        <div
          data-testid="dialogue-content"
          className={`flex flex-col ${
            isChapterCard ? "min-h-[180px] items-center text-center" : showSpeaker ? "gap-3 min-h-[96px]" : "min-h-[88px]"
          }`}
        >
          {showSpeaker && (
            <div className="flex items-start">
              <motion.h3
                data-testid="dialogue-speaker"
                key={speaker}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`text-[15px] font-serif tracking-[0.28em] relative md:text-base ${speakerTone.textClass}`}
              >
                {speaker}
                <span
                  className={`absolute -bottom-2 left-0 w-8 h-[1px] ${speakerTone.ruleClass}`}
                />
              </motion.h3>
            </div>
          )}
          <motion.p
            key={`${entryType}:${text}`}
            initial={{ opacity: 0, y: isChapterCard ? 8 : 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className={`font-serif tracking-wide ${
              isChapterCard
                ? "max-w-3xl whitespace-pre-line text-3xl leading-snug md:text-4xl"
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
        </div>
      </div>
    </div>
  );
}
