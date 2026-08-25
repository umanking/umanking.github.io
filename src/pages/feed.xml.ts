import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getAllPosts } from "../lib/posts";
import { SITE } from "../lib/seo";

// 기존 Jekyll feed.xml과 동일하게 최근 150편을 담는다 (limit:150).
// 전체 글이 150편 미만이면 사실상 전체가 담긴다.
const FEED_LIMIT = 150;

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: SITE.url,
    customData: "<language>ko-kr</language>",
    items: posts.slice(0, FEED_LIMIT).map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: post.data.permalink,
      categories: post.data.tags,
    })),
  });
};
