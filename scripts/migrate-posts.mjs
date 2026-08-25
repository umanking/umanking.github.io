// _posts/*.md → src/content/posts/*.md
// 스펙 §8의 일괄 처리를 수행한다. 분류 필드는 classify-posts.mjs가 채운다.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";

// 2019년 글 8편에 `image:` 키가 중복돼 있다. js-yaml 기본값은 여기서 예외를 던지므로
// json:true로 "마지막 값 우선" 동작을 쓴다. 두 값이 같아서 손실은 없다.
const MATTER_OPTS = { engines: { yaml: (str) => yaml.load(str, { json: true }) } };

const SRC = "_posts";
const OUT = "src/content/posts";
const urlMap = new Map(
  JSON.parse(readFileSync("src/data/url-map.json", "utf8")).map((e) => [e.file, e.url]),
);

mkdirSync(OUT, { recursive: true });

/** 문자열을 영숫자/한글만 남기고 소문자로 정규화한다 */
function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
}

/** 두 정규화 문자열의 최장 공통 부분문자열(연속) 길이 */
function longestCommonSubstringLen(a, b) {
  if (!a || !b) return 0;
  let prevRow = new Array(b.length + 1).fill(0);
  let max = 0;
  for (let i = 1; i <= a.length; i++) {
    const curRow = new Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        curRow[j] = prevRow[j - 1] + 1;
        if (curRow[j] > max) max = curRow[j];
      }
    }
    prevRow = curRow;
  }
  return max;
}

/** h1이 title과 사실상 같은 글인지 판단한다 (완전 포함 + 느슨한 부분일치) */
function isTitleDuplicate(h1, title) {
  const nH = norm(h1);
  const nT = norm(title);
  if (!nH || !nT) return false;
  if (nH === nT || nT.includes(nH) || nH.includes(nT)) return true;
  const lcs = longestCommonSubstringLen(nH, nT);
  const ratio = lcs / Math.min(nH.length, nT.length);
  return lcs >= 4 && ratio >= 0.3;
}

/**
 * 본문 전체에서 펜스(코드블록) 밖에 있는 h1을 처리한다 (D4).
 * title과 사실상 같으면 그 줄을 제거하고, 아니면 h2로 낮춰서 레이아웃의
 * <h1>{title}</h1>과 중복되는 h1이 본문에 남지 않도록 한다.
 */
function normalizeBodyHeadings(body, title) {
  const lines = body.split("\n");
  const fenceRe = /^\s{0,3}(`{3,}|~{3,})/;
  let fence = null; // 현재 열려 있는 펜스 문자('`' 또는 '~'), 없으면 null
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fm = line.match(fenceRe);
    if (fm) {
      const ch = fm[1][0];
      if (fence === ch) fence = null;
      else if (!fence) fence = ch;
      continue;
    }
    if (fence) continue;

    if (/^#\s+/.test(line)) {
      const h1 = line.replace(/^#\s+/, "").trim();
      if (isTitleDuplicate(h1, title)) {
        lines.splice(i, 1);
        // 제거로 생긴 빈 줄 중복만 정리하고, 다른 곳의 의도된 공백은 건드리지 않는다.
        if ((lines[i - 1] ?? "").trim() === "" && (lines[i] ?? "").trim() === "") {
          lines.splice(i, 1);
        }
        i -= 1;
        changed = true;
      } else {
        lines[i] = `#${line}`;
        changed = true;
      }
    }
  }

  // 변경이 없으면 원본 body를 그대로 반환한다 (다른 144편의 본문에 영향 없음).
  if (!changed) return body;
  return lines.join("\n").replace(/^\n+/, "");
}

/** 본문에서 description 초안을 만든다. 상위 글은 이후 수기로 교체한다 (D5) */
function draftDescription(body, title) {
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+.*$/gm, " ")
    .replace(/[*_>`|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let d = text.slice(0, 140).trim();
  const lastPeriod = d.lastIndexOf(".");
  if (lastPeriod > 40) d = d.slice(0, lastPeriod + 1);

  if (d.length < 20) d = `${title}에 대해 정리합니다. 실무에서 자주 쓰는 예제와 주의할 점을 함께 다룹니다.`;
  return d.slice(0, 150);
}

/** date를 +09:00이 명시된 ISO 문자열로 정규화한다 */
function normalizeDate(raw, file) {
  const fallback = file.slice(0, 10);
  if (!raw) return `${fallback}T00:00:00+09:00`;
  const s = String(raw).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T]?(\d{2}:\d{2}(?::\d{2})?)?/);
  const day = m?.[1] ?? fallback;
  const time = m?.[2] ?? "00:00";
  const withSec = time.length === 5 ? `${time}:00` : time;
  return `${day}T${withSec}+09:00`;
}

let converted = 0;
for (const file of readdirSync(SRC).filter((f) => f.endsWith(".md"))) {
  const raw = readFileSync(join(SRC, file), "utf8");
  const { data, content } = matter(raw, MATTER_OPTS);

  const permalink = urlMap.get(file);
  if (!permalink) throw new Error(`url-map에 없음: ${file}`);

  const title = String(data.title ?? "").trim();
  if (!title) throw new Error(`title 없음: ${file}`);

  const body = normalizeBodyHeadings(content, title);

  // categories를 tags로 합치고 중복 제거 (스펙 §8)
  const tags = [
    ...new Set(
      [...(data.tags ?? []), ...(data.categories ?? [])]
        .flat()
        .map((t) => String(t).trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

  // 기존 description이 스키마 범위(20~150자)를 벗어나면 신뢰하지 않고 본문에서 새로 뽑는다.
  const rawDescription = data.description ? String(data.description).trim() : "";
  const description =
    rawDescription.length >= 20 && rawDescription.length <= 150
      ? rawDescription
      : draftDescription(body, title);

  const front = {
    title,
    description,
    date: normalizeDate(data.date, file),
    permalink,
    // Task 4가 덮어쓴다
    section: "backend",
    hub: "spring",
    type: "reference",
    level: "중급",
    tags,
    // MATTER_OPTS의 json:true가 중복 image 키를 하나로 접어준다 (스펙 §8)
    ...(data.image ? { image: String(data.image) } : {}),
  };

  writeFileSync(join(OUT, file), matter.stringify(body, front));
  converted++;
}

console.log(`변환 완료: ${converted}편`);
