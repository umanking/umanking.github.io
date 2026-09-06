import { describe, expect, it } from 'vitest';
import { newestPublishedFirst } from '../src/lib/post-order';
import { readFileSync } from 'node:fs';
const post=(permalink:string,firstPublishedAt?:string)=>({data:{permalink,date:new Date('2026-09-06'),firstPublishedAt:firstPublishedAt?new Date(firstPublishedAt):undefined}});
describe('first publication order',()=>{
  it('orders same-day releases by immutable first publication time',()=>{
    const early=post('/early/','2026-09-06T09:25:00+09:00');
    const late=post('/late/','2026-09-06T15:13:12+09:00');
    expect([early,late].sort(newestPublishedFirst)).toEqual([late,early]);
    expect(newestPublishedFirst({...early,updatedAt:new Date('2027-01-01')} as typeof early,late)).toBeGreaterThan(0);
  });
  it('falls back to original dates and breaks simultaneous ties deterministically',()=>{
    expect([post('/a/'),post('/z/')].sort(newestPublishedFirst)[0].data.permalink).toBe('/z/');
    expect([post('/old/'),post('/new/','2026-09-06T15:00:00Z')].sort(newestPublishedFirst)[0].data.permalink).toBe('/new/');
  });
  it('features the latest published ETF, not a preferred category',()=>{
    const html=readFileSync('dist/index.html','utf8');
    const first=html.match(/journal-card--feature[^>]*>\s*<a href="([^"]+)"/);
    expect(first?.[1]).toBe('/2026/09/06/vflo-vs-schd/');
    expect(html).toContain('가장 최근 발행한 글');
  });
});
