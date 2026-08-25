// noindex 글(회고 등)은 URL 불변성 때문에 여전히 dist에 HTML로 존재한다.
// Pagefind는 파일 시스템을 스캔해 인덱싱하므로 소스에 noindex 플래그가 있어도
// 알아서 걸러지지 않는다. astro build 직후, pagefind 실행 직전에 해당 페이지의
// <main> 루트에 data-pagefind-ignore를 심어 인덱스에서 제외한다.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const POSTS_DIR = "src/content/posts";
const DIST_DIR = process.env.PAGEFIND_DIST_DIR || "dist";
const MAIN_TAG = '<main id="main" class="shell__main">';
const MAIN_TAG_IGNORED = '<main id="main" class="shell__main" data-pagefind-ignore>';

const noindexPermalinks = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
  .map((f) => matter(readFileSync(join(POSTS_DIR, f), "utf8")).data)
  .filter((data) => data.noindex === true)
  .map((data) => data.permalink);

if (noindexPermalinks.length === 0) {
  throw new Error("noindex 글을 찾지 못했다. src/content/posts 프론트매터를 확인하라.");
}

for (const permalink of noindexPermalinks) {
  const htmlPath = join(DIST_DIR, permalink, "index.html");
  if (!existsSync(htmlPath)) {
    throw new Error(`noindex 글의 dist HTML이 없다: ${htmlPath}`);
  }
  const html = readFileSync(htmlPath, "utf8");
  if (!html.includes(MAIN_TAG)) {
    throw new Error(`<main> 태그 형식이 예상과 다르다: ${htmlPath}`);
  }
  writeFileSync(htmlPath, html.replace(MAIN_TAG, MAIN_TAG_IGNORED));
}

console.log(`pagefind-ignore-noindex: ${noindexPermalinks.length}개 noindex 페이지에 data-pagefind-ignore 적용`);
