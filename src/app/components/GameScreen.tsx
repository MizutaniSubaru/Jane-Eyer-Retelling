import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { chapter23Meta, chapter23Scene } from "../data/chapter23Scene";
import { resolveStagePresentation } from "../lib/resolveStagePresentation";
import { formatEntryText } from "../lib/storyText";
import { CharacterStage } from "./CharacterStage";
import { TopBar } from "./TopBar";
import { DialogueBox } from "./DialogueBox";
import bgImg from "../../imports/4164942f3bb1b952ba1877846b4d95a5.png";
import embraceBgImg from "../../../photo_10_2026-04-17_16-46-40.jpg";

const EMBRACE_BACKGROUND_START_ID = "jane-sees-fairfaxs-look";
const EMBRACE_BACKGROUND_END_ID = "jane-thinks-she-will-explain-later";
const EMBRACE_BACKGROUND_ENTER_MS = 1_550;
const EMBRACE_BACKGROUND_EXIT_MS = 1_000;
const EMBRACE_HIGHLIGHT_ENTER_MS = 1_250;
const EMBRACE_HIGHLIGHT_EXIT_MS = 1_000;

const embraceBackgroundStartIndex = chapter23Scene.findIndex(
  (entry) => entry.id === EMBRACE_BACKGROUND_START_ID,
);
const embraceBackgroundEndIndex = chapter23Scene.findIndex(
  (entry) => entry.id === EMBRACE_BACKGROUND_END_ID,
);

function isEmbraceBackgroundActive(index: number) {
  return index >= embraceBackgroundStartIndex && index <= embraceBackgroundEndIndex;
}

const embraceCornerLightPositions = [
  { key: "top-left", className: "-left-[34%] -top-[34%]" },
  { key: "top-right", className: "-right-[34%] -top-[34%]" },
  { key: "bottom-left", className: "-left-[34%] -bottom-[34%]" },
  { key: "bottom-right", className: "-right-[34%] -bottom-[34%]" },
] as const;

