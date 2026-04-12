import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
    const onNext = vi.fn();

    renderDialogueBox({ onNext });

    expect(screen.getByText("简")).toBeInTheDocument();
    expect(screen.getByText("月亮已经升起来了。")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /上一句/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /下一句/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("dialogue-box"));
    expect(onNext).toHaveBeenCalledTimes(1);
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
    expect(screen.getByTestId("dialogue-speaker")).toHaveClass("text-[#bec8df]");
  });

  it("suppresses the narration label without leaving a name column gap", () => {
    renderDialogueBox({
      entryType: "narration",
      speaker: "旁白",
      text: "夜风吹过果树，树影在石径上缓缓移动。",
    });

    expect(screen.queryByText("旁白")).not.toBeInTheDocument();
    expect(screen.getByText("夜风吹过果树，树影在石径上缓缓移动。")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /上一句/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /下一句/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("dialogue-speaker")).not.toBeInTheDocument();
  });

  it("still renders a dialogue speaker label for spoken lines", () => {
    renderDialogueBox({
      entryType: "dialogue",
      speaker: "罗切斯特",
      text: "简，留下来。",
    });

    expect(screen.getByText("罗切斯特")).toBeInTheDocument();
    expect(screen.getByTestId("dialogue-speaker")).toHaveClass("text-[#d9c2a0]");
  });

  it("renders the speaker name above the text body when present", () => {
    renderDialogueBox({
      entryType: "dialogue",
      speaker: "罗切斯特",
      text: "简，留下来。",
    });

    expect(screen.getByTestId("dialogue-speaker")).toHaveTextContent("罗切斯特");
    expect(screen.getByTestId("dialogue-content")).toHaveClass("gap-3");
  });
});
