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
  sourceUrl: https://docs.dbtcharts.com/
  sourceName: dbt Charts
  whyItMatters: "BI 화면을 독점 포맷이 아닌 텍스트로 관리해 모델 변경과 대시보드 변경을 같은 브랜치와 PR에서 검토할 수 있습니다."
editorial:
  authorship: ai-assisted
  reviewed: false
  model: OpenAI Codex
  sources:
    - https://docs.dbtcharts.com/
    - https://docs.dbtcharts.com/faq/
---

## 한 줄 판단

dbt Charts는 SQL 쿼리와 차트·레이아웃을 YAML로 선언해 대시보드를 만드는 오픈소스 도구입니다. 드래그앤드롭 BI 대신 코드 리뷰 가능한 대시보드를 원하는 데이터 팀에 맞습니다.

## 무엇이 다른가

대시보드 정의가 Git의 텍스트 파일이므로 브랜치, diff, PR 리뷰를 그대로 사용할 수 있습니다. dbt 모델과 대시보드가 같은 변경 흐름을 타기 때문에 모델 이름을 바꿀 때 화면 정의도 함께 검토하기 쉽습니다.

AI 활용도 별도 채팅 UI가 핵심은 아닙니다. `dct init mcp`와 authoring skills를 통해 Cursor, Claude Code, ChatGPT 같은 도구가 정해진 YAML을 작성하도록 연결하는 방식입니다. 사람은 생성 결과를 diff로 검토할 수 있습니다.

## 맞는 팀과 아닌 팀

SQL·YAML·Git에 익숙하고 대시보드를 소프트웨어처럼 관리하려는 팀에는 잘 맞습니다. 반대로 비개발 사용자가 화면에서 자유롭게 끌어다 놓는 셀프서비스 BI가 필요하다면 진입 장벽이 큽니다. dbt Semantic Layer의 지표 이름 직접 조회는 공식 문서상 아직 계획 단계입니다.

[dbt Charts 공식 문서](https://docs.dbtcharts.com/) · [AI 연동 FAQ](https://docs.dbtcharts.com/faq/)
