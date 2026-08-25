// 제목 + 태그 + 본문 앞부분을 근거로 section/hub/type/level을 추정한다.
// 자동 분류는 초안이다. 저신뢰 항목은 리포트로 뽑아 수동 검수한다.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const DIR = "src/content/posts";

// taxonomy.ts를 직접 import한다. 정규식 파싱은 포맷 변경에 취약하다.
// Node 22의 타입 스트리핑을 쓰므로 실행 시 --experimental-strip-types가 필요하다.
const { SECTIONS } = await import("../src/data/taxonomy.ts");
if (SECTIONS.length !== 7) throw new Error(`섹션 로드 실패: ${SECTIONS.length}개`);

/** 유형 추정 — 제목의 어미와 본문 특징으로 판정 */
function guessType(title, body) {
  const t = title.toLowerCase();
  if (/이슈|에러|error|버그|문제|안될|깨짐|실패|주의사항|주의할/.test(title)) return "troubleshooting";
  if (/원리|내부 동작|살펴보|고찰|이란\??$|무엇인가|차이|history|역사/.test(title)) return "deepdive";
  if (/설정|설치|만들기|적용하기|연동|시작하는|시작하기|구축|사용해|하는 방법|예제|실습/.test(title)) return "tutorial";
  if (/사용법|사용 방법|사용방법|정리|옵션|명령어|api|메서드/.test(t)) return "reference";
  return body.includes("```") ? "reference" : "deepdive";
}

/** 난이도 추정 — 본문 길이와 키워드 */
function guessLevel(title, body) {
  if (/기초|입문|시작하는|시작하기|간단한|이란\??$|무엇인가/.test(title)) return "입문";
  if (/최적화|성능|내부 동작|원리|주의사항|고급|심화|튜닝/.test(title)) return "심화";
  return body.length > 6000 ? "심화" : "중급";
}

// 부분문자열 매칭은 오탐을 대량 생산한다. 실측: `ts`는 implements/comments/Tests에
// 걸려 146편 중 77편에, `js`는 json 때문에 49편에 매칭된다(실제 JS 글은 27편).
// ASCII 키워드는 단어 경계를 강제하고, 한글 키워드는 경계 개념이 다르므로 includes를 쓴다.
const matcherCache = new Map();
function matcher(kw) {
  if (matcherCache.has(kw)) return matcherCache.get(kw);
  const k = kw.toLowerCase();
  let fn;
  if (/^[a-z0-9][a-z0-9.\-+ ]*$/.test(k)) {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    fn = (text) => re.test(text);
  } else {
    fn = (text) => text.includes(k);
  }
  matcherCache.set(kw, fn);
  return fn;
}

function scoreHub(hub, haystack) {
  let score = 0;
  for (const kw of hub.keywords) {
    const hit = matcher(kw);
    // 제목·태그 일치에 큰 가중치를 준다. 본문은 보조 신호일 뿐이다.
    if (hit(haystack.title)) score += 10;
    if (haystack.tags.some((t) => hit(t))) score += 8;
    if (hit(haystack.body)) score += 1;
  }
  return score;
}

const report = [];
let changed = 0;

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".md"))) {
  const path = join(DIR, file);
  const { data, content } = matter(readFileSync(path, "utf8"));

  const haystack = {
    title: String(data.title).toLowerCase(),
    tags: (data.tags ?? []).map((t) => String(t).toLowerCase()),
    body: content.slice(0, 4000).toLowerCase(),
  };

  let best = { section: null, hub: null, score: 0 };
  for (const sec of SECTIONS) {
    for (const hub of sec.hubs) {
      const score = scoreHub(hub, haystack);
      if (score > best.score) best = { section: sec.id, hub: hub.id, score };
    }
  }

  if (!best.section) {
    best = { section: "infra", hub: "tools", score: 0 };
  }

  data.section = best.section;
  data.hub = best.hub;
  data.type = guessType(String(data.title), content);
  data.level = guessLevel(String(data.title), content);

  // 허브 키워드를 태그에 보강한다 (D12)
  const hubDef = SECTIONS.find((s) => s.id === best.section).hubs.find((h) => h.id === best.hub);
  const merged = new Set([...(data.tags ?? []).map((t) => String(t).toLowerCase())]);
  for (const kw of hubDef.keywords) {
    if (!kw.includes(" ") && matcher(kw)(haystack.title)) merged.add(kw.toLowerCase());
  }
  data.tags = [...merged].sort();

  writeFileSync(path, matter.stringify(content, data));
  changed++;

  if (best.score < 10) {
    report.push(`${String(best.score).padStart(3)}  ${best.section}/${best.hub}  ${file}  — ${data.title}`);
  }
}

writeFileSync("classification-report.txt", report.join("\n") + "\n");
console.log(`분류 완료: ${changed}편`);
console.log(`저신뢰(수동 검수 필요): ${report.length}편 → classification-report.txt`);
