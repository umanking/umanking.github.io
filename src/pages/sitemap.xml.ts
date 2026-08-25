import type { APIRoute } from "astro";
import { execFileSync } from "node:child_process";
import { SITE } from "../lib/seo";
import { SECTIONS } from "../data/taxonomy";
import { getListedPosts, getTagCounts, TAG_INDEX_THRESHOLD } from "../lib/posts";
import { getHubCounts, hubState } from "../lib/taxonomy";

/** 해당 파일의 마지막 커밋 시각. 커밋 이력이 없으면(예: 아직 추가되지 않음) null을 돌려 date로 대체한다. */
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

interface Entry {
  loc: string;
  lastmod: Date;
  changefreq: string;
}

export const GET: APIRoute = async () => {
  const entries: Entry[] = [];

  // noindex 글은 색인 대상이 아니므로 getListedPosts()로만 채운다.
  const posts = await getListedPosts();
  for (const post of posts) {
    const file = `src/content/posts/${post.id}.md`;
    entries.push({
      loc: post.data.permalink,
      lastmod: lastCommitDate(file) ?? post.data.date,
      changefreq: "monthly",
    });
  }

  const newest = posts.reduce<Date>((acc, p) => (p.data.date > acc ? p.data.date : acc), new Date(0));

  entries.push({ loc: "/", lastmod: newest, changefreq: "daily" });
  entries.push({ loc: "/tags/", lastmod: newest, changefreq: "weekly" });

  // 글이 하나도 없는 섹션은 noindex이므로 뺀다 (스펙 6.4)
  for (const section of SECTIONS) {
    const hasListedPost = posts.some((p) => p.data.section === section.id);
    if (!hasListedPost) continue;
    entries.push({ loc: `/${section.id}/`, lastmod: newest, changefreq: "weekly" });
  }

  // open 상태(3편 이상) 허브만 색인 대상 (스펙 6.4)
  const hubCounts = await getHubCounts();
  for (const section of SECTIONS) {
    for (const hub of section.hubs) {
      const count = hubCounts.get(`${section.id}/${hub.id}`) ?? 0;
      if (hubState(count) !== "open") continue;
      entries.push({ loc: `/${section.id}/${hub.id}/`, lastmod: newest, changefreq: "weekly" });
    }
  }

  // 3편 미만 태그는 noindex이므로 뺀다 (스펙 6.10)
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