export function GameScreen({
  onBack,
  onStoryEnd,
}: {
  onBack: () => void;
  onStoryEnd?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEmbraceBackgroundExiting, setIsEmbraceBackgroundExiting] = useState(false);
  const [embraceTransitionDirection, setEmbraceTransitionDirection] = useState<
    "enter" | "exit" | null
  >(null);
  const [embraceTransitionToken, setEmbraceTransitionToken] = useState(0);
  const hasAnnouncedEnding = useRef(false);
  const previousShowEmbraceBackground = useRef(false);
  const currentEntry = chapter23Scene[currentIndex];
  const resolvedStage = resolveStagePresentation(chapter23Scene, currentIndex);
  const progress = (currentIndex / (chapter23Scene.length - 1)) * 100;
  const showEmbraceBackground = isEmbraceBackgroundActive(currentIndex);
  const renderEmbraceBackground = showEmbraceBackground || isEmbraceBackgroundExiting;
  const showEmbraceHighlight = embraceTransitionDirection !== null;

  useEffect(() => {
    if (currentIndex === chapter23Scene.length - 1 && !hasAnnouncedEnding.current) {
      hasAnnouncedEnding.current = true;
      onStoryEnd?.();
    }
  }, [currentIndex, onStoryEnd]);

  useEffect(() => {
    let clearHighlightTimeout: number | undefined;
    let exitTimeout: number | undefined;

    if (showEmbraceBackground) {
      setIsEmbraceBackgroundExiting(false);
      previousShowEmbraceBackground.current = true;
      setEmbraceTransitionDirection("enter");
      setEmbraceTransitionToken((current) => current + 1);
      clearHighlightTimeout = window.setTimeout(() => {
        setEmbraceTransitionDirection((current) =>
          current === "enter" ? null : current,
        );
      }, EMBRACE_HIGHLIGHT_ENTER_MS);
    } else if (previousShowEmbraceBackground.current) {
      setIsEmbraceBackgroundExiting(true);
      previousShowEmbraceBackground.current = false;
      setEmbraceTransitionDirection("exit");
      setEmbraceTransitionToken((current) => current + 1);
      clearHighlightTimeout = window.setTimeout(() => {
        setEmbraceTransitionDirection((current) =>
          current === "exit" ? null : current,
        );
      }, EMBRACE_HIGHLIGHT_EXIT_MS);
      exitTimeout = window.setTimeout(() => {
        setIsEmbraceBackgroundExiting(false);
      }, EMBRACE_BACKGROUND_EXIT_MS);
    }

    return () => {
      if (clearHighlightTimeout !== undefined) {
        window.clearTimeout(clearHighlightTimeout);
      }
      if (exitTimeout !== undefined) {
        window.clearTimeout(exitTimeout);
      }
    };
  }, [showEmbraceBackground]);

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
        data-testid="game-base-background"
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImg})`,
        }}
      >
        <div className="absolute inset-0 bg-[#2b2533]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1b24] via-transparent to-transparent" />
      </motion.div>

      {renderEmbraceBackground && (
        <motion.div
          data-testid="game-embrace-background"
          initial={showEmbraceBackground ? { opacity: 0 } : false}
          animate={showEmbraceBackground ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: showEmbraceBackground
              ? EMBRACE_BACKGROUND_ENTER_MS / 1000
              : EMBRACE_BACKGROUND_EXIT_MS / 1000,
            ease: "easeInOut",
          }}
          className="absolute inset-0 z-[12] overflow-hidden pointer-events-none"
        >
          <motion.div
            data-testid="game-embrace-image"
            initial={
              showEmbraceBackground
                ? { opacity: 0, scale: 1.035, filter: "brightness(1.1) saturate(1.06)" }
                : false
            }
            animate={
              showEmbraceBackground
                ? { opacity: 1, scale: 1, filter: "brightness(1) saturate(1)" }
                : { opacity: 0, scale: 1.018, filter: "brightness(1.04) saturate(0.97)" }
            }
            transition={{
              duration: showEmbraceBackground
                ? EMBRACE_BACKGROUND_ENTER_MS / 1000
                : EMBRACE_BACKGROUND_EXIT_MS / 1000,
              delay: showEmbraceBackground ? 0.48 : 0,
              ease: [0.22, 0.78, 0.2, 1],
            }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${embraceBgImg})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b1820]/55 via-[#1b1820]/8 to-transparent" />
          <div className="absolute inset-0 bg-black/12" />
        </motion.div>
      )}

      <AnimatePresence>
        {showEmbraceHighlight && (
          <motion.div
            key={`embrace-corner-glow-${embraceTransitionToken}`}
            data-testid="game-embrace-corner-glow"
            data-direction={embraceTransitionDirection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration:
                embraceTransitionDirection === "enter"
                  ? EMBRACE_HIGHLIGHT_ENTER_MS / 1000
                  : EMBRACE_HIGHLIGHT_EXIT_MS / 1000,
              ease: "easeInOut",
            }}
            className="absolute inset-0 z-[13] overflow-hidden pointer-events-none"
          >
            {embraceCornerLightPositions.map((corner) => (
              <motion.div
                key={`${embraceTransitionToken}-${corner.key}`}
                initial={{
                  opacity: 0,
                  scale: embraceTransitionDirection === "enter" ? 0.18 : 0.28,
                }}
                animate={{
                  opacity:
                    embraceTransitionDirection === "enter"
                      ? [0, 0.9, 0]
                      : [0, 0.72, 0],
                  scale: embraceTransitionDirection === "enter" ? 1.95 : 1.6,
                }}
                transition={{
                  duration:
                    embraceTransitionDirection === "enter"
                      ? EMBRACE_HIGHLIGHT_ENTER_MS / 1000
                      : EMBRACE_HIGHLIGHT_EXIT_MS / 1000,
                  ease: "easeInOut",
                }}
                className={`absolute h-[72vh] w-[72vh] rounded-full blur-[72px] ${corner.className}`}
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.42) 28%, rgba(255,255,255,0.18) 48%, rgba(255,255,255,0) 74%)",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmbraceHighlight && (
          <motion.div
            key={`embrace-flash-${embraceTransitionToken}`}
            data-testid="game-embrace-flash"
            data-direction={embraceTransitionDirection}
            initial={{ opacity: 0 }}
            animate={{
              opacity:
                embraceTransitionDirection === "enter"
                  ? [0, 0.24, 0.5, 0]
                  : [0, 0.16, 0.32, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration:
                embraceTransitionDirection === "enter" ? 0.82 : 0.7,
              delay:
                embraceTransitionDirection === "enter" ? 0.52 : 0.24,
              ease: "easeInOut",
            }}
            className="absolute inset-0 z-[14] pointer-events-none bg-white"
          />
        )}
      </AnimatePresence>

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
        {!renderEmbraceBackground && <CharacterStage stage={resolvedStage} />}
      </div>

      {/* Weather / Emotion Overlay */}
      <div className="absolute inset-0 z-[15] pointer-events-none mix-blend-overlay">
        <AnimatePresence>
          {!renderEmbraceBackground &&
            (currentEntry.atmosphere.weather === "tense" ||
              currentEntry.atmosphere.weather === "storm") && (
            <motion.div
              key="storm-ambient"
              data-testid="storm-ambient-overlay"
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

          {!renderEmbraceBackground && currentEntry.atmosphere.weather === "storm" && (
            <motion.div
              key="lightning-flash"
              data-testid="storm-lightning-flash"
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
