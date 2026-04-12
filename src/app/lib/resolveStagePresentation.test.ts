import { describe, expect, it } from "vitest";

import { resolveStagePresentation } from "./resolveStagePresentation";
import type { SceneEntry } from "../types/story";

const rochesterDialogueStage: SceneEntry = {
  id: "rochester-speaks",
  type: "dialogue",
  speaker: "罗切斯特",
  text: "简，过来看看这家伙。",
  atmosphere: { weather: "calm" },
  stage: {
    mode: "duo-stage",
    left: { character: "jane", mood: "neutral", light: "dim" },
    right: { character: "rochester", mood: "neutral", light: "dim" },
  },
};

const thoughtAfterDialogue: SceneEntry = {
  id: "jane-thought",
  type: "thought",
  speaker: "简·爱",
  text: "我明明没有出声，他怎么还是知道我在这里？",
  atmosphere: { weather: "calm" },
  stage: {
    mode: "duo-stage",
    left: { character: "jane", mood: "neutral", light: "dim" },
    right: { character: "rochester", mood: "neutral", light: "dim" },
  },
};

describe("resolveStagePresentation", () => {
  it("brightens the current dialogue speaker", () => {
    const resolved = resolveStagePresentation([rochesterDialogueStage], 0);

    expect(resolved.mode).toBe("duo-stage");
    if (resolved.mode !== "duo-stage") {
      throw new Error("Expected a duo-stage result.");
    }

    expect(resolved.left.light).toBe("dim");
    expect(resolved.right.light).toBe("bright");
  });

  it("inherits the previous dialogue highlight for thought and narration beats", () => {
    const resolved = resolveStagePresentation(
      [rochesterDialogueStage, thoughtAfterDialogue],
      1,
    );

    expect(resolved.mode).toBe("duo-stage");
    if (resolved.mode !== "duo-stage") {
      throw new Error("Expected a duo-stage result.");
    }

    expect(resolved.left.light).toBe("dim");
    expect(resolved.right.light).toBe("bright");
  });

  it("falls back to both portraits dim when no prior dialogue highlight exists", () => {
    const resolved = resolveStagePresentation([thoughtAfterDialogue], 0);

    expect(resolved.mode).toBe("duo-stage");
    if (resolved.mode !== "duo-stage") {
      throw new Error("Expected a duo-stage result.");
    }

    expect(resolved.left.light).toBe("dim");
    expect(resolved.right.light).toBe("dim");
  });

  it("returns non-duo stages unchanged", () => {
    const narrationOnlyEntry: SceneEntry = {
      id: "summer-opens",
      type: "narration",
      speaker: "旁白",
      text: "这个仲夏的英格兰格外明亮。",
      atmosphere: { weather: "calm" },
      stage: { mode: "narration-only" },
    };

    expect(resolveStagePresentation([narrationOnlyEntry], 0)).toEqual({
      mode: "narration-only",
    });
  });
});
