import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://umanking.github.io",
  trailingSlash: "always",
  build: { format: "directory" },
  // @astrojs/sitemap은 쓰지 않는다. 이 플러그인은 항상 `<filenameBase>-index.xml`을
  // 만들어 기존 경로 /sitemap.xml 을 재현할 수 없고, 스펙 5.7이 요구하는
  // "lastmod = git 커밋 시각"도 지원하지 않는다. Task 12에서 직접 구현한다.
  integrations: [mdx()],
  markdown: {
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" }, wrap: true },
  },
});
