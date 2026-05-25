import { motion } from "motion/react";
import { ArrowLeft, Sparkle } from "lucide-react";

import { chapterNodes, type ChapterId } from "../data/chapterManifest";
import moorsBg from "../../assets/portal/moors-background.jpg";

interface ConstellationDirectoryProps {
  onBack: () => void;
  onSelectChapter: (id: ChapterId) => void;
}

export function ConstellationDirectory({
  onBack,
  onSelectChapter,
}: ConstellationDirectoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 w-full h-full bg-black overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={moorsBg}
          alt="Foggy moors"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/80" />
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-overlay" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-30 flex justify-between items-start">
        <motion.button
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
        >
          <ArrowLeft size={18} />
          <span className="font-serif text-sm tracking-widest uppercase">返回书架</span>
        </motion.button>

        <div className="text-right">
          <h2 className="text-2xl md:text-4xl font-serif text-white tracking-widest drop-shadow-lg">
            简爱
          </h2>
        </div>
      </div>

      {/* Constellation canvas */}
      <div className="absolute inset-0 z-10 p-12 mt-16 pb-24">
        <div className="relative w-full h-full max-w-6xl mx-auto">
          {/* SVG connecting lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>
            </defs>
            {chapterNodes.map((chapter, i) => {
              if (i === chapterNodes.length - 1) return null;
              const next = chapterNodes[i + 1];
              return (
                <motion.line
                  key={`line-${chapter.id}-${next.id}`}
                  x1={`${chapter.x}%`}
                  y1={`${chapter.y}%`}
                  x2={`${next.x}%`}
                  y2={`${next.y}%`}
                  stroke="url(#line-gradient)"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: i * 0.3, ease: "easeInOut" }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {chapterNodes.map((chapter, i) => {
            const isLocked = !chapter.playable;
            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: i * 0.2 + 0.5, type: "spring" }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-20 ${
                  isLocked ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                style={{ left: `${chapter.x}%`, top: `${chapter.y}%` }}
                onClick={() => {
                  if (!isLocked) onSelectChapter(chapter.id);
                }}
              >
                <div className={`relative ${isLocked ? "opacity-40 grayscale" : ""}`}>
                  {/* Glow halo */}
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover:bg-white/40 group-hover:blur-xl transition-all duration-500 scale-150" />

                  {/* Core star */}
                  <motion.div
                    whileHover={isLocked ? {} : { scale: 1.3, rotate: 90 }}
                    whileTap={isLocked ? {} : { scale: 0.9 }}
                    className="w-4 h-4 md:w-5 md:h-5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-10 flex items-center justify-center border-2 border-slate-900"
                  >
                    <Sparkle className="w-3 h-3 text-slate-900 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>

                  {/* Pulsing ring */}
                  <div
                    className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-20 group-hover:opacity-60"
                    style={{ animationDuration: "3s" }}
                  />
                </div>

                {/* Chapter label */}
                <div className="absolute top-full mt-4 flex flex-col items-center w-48 opacity-100 transition-all duration-300 pointer-events-none">
                  <span className="text-white font-serif text-lg tracking-wide whitespace-nowrap drop-shadow-md">
                    {chapter.title}
                  </span>
                  <span className="text-white/60 text-xs italic text-center mt-1 drop-shadow-sm">
                    {chapter.subtitle}
                    {isLocked ? " · 敬请期待" : ""}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
