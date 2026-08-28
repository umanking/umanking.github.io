# Editorial Studio — One Research, Multiple Editorial Products

- 작성일: 2026-08-27
- 상태: 진짜 ORMEP 중앙 파이프라인 구현 완료, 첫 실제 샘플 검수 전까지 자동 스케줄 중지, Meta 채널 보류
- 저장소: `/Users/andrew/dev/editorial-studio`
- 프로젝트 이름: `editorial-studio`

## 1. 결정 사항

기존 `osmu-blog` 저장소를 새 저장소로 분리하지 않고 `editorial-studio`로 개편했다.

Editorial Studio는 하나의 조사 결과를 여러 플랫폼에 복사하는 OSMU 도구가 아니다. 검증된 하나의 리서치 패키지에서 채널마다 독립적인 독자, 목적, 페르소나, 형식을 가진 편집 제품을 만드는 중앙 운영 시스템이다.

> One Research, Multiple Editorial Products

공유하는 것은 사실, 핵심 수치, 공식 출처, 시간적 맥락, 해석 가능한 범위, 불확실성과 반대 시나리오다. 제목, 도입부, 문단 순서, 길이, 말투, CTA와 플랫폼 관점은 공유하지 않는다.

새 저장소를 더 만들지 않는다.

- `editorial-studio`: 리서치, 편집 제품, 검수, 스케줄과 전체 실행 상태의 정본
- `umanking.github.io`: CodeNexus 장문 제품과 정적 사이트 발행기
- `blog-agent-studio`: 네이버 전용 콘텐츠 제품과 기존 브라우저 발행기
- Threads: Editorial Studio 내부 Meta API publisher
- Instagram: Editorial Studio 내부 카드 렌더러와 Meta API publisher

## 2. 브랜드 및 채널 방향

새 Instagram 프로페셔널 Creator 계정을 만들고 같은 계정으로 Threads를 연결한다. 두 플랫폼 모두 공식 Meta API 발행을 사용한다. 현재 별도의 호출당 API 요금은 없으며, 이미지 호스팅이나 외부 이미지 생성 서비스를 쓰는 경우에만 별도 비용이 생길 수 있다.

브랜드 후보 1순위:

- 브랜드: `Stack & Stock`
- 표시 이름: `Stack & Stock | AI·투자`
- 아이디 우선순위: `@stacknstock`, `@stack.and.stock`, `@stack_stock`, `@stacknstock.kr`
- 태그라인: `기술 스택과 자본시장을 함께 디버깅합니다.`
- 소개: `AI · 반도체 · 빅테크 · 매크로를 공식 자료로 읽습니다. 매수·매도 추천이 아닌 정보와 해설입니다.`

계정 생성 시 실제 아이디 사용 가능 여부를 Instagram에서 최종 확인한다.

### 공통 브랜드 정체성

AI와 자본의 흐름을 공식 자료로 확인하고 개인이 판단 가능한 형태로 번역한다.

### 채널별 편집 역할

- CodeNexus: 근거와 맥락을 끝까지 설명하는 분석가
- Threads: 변화에서 하나의 관점을 꺼내 대화를 시작하는 사람
- Instagram: 복잡한 숫자와 구조를 저장 가능한 시각 자료로 설명하는 편집자
- Naver: 계정별 검색 의도와 생활 문제를 해결하는 편집자

Threads와 Instagram은 CodeNexus 글의 요약본이 아니다. 동일한 `research_id`를 공유하는 독립 편집 제품이다.

## 3. 현재 자동화 감사 결과

### CodeNexus

- 저장소: `/Users/andrew/dev/umanking.github.io`
- 스크립트: `scripts/codex-daily-publish.sh`
- launchd 설정: 평일 09:40
- 동작: 기술·AI 2편, 금융·투자 2편, 부동산 2편 생성 → 테스트 → 빌드 → Git 커밋 → origin/master push
- GitHub Actions: master push 시 Astro 빌드, 테스트, GitHub Pages 배포
- 최근 로그에서 콘텐츠 발행 후 Telegram 알림 timeout 확인
- LaunchAgent plist는 저장소에 있으나 `~/Library/LaunchAgents`에서는 감사 당시 발견되지 않음

