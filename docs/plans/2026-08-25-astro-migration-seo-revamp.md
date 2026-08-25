# Astro 이전 및 SEO 전면 개편 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jekyll 3.9.3 블로그를 Astro 7로 이전하면서 146개 URL을 하나도 바꾸지 않고, 7개 섹션 2단 IA·SEO 레이어·애드센스를 갖춘 기술 매체로 재구축한다.

**Architecture:** 기존 `_posts/*.md`를 `src/content/posts/`로 옮기고 프론트매터를 정규화한다. **URL은 파일명에서 유추하지 않고 라이브 사이트맵을 정본으로 삼아 명시적 `permalink` 필드로 고정**한다(§Global Constraints의 URL 규칙 참조). 라우팅은 `src/pages/[...permalink].astro` 단일 라우트가 담당하고, URL 동일성 테스트가 빌드 게이트 역할을 한다. 분류는 `section`(7개 고정) → `hub`(자유 확장) 2단이며, 허브 노출은 글 수에 연동해 빌드 타임에 자동 결정된다.

**Tech Stack:** Astro 7.2.6, TypeScript, Content Collections, Shiki, `@astrojs/rss` 4.0.19, `@astrojs/mdx` 7.0.8, Pagefind 1.5.2, satori 0.33.4, Vitest, GitHub Actions

**Spec:** `docs/specs/2026-08-25-blog-seo-revamp-design.md`

**범위:** 스펙의 Phase 0~4. Phase 5(위클리 다이제스트 파이프라인)와 Phase 6(상위 글 리라이팅)은 별도 계획으로 분리한다 — 각각 독립 서브시스템이고, Phase 6은 GSC 데이터 확보가 선행되어야 한다.

---

## Global Constraints

모든 태스크의 요구사항에 아래가 암묵적으로 포함된다.

**URL 불변 (최우선)**
- 146개 기존 URL 중 **단 하나도 바뀌면 안 된다.** 정본은 `https://umanking.github.io/sitemap.xml` (실측 146건).
- **파일명에서 URL을 유추하지 말 것.** 실측으로 확인된 두 가지 예외가 있다:
  1. **UTC 시프트** — `_config.yml`에 `timezone`이 없어 GitHub Pages가 UTC로 빌드한다. `date: 2020-03-10 08:18 +0900`은 UTC로 `2020-03-09 23:18`이 되어 URL이 `/2020/03/09/...`가 된다. 해당 글 3편: `2020-03-10-java-comparable-comparator.md`, `2020-05-13-spring-sentry.md`, `2021-07-03-mac-application-keybinding.md`
  2. **대소문자 보존** — `2019-07-25-spring-handlerMethodArgumentResolver.md` → `/2019/07/25/spring-handlerMethodArgumentResolver/` (소문자화되지 않음)
- 유지해야 할 고정 경로: `/feed.xml`, `/rss2.xml`, `/sitemap.xml`, `/ads.txt`, `/robots.txt`, `/404.html`

**개인 식별 정보 비노출**
- 실명, 활동명(`Andrew` 포함), 경력 연차, 소속, 프로필 사진, 개인 이메일(`umanking@gmail.com`), 개인 소셜 프로필을 **빌드 산출물 어디에도 넣지 않는다.**
- JSON-LD는 `Person`이 아니라 `Organization`(`name: CodeNexus`)을 쓴다.
- 연락처는 노출하지 않는다. 피드백 경로는 각 글의 utterances 댓글뿐이다.

**고정 값 (변경 금지)**
- 사이트명: `CodeNexus`
- `site`: `https://umanking.github.io`
- AdSense 클라이언트: `ca-pub-2431823363518805`
- `ads.txt` 내용: `google.com, pub-2431823363518805, DIRECT, f08c47fec0942fa0`
- 네이버 인증: `<meta name="naver-site-verification" content="46d4c4d3f1013de17dee96a763e94028323e4b00" />`
- `<html lang="ko">`

**7개 최상위 섹션 (고정, 순서 포함)**
`architecture` / `backend` / `web` / `data` / `infra` / `ai` / `news`

**허브 오픈 임계**
- 0편: 빌드 산출물 없음, 메뉴 미노출
- 1~2편: 페이지 생성하되 `noindex, follow`, 메뉴 미노출
- 3편 이상: 정식 오픈, 메뉴 노출, `index`

**품질 게이트**
- Lighthouse Performance ≥ 95, SEO ≥ 95
- CLS < 0.1
- 런타임 JS 최소화 — jQuery 금지, 프레임워크 금지, 메뉴/아코디언은 CSS와 `<details>`로 구현
- **클라이언트 JS 정책 (2026-08-25 개정)**: 외부 `<script src=>` **금지** — `dist/` 전체에서 0건이어야 한다.
  인라인 `<script is:inline>`만 허용하고, 전체 합계 **2KB 이하**로 제한한다.
  현재 허용된 인라인 스크립트는 두 개뿐이다: 다크모드 초기화, 코드블록 복사(Task 7.6).
  이 둘 외에 인라인 스크립트를 추가하려면 별도 판단이 필요하다.
  *(개정 사유: 클립보드 접근은 JS 없이 불가능한데 사용자가 코드블록 복사 버튼을 명시적으로 요구했다.)*

---

## File Structure

```
astro.config.mjs                    Astro 설정, 통합, 마크다운/Shiki 설정
package.json
tsconfig.json

scripts/
  fetch-url-map.mjs                 라이브 sitemap → url-map.json 생성 (1회성, 정본 확보)
  migrate-posts.mjs                 _posts/*.md → src/content/posts/*.md 변환
  classify-posts.mjs                section/hub/type/level 자동 분류
  localize-images.mjs               외부 이미지 다운로드 + 프론트매터/본문 경로 치환
  scan-pii.mjs                      개인 식별 정보 스캔

src/
  content.config.ts                 Content Collections 스키마 (프론트매터 검증)
  content/posts/*.md                146편 (마이그레이션 산출물)

  data/
    url-map.json                    파일명 → URL 매핑 정본 (146건)
    taxonomy.ts                     7개 섹션 + 허브 정의, 라벨/설명/순서

  lib/
    taxonomy.ts                     섹션·허브 조회, 오픈 임계 판정
    posts.ts                        포스트 로드·정렬·필터 공통 함수
    seo.ts                          title/description/canonical 생성 규칙
    jsonld.ts                       JSON-LD 빌더

  components/
    BaseHead.astro                  <head> 전체 — 메타, OG, JSON-LD, GA4
    Nav.astro                       전역 메뉴 (CSS 드롭다운 + 모바일 details)
    Footer.astro
    Breadcrumb.astro
    PostCard.astro                  목록 항목 (제목·요약·유형·난이도·날짜·읽기시간)
    TypeBadge.astro                 유형 뱃지
    LevelBadge.astro                난이도 뱃지
    Toc.astro                       스티키 목차
    RelatedPosts.astro
    SeriesNav.astro
    AdSlot.astro                    애드센스 슬롯 (min-height 예약)
    Comments.astro                  utterances

  layouts/
    Base.astro                      html/head/body 골격
    Post.astro                      포스트 페이지
    Hub.astro                       허브/섹션 공통 pillar 레이아웃

  pages/
    index.astro                     홈
    about.astro
    [...permalink].astro            146편 포스트 라우팅 (url-map 기반)
    [section]/index.astro           7개 섹션 페이지
    [section]/[hub]/index.astro     하위 허브 페이지
    tags/index.astro
    tags/[tag].astro
    search.astro
    404.astro
    rss.xml.ts                      /feed.xml, /rss2.xml 대응
    og/[...slug].png.ts             OG 이미지 생성

  styles/
    tokens.css                      색상·타이포·간격 토큰 (라이트/다크)
    global.css

tests/
  url-parity.test.ts                URL 동일성 게이트 (최우선)
  taxonomy.test.ts                  분류·오픈 임계 규칙
  seo.test.ts                       메타 생성 규칙
  pii.test.ts                       개인정보 비노출 검증

public/
  ads.txt  robots.txt  favicon.ico  images/

.github/workflows/deploy.yml        빌드 + 테스트 + Pages 배포
```

---

## Task 1: URL 정본 확보와 동일성 게이트

이 태스크가 전체 계획의 안전장치다. 먼저 만들고, 이후 모든 태스크가 이 테스트를 통과해야 한다.

**Files:**
- Create: `scripts/fetch-url-map.mjs`
- Create: `src/data/url-map.json`
- Create: `tests/url-parity.test.ts`
- Create: `package.json`, `tsconfig.json`

**Interfaces:**
- Produces: `src/data/url-map.json` — `Array<{ file: string, url: string }>`. `file`은 `_posts/` 기준 파일명(확장자 포함), `url`은 선행·후행 슬래시를 포함한 경로(`/2019/04/12/jpa-1-n-mapping/`). 이후 모든 태스크가 이 파일을 URL 정본으로 참조한다.

- [ ] **Step 1: Node 프로젝트 초기화**

```bash
cd /Users/andrew/dev/umanking.github.io
npm init -y
npm pkg set name="codenexus"
npm pkg set type="module"
npm pkg set private=true
npm install --save-dev vitest@^3
npm pkg set scripts.test="vitest run"
```

- [ ] **Step 2: URL 매핑 생성 스크립트 작성**

`scripts/fetch-url-map.mjs`:

```js
// 라이브 사이트맵을 정본으로 삼아 파일명 ↔ URL 매핑을 만든다.
// 파일명에서 URL을 유추하면 UTC 시프트(3건)와 대소문자(1건) 때문에 틀린다.
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";

const SITE = "https://umanking.github.io";
const POSTS_DIR = "_posts";

const xml = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text());
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace(SITE, ""))
  .filter((u) => /^\/\d{4}\/\d{2}\/\d{2}\//.test(u));

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

if (urls.length !== files.length) {
  throw new Error(`사이트맵 ${urls.length}건 vs 파일 ${files.length}건 — 불일치`);
}

// URL의 마지막 세그먼트(슬러그)로 매칭한다. 날짜는 UTC 시프트 때문에 신뢰할 수 없다.
const bySlug = new Map(
  urls.map((u) => [u.replace(/\/$/, "").split("/").pop().toLowerCase(), u]),
);

const map = files.map((file) => {
  const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  const url = bySlug.get(slug.toLowerCase());
  if (!url) throw new Error(`URL을 찾을 수 없음: ${file}`);
  return { file, url };
}).sort((a, b) => a.file.localeCompare(b.file));

mkdirSync("src/data", { recursive: true });
writeFileSync("src/data/url-map.json", JSON.stringify(map, null, 2) + "\n");
console.log(`url-map.json 생성: ${map.length}건`);
```

- [ ] **Step 3: 스크립트 실행하고 예외 4건이 반영됐는지 확인**

```bash
node scripts/fetch-url-map.mjs
```

기대 출력: `url-map.json 생성: 146건`

아래 4건이 실측한 예외와 일치해야 한다:

```bash
node -e "
const m=require('./src/data/url-map.json');
const check=[
 ['2020-03-10-java-comparable-comparator.md','/2020/03/09/java-comparable-comparator/'],
 ['2020-05-13-spring-sentry.md','/2020/05/12/spring-sentry/'],
 ['2021-07-03-mac-application-keybinding.md','/2021/07/02/mac-application-keybinding/'],
 ['2019-07-25-spring-handlerMethodArgumentResolver.md','/2019/07/25/spring-handlerMethodArgumentResolver/'],
];
for(const [f,u] of check){
  const e=m.find(x=>x.file===f);
  if(!e||e.url!==u) throw new Error('불일치: '+f+' → '+(e&&e.url));
  console.log('OK', f, '→', e.url);
}
console.log('예외 4건 모두 일치');
"
```

기대: 4줄 OK + `예외 4건 모두 일치`

- [ ] **Step 4: URL 동일성 게이트 테스트 작성**

`tests/url-parity.test.ts`:

```ts
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
```

- [ ] **Step 5: 테스트 실행**

```bash
npm test
```

기대: `URL 정본` 5개 통과. `빌드 산출물 URL 동일성`은 `dist`가 없으므로 skip.

- [ ] **Step 6: 커밋**

```bash
git add package.json package-lock.json scripts/fetch-url-map.mjs src/data/url-map.json tests/url-parity.test.ts
git commit -m "feat: URL 정본 확보 및 동일성 게이트 테스트 추가

라이브 sitemap 146건을 정본으로 고정.
파일명 유추로는 재현 불가능한 예외 4건(UTC 시프트 3, 대소문자 1)을 테스트로 박제."
```

---

## Task 2: Astro 스캐폴드와 Content Collections 스키마

**Files:**
- Create: `astro.config.mjs`, `tsconfig.json`
- Create: `src/content.config.ts`
- Create: `src/data/taxonomy.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `SECTIONS: readonly Section[]` — 7개 섹션 정의. `Section = { id, label, description, hubs: Hub[] }`
  - `Hub = { id, label, description, keywords: string[] }`
  - `postSchema` — Content Collection `posts`의 zod 스키마. 필드: `title:string`, `description:string(20~150)`, `date:Date`, `permalink:string`, `section:SectionId`, `hub:string`, `type:'tutorial'|'reference'|'troubleshooting'|'deepdive'|'news'`, `level:'입문'|'중급'|'심화'`, `tags:string[]`, `image?:string`, `noindex?:boolean`, `series?:{name:string,order:number}`

- [ ] **Step 1: Astro와 의존성 설치**

```bash
npm install astro@^7.2.6
npm install @astrojs/rss@^4.0.19 @astrojs/mdx@^7.0.8
npm install --save-dev pagefind@^1.5.2
npm pkg set scripts.dev="astro dev"
npm pkg set scripts.build="astro build && pagefind --site dist"
npm pkg set scripts.preview="astro preview"
```

- [ ] **Step 2: `.gitignore`에 Astro 산출물 추가**

기존 `.gitignore` 끝에 추가:

```
## Astro
dist/
.astro/
node_modules/
```

기존 파일에 `package.json`을 무시하는 줄이 있다. 이제 필요하므로 제거한다:

```bash
sed -i '' '/^package.json$/d' .gitignore
```

- [ ] **Step 3: `astro.config.mjs` 작성**

```js
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://umanking.github.io",
  trailingSlash: "always",
  build: { format: "directory" },
  // @astrojs/sitemap은 쓰지 않는다. 이 플러그인은 항상 `<filenameBase>-index.xml`을
  // 만들어 기존 경로 /sitemap.xml 을 재현할 수 없고, 스펙 5.7이 요구하는
  // "lastmod = git 커밋 시각"도 지원하지 않는다. Task 12에서 직접 구현한다.
  integrations: [mdx()],
  markdown: {
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" }, wrap: true },
  },
});
```

`trailingSlash: "always"`와 `format: "directory"`가 `/YYYY/MM/DD/slug/` 형태를 만든다. 둘 중 하나라도 빠지면 URL이 깨진다.

- [ ] **Step 4: `tsconfig.json` 작성**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: 분류 체계 정의**

`src/data/taxonomy.ts`:

```ts
export type SectionId = "architecture" | "backend" | "web" | "data" | "infra" | "ai" | "news";

export interface FaqItem {
  q: string;
  a: string;
}

export interface Hub {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  /** 허브 pillar 페이지의 FAQ. 있으면 FAQPage 스키마로도 출력한다. */
  faq?: FaqItem[];
}

export interface Section {
  id: SectionId;
  label: string;
  description: string;
  hubs: Hub[];
}

export const SECTIONS: readonly Section[] = [
  {
    id: "architecture",
    label: "아키텍처",
    description: "시스템 설계, 분산 처리, 성능과 확장성, 설계 패턴을 다룹니다.",
    hubs: [
      { id: "msa", label: "마이크로서비스", description: "서비스 분리와 통신, 데이터 일관성.", keywords: ["msa", "microservice"] },
      { id: "performance", label: "성능과 확장성", description: "부하 대응, 캐시 전략, 병목 분석.", keywords: ["성능", "확장성", "부하"] },
      { id: "patterns", label: "설계 패턴", description: "설계 패턴과 DDD.", keywords: ["패턴", "ddd"] },
      { id: "system-design", label: "시스템 설계", description: "실제 시스템 설계 사례.", keywords: ["시스템 설계"] },
    ],
  },
  {
    id: "backend",
    label: "백엔드",
    description: "Spring, JPA, Java로 서버를 만들며 마주친 문제와 해결 과정을 정리합니다.",
    hubs: [
      { id: "spring", label: "Spring · Spring Boot", description: "Spring 핵심 개념부터 실무 설정까지.", keywords: ["spring", "spring-boot", "springboot"] },
      { id: "jpa", label: "JPA · Hibernate", description: "연관관계 매핑, 영속성 컨텍스트, 성능 최적화.", keywords: ["jpa", "hibernate", "querydsl", "orm", "영속성"] },
      { id: "java", label: "Java", description: "언어 기능, 동시성, GC.", keywords: ["java"] },
      { id: "testing", label: "테스트", description: "JUnit, AssertJ, 테스트 전략.", keywords: ["junit", "junit5", "assertj", "test"] },
    ],
  },
  {
    id: "web",
    label: "웹",
    description: "JavaScript, TypeScript, Node.js 실무 예제와 자주 쓰는 패턴.",
    hubs: [
      { id: "javascript", label: "JavaScript", description: "배열·문자열·비동기 등 자주 쓰는 문법과 패턴.", keywords: ["javascript", "js", "promise", "lodash"] },
      { id: "typescript", label: "TypeScript", description: "타입 시스템과 유틸리티 타입.", keywords: ["typescript", "ts"] },
      { id: "nodejs", label: "Node.js", description: "Node 런타임, NestJS, 패키지 관리.", keywords: ["nodejs", "node", "nestjs", "npm", "yarn", "socket"] },
    ],
  },
  {
    id: "data",
    label: "데이터",
    description: "MySQL, Redis를 비롯한 데이터 저장소의 동작 원리와 튜닝.",
    hubs: [
      { id: "mysql", label: "MySQL", description: "인덱스, 쿼리 튜닝, 트리거.", keywords: ["mysql", "sql"] },
      { id: "redis", label: "Redis", description: "캐시 전략과 운영 주의점.", keywords: ["redis", "cache"] },
      { id: "modeling", label: "데이터 모델링", description: "스키마 설계와 마이그레이션.", keywords: ["flyway", "migration", "모델링"] },
    ],
  },
  {
    id: "infra",
    label: "인프라",
    description: "Docker, AWS, CI/CD, 관측성, 그리고 개발 환경 세팅.",
    hubs: [
      { id: "docker", label: "Docker", description: "컨테이너 빌드와 로컬 개발 환경.", keywords: ["docker", "dockerfile", "container"] },
      { id: "aws", label: "AWS", description: "서버리스와 클라우드 운영.", keywords: ["aws", "lambda"] },
      { id: "cicd", label: "CI/CD", description: "빌드·배포 파이프라인 자동화.", keywords: ["ci", "cd", "github action", "githubaction"] },
      { id: "observability", label: "관측성", description: "모니터링, 로깅, 에러 트래킹.", keywords: ["prometheus", "grafana", "sentry", "monitoring"] },
      { id: "tools", label: "개발 도구", description: "IntelliJ, Mac, 터미널, Git 생산성.", keywords: ["intellij", "mac", "vim", "shell", "git", "ssh", "iterm", "vscode", "linux", "리눅스"] },
    ],
  },
  {
    id: "ai",
    label: "AI",
    description: "LLM 활용, AI 코딩 도구, RAG와 에이전트 설계.",
    hubs: [
      { id: "llm", label: "LLM", description: "모델 비교와 기본 개념.", keywords: ["llm", "gpt", "claude"] },
      { id: "ai-coding", label: "AI 코딩", description: "AI 코딩 도구와 에이전트 활용.", keywords: ["ai coding", "copilot", "agent"] },
      { id: "rag", label: "RAG", description: "임베딩, 벡터 검색, 검색 증강 생성.", keywords: ["rag", "embedding", "vector"] },
      { id: "engineering", label: "LLM 엔지니어링", description: "LLM 애플리케이션 설계와 운영.", keywords: ["prompt", "llmops"] },
    ],
  },
  {
    id: "news",
    label: "뉴스",
    description: "매주 정리하는 AI · 개발 소식과 주요 릴리스.",
    hubs: [
      { id: "weekly", label: "위클리 다이제스트", description: "주간 AI · 개발 뉴스 큐레이션.", keywords: ["weekly", "digest"] },
      { id: "releases", label: "릴리스", description: "주요 도구·프레임워크 릴리스 정리.", keywords: ["release"] },
    ],
  },
] as const;

export const SECTION_IDS = SECTIONS.map((s) => s.id) as SectionId[];

export const POST_TYPES = ["tutorial", "reference", "troubleshooting", "deepdive", "news"] as const;
export const POST_LEVELS = ["입문", "중급", "심화"] as const;

export type PostType = (typeof POST_TYPES)[number];
export type PostLevel = (typeof POST_LEVELS)[number];

