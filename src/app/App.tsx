import { useEffect, useRef, useState } from "react";
import { Bookshelf } from "./components/Bookshelf";
import { ConstellationDirectory } from "./components/ConstellationDirectory";
import { GameScreen } from "./components/GameScreen";
import { AnimatePresence, motion } from "motion/react";
import backgroundMusicUrl from "../assets/background-music.mp3";
import { createBackgroundMusicController } from "./lib/backgroundMusicController";

type ViewState = "bookshelf" | "directory" | "game";

export default function App() {
  const [view, setView] = useState<ViewState>("bookshelf");
  const [hasReachedEnding, setHasReachedEnding] = useState(false);
  const musicControllerRef = useRef<ReturnType<typeof createBackgroundMusicController> | null>(
    null,
  );

  useEffect(() => {
    const audio = new Audio(backgroundMusicUrl);
    audio.preload = "auto";

    musicControllerRef.current = createBackgroundMusicController(audio);

    return () => {
      musicControllerRef.current?.dispose();
      musicControllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (view === "game") {
      setHasReachedEnding(false);
      musicControllerRef.current?.playFromStartWithFadeIn();
      return () => {
        musicControllerRef.current?.stopWithFadeOut();
      };
    }
  }, [view]);

  useEffect(() => {
    if (hasReachedEnding) {
      musicControllerRef.current?.stopWithFadeOut();
    }
  }, [hasReachedEnding]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#1f1b24] text-[#f2efe9] relative selection:bg-[#a3b5c6] selection:text-[#1f1b24]">
      <AnimatePresence mode="wait">
        {view === "bookshelf" && (
          <motion.div
            key="bookshelf"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
            className="absolute inset-0 z-10"
          >
            <Bookshelf
              onSelectBook={(bookId) => {
                if (bookId === "jane-eyre") {
                  setView("directory");
                }
              }}
            />
          </motion.div>
        )}

        {view === "directory" && (
          <motion.div
            key="directory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.2, ease: "easeInOut" } }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <ConstellationDirectory
              onBack={() => setView("bookshelf")}
              onSelectChapter={() => setView("game")}
            />
          </motion.div>
        )}

        {view === "game" && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <GameScreen
              onBack={() => setView("directory")}
              onStoryEnd={() => setHasReachedEnding(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
