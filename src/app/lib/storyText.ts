import type { SceneEntryType } from "../types/story";

export function formatEntryText(
  entry: Pick<{ type: SceneEntryType; text: string }, "type" | "text">,
) {
  if (entry.type !== "thought") {
    return entry.text;
  }

  const trimmed = entry.text.replace(/^（|）$/g, "");
  return `（${trimmed}）`;
}
