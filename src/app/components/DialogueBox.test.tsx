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
    expect(screen.queryByTestId("dialogue-speaker")).not.toBeInTheDocument();
    expect(screen.getByTestId("dialogue-content")).toHaveClass("whitespace-pre-line");
  });

  it("uses a smaller chapter-card title size for three-line chapter cards", () => {
    renderDialogueBox({
      entryType: "chapter-card",
      speaker: "旁白",
      text: "第二十三章\n果园之夜\n月光下的离别恐惧，终于引出了迟来的求婚。",
    });

    const content = screen.getByTestId("dialogue-content");

    expect(content).toHaveAttribute("data-density", "chapter");
    expect(content).toHaveClass("text-2xl");
    expect(content).toHaveClass("md:text-3xl");
    expect(content).toHaveClass("leading-tight");
  });

  it("renders thought text on the italic styling branch", () => {
    renderDialogueBox({
      entryType: "thought",
      text: "若是现在离开，我会后悔一生。",
    });

    expect(screen.getByText("简")).toBeInTheDocument();
    expect(screen.getByTestId("dialogue-content")).toHaveClass("italic");
  });

  it("suppresses the narration label without leaving a name plate", () => {
    renderDialogueBox({
      entryType: "narration",
      speaker: "旁白",
      text: "夜风吹过果树，树影在石径上缓缓移动。",
    });

    expect(screen.queryByText("旁白")).not.toBeInTheDocument();
    expect(screen.getByText("夜风吹过果树，树影在石径上缓缓移动。")).toBeInTheDocument();
    expect(screen.queryByTestId("dialogue-speaker")).not.toBeInTheDocument();
  });

  it("renders a dialogue speaker label for spoken lines", () => {
    renderDialogueBox({
      entryType: "dialogue",
      speaker: "罗切斯特",
      text: "简，留下来。",
    });

    expect(screen.getByText("罗切斯特")).toBeInTheDocument();
    expect(screen.getByTestId("dialogue-speaker")).toHaveTextContent("罗切斯特");
  });

  it("renders the main dialogue surface as an undistorted source image", () => {
    renderDialogueBox({
      text: "这是一段浮现中的台词。",
    });

    const frame = screen.getByTestId("dialogue-frame");
    const image = screen.getByTestId("dialogue-frame-image");

    expect(frame).toHaveStyle({
      aspectRatio: "1490 / 233",
    });
    expect(frame.getAttribute("style")).not.toContain("border-image");
    expect(frame).toHaveStyle({ background: "transparent" });
    expect(image).toHaveClass("object-contain");
  });

  it("places dialogue text slightly below the top edge of the writing area", () => {
    renderDialogueBox({
      text: "月亮已经升起来了。",
    });

    expect(screen.getByTestId("dialogue-text-layer")).toHaveClass("top-[25%]");
  });

  it("keeps long lines on the same large text size and reserves three lines", () => {
    renderDialogueBox({
      text:
        "什么，我？除了你，我在这世上没有一个朋友。若你的心像我一样坚定，若你的情意也像我一样真挚，那我就把一切都献给你。",
    });

    const content = screen.getByTestId("dialogue-content");

    expect(content).toHaveAttribute("data-density", "normal");
    expect(content).toHaveAttribute("data-lines", "3");
    expect(content).toHaveClass("text-lg");
    expect(content).toHaveClass("md:text-xl");
    expect(content).toHaveClass("leading-snug");
  });

  it("scales the speaker name tag without distorting its original ratio", () => {
    renderDialogueBox({
      speaker: "简·爱",
      text: "我该留下吗？",
    });

    expect(screen.getByText("简·爱")).toBeInTheDocument();
    expect(screen.getByTestId("dialogue-speaker-frame")).toHaveStyle({
      width: "214px",
      aspectRatio: "406 / 92",
      boxSizing: "border-box",
    });
    expect(screen.getByTestId("dialogue-speaker")).toHaveClass("top-1/2");
    expect(screen.getByTestId("dialogue-speaker")).toHaveClass("-translate-y-1/2");
    expect(
      screen.getByTestId("dialogue-speaker-frame").querySelector("img"),
    ).toHaveClass("object-contain");
  });
});
