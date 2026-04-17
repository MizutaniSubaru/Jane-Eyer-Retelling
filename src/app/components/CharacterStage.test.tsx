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

  it("renders dedicated warm portrait art instead of falling back to neutral", () => {
    render(
      <CharacterStage
        stage={{
          mode: "duo-stage",
          left: { character: "jane", mood: "warm", light: "bright" },
          right: { character: "rochester", mood: "warm", light: "bright" },
        }}
      />,
    );

    expect(screen.getByTestId("portrait-jane")).toHaveAttribute(
      "src",
      expect.stringMatching(/jane-bright-warm\.png$/),
    );
    expect(screen.getByTestId("portrait-rochester")).toHaveAttribute(
      "src",
      expect.stringMatching(/rochester-bright-warm\.png$/),
    );
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

  it("omits hidden portrait slots from the DOM", () => {
    render(
      <CharacterStage
        sceneKey="jane-walks-to-garden-alone"
        stage={{
          mode: "duo-stage",
          left: {
            character: "jane",
            mood: "neutral",
            light: "bright",
            visible: true,
            entrance: "fade-in",
          },
          right: {
            character: "rochester",
            mood: "neutral",
            light: "dim",
            visible: false,
            entrance: "static",
          },
        }}
      />,
    );

    expect(screen.getByTestId("portrait-shell-jane")).toHaveAttribute("data-entrance", "fade-in");
    expect(screen.getByTestId("portrait-jane")).toHaveAttribute("data-light", "bright");
    expect(screen.queryByTestId("portrait-shell-rochester")).not.toBeInTheDocument();
    expect(screen.queryByTestId("portrait-rochester")).not.toBeInTheDocument();
  });

  it("annotates right-side slide-in entrances on Rochester's shell", () => {
    render(
      <CharacterStage
        sceneKey="rochester-enters-orchard"
        stage={{
          mode: "duo-stage",
          left: {
            character: "jane",
            mood: "neutral",
            light: "dim",
            visible: true,
            entrance: "static",
          },
          right: {
            character: "rochester",
            mood: "neutral",
            light: "dim",
            visible: true,
            entrance: "fade-in",
            variant: "back" as never,
          },
        }}
      />,
    );

    expect(screen.getByTestId("portrait-shell-rochester")).toHaveAttribute(
      "data-entrance",
      "fade-in",
    );
    expect(screen.getByTestId("portrait-rochester")).toHaveAttribute(
      "src",
      expect.stringMatching(/rochester-back\.png$/),
    );
  });

  it("crossfades Rochester from the back portrait to the front portrait when he starts speaking", () => {
    const { rerender } = render(
      <CharacterStage
        sceneKey="jane-steps-over-grass"
        stage={{
          mode: "duo-stage",
          left: {
            character: "jane",
            mood: "neutral",
            light: "dim",
            visible: true,
            entrance: "static",
          },
          right: {
            character: "rochester",
            mood: "neutral",
            light: "dim",
            visible: true,
            entrance: "static",
            variant: "back" as never,
          },
        }}
      />,
    );

    rerender(
      <CharacterStage
        sceneKey="rochester-calls-jane-to-moth"
        stage={{
          mode: "duo-stage",
          left: {
            character: "jane",
            mood: "neutral",
            light: "dim",
            visible: true,
            entrance: "static",
          },
          right: {
            character: "rochester",
            mood: "neutral",
            light: "bright",
            visible: true,
            entrance: "fade-in",
            variant: "default" as never,
          },
        }}
      />,
    );

    const rochesterShells = screen.getAllByTestId("portrait-shell-rochester");

    expect(rochesterShells).toHaveLength(2);
    expect(
      rochesterShells.map((shell) => shell.getAttribute("data-variant")).sort(),
    ).toEqual(["back", "default"]);
    expect(
      rochesterShells.find((shell) => shell.getAttribute("data-variant") === "back"),
    ).toHaveAttribute("data-exit", "fade-out");
    expect(
      rochesterShells.find((shell) => shell.getAttribute("data-variant") === "default"),
    ).toHaveAttribute("data-entrance", "fade-in");
  });

  it("restores Rochester's front portrait to full opacity if the scene advances before fade-in completes", () => {
    const { rerender } = render(
      <CharacterStage
        sceneKey="rochester-calls-jane-to-moth"
        stage={{
          mode: "duo-stage",
          left: {
            character: "jane",
            mood: "neutral",
            light: "dim",
            visible: true,
            entrance: "static",
          },
          right: {
            character: "rochester",
            mood: "neutral",
            light: "bright",
            visible: true,
            entrance: "fade-in",
            variant: "default" as never,
          },
        }}
      />,
    );

    rerender(
      <CharacterStage
        sceneKey="jane-startled-by-being-seen"
        stage={{
          mode: "duo-stage",
          left: {
            character: "jane",
            mood: "neutral",
            light: "bright",
            visible: true,
            entrance: "static",
          },
          right: {
            character: "rochester",
            mood: "neutral",
            light: "dim",
            visible: true,
            entrance: "static",
            variant: "default" as never,
          },
        }}
      />,
    );

    const currentFrontShell = screen
      .getAllByTestId("portrait-shell-rochester")
      .find((shell) => shell.getAttribute("data-variant") === "default");

    expect(currentFrontShell).toHaveAttribute("data-entrance", "static");
    expect(currentFrontShell).toHaveStyle({ opacity: "1" });
  });
});
