import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const urlMap: Array<{ file: string; url: string }> = JSON.parse(
  readFileSync("src/data/url-map.json", "utf8"),
);

describe("URL 정본", () => {
  it("146건이어야 한다", () => {
    expect(urlMap).toHaveLength(146);
  });

  it("URL이 중복되지 않아야 한다", () => {
    const urls = urlMap.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("모든 URL이 /YYYY/MM/DD/slug/ 형태여야 한다", () => {
    for (const { url } of urlMap) {
      expect(url).toMatch(/^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/);
    }
  });

  it("UTC 시프트 3건이 하루 앞당겨져 있어야 한다", () => {
    const cases = [
      ["2020-03-10-java-comparable-comparator.md", "/2020/03/09/java-comparable-comparator/"],
      ["2020-05-13-spring-sentry.md", "/2020/05/12/spring-sentry/"],
      ["2021-07-03-mac-application-keybinding.md", "/2021/07/02/mac-application-keybinding/"],
    ];
    for (const [file, url] of cases) {
      expect(urlMap.find((e) => e.file === file)?.url).toBe(url);
    }
  });

  it("대소문자가 보존돼야 한다", () => {
    expect(
      urlMap.find((e) => e.file === "2019-07-25-spring-handlerMethodArgumentResolver.md")?.url,
    ).toBe("/2019/07/25/spring-handlerMethodArgumentResolver/");
  });

  it("슬러그가 중복되는 두 글(spring-boot-mongodb)이 서로 다른 URL로 매핑돼야 한다", () => {
    expect(
      urlMap.find((e) => e.file === "2021-08-18-spring-boot-mongodb.md")?.url,
    ).toBe("/2021/08/18/spring-boot-mongodb/");
    expect(
      urlMap.find((e) => e.file === "2023-08-04-spring-boot-mongodb.md")?.url,
    ).toBe("/2023/08/04/spring-boot-mongodb/");
  });
});

// 빌드 산출물이 있을 때만 동작하는 최종 게이트.
// Task 5 이후 `npm run build`를 돌린 뒤 통과해야 한다.
describe.runIf(existsSync("dist"))("빌드 산출물 URL 동일성", () => {
  it("정본 URL 전부가 dist에 index.html로 존재해야 한다", () => {
    const missing = urlMap
      .map((e) => e.url)
      .filter((url) => !existsSync(join("dist", url, "index.html")));
    expect(missing).toEqual([]);
  });

  it("고정 경로가 존재해야 한다", () => {
    for (const p of ["ads.txt", "robots.txt", "sitemap.xml", "feed.xml", "rss2.xml", "404.html"]) {
      expect(existsSync(join("dist", p)), `dist/${p} 없음`).toBe(true);
    }
  });
});
