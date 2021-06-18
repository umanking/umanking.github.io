---
layout: post
title: "Modern Java In Action #9. 람다로 객체지향 디자인 패턴 리팩토링하기"
date: 2020-05-04 15:29 +0900
---

> 모던자바인 액션에서 나온 객체지향 디자인 패턴을 람다로 리팩토링 하는 예제 입니다.

## 전략패턴
<!-- more -->

![](https://user-images.githubusercontent.com/28615416/80937488-4f57da80-8e10-11ea-9922-7eba1866b641.png)

전략패턴은 런타임에 적절한 알고리즘을 선택하고 주입하는 기법이다.

예를 들어 입력 String값을 오직 소문자 또는 숫자로 이루어져있는지를 검증하는 Validator를 전략패턴을 통해서 만든다고 가정해보자.

```java
public interface ValidationStrategy {
    boolean execute(String s);
}
```

```java
public class isAllLowerCase implements ValidationStrategy {
    public boolean execute(String s ) {
        return s.matches("[a-z]+");
    }
}

public class isNumeric implements ValidationStrategy {
    public boolean execute(String s) {
        return s.matches("\\d+");
    }
}
```

ValidationStrategy 인터페이스를 구현한 구체 클래스를 작성한다.

```java
public class Validator {
    private final ValidationStrategy validationStrategy;

    public Validator(ValidationStrategy validationStrategy) {
        this.validationStrategy = validationStrategy;
    }

    public boolean validate(String s) {
        return this.validationStrategy.execute(s);
    }
}
```

실제 클라이언트에서 사용하는 코드

```java
public static main(String[] args){
    String num = "12345";
    String word = "aabbcc";
    // Validaiton 전략을 IsNumeric으로 선택함
    Validator numericValidator = new Validator(new IsNumeric());
    numericValidator.validate(num); // true

    Validator lowerCaseValidator = new Validator(new isAllLowerCase());
    lowerCaseValidator.validate(word); // true
}
```

## 람다 표현식 사용

위의 전략패턴을 보게되면, `ValidationStrategy` 인터페이스가 함수형 인터페이스이며 `Predicate<String>` 과 같은 함수 디스크립터를 갖고 있음을 파악했을 것이다.

> `Predicate<String>` 함수 디스크립터란, String문자열을 파라미터로 넘기면 -> boolean을 리턴하는 것을 설명하는 함수형 인터페이스를 설명하는 것을 의미한다. Supplier<T>, Consumer<T> Function<T, R> 등등….

```java
    Validator numericValidator = new Validator(s->s.matches("[a-z]+"));
    numericValidator.validate(num); // true

    Validator lowerCaseValidator = new Validator(s-> s.matches("\\d+");
    lowerCaseValidator.validate(word); // true
```

위와 같이 직접 ValidationStrategy 전략을 직접 람다식으로 넘겨줄 수 있다.
