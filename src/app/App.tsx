import { useState } from "react";
import { StartScreen } from "./components/StartScreen";
import { GameScreen } from "./components/GameScreen";
import { AnimatePresence, motion } from "motion/react";

export default function App() {
  const [gameState, setGameState] = useState<"start" | "game">("start");

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#1f1b24] text-[#f2efe9] relative selection:bg-[#a3b5c6] selection:text-[#1f1b24]">
      {/* Global Background Layer */}
      <AnimatePresence mode="wait">
        {gameState === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
            className="absolute inset-0 z-10"
          >
            <StartScreen onStart={() => setGameState("game")} />
          </motion.div>
        )}
        
        {gameState === "game" && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <GameScreen onBack={() => setGameState("start")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
