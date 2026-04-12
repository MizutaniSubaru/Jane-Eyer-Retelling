import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { chapter23Meta, chapter23Scene } from "../data/chapter23Scene";
import { resolveStagePresentation } from "../lib/resolveStagePresentation";
import { formatEntryText } from "../lib/storyText";
import { CharacterStage } from "./CharacterStage";
import { TopBar } from "./TopBar";
import { DialogueBox } from "./DialogueBox";
import bgImg from "../../imports/4164942f3bb1b952ba1877846b4d95a5.png";

export function GameScreen({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentEntry = chapter23Scene[currentIndex];
  const resolvedStage = resolveStagePresentation(chapter23Scene, currentIndex);
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
    <div className="relative h-full w-full overflow-hidden bg-[#1f1b24]">
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

      {/* Top Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-30"
      >
        <TopBar
          onBack={onBack}
          progress={progress}
          chapterLabel={chapter23Meta.title}
        />
      </motion.div>

      {/* Portrait Stage */}
      <div
        data-testid="game-stage-layer"
        onClick={handleNext}
        className="absolute inset-0 z-10 cursor-pointer px-4 pt-24 md:pt-28"
      >
        <CharacterStage stage={resolvedStage} />
      </div>

      {/* Weather / Emotion Overlay */}
      <div className="absolute inset-0 z-[15] pointer-events-none mix-blend-overlay">
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

      {/* Bottom Dialogue Overlay */}
      <div
        data-testid="game-dialogue-layer"
        onClick={handleNext}
        className="absolute inset-x-0 bottom-0 z-20 px-4 pb-8 sm:px-6 md:px-8 md:pb-10"
      >
        <div className="mx-auto w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="w-full"
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
