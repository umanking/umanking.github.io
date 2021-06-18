---
layout: post
title: IntelliJ, 매크로 활용하기(Feat.Thymeleaf 수정된거 즉각 반영하기)
date: 2020-03-06 11:02 +0900
---

현재 프로젝트는 SpringMVC 와 View 엔진으로 Thymeleaf 를 사용하고 있습니다. View쪽 작업도 같이 한다는 의미이고, IntelliJ에서 파일 변화를 감지하기 위해서는 `Rebuild Project(⌘ + ⇧ + F9)` 를 해야지 수정한 부분이 반영 됐다.

## 어떻게?

하지만 매번 저렇게 수정하고 리빌드를 하는 행위 자체가 낭비되고 있어서 `IntelliJ`에서 지원하는 `매크로`를 활용 하는 방법을 소개한다.
매크로를 통해서 `저장` 버튼을 눌렀을 때 ReBuild Project까지 실행 할 수 있도록 해보자.

![](https://user-images.githubusercontent.com/28615416/76047094-1aacdb80-5fa5-11ea-8200-a8174b531bb2.png)

먼저 `Start Macro Recording`를 클릭하고 새로운 매크로를 지정 한다. 이때 무조건 단축키를 활용해야 한다.

`⌘ + s` 를 누르고 `⌘ + ⇧ + F9` 를 누르고 저장한다.
macro 이름을 지정한다. 저장과 빌드를 동시에 하므로 `save and build` 라고 이름을 지었다.

![](https://user-images.githubusercontent.com/28615416/76047092-1a144500-5fa5-11ea-869e-80ea88f336cd.png)

잘 저장된 것을 확인한다.

![](https://user-images.githubusercontent.com/28615416/76047578-788df300-5fa6-11ea-8d4b-0153064bd3fe.png)

이제 keymap에서 위에서 저장했던 `매크로(save and build)`를 찾아서 기존의 저장하는 `⌘ + s`를 대체 한다.
이제 실제로 저장을 하게 되면, 위에서 지정했던 매크로 동작대로, 저장 + Rebuild Project를 한다.
