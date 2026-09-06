/** GA4 측정 ID. 페이지 소스에 노출되는 공개 값이라 상수로 직접 둔다. */
export const GA4_ID = "G-JH1JXZKK0Y";

export const SITE = {
  name: "BRIEFLO",
  url: "https://umanking.github.io",
  locale: "ko_KR",
  description:
    "건강·생활, 금융·혜택부터 기술·AI까지. 일상에 필요한 정보를 근거와 함께 읽기 쉽게 전하는 한국어 인사이트 저널입니다.",
} as const;

/** SERP는 한국어 기준 30~35자에서 잘린다. 제목이 길면 사이트명을 생략한다. */
export const TITLE_MAX = 30;

export function buildTitle(pageTitle: string): string {
  return pageTitle.length > TITLE_MAX ? pageTitle : `${pageTitle} | ${SITE.name}`;
}

export function absolute(path: string): string {
  return new URL(path, SITE.url).href;
}
