import { describe, expect, it } from "vitest";
import { formatEntryText } from "./storyText";

describe("formatEntryText", () => {
  it("wraps thought text in Chinese parentheses", () => {
    expect(formatEntryText({ type: "thought", text: "我得赶紧躲开。" })).toBe(
      "（我得赶紧躲开。）",
    );
  });

  it("leaves narration untouched", () => {
    expect(formatEntryText({ type: "narration", text: "夜色变得更深了。" })).toBe(
      "夜色变得更深了。",
    );
  });
});
