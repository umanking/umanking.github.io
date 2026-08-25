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

/** 본문 첫 번째 h1이 title과 사실상 같으면 제거한다 (D4) */
function stripLeadingH1(body, title) {
  const lines = body.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i < lines.length && /^#\s+/.test(lines[i])) {
    const h1 = lines[i].replace(/^#\s+/, "").trim();
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
    if (norm(h1) === norm(title) || norm(title).includes(norm(h1)) || norm(h1).includes(norm(title))) {
      lines.splice(i, 1);
      return lines.join("\n").replace(/^\n+/, "");
    }
  }
  return body;
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

  const body = stripLeadingH1(content, title);

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
