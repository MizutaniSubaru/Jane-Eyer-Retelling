import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";

import { DialogueBox } from "./DialogueBox";

function renderDialogueBox(
  props: Partial<ComponentProps<typeof DialogueBox>> = {},
) {
  const onNext = vi.fn();
  const onPrev = vi.fn();

  return render(
    <DialogueBox
      speaker="简"
      text="月亮已经升起来了。"
      onNext={onNext}
      onPrev={onPrev}
      canNext
      canPrev
      isChoiceState={false}
      {...props}
    />,
  );
}

describe("DialogueBox", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses the dialogue presentation when entryType is omitted", () => {
    renderDialogueBox();

    expect(screen.getByText("简")).toBeInTheDocument();
    expect(screen.getByText("月亮已经升起来了。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /上一句/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /下一句/i })).toBeInTheDocument();
  });

  it("renders chapter cards without a speaker label", () => {
    renderDialogueBox({
      entryType: "chapter-card",
      speaker: "旁白",
      text: "第二十三章\n果园之夜",
    });

    expect(screen.queryByText("旁白")).not.toBeInTheDocument();
    expect(screen.getByText(/第二十三章/)).toHaveClass("whitespace-pre-line");
  });

  it("renders thought text on the distinct styling branch", () => {
    renderDialogueBox({
      entryType: "thought",
      text: "若是现在离开，我会后悔一生。",
    });

    expect(screen.getByText("简")).toBeInTheDocument();
    expect(screen.getByText("若是现在离开，我会后悔一生。")).toHaveClass("italic");
  });

  it("keeps speaker text and navigation controls for narration and dialogue", () => {
    const { rerender } = renderDialogueBox({
      entryType: "narration",
      speaker: "旁白",
      text: "夜风吹过果树，树影在石径上缓缓移动。",
    });

    expect(screen.getByText("旁白")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /上一句/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /下一句/i })).toBeInTheDocument();

    rerender(
      <DialogueBox
        entryType="dialogue"
        speaker="罗切斯特"
        text="简，留下来。"
        onNext={vi.fn()}
        onPrev={vi.fn()}
        canNext
        canPrev
        isChoiceState={false}
      />,
    );

    expect(screen.getByText("罗切斯特")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /上一句/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /下一句/i })).toBeInTheDocument();
  });
});
