import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/posts";
const files = readdirSync(DIR).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
const read = (f: string) => readFileSync(join(DIR, f), "utf8");

// 이미지 픽셀 PII에 대한 주의사항 (2026-08-25, 이미지 개인정보 전수 점검 작업)
// -----------------------------------------------------------------------------
// 이 테스트 파일은 마크다운/HTML "텍스트"만 정규식으로 검사한다. 이미지 파일
// (public/images/posts/*) 픽셀 안에 렌더링된 텍스트·얼굴·장소는 이 자동화로는
// 절대 잡히지 않는다 — 스크린샷 속 계정명, 터미널 캡처 속 홈 디렉터리 경로,
// 사진 속 얼굴/방 배경 등은 grep으로 걸러지지 않으므로 반드시 사람이 육안으로
// 열어봐야 한다. 새 이미지를 posts에 추가할 때는 Read 도구 등으로 실제 픽셀을
// 열어 다음을 확인할 것: 터미널/IDE 스크린샷의 계정명·파일 경로, 브라우저
// 북마크바/탭/URL의 개인 계정, 이메일·실명(한글 "앤드류" 포함)·전화번호,
// 얼굴·개인 공간(집/방/책상), 회사명(zigbang/직방 등), API 키/토큰/비밀번호.
//
// 이번 점검(120개 전수 육안 확인)에서 다음 6장을 삭제했다:
//   - 3a3c751290ea.png : 터미널 캡처에 /Users/andrew/.ssh 경로 노출
//   - 3d01ca89e833.jpg, 12d77015a8d1.jpg : 저자 자택 책상/방 사진
//   - 535547844de8.png, 18b9272f22d7.png : 키체인 접근 화면에 GitHub 계정
//     "umanking" 노출 (사용자 결정으로 전부 제거)
//   - e856bf1189e9.png, 2a2db09797c7.png : Feedly 스크린샷에 한글 실명
//     "앤드류의 기술블로그" 노출
// 그 외 "umanking" 계정명만 단독으로 등장하는 IDE/DockerHub/Trello 스크린샷
// 몇 장은 이미 이 블로그의 공개 핸들(도메인)과 동일한 정보라 판단해 남겨두고
// 사람 판단용으로 별도 보고했다 — 위 DEFERRED_* 카운터가 다루는 텍스트 링크와
// 같은 맥락이다.

// 스펙 §7.0 감수 범위 — 사용자가 "나중에 판단"으로 보류한 예외.
// 지금 실패로 만들지 않되, 건수가 조용히 늘어나면 알아챌 수 있도록 고정한다.
const DEFERRED_EXAMPLE_REPO_LINKS = 10; // github.com/umanking/... 예제 저장소 링크
const DEFERRED_MEDIUM_LINKS = 1; // medium.com/@umanking 링크

