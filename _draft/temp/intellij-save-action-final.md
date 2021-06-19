---
layout: post
title: IntellJ, 자동으로 final 선언하기(Feat.SaveAction)
date: 2020-03-06 11:01 +0900
---

인텔리J에서 플러그인을 소개해본다.

## Save Action

`save action` 인데 저장 버튼을 누르면 `optimize import`, `code formatting` 같은 것을 해주지만
오늘 소개하는건 무엇보다도 강력한 final을 자동으로 선언해 준다는 것.

`final`의 중요성은 원래는 몰랐으나, 최근에 알게 되었고 이펙티브 자바의 빠지지 않고 등장하는 [Immutable 클래스 만들기](https://umanking.github.io/effective%20java/2020/03/01/effective-java-17.html)에 늘 등장한다. final로 모든걸 cover할 수 는 없지만 적어도 `컴파일` 타임에 변수를 변경한다거나 하는 눈에 보이지 않는 문제를 막아줄 수 는 있다. 물론 세부적으로 Collection의 값 변경(이런건 ImmutableList 와 같은 Guava와 같은 라이브러리를 사용 하면 되지만) 또한 가능하다.

## 설치

![](https://user-images.githubusercontent.com/28615416/76045746-59d92d80-5fa1-11ea-90cf-5f58a1049243.png)

## 사용방법

![](https://user-images.githubusercontent.com/28615416/76045723-4928b780-5fa1-11ea-8513-791dc5585d80.png)

코드 포맷팅은 특히나 실무에서 각자 다를 수 있는 부분이기 때문에 동일하게 가져가는 것이 좋다. 이것 때문에 고생함
아래쪽에 final에 관한 3개의 영역을 켜주면 자동으로 final을 만들어 준다.
