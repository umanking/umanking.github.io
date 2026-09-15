import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("광고 차단 안내", () => {
  it("광고가 차단되면 글 상세를 접근 가능한 안내 화면으로 잠근다", () => {
    const post = readFileSync("dist/2026/09/02/healthcare-data-connectors/index.html", "utf8");
    const home = readFileSync("dist/index.html", "utf8");
    expect(post).toContain("data-support-gate");
    expect(post).toContain('role="alertdialog"');
    expect(post).toContain('aria-modal="true"');
    expect(post).toContain("data-support-retry");
    expect(post).toContain("support-locked");
    expect(post).toContain("data-ad-loader");
    expect(post).not.toContain("data-adblock-dismiss");
    expect(post).not.toContain("sessionStorage");
    expect(home).not.toContain("data-support-gate");
  });
});
