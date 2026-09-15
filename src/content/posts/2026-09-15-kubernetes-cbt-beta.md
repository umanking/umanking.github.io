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

## 한 줄 판단

Kubernetes의 CSI Changed Block Tracking(CBT)이 Beta에 들어왔습니다. 백업 도구와 CSI 드라이버 개발자에게는 실제 도입을 검토할 시점이지만, 기존 Alpha 설치를 단순 버전 업그레이드로 처리하면 안 됩니다.

## 무엇이 바뀌었나

핵심은 `SnapshotMetadataService` CRD가 `v1alpha1`에서 `v1beta1`로 올라간 것입니다. 스키마는 같지만 Alpha API가 함께 제공되지 않으며 자동 변환도 없습니다. 기존 사용자는 v1.0.0 CRD를 다시 적용하고 매니페스트와 클라이언트 코드를 `cbt.storage.k8s.io/v1beta1`로 바꿔야 합니다.

지원 조건은 Kubernetes 1.33 이상, CSI 스펙 1.10 이상입니다. 현재 대상은 블록 볼륨이며 파일 볼륨과 네트워크 파일 공유의 변경 목록 추적은 포함하지 않습니다.

## 누가 확인할까

CSI 드라이버를 운영하거나 증분 백업 제품을 만드는 팀이라면 드라이버의 스냅샷 지원과 `external-snapshot-metadata` 사이드카 제공 여부부터 확인하는 편이 좋습니다. 일반 애플리케이션 팀이 직접 도입할 기능이라기보다는 스토리지·백업 계층의 선택지입니다.

[Kubernetes 공식 발표 원문](https://kubernetes.io/blog/2026/09/14/csi-changed-block-tracking-beta/)
