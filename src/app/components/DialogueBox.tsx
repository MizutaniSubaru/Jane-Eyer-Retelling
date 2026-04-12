import { motion } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";

export function DialogueBox({
  speaker,
  text,
  onNext,
  onPrev,
  canNext,
  canPrev,
  isChoiceState,
}: {
  speaker: string;
  text: string;
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  canPrev: boolean;
  isChoiceState: boolean;
}) {
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

      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row gap-6 md:gap-12 text-[#f2efe9]">
        {/* Name Plate */}
        <div className="w-32 md:w-40 flex-shrink-0 flex items-start pt-2">
          <motion.h3
            key={speaker}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-2xl font-serif text-[#a3b5c6] tracking-widest relative"
          >
            {speaker}
            {/* Very subtle line under name */}
            <span className="absolute -bottom-2 left-0 w-8 h-[1px] bg-[#4a3e59]/80" />
          </motion.h3>
        </div>

        {/* Text Area */}
        <div className="flex-1 flex flex-col justify-between min-h-[120px]">
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className="text-xl md:text-[22px] leading-relaxed tracking-wide font-serif"
            style={{ fontWeight: 300 }}
          >
            {text}
          </motion.p>

          {/* Navigation Controls */}
          <div className="flex justify-end gap-6 mt-6 pt-4 border-t border-[#a3b5c6]/10">
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
