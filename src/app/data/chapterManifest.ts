export type ChapterId =
  | "gateshead"
  | "red-room"
  | "lowood"
  | "thornfield"
  | "moor-house"
  | "ferndean";

export interface ChapterNode {
  id: ChapterId;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  playable: boolean;
}

export const chapterNodes: ChapterNode[] = [
  { id: "gateshead", title: "盖茨海德", subtitle: "寄人篱下", x: 12, y: 35, playable: false },
  { id: "red-room", title: "红房子", subtitle: "幽闭之夜", x: 28, y: 18, playable: false },
  { id: "lowood", title: "罗沃德", subtitle: "苦寒同窗", x: 45, y: 45, playable: false },
  { id: "thornfield", title: "桑菲尔德", subtitle: "月下倾诉", x: 62, y: 28, playable: true },
  { id: "moor-house", title: "沼地居", subtitle: "命运转折", x: 78, y: 60, playable: false },
  { id: "ferndean", title: "芬丁庄园", subtitle: "归途重逢", x: 88, y: 82, playable: false },
];
