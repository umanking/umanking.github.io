---
title: "MCP stateless 전환, 서버 운영이 달라진다"
description: "MCP 2026-07-28 스펙이 핸드셰이크와 세션을 없앴다. 스티키 세션과 공유 스토리지를 걷어낼 수 있게 된 배경과, 인증 쪽에 숨은 마이그레이션 지뢰를 정리한다."
date: 2026-08-25
permalink: /2026/08/25/mcp-stateless-transition/
section: "ai"
hub: "engineering"
type: "deepdive"
level: "중급"
tags: ["mcp", "프로토콜", "인증", "아키텍처"]
---

MCP(Model Context Protocol)의 2026-07-28 스펙이 프로토콜의 성격 자체를 바꿨다. stateful 양방향에서 request/response로 옮겨간 것이다. "에이전트 프로토콜 업데이트" 정도로 넘기기 쉬운 소식인데, 실제로는 **서버를 어떻게 배포하고 어떤 인프라를 붙여야 하는지가 달라진다.**

## 무엇이 사라졌나

핸드셰이크와 세션이다.

기존에는 `initialize` / `initialized` 왕복으로 연결을 열고, 이후 요청에 `Mcp-Session-Id` 헤더를 실어 보냈다. 서버는 그 세션에 딸린 상태를 들고 있어야 했다.

새 스펙에서는 이 층이 없다. 각 요청이 스스로를 설명한다. 프로토콜 버전, 클라이언트 신원, 클라이언트 능력을 `_meta`에 직접 담아 보낸다.

결과가 인프라에 바로 걸린다. **요청이 라운드로빈 로드밸런서 뒤의 어느 인스턴스에 떨어져도 된다.** 공유 스토리지도 필요 없다.

## 인프라가 단순해지는 지점

MCP 서버를 운영 중이라면 다음 세 가지를 걷어낼 수 있다.

**스티키 세션.** ALB의 target group stickiness, nginx의 `ip_hash` 같은 설정이 세션 어피니티를 위해 들어가 있었다면 이제 불필요하다. 어피니티는 오토스케일링과 상성이 나쁘다. 인스턴스가 빠질 때 그 인스턴스에 묶인 세션이 함께 죽는다.

**세션 저장소.** 여러 인스턴스가 세션을 공유하려고 Redis를 두었다면 그 의존이 사라진다. 네트워크 왕복 하나와 운영 대상 하나가 줄어든다.

**열린 스트림.** 사용자에게 중간 입력을 받아야 하는 흐름(확인 요청, 추가 파라미터)에서 연결을 붙잡고 있어야 했다. 이건 **MRTR(Multi Round-Trip Requests)** 로 대체됐다. 서버가 `input_required`를 돌려주고, 클라이언트가 답을 모아 다시 호출한다. 스트림을 유지할 이유가 없어졌다.

여기에 두 가지가 더 붙었다.

- **캐시 가능한 list 결과** — `ttlMs`와 `cacheScope`가 생겼다. 도구 목록을 매 요청마다 다시 받던 비용이 줄어든다.
- **헤더 기반 라우팅** — 게이트웨이가 `Mcp-Method`와 `Mcp-Name` 헤더만 보고 라우팅한다. 본문 JSON을 파싱하지 않아도 된다. Spring Cloud Gateway나 nginx 레벨에서 메서드별 라우팅·레이트리밋을 걸 수 있다는 뜻이다.

## 실제로 옮긴 사례

Cloudflare가 8월 6일에 이 스펙을 런타임에 적용했다. Agents SDK의 `createMcpHandler`로 **Durable Objects 없이** MCP 서버를 평범한 HTTP 워크로드처럼 배포할 수 있게 됐다.

기술적 성취보다 **전환 설계**가 참고할 만하다.

`/mcp` 엔드포인트 하나가 신규 stateless 요청과 레거시 2025 요청을 **동시에 받는다.** 기존 세션 기반 서버를 강제로 끊지 않고, 활성 세션을 드레인시킨 뒤 deprecation 기간이 끝나면 레거시 경로를 제거한다.

