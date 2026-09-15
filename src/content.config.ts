import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { POST_TYPES, POST_LEVELS, SECTION_IDS } from "./data/taxonomy";

export const postSchema = z.object({
    title: z.string().min(1),
    // 검색 스니펫에 그대로 쓰이므로 길이를 강제한다 (스펙 D5)
    description: z.string().min(20).max(150),
    date: z.coerce.date(),
    // Publisher-owned, immutable first publication time; absent for legacy dated entries.
    firstPublishedAt: z.coerce.date().optional(),
    // URL 정본. 파일명에서 유추하지 않는다 (Global Constraints 참조)
    permalink: z.string().regex(/^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/),
    section: z.enum(SECTION_IDS as [string, ...string[]]),
    hub: z.string().min(1),
    type: z.enum(POST_TYPES),
    level: z.enum(POST_LEVELS),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    marketSymbols: z.array(z.string().regex(/^(NASDAQ|AMEX|NYSE):[A-Z0-9.]+$/)).max(3).optional(),
    curation: z.object({
      sourceUrl: z.string().url(),
      sourceName: z.string().min(1).max(80),
      sourcePublishedAt: z.coerce.date().optional(),
      whyItMatters: z.string().min(10).max(240),
    }).optional(),
    noindex: z.boolean().default(false),
    /** AI 자동 발행 파이프라인의 투명성과 편집 검수 상태를 보존한다. */
    editorial: z.object({
      authorship: z.enum(["human", "ai-assisted", "ai-generated"]),
      reviewed: z.boolean().default(false),
      model: z.string().optional(),
      sources: z.array(z.string().url()).default([]),
    }).optional(),
    series: z.object({ name: z.string(), order: z.number().int().positive() }).optional(),
  }).superRefine((post, context) => {
    if (post.type === "brief" && !post.curation) {
      context.addIssue({ code: "custom", path: ["curation"], message: "Brief에는 원문과 선정 이유가 필요합니다." });
    }
  });

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: postSchema,
});


export const collections = { posts };
