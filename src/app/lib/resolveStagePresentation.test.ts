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

const narrationAfterDialogue: SceneEntry = {
  id: "narration-after-dialogue",
  type: "narration",
  speaker: "旁白",
  text: "空气沉静下来，仿佛所有声音都在等待下一句话。",
  atmosphere: { weather: "calm" },
  stage: {
    mode: "duo-stage",
    left: { character: "jane", mood: "neutral", light: "dim" },
    right: { character: "rochester", mood: "neutral", light: "dim" },
  },
};

const unmappedDialogueStage: SceneEntry = {
  id: "mrs-fairfax-speaks",
  type: "dialogue",
  speaker: "费尔法克斯太太",
  text: "晚餐已经准备好了。",
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

  it("inherits the immediately previous dialogue highlight for duo-stage narration", () => {
    const resolved = resolveStagePresentation(
      [rochesterDialogueStage, narrationAfterDialogue],
      1,
    );

    expect(resolved.mode).toBe("duo-stage");
    if (resolved.mode !== "duo-stage") {
      throw new Error("Expected a duo-stage result.");
    }

    expect(resolved.left.light).toBe("dim");
    expect(resolved.right.light).toBe("bright");
  });

  it("falls back to both dim when the nearest prior duo-stage dialogue speaker is unmapped", () => {
    const resolved = resolveStagePresentation(
      [rochesterDialogueStage, unmappedDialogueStage, thoughtAfterDialogue],
      2,
    );

    expect(resolved.mode).toBe("duo-stage");
    if (resolved.mode !== "duo-stage") {
      throw new Error("Expected a duo-stage result.");
    }

    expect(resolved.left.light).toBe("dim");
    expect(resolved.right.light).toBe("dim");
  });

  it("stops highlight inheritance when a non-duo-stage beat breaks the stage sequence", () => {
    const narrationOnlyBreak: SceneEntry = {
      id: "garden-break",
      type: "narration",
      speaker: "旁白",
      text: "风声穿过树梢，舞台上的人像暂时退去。",
      atmosphere: { weather: "calm" },
      stage: { mode: "narration-only" },
    };

    const resolved = resolveStagePresentation(
      [rochesterDialogueStage, narrationOnlyBreak, thoughtAfterDialogue],
      2,
    );

    expect(resolved.mode).toBe("duo-stage");
    if (resolved.mode !== "duo-stage") {
      throw new Error("Expected a duo-stage result.");
    }

    expect(resolved.left.light).toBe("dim");
    expect(resolved.right.light).toBe("dim");
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

  it("throws when current index is invalid", () => {
    expect(() => resolveStagePresentation([rochesterDialogueStage], -1)).toThrow(
      RangeError,
    );
    expect(() => resolveStagePresentation([rochesterDialogueStage], 1)).toThrow(
      RangeError,
    );
  });
});
