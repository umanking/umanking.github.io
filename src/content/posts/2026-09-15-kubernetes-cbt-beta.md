---
title: "Kubernetes CBT가 Beta로: 백업 증분 처리 전환 때 놓치기 쉬운 것"
description: "Kubernetes Changed Block Tracking의 v1beta1 전환 조건과 자동 변환이 없는 업그레이드 주의점을 짧게 정리합니다."
date: 2026-09-15
firstPublishedAt: 2026-09-15T18:20:00+09:00
permalink: /2026/09/15/kubernetes-cbt-beta/
section: infra
hub: tools
type: brief
level: 중급
tags: [Kubernetes, CSI, 스토리지, 백업]
curation:
  sourceUrl: https://kubernetes.io/blog/2026/09/14/csi-changed-block-tracking-beta/
  sourceName: Kubernetes Blog
  sourcePublishedAt: 2026-09-14
  whyItMatters: "대용량 볼륨 백업에서 매번 전체 블록을 읽지 않고 변경분만 추적할 수 있지만, Alpha 사용자는 자동 변환 없는 CRD 교체를 준비해야 합니다."
editorial:
  authorship: ai-assisted
  reviewed: false
  model: OpenAI Codex
  sources:
    - https://kubernetes.io/blog/2026/09/14/csi-changed-block-tracking-beta/
---

## 핵심만 보면

- Kubernetes의 CSI Changed Block Tracking(CBT)이 Beta로 올라갔습니다.
- 전체 볼륨 대신 바뀐 블록을 추적해 증분 백업을 만들 수 있는 기반입니다.
- Alpha 사용자는 자동 마이그레이션이 없으므로 CRD와 클라이언트를 직접 바꿔야 합니다.

## 무엇이 달라졌나

`SnapshotMetadataService` CRD가 `v1alpha1`에서 `v1beta1`로 변경됐습니다. 데이터 구조는 같지만 Alpha API가 함께 제공되지 않고 두 버전 사이의 자동 변환도 없습니다.

기존 사용자는 다음 세 가지를 함께 갱신해야 합니다.

1. v1.0.0에 포함된 새 CRD를 다시 적용합니다.
2. 매니페스트의 `apiVersion`을 `cbt.storage.k8s.io/v1beta1`로 바꿉니다.
3. 해당 CRD를 호출하는 컨트롤러와 클라이언트 코드도 수정합니다.

## 적용 전에 확인할 것

최소 조건은 Kubernetes 1.33과 CSI 스펙 1.10입니다. CSI 드라이버가 볼륨 스냅샷뿐 아니라 `external-snapshot-metadata` 사이드카도 지원해야 합니다.

현재 CBT가 다루는 대상은 블록 볼륨입니다. 파일 볼륨이나 네트워크 파일 공유의 변경 목록을 추적하는 기능은 포함되지 않습니다. 따라서 일반 애플리케이션 팀보다 CSI 드라이버와 백업 제품을 운영하는 팀에 직접적인 변화입니다.

## 한 줄 결론

증분 백업의 표준화 가능성은 커졌지만 아직 Beta입니다. 실제 스토리지 드라이버의 지원 범위, 복구 테스트, 실패 시 전체 백업으로 돌아가는 경로를 확인한 뒤 도입하는 것이 안전합니다.

[Kubernetes 공식 원문](https://kubernetes.io/blog/2026/09/14/csi-changed-block-tracking-beta/)
