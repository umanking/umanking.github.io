import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { SECTIONS } from "../src/data/taxonomy";

const html = (path: string) => readFileSync(`dist${path}index.html`, "utf8");
const rows = (body: string) => [...body.matchAll(/<article class="curation-item"[^>]*>[\s\S]*?<h2[^>]*><a href="([^"]+)"/g)].map(match => match[1]);

describe("기술 큐레이션과 기존 아카이브", () => {
  it("uses BRIEFLO identity across page metadata and assets", () => {
    const home = html("/");
    expect(home).toContain('property="og:site_name" content="BRIEFLO"');
    expect(home).toContain('/brieflo-icon.svg');
    expect(home).toContain('/brand/brieflo-og.png');
    expect(home).toContain('브리플로');
    expect(existsSync('dist/brand/brieflo-icon.png')).toBe(true);
    expect(existsSync('dist/brand/brieflo-og.png')).toBe(true);
    expect(html('/about/')).not.toContain('사람의 검토를 거치지 않고');
  });
  it("links article footer tags to existing related-topic archives", () => {
    const post = html("/2026/09/06/vflo-etf-vs-voo/");
    expect(post).toContain('aria-label="이 글의 태그"');
    expect(post).toMatch(/href="\/tags\/VFLO\/"[^>]*rel="tag"/);
    expect(post.indexOf('aria-label="이 글의 태그"')).toBeLessThan(post.indexOf('data-ad-format="fluid"'));
    const tags = html("/tags/VFLO/");
    expect(rows(tags)).toHaveLength(2);
    expect(tags).toMatch(/name="robots" content="noindex,\s*follow"/);
    expect(html("/tags/")).not.toContain('비색인');
  });
  it("preserves every section and hub entry URL including empty archives", () => {
    for (const section of SECTIONS) {
      expect(existsSync(`dist/${section.id}/index.html`)).toBe(true);
      for (const hub of section.hubs) expect(existsSync(`dist/${section.id}/${hub.id}/index.html`)).toBe(true);
    }
  });

  it("기술 큐레이션만 한 목록으로 제공한다", () => {
    const first = html("/technology/");
    expect(rows(first)).toHaveLength(3);
    expect(first).toContain('href="/2026/09/15/dbt-charts-git-ai/"');
    expect(first).not.toContain('aria-label="세부 주제"');
  });

  it("큐레이션 하나에 집중하는 내비게이션을 제공한다", () => {
    const home = html("/");
    expect(home).toContain('>큐레이션</a>');
    expect(home).not.toContain('href="/ai/"');
    expect(home).not.toContain('href="/deep-dive/"');
    expect(home).not.toContain('href="/finance/"');
  });

  it("색인 가능한 기술 랜딩 페이지를 sitemap에 넣는다", () => {
    const sitemap = readFileSync("dist/sitemap.xml", "utf8");
    expect(sitemap).toContain("https://umanking.github.io/technology/");
    expect(sitemap).not.toContain("https://umanking.github.io/deep-dive/");
  });

  it("uses compact list rows and topic links without the redundant right rail", () => {
    const life = html("/life/");
    expect(rows(life).length).toBeGreaterThan(0);
    expect(life).not.toContain('class="journal-card');
    expect(life).toContain('aria-label="세부 주제"');
    expect(life).toContain('href="/life/health/"');
    expect(life).not.toContain('class="shell__right"');
  });
});
