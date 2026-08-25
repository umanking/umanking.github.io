/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

// tests/taxonomy.test.ts가 src/lib/taxonomy.ts → src/lib/posts.ts를 거쳐
// astro:content 가상 모듈을 참조하므로, 순수 vitest가 아니라 Astro의 Vite
// 설정으로 테스트를 구동해야 한다.
export default getViteConfig({
  test: {},
});
