import fs from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY secret is required");

const model = process.env.OPENAI_MODEL || "gpt-5.6";
const today = new Date().toISOString().slice(0, 10);
const postsDir = path.resolve("src/content/posts");

const channels = [
  {
    section: "ai", label: "기술·AI", focus: "AI 모델, 연구, 개발 도구 중 하나의 개별 이슈",
    hubs: ["llm", "ai-coding", "rag", "engineering"],
    profile: "기술 분석가처럼 작동 원리, 실제 영향, 한계와 다음 확인 변수를 구분한다.",
  },
  {
    section: "finance", label: "금융·투자", focus: "금리, 물가, 환율, 지수, ETF, 기업 중 하나의 개별 이슈",
    hubs: ["macro", "forex", "indices", "etf", "stocks", "semiconductors", "personal-finance"],
    profile: "독립 리서치 애널리스트처럼 핵심 판단, 이전 발표·시장 예상과 비교, 전달 경로, 기본·대안 시나리오, 다음 지표와 위험 요인을 분석한다. 목표가와 매수·매도 의견은 쓰지 않는다.",
  },
  {
    section: "realestate", label: "부동산", focus: "주택시장, 공급, 청약, 임대차 중 하나의 개별 이슈",
    hubs: ["market-trends", "supply", "policy", "subscription", "rent", "reits"],
    profile: "주택시장·정책 전문가처럼 기준일과 지역 범위, 가격·거래·공급·금융의 교차 신호, 계획과 집행, 자격·일정·공식 신청 경로를 구분한다. 지역 매수 추천이나 당첨 가능성을 예측하지 않는다.",
  },
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}

async function ask(channel) {
  const prompt = `오늘(${today}) 기준으로 ${channel.label}의 공식 자료를 검색해 독립 포스트 1편을 작성하라. 주제는 ${channel.focus} 중 하나로 고르고, 여러 뉴스를 묶지 말라. 역할: ${channel.profile} 반드시 정부·공공기관·거래소·운용사·기업의 공식 원문을 우선 확인하라. 발표일과 기준일을 구분하고, 사실과 해석을 나눠라. 핵심 판단 뒤에 비교 기준, 전달 경로 또는 시장 의미, 반대 시나리오, 다음 체크포인트, 위험과 한계를 제시하라. 비교·추세·절차의 이해를 실제로 돕는 경우 Markdown 표나 Mermaid 도식을 사용하라. 본문은 제목/YAML을 제외하고 공백 포함 2,500~4,000자다. 개인의 매수·매도나 대출 실행을 권하지 말라. hub는 ${channel.hubs.join(", ")} 중 하나만 선택하라. JSON 하나만 반환하라: {"title":string,"description":string,"slug":string,"hub":string,"tags":string[],"body":string,"sources":string[]}. body는 Markdown 본문만, sources는 실제 확인한 URL만 넣어라.`;
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
  if (!json.title || !json.description || !json.body || !channel.hubs.includes(json.hub) || !Array.isArray(json.sources) || json.sources.length === 0) {
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
    `section: ${channel.section}`, `hub: ${post.hub}`, "type: deepdive", "level: 중급",
    `tags: [${post.tags.map((tag) => JSON.stringify(tag)).join(", ")}]`, "editorial:",
    "  authorship: ai-generated", "  reviewed: false", `  model: ${model}`, "  sources:",
    ...post.sources.map((source) => `    - ${source}`), "---", "", post.body.trim(), "",
  ].join("\n");
  await fs.writeFile(file, frontmatter, "utf8");
  console.log(`Generated ${file}`);
}
