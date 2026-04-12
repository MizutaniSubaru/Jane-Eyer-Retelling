import { motion } from "motion/react";
import { ArrowLeft, X, Settings2, Volume2, BookOpen } from "lucide-react";

export function TopBar({ onBack, progress }: { onBack: () => void; progress: number }) {
  return (
    <div className="w-full px-8 py-6 flex items-center justify-between text-[#a3b5c6]/80 font-serif">
      {/* Left Actions */}
      <div className="flex items-center gap-6">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 hover:text-[#f2efe9] transition-colors duration-500"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm tracking-widest hidden sm:block">返回扉页</span>
        </button>
        <button className="hover:text-[#f2efe9] transition-colors duration-500">
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Center Narrative Progress */}
      <div className="flex flex-col items-center flex-1 mx-16 max-w-sm">
        <div className="flex items-center gap-4 text-xs tracking-[0.2em] mb-3 text-[#a3b5c6]/60">
          <BookOpen size={14} strokeWidth={1} />
          <span>章一 · 仲夏夜之秘</span>
        </div>
        <div className="w-full h-[1px] bg-[#a3b5c6]/20 relative overflow-hidden rounded-full">
          <motion.div
            className="absolute left-0 top-0 bottom-0 bg-[#a3b5c6]/80"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Right Settings */}
      <div className="flex items-center gap-6">
        <button className="hover:text-[#f2efe9] transition-colors duration-500">
          <Volume2 size={18} strokeWidth={1.5} />
        </button>
        <button className="hover:text-[#f2efe9] transition-colors duration-500">
          <Settings2 size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
