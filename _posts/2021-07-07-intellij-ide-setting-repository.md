---
layout: post
title: IntelliJ IDE 셋팅 동기화(Github Repository를 이용)
date: 2021-07-07 17:43 +0900
image: 'https://pbs.twimg.com/profile_images/1206618215767584769/zl48EuhC_400x400.jpg'
tags: [intellij, ide-setting]
toc: true
---

## 1. IntelliJ IDE 셋팅 동기화(Repository를 이용)
IntelliJ에서 IDE 셋팅파일을 `Private Repository`로 올려서, 새로운 환경(컴퓨터)에서 비교적 편하게 셋팅하는 방법을 공유합니다. 
> Private 레포지토리로 만들라고 합니다.

## 2. 방법

![스크린샷 2021-07-07 오후 5 48 33](https://user-images.githubusercontent.com/28615416/124730962-c45efc80-df4c-11eb-9e7f-a713d9f18dc9.png)

- File - Manager IDE Settings - Settings Repository 클릭 



![스크린샷 2021-07-07 오후 5 49 11](https://user-images.githubusercontent.com/28615416/124730955-c2953900-df4c-11eb-9886-867783f59629.png)

- Upstream URL에 자신이 만든 Repository 주소를 입력한다. 
- 처음에는 `Overwrite Remote`로 리모트 저장소로 오버라이트(덮어씌기)를 한다. 
- 해당 저장소에 가면, 테마, live template, keymap, code style등등 IDE Setting값이 `xml` 파일로 올라가 있다.
- 이후에 새로운 컴퓨터 환경에서는 사용할 때는
  - 똑같이 Setting Repository를 해당 주소로 매핑하고
  - `Overwrite Local` (로컬 영역으로 덮어씌우기)를 합니다. 
- 그외에 충돌이 나는경우, Popup으로 충돌날 부분을 알려주고, 이를 해결하고  `Merge` 버튼을 눌러서 하나로 `병합` 한다.


## 3. 참고 
- [sharing-your-ide-settings](https://www.jetbrains.com/help/idea/sharing-your-ide-settings.html#settings-repository)