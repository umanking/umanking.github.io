import { describe, expect, it } from "vitest";
import { postSchema } from "../src/content.config";

const base = {
  title: "기술 브리프",
  description: "원문의 핵심과 실무 의미를 짧고 분명하게 설명하는 기술 브리프입니다.",
  date: "2026-09-15",
  permalink: "/2026/09/15/tech-brief/",
  section: "ai",
  hub: "engineering",
  type: "brief",
  level: "중급",
  tags: ["AI"],
};

describe("Brief 콘텐츠 계약", () => {
  it("원문과 선정 이유가 없으면 거부한다", () => {
    expect(postSchema.safeParse(base).success).toBe(false);
  });

  it("원문과 선정 이유가 있으면 허용한다", () => {
    expect(postSchema.safeParse({ ...base, curation: {
      sourceUrl: "https://example.com/original",
      sourceName: "Example Engineering",
      whyItMatters: "실제 운영 판단에 필요한 조건을 확인할 수 있습니다.",
    } }).success).toBe(true);
  });
});
