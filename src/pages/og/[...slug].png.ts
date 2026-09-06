import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { getAllPosts, permalinkToParam } from "../../lib/posts";
import { getSection, getHub } from "../../lib/taxonomy";

const bold = readFileSync("src/assets/fonts/Pretendard-Bold.otf");
const regular = readFileSync("src/assets/fonts/Pretendard-Regular.otf");

export async function getStaticPaths() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    params: { slug: `${permalinkToParam(post.data.permalink)}/index` },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Awaited<ReturnType<typeof getAllPosts>>[number] };
  const section = getSection(post.data.section);
  const hub = getHub(post.data.section, post.data.hub);
  const label = [section?.label, hub?.label].filter(Boolean).join(" · ");

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: 1200, height: 630, display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "72px",
          background: "#0f1216", color: "#e6e9ee", fontFamily: "Pretendard",
        },
        children: [
          {
            type: "div",
            props: { style: { fontSize: 28, color: "#6ea3ff", fontWeight: 400 }, children: label },
          },
          {
            type: "div",
            props: {
              style: { fontSize: 60, fontWeight: 700, lineHeight: 1.3, maxHeight: 320, overflow: "hidden" },
              children: post.data.title,
            },
          },
          {
            type: "div",
            props: {
              style: { display: "flex", justifyContent: "space-between", fontSize: 26, color: "#9aa4b2" },
              children: [
                { type: "div", props: { children: "BRIEFLO" } },
                { type: "div", props: { children: post.data.date.toLocaleDateString("ko-KR") } },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: regular, weight: 400, style: "normal" },
      ],
    },
  );

  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  // Buffer를 그대로 넘기면 BodyInit 타입에 맞지 않는다. Uint8Array로 감싼다.
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