export const TYPE_LABELS: Record<PostType, string> = {
  tutorial: "튜토리얼",
  reference: "레퍼런스",
  troubleshooting: "트러블슈팅",
  deepdive: "딥다이브",
  news: "뉴스",
};

/** 허브가 정식 오픈되는 최소 글 수 */
export const HUB_OPEN_THRESHOLD = 3;
```

- [ ] **Step 6: Content Collections 스키마 작성**

`src/content.config.ts`:

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { POST_TYPES, POST_LEVELS, SECTION_IDS } from "./data/taxonomy";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string().min(1),
    // 검색 스니펫에 그대로 쓰이므로 길이를 강제한다 (스펙 D5)
    description: z.string().min(20).max(150),
    date: z.coerce.date(),
    // URL 정본. 파일명에서 유추하지 않는다 (Global Constraints 참조)
    permalink: z.string().regex(/^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/),
    section: z.enum(SECTION_IDS as [string, ...string[]]),
    hub: z.string().min(1),
    type: z.enum(POST_TYPES),
    level: z.enum(POST_LEVELS),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    noindex: z.boolean().default(false),
    series: z.object({ name: z.string(), order: z.number().int().positive() }).optional(),
  }),
});

export const collections = { posts };
```

- [ ] **Step 7: 분류 체계 테스트 작성**

`tests/taxonomy.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SECTIONS, SECTION_IDS, HUB_OPEN_THRESHOLD } from "../src/data/taxonomy";

describe("분류 체계", () => {
  it("최상위 섹션은 7개이고 순서가 고정돼야 한다", () => {
    expect(SECTION_IDS).toEqual([
      "architecture", "backend", "web", "data", "infra", "ai", "news",
    ]);
  });

  it("허브 id가 섹션 안에서 유일해야 한다", () => {
    for (const s of SECTIONS) {
      const ids = s.hubs.map((h) => h.id);
      expect(new Set(ids).size, `${s.id} 섹션에 중복 허브`).toBe(ids.length);
    }
  });

  it("모든 섹션과 허브가 설명문을 가져야 한다", () => {
    for (const s of SECTIONS) {
      expect(s.description.length, `${s.id} 설명 없음`).toBeGreaterThan(10);
      for (const h of s.hubs) {
        expect(h.description.length, `${s.id}/${h.id} 설명 없음`).toBeGreaterThan(5);
      }
    }
  });

  it("허브 오픈 임계는 3편이다", () => {
    expect(HUB_OPEN_THRESHOLD).toBe(3);
  });
});
```

- [ ] **Step 8: 테스트 실행**

```bash
npm test
```

기대: `URL 정본` 5개 + `분류 체계` 4개 전부 통과.

- [ ] **Step 9: 커밋**

```bash
git add astro.config.mjs tsconfig.json package.json package-lock.json .gitignore src/data/taxonomy.ts src/content.config.ts tests/taxonomy.test.ts
git commit -m "feat: Astro 7 스캐폴드와 7섹션 분류 체계 정의

trailingSlash always + format directory로 기존 URL 형태 유지.
Content Collections 스키마에서 description 20~150자를 강제해 D5를 빌드 타임에 차단."
```

---

## Task 3: 콘텐츠 마이그레이션 스크립트

146편의 프론트매터를 정규화하면서 `src/content/posts/`로 옮긴다. 분류 필드(`section`/`hub`/`type`/`level`)는 Task 4에서 채우므로, 여기서는 임시값을 넣고 Task 4가 덮어쓴다.

**Files:**
- Create: `scripts/migrate-posts.mjs`
- Create: `src/content/posts/*.md` (146개, 스크립트 산출물)

**Interfaces:**
- Consumes: `src/data/url-map.json` (Task 1)
- Produces: `src/content/posts/<원본파일명>` 146개. 프론트매터에 `permalink`가 채워지고 `categories`가 제거되며 본문 선두 h1이 사라진 상태.

- [ ] **Step 1: gray-matter 설치**

```bash
npm install --save-dev gray-matter@^4 js-yaml@^4
```

**중복 키 주의.** 2019년 글 8편의 프론트매터에 `image:` 키가 두 번 들어 있고, js-yaml은 기본 설정에서 중복 키를 만나면 `YAMLException: duplicated mapping key`를 던진다. 실측으로 확인한 대상은 다음 8편이다.

```
2019-04-12-jpa-1-n-mapping.md          2019-04-12-jpa-null.md
2019-04-12-jpa-cascade.md              2019-04-12-jpa-persist-merge.md
2019-04-12-jpa-custom-repository.md    2019-04-12-jpa-projection.md
2019-04-12-jpa-domain-class-converter.md   2019-04-12-jpa-proxy.md
```

`json: true` 옵션을 주면 중복 키를 예외 대신 "마지막 값으로 덮어쓰기"로 처리한다. 두 `image` 값이 동일하므로 결과는 손실 없이 하나로 접힌다. 146편 전부가 이 옵션에서 파싱되는 것을 확인했다.

- [ ] **Step 2: 마이그레이션 스크립트 작성**

`scripts/migrate-posts.mjs`:

```js
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

  const front = {
    title,
    description: data.description ? String(data.description) : draftDescription(body, title),
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
```

- [ ] **Step 3: 스크립트 실행**

```bash
node scripts/migrate-posts.mjs
```

기대 출력: `변환 완료: 146편`

- [ ] **Step 4: 결과 검증**

```bash
echo "파일 수: $(ls src/content/posts/*.md | wc -l)"
echo "permalink 있는 글: $(grep -l '^permalink:' src/content/posts/*.md | wc -l)"
echo "categories 잔존: $(grep -l '^categories:' src/content/posts/*.md | wc -l)"
echo "description 없는 글: $(grep -L '^description:' src/content/posts/*.md | wc -l)"
echo "--- 본문 선두 h1 잔존 확인 ---"
head -12 src/content/posts/2023-08-15-mysql-heatwave.md
echo "--- 중복 image 키 8편이 정상 변환됐는지 ---"
grep -c "^image:" src/content/posts/2019-04-12-jpa-1-n-mapping.md
```

마지막 값은 반드시 `1`이어야 한다. 중복 키가 하나로 접혔다는 뜻이다.

기대: 파일 146 / permalink 146 / categories 0 / description 없는 글 0. 마지막 출력에서 프론트매터 직후 `# Unlocking the Power...` 줄이 사라지고 `## Introduction`부터 시작해야 한다.

- [ ] **Step 5: description 길이가 스키마 범위를 벗어난 글 확인**

```bash
node -e "
const fs=require('fs'),m=require('gray-matter');
// 변환 후 파일에는 중복 키가 없으므로 기본 옵션으로 충분하다
const bad=fs.readdirSync('src/content/posts').filter(f=>f.endsWith('.md')).map(f=>{
  const d=m(fs.readFileSync('src/content/posts/'+f,'utf8')).data;
  return {f,len:(d.description||'').length};
}).filter(x=>x.len<20||x.len>150);
console.log('범위 밖:',bad.length); bad.slice(0,10).forEach(x=>console.log(' ',x.f,x.len));
"
```

기대: `범위 밖: 0`. 0이 아니면 `draftDescription`의 slice 경계를 조정하고 Step 3부터 다시 실행한다.

- [ ] **Step 6: 커밋**

```bash
git add scripts/migrate-posts.mjs src/content/posts package.json package-lock.json
git commit -m "feat: 146편 콘텐츠 마이그레이션

permalink 주입, 본문 선두 h1 제거(D4), categories→tags 통합,
date 타임존 정규화, description 초안 생성(D5)."
```

---

## Task 4: 분류 자동 부여

Task 3이 넣은 임시값을 실제 분류로 덮어쓴다.

**Files:**
- Create: `scripts/classify-posts.mjs`
- Modify: `src/content/posts/*.md` (프론트매터 `section`/`hub`/`type`/`level`/`tags`)

**Interfaces:**
- Consumes: `SECTIONS` (Task 2), `src/content/posts/*.md` (Task 3)
- Produces: 모든 포스트에 유효한 `section`/`hub`/`type`/`level`이 채워진 상태. `classification-report.txt`로 저신뢰 항목 목록 출력.

- [ ] **Step 1: 분류 스크립트 작성**

`scripts/classify-posts.mjs`:

```js
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
```

- [ ] **Step 2: 스크립트 실행**

```bash
node --experimental-strip-types scripts/classify-posts.mjs
```

기대: `분류 완료: 146편` + 저신뢰 건수 출력. 타입 스트리핑 경고가 stderr에 나오는 것은 정상이다.

편의를 위해 npm 스크립트로 등록해 둔다:

```bash
npm pkg set scripts.classify="node --experimental-strip-types scripts/classify-posts.mjs"
```

- [ ] **Step 3: 분류 분포 확인**

```bash
echo "=== 섹션별 ==="; grep -h "^section:" src/content/posts/*.md | sort | uniq -c | sort -rn
echo "=== 허브별 ==="; grep -h "^hub:" src/content/posts/*.md | sort | uniq -c | sort -rn
echo "=== 유형별 ==="; grep -h "^type:" src/content/posts/*.md | sort | uniq -c | sort -rn
echo "=== 난이도별 ==="; grep -h "^level:" src/content/posts/*.md | sort | uniq -c
```

기대 근사치 (스펙 §6.2 기준): `backend` 60~70편, `web` 25~35편, `infra` 25~35편, `data` 12~18편. `architecture`/`ai`/`news`는 0에 가까워야 정상이다.

크게 벗어나면 `taxonomy.ts`의 `keywords`를 조정하고 `npm run classify`로 다시 실행한다.

단어 경계 매칭이 실제로 오탐을 막았는지 확인한다.

```bash
echo "web 섹션으로 분류된 글: $(grep -l '^section: web' src/content/posts/*.md | wc -l)편"
echo "  (실제 JS/TS/Node 관련은 약 30편. 50편을 넘으면 오탐이 남아 있다는 뜻)"
echo "typescript 허브: $(grep -l '^hub: typescript' src/content/posts/*.md | wc -l)편"
echo "  (TypeScript 전용 글은 1편뿐이다. 5편을 넘으면 ts 부분문자열 오탐이다)"
```

- [ ] **Step 4: 저신뢰 항목 수동 검수**

```bash
cat classification-report.txt
```

리포트의 각 줄을 보고 분류가 틀린 글은 해당 파일의 `section`/`hub`를 직접 고친다. 예를 들어 `x86과 ARM: 둘의 차이점`은 자동 분류가 애매하므로 `architecture` / `system-design`으로 옮긴다.

- [ ] **Step 5: 스키마 검증 (Astro가 프론트매터를 받아들이는지)**

```bash
npx astro sync && npx astro check 2>&1 | tail -20
```

기대: Content Collections 타입 생성 성공, zod 스키마 오류 없음. `description` 길이나 `section` enum 위반이 있으면 여기서 파일명과 함께 잡힌다.

- [ ] **Step 6: 리포트 파일 정리 후 커밋**

```bash
rm classification-report.txt
git add scripts/classify-posts.mjs src/content/posts
git commit -m "feat: section/hub/type/level 자동 분류 및 태그 보정

146편에 2단 분류와 유형·난이도를 부여하고 누락 태그를 보강(D12)."
```

---

## Task 5: 포스트 라우팅과 빌드 게이트 통과

이 태스크가 끝나면 146개 URL이 모두 살아 있는 사이트가 로컬에서 뜬다.

**Files:**
- Create: `src/lib/posts.ts`
- Create: `src/layouts/Base.astro`
- Create: `src/pages/[...permalink].astro`
- Create: `src/pages/404.astro`
- Create: `src/styles/tokens.css`, `src/styles/global.css`

**Interfaces:**
- Consumes: `posts` 컬렉션 (Task 2 스키마), `SECTIONS` (Task 2)
- Produces:
  - `getAllPosts(): Promise<Post[]>` — `noindex`가 아닌 글을 날짜 내림차순으로 반환. `Post = CollectionEntry<"posts">`
  - `permalinkToParams(permalink: string): { permalink: string }` — Astro `getStaticPaths`용 파라미터. 앞뒤 슬래시를 제거한 문자열을 돌려준다.
  - `Base.astro` props: `{ title: string; description: string; canonical: string; noindex?: boolean }`

- [ ] **Step 1: 포스트 공통 로더 작성**

`src/lib/posts.ts`:

```ts
import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) => !data.noindex);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPostsByHub(section: string, hub: string): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => p.data.section === section && p.data.hub === hub);
}

export async function getPostsBySection(section: string): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => p.data.section === section);
}

/** permalink("/2019/04/12/foo/") → Astro rest 파라미터("2019/04/12/foo") */
export function permalinkToParam(permalink: string): string {
  return permalink.replace(/^\/|\/$/g, "");
}

/** 한글 기준 대략적인 읽기 시간(분). 분당 500자로 계산한다. */
export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(body.replace(/\s/g, "").length / 500));
}
```

- [ ] **Step 2: 디자인 토큰 작성**

`src/styles/tokens.css`:

```css
:root {
  --bg: #ffffff;
  --bg-subtle: #f7f8fa;
  --fg: #1a1d21;
  --fg-muted: #5b6470;
  --border: #e3e6ea;
  --accent: #2f6feb;
  --accent-soft: #e8f0fe;

  --font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
    "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  --text-body: 17px;
  --leading-body: 1.8;
  --measure: 680px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 40px;
  --space-6: 64px;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0f1216;
    --bg-subtle: #161b22;
    --fg: #e6e9ee;
    --fg-muted: #9aa4b2;
    --border: #262d36;
    --accent: #6ea3ff;
    --accent-soft: #16233a;
  }
}

:root[data-theme="dark"] {
  --bg: #0f1216;
  --bg-subtle: #161b22;
  --fg: #e6e9ee;
  --fg-muted: #9aa4b2;
  --border: #262d36;
  --accent: #6ea3ff;
  --accent-soft: #16233a;
}
```

`src/styles/global.css`:

```css
@import "./tokens.css";

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  line-height: var(--leading-body);
  word-break: keep-all;
  overflow-wrap: anywhere;
}
a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 2px; }
img, video { max-width: 100%; height: auto; }
pre { overflow-x: auto; padding: var(--space-3); border-radius: 8px; }
code { font-family: var(--font-mono); font-size: 0.92em; }
table { display: block; overflow-x: auto; border-collapse: collapse; }
.container { max-width: 1120px; margin: 0 auto; padding: 0 var(--space-3); }
.prose { max-width: var(--measure); }
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: var(--space-3); top: var(--space-3); z-index: 100; }
```

- [ ] **Step 3: 최소 Base 레이아웃 작성**

이 단계에서는 라우팅 검증이 목적이므로 `<head>`를 최소로 만든다. Task 12에서 `BaseHead.astro`로 대체한다.

`src/layouts/Base.astro`:

```astro
---
import "../styles/global.css";

interface Props {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
}
const { title, description, canonical, noindex = false } = Astro.props;
---

<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex, follow" />}
    <meta name="naver-site-verification" content="46d4c4d3f1013de17dee96a763e94028323e4b00" />
  </head>
  <body>
    <a class="skip-link" href="#main">본문으로 건너뛰기</a>
    <main id="main" class="container">
      <slot />
    </main>
  </body>
</html>
```

- [ ] **Step 4: 포스트 라우트 작성**

`src/pages/[...permalink].astro`:

```astro
---
import { render } from "astro:content";
import Base from "../layouts/Base.astro";
import { getAllPosts, permalinkToParam, readingMinutes } from "../lib/posts";

export async function getStaticPaths() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    params: { permalink: permalinkToParam(post.data.permalink) },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
const canonical = new URL(post.data.permalink, Astro.site).href;
const minutes = readingMinutes(post.body ?? "");
---

<Base title={`${post.data.title} | CodeNexus`} description={post.data.description} canonical={canonical}>
  <article class="prose">
    <h1>{post.data.title}</h1>
    <p>
      <time datetime={post.data.date.toISOString()}>
        {post.data.date.toLocaleDateString("ko-KR")}
      </time>
      · 약 {minutes}분
    </p>
    <Content />
  </article>
</Base>
```

- [ ] **Step 5: 404 페이지 작성**

`src/pages/404.astro`:

```astro
---
import Base from "../layouts/Base.astro";
const canonical = new URL("/404.html", Astro.site).href;
---

<Base title="페이지를 찾을 수 없습니다 | CodeNexus" description="요청하신 페이지가 존재하지 않습니다. 홈에서 다른 글을 찾아보세요." canonical={canonical} noindex>
  <h1>404</h1>
  <p>요청하신 페이지가 없습니다.</p>
  <p><a href="/">홈으로 돌아가기</a></p>
</Base>
```

- [ ] **Step 6: 기존 정적 파일을 `public/`으로 이동**

```bash
mkdir -p public
git mv ads.txt public/ads.txt
git mv favicon.ico public/favicon.ico
git mv images public/images
```

`public/robots.txt`를 새로 작성한다 (D9 수정, D10 정책 반영):

```
User-agent: *
Allow: /

Sitemap: https://umanking.github.io/sitemap.xml
```

기존 `robots.txt`는 지운다:

```bash
git rm robots.txt
```

- [ ] **Step 7: 빌드 실행**

```bash
npm run build
```

기대: 빌드 성공, `dist/`에 146개 포스트 디렉터리 생성.

`pagefind`가 아직 설치 검증되지 않아 실패하면 이 단계에서는 `npx astro build`만 실행하고, Task 16에서 pagefind를 붙인다.

- [ ] **Step 8: URL 동일성 게이트 통과 확인**

```bash
npm test
```

기대: `빌드 산출물 URL 동일성` 블록이 이제 실행되고, **`정본 URL 전부가 dist에 index.html로 존재해야 한다`가 통과**해야 한다.

`고정 경로가 존재해야 한다`는 아직 `sitemap.xml`/`feed.xml`/`rss2.xml`이 없어 실패한다. Task 14에서 통과시킨다. 이 시점에서는 첫 번째 테스트만 통과하면 된다.

실패하면 URL이 깨진 것이므로 **다음 태스크로 넘어가지 말고** `astro.config.mjs`의 `trailingSlash`/`format`과 `permalinkToParam`을 점검한다.

- [ ] **Step 9: 로컬 서버로 육안 확인**

```bash
npm run dev
```

브라우저에서 확인:
- `http://localhost:4321/2019/04/12/jpa-1-n-mapping/` — 200, 본문 렌더
- `http://localhost:4321/2020/03/09/java-comparable-comparator/` — UTC 시프트된 URL이 열려야 한다
- `http://localhost:4321/2019/07/25/spring-handlerMethodArgumentResolver/` — 대소문자 보존 URL이 열려야 한다

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "feat: 포스트 라우팅과 URL 동일성 게이트 통과

146편 전부가 기존 URL 그대로 빌드됨을 테스트로 확인.
정적 파일을 public/으로 이동하고 robots.txt를 https로 수정(D9)."
```

---

## Task 6: 허브 오픈 판정과 전역 메뉴

스펙 §6.4의 단계적 오픈 규칙을 빌드 타임에 자동 적용한다. 글을 3편 쓰면 허브가 스스로 열려야 한다. 이 태스크가 **전역 메뉴 부재(D1)**를 해소한다.

**Files:**
- Create: `src/lib/taxonomy.ts`
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/layouts/Base.astro`
- Modify: `tests/taxonomy.test.ts`

**Interfaces:**
- Consumes: `SECTIONS`, `HUB_OPEN_THRESHOLD` (Task 2), `getAllPosts` (Task 5)
- Produces:
  - `type HubState = "closed" | "partial" | "open"` — 각각 0편 / 1~2편 / 3편 이상
  - `hubState(count: number): HubState`
  - `getNavTree(): Promise<NavSection[]>` — `NavSection = { id, label, hubs: Array<{ id, label, count }> }`. `hubs`에는 `open` 상태인 허브만 담긴다.
  - `getHubCounts(): Promise<Map<string, number>>` — 키는 `"section/hub"`

- [ ] **Step 1: 오픈 판정 테스트를 먼저 작성**

`tests/taxonomy.test.ts` 끝에 추가:

```ts
import { hubState } from "../src/lib/taxonomy";

describe("허브 오픈 판정", () => {
  it("0편이면 closed", () => {
    expect(hubState(0)).toBe("closed");
  });

  it("1~2편이면 partial", () => {
    expect(hubState(1)).toBe("partial");
    expect(hubState(2)).toBe("partial");
  });

  it("3편 이상이면 open", () => {
    expect(hubState(3)).toBe("open");
    expect(hubState(30)).toBe("open");
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

```bash
npm test
```

기대: FAIL — `Failed to resolve import "../src/lib/taxonomy"`

- [ ] **Step 3: 최소 구현 작성**

`src/lib/taxonomy.ts`:

```ts
import { SECTIONS, HUB_OPEN_THRESHOLD, type Section, type SectionId } from "../data/taxonomy";
import { getAllPosts } from "./posts";

export type HubState = "closed" | "partial" | "open";

