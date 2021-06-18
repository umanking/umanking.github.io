---
layout: post
title: "JUnit5 사용기"
date: 2020-02-15 20:51 +0900
 
categories: [spring]
tags: [spring, junit5]
---

# Junit5 사용기

> JUnit5의 새로운 것들 혹은 자주 사용하는 것들에 대해서 알아보자.
## @ParameterizedTest

`@Test`대신에 `@ParameterizedTest` 를 사용하는 건데, 도대체 언제 사용할까?
파라미터 값을 다양하게 테스트를 하는 경우에 사용한다.

```java
public class Numbers {
    public static boolean isEven(final int number) {
        return number % 2 == 0;
    }
}
```

짝수인지를 검사하는 `isEven` 정적 메서드를 만든다.

```java
    @ParameterizedTest
    @ValueSource(ints = {2,4,6,8,9, Integer.MAX_VALUE})
    void isEven(int number) {
        assertTrue(Numbers.isEven(number));
    }
```

다음과 같이 `@ValueSource`를 검사하고자 하는 인자의 값을 `배열`에 담아서 테스트 케이스를 돌리면 다음과 같다.
@ValueSource에 담은 파라미터 하나하나를 Junit이 직접 테스트를 전부 다 한다. 👍
![](/assets/images/junit-test.png)

또한, 다음과 같은 놈들과 @ParameterizedTest랑 같이 사용할 수도 있다.
파라미터의 Null과 Empty인 경우에도 매번 따로 테스트 케이스를 작성하지 않아도 된다.

- @NullSource
- @NullAndEmptySource

## @DisplayName

Junit4에서는 메서드에 한글 이름을 넣어서 테스트 하는 경우를 봤다. 이게 의견이 분분해서 누군가는 테스트는 비즈니스 로직을 잘 품고 있어야 하기 때문에 한국인 개발자끼리 일하는 상황이면 괜찮다고 하는 분들도 있고, 절대적으로 메서드를 한글로 쓰는 것을 용냡하지 못하는 분들도 봤다. 아무튼 이런 문제를 @DisplayName을 통해서 해당 메서드가 정확히 무슨 일을 하는 지 명시할 수 있다.

```java
    @DisplayName("짝수 테스트")
    @ParameterizedTest
    @ValueSource(ints = {2,4,6,8,9, Integer.MAX_VALUE})
    void isEven(int number) {
        assertTrue(Numbers.isEven(number));
    }
```

## @BeforeAll, @BeforeEach, @AfterAll, @AfterEach

각각 Junit4에서 사용하던 어노테이션명이 변했다.

- @BeforeClass -> @BeforeAll : 테스트 실행전 딱 한번 실행함 (static 으로 만들어야 함)
- @Before -> @BeforeEach : 모든 테스트 전에 실행함
- @AfterClass -> @AfterAll : 테스트 실행 후 딱 한 번 실행함 (static 으로 만들어야 함)
- @After -> @AfterEach : 모든 테스트 각각 종료 후에 실행함

## Exception Test

이번에는 처음 짝수인지를 검증하는 메서드에 기능을 하나 추가 해보자.

```java
    public static boolean isEven(final int number) {
        if (number < 0) {
            throw new IllegalArgumentException();
        }
        return number % 2 == 0;
    }
```

0보다 작은 값이 들어온 경우에 `IllegalArgumentException`를 발생 시킨다.

```java
    @DisplayName("짝수 테스트: 음수값인 경우에 예외 발생")
    @ParameterizedTest
    @ValueSource(ints = {-1, -2})
    void isEven_negative_test(int number) {
        assertThatExceptionOfType(IllegalArgumentException.class)
                .isThrownBy(() -> Numbers.isEven(number));
    }
```

역시나 @ParameterizedTest와 `assertThatExceptionOfType`을 활용한다.
발생할 exception클래스를 적고 누구에 의해서 던져지는지(isThrownBy)를 명시한다. 다만 해당 메서드의 인자는 ThrowingCallable 이기 때문에 람다형태로 작성해 준다.

## 정리

아주 간단한 Junit 테스트 use case를 작성했다. 더 많이 사용하고, 고민 하고 다시 포스팅을 해야 겠다.
