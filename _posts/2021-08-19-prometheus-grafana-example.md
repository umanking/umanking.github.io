---
layout: post
title: Prometheus  + Grafana + docker  셋팅하기 
date: 2021-08-19 20:46 +0900
toc: true
tags: [prometheus, grafana]
categories: [prometheus, grafana]
image: 'https://aptira.com/wp-content/uploads/2019/05/aptira_grafana_prometheus_training.png'
description: 설명...
---

## 1. 들어가며 
Prometheus,Grafan를 Docker로 띄워보고, nodejs exporter를 통해서 모니터링 대쉬보드를 만들어 보는걸 살펴보자. 

## 2. Prometheus, Grafana란? 

### 2.1. Prometheus?

- SoundCloud사에서 처음 개발을 했다. 지금은 오픈소스 프로젝트
- 오픈소스 모니터링, alerting tool로써, metric을 수집하고, 저장하고, 쿼리를 통해서 데이터를 조회할 수 있다.
- 시계열 데이터를 기반으로 하기 때문에, metric에 관한 정보는 timestamp와 함께 저장된다.
- 아키텍쳐
  - ![](https://prometheus.io/assets/architecture.png)
  - 가장 눈에 띄는 방식은, `기존의 모니터링`은 서버에 agent를 설치하고, agent에서 수집한 metric정보를 backend에 직접 push(전송)하는 방식이었다면, 
  - prometheus는 `Pull 방식`을 사용해서 주기적으로 클라이언트에서 접속해서 데이터를 가져온다. 
  - Alertmanager를 통해서 알람을 발송하고 
  - DataVisualizaton (Grafana)를 통해서 수집한 데이터를 시각화해서 보여준다. 또한, PromQL(쿼리)를 사용해서 쉽게 데이터를 저장할 수 있다.

### 2.2. Grafana? 

-  데이터 시각화 툴로, 모니터링 및 분석을 위한 오픈소스이다. 

## 3. Nodejs exporter 메트릭 수집하기 

- Prometheus 가 수집할 수 있는 메트릭 지표를 제공해주는 nodejs exporter를 띄운다.
- 다운로드: [https://github.com/prometheus/node_exporter/releases](https://github.com/prometheus/node_exporter/releases)
- 다운로드 폴더를 압축해제하고, 폴더로 이동해서 `./node_exporter`  를 실행하면 
- localhost:9100으로 접속해서 metrics 정보를 클릭해 볼수 있다. 

## 4. Prometheus

`prometheus.yml` 파일에

```yaml
 scrape_configs:
   - job_name: 'node_exporter'
     static_configs:
       - targets: ['host.docker.internal:9100']
```

여기서 targets에는 수집할 메트릭 정보를 제공해주는 서버정보를 넣으면 된다. mac을 사용하고, local에서만 띄우기 때문에 `host.docker.internal:9100` 이라고 사용했다. 실제 서버라면 `ip:port` 로 매핑될 것이다. 

```shell
$ docker run -p 9090:9090 -v /Users/andrew/dev/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
```

웹에서 http://localhost:9090으로 접속하면 다음과 같이 Prometheus에 접속할 수 있다. 

Status메뉴에서 Targets를 보면 `prometheus.yml` 파일에서 target으로 셋팅한 정보가 등록된 것을 확인할 수 있다. 

![무제](https://user-images.githubusercontent.com/28615416/130016121-41bed99e-7d1c-4641-ad47-3a8d9d71f346.png)



Main에서 다양한 쿼리들을 입력해서 Graph형태로 만들어서 볼 수 있다. 

<img width="1018" alt="스크린샷 2021-08-19 오후 3 05 35" src="https://user-images.githubusercontent.com/28615416/130016824-b5ba0a84-d716-4bc8-bcde-9d8a56442577.png">



## 5. Grafana

```shell
$ docker run -d -p 3000:3000 grafana/grafana
```

웹에서 http://localhost:3000 으로 접속 할 수 있다. (초기 비밀번호: admin/admin)

이제 Grafana에서 Datasource를 Prometheus로 설정하고, Prometheus에서 바라보는 exporter를 dash보드 형태로 구성할 수 있다. 

로그인 이후에, Configuration - Add data soruce를 한다. 

<img width="1006" alt="스크린샷 2021-08-19 오후 3 12 38" src="https://user-images.githubusercontent.com/28615416/130017249-de1ae4d6-bfed-4e6e-929a-74d91f30f2d8.png">



prometheus를 선택하고 

- url에 : prometheus 서버 정보를 입력한다. (mac환경에서 docker로 띄웠기 때문에, `host.docker.internal`로 설정하였다.)
- `save & test`  버튼을 누르고 저장한다. 

<img width="1010" alt="스크린샷 2021-08-19 오후 3 12 06" src="https://user-images.githubusercontent.com/28615416/130017235-c631b789-9e2b-497e-8449-4c4ae8cf1543.png">



- 이제는 create dashboard를 해서, dashboard에 들어갈 panel항목들을 자신이 보고 싶어하는 지표들을 넣어서, 구성할 수 있다. 
- 여기에서는 몇번만 클릭하다보면, 사용법을 익힐수 있을것 이라 생각한다.
- 무엇보다도 중요한 것은 어떤 지표를 바라볼지? 그리고 어떤 시점에 알람이 울리도록 설정할지 이런 부분이 훨씬 중요할것 같다. 

## 6. 정리

- 간단하게 prometheus와 grafana를 docker로 띄우고, nodejs_exporter를 통해서 metric을 확인해보는 예제를 살펴보았다. 
- nodejs_exporter보다는, spring boot의 actuator를 이용한 `의미있는 지표`들을 한번 살펴보는 것도 좋은것 같다. ✅
- 또한, 개별 docker 명령어를 실행하기 보다는 하나의 spring sample프로젝트로 구성해서, docker-compose.yml 파일통해서 관리하는게 더 좋을것 같다. 