export function hubState(count: number): HubState {
  if (count === 0) return "closed";
  if (count < HUB_OPEN_THRESHOLD) return "partial";
  return "open";
}

export function getSection(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function getHub(sectionId: string, hubId: string) {
  return getSection(sectionId)?.hubs.find((h) => h.id === hubId);
}

/** "section/hub" → 글 수 */
export async function getHubCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const post of await getAllPosts()) {
    const key = `${post.data.section}/${post.data.hub}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export interface NavHub { id: string; label: string; count: number }
export interface NavSection { id: SectionId; label: string; hubs: NavHub[] }

/** 메뉴에 노출할 트리. open 상태 허브만 담는다. */
export async function getNavTree(): Promise<NavSection[]> {
  const counts = await getHubCounts();
  return SECTIONS.map((s) => ({
    id: s.id,
    label: s.label,
    hubs: s.hubs
      .map((h) => ({ id: h.id, label: h.label, count: counts.get(`${s.id}/${h.id}`) ?? 0 }))
      .filter((h) => hubState(h.count) === "open")
      .sort((a, b) => b.count - a.count),
  }));
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```

기대: `허브 오픈 판정` 3개 모두 PASS.

- [ ] **Step 5: 전역 메뉴 컴포넌트 작성**

JS를 쓰지 않는다. 데스크톱은 CSS `:hover`/`:focus-within` 드롭다운, 모바일은 `<details>` 아코디언이라 크롤러가 전부 읽는다.

`src/components/Nav.astro`:

```astro
---
import { getNavTree } from "../lib/taxonomy";
const tree = await getNavTree();
const current = Astro.url.pathname;
---

<header class="nav">
  <div class="container nav__inner">
    <a class="nav__brand" href="/">CodeNexus</a>

    <nav class="nav__desktop" aria-label="주요 메뉴">
      <ul class="nav__list">
        {tree.map((section) => (
          <li class="nav__item">
            <a
              class="nav__link"
              href={`/${section.id}/`}
              aria-current={current.startsWith(`/${section.id}/`) ? "page" : undefined}
            >
              {section.label}
              {section.hubs.length > 0 && <span class="nav__caret" aria-hidden="true">▾</span>}
            </a>
            {section.hubs.length > 0 && (
              <ul class="nav__drop">
                {section.hubs.map((hub) => (
                  <li>
                    <a href={`/${section.id}/${hub.id}/`}>
                      <span>{hub.label}</span>
                      <span class="nav__count">{hub.count}편</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>

    <div class="nav__end">
      <a class="nav__link" href="/search/">검색</a>
      <a class="nav__link" href="/about/">소개</a>
    </div>

    <details class="nav__mobile">
      <summary aria-label="메뉴 열기">메뉴</summary>
      <ul>
        {tree.map((section) => (
          <li>
            <a href={`/${section.id}/`}>{section.label}</a>
            {section.hubs.length > 0 && (
              <ul>
                {section.hubs.map((hub) => (
                  <li><a href={`/${section.id}/${hub.id}/`}>{hub.label} ({hub.count}편)</a></li>
                ))}
              </ul>
            )}
          </li>
        ))}
        <li><a href="/search/">검색</a></li>
        <li><a href="/about/">소개</a></li>
      </ul>
    </details>
  </div>
</header>

<style>
  .nav { border-bottom: 1px solid var(--border); background: var(--bg); position: sticky; top: 0; z-index: 50; }
  .nav__inner { display: flex; align-items: center; gap: var(--space-4); min-height: 60px; }
  .nav__brand { font-weight: 700; font-size: 1.05rem; text-decoration: none; color: var(--fg); }
  .nav__list { display: flex; gap: var(--space-3); list-style: none; margin: 0; padding: 0; }
  .nav__item { position: relative; }
  .nav__link { display: inline-block; padding: 8px 4px; color: var(--fg); text-decoration: none; font-size: 0.95rem; }
  .nav__link[aria-current="page"] { color: var(--accent); font-weight: 600; }
  .nav__caret { font-size: 0.7em; color: var(--fg-muted); }
  .nav__drop {
    position: absolute; left: 0; top: 100%; min-width: 240px;
    background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
    padding: var(--space-2); list-style: none; margin: 0;
    opacity: 0; visibility: hidden; transition: opacity .12s;
  }
  .nav__item:hover .nav__drop, .nav__item:focus-within .nav__drop { opacity: 1; visibility: visible; }
  .nav__drop a { display: flex; justify-content: space-between; gap: var(--space-3); padding: 6px 10px; border-radius: 6px; text-decoration: none; color: var(--fg); font-size: 0.9rem; }
  .nav__drop a:hover { background: var(--bg-subtle); }
  .nav__count { color: var(--fg-muted); font-size: 0.85em; }
  .nav__end { margin-left: auto; display: flex; gap: var(--space-3); }
  .nav__mobile { display: none; }
  @media (max-width: 860px) {
    .nav__desktop, .nav__end { display: none; }
    .nav__mobile { display: block; margin-left: auto; }
    .nav__mobile ul { list-style: none; padding-left: var(--space-3); }
  }
</style>
```

- [ ] **Step 6: 푸터 작성**

`src/components/Footer.astro`:

```astro
---
import { getNavTree } from "../lib/taxonomy";
import { SECTIONS } from "../data/taxonomy";
const tree = await getNavTree();
const year = new Date().getFullYear();
---

<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      {SECTIONS.map((section) => {
        const hubs = tree.find((t) => t.id === section.id)?.hubs ?? [];
        return (
          <div>
            <a class="footer__section" href={`/${section.id}/`}>{section.label}</a>
            <ul>
              {hubs.map((hub) => (
                <li><a href={`/${section.id}/${hub.id}/`}>{hub.label}</a></li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
    <div class="footer__meta">
      <a href="/about/">소개</a>
      <a href="/tags/">태그</a>
      <a href="/feed.xml">RSS</a>
      <span>© {year} CodeNexus</span>
    </div>
  </div>
</footer>

<style>
  .footer { border-top: 1px solid var(--border); margin-top: var(--space-6); padding: var(--space-5) 0; background: var(--bg-subtle); font-size: 0.9rem; }
  .footer__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--space-4); }
  .footer__section { font-weight: 600; color: var(--fg); text-decoration: none; }
  .footer__grid ul { list-style: none; padding: 0; margin: var(--space-2) 0 0; }
  .footer__grid a { color: var(--fg-muted); text-decoration: none; }
  .footer__grid a:hover { color: var(--accent); }
  .footer__meta { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-5); padding-top: var(--space-3); border-top: 1px solid var(--border); color: var(--fg-muted); }
</style>
```

- [ ] **Step 7: Base 레이아웃에 메뉴·푸터 연결**

`src/layouts/Base.astro`의 `<body>` 내용을 교체한다:

```astro
  <body>
    <a class="skip-link" href="#main">본문으로 건너뛰기</a>
    <Nav />
    <main id="main" class="container">
      <slot />
    </main>
    <Footer />
  </body>
```

프론트매터 상단에 import를 추가한다:

```astro
import Nav from "../components/Nav.astro";
import Footer from "../components/Footer.astro";
```

- [ ] **Step 8: 빌드하고 메뉴 확인**

```bash
npm run build && npm test
```

기대: 빌드 성공, URL 동일성 게이트 유지.

```bash
node -e "
const fs=require('fs');
const html=fs.readFileSync('dist/2019/04/12/jpa-1-n-mapping/index.html','utf8');
for(const s of ['아키텍처','백엔드','웹','데이터','인프라','AI','뉴스']){
  if(!html.includes('>'+s)) throw new Error('메뉴 누락: '+s);
}
if(html.includes('/ai/llm/')) throw new Error('0편 허브가 메뉴에 노출됨');
if(!html.includes('/backend/spring/')) throw new Error('오픈 허브가 메뉴에 없음');
console.log('메뉴 검증 통과: 7섹션 노출, 빈 허브 미노출');
"
```

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "feat: 전역 메뉴와 허브 단계적 오픈 규칙 (D1)

글 수 3편을 임계로 허브가 빌드 타임에 자동 오픈된다(스펙 6.4).
CSS 드롭다운 + details 아코디언으로 JS 없이 크롤 가능."
```

---

## Task 7: 섹션·허브 pillar 페이지

**Files:**
- Create: `src/components/PostCard.astro`, `src/components/TypeBadge.astro`, `src/components/LevelBadge.astro`
- Create: `src/layouts/Hub.astro`
- Create: `src/pages/[section]/index.astro`
- Create: `src/pages/[section]/[hub]/index.astro`

**Interfaces:**
- Consumes: `getPostsBySection`, `getPostsByHub`, `readingMinutes` (Task 5), `getHubCounts`, `hubState`, `getSection`, `getHub` (Task 6)
- Produces: `Hub.astro` props — `{ title: string; lead: string; canonical: string; noindex?: boolean; posts: Post[]; children? }`

- [ ] **Step 1: 뱃지 컴포넌트 2개 작성**

`src/components/TypeBadge.astro`:

```astro
---
import { TYPE_LABELS, type PostType } from "../data/taxonomy";
interface Props { type: PostType }
const { type } = Astro.props;
---
<span class={`badge badge--${type}`}>{TYPE_LABELS[type]}</span>

<style>
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 0.75rem; line-height: 1.6; border: 1px solid var(--border); color: var(--fg-muted); }
  .badge--tutorial { border-color: #2f9e44; color: #2f9e44; }
  .badge--reference { border-color: #1971c2; color: #1971c2; }
  .badge--troubleshooting { border-color: #e8590c; color: #e8590c; }
  .badge--deepdive { border-color: #7048e8; color: #7048e8; }
</style>
```

`src/components/LevelBadge.astro`:

```astro
---
import type { PostLevel } from "../data/taxonomy";
interface Props { level: PostLevel }
const { level } = Astro.props;
---
<span class="level">{level}</span>

<style>
  .level { font-size: 0.75rem; color: var(--fg-muted); }
  .level::before { content: "·"; margin-right: 6px; }
</style>
```

- [ ] **Step 2: 목록 카드 컴포넌트 작성**

`src/components/PostCard.astro`:

```astro
---
import TypeBadge from "./TypeBadge.astro";
import LevelBadge from "./LevelBadge.astro";
import { readingMinutes, type Post } from "../lib/posts";

interface Props { post: Post }
const { post } = Astro.props;
const minutes = readingMinutes(post.body ?? "");
---

<article class="card">
  <h3 class="card__title">
    <a href={post.data.permalink}>{post.data.title}</a>
  </h3>
  <p class="card__desc">{post.data.description}</p>
  <p class="card__meta">
    <TypeBadge type={post.data.type} />
    <LevelBadge level={post.data.level} />
    <time datetime={post.data.date.toISOString()}>
      {post.data.date.toLocaleDateString("ko-KR")}
    </time>
    <span>· 약 {minutes}분</span>
  </p>
</article>

<style>
  .card { padding: var(--space-3) 0; border-bottom: 1px solid var(--border); }
  .card__title { margin: 0 0 var(--space-1); font-size: 1.1rem; line-height: 1.5; }
  .card__title a { color: var(--fg); text-decoration: none; }
  .card__title a:hover { color: var(--accent); }
  .card__desc { margin: 0 0 var(--space-2); color: var(--fg-muted); font-size: 0.93rem; }
  .card__meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); margin: 0; color: var(--fg-muted); font-size: 0.82rem; }
</style>
```

- [ ] **Step 3: Hub 레이아웃 작성**

`src/layouts/Hub.astro`:

```astro
---
import Base from "./Base.astro";
import PostCard from "../components/PostCard.astro";
import type { Post } from "../lib/posts";

interface Props {
  title: string;
  pageTitle: string;
  description: string;
  lead: string;
  canonical: string;
  noindex?: boolean;
  posts: Post[];
}
const { title, pageTitle, description, lead, canonical, noindex = false, posts } = Astro.props;

// 학습 순서: 입문 → 중급 → 심화, 같은 난이도 안에서는 오래된 글부터
const LEVEL_ORDER = { 입문: 0, 중급: 1, 심화: 2 } as const;
const learningPath = [...posts].sort(
  (a, b) =>
    LEVEL_ORDER[a.data.level] - LEVEL_ORDER[b.data.level] ||
    a.data.date.getTime() - b.data.date.getTime(),
);
---

<Base title={pageTitle} description={description} canonical={canonical} noindex={noindex}>
  <div class="hub">
    <h1>{title}</h1>
    <p class="hub__lead">{lead}</p>

    <slot name="intro" />

    {learningPath.length > 0 && (
      <section class="hub__path">
        <h2>학습 순서</h2>
        <p class="hub__hint">난이도 순으로 읽으면 흐름이 이어집니다.</p>
        <ol>
          {learningPath.map((post) => (
            <li>
              <a href={post.data.permalink}>{post.data.title}</a>
              <span class="hub__level">{post.data.level}</span>
            </li>
          ))}
        </ol>
      </section>
    )}

    <section class="hub__all">
      <h2>전체 글 {posts.length}편</h2>
      {posts.map((post) => <PostCard post={post} />)}
    </section>
  </div>
</Base>

<style>
  .hub { max-width: 780px; }
  .hub__lead { color: var(--fg-muted); font-size: 1.02rem; }
  .hub__path ol { padding-left: 1.3em; }
  .hub__path li { margin-bottom: var(--space-1); }
  .hub__hint { color: var(--fg-muted); font-size: 0.88rem; margin-top: -8px; }
  .hub__level { color: var(--fg-muted); font-size: 0.8rem; margin-left: var(--space-2); }
</style>
```

- [ ] **Step 4: 섹션 페이지 작성**

`src/pages/[section]/index.astro`:

```astro
---
import Hub from "../../layouts/Hub.astro";
import { SECTIONS } from "../../data/taxonomy";
import { getPostsBySection } from "../../lib/posts";
import { getHubCounts, hubState } from "../../lib/taxonomy";

export async function getStaticPaths() {
  return SECTIONS.map((section) => ({ params: { section: section.id }, props: { section } }));
}

const { section } = Astro.props;
const posts = await getPostsBySection(section.id);
const counts = await getHubCounts();
const hubs = section.hubs
  .map((h) => ({ ...h, count: counts.get(`${section.id}/${h.id}`) ?? 0 }))
  .filter((h) => hubState(h.count) !== "closed")
  .sort((a, b) => b.count - a.count);

const canonical = new URL(`/${section.id}/`, Astro.site).href;
// 글이 없는 섹션은 색인하지 않는다 (스펙 6.4)
const noindex = posts.length === 0;
---

<Hub
  title={section.label}
  pageTitle={`${section.label} | CodeNexus`}
  description={section.description}
  lead={section.description}
  canonical={canonical}
  noindex={noindex}
  posts={posts}
>
  <div slot="intro">
    {hubs.length > 0 && (
      <section>
        <h2>세부 주제</h2>
        <ul class="hublist">
          {hubs.map((hub) => (
            <li>
              <a href={`/${section.id}/${hub.id}/`}>{hub.label}</a>
              <span class="hublist__count">{hub.count}편</span>
              <p>{hub.description}</p>
            </li>
          ))}
        </ul>
      </section>
    )}
    {posts.length === 0 && (
      <p>이 섹션은 아직 준비 중입니다. 곧 글이 추가됩니다.</p>
    )}
  </div>
</Hub>

<style>
  .hublist { list-style: none; padding: 0; }
  .hublist li { padding: var(--space-3) 0; border-bottom: 1px solid var(--border); }
  .hublist a { font-weight: 600; }
  .hublist__count { color: var(--fg-muted); font-size: 0.85rem; margin-left: var(--space-2); }
  .hublist p { margin: var(--space-1) 0 0; color: var(--fg-muted); font-size: 0.9rem; }
</style>
```

- [ ] **Step 5: 허브 페이지 작성**

`src/pages/[section]/[hub]/index.astro`:

```astro
---
import Hub from "../../../layouts/Hub.astro";
import { SECTIONS } from "../../../data/taxonomy";
import { getPostsByHub } from "../../../lib/posts";
import { getHubCounts, hubState } from "../../../lib/taxonomy";

export async function getStaticPaths() {
  const counts = await getHubCounts();
  const paths = [];
  for (const section of SECTIONS) {
    for (const hub of section.hubs) {
      const count = counts.get(`${section.id}/${hub.id}`) ?? 0;
      // 0편 허브는 빌드 산출물을 만들지 않는다 (스펙 6.4)
      if (hubState(count) === "closed") continue;
      paths.push({ params: { section: section.id, hub: hub.id }, props: { section, hub, count } });
    }
  }
  return paths;
}

const { section, hub, count } = Astro.props;
const posts = await getPostsByHub(section.id, hub.id);
const canonical = new URL(`/${section.id}/${hub.id}/`, Astro.site).href;
// 1~2편이면 noindex, follow
const noindex = hubState(count) === "partial";
---

<Hub
  title={`${hub.label} 정리 — ${count}편`}
  pageTitle={`${hub.label} 정리 — ${count}편 | CodeNexus`}
  description={`${hub.description} ${section.label} 섹션의 ${hub.label} 관련 글 ${count}편을 난이도 순으로 정리했습니다.`.slice(0, 150)}
  lead={hub.description}
  canonical={canonical}
  noindex={noindex}
  posts={posts}
/>
```

- [ ] **Step 6: 빌드하고 오픈 규칙이 지켜지는지 검증**

```bash
npm run build
node -e "
const fs=require('fs');
const ex=p=>fs.existsSync('dist/'+p+'/index.html');
if(!ex('backend')) throw new Error('섹션 페이지 없음');
if(!ex('backend/spring')) throw new Error('오픈 허브 페이지 없음');
if(ex('ai/llm')) throw new Error('0편 허브가 빌드됨');
const ai=fs.readFileSync('dist/ai/index.html','utf8');
if(!ai.includes('noindex')) throw new Error('빈 섹션에 noindex 없음');
const sp=fs.readFileSync('dist/backend/spring/index.html','utf8');
if(sp.includes('noindex')) throw new Error('오픈 허브에 noindex가 붙음');
if(!sp.includes('학습 순서')) throw new Error('학습 순서 섹션 없음');
console.log('오픈 규칙 검증 통과');
"
npm test
```

기대: `오픈 규칙 검증 통과` + URL 동일성 게이트 유지.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: 섹션·허브 pillar 페이지

허브는 리드 문단 + 학습 순서 + 전체 목록 구조.
0편 허브는 빌드하지 않고 1~2편은 noindex로 thin content를 차단."
```

---

## Task 7.5: 큐레이션 컬렉션과 SNS 스타일 피드

> **추가 배경**: 사용자 지시 — "reddit/dev.to처럼 프로필 아바타가 있으면 좋겠다",
> "큐레이션을 더 주요하게 보여줘라", "동영상·이미지 같은 SNS 피드 형식으로".
> 홈 구성은 **큐레이션이 주인공, 기존 글이 그 사이에 섞이는** 형태로 확정.
> 큐레이션 아이템 자체는 이 Task에서 채우지 않는다(사용자 선택: "구조만 먼저").

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/data/taxonomy.ts` (허브에 `symbol` optional 필드 추가)
- Create: `src/lib/curation.ts`
- Create: `src/components/HubAvatar.astro`
- Create: `src/components/CurationCard.astro`
- Modify: `src/components/PostCard.astro` (아바타 헤더 추가)
- Modify: `src/pages/index.astro` (병합 피드)
- Create: `src/content/curation/.gitkeep`
- Create: `tests/curation.test.ts`

**Interfaces:**
- Consumes: `SECTION_IDS`, `getHubById()` (Task 2), `Post` 타입과 `readingMinutes()` (Task 5), `hubState()` (Task 6+7)
- Produces:
  - `getCurationItems(): Promise<CurationItem[]>` — date 내림차순
  - `getMergedFeed(limit?: number): Promise<FeedEntry[]>` — 포스트+큐레이션을 date 내림차순 병합. `FeedEntry = { kind: "post", post: Post } | { kind: "curation", item: CurationItem }`
  - `HubAvatar.astro` props: `{ hubId: string, size?: number }`

### 설계 결정 (구현자는 이 결정을 바꾸지 말 것)

**1. 큐레이션 아이템은 자체 페이지를 만들지 않는다.**
아이템마다 페이지를 생성하면 thin content가 N개 늘어 사이트 전체 품질 평가가 내려간다.
아이템은 피드·섹션·허브 목록에만 나타나고, 카드를 누르면 원문으로 나간다.
SEO 자산 역할은 Phase 5의 주간 다이제스트 글이 맡는다.

**2. 코멘터리 길이를 스키마에서 강제한다.**
Google Scaled Content Abuse 정책상 "남의 콘텐츠 링크+요약만 대량으로 모은 페이지"는
애드센스 게재 중지 사유가 된다. `comment` 최소 80자를 zod로 강제해
코멘터리 없는 아이템은 **빌드가 실패**하게 만든다. 이 하한을 낮추지 말 것.

**3. 썸네일은 로컬 경로만 허용한다.**
외부 URL을 `<img src>`에 그대로 쓰면 저작권·성능·프라이버시가 전부 걸린다.
`/images/curation/` 하위 경로만 정규식으로 통과시킨다.

**4. 영상은 JS 0줄로 구현한다.**
`<details>`가 닫혀 있으면 내부 `<iframe>`은 렌더되지 않아 네트워크 요청이 발생하지 않는다.
열었을 때만 `loading="lazy"` iframe이 로드된다. 이것이 lite-embed와 동일한 효과를
스크립트 한 줄 없이 낸다. zero-JS 제약을 깨는 대안(클릭 핸들러)을 쓰지 말 것.
도메인은 `www.youtube-nocookie.com`을 쓴다.

**5. 아바타는 개인이 아니라 주제다.**
전역 제약상 프로필 사진·실명·핸들을 쓸 수 없다. dev.to 카드에서 저자 아바타가 있던
자리에 **허브 아바타**를 넣는다. 허브 id를 해시해 고정 색상을 뽑고 심볼을 얹은
인라인 SVG다. 외부 이미지 요청이 없고, 카드마다 허브 페이지로 가는 내부링크가 하나씩 는다.

**6. 아이템이 0개면 홈의 큐레이션 블록을 렌더하지 않는다.**
허브 단계적 오픈 규칙(스펙 §6.4)과 같은 철학이다. 빈 껍데기를 색인시키지 않는다.

- [ ] **Step 1: 큐레이션 컬렉션 스키마를 추가하는 실패 테스트를 쓴다**

`tests/curation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { curationSchemaShape } from "../src/lib/curation";

describe("큐레이션 스키마", () => {
  const base = {
    title: "Spring Boot 3.5 릴리스",
    url: "https://spring.io/blog/2026/08/20/spring-boot-3-5",
    source: "spring.io",
    date: "2026-08-20",
    section: "backend",
    comment: "가",
  };

  it("코멘터리가 80자 미만이면 거부한다 — 애드센스 정책 방어선이다", () => {
    const r = curationSchemaShape.safeParse({ ...base, comment: "짧은 코멘트" });
    expect(r.success).toBe(false);
  });

  it("코멘터리가 80자 이상이면 통과한다", () => {
    const r = curationSchemaShape.safeParse({ ...base, comment: "가".repeat(80) });
    expect(r.success).toBe(true);
  });

  it("외부 URL 썸네일은 거부한다 — 로컬 경로만 허용한다", () => {
    const r = curationSchemaShape.safeParse({
      ...base, comment: "가".repeat(80),
      thumbnail: "https://example.com/a.png", thumbnailWidth: 640, thumbnailHeight: 360,
    });
    expect(r.success).toBe(false);
  });

  it("썸네일에 width/height가 없으면 거부한다 — CLS 방지", () => {
    const r = curationSchemaShape.safeParse({
      ...base, comment: "가".repeat(80), thumbnail: "/images/curation/a.png",
    });
    expect(r.success).toBe(false);
  });

  it("media가 video인데 youtubeId가 없으면 거부한다", () => {
    const r = curationSchemaShape.safeParse({
      ...base, comment: "가".repeat(80), media: "video",
    });
    expect(r.success).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인한다**

Run: `npx vitest run tests/curation.test.ts`
Expected: FAIL — `curationSchemaShape`를 찾을 수 없음

- [ ] **Step 3: `src/lib/curation.ts`에 스키마와 조회 함수를 구현한다**

```ts
import { getCollection, type CollectionEntry } from "astro:content";
import { z } from "astro:content";
import { SECTION_IDS } from "../data/taxonomy";
import { getPosts, type Post } from "./posts";

export const curationSchemaShape = z
  .object({
    title: z.string().min(1),
    url: z.string().url(),
    source: z.string().min(1),
    date: z.coerce.date(),
    // Google Scaled Content Abuse 방어선. 하한을 낮추면 애드센스가 위험해진다.
    comment: z.string().min(80).max(400),
    section: z.enum(SECTION_IDS as [string, ...string[]]),
    hub: z.string().optional(),
    media: z.enum(["link", "image", "video"]).default("link"),
    // 로컬 경로만. 외부 이미지 직접 참조는 저작권·성능 양쪽에서 위험하다.
    thumbnail: z.string().regex(/^\/images\/curation\/[^/]+$/).optional(),
    thumbnailWidth: z.number().int().positive().optional(),
    thumbnailHeight: z.number().int().positive().optional(),
    youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/).optional(),
    tags: z.array(z.string()).default([]),
  })
  .refine((d) => d.media !== "video" || !!d.youtubeId, {
    message: "media가 video면 youtubeId가 필요하다",
    path: ["youtubeId"],
  })
  .refine((d) => d.media !== "image" || !!d.thumbnail, {
    message: "media가 image면 thumbnail이 필요하다",
    path: ["thumbnail"],
  })
  .refine((d) => !d.thumbnail || (!!d.thumbnailWidth && !!d.thumbnailHeight), {
    message: "CLS 방지를 위해 thumbnail에는 width/height가 함께 있어야 한다",
    path: ["thumbnailWidth"],
  });

export type CurationItem = CollectionEntry<"curation">;

export async function getCurationItems(): Promise<CurationItem[]> {
  const items = await getCollection("curation");
  return items.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export type FeedEntry =
  | { kind: "post"; date: Date; post: Post }
  | { kind: "curation"; date: Date; item: CurationItem };

export async function getMergedFeed(limit?: number): Promise<FeedEntry[]> {
  const [posts, items] = await Promise.all([getPosts(), getCurationItems()]);
  const merged: FeedEntry[] = [
    ...posts.map((post) => ({ kind: "post" as const, date: post.data.date, post })),
    ...items.map((item) => ({ kind: "curation" as const, date: item.data.date, item })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
  return limit ? merged.slice(0, limit) : merged;
}
```

`src/content.config.ts`에 컬렉션을 등록한다. **기존 `posts` 정의는 건드리지 않는다.**

```ts
const curation = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/curation" }),
  schema: curationSchemaShape,
});

export const collections = { posts, curation };
```

`curationSchemaShape`를 `src/lib/curation.ts`에서 import하면 순환 참조가 생길 수 있다.
그럴 경우 스키마 정의만 `src/lib/curation-schema.ts`로 분리하고 양쪽에서 import한다.

- [ ] **Step 4: 테스트를 돌려 통과를 확인한다**

Run: `npx vitest run tests/curation.test.ts`
Expected: PASS (5개)

- [ ] **Step 5: `HubAvatar.astro`를 만든다**

`src/data/taxonomy.ts`의 각 허브에 `symbol?: string`을 optional로 추가한다.
**기존 필드(`id`/`label`/`description`/`keywords`/`faq`)와 허브 목록은 절대 변경하지 않는다.**
주요 허브에만 심볼을 넣는다: spring→`SB`, jpa→`JPA`, java→`J`, testing→`T`,
javascript→`JS`, typescript→`TS`, nodejs→`N`, mysql→`SQL`, redis→`R`,
docker→`D`, aws→`AWS`, tools→`TL`, llm→`AI`.

```astro
---
import { getHubById } from "../lib/taxonomy";

interface Props { hubId: string; size?: number }
const { hubId, size = 32 } = Astro.props;
const hub = getHubById(hubId);

// 허브 id를 해시해 고정 색상을 뽑는다. 같은 허브는 언제나 같은 색이다.
// 개인 아바타를 쓸 수 없으므로(전역 제약) 주제 자체를 아바타로 삼는다.
let h = 0;
for (const ch of hubId) h = (h * 31 + ch.charCodeAt(0)) % 360;
const symbol = hub?.symbol ?? (hub?.label ?? hubId).slice(0, 2).toUpperCase();
const fontSize = symbol.length >= 3 ? size * 0.34 : size * 0.42;
---

<span
  class="avatar"
  style={`--h:${h}; width:${size}px; height:${size}px; font-size:${fontSize}px;`}
  aria-hidden="true">{symbol}</span>

<style>
  .avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    border-radius: 8px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1;
    background: hsl(var(--h) 62% 92%);
    color: hsl(var(--h) 72% 30%);
  }
  :global(:root:not([data-theme="light"])) .avatar {
    background: hsl(var(--h) 38% 22%);
    color: hsl(var(--h) 70% 78%);
  }
  :global(:root[data-theme="dark"]) .avatar {
    background: hsl(var(--h) 38% 22%);
    color: hsl(var(--h) 70% 78%);
  }
</style>
```

다크 모드 규칙은 `tokens.css`가 쓰는 3중 정의 방식(bare `:root` / `prefers-color-scheme` 가드 /
`[data-theme="dark"]`)을 그대로 따른다. `aria-hidden`을 붙인 이유는 바로 옆에 허브명
텍스트 링크가 오기 때문이다 — 스크린리더에 심볼이 중복해 읽히면 안 된다.

- [ ] **Step 6: `PostCard.astro`에 아바타 헤더를 넣는다**

제목 위에 한 줄을 추가한다. **기존 제목·설명·메타 구조는 유지한다.**

```astro
<header class="card__head">
  <HubAvatar hubId={post.data.hub} size={32} />
  <span class="card__head-text">
    <a class="card__hub" href={`/${post.data.section}/${post.data.hub}/`}>{hubLabel}</a>
    <time class="card__date" datetime={post.data.date.toISOString()}>
      {post.data.date.toLocaleDateString("ko-KR")}
    </time>
  </span>
</header>
```

날짜가 헤더로 올라가므로 기존 `.card__meta`의 `<time>`은 제거해 중복을 없앤다.
`hubLabel`은 `getHubById(post.data.hub)?.label ?? post.data.hub`로 구한다.

- [ ] **Step 7: `CurationCard.astro`를 만든다**

세 가지 `media`를 한 컴포넌트에서 처리한다.

```astro
---
import HubAvatar from "./HubAvatar.astro";
import type { CurationItem } from "../lib/curation";

interface Props { item: CurationItem }
const { item } = Astro.props;
const d = item.data;
const avatarId = d.hub ?? d.section;
---

<article class="ccard">
  <header class="ccard__head">
    <HubAvatar hubId={avatarId} size={32} />
    <span class="ccard__head-text">
      <span class="ccard__src">{d.source}</span>
      <time datetime={d.date.toISOString()}>{d.date.toLocaleDateString("ko-KR")}</time>
    </span>
    <span class="ccard__badge">큐레이션</span>
  </header>

  {d.media === "video" && d.youtubeId && (
    <details class="ccard__video">
      <summary>
        <img
          src={d.thumbnail} width={d.thumbnailWidth} height={d.thumbnailHeight}
          alt="" loading="lazy" decoding="async" />
        <span class="ccard__play" aria-hidden="true">▶</span>
        <span class="ccard__play-label">영상 재생</span>
      </summary>
      {/*
        details가 닫혀 있는 동안 이 iframe은 렌더되지 않아 네트워크 요청이 없다.
        열었을 때만 로드된다 — lite-embed와 같은 효과를 스크립트 없이 낸다.
      */}
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${d.youtubeId}`}
        title={d.title} loading="lazy" allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"></iframe>
    </details>
  )}

  {d.media === "image" && d.thumbnail && (
    <a href={d.url} rel="noopener nofollow" target="_blank" class="ccard__img">
      <img src={d.thumbnail} width={d.thumbnailWidth} height={d.thumbnailHeight}
           alt="" loading="lazy" decoding="async" />
    </a>
  )}

  <h3 class="ccard__title">
    <a href={d.url} rel="noopener nofollow" target="_blank">{d.title}</a>
  </h3>
  <p class="ccard__comment">{d.comment}</p>
  <p class="ccard__meta">
    {d.tags.slice(0, 3).map((t) => <span class="ccard__tag">#{t}</span>)}
    <span class="ccard__out">{d.source} ↗</span>
  </p>
</article>
```

`rel="noopener nofollow"`를 붙인다. 큐레이션 링크에 nofollow를 붙이는 이유는
외부로 나가는 링크가 대량으로 쌓였을 때 링크 스팸으로 오인되지 않게 하기 위해서다.
이미지·영상 카드는 `aspect-ratio`로 자리를 미리 잡아 CLS를 0으로 만든다.

- [ ] **Step 8: 홈을 병합 피드로 바꾼다**

`src/pages/index.astro`:

```astro
const curation = await getCurationItems();
const topCuration = curation.slice(0, 6);
const feed = await getMergedFeed(30);
```

```astro
{topCuration.length > 0 && (
  <section class="home__curation" aria-labelledby="curation-heading">
    <h2 id="curation-heading">이번 주 큐레이션</h2>
    <div class="home__curation-grid">
      {topCuration.map((item) => <CurationCard item={item} />)}
    </div>
  </section>
)}

<section aria-labelledby="feed-heading">
  <h2 id="feed-heading">최신</h2>
  {feed.map((e) =>
    e.kind === "post" ? <PostCard post={e.post} /> : <CurationCard item={e.item} />
  )}
</section>
```

큐레이션 그리드는 `repeat(auto-fill, minmax(260px, 1fr))`, 모바일에서는 1열.
**아이템이 0개일 때 `home__curation` 섹션 전체가 DOM에 없어야 한다** — 빈 제목만 남으면
색인 품질에 해가 된다.

- [ ] **Step 9: 빌드하고 전수 검증한다**

Run: `npx astro build`

다음을 프로그램으로 확인한다:
- `dist/index.html`에 `이번 주 큐레이션` 문자열이 **없다** (아이템 0개이므로)
- `src/data/url-map.json`의 146개 URL이 `dist`에 전부 존재한다
- `grep -r "<script src=" dist/` → 0건
- `grep -ri "andrew" dist/` → 도메인 문자열 외 0건
- 모든 `<img>`에 `width`/`height`가 있다

Run: `npm test`
Expected: 기존 통과 테스트가 하나도 깨지지 않는다 (알려진 `dist/sitemap.xml` 실패 1건은 Task 12에서 해소되므로 그대로 둔다)

- [ ] **Step 10: 샘플 아이템으로 렌더를 확인한 뒤 되돌린다**

`src/content/curation/`에 link·image·video 각 1개씩 임시 아이템을 만들어
`npx astro build` 후 세 카드가 모두 정상 렌더되는지, 영상 카드의 `details`가
닫힌 상태에서 `dist`의 HTML에 iframe이 존재하되 브라우저가 요청을 보내지 않는 구조인지
확인한다. 확인 후 **임시 아이템은 삭제하고 `.gitkeep`만 커밋한다** (사용자가 콘텐츠는
나중에 채우기로 결정했다).

- [ ] **Step 11: 커밋**

```bash
git add src/lib/curation.ts src/components/HubAvatar.astro src/components/CurationCard.astro \
        src/components/PostCard.astro src/content.config.ts src/data/taxonomy.ts \
        src/pages/index.astro src/content/curation/.gitkeep tests/curation.test.ts
git commit -m "feat: 큐레이션 컬렉션과 SNS 스타일 피드 카드 추가"
```

---

## Task 7.6: 코드블록 박스와 복사 버튼

> **추가 배경**: 사용자 지시 — "코드블록 색상은 잘 나오는데 박스 형태로 하고
> copy 버튼이 있어야 한다. 그런 건 기본이다."
> 이 Task는 **Global Constraints의 zero client-side JS 항목을 완화한 상태**에서 진행한다.
> 재정의된 제약: **인라인 스크립트만 허용, 외부 `<script src=>` 금지, 인라인 총합 2KB 이하.**
> 클립보드 접근은 JS 없이 불가능하고, 이벤트 위임 한 개면 ~500바이트다.
> `dist/`에 `<script src=`가 0건이라는 검증은 그대로 유지한다.

**Files:**
- Create: `plugins/rehype-code-block.mjs`
- Modify: `astro.config.mjs`
- Modify: `src/styles/global.css` (또는 코드블록 전용 CSS 파일 신설)
- Modify: `src/layouts/Base.astro` (인라인 복사 스크립트)
- Test: `tests/code-block.test.ts`

**Interfaces:**
- Consumes: Task 2의 Shiki 설정(`markdown.shikiConfig`, light/dark 이중 테마)
- Produces: 마크다운의 모든 펜스 코드블록이 `<figure class="codeblock">` 로 감싸여 렌더된다

### 설계 결정

**1. Shiki 설정을 건드리지 않는다.**
색상은 이미 정상이라고 사용자가 확인했다. 이 Task는 **감싸는 껍데기와 복사 버튼만** 추가한다.
`shikiConfig`의 `themes`·`wrap` 값을 바꾸지 말 것.

**2. 인라인 코드는 대상이 아니다.**
`<pre>` 안에 있는 `<code>`만 감싼다. 본문 중간의 `` `foo` `` 는 그대로 둔다.

**3. 이벤트 위임 하나만 쓴다.**
코드블록마다 리스너를 붙이면 긴 글에서 수십 개가 생긴다. `document`에 클릭 리스너
하나를 걸고 `closest()`로 판정한다.

**4. 복사 버튼은 `aria-live`로 결과를 알린다.**
시각적 "복사됨" 표시만으로는 스크린리더 사용자가 성공 여부를 알 수 없다.

- [ ] **Step 1: rehype 플러그인의 실패 테스트를 쓴다**

`tests/code-block.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import rehypeCodeBlock from "../plugins/rehype-code-block.mjs";

const run = (html: string) =>
  unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeCodeBlock)
    .use(rehypeStringify)
    .processSync(html)
    .toString();

describe("코드블록 rehype 플러그인", () => {
  it("pre를 figure.codeblock으로 감싼다", () => {
    const out = run('<pre class="astro-code" data-language="java"><code>x</code></pre>');
    expect(out).toContain('class="codeblock"');
    expect(out).toContain("<figure");
  });

  it("언어 라벨을 헤더에 넣는다", () => {
    const out = run('<pre class="astro-code" data-language="java"><code>x</code></pre>');
    expect(out).toContain("java");
  });

  it("복사 버튼을 넣는다", () => {
    const out = run('<pre class="astro-code" data-language="java"><code>x</code></pre>');
    expect(out).toContain("data-copy");
    expect(out).toContain("<button");
  });

  it("data-language가 없어도 깨지지 않는다", () => {
    const out = run("<pre><code>x</code></pre>");
    expect(out).toContain('class="codeblock"');
  });

  it("인라인 code는 감싸지 않는다", () => {
    const out = run("<p>이것은 <code>inline</code> 입니다</p>");
    expect(out).not.toContain("codeblock");
  });

  it("이미 감싼 pre를 두 번 감싸지 않는다", () => {
    const once = run('<pre data-language="js"><code>x</code></pre>');
    const twice = run(once);
    expect(twice.match(/class="codeblock"/g)?.length).toBe(1);
  });
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인한다**

Run: `npx vitest run tests/code-block.test.ts`
Expected: FAIL — `plugins/rehype-code-block.mjs`가 없음

- [ ] **Step 3: 플러그인을 구현한다**

```js
// plugins/rehype-code-block.mjs
import { visit } from "unist-util-visit";

export default function rehypeCodeBlock() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === null) return;
      // 이미 감싼 것을 다시 감싸지 않는다 (플러그인이 두 번 실행되는 경우 대비)
      if (parent.type === "element" && parent.properties?.className?.includes?.("codeblock")) return;

      const lang = node.properties?.dataLanguage ?? "";
      const label = typeof lang === "string" && lang ? lang : "code";

      parent.children[index] = {
        type: "element",
        tagName: "figure",
        properties: { className: ["codeblock"] },
        children: [
          {
            type: "element",
            tagName: "figcaption",
            properties: { className: ["codeblock__bar"] },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: { className: ["codeblock__lang"] },
                children: [{ type: "text", value: label }],
              },
              {
                type: "element",
                tagName: "button",
                properties: {
                  type: "button",
                  className: ["codeblock__copy"],
                  "data-copy": "",
                  "aria-label": `${label} 코드 복사`,
                },
                children: [{ type: "text", value: "복사" }],
              },
            ],
          },
          node,
        ],
      };
    });
  };
}
```

`data-language`는 hast에서 `dataLanguage`로 접근한다. Shiki 버전에 따라 속성이
없을 수 있으니 **반드시 실제 빌드 산출물에서 확인하고**, 없으면 `<code>`의
`className`에서 `language-xxx`를 파싱하는 경로를 추가한다.

`astro.config.mjs`의 `markdown`에 등록한다. **기존 `shikiConfig`는 그대로 둔다.**

```js
markdown: {
  shikiConfig: { /* 기존 값 그대로 */ },
  rehypePlugins: [rehypeCodeBlock],
},
```

- [ ] **Step 4: 테스트를 돌려 통과를 확인한다**

Run: `npx vitest run tests/code-block.test.ts`
Expected: PASS (6개)

- [ ] **Step 5: 코드블록 스타일을 넣는다**

박스 형태로 만든다. 색상 값은 하드코딩하지 말고 `tokens.css`의 토큰을 쓰거나,
없으면 토큰을 새로 정의한다(라이트 / `prefers-color-scheme` 가드 / `[data-theme="dark"]`
3중 정의 규칙을 따를 것).

```css
.codeblock {
  margin: var(--space-5) 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface);
}
.codeblock__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: 6px 10px 6px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
  font-size: 0.75rem;
}
.codeblock__lang {
  color: var(--fg-muted);
  font-family: var(--font-mono);
  text-transform: lowercase;
  letter-spacing: 0.02em;
}
.codeblock__copy {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 3px 10px;
  background: transparent;
  color: var(--fg-muted);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}
.codeblock__copy:hover { color: var(--fg); border-color: var(--fg-muted); }
.codeblock__copy:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.codeblock__copy[data-copied] { color: var(--accent); border-color: var(--accent); }
.codeblock pre {
  margin: 0;
  border: 0;
  border-radius: 0;
  padding: var(--space-4);
  overflow-x: auto;
}
```

`.codeblock pre`가 기존 `pre` 스타일의 테두리·라운드·마진을 확실히 덮는지 확인한다.
박스 안에 박스가 겹쳐 보이면 안 된다.

가로 스크롤은 `pre`가 자체적으로 처리한다 — **페이지 body가 가로로 스크롤되면 안 된다.**
`shikiConfig.wrap`이 켜져 있으므로 긴 줄은 줄바꿈되지만, 표·긴 URL 등이 있는 블록을
실제로 확인할 것.

- [ ] **Step 6: 복사 스크립트를 `Base.astro`에 인라인으로 넣는다**

기존 테마 스크립트 아래에 둔다. **`<script is:inline>`을 쓴다** — Astro가 번들해
외부 파일로 빼내면 `<script src=` 0건 검증이 깨진다.

```html
<script is:inline>
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-copy]");
    if (!btn) return;
    var pre = btn.closest(".codeblock").querySelector("pre");
    if (!pre || !navigator.clipboard) return;
    navigator.clipboard.writeText(pre.innerText).then(function () {
      btn.setAttribute("data-copied", "");
      btn.textContent = "복사됨";
      setTimeout(function () {
        btn.removeAttribute("data-copied");
        btn.textContent = "복사";
      }, 1500);
    });
  });
</script>
```

`navigator.clipboard`는 보안 컨텍스트(https 또는 localhost)에서만 존재한다.
없으면 조용히 아무 일도 하지 않는다 — 버튼이 에러를 던지면 안 된다.

- [ ] **Step 7: 빌드하고 검증한다**

Run: `npx astro build`

프로그램으로 확인한다:
- `dist/` 전체에서 `<script src=` → **0건** (제약 유지 확인)
- 코드 예제가 있는 글(예: `dist/2019/04/12/` 하위)의 HTML에 `class="codeblock"`과
  `data-copy`가 존재한다
- `<figure class="codeblock">` 개수와 `<pre` 개수가 일치한다 (감싸지지 않은 pre가 없다)
- 146개 URL 전부 존재

Run: `npm test`
Expected: 기존 통과 테스트가 하나도 깨지지 않는다 (알려진 `dist/sitemap.xml` 실패 1건 제외)

- [ ] **Step 8: 실제 브라우저 확인**

`npm run dev` 후 코드 예제가 많은 글을 열어 다음을 눈으로 확인한다:
- 박스 테두리와 상단 바가 정상 렌더되고, 안에 겹친 테두리가 없다
- 복사 버튼을 누르면 "복사됨"으로 바뀌었다가 1.5초 뒤 되돌아온다
- 라이트/다크 모드 양쪽에서 상단 바와 코드 배경의 대비가 충분하다
- 키보드 Tab으로 복사 버튼에 포커스가 가고 포커스 링이 보인다

확인 후 **개발 서버를 끈다.**

- [ ] **Step 9: 커밋**

```bash
git add plugins/rehype-code-block.mjs astro.config.mjs src/styles/ src/layouts/Base.astro tests/code-block.test.ts
git commit -m "feat: 코드블록 박스 UI와 복사 버튼 추가"
```

---

## Task 8: 태그 페이지와 태그 정책

**Files:**
- Create: `src/pages/tags/index.astro`, `src/pages/tags/[tag].astro`
- Delete: `tag/` (기존 커밋된 생성 HTML 87개)

**Interfaces:**
- Consumes: `getAllPosts` (Task 5)
- Produces: `getTagCounts(): Promise<Map<string, number>>` — `src/lib/posts.ts`에 추가

- [ ] **Step 1: `src/lib/posts.ts`에 태그 집계 함수 추가**

```ts
export async function getTagCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const post of await getAllPosts()) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

/** 태그 색인 임계. 허브와 동일하게 3편. */
export const TAG_INDEX_THRESHOLD = 3;
```

- [ ] **Step 2: 태그 목록 페이지 작성**

`src/pages/tags/index.astro`:

```astro
---
import Base from "../../layouts/Base.astro";
import { getTagCounts, TAG_INDEX_THRESHOLD } from "../../lib/posts";

const counts = [...(await getTagCounts()).entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
const canonical = new URL("/tags/", Astro.site).href;
---

<Base
  title="태그 전체 목록 | CodeNexus"
  description="CodeNexus의 모든 글을 태그로 모아 봅니다. Spring, JPA, JavaScript, MySQL 등 주제별 태그와 글 수를 확인할 수 있습니다."
  canonical={canonical}
>
  <h1>태그</h1>
  <ul class="tags">
    {counts.map(([tag, count]) => (
      <li>
        <a href={`/tags/${encodeURIComponent(tag)}/`}>{tag}</a>
        <span>{count}</span>
        {count < TAG_INDEX_THRESHOLD && <span class="tags__thin">비색인</span>}
      </li>
    ))}
  </ul>
</Base>

<style>
  .tags { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: var(--space-2); }
  .tags li { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border: 1px solid var(--border); border-radius: 999px; font-size: 0.88rem; }
  .tags span { color: var(--fg-muted); font-size: 0.8rem; }
  .tags__thin { opacity: 0.6; }
</style>
```

- [ ] **Step 3: 태그 상세 페이지 작성**

`src/pages/tags/[tag].astro`:

```astro
---
import Base from "../../layouts/Base.astro";
import PostCard from "../../components/PostCard.astro";
import { getAllPosts, getTagCounts, TAG_INDEX_THRESHOLD } from "../../lib/posts";

export async function getStaticPaths() {
  const posts = await getAllPosts();
  const counts = await getTagCounts();
  return [...counts.entries()].map(([tag, count]) => ({
    params: { tag },
    props: { tag, count, posts: posts.filter((p) => p.data.tags.includes(tag)) },
  }));
}

const { tag, count, posts } = Astro.props;
const canonical = new URL(`/tags/${encodeURIComponent(tag)}/`, Astro.site).href;
// 3편 미만 태그는 색인하지 않는다 (스펙 6.10)
const noindex = count < TAG_INDEX_THRESHOLD;
---

<Base
  title={`${tag} 관련 글 ${count}편 | CodeNexus`}
  description={`${tag} 태그가 붙은 글 ${count}편입니다. 실무 예제와 트러블슈팅 기록을 최신순으로 모았습니다.`}
  canonical={canonical}
  noindex={noindex}
>
  <h1>{tag}</h1>
  <p>{count}편</p>
  {posts.map((post) => <PostCard post={post} />)}
</Base>
```

- [ ] **Step 4: 기존 커밋된 태그 HTML 제거 (D10)**

```bash
git rm -r tag
```

- [ ] **Step 5: 빌드하고 태그 정책 검증**

```bash
npm run build
node -e "
const fs=require('fs');
const spring=fs.readFileSync('dist/tags/spring/index.html','utf8');
if(spring.includes('noindex')) throw new Error('다수 태그가 noindex');
const thin=fs.readdirSync('dist/tags').filter(d=>fs.existsSync('dist/tags/'+d+'/index.html'));
console.log('태그 페이지:',thin.length,'개');
if(fs.existsSync('dist/tag')) throw new Error('기존 tag/ 디렉터리 잔존');
console.log('태그 정책 검증 통과');
"
npm test
```

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: 태그 페이지 재구축 및 정책 적용

3편 이상 태그만 색인. 커밋돼 있던 생성 HTML 87개 제거(D10)."
```

---

## Task 9: 포스트 페이지 완성

Task 5의 최소 포스트 페이지에 브레드크럼·TOC·관련 글·시리즈 내비·댓글을 붙이고, hero를 제거한 본문 우선 구조를 확정한다(D6).

**Files:**
- Create: `src/components/Breadcrumb.astro`, `src/components/Toc.astro`, `src/components/RelatedPosts.astro`, `src/components/SeriesNav.astro`, `src/components/Comments.astro`
- Create: `src/layouts/Post.astro`
- Modify: `src/pages/[...permalink].astro`

**Interfaces:**
- Consumes: `getAllPosts`, `readingMinutes` (Task 5), `getSection`, `getHub` (Task 6)
- Produces: `Post.astro` props — `{ post: Post; headings: MarkdownHeading[] }`. `MarkdownHeading`은 `astro`가 제공하는 `{ depth: number; slug: string; text: string }`.

- [ ] **Step 1: 브레드크럼 작성**

`src/components/Breadcrumb.astro`:

```astro
---
interface Crumb { label: string; href?: string }
interface Props { items: Crumb[] }
const { items } = Astro.props;
---

<nav class="crumb" aria-label="현재 위치">
  <ol>
    {items.map((item, i) => (
      <li>
        {item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}
        {i < items.length - 1 && <span class="crumb__sep" aria-hidden="true">›</span>}
      </li>
    ))}
  </ol>
</nav>

<style>
  .crumb ol { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; padding: 0; margin: 0 0 var(--space-3); font-size: 0.85rem; }
  .crumb li { display: flex; gap: 6px; align-items: center; }
  .crumb a { color: var(--fg-muted); text-decoration: none; }
  .crumb a:hover { color: var(--accent); }
  .crumb span[aria-current] { color: var(--fg-muted); }
  .crumb__sep { color: var(--border); }
</style>
```

- [ ] **Step 2: TOC 작성**

`src/components/Toc.astro`:

```astro
---
import type { MarkdownHeading } from "astro";
interface Props { headings: MarkdownHeading[] }
const { headings } = Astro.props;
const items = headings.filter((h) => h.depth === 2 || h.depth === 3);
---

{items.length >= 3 && (
  <nav class="toc" aria-label="목차">
    <p class="toc__title">목차</p>
    <ul>
      {items.map((h) => (
        <li class={`toc__d${h.depth}`}><a href={`#${h.slug}`}>{h.text}</a></li>
      ))}
    </ul>
  </nav>
)}

<style>
  .toc { position: sticky; top: 80px; font-size: 0.86rem; }
  .toc__title { font-weight: 600; margin: 0 0 var(--space-2); }
  .toc ul { list-style: none; padding: 0; margin: 0; border-left: 2px solid var(--border); }
  .toc li { padding: 3px 0 3px var(--space-3); }
  .toc__d3 { padding-left: var(--space-4); }
  .toc a { color: var(--fg-muted); text-decoration: none; }
  .toc a:hover { color: var(--accent); }
  @media (max-width: 1024px) { .toc { display: none; } }
</style>
```

- [ ] **Step 3: 관련 글과 시리즈 내비 작성**

`src/components/RelatedPosts.astro`:

```astro
---
import { getAllPosts, type Post } from "../lib/posts";

interface Props { post: Post }
const { post } = Astro.props;

const all = await getAllPosts();
const scored = all
  .filter((p) => p.id !== post.id)
  .map((p) => {
    let score = 0;
    if (p.data.hub === post.data.hub && p.data.section === post.data.section) score += 5;
    else if (p.data.section === post.data.section) score += 2;
    score += p.data.tags.filter((t) => post.data.tags.includes(t)).length;
    return { post: p, score };
  })
  .filter((x) => x.score > 0)
  .sort((a, b) => b.score - a.score || b.post.data.date.getTime() - a.post.data.date.getTime())
  .slice(0, 5);
---

{scored.length > 0 && (
  <section class="related">
    <h2>함께 읽으면 좋은 글</h2>
    <ul>
      {scored.map(({ post: p }) => (
        <li><a href={p.data.permalink}>{p.data.title}</a></li>
      ))}
    </ul>
  </section>
)}

<style>
  .related { margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--border); }
  .related h2 { font-size: 1rem; }
  .related ul { list-style: none; padding: 0; }
  .related li { padding: 6px 0; }
</style>
```

`src/components/SeriesNav.astro`:

```astro
---
import { getAllPosts, type Post } from "../lib/posts";

interface Props { post: Post }
const { post } = Astro.props;
const series = post.data.series;

const siblings = series
  ? (await getAllPosts())
      .filter((p) => p.data.series?.name === series.name)
      .sort((a, b) => (a.data.series!.order ?? 0) - (b.data.series!.order ?? 0))
  : [];
---

{series && siblings.length > 1 && (
  <nav class="series" aria-label="시리즈 목차">
    <p class="series__title">{series.name} 시리즈</p>
    <ol>
      {siblings.map((p) => (
        <li aria-current={p.id === post.id ? "page" : undefined}>
          {p.id === post.id ? <span>{p.data.title}</span> : <a href={p.data.permalink}>{p.data.title}</a>}
        </li>
      ))}
    </ol>
  </nav>
)}

<style>
  .series { margin: var(--space-4) 0; padding: var(--space-3); background: var(--bg-subtle); border-radius: 8px; font-size: 0.9rem; }
  .series__title { font-weight: 600; margin: 0 0 var(--space-2); }
  .series ol { margin: 0; padding-left: 1.3em; }
  .series li[aria-current] span { font-weight: 600; }
</style>
```

- [ ] **Step 4: 댓글 컴포넌트 작성**

기존 utterances를 유지한다. 스펙 §7.0에서 저장소 소유자 노출은 감수 범위로 확정했다.

`src/components/Comments.astro`:

```astro
<section class="comments" aria-label="댓글">
  <h2>정정 · 제보</h2>
  <p class="comments__hint">내용에 오류가 있거나 보완할 점이 있으면 댓글로 알려주세요.</p>
  <script
    is:inline
    src="https://utteranc.es/client.js"
    repo="umanking/umanking.github.io"
    issue-term="pathname"
    theme="preferred-color-scheme"
    crossorigin="anonymous"
    async
  ></script>
</section>

<style>
  .comments { margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--border); }
  .comments h2 { font-size: 1rem; }
  .comments__hint { color: var(--fg-muted); font-size: 0.9rem; }
</style>
```

- [ ] **Step 5: Post 레이아웃 작성**

hero를 넣지 않는다. `<h1>`이 첫 요소여야 한다(D6).

`src/layouts/Post.astro`:

```astro
---
import type { MarkdownHeading } from "astro";
import Base from "./Base.astro";
import Breadcrumb from "../components/Breadcrumb.astro";
import Toc from "../components/Toc.astro";
import TypeBadge from "../components/TypeBadge.astro";
import LevelBadge from "../components/LevelBadge.astro";
import RelatedPosts from "../components/RelatedPosts.astro";
import SeriesNav from "../components/SeriesNav.astro";
import Comments from "../components/Comments.astro";
import { readingMinutes, type Post } from "../lib/posts";
import { getSection, getHub } from "../lib/taxonomy";

interface Props { post: Post; headings: MarkdownHeading[] }
const { post, headings } = Astro.props;

const section = getSection(post.data.section);
const hub = getHub(post.data.section, post.data.hub);
const canonical = new URL(post.data.permalink, Astro.site).href;
const minutes = readingMinutes(post.body ?? "");

const crumbs = [
  { label: "홈", href: "/" },
  ...(section ? [{ label: section.label, href: `/${section.id}/` }] : []),
  ...(section && hub ? [{ label: hub.label, href: `/${section.id}/${hub.id}/` }] : []),
  { label: post.data.title },
];

const titleTag =
  post.data.title.length > 30 ? post.data.title : `${post.data.title} | CodeNexus`;
---

<Base title={titleTag} description={post.data.description} canonical={canonical} noindex={post.data.noindex}>
  <div class="layout">
    <article class="post prose">
      <Breadcrumb items={crumbs} />
      <h1>{post.data.title}</h1>
      <p class="post__meta">
        <TypeBadge type={post.data.type} />
        <LevelBadge level={post.data.level} />
        <time datetime={post.data.date.toISOString()}>
          {post.data.date.toLocaleDateString("ko-KR")}
        </time>
        <span>· 약 {minutes}분</span>
      </p>

      <SeriesNav post={post} />
      <slot />
      <RelatedPosts post={post} />
      <Comments />
    </article>

    <aside class="sidebar">
      <Toc headings={headings} />
    </aside>
  </div>
</Base>

<style>
  .layout { display: grid; grid-template-columns: minmax(0, 1fr) 240px; gap: var(--space-5); align-items: start; padding-top: var(--space-4); }
  .post { min-width: 0; }
  .post h1 { font-size: 1.75rem; line-height: 1.4; margin: 0 0 var(--space-2); }
  .post__meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); color: var(--fg-muted); font-size: 0.85rem; margin: 0 0 var(--space-4); }
  @media (max-width: 1024px) { .layout { grid-template-columns: minmax(0, 1fr); } .sidebar { display: none; } }
</style>
```

- [ ] **Step 6: 포스트 라우트를 새 레이아웃으로 교체**

`src/pages/[...permalink].astro` 전체를 교체:

```astro
---
import { render } from "astro:content";
import PostLayout from "../layouts/Post.astro";
import { getAllPosts, permalinkToParam } from "../lib/posts";

export async function getStaticPaths() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    params: { permalink: permalinkToParam(post.data.permalink) },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await render(post);
---

<PostLayout post={post} headings={headings}>
  <Content />
</PostLayout>
```

- [ ] **Step 7: 빌드하고 검증**

```bash
npm run build
node -e "
const fs=require('fs');
const html=fs.readFileSync('dist/2019/04/12/jpa-1-n-mapping/index.html','utf8');
const h1=[...html.matchAll(/<h1[^>]*>/g)].length;
if(h1!==1) throw new Error('h1 개수 이상: '+h1);
if(!html.includes('현재 위치')) throw new Error('브레드크럼 없음');
if(!html.includes('함께 읽으면 좋은 글')) throw new Error('관련 글 없음');
if(html.includes(\"Hi! I'm\")) throw new Error('hero 잔존');
console.log('포스트 페이지 검증 통과: h1 1개, 브레드크럼·관련글 존재, hero 없음');
"
npm test
```

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: 포스트 페이지 완성

브레드크럼·TOC·관련글·시리즈·댓글 추가.
hero를 제거해 h1이 본문 최상단에 오도록 정리(D6). h1 중복 없음(D4)."
```

---

## Task 10: SEO 메타와 JSON-LD

**Files:**
- Create: `src/lib/seo.ts`, `src/lib/jsonld.ts`
- Create: `src/components/BaseHead.astro`
- Modify: `src/layouts/Base.astro`
- Create: `tests/seo.test.ts`

**Interfaces:**
- Consumes: `SECTIONS` (Task 2), `getSection`/`getHub` (Task 6)
- Produces:
  - `SITE = { name: "CodeNexus", url: "https://umanking.github.io", locale: "ko_KR" }`
  - `buildTitle(pageTitle: string): string` — 30자 초과면 사이트명을 붙이지 않는다
  - `organizationLd(): object`, `blogPostingLd(args): object`, `breadcrumbLd(items): object`, `webSiteLd(): object`, `itemListLd(args): object`
  - `BaseHead.astro` props — `{ title, description, canonical, noindex?, ogImage?, jsonLd?: object[] }`

- [ ] **Step 1: title 생성 규칙 테스트를 먼저 작성**

`tests/seo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildTitle, SITE } from "../src/lib/seo";

describe("title 생성 규칙", () => {
  it("짧은 제목에는 사이트명을 붙인다", () => {
    expect(buildTitle("JPA 연관관계 매핑")).toBe("JPA 연관관계 매핑 | CodeNexus");
  });

  it("30자를 넘으면 사이트명을 붙이지 않는다", () => {
    const long = "가".repeat(31);
    expect(buildTitle(long)).toBe(long);
  });

  it("사이트명을 앞에 두지 않는다", () => {
    expect(buildTitle("Redis 시작하기").startsWith(SITE.name)).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test
```

기대: FAIL — `Failed to resolve import "../src/lib/seo"`

- [ ] **Step 3: `src/lib/seo.ts` 작성**

```ts
export const SITE = {
  name: "CodeNexus",
  url: "https://umanking.github.io",
  locale: "ko_KR",
  description:
    "아키텍처 · 백엔드 · 데이터 · AI를 다루는 한국어 기술 매체. Spring, JPA, Java, MySQL 실무 예제와 트러블슈팅을 정리합니다.",
} as const;

/** SERP는 한국어 기준 30~35자에서 잘린다. 제목이 길면 사이트명을 생략한다. */
export const TITLE_MAX = 30;

export function buildTitle(pageTitle: string): string {
  return pageTitle.length > TITLE_MAX ? pageTitle : `${pageTitle} | ${SITE.name}`;
}

export function absolute(path: string): string {
  return new URL(path, SITE.url).href;
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```

기대: `title 생성 규칙` 3개 PASS.

- [ ] **Step 5: JSON-LD 빌더 작성**

`Person` 스키마를 쓰지 않는다(Global Constraints).

`src/lib/jsonld.ts`:

```ts
import { SITE, absolute } from "./seo";

const ORG_ID = `${SITE.url}/#organization`;

export function organizationLd() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: { "@type": "ImageObject", url: absolute("/images/og-default.png") },
  };
}

export function webSiteLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: "ko-KR",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/search/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function blogPostingLd(args: {
  title: string;
  description: string;
  url: string;
  datePublished: Date;
  dateModified: Date;
  image: string;
  section: string;
  keywords: string[];
}) {
  return {
    "@type": "BlogPosting",
    headline: args.title,
    description: args.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": args.url },
    url: args.url,
    datePublished: args.datePublished.toISOString(),
    dateModified: args.dateModified.toISOString(),
    image: args.image,
    articleSection: args.section,
    keywords: args.keywords.join(", "),
    inLanguage: "ko-KR",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbLd(items: Array<{ label: string; href?: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: absolute(item.href) } : {}),
    })),
  };
}

