export type SceneEntryType =
  | "chapter-card"
  | "narration"
  | "thought"
  | "dialogue";

export type CharacterId = "jane" | "rochester";
export type PortraitMood = "neutral" | "sad" | "angry" | "warm";
export type PortraitLight = "bright" | "dim";
export type PortraitEntrance = "static" | "fade-in" | "slide-in-right";
export type PortraitVariant = "default" | "back";

export type StageSlot = {
  character: CharacterId;
  mood: PortraitMood;
  light: PortraitLight;
  visible?: boolean;
  entrance?: PortraitEntrance;
  variant?: PortraitVariant;
};

export type CardStageState = {
  mode: "card";
  left?: never;
  right?: never;
};

export type NarrationOnlyStageState = {
  mode: "narration-only";
  left?: never;
  right?: never;
};

export type DuoStageState = {
  mode: "duo-stage";
  left: StageSlot;
  right: StageSlot;
};

export type StageState = CardStageState | NarrationOnlyStageState | DuoStageState;

export type AtmosphereState = {
  weather: "calm" | "tense" | "storm";
};

type BaseSceneEntry = {
  id: string;
  speaker: string;
  text: string;
  atmosphere: AtmosphereState;
};

export type ChapterCardEntry = BaseSceneEntry & {
  type: "chapter-card";
  stage: CardStageState;
};

export type StoryBeatEntry = BaseSceneEntry & {
  type: Exclude<SceneEntryType, "chapter-card">;
  stage: NarrationOnlyStageState | DuoStageState;
};

export type SceneEntry = ChapterCardEntry | StoryBeatEntry;

export type ChapterMeta = {
  title: string;
  chapterLabel: string;
  progressLabel: string;
  introCard: string[];
};
