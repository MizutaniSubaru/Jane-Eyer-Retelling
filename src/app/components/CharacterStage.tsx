import { getPortraitAsset } from "../data/portraitManifest";
import type { StageSlot, StageState } from "../types/story";

type PortraitProps = {
  slot: StageSlot;
  align: "left" | "right";
};

function Portrait({ slot, align }: PortraitProps) {
  const src = getPortraitAsset(slot.character, slot.mood, "bright");
  const isBright = slot.light === "bright";

  return (
    <div
      data-testid={`portrait-shell-${slot.character}`}
      className={`absolute bottom-0 ${align === "left" ? "left-[2%] md:left-[8%]" : "right-[2%] md:right-[8%]"} flex items-end`}
    >
      <div className="relative">
        {isBright && (
          <div className="absolute inset-x-[8%] bottom-0 h-24 rounded-full bg-[#f2efe9]/22 blur-3xl" />
        )}
        <img
          src={src}
          alt=""
          aria-hidden="true"
          data-testid={`portrait-${slot.character}`}
          data-light={slot.light}
          className={`relative block h-[20rem] w-auto max-w-none select-none object-contain drop-shadow-[0_20px_42px_rgba(0,0,0,0.45)] md:h-[28rem] lg:h-[32rem] ${
            isBright
              ? "brightness-[1.08] saturate-[1.08] contrast-[1.02]"
              : "brightness-[0.72] saturate-[0.74] contrast-[0.94]"
          }`}
        />
      </div>
    </div>
  );
}

export function CharacterStage({ stage }: { stage: StageState }) {
  if (stage.mode !== "duo-stage") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      data-testid="character-stage-layer"
      className="pointer-events-none relative h-full w-full overflow-hidden"
    >
      <Portrait slot={stage.left} align="left" />
      <Portrait slot={stage.right} align="right" />
    </div>
  );
}