export function itemListLd(args: { name: string; items: Array<{ title: string; url: string }> }) {
  return {
    "@type": "ItemList",
    name: args.name,
    numberOfItems: args.items.length,
    itemListElement: args.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.title,
      url: absolute(it.url),
    })),
  };
}

/** 여러 노드를 하나의 @graph로 묶는다 */
export function graph(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
```

- [ ] **Step 6: `BaseHead.astro` 작성**

```astro
---
import { SITE, absolute } from "../lib/seo";
import { graph } from "../lib/jsonld";

interface Props {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  jsonLd?: object[];
}
const {
  title, description, canonical, noindex = false,
  ogImage = absolute("/images/og-default.png"),
  ogType = "website", publishedTime, modifiedTime, section, tags = [], jsonLd = [],
} = Astro.props;

const GA4_ID = import.meta.env.PUBLIC_GA4_ID;
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{noindex
  ? <meta name="robots" content="noindex, follow" />
  : <meta name="robots" content="index, follow, max-image-preview:large" />}

<meta name="naver-site-verification" content="46d4c4d3f1013de17dee96a763e94028323e4b00" />
<link rel="icon" href="/favicon.ico" />
<link rel="alternate" type="application/rss+xml" title={SITE.name} href="/feed.xml" />

<meta property="og:type" content={ogType} />
<meta property="og:site_name" content={SITE.name} />
<meta property="og:locale" content={SITE.locale} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
{publishedTime && <meta property="article:published_time" content={publishedTime} />}
{modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
{section && <meta property="article:section" content={section} />}
{tags.map((tag) => <meta property="article:tag" content={tag} />)}

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />

{jsonLd.length > 0 && (
  <script type="application/ld+json" set:html={JSON.stringify(graph(jsonLd))} />
)}

{GA4_ID && (
  <>
    <script is:inline async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}></script>
    <script is:inline define:vars={{ GA4_ID }}>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag("js", new Date());
      gtag("config", GA4_ID);
    </script>
  </>
)}

<script
  is:inline
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2431823363518805"
  crossorigin="anonymous"></script>
```

- [ ] **Step 7: `Base.astro`가 `BaseHead`를 쓰도록 교체**

`src/layouts/Base.astro`의 `<head>` 블록 전체를 `<BaseHead {...Astro.props} />`로 바꾸고, Props 인터페이스를 `BaseHead`와 동일하게 확장한다:

```astro
---
import "../styles/global.css";
import BaseHead from "../components/BaseHead.astro";
import Nav from "../components/Nav.astro";
import Footer from "../components/Footer.astro";

interface Props {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  jsonLd?: object[];
}
---

<!doctype html>
<html lang="ko">
  <head>
    <BaseHead {...Astro.props} />
  </head>
  <body>
    <a class="skip-link" href="#main">본문으로 건너뛰기</a>
    <Nav />
    <main id="main" class="container">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 8: `Post.astro`에서 JSON-LD를 넘기도록 수정**

`src/layouts/Post.astro`의 프론트매터에 추가:

```ts
import { blogPostingLd, breadcrumbLd, organizationLd } from "../lib/jsonld";
import { absolute } from "../lib/seo";

const ogImage = absolute(`/og${post.data.permalink}index.png`);
const jsonLd = [
  organizationLd(),
  blogPostingLd({
    title: post.data.title,
    description: post.data.description,
    url: canonical,
    datePublished: post.data.date,
    dateModified: post.data.date,
    image: ogImage,
    section: section?.label ?? "",
    keywords: post.data.tags,
  }),
  breadcrumbLd(crumbs),
];
```

`<Base>` 태그에 props를 추가한다:

```astro
<Base
  title={titleTag}
  description={post.data.description}
  canonical={canonical}
  noindex={post.data.noindex}
  ogType="article"
  ogImage={ogImage}
  publishedTime={post.data.date.toISOString()}
  modifiedTime={post.data.date.toISOString()}
  section={section?.label}
  tags={post.data.tags}
  jsonLd={jsonLd}
>
```

- [ ] **Step 9: 빌드하고 JSON-LD 검증**

```bash
npm run build
node -e "
const fs=require('fs');
const html=fs.readFileSync('dist/2019/04/12/jpa-1-n-mapping/index.html','utf8');
const m=html.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/);
if(!m) throw new Error('JSON-LD 없음');
const ld=JSON.parse(m[1]);
const types=ld['@graph'].map(n=>n['@type']);
for(const t of ['Organization','BlogPosting','BreadcrumbList']){
  if(!types.includes(t)) throw new Error('누락: '+t);
}
if(JSON.stringify(ld).includes('\"Person\"')) throw new Error('Person 스키마 사용됨');
if(!html.includes('lang=\"ko\"')) throw new Error('lang=ko 아님');
if(!html.includes('og:image')) throw new Error('OG 태그 없음');
console.log('JSON-LD 검증 통과:',types.join(', '));
"
npm test
```

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "feat: SEO 메타와 JSON-LD 레이어

Organization/BlogPosting/BreadcrumbList/WebSite 스키마 적용.
Person 스키마는 쓰지 않는다(개인정보 비노출). lang=ko 수정(D3)."
```

---

## Task 11: OG 이미지 자동 생성

**Files:**
- Create: `src/pages/og/[...slug].png.ts`
- Create: `public/images/og-default.png`
- Modify: `package.json`

**Interfaces:**
- Consumes: `getAllPosts` (Task 5), `getSection`/`getHub` (Task 6)
- Produces: `/og/YYYY/MM/DD/slug/index.png` 146개. `Post.astro`가 참조하는 `ogImage` 경로와 일치해야 한다.

- [ ] **Step 1: satori와 렌더러 설치**

```bash
npm install --save-dev satori@^0.33.4 @resvg/resvg-js@^2
```

- [ ] **Step 2: 폰트 준비**

Pretendard 서브셋을 내려받아 `src/assets/fonts/`에 둔다.

```bash
mkdir -p src/assets/fonts
curl -sL -o src/assets/fonts/Pretendard-Bold.otf \
  https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/public/static/Pretendard-Bold.otf
curl -sL -o src/assets/fonts/Pretendard-Regular.otf \
  https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/public/static/Pretendard-Regular.otf
ls -la src/assets/fonts
```

기대: 두 파일이 각각 수백 KB 이상. 0바이트면 URL이 바뀐 것이므로 Pretendard 릴리스에서 최신 경로를 확인해 교체한다.

- [ ] **Step 3: OG 이미지 엔드포인트 작성**

`src/pages/og/[...slug].png.ts`:

```ts
import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { getAllPosts, permalinkToParam } from "../../lib/posts";
import { getSection, getHub } from "../../lib/taxonomy";

const bold = readFileSync("src/assets/fonts/Pretendard-Bold.otf");
const regular = readFileSync("src/assets/fonts/Pretendard-Regular.otf");

export async function getStaticPaths() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    params: { slug: `${permalinkToParam(post.data.permalink)}/index` },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Awaited<ReturnType<typeof getAllPosts>>[number] };
  const section = getSection(post.data.section);
  const hub = getHub(post.data.section, post.data.hub);
  const label = [section?.label, hub?.label].filter(Boolean).join(" · ");

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: 1200, height: 630, display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "72px",
          background: "#0f1216", color: "#e6e9ee", fontFamily: "Pretendard",
        },
        children: [
          {
            type: "div",
            props: { style: { fontSize: 28, color: "#6ea3ff", fontWeight: 400 }, children: label },
          },
          {
            type: "div",
            props: {
              style: { fontSize: 60, fontWeight: 700, lineHeight: 1.3, maxHeight: 320, overflow: "hidden" },
              children: post.data.title,
            },
          },
          {
            type: "div",
            props: {
              style: { display: "flex", justifyContent: "space-between", fontSize: 26, color: "#9aa4b2" },
              children: [
                { type: "div", props: { children: "CodeNexus" } },
                { type: "div", props: { children: post.data.date.toLocaleDateString("ko-KR") } },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: regular, weight: 400, style: "normal" },
      ],
    },
  );

  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
