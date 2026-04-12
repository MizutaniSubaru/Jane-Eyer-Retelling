import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TopBar } from "./TopBar";
import { DialogueBox } from "./DialogueBox";
import { ChoiceOverlay } from "./ChoiceOverlay";
import bgImg from "../../imports/4164942f3bb1b952ba1877846b4d95a5.png";

const SCRIPT = [
  {
    id: 1,
    speaker: "旁白",
    text: "仲夏的黄昏终于褪去了最后一抹燥热。玫瑰与月桂的香气在果园的空气中交织，夜莺在远处的林地里开始试探性地啼鸣。",
    hasChoices: false,
  },
  {
    id: 2,
    speaker: "简·爱",
    text: "（轻步踏过布满青苔的石板，心中隐隐有种不安的预感）",
    hasChoices: false,
  },
  {
    id: 3,
    speaker: "罗切斯特",
    text: "简，你要去哪里？",
    hasChoices: false,
  },
  {
    id: 4,
    speaker: "旁白",
    text: "他的声音低沉，像是怕惊扰了这宁静的夜，却又带着某种不容拒绝的力量。月光穿过古树的枝桠，在他的侧脸上投下斑驳的阴影。",
    hasChoices: false,
  },
  {
    id: 5,
    speaker: "简·爱",
    text: "我要回屋了，先生。夜露深重。",
    hasChoices: false,
  },
  {
    id: 6,
    speaker: "罗切斯特",
    text: "留下来，简。哪怕只是片刻。",
    hasChoices: true,
  },
  // Choices lead here (for simplicity, linear after choice)
  {
    id: 7,
    speaker: "旁白",
    text: "远方传来隐约的雷声，闷在云层里，仿佛某种一直被压抑的情感即将倾泻而出。夜色变得更深，空气中多了一丝雨前的潮湿。",
    hasChoices: false,
  },
  {
    id: 8,
    speaker: "罗切斯特",
    text: "你知道我为何让你留下吗？",
    hasChoices: false,
  },
  {
    id: 9,
    speaker: "简·爱",
    text: "我……我不知道，先生。",
    hasChoices: false,
  },
];

const CHOICES = [
  { id: "c1", label: "停下脚步，转过身安静地看着他。" },
  { id: "c2", label: "低下头，假装没有听出他语气中的异样。" },
  { id: "c3", label: "深吸一口气，直视他的眼睛反问缘由。" },
  { id: "c4", label: "抑制住颤抖的心跳，用最冷淡的声音告退。" },
];

export function GameScreen({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const currentLine = SCRIPT[currentIndex];
  const progress = (currentIndex / (SCRIPT.length - 1)) * 100;

  const handleNext = () => {
    if (currentLine.hasChoices && !selectedChoice) {
      setShowChoices(true);
      return;
    }
    if (currentIndex < SCRIPT.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowChoices(false);
      setSelectedChoice(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowChoices(false);
      setSelectedChoice(null);
    }
  };

  const handleChoiceSelected = (choiceId: string) => {
    setSelectedChoice(choiceId);
    // Add slight delay before advancing to simulate "making a decision"
    setTimeout(() => {
      setShowChoices(false);
      handleNext();
    }, 800);
  };

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
          <TopBar onBack={onBack} progress={progress} />
        </motion.div>

        {/* Weather / Emotion Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay">
          <AnimatePresence>
            {currentIndex >= 6 && (
              <motion.div
                key="storm-ambient"
                initial={{ opacity: 0, backgroundColor: "rgba(163, 181, 198, 0)" }}
                animate={{
                  opacity: 0.3,
                  backgroundColor: ["rgba(163, 181, 198, 0.2)", "rgba(163, 181, 198, 0.4)", "rgba(163, 181, 198, 0.2)"],
                }}
                transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
                className="absolute inset-0"
              />
            )}
            
            {/* Extremely subtle lightning flash when it first rains */}
            {currentIndex === 6 && (
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
          {/* We keep this area clear for narrative stage, relying on background image */}
        </div>

        {/* Bottom Area: Dialogue and Choices */}
        <div className="relative w-full max-w-5xl mx-auto px-8 pb-12 flex flex-col justify-end">
          <AnimatePresence mode="wait">
            {showChoices && (
              <ChoiceOverlay
                choices={CHOICES}
                selectedId={selectedChoice}
                onSelect={handleChoiceSelected}
              />
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="w-full mt-6"
          >
            <DialogueBox
              speaker={currentLine.speaker}
              text={currentLine.text}
              onNext={handleNext}
              onPrev={handlePrev}
              canNext={currentIndex < SCRIPT.length - 1 || currentLine.hasChoices}
              canPrev={currentIndex > 0}
              isChoiceState={showChoices}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
