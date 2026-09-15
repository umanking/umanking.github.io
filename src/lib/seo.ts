/** GA4 측정 ID. 페이지 소스에 노출되는 공개 값이라 상수로 직접 둔다. */
export const GA4_ID = "G-JH1JXZKK0Y";

export const SITE = {
  name: "BRIEFLO",
  url: "https://umanking.github.io",
  locale: "ko_KR",
  description:
    "AI와 소프트웨어를 만드는 사람에게 필요한 기술 원문, 구현 사례, 운영 교훈을 선별해 한국어로 설명합니다.",
} as const;

/** SERP는 한국어 기준 30~35자에서 잘린다. 제목이 길면 사이트명을 생략한다. */
export const TITLE_MAX = 30;

export function buildTitle(pageTitle: string): string {
  return pageTitle.length > TITLE_MAX ? pageTitle : `${pageTitle} | ${SITE.name}`;
}

export function absolute(path: string): string {
  return new URL(path, SITE.url).href;
}
