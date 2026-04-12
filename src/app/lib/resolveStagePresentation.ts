import type { CharacterId, DuoStageState, SceneEntry, StageState } from "../types/story";

const mapSpeakerToCharacter = (speaker: string): CharacterId | null => {
  switch (speaker) {
    case "简":
    case "简·爱":
      return "jane";
    case "罗切斯特":
    case "罗切斯特先生":
      return "rochester";
    default:
      return null;
  }
};

const dimBoth = (stage: DuoStageState): DuoStageState => ({
  ...stage,
  left: { ...stage.left, light: "dim" },
  right: { ...stage.right, light: "dim" },
});

const applyHighlight = (
  stage: DuoStageState,
  highlightedCharacter: CharacterId | null,
): DuoStageState => {
  if (highlightedCharacter === null) {
    return dimBoth(stage);
  }

  const leftLight = stage.left.character === highlightedCharacter ? "bright" : "dim";
  const rightLight = stage.right.character === highlightedCharacter ? "bright" : "dim";

  if (leftLight === "dim" && rightLight === "dim") {
    return dimBoth(stage);
  }

  return {
    ...stage,
    left: { ...stage.left, light: leftLight },
    right: { ...stage.right, light: rightLight },
  };
};

const findPreviousDialogueSpeaker = (
  entries: SceneEntry[],
  currentIndex: number,
): CharacterId | null => {
  for (let i = currentIndex - 1; i >= 0; i -= 1) {
    const candidate = entries[i];
    if (candidate.type !== "dialogue") {
      continue;
    }

    if (candidate.stage.mode !== "duo-stage") {
      continue;
    }

    return mapSpeakerToCharacter(candidate.speaker);
  }

  return null;
};

export const resolveStagePresentation = (
  entries: SceneEntry[],
  currentIndex: number,
): StageState => {
  if (currentIndex < 0 || currentIndex >= entries.length) {
    throw new RangeError(`Invalid current index: ${currentIndex}`);
  }

  const current = entries[currentIndex];
  if (current.stage.mode !== "duo-stage") {
    return current.stage;
  }

  if (current.type === "dialogue") {
    return applyHighlight(current.stage, mapSpeakerToCharacter(current.speaker));
  }

  const inheritedSpeaker = findPreviousDialogueSpeaker(entries, currentIndex);
  return applyHighlight(current.stage, inheritedSpeaker);
};
