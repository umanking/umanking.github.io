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
    - https://documentation.ubuntu.com/release-notes/26.10/schedule/
    - https://github.com/uutils/coreutils
---

## 핵심만 보면

- 개발 중인 Ubuntu 26.10은 기본 coreutils를 전부 Rust 기반 `uutils`로 제공합니다.
- 26.04 LTS에서 GNU 구현으로 남았던 `cp`, `mv`, `rm`도 보안 문제 수정 뒤 이번 전환에 합류합니다.
- 명령 이름은 그대로지만 GNU 고유 옵션과 출력·오류 동작에 의존하는 자동화는 별도 검증이 필요합니다.

## 왜 이제 전부 바뀌나

Ubuntu는 25.10부터 `ls`, `cat`, `chmod`, `du` 같은 기본 명령을 Rust 기반 uutils로 제공하기 시작했습니다. 그러나 파일을 직접 복사·이동·삭제하는 `cp`, `mv`, `rm`은 26.04 LTS까지 GNU 구현으로 남았습니다. Canonical이 의뢰한 보안 감사에서 TOCTOU 문제가 발견됐기 때문입니다.

TOCTOU는 프로그램이 파일이나 권한을 확인한 시점과 실제 작업을 수행하는 시점 사이에 대상 상태가 달라져 생기는 경쟁 조건입니다. 출력 도구보다 파일 시스템을 변경하는 명령에서 피해가 클 수 있으므로, Ubuntu는 Rust 전환의 일관성보다 안전한 동작을 우선했습니다.

관련 문제가 upstream uutils에서 해결되면서 Ubuntu 26.10에서는 세 명령도 Rust 구현으로 교체됩니다. Canonical이 기대하는 효과는 새로운 기능보다 메모리 안전성 강화입니다.

## 100% Rust가 의미하는 것

사용자가 입력하는 명령이 바뀌는 것은 아닙니다. `/usr/bin/cp`, `mv`, `rm` 같은 익숙한 인터페이스 뒤의 구현이 GNU coreutils에서 uutils로 바뀌는 것입니다. uutils는 GNU coreutils와의 드롭인 호환성을 목표로 하며 의도하지 않은 차이는 버그로 다룹니다.

그렇다고 모든 동작이 이미 비트 단위로 같다는 뜻은 아닙니다. 셸 스크립트는 정상 출력보다 GNU 전용 옵션, 오류 문구, 종료 코드, 심볼릭 링크 처리, 권한과 ACL 같은 경계 조건에서 구현 차이를 만날 가능성이 큽니다. “호환성을 목표로 한다”와 “기존 자동화가 검증 없이 동일하게 동작한다”는 다른 주장입니다.

## 사용자에게 달라지는 점

일반적인 데스크톱 사용자는 변화를 거의 느끼지 못할 가능성이 큽니다. 우선 확인할 대상은 Ubuntu 기반 CI 러너, 컨테이너 베이스 이미지, 설치·배포 스크립트, 파일 정리 작업을 운영하는 팀입니다.

26.10 이미지를 별도 CI 매트릭스에 추가해 다음 항목을 현재 LTS 결과와 비교하면 됩니다.

- `cp`, `mv`, `rm`의 GNU 전용 옵션 사용 여부
- 명령 출력이나 오류 문자열, 종료 코드를 파싱하는 자동화
- 덮어쓰기·재귀 삭제·심볼릭 링크·권한·ACL을 다루는 테스트
- 깊은 디렉터리, 특수 파일, 다른 파일 시스템 사이 이동 같은 경계 사례
- 실패했을 때 GNU coreutils로 되돌릴 수 있는 패키지 의존성과 복구 절차

Rust로 작성됐다는 사실만으로 파일 작업 전체가 자동으로 안전해지는 것도 아닙니다. Rust는 메모리 안전성 문제를 줄이는 데 강점이 있지만 논리 오류, 호환성 회귀, 잘못된 옵션 사용까지 막아 주지는 않습니다.

## 한 줄 결론

Ubuntu의 Rust 전환은 이제 가장 민감한 파일 조작 명령까지 도달했습니다. 하지만 26.10은 아직 개발 중인 중간 릴리스이므로, 운영 이미지를 즉시 바꾸기보다 다음 LTS에서 만날 수 있는 호환성 변화를 미리 시험하는 기준 이미지로 활용하는 편이 합리적입니다.

[OMG! Ubuntu 원문](https://www.omgubuntu.co.uk/2026/09/ubuntu-2610-rust-coreutils-complete) · [Ubuntu 공식 릴리스 노트](https://documentation.ubuntu.com/release-notes/26.10/) · [uutils 공식 저장소](https://github.com/uutils/coreutils)
