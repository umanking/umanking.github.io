import fs from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY secret is required");

const model = process.env.OPENAI_MODEL || "gpt-5.6";
const today = new Date().toISOString().slice(0, 10);
const postsDir = path.resolve("src/content/posts");

const channels = [
  { section: "ai", hub: "llm", label: "기술·AI", focus: "AI 모델, 연구, 개발 도구 중 하나의 개별 이슈" },
  { section: "finance", hub: "macro", label: "금융·투자", focus: "금리, 물가, 환율, 지수, ETF, 기업 중 하나의 개별 이슈" },
  { section: "realestate", hub: "market-trends", label: "부동산", focus: "주택시장, 공급, 청약, 임대차 중 하나의 개별 이슈" },
  { section: "news", hub: "analysis", label: "뉴스·인사이트", focus: "AI를 제외한 기술·산업·사회 이슈 중 하나의 개별 사건과 맥락" },
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}

async function ask(channel) {
  const prompt = `오늘(${today}) 기준으로 ${channel.label}의 공식 자료를 검색해 독립 포스트 1편을 작성하라. 주제는 ${channel.focus} 중 하나로 고르고, 여러 뉴스를 묶지 말라. 반드시 정부·공공기관·거래소·운용사·기업의 공식 원문을 우선 확인하라. 발표일과 기준일을 구분하고, 사실과 해석을 나눠라. 본문은 제목/YAML을 제외하고 공백 포함 2,500~4,000자다. 개인의 매수·매도나 대출 실행을 권하지 말라. JSON 하나만 반환하라: {"title":string,"description":string,"slug":string,"tags":string[],"body":string,"sources":string[]}. body는 Markdown 본문만, sources는 실제 확인한 URL만 넣어라.`;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, tools: [{ type: "web_search" }], input: prompt }),
  });
  if (!response.ok) throw new Error(`OpenAI API ${response.status}: ${await response.text()}`);
  const data = await response.json();
  const text = data.output_text?.trim();
  if (!text) throw new Error("Model returned no output");
  const json = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
  if (!json.title || !json.description || !json.body || !Array.isArray(json.sources) || json.sources.length === 0) {
    throw new Error(`Invalid generated post for ${channel.section}`);
  }
  const count = [...json.body].length;
  if (count < 2500 || count > 4000) throw new Error(`${channel.section} body length ${count} is outside 2500-4000`);
  return { ...json, slug: slugify(json.slug || json.title) };
}

for (const channel of channels) {
  const post = await ask(channel);
  const file = path.join(postsDir, `${today}-${post.slug}.md`);
  try { await fs.access(file); throw new Error(`Post already exists: ${file}`); } catch (error) { if (error.code !== "ENOENT") throw error; }
  const frontmatter = [
    "---", `title: ${JSON.stringify(post.title)}`, `description: ${JSON.stringify(post.description)}`,
    `date: ${today}`, `permalink: /${today.replaceAll("-", "/")}/${post.slug}/`,
    `section: ${channel.section}`, `hub: ${channel.hub}`, "type: news", "level: 입문",
    `tags: [${post.tags.map((tag) => JSON.stringify(tag)).join(", ")}]`, "editorial:",
    "  authorship: ai-generated", "  reviewed: false", `  model: ${model}`, "  sources:",
    ...post.sources.map((source) => `    - ${source}`), "---", "", post.body.trim(), "",
  ].join("\n");
  await fs.writeFile(file, frontmatter, "utf8");
  console.log(`Generated ${file}`);
}
