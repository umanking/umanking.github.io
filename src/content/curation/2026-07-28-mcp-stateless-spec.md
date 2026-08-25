---
title: "MCP 2026-07-28 스펙 — 프로토콜이 stateless로 바뀌었다"
url: "https://blog.modelcontextprotocol.io/posts/2026-07-28/"
source: "blog.modelcontextprotocol.io"
date: "2026-07-28"
section: "ai"
hub: "engineering"
media: "link"
comment: "핸드셰이크와 Mcp-Session-Id가 사라지고, 각 요청이 프로토콜 버전과 클라이언트 정보를 _meta에 직접 실어 보낸다. 세션 어피니티가 필요 없다는 뜻이라 라운드로빈 로드밸런서 뒤 아무 인스턴스로 요청이 떨어져도 된다. MCP 서버를 운영 중이라면 스티키 세션과 공유 스토리지를 걷어낼 수 있다. 인증 쪽도 조여졌는데 Dynamic Client Registration이 공식 deprecated되고 CIMD로 대체됐으니, 클라이언트 등록 방식을 쓰고 있다면 확인이 필요하다."
tags: ["mcp", "프로토콜", "인증"]
---

스펙 문서에서 실무에 바로 걸리는 항목만 골라 정리한다.

- **Multi Round-Trip Requests(MRTR)** — 스트림을 열어 두지 않고 확인·추가 입력을 받는다. 서버가 `input_required`를 돌려주고 클라이언트가 답을 모아 재시도하는 구조다.
- **캐시 가능한 list 결과** — `ttlMs`와 `cacheScope`가 생겼다. 도구 목록을 매번 다시 받던 비용이 줄어든다.
- **헤더 기반 라우팅** — 게이트웨이가 `Mcp-Method`, `Mcp-Name` 헤더만 보고 라우팅한다. 본문 JSON을 파싱하지 않아도 된다.
- **인증** — 인증 서버가 RFC 9207의 `iss`를 반환해야 하고, 클라이언트는 코드 교환 전에 검증해야 한다. 클라이언트 자격증명은 발급한 issuer에 묶인다.

기능 수명 정책도 함께 도입됐다. Active → Deprecated → Removed 단계를 거치고, deprecated에서 제거까지 최소 12개월을 보장한다.
