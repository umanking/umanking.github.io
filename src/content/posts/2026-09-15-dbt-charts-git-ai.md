---
title: "dbt Charts: YAML 대시보드를 Git과 AI로 관리한다"
description: "dbt Charts가 대시보드를 YAML과 SQL로 정의해 Git 리뷰와 AI 에이전트 작성 흐름에 맞춘 방식을 살펴봅니다."
date: 2026-09-15
firstPublishedAt: 2026-09-15T18:24:00+09:00
permalink: /2026/09/15/dbt-charts-git-ai/
section: data
hub: modeling
type: brief
level: 입문
tags: [dbt, 데이터, 대시보드, AI, Git]
curation:
  sourceUrl: https://dbtcharts.com/blog/charts-built-for-chat/
  sourceName: dbt Labs
  whyItMatters: "BI 화면을 독점 포맷이 아닌 텍스트로 관리해 모델 변경과 대시보드 변경을 같은 브랜치와 PR에서 검토할 수 있습니다."
editorial:
  authorship: ai-assisted
  reviewed: false
  model: OpenAI Codex
  sources:
    - https://dbtcharts.com/blog/charts-built-for-chat/
    - https://docs.dbtcharts.com/
    - https://docs.dbtcharts.com/faq/
    - https://docs.dbtcharts.com/cli/validate/
    - https://docs.dbtcharts.com/guides/ci/
---

## 핵심만 보면

- dbt Charts는 SQL로 데이터를 조회하고 YAML로 차트·필터·레이아웃을 선언하는 오픈소스 대시보드 도구입니다.
- 대시보드가 Git의 텍스트 파일이므로 dbt 모델과 같은 브랜치에서 변경하고 PR과 CI로 검토할 수 있습니다.
- AI가 자유 형식의 프론트엔드 코드를 만드는 대신 제한된 YAML을 생성하고 검증 결과로 수정하게 만든 점이 핵심입니다.

## 어떻게 동작하나

하나의 board YAML에는 데이터 소스와 쿼리, 차트, 필터, 변수, 행·열 레이아웃을 함께 정의합니다. SQL은 어떤 데이터를 가져올지 담당하고 YAML은 결과 열을 막대, 선, 지도, 표 같은 시각 요소에 연결합니다. CLI는 이 파일을 대화형 보드로 컴파일하고 데이터베이스에 SQL을 보내 결과를 채웁니다.

결과는 대화형 HTML뿐 아니라 SVG, PNG, PDF 등으로 렌더링할 수 있습니다. 데이터베이스 없이 인라인 값으로 차트를 시험한 뒤 실제 SQL 소스로 바꾸는 흐름도 지원합니다. JavaScript나 프론트엔드 프레임워크를 직접 다루지 않아도 되지만 SQL·YAML·Git에 대한 기본 이해는 필요합니다.

dbt 프로젝트와 함께 쓰면 `charts/`를 `models/` 옆에 두고 데이터 모델과 대시보드를 같은 브랜치에서 관리할 수 있습니다. 모델 변경과 화면 수정이 서로 다른 도구와 배포 시점에 흩어지는 문제를 줄이는 방식입니다.

## AI와 잘 맞는 이유

AI에게 일반적인 대시보드를 요청하면 HTML, CSS, JavaScript와 차트 라이브러리가 한꺼번에 생성돼 검토 범위가 커집니다. dbt Charts는 생성 결과를 정해진 스키마의 YAML로 제한합니다. 에이전트는 “매출을 지역별로 보여 달라”는 요청을 쿼리와 차트 선언으로 바꾸고, 사람은 완성된 애플리케이션 전체가 아니라 짧은 diff를 검토할 수 있습니다.

CLI와 MCP, 작성용 스킬을 통해 Cursor, Claude Code, ChatGPT 같은 도구를 연결할 수 있습니다. AI가 틀린 필드나 존재하지 않는 쿼리를 만들면 검증 오류를 받아 다시 수정하는 짧은 피드백 루프를 만들 수 있습니다.

## CI가 확인하는 것과 못 하는 것

`dct validate`는 기본적으로 데이터베이스에 접속하지 않고 YAML 문법, 스키마, 보드 내부 참조, 변수 타입과 제약을 검사합니다. `dbt parse && dct validate`로 manifest를 먼저 만들면 `ref()`·`source()` 존재 여부와 정적으로 추론할 수 있는 모델 열 변경도 확인합니다.

기본 검증만으로 테이블의 실제 존재, 쿼리 실행 성공, 결과 행, 차트 가독성은 보장하지 않습니다. `--warehouse`를 붙이면 BigQuery dry-run이나 Postgres·Snowflake `EXPLAIN` 같은 저비용 검사를 추가하지만, 지원하지 않는 어댑터는 ‘통과’가 아니라 ‘미확인’으로 남습니다. 최종 화면과 실제 데이터는 별도 렌더링 테스트가 필요합니다.

## 도입 전에 볼 점

SQL·YAML·Git에 익숙하고 데이터 모델과 대시보드를 하나의 변경 단위로 관리하려는 팀에는 잘 맞습니다. 특히 여러 브랜치에서 모델을 바꾸거나 AI가 반복적으로 리포트를 만드는 환경에서 유리합니다.

반면 비개발 사용자가 화면에서 자유롭게 탐색하고 직접 차트를 조합하는 셀프서비스 BI가 중심이라면 기존 도구가 더 편할 수 있습니다. 표현력을 최대화한 범용 프론트엔드도 아니므로, 고도로 맞춤화된 인터랙션이 필요하면 YAML의 제한이 단점이 됩니다.

오픈소스로 제공되는 범위는 엔진·CLI·YAML 언어입니다. 접근 제어, Git 기반 공동 편집, 공유 웨어하우스 연결 같은 팀 기능은 선택형 호스팅 제품인 dbt Charts Cloud가 담당합니다. 또한 dbt Semantic Layer의 지표를 이름으로 바로 조회하는 기능은 아직 계획 단계여서 현재는 SQL을 직접 작성하는 방식이 기본입니다.

## 한 줄 결론

dbt Charts의 가치는 AI가 차트를 한 번 만들어 주는 데 있지 않습니다. 데이터 모델과 대시보드를 같은 Git 변경으로 묶고, 생성 결과를 사람이 읽을 수 있는 YAML과 반복 가능한 검증 과정으로 남기는 데 있습니다. 그 운영 방식을 원하는 팀에는 흥미로운 대안이지만, 기존 BI의 모든 탐색·권한·표현 기능을 즉시 대체하는 제품으로 볼 단계는 아닙니다.

[dbt Labs 원문](https://dbtcharts.com/blog/charts-built-for-chat/) · [공식 문서](https://docs.dbtcharts.com/)
