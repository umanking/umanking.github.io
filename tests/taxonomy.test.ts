import { describe, it, expect } from "vitest";
import { SECTIONS, SECTION_IDS, HUB_OPEN_THRESHOLD } from "../src/data/taxonomy";
import { hubState } from "../src/lib/taxonomy";

describe("분류 체계", () => {
  it("최상위 섹션은 7개이고 순서가 고정돼야 한다", () => {
    expect(SECTION_IDS).toEqual([
      "architecture", "backend", "web", "data", "infra", "ai", "news",
    ]);
  });

  it("허브 id가 섹션 안에서 유일해야 한다", () => {
    for (const s of SECTIONS) {
      const ids = s.hubs.map((h) => h.id);
      expect(new Set(ids).size, `${s.id} 섹션에 중복 허브`).toBe(ids.length);
    }
  });

  it("모든 섹션과 허브가 설명문을 가져야 한다", () => {
    for (const s of SECTIONS) {
      expect(s.description.length, `${s.id} 설명 없음`).toBeGreaterThan(10);
      for (const h of s.hubs) {
        expect(h.description.length, `${s.id}/${h.id} 설명 없음`).toBeGreaterThan(5);
      }
    }
  });

  it("허브 오픈 임계는 3편이다", () => {
    expect(HUB_OPEN_THRESHOLD).toBe(3);
  });
});

describe("허브 오픈 판정", () => {
  it("0편이면 closed", () => {
    expect(hubState(0)).toBe("closed");
  });

  it("1~2편이면 partial", () => {
    expect(hubState(1)).toBe("partial");
    expect(hubState(2)).toBe("partial");
  });

  it("3편 이상이면 open", () => {
    expect(hubState(3)).toBe("open");
    expect(hubState(30)).toBe("open");
  });
});
