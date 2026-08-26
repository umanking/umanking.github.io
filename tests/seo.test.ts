import { describe, it, expect } from "vitest";
import { buildTitle, SITE } from "../src/lib/seo";

describe("title 생성 규칙", () => {
  it("짧은 제목에는 사이트명을 붙인다", () => {
    expect(buildTitle("JPA 연관관계 매핑")).toBe("JPA 연관관계 매핑 | 맥락");
  });

  it("30자를 넘으면 사이트명을 붙이지 않는다", () => {
    const long = "가".repeat(31);
    expect(buildTitle(long)).toBe(long);
  });

  it("사이트명을 앞에 두지 않는다", () => {
    expect(buildTitle("Redis 시작하기").startsWith(SITE.name)).toBe(false);
  });
});
