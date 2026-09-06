import { readFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
export const GET = () => new Response(new Uint8Array(new Resvg(readFileSync("public/brieflo-icon.svg"), { fitTo: { mode: "width", value: 192 } }).render().asPng()), { headers: { "Content-Type": "image/png" } });
