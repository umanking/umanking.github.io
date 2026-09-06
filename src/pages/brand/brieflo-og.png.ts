import { readFileSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
export const GET = async () => {
  const svg = await satori({ type: "div", props: { style: { width: 1200, height: 630, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#faf9f5", color: "#262b22", fontFamily: "Pretendard" }, children: [
    { type: "div", props: { style: { fontSize: 100, fontWeight: 700 }, children: "brieflo" } },
    { type: "div", props: { style: { fontSize: 46 }, children: "필요한 정보만, 흐름까지 명확하게." } },
    { type: "div", props: { style: { fontSize: 24, color: "#4c6037" }, children: "BRIEFLO · 브리플로 / LESS NOISE. MORE CLARITY." } },
  ] } }, { width: 1200, height: 630, fonts: [{ name: "Pretendard", data: readFileSync("src/assets/fonts/Pretendard-Bold.otf"), weight: 700 }, { name: "Pretendard", data: readFileSync("src/assets/fonts/Pretendard-Regular.otf"), weight: 400 }] });
  return new Response(new Uint8Array(new Resvg(svg).render().asPng()), { headers: { "Content-Type": "image/png" } });
};
