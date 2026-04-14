import { describe, expect, it } from "vitest";
import type { SceneEntry, StageState } from "../types/story";
import { chapter23Meta, chapter23Scene } from "./chapter23Scene";

function acceptsSceneEntry(entry: SceneEntry) {
  return entry;
}

function acceptsStage(stage: StageState) {
  return stage;
}

// @ts-expect-error SceneEntry entries must always provide explicit atmosphere metadata.
acceptsSceneEntry({
  id: "missing-atmosphere",
  type: "narration",
  speaker: "旁白",
  text: "这条数据故意缺少 atmosphere。",
  stage: { mode: "narration-only" },
});

// @ts-expect-error Card stages must not carry portrait slots.
acceptsStage({
  mode: "card",
  left: { character: "jane", mood: "neutral", light: "bright" },
} as const);

acceptsStage({
  mode: "duo-stage",
  // @ts-expect-error Duo-stage stages no longer support softenCast.
  softenCast: true,
  left: { character: "jane", mood: "neutral", light: "dim" },
  right: { character: "rochester", mood: "neutral", light: "dim" },
} as const);

// @ts-expect-error Duo-stage entries must define both left and right portrait slots.
acceptsStage({
  mode: "duo-stage",
  left: { character: "jane", mood: "neutral", light: "bright" },
} as const);

acceptsStage({
  mode: "duo-stage",
  left: {
    character: "jane",
    mood: "neutral",
    light: "bright",
    visible: true,
    entrance: "fade-in",
  },
  right: {
    character: "rochester",
    mood: "neutral",
    light: "dim",
    visible: false,
    entrance: "static",
  },
} as const);

describe("chapter23Scene", () => {
  it("keeps explicit stage and atmosphere metadata on every entry", () => {
    for (const entry of chapter23Scene) {
      expect(entry.stage).toBeDefined();
      expect(entry.atmosphere).toBeDefined();
      expect(entry.atmosphere.weather).toMatch(/^(calm|tense|storm)$/);
    }
  });

  it("opens with a chapter card and narration-only beats before duo stage begins", () => {
    expect(chapter23Scene[0]?.type).toBe("chapter-card");

    const firstDuoStageIndex = chapter23Scene.findIndex(
      (entry) => entry.stage.mode === "duo-stage",
    );

    expect(firstDuoStageIndex).toBeGreaterThan(1);

    for (const entry of chapter23Scene.slice(1, firstDuoStageIndex)) {
      expect(entry.stage.mode).toBe("narration-only");
    }
  });

  it("keeps duo-stage positioning consistent for Jane and Rochester", () => {
    const duoStageEntries = chapter23Scene.filter(
      (entry) => entry.stage.mode === "duo-stage",
    );

    expect(duoStageEntries.length).toBeGreaterThan(0);

    for (const entry of duoStageEntries) {
      expect(entry.stage.left?.character).toBe("jane");
      expect(entry.stage.right?.character).toBe("rochester");
    }
  });

  it("does not include legacy softenCast flags in duo-stage entries", () => {
    expect(
      chapter23Scene
        .filter((entry) => entry.stage.mode === "duo-stage")
        .every((entry) => !("softenCast" in entry.stage)),
    ).toBe(true);
  });

  it("splits Adele's early-sleep narration into two beats and preserves the original wording", () => {
    const adeleBeat = chapter23Scene.find((entry) => entry.id === "adele-sleeps-early");
    const janeBeat = chapter23Scene.find(
      (entry) => entry.id === "jane-walks-to-garden-alone",
    );

    expect(adeleBeat?.text).toBe(
      "施洗约翰节前夜，阿黛拉采了半天野草莓，太阳还没落山就累得睡着了。",
    );
    expect(janeBeat?.text).toBe("简看她睡稳后，才独自走向花园。");
  });

  it("authors Jane's solo fade-in and Rochester's right-edge slide-in in the scene data", () => {
    const janeBeat = chapter23Scene.find((entry) => entry.id === "jane-walks-to-garden-alone");
    const rochesterBeat = chapter23Scene.find(
      (entry) => entry.id === "rochester-enters-orchard",
    );
    const rochesterFollowUp = chapter23Scene.find(
      (entry) => entry.id === "rochester-wanders-at-ease",
    );

    expect(janeBeat?.stage).toMatchObject({
      mode: "duo-stage",
      left: { character: "jane", visible: true, entrance: "fade-in" },
      right: { character: "rochester", visible: false },
    });
    expect(rochesterBeat?.stage).toMatchObject({
      mode: "duo-stage",
      right: {
        character: "rochester",
        visible: true,
        entrance: "fade-in",
        variant: "back",
      },
    });
    expect(rochesterFollowUp?.stage).toMatchObject({
      mode: "duo-stage",
      right: {
        character: "rochester",
        visible: true,
        entrance: "static",
        variant: "back",
      },
    });

    const rochesterFirstLine = chapter23Scene.find(
      (entry) => entry.id === "rochester-calls-jane-to-moth",
    );
    expect(rochesterFirstLine?.stage).toMatchObject({
      mode: "duo-stage",
      right: { character: "rochester", variant: "default" },
    });
  });

  it("covers the full story as a long linear scene and still ends with Adele's report", () => {
    expect(chapter23Meta.chapterLabel).toContain("第二十三章");
    expect(chapter23Scene.length).toBe(109);
    expect(chapter23Scene.some((entry) => entry.type === "thought")).toBe(true);
    expect(chapter23Scene.some((entry) => entry.speaker === "简·爱")).toBe(true);
    expect(chapter23Scene.some((entry) => entry.speaker === "罗切斯特")).toBe(true);
    expect(chapter23Scene.at(-1)?.text).toContain("大七叶树昨夜遭了雷击");
  });

  it("uses unique scene entry ids", () => {
    const ids = chapter23Scene.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(chapter23Scene.length);
  });
});
