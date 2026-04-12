import { getPortraitAsset } from "../data/portraitManifest";
import type { CharacterId, StageSlot, StageState } from "../types/story";

type PortraitProps = {
  slot: StageSlot;
  align: "left" | "right";
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

function Portrait({ slot, align }: PortraitProps) {
  const src = getPortraitAsset(slot.character, slot.mood, "bright");
  const isBright = slot.light === "bright";
  const tone = portraitToneByCharacter[slot.character];

  return (
    <div
      data-testid={`portrait-shell-${slot.character}`}
      className={`absolute bottom-0 ${align === "left" ? "left-[2%] md:left-[8%]" : "right-[2%] md:right-[8%]"} flex items-end`}
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
