import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) => !data.noindex);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPostsByHub(section: string, hub: string): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => p.data.section === section && p.data.hub === hub);
}

export async function getPostsBySection(section: string): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => p.data.section === section);
}

/** permalink("/2019/04/12/foo/") → Astro rest 파라미터("2019/04/12/foo") */
export function permalinkToParam(permalink: string): string {
  return permalink.replace(/^\/|\/$/g, "");
}

/** 한글 기준 대략적인 읽기 시간(분). 분당 500자로 계산한다. */
export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(body.replace(/\s/g, "").length / 500));
}
