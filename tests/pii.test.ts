import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/posts";
const files = readdirSync(DIR).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
const read = (f: string) => readFileSync(join(DIR, f), "utf8");

describe("본문 개인정보 비노출", () => {
  it("로컬 홈 경로에 사용자명이 남아 있지 않다", () => {
    const hits = files.filter((f) => /\/Users\/andrew/i.test(read(f)));
    expect(hits).toEqual([]);
  });

  it("개인 이메일이 남아 있지 않다", () => {
    const hits = files.filter((f) => /umanking@|andrew@/i.test(read(f)));
    expect(hits).toEqual([]);
  });

  it("실명 성씨가 남아 있지 않다", () => {
    const hits = files.filter((f) => /\$\{andrew\.name\} Han/i.test(read(f)));
    expect(hits).toEqual([]);
  });

  it("andrew는 github.com/umanking 링크 맥락에서만 허용된다", () => {
    const offenders: string[] = [];
    for (const f of files) {
      for (const line of read(f).split("\n")) {
        if (!/andrew/i.test(line)) continue;
        // 예제 저장소 링크와 자기 블로그 내부 링크는 유지 대상이다 (결정 3)
        if (/github\.com\/umanking|umanking\.github\.io/i.test(line)) continue;
        offenders.push(`${f}: ${line.trim().slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
