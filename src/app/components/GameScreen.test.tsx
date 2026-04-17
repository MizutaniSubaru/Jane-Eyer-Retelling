import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { chapter23Scene } from "../data/chapter23Scene";
import { GameScreen } from "./GameScreen";

describe("GameScreen", () => {
  const advanceToEntry = (entryId: string) => {
    const targetIndex = chapter23Scene.findIndex((entry) => entry.id === entryId);

    if (targetIndex < 0) {
      throw new Error(`Unknown scene entry: ${entryId}`);
    }

    for (let step = 0; step < targetIndex; step += 1) {
      fireEvent.click(screen.getByTestId("dialogue-box"));
    }
  };

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

  it("activates the full-screen embrace background only for the kiss-to-thought sequence", () => {
    render(<GameScreen onBack={vi.fn()} />);

    advanceToEntry("rochester-says-goodnight-dearest");
    expect(screen.queryByTestId("game-embrace-background")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("dialogue-box"));

    expect(screen.getByText(/他吻了她，吻了又吻/)).toBeInTheDocument();
    expect(screen.getByTestId("game-embrace-background")).toBeInTheDocument();
    expect(screen.getByTestId("game-embrace-image").getAttribute("style")).toContain(
      "embrace-banner.jpg",
    );

    fireEvent.click(screen.getByTestId("dialogue-box"));

    expect(screen.getByText(/下次再解释吧/)).toBeInTheDocument();
    expect(screen.getByTestId("game-embrace-background")).toBeInTheDocument();
  });

  it("hides portraits during the embrace banner and restores the storm overlay after it ends", async () => {
    render(<GameScreen onBack={vi.fn()} />);

    advanceToEntry("jane-sees-fairfaxs-look");

    expect(screen.queryByTestId("portrait-jane")).not.toBeInTheDocument();
    expect(screen.queryByTestId("portrait-rochester")).not.toBeInTheDocument();
    expect(screen.queryByTestId("storm-ambient-overlay")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("dialogue-box"));
    fireEvent.click(screen.getByTestId("dialogue-box"));

    expect(screen.getByText(/回到房里后，她想到费尔法克斯太太会暂时误解/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId("game-embrace-background")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("storm-ambient-overlay")).toBeInTheDocument();
  });

  it("uses a corner-to-center light bloom when entering and leaving the embrace banner", () => {
    render(<GameScreen onBack={vi.fn()} />);

    advanceToEntry("jane-sees-fairfaxs-look");

    expect(
      screen
        .getAllByTestId("game-embrace-corner-glow")
        .some((element) => element.getAttribute("data-direction") === "enter"),
    ).toBe(true);
    expect(
      screen
        .getAllByTestId("game-embrace-flash")
        .some((element) => element.getAttribute("data-direction") === "enter"),
    ).toBe(true);

    fireEvent.click(screen.getByTestId("dialogue-box"));
    fireEvent.click(screen.getByTestId("dialogue-box"));

    expect(screen.getByText(/回到房里后，她想到费尔法克斯太太会暂时误解/)).toBeInTheDocument();
    expect(
      screen
        .getAllByTestId("game-embrace-corner-glow")
        .some((element) => element.getAttribute("data-direction") === "exit"),
    ).toBe(true);
    expect(
      screen
        .getAllByTestId("game-embrace-flash")
        .some((element) => element.getAttribute("data-direction") === "exit"),
    ).toBe(true);
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
