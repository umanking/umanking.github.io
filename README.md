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

## 배포

`master`에 push하면 `.github/workflows/deploy.yml`이 빌드 → 검증(`npm test`) → GitHub Pages 배포를 자동 실행한다. 검증에 실패하면 배포되지 않는다.

## 지켜야 할 것

- **URL을 바꾸지 않는다.** 정본은 `src/data/url-map.json`이며 `tests/url-parity.test.ts`가 검증한다.
- **개인 식별 정보를 넣지 않는다.** `tests/pii.test.ts`가 빌드 산출물을 검사한다.
- 새 글은 `src/content/posts/`에 추가한다. 프론트매터 스키마는 `src/content.config.ts` 참조.
- 허브는 글이 3편 모이면 자동으로 메뉴에 노출된다. 수동 설정이 필요 없다.
- 인라인 실행 JS 총합은 페이지당 2048B 이하로 유지한다.

## 문서

- 설계: `docs/specs/2026-08-25-blog-seo-revamp-design.md`
- 구현 계획: `docs/plans/2026-08-25-astro-migration-seo-revamp.md`
