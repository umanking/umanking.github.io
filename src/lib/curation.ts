import { getCollection, type CollectionEntry } from "astro:content";
import { z } from "astro:content";
import { SECTION_IDS } from "../data/taxonomy";
import { getListedPosts, type Post } from "./posts";

export const curationSchemaShape = z
  .object({
    title: z.string().min(1),
    url: z.string().url(),
    source: z.string().min(1),
    date: z.coerce.date(),
    // Google Scaled Content Abuse 방어선. 하한을 낮추면 애드센스가 위험해진다.
    comment: z.string().min(80).max(400),
    section: z.enum(SECTION_IDS as [string, ...string[]]),
    hub: z.string().optional(),
    media: z.enum(["link", "image", "video"]).default("link"),
    // 로컬 경로만. 외부 이미지 직접 참조는 저작권·성능 양쪽에서 위험하다.
    thumbnail: z.string().regex(/^\/images\/curation\/[^/]+$/).optional(),
    thumbnailWidth: z.number().int().positive().optional(),
    thumbnailHeight: z.number().int().positive().optional(),
    youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/).optional(),
    tags: z.array(z.string()).default([]),
  })
  .refine((d) => d.media !== "video" || !!d.youtubeId, {
    message: "media가 video면 youtubeId가 필요하다",
    path: ["youtubeId"],
  })
  .refine((d) => d.media !== "image" || !!d.thumbnail, {
    message: "media가 image면 thumbnail이 필요하다",
    path: ["thumbnail"],
  })
  .refine((d) => !d.thumbnail || (!!d.thumbnailWidth && !!d.thumbnailHeight), {
    message: "CLS 방지를 위해 thumbnail에는 width/height가 함께 있어야 한다",
    path: ["thumbnailWidth"],
  });

export type CurationItem = CollectionEntry<"curation">;

export async function getCurationItems(): Promise<CurationItem[]> {
  const items = await getCollection("curation");
  return items.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export type FeedEntry =
  | { kind: "post"; date: Date; post: Post }
  | { kind: "curation"; date: Date; item: CurationItem };

export async function getMergedFeed(limit?: number): Promise<FeedEntry[]> {
  const [posts, items] = await Promise.all([getListedPosts(), getCurationItems()]);
  const merged: FeedEntry[] = [
    ...posts.map((post) => ({ kind: "post" as const, date: post.data.date, post })),
    ...items.map((item) => ({ kind: "curation" as const, date: item.data.date, item })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
  return limit ? merged.slice(0, limit) : merged;
}
