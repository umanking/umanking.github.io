import { describe, expect, it } from 'vitest';
import { newestPublishedFirst } from '../src/lib/post-order';
import { readFileSync, readdirSync } from 'node:fs';
import matter from 'gray-matter';
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
  it('홈은 섹션과 관계없이 기존 글을 유지하고 최신 발행 순으로 노출한다',()=>{
    const posts = readdirSync('src/content/posts', { recursive: true })
      .filter((file): file is string => typeof file === 'string' && /\.mdx?$/.test(file))
      .map(file => matter(readFileSync(`src/content/posts/${file}`, 'utf8')).data)
      .filter(data => !data.noindex)
      .map(data => ({ data: { permalink: data.permalink as string,
        date: new Date(data.date), firstPublishedAt: data.firstPublishedAt ? new Date(data.firstPublishedAt) : undefined } }))
      .sort(newestPublishedFirst);
    expect(posts.length).toBeGreaterThan(0);
    const html=readFileSync('dist/index.html','utf8');
    expect(html).toContain(`href="${posts[0].data.permalink}"`);
    expect(html).toContain('최신 글');
    expect(html).toContain('금융·투자');
  });
});
