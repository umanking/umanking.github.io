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

## 한 줄 판단

dbt Charts는 SQL 쿼리와 차트·레이아웃을 YAML로 선언해 대시보드를 만드는 오픈소스 도구입니다. 드래그앤드롭 BI 대신 코드 리뷰 가능한 대시보드를 원하는 데이터 팀에 맞습니다.

## 핵심 내용

- 데이터 조회는 SQL, 차트와 레이아웃은 YAML로 정의합니다.
- 대시보드가 Git의 텍스트 파일이므로 diff, 브랜치, PR 리뷰를 그대로 적용할 수 있습니다.
- dbt 모델과 차트를 같은 저장소에서 변경하고 CI에서 함께 검증할 수 있습니다.
- AI 에이전트는 자유 형식의 웹 앱 대신 제한된 YAML 언어를 생성하고 검증 결과를 받아 수정합니다.
- 오픈소스 CLI는 로컬 실행을 지원하고, 별도의 호스팅 제품은 대화형 분석·시각 편집·권한 관리를 제공합니다.

## 왜 새로운 대시보드 언어가 필요한가

AI에게 대시보드를 만들어 달라고 하면 HTML, CSS, JavaScript, 차트 라이브러리와 실행 앱이 함께 생기기 쉽습니다. 첫 결과는 빠르지만 데이터 출처를 추적하거나 작은 변경을 리뷰하기 어렵고, 다음 수정 때 에이전트가 넓은 코드 문맥을 다시 읽어야 합니다.

기존 BI 도구는 반대로 안정적인 UI와 권한 체계를 제공하지만, AI가 조작할 수 있는 범위가 제품 UI와 독점 포맷에 묶입니다. dbt Charts는 두 방식 사이에서 대시보드 자체를 작고 검증 가능한 선언 파일로 만드는 접근을 택했습니다.

## 무엇이 다른가

대시보드 정의가 Git의 텍스트 파일이므로 브랜치, diff, PR 리뷰를 그대로 사용할 수 있습니다. dbt 모델과 대시보드가 같은 변경 흐름을 타기 때문에 모델 이름을 바꿀 때 화면 정의도 함께 검토하기 쉽습니다.

하나의 board YAML에는 쿼리, 차트, 필터, 변수와 행·열·그리드·탭 레이아웃을 정의할 수 있습니다. Markdown으로 설명을 넣고 Jinja 변수와 매크로도 사용할 수 있습니다. CLI는 결과를 대화형 HTML뿐 아니라 SVG, PNG, PDF, 터미널 출력으로 렌더링할 수 있습니다.

공식 문서는 현재 16개 차트 유형과 복합 차트 구성을 안내합니다. 스타일은 테마, 대시보드, 개별 차트 순서로 상속할 수 있어 모든 시각 요소를 반복해서 지정하지 않아도 됩니다.

## dbt 프로젝트와 함께 쓰는 방식

`charts/` 디렉터리를 `models/` 옆에 두면 데이터 모델과 시각화를 하나의 브랜치에서 바꿀 수 있습니다. 쿼리는 dbt manifest를 통해 `ref()`로 모델을 참조할 수 있습니다.

CI에서는 다음과 같은 흐름으로 배포 전에 연결 오류를 확인할 수 있습니다.

1. `dbt parse`로 프로젝트 manifest를 만듭니다.
2. `dct validate charts/`로 대시보드 YAML과 SQL 참조를 검사합니다.
3. 모델 이름이나 열 변경으로 차트가 깨지면 PR 단계에서 실패시킵니다.
4. 검증된 파일을 로컬, CI 또는 호스팅 환경에서 같은 정의로 렌더링합니다.

dbt Semantic Layer의 지표를 이름으로 직접 조회하는 기능은 아직 계획 단계입니다. 현재는 SQL을 직접 작성하는 모델이 기본이므로, 조직의 지표 정의와 권한 통제가 자동으로 해결된다고 보기는 어렵습니다.

## AI가 수정하기 쉬운 이유

AI 활용의 핵심은 채팅 화면 자체보다 짧은 피드백 루프입니다. `dct init mcp`와 authoring skills를 통해 Cursor, Claude Code, ChatGPT 같은 도구가 YAML을 만들 수 있고, 파서가 문법과 SQL 문제를 구체적으로 돌려줍니다.

dbt Charts는 데이터 오류뿐 아니라 시각적인 문제도 경고 대상으로 다룹니다. 제한된 폭에 막대가 너무 많이 들어가거나 표의 열 너비가 화면을 넘는 경우, 문제와 수정 방향을 에이전트에 알려 다시 생성하도록 돕습니다. 생성 결과가 “보이기만 하는가”가 아니라 사람이 읽을 수 있는가까지 자동 검토하려는 설계입니다.

## 오픈소스와 호스팅 제품의 경계

오픈소스 언어와 CLI는 Apache 2.0 라이선스로 제공되며 계정 없이 로컬에서 대시보드를 작성하고 서비스할 수 있습니다. 호스팅 제품은 데이터 웨어하우스 연결, 대화형 분석, 시각 편집기, 버전 이력과 사용자·그룹별 접근 권한을 추가합니다.

채팅, 시각 편집기, 코드에서 한 변경이 같은 Git 저장소의 YAML에 반영된다는 점이 제품의 핵심 주장입니다. 다만 호스팅 제품은 공개 베타이고 언어도 1.0 이전이므로, 운영 도입 전에는 문법 변경과 마이그레이션 정책을 확인해야 합니다.

## 맞는 팀과 아닌 팀

SQL·YAML·Git에 익숙하고 대시보드를 소프트웨어처럼 관리하려는 팀에는 잘 맞습니다. 반대로 비개발 사용자가 화면에서 자유롭게 끌어다 놓는 셀프서비스 BI가 필요하다면 진입 장벽이 큽니다. dbt Semantic Layer의 지표 이름 직접 조회는 공식 문서상 아직 계획 단계입니다.

Vega-Lite나 Observable Framework처럼 더 자유로운 표현이 필요한 팀에도 제한된 YAML이 답답할 수 있습니다. dbt Charts의 장점은 최대 표현력이 아니라 데이터 모델과 차트의 변경을 함께 검토하고, AI가 만든 결과를 작은 선언 파일로 통제하는 데 있습니다.

## 원문과 참고 자료

- [dbt Labs 발표 원문](https://dbtcharts.com/blog/charts-built-for-chat/)
- [dbt Charts 공식 문서](https://docs.dbtcharts.com/)
- [AI 연동 FAQ](https://docs.dbtcharts.com/faq/)
- [GitHub 저장소](https://github.com/dbt-labs/dbt-charts)
