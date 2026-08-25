---
title: IntelliJ IDE 셋팅 동기화(Github Repository를 이용)
description: 'Intellij IDE 환경 셋팅을 Github Repository에 올려서 언제든지, IDE 환경을 동기화 시켜보자!'
date: '2021-07-07T17:43:00+09:00'
permalink: /2021/07/07/intellij-ide-setting-repository/
section: backend
hub: spring
type: reference
level: 중급
tags:
  - intellij
  - ide-setting
image: >-
  https://media.vlpt.us/images/ovan/post/e93cf8ca-449d-45a1-b190-5084887d4c43/intellij_series_logo.jpg
---
## 1. 찾게된 이유
보통은 회사 컴퓨터를 처음 셋팅했을때, 프로그램들을 설치하고, IDE 환경셋팅을 한다. 프로그램 설치는 비교적 금방 끝난다.
하지만 IDE 환경 셋팅은 **Keymap, Live template, color schema 까지** 정말 다채롭게 셋팅했다. 
하지만 이를 어딘가에 저장해 놓지 않으면 다시 처음부터 셋팅해야 한다. 그래서 IDE 환경셋팅을 알아봤다. 

## 2. IntelliJ의 다양한 IDE 환경셋팅 방법 
다양한 IDE환경 셋팅 방법이 존재한다. 
- Zip파일로 Export하는 방법 ❌
- **Github Repository로 올려서 동기화 하는 방법 ✅🙆‍♂️**
- Jetbrains Account로 동기화 하는 방법 ❌

> [https://www.jetbrains.com/help/idea/sharing-your-ide-settings.html](https://www.jetbrains.com/help/idea/sharing-your-ide-settings.html)

하지만 이중에서 Github Repository를 선택했다. 이유는 Zip파일은 매번 파일로 Export를 하고, 파일도 클라우드 어딘가에 보관해야 한다. 
Jetbrains Account로 동기화 하는 방법은, 개인 계정이면 상관없지만 보통은 회사를 옮기면 `회사 계정`으로 새로운 Jetbrain 라이선스를 할당 받는다. 
당연히 계정이 다르니까, 그 이전에 동기화 했던 것도 무용지물이 된다. 
그에 반해, Github repository는 자신의 계정에 remote로 올려놓고, 수시로 update하거나 pull 땡겨와서 덮어쓰기가 가능하다!!

그래서 어떻게 하는지 다음에서 알아보자!



## 3. 레포지토리로 IDE 환경 셋팅 동기화 하는 방법

[File] - [Manager IDE Settings] - [Settings Repository...] 클릭!


![스크린샷 2021-07-07 오후 5 48 33](https://user-images.githubusercontent.com/28615416/124730962-c45efc80-df4c-11eb-9e7f-a713d9f18dc9.png)

Setting Repository를 클릭하면, 다음과 같이 Upstream URL을 입력하는 팝업이 뜬다. 
여기에서 자신의 계정에서 ‼️‼️ **반드시 Private 레포지토리**로 생성한 URL 정보를 입력한다. 필자는 `https://github.com/umanking/intellij-ide-setting-repository` 
다음과 같이 만들었다. 그리고 `Overwrite Remote`를 클릭한다. 조금 이따가, Remote 레포지토리로 푸쉬가 된다!!
해당 저장소에 가면, 테마, live template, keymap, code style등등 IDE Setting값이 `xml` 파일로 올라가 있다.

![스크린샷 2021-07-07 오후 5 49 11](https://user-images.githubusercontent.com/28615416/124730955-c2953900-df4c-11eb-9886-867783f59629.png)


## 4. 실제 다른 컴퓨터에서 불러와서 사용하는 방법 
새로운 컴퓨터에서 IntelliJ의 메뉴 에서 [File] - [Manager IDE Settings] - [Settings Repository...]를 클릭하고
위에서 생성한 URL정보를 불러온다. 그리고 `Overwrite Local` (로컬 영역으로 덮어씌우기)를 한다. 


> 가끔 충돌이 나는경우, Popup으로 충돌날 부분을 알려주고, 이를 해결하고  `Merge` 버튼을 눌러서 하나로 `병합` 한다.
> 그냥 Git에서 소스 관리하듯이 사용한다고 생각하면 쉽다!!!


## 5. 참고 
- [https://www.jetbrains.com/help/idea/sharing-your-ide-settings.html#settings-repository](https://www.jetbrains.com/help/idea/sharing-your-ide-settings.html#settings-repository)
