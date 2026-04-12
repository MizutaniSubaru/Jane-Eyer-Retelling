import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { chapter23Meta, chapter23Scene } from "../data/chapter23Scene";
import { formatEntryText } from "../lib/storyText";
import { CharacterStage } from "./CharacterStage";
import { TopBar } from "./TopBar";
import { DialogueBox } from "./DialogueBox";
import bgImg from "../../imports/4164942f3bb1b952ba1877846b4d95a5.png";

export function GameScreen({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentEntry = chapter23Scene[currentIndex];
  const progress = (currentIndex / (chapter23Scene.length - 1)) * 100;

  const handleNext = () => {
    if (currentIndex < chapter23Scene.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentText =
    currentEntry.type === "chapter-card"
      ? chapter23Meta.introCard.join("\n")
      : formatEntryText(currentEntry);

  return (
    <div className="w-full h-full relative flex flex-col justify-between overflow-hidden bg-[#1f1b24]">
      {/* Background with slow subtle parallax */}
      <motion.div
        key="game-bg"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImg})`,
        }}
      >
        <div className="absolute inset-0 bg-[#2b2533]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1b24] via-transparent to-transparent" />
      </motion.div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Top Control Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <TopBar
            onBack={onBack}
            progress={progress}
            chapterLabel={chapter23Meta.progressLabel}
          />
        </motion.div>

        {/* Weather / Emotion Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay">
          <AnimatePresence>
            {(currentEntry.atmosphere.weather === "tense" ||
              currentEntry.atmosphere.weather === "storm") && (
              <motion.div
                key="storm-ambient"
                initial={{ opacity: 0, backgroundColor: "rgba(163, 181, 198, 0)" }}
                animate={{
                  opacity: currentEntry.atmosphere.weather === "storm" ? 0.3 : 0.16,
                  backgroundColor:
                    currentEntry.atmosphere.weather === "storm"
                      ? [
                          "rgba(163, 181, 198, 0.2)",
                          "rgba(163, 181, 198, 0.38)",
                          "rgba(163, 181, 198, 0.2)",
                        ]
                      : [
                          "rgba(122, 137, 159, 0.08)",
                          "rgba(122, 137, 159, 0.16)",
                          "rgba(122, 137, 159, 0.08)",
                        ],
                }}
                transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
                className="absolute inset-0"
              />
            )}

            {currentEntry.atmosphere.weather === "storm" && (
              <motion.div
                key="lightning-flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.15, 0] }}
                transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
                className="absolute inset-0 bg-white"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Central Display Area for Characters/Stage (Using abstract subtle lighting) */}
        <div className="flex-1 flex items-center justify-center relative w-full px-4 pointer-events-none">
          <CharacterStage stage={currentEntry.stage} />
        </div>

        {/* Bottom Area: Dialogue and Choices */}
        <div className="relative w-full max-w-5xl mx-auto px-8 pb-12 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="w-full mt-6"
          >
            <DialogueBox
              entryType={currentEntry.type}
              speaker={currentEntry.speaker}
              text={currentText}
              onNext={handleNext}
              onPrev={handlePrev}
              canNext={currentIndex < chapter23Scene.length - 1}
              canPrev={currentIndex > 0}
              isChoiceState={false}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