```

- [ ] **Step 4: 기본 OG 이미지 생성**

홈·섹션·About이 쓸 기본 이미지를 한 번 만들어 `public/images/og-default.png`로 둔다.

```bash
node -e "
const satori=require('satori').default||require('satori');
const {Resvg}=require('@resvg/resvg-js');
const fs=require('fs');
(async()=>{
  const bold=fs.readFileSync('src/assets/fonts/Pretendard-Bold.otf');
  const svg=await satori({type:'div',props:{style:{width:1200,height:630,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',background:'#0f1216',color:'#e6e9ee',fontFamily:'Pretendard'},children:[
    {type:'div',props:{style:{fontSize:84,fontWeight:700},children:'CodeNexus'}},
    {type:'div',props:{style:{fontSize:32,color:'#9aa4b2',marginTop:20},children:'백엔드 · 아키텍처 · AI 기술 블로그'}}
  ]}},{width:1200,height:630,fonts:[{name:'Pretendard',data:bold,weight:700,style:'normal'}]});
  fs.writeFileSync('public/images/og-default.png',new Resvg(svg,{fitTo:{mode:'width',value:1200}}).render().asPng());
  console.log('og-default.png 생성');
})();
"
```

- [ ] **Step 5: 빌드하고 OG 이미지 검증**

```bash
npm run build
node -e "
const fs=require('fs');
if(!fs.existsSync('dist/og/2019/04/12/jpa-1-n-mapping/index.png')) throw new Error('OG 이미지 없음');
const size=fs.statSync('dist/og/2019/04/12/jpa-1-n-mapping/index.png').size;
if(size<5000) throw new Error('OG 이미지가 비정상적으로 작음: '+size);
const html=fs.readFileSync('dist/2019/04/12/jpa-1-n-mapping/index.html','utf8');
if(!html.includes('/og/2019/04/12/jpa-1-n-mapping/index.png')) throw new Error('og:image 경로 불일치');
console.log('OG 이미지 검증 통과:',size,'bytes');
"
npm test
```

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: 포스트별 OG 이미지 빌드 타임 자동 생성

satori로 제목·섹션·날짜가 박힌 1200x630 PNG를 146편 전부 생성."
```