### Blog Agent Studio

- 위치: `/Users/andrew/dev/blog-agent-studio`
- Git 저장소가 아님
- launchd: `com.andrew.blog-agent-studio.daily`, 매일 09:35
- 동작: 네이버 2계정 × 계정당 3편 → 썸네일 → 당일 4시간 간격 예약 발행
- 계정 1: 50+ 건강·연금·디지털 생활
- 계정 2: 절세·ETF·증권·거시경제
- 기존 네이버 Playwright publisher와 로그인 프로필은 유지하고 Editorial Studio가 작업을 전달하는 방식으로 전환

### Editorial Studio

- 위치: `/Users/andrew/dev/editorial-studio`
- Git 저장소이나 remote 없음
- Python 기반 로컬 운영 시스템
- SQLite research/source/product/publication/run/event 모델 구현
- CodeNexus import, Threads·Instagram 제품, Meta dry-run publisher 구현
- Admin MVP와 중앙 launchd 초안 구현
- 기존 호환 테스트를 포함해 36개 테스트 통과

### 핵심 운영 문제

- CodeNexus와 Naver 자동화가 5분 간격으로 독립 실행된다.
- 양쪽 모두 금융·투자를 별도로 조사하여 주제와 비용이 중복될 수 있다.
- 공통 research ID, 출처 레지스트리, 전역 중복 검사, 검수 큐가 없다.
- 성공·실패·예약·발행 URL을 한 화면에서 볼 수 없다.
- 기존 자동화는 새 파이프라인이 end-to-end로 검증되기 전까지 중단하지 않는다.

## 4. 목표 파이프라인

```text
Topic Discovery
    ↓
Research Package
    ├─ facts
    ├─ sources
    ├─ claims
    ├─ uncertainties
    └─ assets
    ↓
Editorial Planning
    ├─ channel fit
    ├─ persona
    ├─ angle
    └─ format
    ↓
Independent Products
    ├─ CodeNexus article
    ├─ Naver account_1 article
    ├─ Naver account_2 article
    ├─ Threads post/thread
    └─ Instagram carousel
    ↓
Review Queue
    ↓
Schedule / Publish
    ↓
Result, URL, Metrics, Retry
```

Editorial Studio가 단 하나의 스케줄러가 된다. 각 채널 저장소의 기존 발행 기능은 publisher adapter로 유지한다.

## 5. 데이터 모델

초기에는 SQLite를 권장한다. JSONL은 append 이력에는 좋지만 Admin의 필터, 상태 전이, 재시도, 관계 조회가 어려워진다. Markdown과 렌더링 자산은 파일로 보존하고 상태 및 관계는 SQLite가 관리한다.

### Research

- `id`
- `topic`
- `category`: `ai`, `finance`, `real-estate`, `health`, `lifestyle`
- `summary`
- `as_of`
- `facts[]`
- `claims[]`
- `uncertainties[]`
- `counter_scenarios[]`
- `next_checkpoints[]`
- `source_ids[]`
- `status`: `discovered`, `researching`, `ready`, `rejected`

### Source

- `id`
- `research_id`
- `url`
- `publisher`
- `title`
- `published_at`
- `accessed_at`
- `source_type`: `primary`, `official-statistics`, `secondary`
- `supports[]`

### Editorial Product

- `id`
- `research_id`
- `channel`
- `account_id`
- `persona_id`
- `format`
- `angle`
- `content_path`
- `asset_paths[]`
- `status`: `planned`, `drafting`, `draft`, `review`, `approved`, `scheduled`, `published`, `failed`, `skipped`
- `reviewed_by`
- `reviewed_at`

### Publication

