import { motion } from "motion/react";
import { Check } from "lucide-react";

export function ChoiceOverlay({
  choices,
  selectedId,
  onSelect,
}: {
  choices: { id: string; label: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.8 } }}
      transition={{ duration: 0.8 }}
      className="w-full flex flex-col items-center justify-center mb-12 overflow-hidden"
    >
      <div className="relative w-full max-w-2xl flex flex-col gap-4">
        {choices.map((choice, i) => {
          const isSelected = selectedId === choice.id;
          const isOtherSelected = selectedId !== null && !isSelected;

          return (
            <motion.button
              key={choice.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: isOtherSelected ? 0 : 1,
                y: 0,
                scale: isSelected ? 1.02 : 1,
                backgroundColor: isSelected ? "rgba(163, 181, 198, 0.15)" : "rgba(31, 27, 36, 0.8)",
                borderColor: isSelected ? "rgba(163, 181, 198, 0.5)" : "rgba(163, 181, 198, 0.1)",
              }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              transition={{
                duration: 0.8,
                delay: isOtherSelected ? 0 : i * 0.12,
                ease: "easeOut",
              }}
              disabled={selectedId !== null}
              onClick={() => onSelect(choice.id)}
              className="group relative w-full text-left py-5 px-8 flex items-center justify-between overflow-hidden border rounded-sm transition-all duration-700 hover:border-[#a3b5c6]/40 hover:bg-[#2b2533]/80"
              style={{
                boxShadow: isSelected
                  ? "0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(163, 181, 198, 0.05)"
                  : "0 2px 10px rgba(0, 0, 0, 0.3)",
              }}
            >
              {/* Literary paper/texture overlay & Burgundy hint */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#e8e3d9]/5 via-transparent to-[#5a2e33]/5 mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <span
                className={`relative z-10 text-lg md:text-xl tracking-wide font-serif transition-colors duration-500 ${
                  isSelected ? "text-[#f2efe9]" : "text-[#a3b5c6]/90 group-hover:text-[#f2efe9]"
                }`}
                style={{ fontWeight: 300 }}
              >
                {choice.label}
              </span>

              {/* Selection indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isSelected ? 1 : 0, scale: isSelected ? 1 : 0.8 }}
                className="relative z-10 text-[#a3b5c6]"
              >
                <Check size={18} strokeWidth={1.5} />
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
