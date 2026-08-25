---
title: IntelliJ Column Selection Mode 모드로 작업 쉽게 하기
description: 'IntelliJ에서 컬럼 Selection 모드에 대해서 알아보고, 단축키를 통해서 작업을 쉽게 하는 방법을 알아보자.'
date: '2021-06-30T21:37:00+09:00'
permalink: /2021/06/30/intellij-column-selection-mode/
section: infra
hub: tools
type: deepdive
level: 중급
tags:
  - intellij
image: >-
  /images/posts/234c7b8edf52.jpg
---
## 1. IntelliJ column selection 모드 

외부 모듈을 연동할때 `ErrorCode`나 `은행 코드` 와 같은 값을 매핑할 일이 많은데, 

IntelliJ에서 제공하는 Column Selection Mode를 통해서 쉽게 작업을 할 수 있다. 



## 2. 사용방법

1. 단축키: ⌘ + ⇧ + 8  

2. 액션 명령어: ⇧⇧ 에서 `column selection mode`  엔터!!

   <img width="830" alt="스크린샷 2021-06-30 오후 9 15 18" src="/images/posts/a7956e0032d2.png">

- 해당 모드인 경우에 다음과 같이 `아래 바` 에 `Column`이라는 표시가 보인다.
  <img width="519" alt="스크린샷 2021-06-30 오후 9 19 09" src="/images/posts/668f0d6380c9.png">



## 3. 실제 사용해보자!

1. 다음과 같이 에러코드를 정의한 문서가 있다. 
   <img width="541" alt="스크린샷 2021-06-30 오후 9 12 12" src="/images/posts/1c3d784debf5.png">
2. 에러 코드 부분만 복사를 해서, 작업할 Enum 파일에 붙여넣는다. 
3.  `⇧ +  위/아래 방향키`로 멀티 커서로 선택한다.

![Jun-30-2021 21-21-26](/images/posts/e7be4779cce8.gif)

다음과 같이 사용할 수 있다.
![Jun-30-2021 21-35-29](/images/posts/8069d9432322.gif)

