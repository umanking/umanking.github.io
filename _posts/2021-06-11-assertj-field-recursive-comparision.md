---
layout: post
title: "[AserrtJ] 필드값 재귀적으로 테스트 하는 방법"
date: 2021-06-11 10:51:04
tags: [assertj, junit5]
toc: true
image: '/images/junit5.png'
description: AssertJ의 필드값을 재귀적으로 비교해서 테스트 하는 방법에 대해서 알아보자
category: test 
---

## 1. 문제점

실무에서 AssertJ로 테스트케이스를 작성하는데, 모든 필드값들이 일치하는지 비교하는 코드를 작성한다. 한두개의 필드라면 상관이 없는데, 필드값이 많은 경우에 `빼먹는 경우도 생기고`, 무엇보다도 `동일한 형태의 코드 중복`이 발생한다. 

```java
void test() {
  Account actual = new Account("andrew", 32);
  Account expected = new Account("andrew", 32);  
  
  // 모든 필드를 비교해야 한다
  assertThat(actual.getName()).isEuqualTo(expected.getName());
  assertThat(actual.getAge()).isEuqualTo(expected.getAge());
}
```



## 2. 해결책

혹시나 하는 마음에 찾아봤는데, 있었다. `usingRecursiveComparision()` 해당 메서드를 이용하면 재귀적으로 객체의 필드값 항목들을 비교한다.  여기서 추가적으로 Id값이 존재하는 객체인경우에, 해당 필드값은 무시하고 싶은 경우가 있는데 이경우에는 `ignoreFields(String... fieldsToIgnore)`에 해당 필드값을 추가할 수 있다.

> - 무시하고 싶은 필드를 직접 추가할 수도 있고  ignoringFields(String… fieldsToIgnore)
> - 무시하고 싶은 필드를 정규표현식으로  ignoreFieldsMatchingRegexes(String… regexes)
> - 무시하고 싶은 필드를 타입으로 ignoringFieldsOfTypes(Class… typesToIgnore)

```java
void test() {
  Account actual = new Account(1L, "andrew", 32);
  Account expected = new Account(2L, "andrew", 32);  
  
  assertThat(actual)
    .usingRecursiveComparison("id")
    .isEuqualTo(expected);
}
```



## 3. 맺음말

- 시간나면 AssertJ 문서보면서 어떤 메서드들이 있는지 살펴보는게 좋을것 같다. 
  - Iterable and array
  - Field by field recursive comparison 



## 4. 참고

- https://assertj.github.io/doc/#assertj-core-group-filtering
