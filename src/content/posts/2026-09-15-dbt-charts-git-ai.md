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
---

## 핵심만 보면

- dbt Charts는 SQL과 YAML로 대시보드를 만드는 오픈소스 도구입니다.
- 대시보드가 Git의 텍스트 파일이므로 변경 내용을 diff와 PR로 검토할 수 있습니다.
- AI가 자유 형식의 웹 앱 대신 검증 가능한 YAML을 만들도록 범위를 좁힌 것이 핵심입니다.

## 어떻게 동작하나

SQL은 어떤 데이터를 조회할지 정의하고, YAML은 차트·필터·변수·레이아웃을 지정합니다. 작성한 파일은 CLI를 통해 대화형 HTML이나 SVG, PNG, PDF 등으로 렌더링할 수 있습니다.

dbt 프로젝트와 함께 쓰면 `charts/`를 `models/` 옆에 두고 데이터 모델과 대시보드를 같은 브랜치에서 관리할 수 있습니다. `dbt parse`와 `dct validate`를 CI에 넣으면 YAML 구조와 모델 참조 문제를 PR 단계에서 확인할 수 있습니다.

## AI와 잘 맞는 이유

AI에게 일반적인 대시보드를 요청하면 HTML, CSS, JavaScript와 차트 라이브러리가 한꺼번에 생성돼 검토가 어려워질 수 있습니다. dbt Charts는 결과물을 하나의 구조화된 YAML로 제한하고 문법·SQL·시각화 문제를 검증해 에이전트가 다시 수정하도록 합니다.

`dct init mcp`와 작성용 스킬을 이용하면 Cursor, Claude Code, ChatGPT 같은 도구를 작성 과정에 연결할 수 있습니다. 사람이 마지막 결과를 Git diff로 확인할 수 있다는 점도 중요합니다.

## 도입 전에 볼 점

SQL·YAML·Git에 익숙하고 대시보드를 코드처럼 관리하려는 데이터 팀에는 잘 맞습니다. 반면 비개발 사용자의 드래그앤드롭 편집이 중심이라면 기존 BI 도구가 더 편할 수 있습니다.

오픈소스로 제공되는 범위는 엔진·CLI·YAML 언어이고, 접근 제어와 공동 편집이 필요한 팀 기능은 선택형 호스팅 제품인 dbt Charts Cloud가 담당합니다. dbt Semantic Layer 지표를 이름으로 직접 조회하는 기능은 아직 계획 단계입니다.

## 한 줄 결론

dbt Charts의 가치는 AI가 차트를 만들어 준다는 사실보다, 생성된 대시보드를 사람이 읽고 리뷰하며 계속 유지할 수 있는 파일로 남긴다는 데 있습니다.

[dbt Labs 원문](https://dbtcharts.com/blog/charts-built-for-chat/) · [공식 문서](https://docs.dbtcharts.com/)
