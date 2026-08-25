---
title: iterms 한글깨짐 문제
description: iterms에서 Shell 창에서 한글깨짐 문제에 대해서 알아보자 .
date: '2021-07-06T13:58:00+09:00'
permalink: /2021/07/06/iterms-unicode-normalization/
section: infra
hub: tools
type: troubleshooting
level: 중급
tags:
  - iterms
  - tip
image: '/images/posts/63c170e5fc32.jpg'
---
## 1. iterms 한글깨짐 문제 


![스크린샷 2021-07-06 오후 1 52 42](/images/posts/0020eed462d1.png)

Iterms 설정에서 Profiles - Text 에서 `Unicode normalization from` 이 NONE으로 되어있는데 이 부분을 `NFC` 로 변경한다. 


실행후에 한글이 제대로 표현된다.

![스크린샷 2021-07-06 오후 1 56 33](/images/posts/fd3c7f010ce0.png)
