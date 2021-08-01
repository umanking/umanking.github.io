---
layout: post
title: iterms 한글깨짐 문제
date: 2021-07-06 13:58 +0900
image: 'https://iterm2.com/img/logo2x.jpg'
tags: [iterms, tip]
toc: true
description: iterms에서 Shell 창에서 한글깨짐 문제에 대해서 알아보자 .
---
## 1. iterms 한글깨짐 문제 


![스크린샷 2021-07-06 오후 1 52 42](https://user-images.githubusercontent.com/28615416/124544289-cb5d1080-de61-11eb-9a78-6d411202b929.png)

Iterms 설정에서 Profiles - Text 에서 `Unicode normalization from` 이 NONE으로 되어있는데 이 부분을 `NFC` 로 변경한다. 


실행후에 한글이 제대로 표현된다.

![스크린샷 2021-07-06 오후 1 56 33](https://user-images.githubusercontent.com/28615416/124544381-fba4af00-de61-11eb-87c9-ceb0ef7a5a49.png)