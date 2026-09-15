import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("홈 전체 글 목록", () => {
  it("기존 글과 새 큐레이션을 조밀한 목록으로 함께 제공한다", () => {
    const home = readFileSync("dist/index.html", "utf8");
    const item = readFileSync("src/components/CurationItem.astro", "utf8");
    expect(home).toContain("최신 글");
    expect(home.match(/class="curation-item"/g)).toHaveLength(20);
    expect(home).not.toContain("journal-card");
    expect(home).not.toContain("manifesto");
    expect(home).toContain('href="/2026/09/15/kubernetes-cbt-beta/"');
    expect(home).toContain('href="https://kubernetes.io/blog/2026/09/14/csi-changed-block-tracking-beta/"');
    expect(home).toContain('href="/2026/09/15/retirement-age-reemployment-income-risk/"');
    expect(item).toContain("const titleUrl = source?.sourceUrl ?? post.data.permalink");
    expect(item).toContain('<p class="curation-item__summary"><a href={post.data.permalink}>');
    expect(item).not.toContain("curation-item__why");
    expect(item).not.toContain("DEEP DIVE");
  });
});
