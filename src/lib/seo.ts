/** GA4 측정 ID. 페이지 소스에 노출되는 공개 값이라 상수로 직접 둔다. */
export const GA4_ID = "G-JH1JXZKK0Y";

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
