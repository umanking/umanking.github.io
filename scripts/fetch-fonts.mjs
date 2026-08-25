// Pretendard Variable (dynamic subset) 자체 호스팅용 폰트 다운로드 스크립트.
//
// jsdelivr CDN에서 업스트림 CSS를 가져와 그 안에 정의된 모든 @font-face
// 서브셋 woff2 파일 목록을 파싱한 뒤, public/fonts/pretendard/ 에 내려받고
// CSS의 url(...) 경로를 로컬 경로로 치환해서 저장한다.
//
// 실행: node scripts/fetch-fonts.mjs

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CSS_URL =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "fonts", "pretendard");

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  console.log(`Fetching upstream CSS: ${CSS_URL}`);
  const css = await fetchText(CSS_URL);

  // CSS 안의 각 url(...) 은 "../../../../packages/.../PretendardVariable.subset.<N>.woff2" 형태의
  // 상대경로다. CSS 파일 자체의 위치를 기준으로 절대 URL을 만든다.
  const cssBaseUrl = new URL(CSS_URL);
  const urlRegex = /url\((\.\.[^)]+\.woff2)\)/g;

  const matches = [...css.matchAll(urlRegex)];
  if (matches.length === 0) {
    throw new Error("업스트림 CSS에서 woff2 url()을 하나도 찾지 못했습니다.");
  }
  console.log(`Found ${matches.length} font-face url() references.`);

  await mkdir(OUT_DIR, { recursive: true });

  let rewritten = css;
  let count = 0;
  for (const [fullMatch, relPath] of matches) {
    const absoluteUrl = new URL(relPath, cssBaseUrl).href;
    const filename = relPath.split("/").pop();
    const localPath = join(OUT_DIR, filename);

    process.stdout.write(`  [${++count}/${matches.length}] ${filename} ... `);
    const buf = await fetchBuffer(absoluteUrl);
    if (buf.length === 0) throw new Error(`${filename} downloaded as 0 bytes`);
    await writeFile(localPath, buf);
    console.log(`${buf.length} bytes`);

    const localUrlRef = `/fonts/pretendard/${filename}`;
    rewritten = rewritten.split(fullMatch).join(`url(${localUrlRef})`);
  }

  const cssOutPath = join(OUT_DIR, "pretendard.css");
  await writeFile(cssOutPath, rewritten, "utf-8");
  console.log(`Wrote ${cssOutPath}`);
  console.log(`Done. ${count} woff2 files in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