- `id`
- `product_id`
- `scheduled_at`
- `started_at`
- `published_at`
- `external_id`
- `external_url`
- `attempt_count`
- `status`
- `error_code`
- `error_message`

### Run / Event

모든 자동화 단계는 run과 event를 남긴다. Admin은 로그 파일을 직접 파싱하지 않고 이 이벤트를 조회한다.

- `run_id`
- `pipeline_name`
- `trigger`: `manual`, `schedule`, `retry`
- `started_at`, `finished_at`
- `status`
- `events[]`: 단계, 시각, 입력 참조, 결과, 오류

## 6. 디렉터리 초안

```text
editorial-studio/
├─ app/
│  ├─ domain/
│  ├─ services/
│  ├─ adapters/
│  │  ├─ sources/
│  │  ├─ generators/
│  │  └─ publishers/
│  │     ├─ codenexus.py
│  │     ├─ naver.py
│  │     ├─ threads.py
│  │     └─ instagram.py
│  └─ admin/
├─ personas/
│  ├─ codenexus.md
│  ├─ threads-ai-market.md
│  ├─ instagram-ai-market.md
│  └─ naver-*.md
├─ content/
│  └─ {research-id}/
│     ├─ research.json
│     ├─ sources.json
│     ├─ products/
│     │  ├─ codenexus/article.md
│     │  ├─ threads/post.json
│     │  ├─ instagram/carousel.json
│     │  └─ naver/{account-id}.md
│     └─ assets/
├─ data/editorial.db
├─ automation/
├─ tests/
└─ pyproject.toml
```

## 7. 채널별 출력 계약

### Threads

```json
{
  "research_id": "...",
  "persona": "threads-ai-market",
  "format": "single|thread",
  "posts": [
    {"order": 1, "text": "...", "source_ids": ["..."]}
  ],
  "canonical_url": null,
  "status": "draft"
}
```

- 단일 관점과 대화 가능성을 우선
- 핵심 숫자 하나와 해석 하나 포함
- 링크 없이도 독립적인 가치 제공
- 모든 블로그 글을 자동 변환하지 않고 channel-fit gate 적용
- Meta 공식 Threads API 사용

### Instagram

```json
{
  "research_id": "...",
  "persona": "instagram-ai-market",
  "title": "...",
  "cards": [
    {"order": 1, "type": "cover", "headline": "..."},
    {"order": 2, "type": "metric", "headline": "...", "source_ids": ["..."]},
    {"order": 8, "type": "closing", "cta": "저장해두고 다음 발표 때 비교하세요"}
  ],
  "caption": "...",
  "status": "draft"
}
```

- 1080×1350 세로 카드
- 6~8장 기본, 최대 10장
- 사진보다 숫자, 비교, 구조도와 타임라인 중심
- HTML/SVG 템플릿을 JPEG로 렌더링하여 비용 최소화
- 공식 Instagram API의 carousel publishing 사용
- Instagram 프로페셔널 Creator 계정 필요

## 8. Admin 운영 화면 요구사항

Admin은 예쁜 대시보드보다 운영 상태와 조치 가능성이 우선이다.

### Overview

- 오늘 발견한 리서치 수
- 채널별 draft/review/scheduled/published/failed 수
- 현재 실행 중인 run
- 최근 실패와 재시도 가능 여부
- 다음 예약 발행

### Pipeline Board

행은 research, 열은 단계 또는 채널로 표현한다.

```text
Research             CodeNexus        Threads          Instagram        Naver
FOMC July Minutes    Published        Review           Rendering        Scheduled
New AI Model         Drafting         Published        Approved         Skipped
```

### Research Detail

- 조사 요약과 기준일
- 공식 출처와 각 출처가 뒷받침하는 주장
- 사실과 해석 구분
- 반대 시나리오와 다음 체크포인트
- 동일 research에서 생성된 모든 제품 비교

### Product Detail

- 적용 페르소나와 angle
- 생성 원고 또는 카드 미리보기
- source coverage
- 승인, 반려, 수정 후 승인
- 예약 시간 선택
- 발행, 취소, 실패 재시도

