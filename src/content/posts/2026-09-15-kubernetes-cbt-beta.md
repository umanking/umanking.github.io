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

- Kubernetes의 CSI Changed Block Tracking(CBT)이 Alpha 공개 6개월 만에 Beta로 올라갔습니다.
- 백업 애플리케이션이 두 스냅샷 사이에서 달라진 블록만 찾아 증분 백업에 활용할 수 있는 표준 인터페이스입니다.
- Alpha 사용자는 자동 변환이 없으므로 CRD, 매니페스트, 컨트롤러를 한 번에 `v1beta1`로 맞춰야 합니다.

## 무엇이 달라졌나

CBT는 2025년 9월 Alpha로 처음 공개됐고, `external-snapshot-metadata` 프로젝트의 2026년 3월 `v1.0.0` 릴리스부터 Beta가 됐습니다. 이번 변화의 중심은 `SnapshotMetadataService` CRD가 `v1alpha1`에서 `v1beta1`로 승격된 것입니다.

필드 구조는 그대로지만 이전 API가 함께 제공되지 않습니다. Kubernetes CRD에서 흔히 기대하는 변환 웹훅도 없기 때문에, Alpha 리소스를 둔 채 새 컨트롤러만 올리는 식의 점진적 전환은 실패 구간을 만들 수 있습니다.

기존 사용자는 다음 세 가지를 함께 갱신해야 합니다.

1. `external-snapshot-metadata` v1.0.0에 포함된 새 CRD를 다시 적용합니다.
2. 매니페스트의 `apiVersion`을 `cbt.storage.k8s.io/v1beta1`로 바꿉니다.
3. 해당 CRD를 호출하는 컨트롤러와 클라이언트 코드도 수정합니다.

## 어떻게 증분 백업에 쓰이나

구성은 세 부분으로 나뉩니다. CSI 드라이버가 `SnapshotMetadata` gRPC 서비스를 구현하고, `SnapshotMetadataService` CRD가 그 서비스의 존재를 클러스터에 알립니다. `external-snapshot-metadata` 사이드카는 Kubernetes 안에서 백업 클라이언트와 CSI 드라이버를 연결합니다.

클라이언트는 `GetMetadataAllocated`로 특정 스냅샷에 할당된 블록 범위를 확인하고, `GetMetadataDelta`로 두 스냅샷 사이에서 바뀐 범위를 가져옵니다. 백업 도구는 이 결과를 이용해 전체 볼륨을 매번 다시 읽지 않고 변경된 블록 중심으로 데이터를 처리할 수 있습니다. 다만 CBT가 백업 파일 자체를 만들거나 복구 무결성을 보장하는 것은 아닙니다. 어떤 블록을 읽을지 알려주는 기반 API에 가깝습니다.

## 적용 전에 확인할 것

공식 호환 조건은 Kubernetes 1.33 이상, CSI 스펙 1.10 이상이며 기준 컨테이너 이미지는 `registry.k8s.io/sig-storage/csi-snapshot-metadata:v1.0.0`입니다. CSI 드라이버가 일반 볼륨 스냅샷을 지원한다고 해서 CBT까지 자동으로 제공하는 것은 아닙니다. 드라이버가 메타데이터 서비스와 사이드카를 실제로 제공하는지 별도로 확인해야 합니다.

현재 대상도 블록 볼륨으로 한정됩니다. 파일 볼륨이나 네트워크 파일 공유의 변경 목록 추적은 포함하지 않습니다. 따라서 일반 애플리케이션 개발자보다는 CSI 드라이버 유지보수자, 스토리지 플랫폼 팀, 백업 제품 개발자에게 직접적인 변화입니다.

처음 검증한다면 공식 `hostpath` 드라이버 예제로 전체 호출 흐름을 재현한 뒤 다음을 확인하는 편이 좋습니다.

- 두 스냅샷 사이 변경 블록이 실제 데이터 변경과 일치하는지
- 메타데이터 조회 실패 때 전체 백업으로 전환되는지
- 백업뿐 아니라 복구 테스트에서도 데이터가 일치하는지
- Alpha 리소스와 소비자를 모두 찾고 같은 배포 창에서 전환할 수 있는지

## 한 줄 결론

Kubernetes CBT Beta는 증분 백업을 CSI 표준 흐름 안으로 가져오는 의미 있는 단계입니다. 다만 현재는 블록 볼륨용 메타데이터 API이며 자동 마이그레이션이나 백업 완결성을 제공하지 않으므로, 드라이버 지원과 복구 검증이 끝난 환경부터 제한적으로 도입하는 것이 맞습니다.

[Kubernetes 공식 원문](https://kubernetes.io/blog/2026/09/14/csi-changed-block-tracking-beta/)
