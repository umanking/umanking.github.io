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

Kubernetes의 CSI Changed Block Tracking(CBT)이 Beta에 들어왔습니다. 대용량 블록 볼륨의 증분 백업을 표준 인터페이스로 구현하려는 팀에는 실제 검증을 시작할 시점이지만, 기존 Alpha 설치를 단순 버전 업그레이드로 처리하면 안 됩니다.

## 핵심 내용

- `SnapshotMetadataService` CRD가 `v1alpha1`에서 `v1beta1`로 승격됐습니다.
- 스키마는 같지만 Alpha API가 함께 제공되지 않고 자동 변환도 지원하지 않습니다.
- 기존 사용자는 CRD, 매니페스트, CRD를 호출하는 클라이언트 코드를 한 번에 바꿔야 합니다.
- 최소 Kubernetes 버전은 1.33, CSI 스펙은 1.10 이상입니다.
- 현재 추적 대상은 블록 볼륨입니다. 파일 볼륨과 네트워크 파일 공유는 포함하지 않습니다.

## 무엇이 바뀌었나

핵심은 `SnapshotMetadataService` CRD가 `v1alpha1`에서 `v1beta1`로 올라간 것입니다. 스키마는 같지만 Alpha API가 함께 제공되지 않으며 자동 변환도 없습니다. 기존 사용자는 v1.0.0 CRD를 다시 적용하고 매니페스트와 클라이언트 코드를 `cbt.storage.k8s.io/v1beta1`로 바꿔야 합니다.

CBT 자체는 2025년 9월 Alpha로 처음 공개됐고, `external-snapshot-metadata` 프로젝트의 2026년 3월 v1.0.0 릴리스와 함께 Beta 단계로 이동했습니다. 이번 발표는 새로운 기능을 대거 추가했다기보다 Beta 전환에서 달라진 API 계약과 호환 조건을 분명히 하는 데 초점을 둡니다.

## 어떤 구성으로 동작하나

Kubernetes CBT는 세 구성요소가 맞물려 동작합니다.

1. CSI 드라이버가 `SnapshotMetadata` gRPC 서비스를 구현합니다.
2. `SnapshotMetadataService` CRD가 해당 드라이버의 메타데이터 서비스를 클러스터에 알립니다.
3. `external-snapshot-metadata` 사이드카가 Kubernetes 환경에서 이 연결을 제공합니다.

클라이언트는 `GetMetadataAllocated`로 할당된 블록 정보를 받고, `GetMetadataDelta`로 두 시점 사이에서 바뀐 블록을 조회합니다. 백업 애플리케이션은 이 정보를 사용해 전체 볼륨을 다시 읽는 대신 변경된 범위를 중심으로 처리할 수 있습니다.

## Alpha 사용자의 전환 순서

기존 Alpha 사용자는 다음 세 항목을 함께 배포해야 합니다.

1. `external-snapshot-metadata` v1.0.0에 포함된 CRD 정의를 다시 적용합니다.
2. `SnapshotMetadataService` 매니페스트의 `apiVersion`을 `cbt.storage.k8s.io/v1beta1`로 바꿉니다.
3. CRD를 직접 읽거나 쓰는 컨트롤러와 클라이언트 코드도 v1beta1을 사용하도록 갱신합니다.

자동 변환 웹훅이나 두 버전의 동시 제공이 없으므로, 적용 순서가 어긋나면 컨트롤러가 리소스를 찾지 못하는 구간이 생길 수 있습니다. 운영 클러스터에서는 현재 Alpha 리소스와 소비자를 먼저 목록화하고 롤백 절차까지 준비하는 편이 안전합니다.

## 도입 전에 볼 조건

- Kubernetes 1.33 이상인지 확인합니다.
- CSI 드라이버가 볼륨 스냅샷과 CBT 메타데이터 서비스를 모두 지원하는지 확인합니다.
- CSI 스펙 1.10 이상인지 확인합니다.
- `registry.k8s.io/sig-storage/csi-snapshot-metadata:v1.0.0` 이미지를 기준으로 검증합니다.
- 파일시스템 공유가 아니라 블록 볼륨 워크로드인지 구분합니다.

드라이버가 일반 스냅샷을 지원한다고 해서 CBT까지 자동으로 지원하는 것은 아닙니다. 공식 발표도 Beta 기간의 핵심 과제로 더 많은 CSI 드라이버 채택과 운영 피드백을 꼽고 있습니다.

## 누가 확인할까

CSI 드라이버를 운영하거나 증분 백업 제품을 만드는 팀이라면 드라이버의 스냅샷 지원과 `external-snapshot-metadata` 사이드카 제공 여부부터 확인하는 편이 좋습니다. 일반 애플리케이션 팀이 직접 도입할 기능이라기보다는 스토리지·백업 계층의 선택지입니다.

처음 시험한다면 공식 문서가 안내하는 hostpath 드라이버 예제로 전체 흐름을 재현한 뒤, 실제 스토리지 드라이버의 구현 범위와 성능을 비교하는 것이 좋습니다. Beta는 안정성을 보장하는 최종 단계가 아니므로 백업 복구 테스트와 실패 시 전체 백업 전환 경로도 함께 확인해야 합니다.

## 원문과 참고 자료

- [Kubernetes 공식 발표](https://kubernetes.io/blog/2026/09/14/csi-changed-block-tracking-beta/)
- [external-snapshot-metadata 저장소](https://github.com/kubernetes-csi/external-snapshot-metadata)
- [CSI Snapshot Metadata 개발자 문서](https://kubernetes-csi.github.io/docs/snapshot-metadata.html)