---

## Task 12: sitemap · robots · RSS 고정 경로

Task 1의 `고정 경로가 존재해야 한다` 테스트를 통과시킨다.

**Files:**
- Create: `src/pages/feed.xml.ts`, `src/pages/rss2.xml.ts`
- Modify: `astro.config.mjs`
- Delete: `feed.xml`, `rss2.xml`, `sitemap.xml`, `search.json`, `index.html`, `404.html`, `Gemfile`, `_config.yml`, `_posts/`, `_includes/`, `_layouts/`, `_sass/`, `_pages/`, `_drafts/`, `js/`, `fonts/`

**Interfaces:**
- Consumes: `getAllPosts` (Task 5), `SITE` (Task 10)
- Produces: `/feed.xml`, `/rss2.xml`, `/sitemap.xml`(통합 플러그인 생성)

- [ ] **Step 1: RSS 엔드포인트 작성**

`src/pages/feed.xml.ts`:

```ts
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getAllPosts } from "../lib/posts";
import { SITE } from "../lib/seo";

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: SITE.url,
    customData: "<language>ko-kr</language>",
    items: posts.slice(0, 50).map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: post.data.permalink,
      categories: post.data.tags,
    })),
  });
};
```

`src/pages/rss2.xml.ts` — 기존 경로 호환용. 같은 내용을 재사용한다:

```ts
export { GET } from "./feed.xml";
```

- [ ] **Step 2: 사이트맵 엔드포인트 직접 작성**

`@astrojs/sitemap`은 쓰지 않는다. 이 플러그인의 출력 파일명은 `filenameBase` 옵션으로만 조절되고 결과는 항상 `<filenameBase>-index.xml`이라, 기존 경로인 `/sitemap.xml`을 만들 수 없다. 게다가 스펙 §5.7이 요구하는 **`lastmod` = git 커밋 시각**을 지원하지 않는다. 직접 만든다.

`src/pages/sitemap.xml.ts`:

```ts
import type { APIRoute } from "astro";
import { execFileSync } from "node:child_process";
import { getCollection } from "astro:content";
import { SITE } from "../lib/seo";
import { SECTIONS } from "../data/taxonomy";
import { getHubCounts, hubState } from "../lib/taxonomy";
import { getTagCounts, TAG_INDEX_THRESHOLD } from "../lib/posts";

/** 해당 파일의 마지막 커밋 시각. 실패하면 null을 돌려 date로 대체한다. */
function lastCommitDate(file: string): Date | null {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out ? new Date(out) : null;
  } catch {
    return null;
  }
}

interface Entry { loc: string; lastmod: Date; changefreq: string }

export const GET: APIRoute = async () => {
  const entries: Entry[] = [];

  const posts = await getCollection("posts");
  for (const post of posts) {
    if (post.data.noindex) continue;
    const file = `src/content/posts/${post.id}.md`;
    entries.push({
      loc: post.data.permalink,
      lastmod: lastCommitDate(file) ?? post.data.date,
      changefreq: "monthly",
    });
  }

  const newest = posts.reduce<Date>(
    (acc, p) => (p.data.date > acc ? p.data.date : acc),
    new Date(0),
  );

  entries.push({ loc: "/", lastmod: newest, changefreq: "daily" });
  entries.push({ loc: "/about/", lastmod: newest, changefreq: "monthly" });
  entries.push({ loc: "/tags/", lastmod: newest, changefreq: "weekly" });

  const counts = await getHubCounts();
  for (const section of SECTIONS) {
    const sectionPosts = posts.filter((p) => p.data.section === section.id && !p.data.noindex);
    // 글이 없는 섹션은 noindex이므로 사이트맵에서도 뺀다
    if (sectionPosts.length > 0) {
      entries.push({ loc: `/${section.id}/`, lastmod: newest, changefreq: "weekly" });
    }
    for (const hub of section.hubs) {
      // open 상태 허브만 색인 대상 (스펙 6.4)
      if (hubState(counts.get(`${section.id}/${hub.id}`) ?? 0) !== "open") continue;
      entries.push({ loc: `/${section.id}/${hub.id}/`, lastmod: newest, changefreq: "weekly" });
    }
  }

  for (const [tag, count] of await getTagCounts()) {
    if (count < TAG_INDEX_THRESHOLD) continue;
    entries.push({ loc: `/tags/${encodeURIComponent(tag)}/`, lastmod: newest, changefreq: "weekly" });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${new URL(e.loc, SITE.url).href}</loc>
    <lastmod>${e.lastmod.toISOString()}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
```

`/og/`, `/search/`, `/404`는 애초에 추가하지 않으므로 필터가 필요 없다. `noindex` 글과 닫힌 허브, 3편 미만 태그가 빠지는 것이 색인 정책(스펙 §6.4, §6.10)과 정확히 일치한다.

- [ ] **Step 3: Jekyll 잔재 제거**

Astro가 완전히 대체하므로 Jekyll 파일을 지운다. `_posts/`는 `src/content/posts/`로 이미 이전됐다. 이 단계에서 **jQuery CDN 로드(D8)**와 `ban-adblock.html`이 `_layouts`·`_includes`와 함께 사라진다 — Astro 레이아웃은 둘 다 참조하지 않는다.

```bash
git rm -r --cached _posts _includes _layouts _sass _drafts js fonts 2>/dev/null || true
git rm _config.yml Gemfile feed.xml rss2.xml sitemap.xml search.json index.html 404.html 2>/dev/null || true
rm -rf _posts _includes _layouts _sass _drafts _pages js fonts
git add -A
```

`_pages/tags.md`는 `src/pages/tags/`가 대체한다.

- [ ] **Step 4: 홈 라우트가 지워졌으므로 임시 홈을 만든다**

Task 13에서 제대로 만들기 전까지 빌드가 깨지지 않도록 최소 홈을 둔다.

`src/pages/index.astro`:

```astro
---
import Base from "../layouts/Base.astro";
import PostCard from "../components/PostCard.astro";
import { getAllPosts } from "../lib/posts";
import { SITE, absolute } from "../lib/seo";

const posts = (await getAllPosts()).slice(0, 15);
---

<Base title="백엔드 · 아키텍처 · AI 기술 블로그 | CodeNexus" description={SITE.description} canonical={absolute("/")}>
  <h1>최신 글</h1>
  {posts.map((post) => <PostCard post={post} />)}
</Base>
```

- [ ] **Step 5: 빌드하고 고정 경로 게이트 통과 확인**

```bash
npm run build && npm test
```

기대: `tests/url-parity.test.ts`의 **두 테스트 모두 통과**. `고정 경로가 존재해야 한다`가 이제 초록이어야 한다.

`dist/404.html`이 없다고 나오면 `src/pages/404.astro`가 `dist/404.html`로 나오는지 확인한다. Astro는 `format: "directory"`에서도 404는 파일로 출력한다.

- [ ] **Step 6: 사이트맵 내용 검증**

```bash
node -e "
const fs=require('fs');
const xml=fs.readFileSync('dist/sitemap.xml','utf8');
const locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
console.log('사이트맵 URL 수:',locs.length);
if(locs.some(u=>u.includes('/og/')||u.includes('/search/'))) throw new Error('색인 제외 대상이 사이트맵에 포함됨');
const map=require('./src/data/url-map.json');
const missing=map.filter(e=>!locs.includes('https://umanking.github.io'+e.url));
if(missing.length) throw new Error('사이트맵 누락 '+missing.length+'건: '+missing[0].url);
console.log('사이트맵 검증 통과: 146개 포스트 전부 포함');
"
```

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: RSS·사이트맵 고정 경로 확보 및 Jekyll 잔재 제거 (D8)

feed.xml/rss2.xml/sitemap.xml 경로 유지. URL 동일성 게이트 전체 통과."
```

---

## Task 13: 홈과 About

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/about.astro`

**Interfaces:**
- Consumes: `getAllPosts` (Task 5), `getNavTree`/`getHubCounts` (Task 6), `webSiteLd`/`organizationLd`/`itemListLd` (Task 10)
- Produces: 없음 (말단 페이지)

- [ ] **Step 1: 홈 작성**

인사말이 아니라 주제 선언이 h1에 온다(스펙 §7.2).

`src/pages/index.astro` 전체 교체:

```astro
---
import Base from "../layouts/Base.astro";
import PostCard from "../components/PostCard.astro";
import { getAllPosts } from "../lib/posts";
import { getNavTree } from "../lib/taxonomy";
import { SITE, absolute } from "../lib/seo";
import { organizationLd, webSiteLd, itemListLd } from "../lib/jsonld";

const all = await getAllPosts();
const latest = all.slice(0, 15);
const tree = (await getNavTree()).filter((s) => s.hubs.length > 0);

const jsonLd = [
  organizationLd(),
  webSiteLd(),
  itemListLd({
    name: "최신 글",
    items: latest.map((p) => ({ title: p.data.title, url: p.data.permalink })),
  }),
];
---

<Base
  title="백엔드 · 아키텍처 · AI 기술 블로그 | CodeNexus"
  description={SITE.description}
  canonical={absolute("/")}
  jsonLd={jsonLd}
>
  <section class="hero">
    <h1>백엔드 · 아키텍처 · AI 기술 블로그</h1>
    <p>
      실무에서 마주친 문제와 해결 과정을 한국어로 기록합니다.
      Spring · JPA · 데이터 · 인프라 {all.length}편과 매주 AI · 개발 뉴스 큐레이션.
    </p>
  </section>

  <section class="topics">
    <h2>주제별로 보기</h2>
    <div class="topics__grid">
      {tree.map((section) => (
        <div class="topics__card">
          <a class="topics__title" href={`/${section.id}/`}>{section.label}</a>
          <ul>
            {section.hubs.slice(0, 4).map((hub) => (
              <li><a href={`/${section.id}/${hub.id}/`}>{hub.label} <span>{hub.count}</span></a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>

  <section>
    <h2>최신 글</h2>
    {latest.map((post) => <PostCard post={post} />)}
  </section>
</Base>

<style>
  .hero { padding: var(--space-6) 0 var(--space-5); border-bottom: 1px solid var(--border); }
  .hero h1 { font-size: 2rem; line-height: 1.35; margin: 0 0 var(--space-3); }
  .hero p { color: var(--fg-muted); max-width: var(--measure); margin: 0; }
  .topics__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); }
  .topics__card { padding: var(--space-3); border: 1px solid var(--border); border-radius: 10px; }
  .topics__title { font-weight: 600; color: var(--fg); text-decoration: none; }
  .topics__card ul { list-style: none; padding: 0; margin: var(--space-2) 0 0; font-size: 0.9rem; }
  .topics__card li { padding: 3px 0; }
  .topics__card a { text-decoration: none; }
  .topics__card span { color: var(--fg-muted); font-size: 0.85em; }
</style>
```

