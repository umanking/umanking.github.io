---
title: 'Mac Fan control 하기(feat, 뜨거운 맥북 식히기)'
description: >-
  다운로드 해당 프로그램을 설치하면, left side와 right side의 팬설정이 뜬다. 보통은 자동으로 되어 있을텐데, CPU
  PECI에 따라 를 클릭한 후에 조금 더 낮은 온도 범위에서 Fan이 동작하도록 변경하자.
date: '2021-07-06T14:32:00+09:00'
permalink: /2021/07/06/mac-fan-control-setting/
section: infra
hub: tools
type: deepdive
level: 중급
tags:
  - mac
  - tip
image: '/images/posts/da244352e0e5.png'
---


## 1. Mac Fan control 하기

- [다운로드](https://crystalidea.com/macs-fan-control/download) 

![스크린샷 2021-07-06 오후 2 26 32](/images/posts/f67c6e2a4ce5.png)

해당 프로그램을 설치하면, left side와 right side의 팬설정이 뜬다. 보통은 자동으로 되어 있을텐데, `CPU PECI에 따라` 를 클릭한 후에 조금 더 낮은 온도 범위에서 Fan이 동작하도록 변경하자. 

### 1.1. 설정 방법
![스크린샷 2021-07-06 오후 2 24 53](/images/posts/8d3d2665b356.png)

`센서에 따라 지정` 을 선택하고 `CPU PECI` 를 선택한다. 

- 최소 온도는 42도 설정 
- 최대 온도는 85도 설정

위에서는 `Left side`만 설정했지만, `Right side`도 똑같이 적용한다.

### 1.2. 메뉴바에 Fan 표시하기
![스크린샷 2021-07-06 오후 2 24 47](/images/posts/3bebac00fa0d.png)

해당 프로그램의 환경설정으로 들어가서 메뉴바에 아이콘이 보이도록 하자! 





![스크린샷 2021-07-06 오후 2 25 28](/images/posts/30e479fcdf96.png)

다음과 같이 `메뉴바` 에 해당 팬에서 돌고 있는 `RPM`과 `온도값`이 나온다. 

너무 민감하게 설정하면, FAN소리가 시끄러울수도 있지만, 개인적으로는 온도가 높아서 뜨거워지는 것보다는 자주 식혀주는게 좋은 것 같다.
