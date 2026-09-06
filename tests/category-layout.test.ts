import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { SECTIONS } from "../src/data/taxonomy";

const html = (path: string) => readFileSync(`dist${path}index.html`, "utf8");
const cards = (body: string) => [...body.matchAll(/<article class="journal-card[^>]*>\s*<a href="([^"]+)"/g)].map(match => match[1]);

describe("magazine category archives", () => {
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
    expect(cards(tags)).toHaveLength(2);
    expect(tags).toMatch(/name="robots" content="noindex,\s*follow"/);
    expect(html("/tags/")).not.toContain('비색인');
  });
  it("preserves every section and hub entry URL including empty archives", () => {
    for (const section of SECTIONS) {
      expect(existsSync(`dist/${section.id}/index.html`)).toBe(true);
      for (const hub of section.hubs) expect(existsSync(`dist/${section.id}/${hub.id}/index.html`)).toBe(true);
    }
  });

  it("paginates technology with distinct card sets and self canonicals", () => {
    const first = html("/technology/");
    const second = html("/technology/2/");
    expect(cards(first)).toHaveLength(12);
    expect(cards(second)).toHaveLength(12);
    expect(cards(first).filter(url => cards(second).includes(url))).toEqual([]);
    expect(second).toContain('href="https://umanking.github.io/technology/2/"');
    expect(first).toMatch(/href="\/technology\/2\/"[^>]*rel="next"/);
    expect(second).toMatch(/href="\/technology\/"[^>]*rel="prev"/);
  });

  it("uses image cards and topic links without the redundant right rail", () => {
    const life = html("/life/");
    expect(cards(life).length).toBeGreaterThan(0);
    expect(life).toContain('aria-label="세부 주제"');
    expect(life).toContain('href="/life/health/"');
    expect(life).not.toContain('class="shell__right"');
  });
});