- [ ] **Step 2: About 작성**

자기소개가 아니라 매체 소개다. 개인 식별 정보를 넣지 않는다(Global Constraints).

`src/pages/about.astro`:

```astro
---
import Base from "../layouts/Base.astro";
import { SECTIONS } from "../data/taxonomy";
import { getAllPosts } from "../lib/posts";
import { getHubCounts, hubState } from "../lib/taxonomy";
import { absolute } from "../lib/seo";
import { organizationLd, breadcrumbLd } from "../lib/jsonld";

const all = await getAllPosts();
const counts = await getHubCounts();
const sections = SECTIONS.map((s) => ({
  ...s,
  hubs: s.hubs
    .map((h) => ({ ...h, count: counts.get(`${s.id}/${h.id}`) ?? 0 }))
    .filter((h) => hubState(h.count) !== "closed"),
}));

const crumbs = [{ label: "홈", href: "/" }, { label: "소개" }];
const jsonLd = [organizationLd(), breadcrumbLd(crumbs)];
---

<Base
  title="CodeNexus 소개"
  description="CodeNexus는 아키텍처, 백엔드, 데이터, AI를 다루는 한국어 기술 매체입니다. 다루는 주제와 글을 쓰는 원칙을 소개합니다."
  canonical={absolute("/about/")}
  jsonLd={jsonLd}
>
  <div class="prose">
    <h1>CodeNexus 소개</h1>
    <p>
      CodeNexus는 아키텍처 · 백엔드 · 데이터 · AI를 다루는 한국어 기술 매체입니다.
      실무에서 마주친 문제와 해결 과정을 기록하고, 매주 AI · 개발 뉴스를 큐레이션합니다.
      2019년부터 {all.length}편을 발행했습니다.
    </p>

    <h2>다루는 주제</h2>
    <ul class="about__sections">
      {sections.map((section) => (
        <li>
          <a href={`/${section.id}/`}>{section.label}</a>
          <p>{section.description}</p>
          {section.hubs.length > 0 && (
            <p class="about__hubs">
              {section.hubs.map((hub, i) => (
                <>
                  {i > 0 && " · "}
                  <a href={`/${section.id}/${hub.id}/`}>{hub.label}</a>
                </>
              ))}
            </p>
          )}
        </li>
      ))}
    </ul>

    <h2>분류 체계</h2>
    <p>
      모든 글에는 유형과 난이도를 표기합니다.
      유형은 <strong>튜토리얼</strong>(따라 하면 되는 것),
      <strong>레퍼런스</strong>(문법과 API 사용법),
      <strong>트러블슈팅</strong>(문제와 해결),
      <strong>딥다이브</strong>(내부 동작 원리)로 나뉘며,
      난이도는 입문 · 중급 · 심화 세 단계입니다.
      허브 페이지의 학습 순서는 이 난이도를 기준으로 정렬됩니다.
    </p>

    <h2>글을 쓰는 원칙</h2>
    <ul>
      <li>실무에서 직접 겪은 문제와 해결 과정을 기록합니다.</li>
      <li>예제 코드는 실행해 보고 올리며, 실행 환경과 버전을 명시합니다.</li>
      <li>오류가 확인되면 본문을 수정하고 수정일을 표기합니다.</li>
      <li>
        AI · 개발 위클리 다이제스트는 자동으로 수집한 초안을 직접 검토하고 편집해서 발행합니다.
        사람의 검토를 거치지 않고 발행되는 글은 없습니다.
      </li>
    </ul>

    <h2>정정 · 제보</h2>
    <p>
      내용에 오류가 있거나 보완할 점이 있으면 각 글 하단의 댓글로 알려주세요.
      확인 후 본문을 수정하고 수정일을 갱신합니다.
    </p>
  </div>
</Base>

<style>
  .about__sections { list-style: none; padding: 0; }
  .about__sections > li { padding: var(--space-3) 0; border-bottom: 1px solid var(--border); }
  .about__sections > li > a { font-weight: 600; font-size: 1.05rem; }
  .about__sections p { margin: var(--space-1) 0 0; color: var(--fg-muted); font-size: 0.92rem; }
  .about__hubs a { color: var(--fg-muted); }
</style>
```

- [ ] **Step 3: 빌드하고 About 404가 해소됐는지 확인 (D2)**

```bash
npm run build
node -e "
const fs=require('fs');
if(!fs.existsSync('dist/about/index.html')) throw new Error('about 페이지 없음');
const html=fs.readFileSync('dist/about/index.html','utf8');
for(const s of ['아키텍처','백엔드','웹','데이터','인프라','AI','뉴스']){
  if(!html.includes(s)) throw new Error('섹션 링크 누락: '+s);
}
console.log('About 검증 통과: 7섹션 전부 링크됨');
"
npm test
```

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "feat: 홈과 About 페이지

홈 h1을 인사말에서 주제 선언으로 교체.
About을 매체 소개 + 섹션 안내로 구성해 /about 404를 해소(D2)."
```

---

## Task 14: 외부 이미지 로컬화

핫링크된 외부 이미지(D7)를 내려받아 `astro:assets`로 최적화한다. 원본 소실 위험과 LCP 저하를 함께 해소한다.

**Files:**
- Create: `scripts/localize-images.mjs`
- Create: `src/assets/posts/*` (다운로드 산출물)
- Modify: `src/content/posts/*.md`

**Interfaces:**
- Consumes: `src/content/posts/*.md` (Task 4)
- Produces: 프론트매터 `image`와 본문 `![](...)` 의 외부 URL이 `/images/posts/<hash>.<ext>` 로 치환된 상태. 다운로드 실패분은 `image-failures.txt`에 남는다.

- [ ] **Step 1: 현재 외부 이미지 실태 파악**

```bash
grep -ohE 'https?://[^ ")]+\.(png|jpg|jpeg|gif|webp|svg)' src/content/posts/*.md \
  | sed -E 's|https?://([^/]+)/.*|\1|' | sort | uniq -c | sort -rn
echo "총 외부 이미지 참조: $(grep -ohE 'https?://[^ ")]+\.(png|jpg|jpeg|gif|webp|svg)' src/content/posts/*.md | wc -l)"
```

여기서 나온 호스트 목록을 기록해 둔다. 다운로드 실패 시 어떤 호스트가 죽었는지 판단하는 근거가 된다.

- [ ] **Step 2: 로컬화 스크립트 작성**

`scripts/localize-images.mjs`:

```js
// 외부 이미지를 public/images/posts/로 내려받고 본문·프론트매터 경로를 치환한다.
// 실패는 치명적이지 않다. 원본 URL을 그대로 두고 리포트에 남긴다.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { createHash } from "node:crypto";

const DIR = "src/content/posts";
const OUT = "public/images/posts";
mkdirSync(OUT, { recursive: true });

const IMG_RE = /https?:\/\/[^\s")'<>]+?\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s")'<>]*)?/gi;

const cache = new Map();
const failures = [];

async function localize(url) {
  if (cache.has(url)) return cache.get(url);

  const hash = createHash("sha1").update(url).digest("hex").slice(0, 12);
  let ext = extname(new URL(url).pathname).toLowerCase().split("?")[0];
  if (!/^\.(png|jpe?g|gif|webp|svg)$/.test(ext)) ext = ".png";
  const filename = `${hash}${ext}`;
  const dest = join(OUT, filename);
  const local = `/images/posts/${filename}`;

  if (existsSync(dest)) {
    cache.set(url, local);
    return local;
  }

  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) throw new Error(`too small: ${buf.length}B`);
    writeFileSync(dest, buf);
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
```

- [ ] **Step 3: 스크립트 실행**

```bash
node scripts/localize-images.mjs
```

기대: 처리 개수와 실패 건수 출력. 3년 방치된 블로그이므로 일부 실패는 정상이다.

- [ ] **Step 4: 실패 목록 확인 후 처리**

```bash
cat image-failures.txt
echo "남은 외부 참조: $(grep -ohE 'https?://[^ \")]+\.(png|jpg|jpeg|gif|webp|svg)' src/content/posts/*.md | wc -l)"
```

실패한 이미지는 원본 URL이 그대로 남아 있다. 각 건에 대해 판단한다.
- 호스트가 살아 있고 일시적 실패면 스크립트를 다시 실행한다(캐시 덕분에 성공분은 재다운로드하지 않는다).
- 원본이 영구 소실됐으면 해당 마크다운에서 이미지 줄을 삭제한다. 깨진 이미지를 남기는 것보다 없는 편이 낫다.

- [ ] **Step 5: 빌드하고 검증**

```bash
npm run build
node -e "
const fs=require('fs');
const n=fs.readdirSync('public/images/posts').length;
console.log('로컬 이미지:',n,'개');
if(n===0) throw new Error('로컬화된 이미지가 없음');
console.log('이미지 로컬화 검증 통과');
"
npm test
```

- [ ] **Step 6: 리포트 정리 후 커밋**

```bash
rm image-failures.txt
git add -A
git commit -m "fix: 외부 핫링크 이미지 로컬화 (D7)

kakaocdn/githubusercontent 등에 걸린 이미지를 내려받아 자체 호스팅.
원본 소실 위험 제거 및 LCP 개선."
```

---

## Task 15: 사이트 내 검색 (Pagefind)

**Files:**
- Create: `src/pages/search.astro`
- Modify: `package.json`

**Interfaces:**
- Consumes: 빌드 산출물 `dist/` (Pagefind가 후처리로 인덱싱)
- Produces: `/search/` 페이지. `WebSite.SearchAction`의 `urlTemplate`(`/search/?q=`)과 일치해야 한다.

- [ ] **Step 1: 인덱싱 대상 지정**

Pagefind는 `data-pagefind-body`가 있으면 그 안만 인덱싱한다. `src/layouts/Post.astro`의 `<article>` 태그에 속성을 추가한다:

```astro
    <article class="post prose" data-pagefind-body>
```

메뉴·푸터·댓글이 검색 결과에 섞이는 것을 막는다.

- [ ] **Step 2: 검색 페이지 작성**

```astro
---
import Base from "../layouts/Base.astro";
import { absolute } from "../lib/seo";
---

<Base
  title="검색 | CodeNexus"
  description="CodeNexus의 모든 글을 검색합니다. Spring, JPA, JavaScript, MySQL 등 주제와 키워드로 찾아보세요."
  canonical={absolute("/search/")}
  noindex
>
  <h1>검색</h1>
  <div id="search"></div>

  <link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
  <script is:inline src="/pagefind/pagefind-ui.js"></script>
  <script is:inline>
    window.addEventListener("DOMContentLoaded", () => {
      const params = new URLSearchParams(location.search);
      new PagefindUI({
        element: "#search",
        showSubResults: true,
        showImages: false,
        translations: {
          placeholder: "검색어를 입력하세요",
          zero_results: "'[SEARCH_TERM]'에 대한 결과가 없습니다",
          many_results: "'[SEARCH_TERM]' 검색 결과 [COUNT]건",
          one_result: "'[SEARCH_TERM]' 검색 결과 1건",
        },
      });
      const q = params.get("q");
      if (q) {
        const input = document.querySelector("#search input");
        if (input) {
          input.value = q;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    });
  </script>
</Base>
```

검색 페이지 자체는 색인하지 않는다(`noindex`) — 검색 결과 페이지는 구글이 저품질로 취급한다.

- [ ] **Step 3: 빌드하고 인덱스 생성 확인**

```bash
npm run build
node -e "
const fs=require('fs');
if(!fs.existsSync('dist/pagefind/pagefind.js')) throw new Error('pagefind 인덱스 없음');
const files=fs.readdirSync('dist/pagefind');
console.log('pagefind 산출물:',files.length,'개');
const html=fs.readFileSync('dist/search/index.html','utf8');
if(!html.includes('noindex')) throw new Error('검색 페이지가 색인 대상');
console.log('검색 검증 통과');
"
```

`npm run build`가 `astro build && pagefind --site dist`이므로 별도 명령이 필요 없다.

- [ ] **Step 4: 로컬에서 검색 동작 확인**

```bash
npm run preview
```

`http://localhost:4321/search/?q=JPA`에서 결과가 나오는지 확인한다. dev 서버(`npm run dev`)에서는 Pagefind 인덱스가 없어 동작하지 않는다 — 반드시 `preview`로 확인한다.

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: Pagefind 기반 사이트 내 검색

빌드 타임 정적 인덱스라 서버가 필요 없다.
data-pagefind-body로 본문만 인덱싱하고 검색 페이지는 noindex 처리."
```

---

## Task 16: 애드센스 슬롯 통합

**Files:**
- Create: `src/components/AdSlot.astro`
- Modify: `src/layouts/Post.astro`, `src/pages/index.astro`

**Interfaces:**
- Consumes: 없음
- Produces: `AdSlot.astro` props — `{ slot: string; format?: "auto" | "fluid"; minHeight?: number; label?: string }`

- [ ] **Step 1: 광고 슬롯 컴포넌트 작성**

CLS를 막는 핵심은 `min-height` 예약이다. Auto ads를 쓰지 않는 이유가 여기에 있다.

`src/components/AdSlot.astro`:

```astro
---
interface Props {
  slot: string;
  format?: "auto" | "fluid";
  minHeight?: number;
  label?: string;
}
const { slot, format = "auto", minHeight = 280, label = "광고" } = Astro.props;
const client = "ca-pub-2431823363518805";
---

<aside class="ad" style={`min-height:${minHeight}px`} aria-label={label}>
  <span class="ad__label">{label}</span>
  <ins
    class="adsbygoogle"
    style={`display:block;min-height:${minHeight - 20}px`}
    data-ad-client={client}
    data-ad-slot={slot}
    data-ad-format={format}
    data-full-width-responsive="true"></ins>
  <script is:inline>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</aside>

<style>
  .ad {
    display: block;
    margin: var(--space-5) 0;
    padding-top: var(--space-2);
    border-top: 1px solid var(--border);
    /* min-height는 인라인으로 예약해 CLS를 억제한다 */
    contain: layout;
  }
  .ad__label { display: block; font-size: 0.72rem; color: var(--fg-muted); margin-bottom: var(--space-2); }
</style>
```

- [ ] **Step 2: 포스트 본문에 슬롯 배치**

`src/layouts/Post.astro`에서 `<slot />` 앞뒤로 배치한다. 스펙 §9의 배치 규칙 중 "본문 하단"과 "관련 글 앞"을 적용한다. 본문 중간 삽입은 마크다운 렌더 결과를 쪼개야 하므로 이번 범위에서 제외한다.

import 추가:

```astro
import AdSlot from "../components/AdSlot.astro";
```

본문 영역 교체:

```astro
      <SeriesNav post={post} />
      <slot />
      <AdSlot slot="9532678736" minHeight={300} />
      <RelatedPosts post={post} />
      <Comments />
```

- [ ] **Step 3: 홈 목록에 in-feed 슬롯 배치**

`src/pages/index.astro`의 최신 글 목록에서 5번째 뒤에 하나 넣는다:

```astro
  <section>
    <h2>최신 글</h2>
    {latest.map((post, i) => (
      <>
        <PostCard post={post} />
        {i === 4 && <AdSlot slot="9532678736" format="fluid" minHeight={240} />}
      </>
    ))}
  </section>
```

import를 추가한다:

```astro
import AdSlot from "../components/AdSlot.astro";
```

- [ ] **Step 4: 빌드하고 광고 배치 검증**

```bash
npm run build
node -e "
const fs=require('fs');
const html=fs.readFileSync('dist/2019/04/12/jpa-1-n-mapping/index.html','utf8');
if(!html.includes('ca-pub-2431823363518805')) throw new Error('애드센스 클라이언트 없음');
if(!html.includes('min-height:300px')) throw new Error('min-height 예약 없음');
const loaders=(html.match(/adsbygoogle\.js/g)||[]).length;
if(loaders!==1) throw new Error('로더 스크립트가 '+loaders+'개 — 1개여야 함');
const ads=fs.readFileSync('dist/ads.txt','utf8').trim();
if(ads!=='google.com, pub-2431823363518805, DIRECT, f08c47fec0942fa0') throw new Error('ads.txt 내용 변경됨');
console.log('애드센스 검증 통과: 로더 1개, min-height 예약, ads.txt 유지');
"
npm test
```

- [ ] **Step 5: CLS 실측**

```bash
npm run preview &
sleep 3
npx lighthouse http://localhost:4321/2019/04/12/jpa-1-n-mapping/ \
  --only-categories=performance,seo --quiet --chrome-flags="--headless" \
  --output=json --output-path=/tmp/lh.json
kill %1
node -e "
const r=require('/tmp/lh.json');
const cls=r.audits['cumulative-layout-shift'].numericValue;
const perf=r.categories.performance.score*100;
const seo=r.categories.seo.score*100;
console.log('CLS:',cls.toFixed(3),' Performance:',perf,' SEO:',seo);
if(cls>=0.1) throw new Error('CLS 기준 초과');
if(perf<95) throw new Error('Performance 95 미만');
if(seo<95) throw new Error('SEO 95 미만');
console.log('품질 게이트 통과');
"
```

기준 미달이면 광고 `minHeight`를 실제 렌더 높이에 맞게 조정하고 다시 측정한다. 로컬 측정값은 실제 광고가 채워지지 않은 상태이므로, 배포 후 PageSpeed Insights로 재확인이 필요하다.

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: 애드센스 슬롯 컴포넌트 통합

흩어져 있던 광고 include 4개를 AdSlot 하나로 통합.
Auto ads 대신 수동 배치 + min-height 예약으로 CLS 억제."
```

---

## Task 17: 개인정보 비노출 검증

Global Constraints의 비노출 원칙을 자동 테스트로 못박는다. 이후 누군가 실수로 되돌리면 빌드가 막힌다.

**Files:**
- Create: `scripts/scan-pii.mjs`
- Create: `tests/pii.test.ts`

**Interfaces:**
- Consumes: `dist/` 빌드 산출물, `src/content/posts/*.md`
- Produces: `scanPii(text: string): string[]` — 검출된 패턴 목록

- [ ] **Step 1: 스캔 규칙과 테스트 작성**

`tests/pii.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** 사이트 전역에 노출되면 안 되는 패턴 */
const FORBIDDEN: Array<[string, RegExp]> = [
  ["개인 Gmail", /umanking@gmail\.com/i],
  ["활동명 Andrew", /\bAndrew\b/],
  ["Hi! I'm 히어로 카피", /Hi!\s*I'?m/i],
  ["BackEnd Developer 직함", /BackEnd\s+Developer/i],
  ["buymeacoffee 개인 계정", /buymeacoffee\.com/i],
  ["Person 스키마", /"@type"\s*:\s*"Person"/],
  ["Universal Analytics", /UA-\d{4,}-\d+/],
];

/** 콘텐츠에 남아 있으면 사람이 확인해야 하는 패턴 (경고용) */
const REVIEW: Array<[string, RegExp]> = [
  ["이메일 주소", /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i],
  ["사내 호스트", /\.(?:internal|local|corp)\b/i],
  ["사설 IP", /\b(?:10|172|192)\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/],
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

describe.runIf(existsSync("dist"))("빌드 산출물 개인정보 비노출", () => {
  const files = walk("dist");

  it("HTML이 충분히 생성돼 있어야 한다", () => {
    expect(files.length).toBeGreaterThan(150);
  });

  for (const [label, re] of FORBIDDEN) {
    it(`${label}이(가) 노출되지 않아야 한다`, () => {
      const hits = files.filter((f) => re.test(readFileSync(f, "utf8")));
      expect(hits.slice(0, 5)).toEqual([]);
    });
  }
});

describe("콘텐츠 개인정보 검토 대상", () => {
  it("검토가 필요한 패턴을 목록으로 남긴다", () => {
    const dir = "src/content/posts";
    const findings: string[] = [];
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const text = readFileSync(join(dir, file), "utf8");
      for (const [label, re] of REVIEW) {
        const m = text.match(re);
        if (m) findings.push(`${file}: ${label} — ${m[0]}`);
      }
    }
    // 이 테스트는 실패시키지 않는다. 검토 대상을 드러내는 것이 목적이다.
    if (findings.length > 0) {
      console.warn("\n[개인정보 검토 필요]\n" + findings.join("\n") + "\n");
    }
    expect(Array.isArray(findings)).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행하고 실패 항목 확인**

```bash
npm run build && npm test
```

이 시점에 실패가 나오는 것이 정상이다. 실패한 항목을 하나씩 처리한다:
- `Andrew` / `Hi! I'm` / `BackEnd Developer` — 남아 있다면 마크다운 본문에 있는 것이다. 해당 파일에서 제거한다.
- `buymeacoffee` — `side-menu.html`은 이미 지웠으므로 본문에 있는 경우다. 제거한다.
- `UA-` — `_config.yml`을 지웠으므로 나오지 않아야 한다.

