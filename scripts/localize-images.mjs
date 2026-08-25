// 외부 이미지를 public/images/posts/로 내려받고 본문·프론트매터 경로를 치환한다.
// 실패는 치명적이지 않다. 원본 URL을 그대로 두고 리포트에 남긴다.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { createHash } from "node:crypto";

const DIR = "src/content/posts";
const OUT = "public/images/posts";
mkdirSync(OUT, { recursive: true });

// 탐욕적(greedy) 매칭: 위키미디어 thumb URL처럼 경로 중간에 확장자 패턴이
// 끼어 있는 경우(`.../Foo.svg/240px-Foo.svg.png`) 비탐욕 매칭은 중간 `.svg`에서
// 잘려 잘못된 URL을 만든다. 탐욕 매칭은 역추적으로 실제 마지막 확장자까지 잡는다.
// `[`, `]`, `(`도 제외해야 한다 — `![alt](url)` 구문에서 alt에 URL 형태 문자열이 오면
// `](`를 건너뛰어 alt의 URL과 실제 url을 하나로 합쳐 잘못 매칭하는 것을 막는다.
const IMG_RE = /https?:\/\/[^\s")'<>[\]]+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s")'<>[\]]*)?/gi;

const cache = new Map();
const failures = [];

// 위키미디어 thumb URL(`/thumb/a/ab/File.ext/NNNpx-File.ext.png`)은 이 환경에서
// 썸네일 렌더러가 일괄 400을 반환한다(원본 파일은 200). 실패 시 원본 경로로 폴백한다.
function wikimediaOriginal(url) {
  const m = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/thumb\/(.+)\/\d+px-[^/]+$/);
  return m ? `${m[1]}/${m[2]}` : null;
}

async function fetchImage(url) {
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) throw new Error(`too small: ${buf.length}B`);
  return buf;
}

async function localize(url) {
  if (cache.has(url)) return cache.get(url);

  const hash = createHash("sha1").update(url).digest("hex").slice(0, 12);

  // 재실행 시 이미 받아둔 파일은 다시 내려받지 않는다(추정 확장자 기준 빠른 경로).
  let guessedExt = extname(new URL(url).pathname).toLowerCase().split("?")[0];
  if (!/^\.(png|jpe?g|gif|webp|svg)$/.test(guessedExt)) guessedExt = ".png";
  const guessedDest = join(OUT, `${hash}${guessedExt}`);
  if (existsSync(guessedDest)) {
    const local = `/images/posts/${hash}${guessedExt}`;
    cache.set(url, local);
    return local;
  }

  try {
    let buf, srcUrl;
    try {
      buf = await fetchImage(url);
      srcUrl = url;
    } catch (err) {
      const fallback = wikimediaOriginal(url);
      if (!fallback) throw err;
      buf = await fetchImage(fallback);
      srcUrl = fallback;
    }

    let ext = extname(new URL(srcUrl).pathname).toLowerCase().split("?")[0];
    if (!/^\.(png|jpe?g|gif|webp|svg)$/.test(ext)) ext = ".png";
    const filename = `${hash}${ext}`;
    const dest = join(OUT, filename);
    const local = `/images/posts/${filename}`;

    if (!existsSync(dest)) writeFileSync(dest, buf);
    cache.set(url, local);
    return local;
  } catch (err) {
    failures.push(`${url}  →  ${err.message}`);
    cache.set(url, url); // 원본 유지
    return url;
  }
}

let touched = 0;
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".md"))) {
  const path = join(DIR, file);
  const original = readFileSync(path, "utf8");

  const urls = [...new Set(original.match(IMG_RE) ?? [])];
  if (urls.length === 0) continue;

  let updated = original;
  for (const url of urls) {
    const local = await localize(url);
    if (local !== url) updated = updated.split(url).join(local);
  }

  if (updated !== original) {
    writeFileSync(path, updated);
    touched++;
  }
}

writeFileSync("image-failures.txt", failures.join("\n") + "\n");
console.log(`이미지 로컬화: ${cache.size}개 처리, ${touched}개 파일 수정`);
console.log(`실패: ${failures.length}건 → image-failures.txt`);
