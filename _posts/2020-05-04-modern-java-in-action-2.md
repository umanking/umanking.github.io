---
layout: post
title: "Modern Java in Action #2. 동작파라미터화 코드 전달하기"
date: 2020-05-04 15:21 +0900
tags: [java]
image: '/images/java.png'
toc: true
description: Modern Java in action의 동작파라미터화 코드를 전달하는 방법에 대한 요약입니다.
---

변화하는 요구사항은 소프트웨어 엔지니어링에서 피할 수 없는 문제다. 예를 들어 농부가 재고목록을 조사를 쉽게 할 수 있도록 돕는 애플리케이션이 있다고 가정하자. 농부는 이렇게 말할 것이다. "녹색 사과를 모두 찾고 싶어요" 또, 하룻밤을 자고 일어났더니 '150그램 이상인 사과를 모두 찾고 싶어요' 또 하룻밤 자고 일어났더니 '150그램 이상이면서 녹색인 사과를 찾을 수 있으면 좋겠네요' 라고 말한다.

이렇게 시시각각 변하는 사용자 요구사항에 어떻게 대응해야 할까? **동작 파라미터화를 이용하면 자주 바뀌는 요구사항에 요과적으로 대응 할 수 있다.** 동작 파라미터화란 아직은 어떻게 실행할 것인지 결정하지 않은 코드 블록을 의미한다. 이 코드 블록은 나중에 프로그램에서 호출한다. 즉, 코드 블록의 실행은 나중으로 미뤄진다.


## 첫번째 시도: 녹색 사과 필터링

```java
public static List<Apple> filterGreenApples(List<Apple> inventory) {
    List<Apple> result = new ArrayList<>();
    for (Apple apple : inventory) {
        if (GREEN.equals(apple.getColor())) {
            result.add(apple);
        }
    }
    return result;
}

```

그런데 갑자기 농부가 녹색사과 말고 빨간사과도 필터링 하고 싶어졌다. 어떻게 고쳐야 하나?

보통 filterRedApples라는 메서드를 만들고, if 조건문을 수정할 수 있다. 문제는 이후에 다양한 색상의 조건들이 생겼을 때 유연하게 대처할 수 없다. 이런 상황에서 좋은 규칙이 있다.

> 거의 비슷한 코드가 반복 존재한다면 그 코드를 추상화 한다.

## 두번째 시도: 색을 파라미터화

어떻게 해야지 fitlerGreenApples의 코드를 반복 사용하지 않고, filterRedApples를 구현할 수 있을까? 색을 파라미터화해서 요구사항에 유연하게 대응하는 코드를 만들 수 있다.

```java
public static List<Apple> filterApplesByColor(List<Apple> inventory, Color color) {
    List<Apple> result = new ArrayList<>();
    for (Apple apple: inventory) {
        if (apple.getColor().equals(color)){
            result.add(apple);
        }
    }
    return result;
}
```

이제 농부도 만족할 것이다. 다음 클라이언트 코드다.

```java
List<Apple> greenApples = filterApplesByColor(inventory, GREEN);
List<Apple> redApples = filterApplesByColor(inventory, RED);
```

하지만,, 농부가 다시 ‘색 이외에도 가벼운 사과, 무거운 사과도 구별할 수 있으면 좋겠다고 한다. 보통 150그램 이상이면 무거운 사과입니다’ 라고 요구한다. 😤

그래서 이번에는 **무게도 파라미터화를 한다.**

```java
public static List<Apple> filterApplesByWeight(List<Apple> inventory, int weight) {
    List<Apple> result = new ArrayList<>();
    for (Apple apple: inventory) {
        if (apple.getWeight() > weight){
            result.add(apple);
        }
    }
    return result;
}
```

하지만 구현코드를 자세히 보면, 색을 필터링하는 것과 대부분 중복이다. 소프트웨어 공학의 DRY(Don’t repeat yourself) 원칙을 어긴다.

## 세번째 시도: 가능한 모든 속성으로 필터링

```java
public static List<Apple> filterApples(List<Apple> inventory, Color color, int weight, boolean flag) {
    List<Apple> result = new ArrayList<>();
    for (Apple apple: inventory) {
        if ((flag && apple.getColor().eqausl(color)) ||
            (!flag && apple.getWeight() > weight)) {
            result.add(apple);
        }
    }
    return result;
}
```

flag값을 주어서 true인 경우에는 color로 필터링, false인 경우에는 무게로 필터링한다.

```java
List<Apple> greenApples = filterApples(inventory, GREEN, 0, true);
List<Apple> redApples = filterApples(inventory, NULL, 150, false);
```

하지만 정말 형편없는 코드다. true, false 값이 무엇을 의미하는지, 요구사항이 바뀌었을 때 유연하게 대응할수도 없다.

## 동작파라미터화

위의 파라미터를 추가하는 방법이 아닌, 변화화하는 요구사항에 좀 더 유연하게 대응할 수 있는 방법이 절실히 필요하다.

사과의 어떤 속성(color, weight)에 기초해서 불리언 값을 반환하는 방법이 있다. 참,또는 거짓을 반환하는 함수를 Predicate라고 한다. 선택 조건을 결정하는 인터페이스를 정의하자.

```java
public interface ApplePredicate {
    boolean test(Apple apple);
}
```

다양한 선택 조건을 대표하는 여러 버전의 ApplePredicate를 정의할 수 있다.

