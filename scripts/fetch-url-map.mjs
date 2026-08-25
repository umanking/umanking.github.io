// 라이브 사이트맵을 정본으로 삼아 파일명 ↔ URL 매핑을 만든다.
// 파일명에서 URL을 유추하면 UTC 시프트(3건)와 대소문자(1건) 때문에 틀린다.
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";

const SITE = "https://umanking.github.io";
const POSTS_DIR = "_posts";
const DATE_TOLERANCE_MS = 24 * 60 * 60 * 1000; // ±1일: UTC 빌드로 인한 날짜 시프트 허용치

const xml = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text());
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace(SITE, ""))
  .filter((u) => /^\/\d{4}\/\d{2}\/\d{2}\//.test(u));

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

if (urls.length !== files.length) {
  throw new Error(`사이트맵 ${urls.length}건 vs 파일 ${files.length}건 — 불일치`);
}

// URL의 마지막 세그먼트(슬러그)로 매칭한다. 날짜는 UTC 시프트 때문에 신뢰할 수 없다.
// 슬러그가 겹치는 경우(예: spring-boot-mongodb)가 있으므로 슬러그 → URL 후보 배열로 모은다.
const bySlug = new Map();
for (const u of urls) {
  const slug = u.replace(/\/$/, "").split("/").pop().toLowerCase();
  if (!bySlug.has(slug)) bySlug.set(slug, []);
  bySlug.get(slug).push(u);
}

const map = files
  .map((file) => {
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
    const filenameDate = file.slice(0, 10); // YYYY-MM-DD
    const candidates = bySlug.get(slug.toLowerCase()) ?? [];

    let url;
    if (candidates.length === 1) {
      url = candidates[0];
    } else {
      // 후보가 여럿(슬러그 중복)이면 파일명 날짜와 ±1일 이내인 후보로 좁힌다.
      const filenameTime = new Date(`${filenameDate}T00:00:00Z`).getTime();
      const matched = candidates.filter((u) => {
        const [, y, m, d] = u.match(/^\/(\d{4})\/(\d{2})\/(\d{2})\//);
        const urlTime = new Date(`${y}-${m}-${d}T00:00:00Z`).getTime();
        return Math.abs(urlTime - filenameTime) <= DATE_TOLERANCE_MS;
      });
      if (matched.length !== 1) {
        throw new Error(
          `슬러그 중복 해소 실패: ${file} — 후보 ${JSON.stringify(candidates)}`,
        );
      }
      url = matched[0];
    }

    if (!url) throw new Error(`URL을 찾을 수 없음: ${file}`);
    return { file, url };
  })
  .sort((a, b) => a.file.localeCompare(b.file));

mkdirSync("src/data", { recursive: true });
writeFileSync("src/data/url-map.json", JSON.stringify(map, null, 2) + "\n");
console.log(`url-map.json 생성: ${map.length}건`);
