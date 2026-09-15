import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("홈 기술 목록", () => {
  it("장식 카드 없이 최신 글을 조밀한 목록으로 제공한다", () => {
    const home = readFileSync("dist/index.html", "utf8");
    const item = readFileSync("src/components/CurationItem.astro", "utf8");
    expect(home).toContain("전체 큐레이션");
    expect(home.match(/class="curation-item"/g)).toHaveLength(3);
    expect(home).not.toContain("journal-card");
    expect(home).not.toContain("manifesto");
    expect(home).toContain('href="/2026/09/15/kubernetes-cbt-beta/"');
    expect(item).toContain('<h2><a href={post.data.permalink}>');
    expect(item).not.toContain("curation-item__why");
    expect(item).not.toContain("DEEP DIVE");
  });
});
