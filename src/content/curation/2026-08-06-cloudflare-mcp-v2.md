---
title: "Cloudflare가 stateless MCP를 Workers에 올렸다"
url: "https://blog.cloudflare.com/mcp-v2/"
source: "blog.cloudflare.com"
date: "2026-08-06"
section: "ai"
hub: "engineering"
media: "link"
comment: "새 MCP 스펙을 실제 런타임에 적용한 사례다. Agents SDK의 createMcpHandler로 Durable Objects 없이 MCP 서버를 평범한 HTTP 워크로드처럼 배포할 수 있게 됐다. 정작 눈여겨볼 대목은 마이그레이션 전략이다. /mcp 엔드포인트가 신규 stateless 요청과 레거시 2025 요청을 동시에 받아서, 기존 세션 기반 서버를 강제로 끊지 않고 드레인시킨다. 프로토콜 버전을 갈아탈 때 하위 호환을 어떻게 설계하는지의 참고 사례로 볼 만하다."
tags: ["mcp", "cloudflare", "마이그레이션"]
---

인상적인 부분은 스펙 채택 속도가 아니라 **전환 설계**다.

기존 MCP 서버는 스티키 세션, 열린 스트림 유지, 메시지 리플레이를 관리해야 했다. 이제 그 층이 사라진다. 다만 이미 세션 기반으로 돌고 있는 서버를 어떻게 옮기느냐가 남는데, 여기서는 한 엔드포인트가 두 프로토콜을 동시에 수용하고 레거시 경로를 deprecation 기간 동안 유지하는 방식을 택했다.

스트림 기반 elicitation은 MRTR로 대체됐다. 사용자 입력을 중간에 받아야 하는 흐름에서 연결을 붙잡고 있을 필요가 없어졌다.

발표에 따르면 2월부터 비공식 stateless 모드로 운영해 온 Code Mode MCP 서버가 초당 수천 요청 규모로 확장되며 수십억 건의 도구 호출을 처리했다고 한다.
