---
layout: post
title: IntelliJ Column Selection Mode 모드로 작업 쉽게 하기
date: 2021-06-30 21:37 +0900
image: 'https://pbs.twimg.com/profile_images/1206618215767584769/zl48EuhC_400x400.jpg'
tags: ['intellij']
---
## IntelliJ column selection 모드 

외부 모듈을 연동할때 `ErrorCode`나 `은행 코드` 와 같은 값을 매핑할 일이 많은데, 

IntelliJ에서 제공하는 Column Selection Mode를 통해서 쉽게 작업을 할 수 있다. 



## 사용방법

1. 단축키: ⌘ + ⇧ + 8  

2. 액션 명령어: ⇧⇧ 에서 `column selection mode`  엔터!!

   <img width="830" alt="스크린샷 2021-06-30 오후 9 15 18" src="https://user-images.githubusercontent.com/28615416/123959670-64ff6a80-d9e9-11eb-9b40-1a1a3de37277.png">

- 해당 모드인 경우에 다음과 같이 `아래 바` 에 `Column`이라는 표시가 보인다.
  <img width="519" alt="스크린샷 2021-06-30 오후 9 19 09" src="https://user-images.githubusercontent.com/28615416/123959676-65980100-d9e9-11eb-8737-2a9b0e7f85f0.png">



## 실제 사용해보자!

1. 다음과 같이 에러코드를 정의한 문서가 있다. 
   <img width="541" alt="스크린샷 2021-06-30 오후 9 12 12" src="https://user-images.githubusercontent.com/28615416/123959511-384b5300-d9e9-11eb-8511-c1bd375aa420.png">
2. 에러 코드 부분만 복사를 해서, 작업할 Enum 파일에 붙여넣는다. 
3.  `⇧ +  위/아래 방향키`로 멀티 커서로 선택한다.

![Jun-30-2021 21-21-26](https://user-images.githubusercontent.com/28615416/123959833-924c1880-d9e9-11eb-8473-f5237a33ff13.gif)

다음과 같이 사용할 수 있다.
![Jun-30-2021 21-35-29](https://user-images.githubusercontent.com/28615416/123961293-27034600-d9eb-11eb-98a5-0d20fd8fbc21.gif)

