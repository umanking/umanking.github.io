import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
describe('ETF article charts', () => {
  for (const [id, slug, pair] of [['01','vflo-etf-vs-voo','voo'],['02','vflo-vs-schd','schd']]) {
    it(`preserves the ${pair} article URL and provides both static chart types`, () => {
      const html=readFileSync(`dist/2026/09/06/${slug}/index.html`,'utf8');
      for(const kind of ['performance','holdings']) {
        const image=`/images/2026-09-06-vflo-${id}/vflo-${pair}-${kind}.png`;
        expect(html).toContain(image); expect(existsSync(`dist${image}`)).toBe(true);
      }
      expect(html).toContain('aria-label="ETF 가격 차트"');
      expect(html).toContain('TradingView 가격 차트 열기');
      expect(html).toContain('31.19%'); expect(html).toContain('16.33%');
      expect(html).toContain('2026년 6월 30일');
      if(pair==='schd')expect(html).toContain('동일 시점의 집중도 비교는 아닙니다');
    });
  }
});
