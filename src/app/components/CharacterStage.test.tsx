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

  it("renders dim portraits as softened color from the bright base art", () => {
    render(
      <CharacterStage
        stage={{
          mode: "duo-stage",
          left: { character: "jane", mood: "neutral", light: "dim" },
          right: { character: "rochester", mood: "neutral", light: "bright" },
        }}
      />,
    );

    expect(screen.getByTestId("portrait-jane")).toHaveAttribute(
      "src",
      expect.stringMatching(/jane-bright-neutral\.png$/),
    );
    expect(screen.getByTestId("portrait-jane")).toHaveClass(
      "brightness-[0.74]",
      "saturate-[0.82]",
    );
    expect(screen.getByTestId("portrait-jane")).not.toHaveClass("grayscale");
    expect(screen.getByTestId("portrait-jane")).not.toHaveClass("opacity-65");
  });

  it("renders the speaking portrait with a brighter, richer color treatment", () => {
    render(
      <CharacterStage
        stage={{
          mode: "duo-stage",
          left: { character: "jane", mood: "neutral", light: "bright" },
          right: { character: "rochester", mood: "neutral", light: "dim" },
        }}
      />,
    );

    expect(screen.getByTestId("portrait-jane")).toHaveClass(
      "brightness-[1.08]",
      "saturate-[1.06]",
    );
    expect(screen.getByTestId("portrait-jane")).not.toHaveClass("grayscale");
  });

  it("keeps Rochester on a warmer color grade than Jane", () => {
    render(
      <CharacterStage
        stage={{
          mode: "duo-stage",
          left: { character: "jane", mood: "neutral", light: "bright" },
          right: { character: "rochester", mood: "neutral", light: "dim" },
        }}
      />,
    );

    expect(screen.getByTestId("portrait-rochester")).toHaveClass(
      "brightness-[0.68]",
      "saturate-[0.76]",
      "sepia-[0.08]",
    );
    expect(screen.getByTestId("portrait-jane")).not.toHaveClass("sepia-[0.08]");
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
    const legacySoftenStage = {
      mode: "duo-stage",
      softenCast: true,
      left: { character: "jane", mood: "neutral", light: "dim" },
      right: { character: "rochester", mood: "warm", light: "bright" },
    } as const;

    render(
      <CharacterStage
        stage={legacySoftenStage as unknown as Parameters<typeof CharacterStage>[0]["stage"]}
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
