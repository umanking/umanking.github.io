import { describe, it, expect } from "vitest";
import { curationSchemaShape } from "../src/lib/curation";

describe("큐레이션 스키마", () => {
  const base = {
    title: "Spring Boot 3.5 릴리스",
    url: "https://spring.io/blog/2026/08/20/spring-boot-3-5",
    source: "spring.io",
    date: "2026-08-20",
    section: "backend",
    comment: "가",
  };

  it("코멘터리가 80자 미만이면 거부한다 — 애드센스 정책 방어선이다", () => {
    const r = curationSchemaShape.safeParse({ ...base, comment: "짧은 코멘트" });
    expect(r.success).toBe(false);
  });

  it("코멘터리가 80자 이상이면 통과한다", () => {
    const r = curationSchemaShape.safeParse({ ...base, comment: "가".repeat(80) });
    expect(r.success).toBe(true);
  });

  it("외부 URL 썸네일은 거부한다 — 로컬 경로만 허용한다", () => {
    const r = curationSchemaShape.safeParse({
      ...base, comment: "가".repeat(80),
      thumbnail: "https://example.com/a.png", thumbnailWidth: 640, thumbnailHeight: 360,
    });
    expect(r.success).toBe(false);
  });

  it("썸네일에 width/height가 없으면 거부한다 — CLS 방지", () => {
    const r = curationSchemaShape.safeParse({
      ...base, comment: "가".repeat(80), thumbnail: "/images/curation/a.png",
    });
    expect(r.success).toBe(false);
  });

  it("media가 video인데 youtubeId가 없으면 거부한다", () => {
    const r = curationSchemaShape.safeParse({
      ...base, comment: "가".repeat(80), media: "video",
    });
    expect(r.success).toBe(false);
  });
});