```bash
grep -rln "Andrew\|Hi! I'm\|BackEnd Developer\|buymeacoffee\|umanking@gmail" src/content/posts/ || echo "콘텐츠에는 없음"
```

- [ ] **Step 3: 검출된 항목 처리**

회고성 글 3편(`2020-07-…상반기`, `2021-07-…상반기`, `2021년 7월 월간리뷰`)을 직접 열어 개인 신상 서술을 확인한다.

```bash
grep -l "회고\|월간리뷰" src/content/posts/*.md | while read f; do echo "=== $f ==="; head -40 "$f"; done
```

각 글에 대해 판단한다.
- 문장 일부만 문제면 **그 문장만 수정**한다.
- 글 전체가 개인 신상이면 프론트매터에 `noindex: true`를 넣는다. **삭제하지 않는다** — URL이 사라지면 Global Constraints의 URL 불변 원칙과 충돌한다.

`noindex: true`를 넣은 글은 `getAllPosts()`가 걸러내므로 목록·사이트맵에서 빠지지만, `[...permalink].astro`의 `getStaticPaths`도 `getAllPosts()`를 쓰므로 **페이지 자체가 생성되지 않아 URL 게이트가 깨진다.** 따라서 라우트만 예외 처리한다.

`src/pages/[...permalink].astro`의 `getStaticPaths`를 수정한다:

```astro
export async function getStaticPaths() {
  // noindex 글도 URL은 살려 둔다 (Global Constraints: URL 불변)
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { permalink: permalinkToParam(post.data.permalink) },
    props: { post },
  }));
}
```

import를 바꾼다:

```astro
import { getCollection, render } from "astro:content";
import { permalinkToParam } from "../lib/posts";
```

같은 이유로 `src/pages/og/[...slug].png.ts`의 `getStaticPaths`도 `getCollection("posts")`를 쓰도록 바꾼다. 그러지 않으면 `noindex` 글의 `og:image`가 404가 된다.

```ts
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { slug: `${permalinkToParam(post.data.permalink)}/index` },
    props: { post },
  }));
}
```

- [ ] **Step 4: 재빌드하고 전체 게이트 통과 확인**

```bash
npm run build && npm test
```

기대: `빌드 산출물 개인정보 비노출` 전 항목 PASS + `URL 정본`/`빌드 산출물 URL 동일성` 유지.

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "test: 개인정보 비노출 자동 검증

Andrew/개인 Gmail/Person 스키마/UA 속성이 빌드 산출물에 나타나면 테스트가 실패한다.
noindex 글도 URL은 유지해 URL 불변 원칙을 지킨다."
```

---

## Task 18: 허브 FAQ와 읽기 경험 마감

스펙 §6.8의 FAQ와 §11의 읽기 진행 바·다크 모드 토글을 붙인다.

**Files:**
- Modify: `src/data/taxonomy.ts` (허브 2개에 FAQ 작성)
- Modify: `src/layouts/Hub.astro`, `src/pages/[section]/[hub]/index.astro`
- Create: `src/components/ThemeToggle.astro`, `src/components/ReadingProgress.astro`
- Modify: `src/components/Nav.astro`, `src/layouts/Post.astro`
- Modify: `src/lib/jsonld.ts`

**Interfaces:**
- Consumes: `Hub.faq` (Task 2 스키마 확장), `graph` (Task 10)
- Produces: `faqPageLd(items: FaqItem[]): object`

- [ ] **Step 1: FAQPage 스키마 빌더 추가**

`src/lib/jsonld.ts` 끝에 추가:

```ts
export function faqPageLd(items: Array<{ q: string; a: string }>) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
```

- [ ] **Step 2: 글이 가장 많은 허브 2개에 FAQ 작성**

`src/data/taxonomy.ts`의 `spring`, `jpa` 허브 정의에 `faq`를 추가한다. FAQ는 실제 검색 질의를 그대로 질문으로 쓰는 것이 핵심이다.

`backend` 섹션의 `spring` 허브:

```ts
      {
        id: "spring",
        label: "Spring · Spring Boot",
        description: "Spring 핵심 개념부터 실무 설정까지.",
        keywords: ["spring", "spring-boot", "springboot"],
        faq: [
          {
            q: "Spring과 Spring Boot는 무엇이 다른가요?",
            a: "Spring은 DI 컨테이너를 중심으로 한 프레임워크이고, Spring Boot는 그 위에서 자동 설정과 내장 서버, 의존성 묶음(starter)을 제공해 설정을 줄여 주는 도구입니다. Spring Boot를 쓴다고 Spring을 안 쓰는 것이 아니라, Spring을 더 적은 설정으로 쓰는 것입니다.",
          },
          {
            q: "빈 순환 참조(circular dependency)는 왜 생기고 어떻게 푸나요?",
            a: "두 빈이 생성자에서 서로를 주입받으면 어느 쪽도 먼저 만들어질 수 없어 발생합니다. 근본 해법은 책임을 분리해 의존 방향을 한쪽으로 정리하는 것이고, 불가피하면 setter 주입이나 @Lazy로 생성 시점을 늦출 수 있습니다.",
          },
          {
            q: "빈 주입은 생성자와 필드 중 어느 쪽이 좋나요?",
            a: "생성자 주입이 기본입니다. 필수 의존성이 누락되면 객체 생성 단계에서 바로 드러나고, 필드를 final로 둘 수 있어 불변성이 보장되며, 테스트에서 의존성을 직접 넣기도 쉽습니다.",
          },
        ],
      },
```

`backend` 섹션의 `jpa` 허브:

```ts
      {
        id: "jpa",
        label: "JPA · Hibernate",
        description: "연관관계 매핑, 영속성 컨텍스트, 성능 최적화.",
        keywords: ["jpa", "hibernate", "querydsl", "orm", "영속성"],
        faq: [
          {
            q: "연관관계의 주인은 무엇이고 어떻게 정하나요?",
            a: "외래 키를 실제로 관리하는 쪽이 연관관계의 주인입니다. 다대일 관계에서는 외래 키를 가진 다(N) 쪽이 주인이 되며, 반대편에는 mappedBy를 지정합니다. 주인이 아닌 쪽에서 값을 바꿔도 DB에 반영되지 않습니다.",
          },
          {
            q: "persist와 merge는 어떻게 다른가요?",
            a: "persist는 새 엔티티를 영속 상태로 만들고 그 인스턴스 자체가 관리됩니다. merge는 준영속·비영속 엔티티의 값을 복사한 새로운 영속 인스턴스를 반환하므로, 넘긴 객체가 아니라 반환된 객체를 써야 합니다.",
          },
          {
            q: "지연 로딩과 즉시 로딩 중 무엇을 써야 하나요?",
            a: "기본은 지연 로딩입니다. 즉시 로딩은 예상하지 못한 조인과 N+1 쿼리를 만들기 쉽습니다. 함께 조회해야 하는 구간은 fetch join이나 엔티티 그래프로 그 시점에만 명시적으로 해결합니다.",
          },
        ],
      },
```

- [ ] **Step 3: Hub 레이아웃에 FAQ 렌더 추가**

`src/layouts/Hub.astro`의 Props에 `faq`를 추가한다:

```ts
interface Props {
  title: string;
  pageTitle: string;
  description: string;
  lead: string;
  canonical: string;
  noindex?: boolean;
  posts: Post[];
  faq?: Array<{ q: string; a: string }>;
  jsonLd?: object[];
}
const { title, pageTitle, description, lead, canonical, noindex = false, posts, faq = [], jsonLd = [] } = Astro.props;
```

`<Base>` 태그에 `jsonLd={jsonLd}`를 넘기고, 전체 글 목록 앞에 FAQ 섹션을 넣는다:

```astro
    {faq.length > 0 && (
      <section class="hub__faq">
        <h2>자주 묻는 질문</h2>
        {faq.map((item) => (
          <details>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
    )}
```

스타일을 추가한다:

```css
  .hub__faq details { border-bottom: 1px solid var(--border); padding: var(--space-3) 0; }
  .hub__faq summary { cursor: pointer; font-weight: 600; }
  .hub__faq p { margin: var(--space-2) 0 0; color: var(--fg-muted); }
```

- [ ] **Step 4: 허브 페이지에서 FAQ와 JSON-LD 연결**

`src/pages/[section]/[hub]/index.astro`의 프론트매터에 추가:

```ts
import { organizationLd, breadcrumbLd, itemListLd, faqPageLd } from "../../../lib/jsonld";

const crumbs = [
  { label: "홈", href: "/" },
  { label: section.label, href: `/${section.id}/` },
  { label: hub.label },
];
const jsonLd = [
  organizationLd(),
  breadcrumbLd(crumbs),
  itemListLd({
    name: `${hub.label} 글 목록`,
    items: posts.map((p) => ({ title: p.data.title, url: p.data.permalink })),
  }),
  ...(hub.faq?.length ? [faqPageLd(hub.faq)] : []),
];
```

`<Hub>` 태그에 `faq={hub.faq ?? []}`와 `jsonLd={jsonLd}`를 추가한다.

- [ ] **Step 5: 다크 모드 토글 작성**

FOUC를 막으려면 `<head>`에서 미리 클래스를 심어야 한다. `src/components/BaseHead.astro` 끝에 인라인 스크립트를 추가한다:

```astro
<script is:inline>
  (() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") {
        document.documentElement.dataset.theme = saved;
      }
    } catch {}
  })();
</script>
```

`src/components/ThemeToggle.astro`:

```astro
<button class="theme" type="button" aria-label="다크 모드 전환" data-theme-toggle>
  <span aria-hidden="true">◐</span>
</button>

<script is:inline>
  document.addEventListener("click", (e) => {
    const btn = e.target instanceof Element ? e.target.closest("[data-theme-toggle]") : null;
    if (!btn) return;
    const root = document.documentElement;
    const isDark =
      root.dataset.theme === "dark" ||
      (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  });
</script>

<style>
  .theme { background: none; border: 1px solid var(--border); border-radius: 6px; color: var(--fg-muted); cursor: pointer; padding: 4px 10px; font-size: 0.95rem; }
  .theme:hover { color: var(--accent); border-color: var(--accent); }
</style>
```

`src/components/Nav.astro`의 `.nav__end` 안에 넣는다:

```astro
    <div class="nav__end">
      <a class="nav__link" href="/search/">검색</a>
      <a class="nav__link" href="/about/">소개</a>
      <ThemeToggle />
    </div>
```

import를 추가한다:

```astro
import ThemeToggle from "./ThemeToggle.astro";
```

- [ ] **Step 6: 읽기 진행 바 작성**

레이아웃을 밀지 않도록 `position: fixed`를 쓴다. CLS에 영향을 주지 않는다.

`src/components/ReadingProgress.astro`:

```astro
<div class="progress" role="presentation"><span data-progress></span></div>

<script is:inline>
  (() => {
    const bar = document.querySelector("[data-progress]");
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const ratio = max > 0 ? Math.min(1, scrollY / max) : 0;
      bar.style.transform = `scaleX(${ratio})`;
      ticking = false;
    };
    addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();
</script>

<style>
  .progress { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 60; pointer-events: none; }
  .progress span { display: block; height: 100%; background: var(--accent); transform: scaleX(0); transform-origin: 0 50%; }
</style>
```

`src/layouts/Post.astro`의 `<div class="layout">` 바로 앞에 `<ReadingProgress />`를 넣고 import를 추가한다.

- [ ] **Step 7: 빌드하고 검증**

```bash
npm run build
node -e "
const fs=require('fs');
const jpa=fs.readFileSync('dist/backend/jpa/index.html','utf8');
if(!jpa.includes('자주 묻는 질문')) throw new Error('FAQ 섹션 없음');
const ld=JSON.parse(jpa.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const types=ld['@graph'].map(n=>n['@type']);
if(!types.includes('FAQPage')) throw new Error('FAQPage 스키마 없음');
if(!types.includes('ItemList')) throw new Error('ItemList 스키마 없음');
const post=fs.readFileSync('dist/2019/04/12/jpa-1-n-mapping/index.html','utf8');
if(!post.includes('data-progress')) throw new Error('진행 바 없음');
if(!post.includes('data-theme-toggle')) throw new Error('테마 토글 없음');
console.log('검증 통과:',types.join(', '));
"
npm test
```

- [ ] **Step 8: Rich Results 확인**

배포 전 로컬 HTML의 JSON-LD를 추출해 구글 도구에 붙여 넣어 확인한다.

```bash
node -e "
const fs=require('fs');
const m=fs.readFileSync('dist/backend/jpa/index.html','utf8').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
fs.writeFileSync('/tmp/jsonld.json', m[1]);
console.log('추출: /tmp/jsonld.json');
"
cat /tmp/jsonld.json
```

https://search.google.com/test/rich-results 의 코드 탭에 붙여 넣어 오류가 없는지 확인한다.

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "feat: 허브 FAQ와 읽기 경험 마감

Spring/JPA 허브에 FAQ 작성 + FAQPage·ItemList 스키마 연결.
다크 모드 토글(FOUC 방지 인라인 스크립트)과 읽기 진행 바 추가."
```

---

## Task 19: GitHub Actions 배포와 계측 복구

마지막 태스크다. 배포 파이프라인을 붙이고 GA4를 연결한다.

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Consumes: `npm run build`, `npm test`
- Produces: GitHub Pages 배포 산출물

- [ ] **Step 1: 워크플로 작성**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - name: Build
        run: npm run build
        env:
          PUBLIC_GA4_ID: ${{ secrets.PUBLIC_GA4_ID }}

      # URL 동일성·개인정보 비노출 게이트. 실패하면 배포하지 않는다.
      - name: Verify
        run: npm test

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`npm test`를 빌드 뒤에 두는 것이 중요하다. `dist/`가 있어야 URL 동일성 게이트와 개인정보 게이트가 실행된다.

- [ ] **Step 2: 환경변수 예시 파일 작성**

`.env.example`:

```
# Google Analytics 4 측정 ID (G-XXXXXXXXXX)
# 로컬에서는 비워 두면 GA 스크립트가 삽입되지 않는다.
PUBLIC_GA4_ID=
```

`.gitignore`에 추가:

```bash
echo ".env" >> .gitignore
```

- [ ] **Step 3: README 갱신**

`README.md` 전체를 교체:

```markdown
# CodeNexus

Astro 기반 기술 블로그. https://umanking.github.io

## 개발

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro build + pagefind 인덱싱
npm run preview  # 빌드 결과 확인 (검색은 preview에서만 동작)
npm test         # URL 동일성 · 분류 · SEO · 개인정보 게이트
```

## 지켜야 할 것

- **URL을 바꾸지 않는다.** 정본은 `src/data/url-map.json`이며 `tests/url-parity.test.ts`가 검증한다.
- **개인 식별 정보를 넣지 않는다.** `tests/pii.test.ts`가 빌드 산출물을 검사한다.
- 새 글은 `src/content/posts/`에 추가한다. 프론트매터 스키마는 `src/content.config.ts` 참조.
- 허브는 글이 3편 모이면 자동으로 메뉴에 노출된다. 수동 설정이 필요 없다.

## 문서

- 설계: `docs/specs/2026-08-25-blog-seo-revamp-design.md`
- 구현 계획: `docs/plans/2026-08-25-astro-migration-seo-revamp.md`
```

- [ ] **Step 4: GitHub Pages 소스를 Actions로 전환**

레포 설정에서 수동으로 변경해야 한다. 사용자에게 요청한다.

```
GitHub → Settings → Pages → Build and deployment → Source를
"Deploy from a branch"에서 "GitHub Actions"로 변경
```

`gh` CLI로도 가능하다:

```bash
gh api -X POST repos/umanking/umanking.github.io/pages -f build_type=workflow 2>/dev/null \
  || gh api -X PUT repos/umanking/umanking.github.io/pages -f build_type=workflow
```

- [ ] **Step 5: GA4 시크릿 등록**

사용자가 GA4 속성을 만들어 측정 ID를 전달하면 등록한다.

```bash
gh secret set PUBLIC_GA4_ID --body "G-XXXXXXXXXX"
```

측정 ID가 아직 없으면 이 단계를 건너뛴다. `BaseHead.astro`가 값이 없을 때 스크립트를 넣지 않도록 이미 처리돼 있다.

- [ ] **Step 6: 전체 게이트 최종 확인**

```bash
npm run build && npm test
```

기대: 모든 테스트 통과.
- `URL 정본` 5개
- `빌드 산출물 URL 동일성` 2개
- `분류 체계` 4개 + `허브 오픈 판정` 3개
- `title 생성 규칙` 3개
- `빌드 산출물 개인정보 비노출` 8개

- [ ] **Step 7: 로컬 서버로 최종 육안 확인**

```bash
npm run preview
```

확인 목록:
- `/` — h1이 "백엔드 · 아키텍처 · AI 기술 블로그", 주제별 카드, 최신 글 15편
- `/backend/` — 하위 허브 4개 노출
- `/backend/jpa/` — 학습 순서 + 전체 글 목록
- `/ai/` — "준비 중" 안내, 메뉴에 하위 허브 없음
- `/about/` — 7섹션 링크, 개인 정보 없음
- `/search/?q=JPA` — 검색 결과
- `/2019/04/12/jpa-1-n-mapping/` — 브레드크럼, TOC, 관련 글, 댓글
- `/2020/03/09/java-comparable-comparator/` — UTC 시프트 URL
- 다크 모드 토글(시스템 설정 변경)로 색상 확인

- [ ] **Step 8: 커밋 및 배포**

```bash
git add -A
git commit -m "feat: GitHub Actions 배포 파이프라인과 GA4 연결

빌드 후 URL 동일성·개인정보 게이트를 통과해야만 배포된다.
UA-130245279-5 폐기하고 GA4로 전환(D13)."
git push origin master
```

- [ ] **Step 9: 배포 결과 확인**

```bash
gh run watch
```

배포 완료 후:

```bash
for u in / /about/ /backend/ /backend/jpa/ /2019/04/12/jpa-1-n-mapping/ \
         /2020/03/09/java-comparable-comparator/ /sitemap.xml /feed.xml /ads.txt /robots.txt; do
  printf "%-45s %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code}' https://umanking.github.io$u)"
done
```

기대: 전부 200.

- [ ] **Step 10: Search Console에 사이트맵 재제출**

사용자 작업이다.

```
Search Console → 색인 생성 → Sitemaps →
https://umanking.github.io/sitemap.xml 제출
```

기존에 제출돼 있어도 다시 제출해 재크롤을 유도한다.

---

## 이 계획에서 제외된 것

| 항목 | 이유 | 후속 |
|---|---|---|
| 위클리 다이제스트 파이프라인 | 독립 서브시스템. Actions cron + Claude API + PR 생성으로 구성 | 별도 계획 (스펙 §10) |
| 상위 20~30편 리라이팅 **(D11)** | GSC 데이터로 대상을 선정해야 함. 배포 후 데이터 확보가 선행된다. `Casecade` 오타와 영어 제목 3편도 여기서 처리 | 별도 계획 (스펙 §5.5) |
| 본문 중간 광고 삽입 | 마크다운 렌더 결과를 분할해야 해서 구조 변경이 큼 | 광고 수익 데이터를 보고 판단 |
| 커스텀 도메인 | 도메인 유지로 결정됨 (스펙 §2) | 필요 시 재검토 |

## 사용자가 직접 해야 하는 작업

| 작업 | 태스크 | 비고 |
|---|---|---|
| GA4 속성 생성 후 측정 ID 전달 | Task 19 Step 5 | 없으면 GA 스크립트가 삽입되지 않을 뿐 빌드는 통과 |
| GitHub Pages 소스를 Actions로 전환 | Task 19 Step 4 | 이걸 안 하면 배포가 반영되지 않는다 |
| Search Console 등록 확인 및 사이트맵 제출 | Task 19 Step 10 | 등록돼 있으면 성능 리포트를 받아 후속 계획에 사용 |
| AdSense 슬롯 ID 확인 | Task 16 | 기존 `9532678736` 재사용 가능 여부 |
| 회고성 글 3편의 개인정보 처리 방침 결정 | Task 17 Step 3 | 문장 수정 / `noindex` 중 선택 |
