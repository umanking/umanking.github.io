---
title: "Ubuntu 26.10, 기본 coreutils를 100% Rust 구현으로 전환"
description: "Ubuntu 26.10에서 cp·mv·rm까지 uutils로 옮기는 변화와 운영 이미지에서 먼저 확인할 호환성 지점을 정리합니다."
date: 2026-09-15
firstPublishedAt: 2026-09-15T18:22:00+09:00
permalink: /2026/09/15/ubuntu-2610-rust-coreutils/
section: infra
hub: tools
type: brief
level: 중급
tags: [Ubuntu, Rust, Linux, coreutils]
curation:
  sourceUrl: https://www.omgubuntu.co.uk/2026/09/ubuntu-2610-rust-coreutils-complete
  sourceName: OMG! Ubuntu
  sourcePublishedAt: 2026-09-15
  whyItMatters: "배포 스크립트와 컨테이너 빌드가 당연하게 기대하던 GNU 동작이 바뀔 수 있어, 26.10 기반 이미지 전환 전에 호환성 검증이 필요합니다."
editorial:
  authorship: ai-assisted
  reviewed: false
  model: OpenAI Codex
  sources:
    - https://www.omgubuntu.co.uk/2026/09/ubuntu-2610-rust-coreutils-complete
    - https://documentation.ubuntu.com/release-notes/26.10/
---

## 한 줄 판단

개발 중인 Ubuntu 26.10은 기본 coreutils를 전부 Rust 기반 `uutils`로 제공할 예정입니다. 26.04까지 GNU 구현으로 남아 있던 `cp`, `mv`, `rm`도 이번에 전환됩니다.

## 핵심 내용

- Ubuntu 26.10은 `ls`, `cat`, `chmod`, `du`에 이어 `cp`, `mv`, `rm`까지 Rust 기반 uutils로 전환합니다.
- 마지막 세 명령은 TOCTOU 보안 문제 때문에 Ubuntu 26.04 LTS에서 GNU 구현으로 남아 있었습니다.
- 관련 문제가 upstream에서 해결되면서 26.10 개발 버전에 포함됐습니다.
- 명령 이름과 일반적인 사용법을 바꾸는 작업이 아니라 GNU coreutils의 대체 구현을 교체하는 작업입니다.
- Ubuntu 26.10은 아직 개발 중이며 정식 출시는 2026년 10월 15일로 예정돼 있습니다.

## 왜 세 명령만 늦어졌나

Ubuntu는 25.10부터 Rust 기반 coreutils를 기본으로 도입했지만, 파일을 복사·이동·삭제하는 `cp`, `mv`, `rm`은 26.04 LTS에서도 GNU 버전을 유지했습니다. Canonical이 의뢰한 uutils 보안 감사에서 TOCTOU(time-of-check to time-of-use) 문제가 확인됐기 때문입니다.

TOCTOU 문제는 파일이나 권한을 확인한 시점과 실제 작업을 수행하는 시점 사이에 대상 상태가 바뀔 때 발생합니다. 파일 시스템을 직접 변경하는 세 명령에서는 단순한 출력 차이보다 영향이 크기 때문에 전환을 보류한 판단이었습니다. OMG! Ubuntu 보도와 Ubuntu 26.10 릴리스 노트는 upstream 수정 뒤 세 명령도 uutils로 옮겼다고 설명합니다.

## Canonical이 얻으려는 것

Canonical은 기반 소프트웨어를 Rust 대안으로 바꾸는 작업을 ‘oxidising’이라고 부릅니다. C로 작성된 기존 구현을 무조건 폐기한다기보다, 메모리 안전성 문제를 컴파일 단계에서 줄일 수 있는 구현을 기본값으로 채택하려는 흐름입니다.

uutils 프로젝트는 GNU coreutils와의 드롭인 호환성을 목표로 합니다. 사용자에게 새로운 명령 체계를 제공하는 것이 목적이 아니며, GNU 구현과의 의도하지 않은 동작 차이는 버그로 취급합니다. 따라서 표면적인 사용법은 같아야 하지만, 운영자는 “호환을 목표로 한다”와 “모든 경계 사례가 이미 동일하다”를 구분해야 합니다.

## 무엇을 확인할까

이번 변화는 명령 이름을 바꾸지 않습니다. 위험은 셸 스크립트와 빌드 도구가 GNU coreutils의 세부 출력, 옵션 조합, 오류 코드를 암묵적으로 기대하는 데 있습니다. 특히 파일 복사·이동·삭제를 감싼 배포 스크립트와 컨테이너 이미지 빌드를 우선 점검할 만합니다.

점검 우선순위는 다음과 같습니다.

1. `cp`, `mv`, `rm`의 GNU 전용 옵션을 사용하는 스크립트를 검색합니다.
2. 명령 출력 문자열이나 오류 메시지를 파싱하는 테스트가 있는지 확인합니다.
3. 심볼릭 링크, 권한, ACL, 매우 깊은 디렉터리처럼 경계 조건을 포함한 파일 작업을 재현합니다.
4. Ubuntu 26.10 기반 컨테이너 이미지를 별도 CI 매트릭스에 넣어 현재 LTS 이미지와 결과를 비교합니다.
5. 자동화 실패 시 GNU coreutils로 되돌리는 경로와 패키지 의존성을 확인합니다.

## 실무 대응

26.10은 LTS가 아닌 중간 릴리스입니다. 서버 운영 표준을 즉시 바꾸기보다 다음 LTS에 들어갈 수 있는 호환성 변화를 미리 시험하는 환경으로 활용할 수 있습니다. 특히 Ubuntu 기반 CI 러너나 컨테이너 태그를 자동으로 최신화하는 팀은 의도하지 않게 새 구현을 먼저 만나지 않도록 이미지 버전을 고정하는 편이 좋습니다.

“전환 완료”는 현재 개발 버전 구성에 대한 표현입니다. 실제 운영 판단은 정식 릴리스 시점의 알려진 문제, uutils 패키지 버전, 사용하는 파일 시스템과 배포 스크립트의 테스트 결과를 기준으로 내려야 합니다.

## 원문과 공식 자료

- [OMG! Ubuntu 원문](https://www.omgubuntu.co.uk/2026/09/ubuntu-2610-rust-coreutils-complete)
- [Ubuntu 26.10 공식 릴리스 노트](https://documentation.ubuntu.com/release-notes/26.10/)