```java
public class AppleHeavyWeightPredicate implements ApplePredicate {
    public boolean test(Apple apple){
        return apple.getWeight() > 150;
    }
}

public class AppleGreenColorPredicate implements ApplePredicate {
    public boolean test(Apple apple){
        return GREEN.equals(apple.getColor());
    }
}
```

위 조건에 따라 filter 메서드가 다르게 동작할 것이라고 예상할 수 있다. 이를 전략디자인 패턴이라고 한다.

## 네번째 시도: 추상적 조건으로 필터링

```java
public static List<Apple> filterApples(List<Apple> inventory, ApplePredicate p) {
    List<Apple> result = new ArrayList<>();
    for (Apple apple: inventory) {
        if (p.test(apple)){
            result.add(apple);
        }
    }
    return result;
}
```

### 코드/동작 전달하기

첫번째 코드에 비해 더 유연한 코드를 얻었고, 동시에 가독성도 좋아졌을 뿐 아니라 사용하기도 쉬워졌다. 이제 필요한 대로 다양한 ApplePredicate를 만들어서 filterApples메서드로 전달할 수 있다. 예를 들어 농부가 150그램이 넘는 빨간 사과를 검색해 달라고 부탁하면 우리는 ApplePredicate를 적절하게 구현하는 클래스만 만들면 된다.

```java
public class AppleRedHeavyPredicate implements ApplePredicate {
    public boolean test(Apple apple){
        return apple.getWeight() > 150 && RED.equals(apple.getColor());
    }
}
```

실제 사용하는 코드는 다음과 같다.

```java
List<Apple> redAndHeavyApples = filterApples(inventory, new AppleRedAndHeavyPredicate());
```

우리가 전달한 ApplePredicate 객체에 의해 filterApples 메서드의 동작이 결정된다. **filterApples 메서드의 동작을 파라미터화 한 것이다.**

### 한 개의 파라미터, 다양한 동작

지금까지 살펴본 것처럼 컬렉션 탐색 로직과 각 항목에 적용할 동작을 분리할 수 있다는 것이 동작 파라미터화의 강점이다. 한 메서드가 다른 동작을 수행하도록 재활용 할 수 있다. 따라서 유연한 API 를 만들때 동작 파라미터화가 중요한 역할을 한다.

---

잠시 한 템포 쉬어가며…..

지금까지 구현하는 여러 클래스를 정의한 다음에 인스턴스화해야 한다. 이는 상당히 번거로운 작업이다. 자바는 클래스의 선언과 인스턴스화를 동시에 수행할 수 있도록 익명클래스 라는 기법을 제공한다.

## 다섯번째 시도: 익명클래스 사용

```java
List<Apple> redAndHeavyApples = filterApples(inventory, new ApplePredicate(){
  	// 직접 정의해서 사용한다.
    public boolean test(Apple apple){
        return RED.equals(apple.getColor());
    }
});
```

## 여섯번째 시도: 람다 표현식 사용

```java
List<Apple> redAndHeavyApples = filterApples(inventory, (Apple apple) -> RED.equals(apple.getColor()));
```

![](https://user-images.githubusercontent.com/28615416/80940188-f12ff500-8e19-11ea-98cc-c5c7347e51c5.png)

지금 까지 살펴본 내용을 도식화 하면 위와 같다. `값 파라미터화` 와 `동작 파라미터화`는 뻣뻣함과 유연함으로 분류할 수 있다. 요구사항에 변화에 유연하게 대응할 수 있는게 가장 큰 장점이다. 그리고 `동작파라미터화` 는 왼쪽 클래스 -> 익명 클래스 -> 람다 순으로 발전해 나갈 수 있다. 특히나 나중에 소개하겠지만 디자인 패턴에서 보통은 클래스를 정의하고, 인스턴스화 시켜서 (런타임에) 파라미터로 넘겨주는 경우가 많은데 이를 람다식으로 대체할 수 있다.

## 일곱번째 시도: 리스트 형식으로 추상화

```java
public interface Predicate<T> {
    boolean test(T t);
}
```

```java
public static<T> List<T> filter(List<T> list, Predicate<T> p) {
    List<T> result = new ArrayList<>();
    for(T e: list){
        if (p.test(e)){
            result.add(e);
        }
    }
    return result;
}
```

이제 Apple뿐만 아니라, 오렌지, 바나나, 정수, 문자열 등의 리스트에 필터 메서드를 사용할 수 있다. 다음은 람다 표현식을 사용한 예제이다.

```java
List<Apple> redApples = filter(inventory, (Apple apple) -> RED.equals(apple.getColor()));
List<Integer> evenNumbers = filter(numbers, (Integer i) -> i % 2 == 0);
```

## 정리

- 재고목록을 조사하는 애플리케이션 예제를 살펴보았다.
- 농부의 요구사항은 시시각각 변하고, 처음에는 객체의 속성을 파라미터화 했다. 당연히 중복이 발생했고, 중복을 제거하기 위해 추상화를 했다.
- 이 과정에서 아직 결정되지 않은 동작들을 파라미터로 넘기는 방법을 살펴보았다. (전략패턴)
- 하지만 클래스를 정의하고, 직접 인스턴스화 하는 조금 장황한 과정을 거쳤다.
- 익명클래스로 대체할 수 있었고
- 익명클래스는 람다식으로 대체할 수 있었다.
- 마지막으로 리스트 형식으로 추상화해서 범용적으로 사용할 수 있는 filter를 만들었다.
