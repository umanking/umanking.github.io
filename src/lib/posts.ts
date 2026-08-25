import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

/**
 * 모든 글. **페이지 생성용이다.**
 * noindex 글도 반드시 포함해야 한다 — URL 불변성(146개)이 여기에 달려 있다.
 * "색인하지 않는다"와 "페이지를 만들지 않는다"는 다른 이야기다.
 */
export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection("posts");
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** 목록·피드·사이트맵에 노출할 글. noindex 글은 제외한다. */
export async function getListedPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => !p.data.noindex);
}

export async function getPostsByHub(section: string, hub: string): Promise<Post[]> {
  return (await getListedPosts()).filter((p) => p.data.section === section && p.data.hub === hub);
}

export async function getPostsBySection(section: string): Promise<Post[]> {
  return (await getListedPosts()).filter((p) => p.data.section === section);
}

/** permalink("/2019/04/12/foo/") → Astro rest 파라미터("2019/04/12/foo") */
export function permalinkToParam(permalink: string): string {
  return permalink.replace(/^\/|\/$/g, "");
}

/** 한글 기준 대략적인 읽기 시간(분). 분당 500자로 계산한다. */
export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(body.replace(/\s/g, "").length / 500));
}
