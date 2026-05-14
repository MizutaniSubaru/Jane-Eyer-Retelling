import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TopBar } from "./TopBar";

describe("TopBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the chapter label on the source image fill", () => {
    render(
      <TopBar
        onBack={vi.fn()}
        chapterLabel="第二十三章 · 果园之夜"
      />,
    );

    const chapterFrame = screen.getByTestId("chapter-frame");

    expect(chapterFrame).toHaveStyle({
      background: "transparent",
      borderImageRepeat: "stretch",
    });
    expect(chapterFrame.getAttribute("style")).toContain("fill");
  });
});