### Run Detail

- 단계별 타임라인
- 소요시간
- 입력 및 산출물 경로
- 오류 메시지
- 해당 단계부터 재시도

### Settings

- 채널 활성화 여부
- 계정과 페르소나 연결
- 발행 시간대와 일일 한도
- 토큰 만료 상태
- dry-run / review-required / auto-publish 정책

## 9. 구현 원칙

- 초기 상태는 모든 신규 채널 `review-required`로 둔다.
- 비밀키와 토큰은 DB나 Git에 저장하지 않고 환경 변수 또는 OS keychain을 사용한다.
- publisher는 멱등성을 보장한다. 동일 product를 재시도해 중복 발행하지 않는다.
- 모든 외부 발행 결과는 external ID와 URL을 기록한다.
- 하나의 채널 실패가 다른 채널 발행을 롤백하지 않는다.
- research와 product를 삭제하지 않고 상태 전이와 이벤트를 남긴다.
- 기존 CodeNexus와 Naver 자동화를 새 파이프라인 검증 전에 끄지 않는다.
- X Playwright 자동 발행은 정책과 계정 위험 때문에 범위에서 제외한다.

## 10. 마이그레이션 순서

1. `/Users/andrew/dev/editorial-studio`의 현재 상태와 테스트를 보존한다.
2. 프로젝트 이름과 문서를 Editorial Studio로 변경한다.
3. 기존 JSONL/Markdown 데이터를 읽을 수 있는 migration/import 레이어를 만든다.
4. SQLite schema, repository, state transition, event log를 구현한다.
5. 기존 CodeNexus Markdown import adapter를 구현한다.
6. Threads와 Instagram persona 및 제품 schema를 구현한다.
7. dry-run 생성과 review queue를 구현한다.
8. Admin MVP를 구현한다.
9. Meta 계정 생성 후 OAuth/token 상태 점검을 연결한다.
10. Threads publisher를 연결하고 수동 승인 기반으로 시험 발행한다.
11. Instagram 카드 렌더러와 carousel publisher를 연결한다.
12. CodeNexus publisher adapter를 연결한다.
13. Naver는 기존 blog-agent-studio publisher를 호출하는 adapter로 연결한다.
14. end-to-end 검증 후 중앙 launchd 하나를 등록한다.
15. 안정화가 확인된 다음 기존 개별 생성 스케줄만 내린다. 채널 발행기는 유지한다.

## 11. 첫 구현 완료 기준

- 기존 editorial-studio 테스트가 통과한다.
- 새 SQLite schema와 상태 전이 테스트가 통과한다.
- CodeNexus 기존 글 한 편을 research package로 import할 수 있다.
- 동일 research에서 Threads JSON과 Instagram carousel JSON을 생성할 수 있다.
- Admin에서 research → product → review → publication 상태를 볼 수 있다.
- dry-run에서는 외부 발행이 절대 발생하지 않는다.
- 실패 event와 재시도 상태가 기록된다.
- README에 로컬 실행법과 운영 전환법이 문서화된다.

## 12. 다음 작업 시작 프롬프트

아래 문장을 다음 Codex 작업에 사용한다.

> `/Users/andrew/obsidian/My Vault`의 `Editorial Studio — One Research, Multiple Editorial Products` 스펙을 먼저 끝까지 읽어라. `/Users/andrew/dev/editorial-studio`를 새 저장소를 추가하지 않고 `editorial-studio`로 재정비하라. 기존 동작과 테스트를 보존하고 SQLite 기반 research/product/publication/run/event 모델, CodeNexus import adapter, Threads 및 Instagram dry-run product schema, Admin MVP를 구현하라. 기존 CodeNexus와 blog-agent-studio 자동화는 end-to-end 검증 전까지 중단하거나 변경하지 마라. 구현 후 테스트와 로컬 실행 검증을 수행하고 마이그레이션 결과와 남은 Meta 인증 작업을 보고하라.
