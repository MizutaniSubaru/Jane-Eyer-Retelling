import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CharacterStage } from "./CharacterStage";

describe("CharacterStage", () => {
  afterEach(() => {
    cleanup();
  });

  it("marks the speaking portrait as bright", () => {
    render(
      <CharacterStage
        stage={{
          mode: "duo-stage",
          left: { character: "jane", mood: "neutral", light: "bright" },
          right: { character: "rochester", mood: "neutral", light: "dim" },
        }}
      />,
    );

    expect(screen.getByTestId("portrait-jane")).toHaveAttribute("data-light", "bright");
    expect(screen.getByTestId("portrait-rochester")).toHaveAttribute("data-light", "dim");
  });

  it("renders the stage as a fixed full-scene layer", () => {
    render(
      <CharacterStage
        stage={{
          mode: "duo-stage",
          left: { character: "jane", mood: "neutral", light: "dim" },
          right: { character: "rochester", mood: "neutral", light: "bright" },
        }}
      />,
    );

    expect(screen.getByTestId("character-stage-layer")).toHaveClass(
      "relative",
      "h-full",
      "w-full",
      "overflow-hidden",
    );
  });

  it("does not apply the old softened opacity treatment", () => {
    render(
      <CharacterStage
        stage={{
          mode: "duo-stage",
          left: { character: "jane", mood: "neutral", light: "dim" },
          right: { character: "rochester", mood: "warm", light: "bright" },
        }}
      />,
    );

    expect(screen.getByTestId("portrait-shell-jane")).not.toHaveClass("opacity-65");
    expect(screen.getByTestId("portrait-shell-rochester")).not.toHaveClass("opacity-65");
  });

  it("renders no portrait images during narration-only setup", () => {
    const { container } = render(<CharacterStage stage={{ mode: "narration-only" }} />);

    expect(screen.queryByTestId("portrait-jane")).not.toBeInTheDocument();
    expect(screen.queryByTestId("portrait-rochester")).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for chapter card mode", () => {
    const { container } = render(<CharacterStage stage={{ mode: "card" }} />);

    expect(screen.queryByTestId("portrait-jane")).not.toBeInTheDocument();
    expect(screen.queryByTestId("portrait-rochester")).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });
});
