import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";

// 브리프는 `__mermaid-smoke`를 지정했지만 Astro는 밑줄로 시작하는 src/pages
// 항목을 라우팅에서 제외한다(공식 규칙: "Any files/folders starting with
// underscore are ignored"). 빌드에서 실제로 확인한 뒤 밑줄 없는 경로로 바꿨다.
const FIXTURE = "dist/mermaid-smoke/index.html";

describe.runIf(existsSync("dist"))("mermaid 빌드 타임 렌더링", () => {
  it("mermaid 코드펜스가 인라인 SVG로 렌더된다", () => {
    const html = readFileSync(FIXTURE, "utf8");
    expect(html).toContain("<svg");
    // 코드펜스가 그대로 남아 있으면 렌더에 실패한 것이다
    expect(html).not.toContain("class=\"language-mermaid\"");
  });

  it("클라이언트에서 mermaid를 로드하지 않는다", () => {
    const html = readFileSync(FIXTURE, "utf8");
    expect(html).not.toMatch(/<script[^>]*src=[^>]*mermaid/i);
  });
});
