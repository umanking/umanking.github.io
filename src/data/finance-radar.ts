export interface FinanceRadarItem {
  topic: "거시경제" | "물가" | "개별주" | "지수" | "ETF";
  date: string;
  title: string;
  signal: string;
  source: string;
  postHref: string;
  sourceHref: string;
}

/**
 * 원문 확인용 보조 피드 샘플. 독립 색인 페이지를 대량 생성하지 않고
 * 금융·투자 섹션 안에서만 빠르게 훑어볼 수 있게 한다.
 */
export const FINANCE_RADAR: readonly FinanceRadarItem[] = [
  {
    topic: "ETF",
    date: "2026-08-21",
    title: "QQQ 7월 월간 리뷰",
    signal: "7월 NAV -6.60% · 총보수 0.18%",
    source: "Invesco",
    postHref: "/2026/08/26/qqq-qqqm-etf-cost/",
    sourceHref: "https://www.invesco.com/qqq-etf/en/etf-insights/qqq-monthly-review.html",
  },
  {
    topic: "거시경제",
    date: "2026-08-19",
    title: "미 연준 7월 FOMC 의사록 공개",
    signal: "다음 정례회의 9월 15~16일",
    source: "Federal Reserve",
    postHref: "/2026/08/26/finance-market-briefing/",
    sourceHref: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
  },
  {
    topic: "물가",
    date: "2026-08-12",
    title: "미국 7월 소비자물가 발표",
    signal: "전월 +0.1% · 전년 +3.4%",
    source: "U.S. BLS",
    postHref: "/2026/08/26/finance-market-briefing/",
    sourceHref: "https://www.bls.gov/news.release/archives/cpi_08122026.htm",
  },
  {
    topic: "개별주",
    date: "2026-08-04",
    title: "AMD 2분기 실적 공시",
    signal: "매출 115억 달러 · 전년 대비 +50%",
    source: "SEC",
    postHref: "/2026/08/26/amd-earnings-stock-check/",
    sourceHref: "https://www.sec.gov/Archives/edgar/data/2488/000000248826000121/q22026991.htm",
  },
  {
    topic: "거시경제",
    date: "2026-07-16",
    title: "한국은행 기준금리 인상",
    signal: "2.50% → 2.75%",
    source: "한국은행",
    postHref: "/2026/08/26/korea-rate-hike-macro/",
    sourceHref: "https://www.bok.or.kr/portal/bbs/P0000559/view.do?menuNo=200690&nttId=11062942",
  },
  {
    topic: "지수",
    date: "2026-05-01",
    title: "Nasdaq 100 변경 방법론 적용",
    signal: "비금융 대형주 100개 · 수정 시가총액 가중",
    source: "Nasdaq",
    postHref: "/2026/08/26/kospi-vs-nasdaq100/",
    sourceHref: "https://indexes.nasdaqomx.com/docs/Methodology_NDX_Effective_May_1_2026.pdf",
  },
] as const;
