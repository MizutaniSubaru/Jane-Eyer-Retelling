import { motion } from "motion/react";
import { getPortraitAsset } from "../data/portraitManifest";
import type {
  CharacterId,
  PortraitEntrance,
  StageSlot,
  StageState,
} from "../types/story";

type PortraitProps = {
  slot: StageSlot;
  align: "left" | "right";
  sceneKey?: string;
};

const portraitToneByCharacter: Record<
  CharacterId,
  {
    glowClass: string;
    brightFilterClass: string;
    dimFilterClass: string;
  }
> = {
  jane: {
    glowClass: "bg-[#d9e4ff]/22",
    brightFilterClass: "brightness-[1.08] saturate-[1.06] contrast-[1.02]",
    dimFilterClass: "brightness-[0.74] saturate-[0.82] contrast-[0.96]",
  },
  rochester: {
    glowClass: "bg-[#f0d6b3]/18",
    brightFilterClass: "brightness-[1.06] saturate-[1.03] contrast-[1.03] sepia-[0.03]",
    dimFilterClass: "brightness-[0.68] saturate-[0.76] contrast-[0.95] sepia-[0.08]",
  },
};

function getPortraitInitial(align: "left" | "right", entrance: PortraitEntrance) {
  switch (entrance) {
    case "fade-in":
      return { opacity: 0 };
    case "slide-in-right":
      return { opacity: 0, x: align === "right" ? 120 : 0 };
    default:
      return false;
  }
}

function getPortraitTransition(entrance: PortraitEntrance) {
  switch (entrance) {
    case "fade-in":
      return { duration: 0.75, ease: "easeOut" } as const;
    case "slide-in-right":
      return { duration: 0.85, ease: [0.18, 0.84, 0.32, 1] } as const;
    default:
      return undefined;
  }
}

function Portrait({ slot, align, sceneKey = "static" }: PortraitProps) {
  if (slot.visible === false) {
    return null;
  }

  const src = getPortraitAsset(
    slot.character,
    slot.mood,
    "bright",
    slot.variant ?? "default",
  );
  const isBright = slot.light === "bright";
  const tone = portraitToneByCharacter[slot.character];
  const entrance = slot.entrance ?? "static";
  const initial = getPortraitInitial(align, entrance);
  const transition = getPortraitTransition(entrance);
  const animationProps =
    entrance === "static"
      ? {}
      : {
          initial,
          animate: { opacity: 1, x: 0 },
          transition,
        };

  return (
    <motion.div
      key={`${sceneKey}:${slot.character}:${entrance}`}
      data-testid={`portrait-shell-${slot.character}`}
      data-entrance={entrance}
      className={`absolute bottom-0 ${align === "left" ? "left-[2%] md:left-[8%]" : "right-[2%] md:right-[8%]"} flex items-end`}
      {...animationProps}
    >
      <div className="relative">
        {isBright && (
          <div className={`absolute inset-x-[8%] bottom-0 h-24 rounded-full blur-3xl ${tone.glowClass}`} />
        )}
        <img
          src={src}
          alt=""
          aria-hidden="true"
          data-testid={`portrait-${slot.character}`}
          data-light={slot.light}
          className={`relative block h-[20rem] w-auto max-w-none select-none object-contain drop-shadow-[0_20px_42px_rgba(0,0,0,0.45)] md:h-[28rem] lg:h-[32rem] ${
            isBright ? tone.brightFilterClass : tone.dimFilterClass
          }`}
        />
      </div>
    </motion.div>
  );
}

export function CharacterStage({
  stage,
  sceneKey,
}: {
  stage: StageState;
  sceneKey?: string;
}) {
  if (stage.mode !== "duo-stage") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      data-testid="character-stage-layer"
      className="pointer-events-none relative h-full w-full overflow-hidden"
    >
      <Portrait slot={stage.left} align="left" sceneKey={sceneKey} />
      <Portrait slot={stage.right} align="right" sceneKey={sceneKey} />
    </div>
  );
}
