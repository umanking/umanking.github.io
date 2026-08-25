---
title: IntelliJ 커맨드 명령어(idea .)으로 실행하기
description: >-
  Jetbrain ToolBox를 설치한다. Jetbrain Toolbox는 Jetbrain 사에서 제공하는 여러가지 IDE를 쉽게 관리해주는
  프로그램이다. Toolbox에서 설치된 IntelliJ의 Setting을 클릭한다.
date: '2021-06-29T13:50:00+09:00'
permalink: /2021/06/29/intellij-run-script/
section: infra
hub: tools
type: reference
level: 중급
tags:
  - intellij
image: >-
  /images/posts/234c7b8edf52.jpg
---
## 1. IntelliJ 커맨드 명령어(idea .)으로 실행하기 

![ScreenShot 1](/images/posts/ff1f8257b2ec.png)

- Jetbrain ToolBox를 설치한다. 
  - Jetbrain Toolbox는 Jetbrain 사에서 제공하는 여러가지 IDE를 쉽게 관리해주는 프로그램이다.
- Toolbox에서 설치된 IntelliJ의 Setting을 클릭한다. 

![ScreenShot 2](/images/posts/d1af3d00ebce.png)

- Shell scripts 로하고, 스크립트 실행파일이 놓일 위치를 지정한다. 
- 저는 ~/jetbrains로 폴더를 지정했다. 
- vi ~/.zshrc에 다음과 같은 PATH를 추가한다. 
  - `$ export PATH=~/jetbrains:$PATH` 
  -  `$ source ~/.zshrc` 로 적용한다.

![스크린샷 2021-06-29 오후 9 37 45](/images/posts/e3ecae3a2e95.png)
- 실제 sample 프로젝트 폴더로 이동한 후에, `idea .`를 누르면 intellij 프로그램이 실행된다. 
- 실제 idea 스크립트가 어떻게 형성되었는지 확인할려면 
  - ~/jetbrains 폴더에 가서 확인하자.

    
