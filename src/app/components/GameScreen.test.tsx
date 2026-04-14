import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { chapter23Scene } from "../data/chapter23Scene";
import { GameScreen } from "./GameScreen";

describe("GameScreen", () => {
  afterEach(() => {
    cleanup();
  });

  it("starts on the chapter card and advances into narration without showing choices", () => {
    render(<GameScreen onBack={vi.fn()} />);

    expect(screen.getByText(/第二十三章/)).toBeInTheDocument();
    expect(screen.getAllByText(/果园之夜/).length).toBeGreaterThan(1);

    fireEvent.click(screen.getByTestId("dialogue-box"));

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

  it("highlights the thinker during subsequent thought beats", () => {
    render(<GameScreen onBack={vi.fn()} />);

    for (let step = 0; step < 14; step += 1) {
      fireEvent.click(screen.getByTestId("dialogue-box"));
    }

    expect(screen.getByText("简，过来看看这家伙。")).toBeInTheDocument();
    expect(screen.getByTestId("portrait-jane")).toHaveAttribute("data-light", "dim");
    const speakingRochesterPortrait = screen
      .getAllByTestId("portrait-rochester")
      .find((portrait) => portrait.getAttribute("data-light") === "bright");
    expect(speakingRochesterPortrait).toHaveAttribute("data-light", "bright");

    fireEvent.click(screen.getByTestId("game-stage-layer"));

    expect(screen.getByText(/我明明没有出声，他怎么还是知道我在这里？/)).toBeInTheDocument();
    expect(screen.getByTestId("portrait-jane")).toHaveAttribute("data-light", "bright");
    const currentRochesterPortrait = screen
      .getAllByTestId("portrait-rochester")
      .find(
        (portrait) =>
          /rochester-bright-neutral\.png$/.test(portrait.getAttribute("src") ?? "") &&
          portrait.getAttribute("data-light") === "dim",
      );
    expect(currentRochesterPortrait).toHaveAttribute("data-light", "dim");
  });

  it("shows Jane alone on the split follow-up beat before Rochester enters", () => {
    render(<GameScreen onBack={vi.fn()} />);

    for (let step = 0; step < 3; step += 1) {
      fireEvent.click(screen.getByTestId("dialogue-box"));
    }

    expect(screen.getByText("简看她睡稳后，才独自走向花园。")).toBeInTheDocument();
    expect(screen.getByTestId("portrait-jane")).toBeInTheDocument();
    expect(screen.queryByTestId("portrait-rochester")).not.toBeInTheDocument();
    expect(screen.getByTestId("portrait-shell-jane")).toHaveAttribute(
      "data-entrance",
      "fade-in",
    );
  });

  it("shows Rochester's back portrait before his first line and switches to the default bright portrait when he speaks", () => {
    render(<GameScreen onBack={vi.fn()} />);

    for (let step = 0; step < 10; step += 1) {
      fireEvent.click(screen.getByTestId("dialogue-box"));
    }

    expect(
      screen.getByText(/她正要去边门，却看见罗切斯特先生先一步跨了进来/),
    ).toBeInTheDocument();
    expect(screen.getByTestId("portrait-jane")).toBeInTheDocument();
    expect(screen.getByTestId("portrait-rochester")).toBeInTheDocument();
    expect(screen.getByTestId("portrait-shell-rochester")).toHaveAttribute(
      "data-entrance",
      "fade-in",
    );
    expect(screen.getByTestId("portrait-rochester")).toHaveAttribute(
      "src",
      expect.stringMatching(/rochester-back\.png$/),
    );

    for (let step = 0; step < 4; step += 1) {
      fireEvent.click(screen.getByTestId("dialogue-box"));
    }

    expect(screen.getByText("简，过来看看这家伙。")).toBeInTheDocument();
    const rochesterShells = screen.getAllByTestId("portrait-shell-rochester");
    const rochesterPortraits = screen.getAllByTestId("portrait-rochester");
    const frontShell = rochesterShells.find(
      (shell) => shell.getAttribute("data-variant") === "default",
    );
    const frontPortrait = rochesterPortraits.find((portrait) =>
      /rochester-bright-neutral\.png$/.test(portrait.getAttribute("src") ?? ""),
    );

    expect(frontShell).toHaveAttribute(
      "data-entrance",
      "fade-in",
    );
    expect(frontPortrait).toHaveAttribute(
      "data-light",
      "bright",
    );
  });

  it("notifies the app when the final line is reached", () => {
    const onStoryEnd = vi.fn();

    render(<GameScreen onBack={vi.fn()} onStoryEnd={onStoryEnd} />);

    for (let step = 0; step < chapter23Scene.length - 1; step += 1) {
      fireEvent.click(screen.getByTestId("dialogue-box"));
    }

    expect(screen.getByText(/大七叶树昨夜遭了雷击/)).toBeInTheDocument();
    expect(onStoryEnd).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("dialogue-box"));

    expect(onStoryEnd).toHaveBeenCalledTimes(1);
  });
});
