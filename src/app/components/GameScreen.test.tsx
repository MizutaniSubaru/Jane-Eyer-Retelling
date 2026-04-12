import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GameScreen } from "./GameScreen";

describe("GameScreen", () => {
  afterEach(() => {
    cleanup();
  });

  it("starts on the chapter card and advances into narration without showing choices", () => {
    render(<GameScreen onBack={vi.fn()} />);

    expect(screen.getByText(/第二十三章/)).toBeInTheDocument();
    expect(screen.getByText(/果园之夜/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /下一句/i }));

    expect(screen.getByText(/这个仲夏的英格兰格外明亮/)).toBeInTheDocument();
    expect(
      screen.queryByText(/停下脚步，转过身安静地看着他/),
    ).not.toBeInTheDocument();
  });

  it("renders the portrait stage and dialogue box as absolute overlays", () => {
    render(<GameScreen onBack={vi.fn()} />);

    const stageLayer = screen.getByTestId("game-stage-layer");

    expect(stageLayer).toHaveClass(
      "absolute",
      "inset-0",
      "z-10",
    );
    expect(stageLayer.className).not.toMatch(/(?:^|\s)(?:[a-z]+:)?pb-\S+/);
    expect(screen.getByTestId("game-dialogue-layer")).toHaveClass(
      "absolute",
      "inset-x-0",
      "bottom-0",
      "z-20",
    );
  });

  it("keeps the previous dialogue highlight during subsequent thought beats", () => {
    render(<GameScreen onBack={vi.fn()} />);

    const nextButton = screen.getByRole("button", { name: /下一句/i });

    for (let step = 0; step < 13; step += 1) {
      fireEvent.click(nextButton);
    }

    expect(screen.getByText("简，过来看看这家伙。")).toBeInTheDocument();
    expect(screen.getByTestId("portrait-jane")).toHaveAttribute("data-light", "dim");
    expect(screen.getByTestId("portrait-rochester")).toHaveAttribute("data-light", "bright");

    fireEvent.click(nextButton);

    expect(screen.getByText(/我明明没有出声，他怎么还是知道我在这里？/)).toBeInTheDocument();
    expect(screen.getByTestId("portrait-jane")).toHaveAttribute("data-light", "dim");
    expect(screen.getByTestId("portrait-rochester")).toHaveAttribute("data-light", "bright");
  });
});
