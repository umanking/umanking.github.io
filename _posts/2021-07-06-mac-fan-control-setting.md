---
layout: post
title: Mac Fan control 하기(feat, 뜨거운 맥북 식히기)
date: 2021-07-06 14:32 +0900
image: 'https://cdn.dribbble.com/users/69146/screenshots/994781/fan.png'
tags: [tip, mac]
categories: [mac]
toc: true
---


## 1. Mac Fan control 하기

- [다운로드](https://crystalidea.com/macs-fan-control/download) 

![스크린샷 2021-07-06 오후 2 26 32](https://user-images.githubusercontent.com/28615416/124546945-58a26400-de66-11eb-89fc-3922c552598c.png)

해당 프로그램을 설치하면, left side와 right side의 팬설정이 뜬다. 보통은 자동으로 되어 있을텐데, `CPU PECI에 따라` 를 클릭한 후에 조금 더 낮은 온도 범위에서 Fan이 동작하도록 변경하자. 

### 1.1. 설정 방법
![스크린샷 2021-07-06 오후 2 24 53](https://user-images.githubusercontent.com/28615416/124546937-550edd00-de66-11eb-82e9-4ddc3016b71b.png)

`센서에 따라 지정` 을 선택하고 `CPU PECI` 를 선택한다. 

- 최소 온도는 42도 설정 
- 최대 온도는 85도 설정

위에서는 `Left side`만 설정했지만, `Right side`도 똑같이 적용한다.

### 1.2. 메뉴바에 Fan 표시하기
![스크린샷 2021-07-06 오후 2 24 47](https://user-images.githubusercontent.com/28615416/124546943-5809cd80-de66-11eb-914e-c6cacf128eaf.png)

해당 프로그램의 환경설정으로 들어가서 메뉴바에 아이콘이 보이도록 하자! 





![스크린샷 2021-07-06 오후 2 25 28](https://user-images.githubusercontent.com/28615416/124546942-5809cd80-de66-11eb-888d-cb31df12a2a5.png)

다음과 같이 `메뉴바` 에 해당 팬에서 돌고 있는 `RPM`과 `온도값`이 나온다. 

너무 민감하게 설정하면, FAN소리가 시끄러울수도 있지만, 개인적으로는 온도가 높아서 뜨거워지는 것보다는 자주 식혀주는게 좋은 것 같다.