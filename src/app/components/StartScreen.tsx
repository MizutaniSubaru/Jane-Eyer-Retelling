import { useState } from "react";
import { motion } from "motion/react";
import bgImg from "../../imports/4164942f3bb1b952ba1877846b4d95a5.png";
import { DesignNotes } from "./DesignNotes";

export function StartScreen({ onStart }: { onStart: () => void }) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <DesignNotes isOpen={showNotes} onClose={() => setShowNotes(false)} />

      {/* Background with slight zoom & pan effect for "opening book" feel */}
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImg})`,
          backgroundPosition: "50% 60%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1b24]/80 via-[#2b2533]/40 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-[#4a3e59]/10" />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <h1
            className="text-7xl md:text-8xl tracking-widest text-[#f2efe9] font-light mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Jane Eyre
          </h1>
          <h2
            className="text-xl md:text-2xl tracking-[0.3em] text-[#a3b5c6] uppercase font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Chapter One · The Orchard
          </h2>
        </motion.div>

        {/* Delicate divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
          className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#a3b5c6]/50 to-transparent my-12"
        />

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.5 }}
          className="flex flex-col items-center gap-6"
        >
          {[
            { label: "开始叙事", onClick: onStart, primary: true },
            { label: "继续阅读", onClick: () => {} },
            { label: "章节选择", onClick: () => {} },
            { label: "设计说明", onClick: () => setShowNotes(true) },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.onClick}
              className={`group relative text-lg tracking-widest transition-all duration-500 hover:text-[#f2efe9] ${
                item.primary ? "text-[#f2efe9]" : "text-[#a3b5c6]/70"
              }`}
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              <span className="relative z-10 px-6 py-2 block">{item.label}</span>
              {/* Subtle hover underline/emboss */}
              <span className="absolute left-1/2 bottom-0 w-0 h-[1px] bg-[#d1dce5]/40 transition-all duration-500 ease-out group-hover:w-full group-hover:left-0" />
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