describe("본문 개인정보 비노출", () => {
  it("로컬 홈 경로에 사용자명이 남아 있지 않다", () => {
    const hits = files.filter((f) => /\/Users\/andrew/i.test(read(f)));
    expect(hits).toEqual([]);
  });

  it("개인 이메일이 남아 있지 않다", () => {
    const hits = files.filter((f) => /umanking@|andrew@/i.test(read(f)));
    expect(hits).toEqual([]);
  });

  it("이메일 자리표시자 외의 실이메일 패턴이 남아 있지 않다", () => {
    // 더미 이메일은 user@example.com으로 치환된 상태다. 그 외 도메인의
    // 이메일이 등장하면(실제 개인 이메일일 가능성) 실패해야 한다.
    const offenders: string[] = [];
    for (const f of files) {
      const matches = read(f).match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? [];
      for (const m of matches) {
        if (!/@example\.com$/i.test(m)) offenders.push(`${f}: ${m}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("실명 성씨가 남아 있지 않다", () => {
    const hits = files.filter((f) => /\$\{andrew\.name\} Han/i.test(read(f)));
    expect(hits).toEqual([]);
  });

  it("성씨 Han이 독립된 단어로 등장하지 않는다", () => {
    // 위 테스트보다 넓은 패턴이다: 특정 템플릿 리터럴이 아니라 "Han"이라는
    // 단어 자체가 인명으로 쓰이는 모든 경우를 잡는다.
    const offenders: string[] = [];
    for (const f of files) {
      for (const line of read(f).split("\n")) {
        if (/\bHan\b/.test(line)) offenders.push(`${f}: ${line.trim().slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("andrew는 github.com/umanking 링크 맥락에서만 허용된다", () => {
    const offenders: string[] = [];
    for (const f of files) {
      for (const line of read(f).split("\n")) {
        if (!/andrew/i.test(line)) continue;
        // 예제 저장소 링크와 자기 블로그 내부 링크는 유지 대상이다 (결정 3)
        if (/github\.com\/umanking|umanking\.github\.io/i.test(line)) continue;
        offenders.push(`${f}: ${line.trim().slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("경력 연차 표현이 등장하지 않는다", () => {
    const offenders: string[] = [];
    for (const f of files) {
      const m = read(f).match(/\d+\s*년\s*차/);
      if (m) offenders.push(`${f}: ${m[0]}`);
    }
    expect(offenders).toEqual([]);
  });

  it("소속 회사명이 남아 있지 않다", () => {
    const hits = files.filter((f) => /직방|zigbang/i.test(read(f)));
    expect(hits).toEqual([]);
  });

  it("buymeacoffee 개인 계정이 남아 있지 않다", () => {
    const hits = files.filter((f) => /buymeacoffee\.com/i.test(read(f)));
    expect(hits).toEqual([]);
  });

  it('Universal Analytics 속성이 남아 있지 않다', () => {
    const hits = files.filter((f) => /UA-\d{4,}-\d+/.test(read(f)));
    expect(hits).toEqual([]);
  });

  it("과거 히어로 카피/직함 문구가 남아 있지 않다", () => {
    const hits = files.filter((f) => /Hi!\s*I'?m|BackEnd\s+Developer/i.test(read(f)));
    expect(hits).toEqual([]);
  });
});

describe("보류된 감수 예외 — 건수 고정 (스펙 §7.0)", () => {
  it("github.com/umanking 예제 저장소 링크 건수", () => {
    let count = 0;
    for (const f of files) {
      count += (read(f).match(/github\.com\/umanking\//gi) ?? []).length;
    }
    // 이 값이 늘어나면 실패한다 — 늘어난 것 자체가 문제는 아니지만,
    // 조용히 늘어나지 않고 사람이 의식적으로 이 숫자를 갱신하게 만든다.
    expect(count).toBe(DEFERRED_EXAMPLE_REPO_LINKS);
  });

  it("medium.com/@umanking 링크 건수", () => {
    let count = 0;
    for (const f of files) {
      count += (read(f).match(/medium\.com\/@umanking/gi) ?? []).length;
    }
    expect(count).toBe(DEFERRED_MEDIUM_LINKS);
  });
});

// 소스 코드(JSON-LD 생성기 등)에 Person 스키마가 도입되지 않았는지 확인한다.
// dist가 없는 로컬 개발 환경에서도 동작하는 게이트다.
describe("소스 코드 개인정보 스키마 비노출", () => {
  const SRC_DIRS = ["src/lib", "src/components", "src/layouts", "src/pages"];

  function walkSrc(dir: string, out: string[] = []): string[] {
    if (!existsSync(dir)) return out;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walkSrc(p, out);
      else if (/\.(astro|ts|tsx|js)$/.test(entry.name)) out.push(p);
    }
    return out;
  }

  it('JSON-LD에 "@type": "Person"이 쓰이지 않는다', () => {
    const srcFiles = SRC_DIRS.flatMap((d) => walkSrc(d));
    const offenders = srcFiles.filter((f) =>
      /"@type"\s*:\s*"Person"/.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});

function walkDist(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walkDist(p, out);
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

describe.runIf(existsSync("dist"))("빌드 산출물 개인정보 비노출", () => {
  const distFiles = walkDist("dist");
  const readDist = (f: string) => readFileSync(f, "utf8");
  const postCount = files.length;

  it("HTML이 충분히 생성돼 있어야 한다", () => {
    // 글 수만큼의 글 페이지 + 허브/태그/섹션 페이지가 더해지므로 글 수보다는 많아야 한다.
    expect(distFiles.length).toBeGreaterThan(postCount);
  });

  it("로컬 홈 경로가 노출되지 않는다", () => {
    const hits = distFiles.filter((f) => /\/Users\/andrew/i.test(readDist(f)));
    expect(hits.slice(0, 5)).toEqual([]);
  });

  it("개인 이메일(umanking@/andrew@)이 노출되지 않는다", () => {
    const hits = distFiles.filter((f) => /umanking@|andrew@/i.test(readDist(f)));
    expect(hits.slice(0, 5)).toEqual([]);
  });

  it("이메일 자리표시자(user@example.com) 외의 이메일이 노출되지 않는다", () => {
    const offenders: string[] = [];
    for (const f of distFiles) {
      const matches = readDist(f).match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? [];
      for (const m of matches) {
        if (!/@example\.com$/i.test(m)) offenders.push(`${f}: ${m}`);
      }
    }
    expect(offenders.slice(0, 5)).toEqual([]);
  });

  it("andrew 핸들이 허용된 링크 맥락(github.com/umanking, umanking.github.io) 밖에서 노출되지 않는다", () => {
    const offenders: string[] = [];
    for (const f of distFiles) {
      for (const line of readDist(f).split("\n")) {
        if (!/\bandrew\b/i.test(line)) continue;
        if (/github\.com\/umanking|umanking\.github\.io|umanking\/umanking/i.test(line)) continue;
        offenders.push(`${f}`);
      }
    }
    expect(offenders.slice(0, 5)).toEqual([]);
  });

  it("실명 성씨 Han이 노출되지 않는다", () => {
    const hits = distFiles.filter((f) => /\bHan\b/.test(readDist(f)));
    expect(hits.slice(0, 5)).toEqual([]);
  });

  it('JSON-LD Person 스키마가 노출되지 않는다', () => {
    const hits = distFiles.filter((f) => /"@type"\s*:\s*"Person"/.test(readDist(f)));
    expect(hits.slice(0, 5)).toEqual([]);
  });

  it("buymeacoffee 개인 계정이 노출되지 않는다", () => {
    const hits = distFiles.filter((f) => /buymeacoffee\.com/i.test(readDist(f)));
    expect(hits.slice(0, 5)).toEqual([]);
  });

  it("Universal Analytics 속성이 노출되지 않는다", () => {
    const hits = distFiles.filter((f) => /UA-\d{4,}-\d+/.test(readDist(f)));
    expect(hits.slice(0, 5)).toEqual([]);
  });

  it("과거 히어로 카피/직함 문구가 노출되지 않는다", () => {
    const hits = distFiles.filter((f) => /Hi!\s*I'?m|BackEnd\s+Developer/i.test(readDist(f)));
    expect(hits.slice(0, 5)).toEqual([]);
  });

  it("경력 연차 표현이 노출되지 않는다", () => {
    const offenders: string[] = [];
    for (const f of distFiles) {
      const m = readDist(f).match(/\d+\s*년\s*차/);
      if (m) offenders.push(`${f}: ${m[0]}`);
    }
    expect(offenders.slice(0, 5)).toEqual([]);
  });

  it("소속 회사명이 노출되지 않는다", () => {
    const hits = distFiles.filter((f) => /직방|zigbang/i.test(readDist(f)));
    expect(hits.slice(0, 5)).toEqual([]);
  });
});