프로토콜 버전을 갈아탈 때 하위 호환을 어떻게 설계하는지의 사례다. 클라이언트를 전부 통제할 수 없는 상황에서 서버만 먼저 옮겨야 할 때 쓸 수 있는 패턴이다.

발표에 따르면 2월부터 비공식 stateless 모드로 운영해 온 Code Mode MCP 서버가 초당 수천 요청 규모로 확장되며 수십억 건의 도구 호출을 처리했다고 한다.

## 인증 변경이 조용한 지뢰다

stateless 전환이 헤드라인이지만, 실제로 마이그레이션을 깨뜨릴 가능성이 높은 건 인증 쪽이다.

**Dynamic Client Registration이 공식 deprecated 됐다.** 대체는 CIMD(Client ID Metadata Documents)다. DCR로 클라이언트를 등록하는 흐름을 쓰고 있다면 교체 계획이 필요하다.

나머지 세 가지도 확인 대상이다.

1. **`iss` 검증 의무화** — 인증 서버가 RFC 9207에 따라 `iss` 파라미터를 반환해야 하고, 클라이언트는 **코드를 교환하기 전에** 이를 검증해야 한다.
2. **`application_type` 등록** — 클라이언트가 등록 시 이 값을 설정한다. localhost 리다이렉트 처리 문제를 풀기 위한 것이다.
3. **자격증명의 issuer 바인딩** — 클라이언트 자격증명이 발급한 issuer에 묶인다. 여러 인증 서버 간 재사용이 불가능해졌다.

Spring Security의 OAuth2 클라이언트를 쓰고 있다면 `iss` 검증이 사용 중인 버전에서 어떻게 처리되는지 확인해 볼 필요가 있다. 이 부분은 스펙 문서만으로는 판단할 수 없고 실제 동작을 봐야 한다.

## 지금 확인할 것

MCP 서버를 운영하거나 붙이려 한다면 순서대로 짚어볼 항목이다.

1. 로드밸런서에 세션 어피니티가 걸려 있는가 → 제거 가능한지 검토
2. 세션 상태를 Redis 등에 두고 있는가 → 의존 제거 가능한지 검토
3. elicitation을 스트림으로 처리하는가 → MRTR로 전환
4. 게이트웨이가 라우팅을 위해 본문을 파싱하는가 → `Mcp-Method` 헤더로 전환
5. **DCR을 쓰고 있는가 → CIMD 전환 계획 수립** (가장 시급)
6. 클라이언트가 코드 교환 전 `iss`를 검증하는가
7. 도구 목록 조회가 잦은가 → `ttlMs` 캐싱 적용

## 수명 정책이 함께 생겼다

이번 릴리스에 기능 수명 정책이 도입됐다. 모든 기능이 Active → Deprecated → Removed 단계를 거치고, **deprecated에서 실제 제거까지 최소 12개월을 보장한다.**

확장 프레임워크도 정식화됐다. Tasks, MCP Apps, EMA(Enterprise Managed Authorization)가 확장으로 들어갔다. 새 기능이 opt-in 확장으로 먼저 출시되고, 안정화된 뒤에야 — 그것도 필요하다면 — 코어 스펙에 편입된다.

프로토콜이 커널을 작게 유지하려는 방향으로 갔다는 뜻이다. 코어가 얇으면 구현체 간 호환성 문제가 줄어든다. MCP를 채택할 때의 리스크 계산이 조금 달라지는 지점이다.

## 참고 출처

- [The 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/) — Model Context Protocol Blog
- [The next generation of MCP](https://blog.cloudflare.com/mcp-v2/) — Cloudflare Blog, 2026-08-06
- [Unifying Workers AI and AI Gateway into a single AI control plane](https://blog.cloudflare.com/workers-ai-gateway-unification/) — Cloudflare Blog, 2026-08-07
