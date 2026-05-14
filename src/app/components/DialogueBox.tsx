import { motion } from "motion/react";

import type { SceneEntryType } from "../types/story";
import speakerNametag from "../../assets/ui/speaker-nametag.png";
import dialogBoxImg from "../../assets/ui/dialog-box.png";

const frameFontFamily = "'Cormorant Garamond', 'Noto Serif SC', serif";

function getTextDensity(entryType: SceneEntryType, text: string) {
  if (entryType === "chapter-card") {
    return "chapter";
  }

  return "normal";
}

export function DialogueBox({
  entryType = "dialogue",
  speaker,
  text,
  onNext,
  onPrev: _onPrev,
  canNext,
  canPrev: _canPrev,
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
  const textDensity = getTextDensity(entryType, text);
  const bodyTextDensityClass = "text-lg leading-snug md:text-xl md:leading-snug";

  return (
    <div
      data-testid="dialogue-box"
      onClick={
        canNext
          ? (event) => {
              event.stopPropagation();
              onNext();
            }
          : undefined
      }
      className={`relative w-full max-w-6xl mx-auto transition-all duration-1000 ${
        isChoiceState ? "opacity-60 scale-95 blur-[1px]" : "opacity-100 scale-100 blur-0"
      } ${canNext ? "cursor-pointer" : ""}`}
    >
      {/* Speaker name tag — overlaps the top edge of the dialog box */}
      {showSpeaker && (
        <motion.div
          data-testid="dialogue-speaker-frame"
          key={speaker}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="ml-6 md:ml-12 -mb-4 relative z-10 text-[#2d1c14] font-serif whitespace-nowrap drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]"
          style={{
            boxSizing: "border-box",
            width: "214px",
            aspectRatio: "406 / 92",
            transformOrigin: "left bottom",
            fontFamily: frameFontFamily,
          }}
        >
          <img
            src={speakerNametag}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />
          <span
            data-testid="dialogue-speaker"
            className="absolute left-[27%] top-1/2 inline-block w-[57%] -translate-y-1/2 text-center text-[15px] leading-none tracking-[0.04em]"
          >
            {speaker}
          </span>
        </motion.div>
      )}

      {/* Main dialog box */}
      <div
        data-testid="dialogue-frame"
        className="relative w-full overflow-visible drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)]"
        style={{
          aspectRatio: "1490 / 233",
          background: "transparent",
        }}
      >
        <img
          data-testid="dialogue-frame-image"
          src={dialogBoxImg}
          alt=""
          className="absolute inset-0 h-full w-full object-contain select-none"
          draggable={false}
        />
        <div
          data-testid="dialogue-text-layer"
          className={`absolute inset-x-[8.5%] bottom-[9%] ${
            isChapterCard
              ? "top-[16%] flex items-center justify-center text-center"
              : "top-[25%] flex items-start"
          }`}
        >
          <motion.p
            data-testid="dialogue-content"
            data-density={textDensity}
            data-lines={isChapterCard ? undefined : "3"}
            key={`${entryType}:${text}`}
            initial={{ opacity: 0, y: isChapterCard ? 8 : 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className={`max-w-full text-[#f2efe9] font-serif tracking-wide ${
              isChapterCard
                ? "max-w-3xl whitespace-pre-line text-2xl leading-tight md:text-3xl text-center"
                : isThought
                  ? `${bodyTextDensityClass} italic text-[#efe4f0]`
                  : isNarration
                    ? `${bodyTextDensityClass} text-[#f0e8da]`
                    : bodyTextDensityClass
            }`}
            style={{
              fontWeight: 300,
              fontFamily: frameFontFamily,
            }}
          >
            {text}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
