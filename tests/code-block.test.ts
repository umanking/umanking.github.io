import { describe, it, expect } from "vitest";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import rehypeCodeBlock from "../plugins/rehype-code-block.mjs";

const run = (html: string) =>
  unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeCodeBlock)
    .use(rehypeStringify)
    .processSync(html)
    .toString();

describe("코드블록 rehype 플러그인", () => {
  it("pre를 figure.codeblock으로 감싼다", () => {
    const out = run('<pre class="astro-code" data-language="java"><code>x</code></pre>');
    expect(out).toContain('class="codeblock"');
    expect(out).toContain("<figure");
  });

  it("언어 라벨을 헤더에 넣는다", () => {
    const out = run('<pre class="astro-code" data-language="java"><code>x</code></pre>');
    expect(out).toContain("java");
  });

  it("복사 버튼을 넣는다", () => {
    const out = run('<pre class="astro-code" data-language="java"><code>x</code></pre>');
    expect(out).toContain("data-copy");
    expect(out).toContain("<button");
  });

  it("data-language가 없어도 깨지지 않는다", () => {
    const out = run("<pre><code>x</code></pre>");
    expect(out).toContain('class="codeblock"');
  });

  it("인라인 code는 감싸지 않는다", () => {
    const out = run("<p>이것은 <code>inline</code> 입니다</p>");
    expect(out).not.toContain("codeblock");
  });

  it("이미 감싼 pre를 두 번 감싸지 않는다", () => {
    const once = run('<pre data-language="js"><code>x</code></pre>');
    const twice = run(once);
    expect(twice.match(/class="codeblock"/g)?.length).toBe(1);
  });
});
