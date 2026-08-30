import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeMermaid from "rehype-mermaid";
import { visit } from "unist-util-visit";
import rehypeCodeBlock from "./plugins/rehype-code-block.mjs";

// mermaid가 만드는 <svg id="mermaid-N" width="100%" viewBox="0 0 W H">를
// <div class="mermaid-diagram">로 감싼다. 이 div는 overflow-x:auto라 다이어그램이
// 본문 폭보다 넓어도 그 안에서만 가로 스크롤되고 페이지 본문은 스크롤되지 않는다
// (global.css에서 svg 자체의 width:100% 확대를 막고 viewBox 기반 원래 크기로
// 고정 — 실측: 확대를 막지 않으면 3노드짜리 작은 다이어그램도 본문 폭까지
// 늘어난다. 251x296px로 그려진 것이 604x710px로 부풀려지는 것을 빌드 결과로 확인).
function rehypeMermaidWrap() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "svg" || !parent || index === null) return;
      const id = node.properties?.id;
      if (typeof id !== "string" || !id.startsWith("mermaid-")) return;

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["mermaid-diagram"] },
        children: [node],
      };
    });
  };
}

export default defineConfig({
  site: "https://umanking.github.io",
  trailingSlash: "always",
  build: { format: "directory" },
  // @astrojs/sitemap은 쓰지 않는다. 이 플러그인은 항상 `<filenameBase>-index.xml`을
  // 만들어 기존 경로 /sitemap.xml 을 재현할 수 없고, 스펙 5.7이 요구하는
  // "lastmod = git 커밋 시각"도 지원하지 않는다. Task 12에서 직접 구현한다.
  integrations: [mdx()],
  markdown: {
    shikiConfig: { themes: { light: "github-light", dark: "github-dark-dimmed" }, wrap: true },
    // Shiki는 사용자 rehypePlugins보다 먼저 실행돼 mermaid 코드펜스를
    // 일반 <pre class="astro-code">로 하이라이트해버린다(실측: rehype-mermaid가
    // <code class="language-mermaid">를 못 찾고 통과시킴). excludeLangs로
    // mermaid만 Shiki 하이라이팅에서 빼서 rehype-mermaid가 원본 구조를 보게 한다.
    syntaxHighlight: { type: "shiki", excludeLangs: ["mermaid"] },
    // mermaid가 먼저 코드펜스를 SVG로 바꾼 뒤, 남은 일반 코드펜스만
    // rehypeCodeBlock이 codeblock 박스로 감싼다.
    rehypePlugins: [
      [rehypeMermaid, { strategy: "inline-svg" }],
      rehypeMermaidWrap,
      rehypeCodeBlock,
    ],
  },
});
