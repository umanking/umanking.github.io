---
layout: post
title: "Java8 null 대신 Optional"
date: 2020-05-13 08:44 +0900
categories: [java]
tags: [java]
---

> null대신 Optional을 사용하는 이유에 대해서 알아보자

<!-- more -->
다음 처럼 사람이 자동차를 갖고, 자동차는 자동차 보험을 갖는 객체 구조로 구현했다고 하자.

```java
public class Person {
  private Car car;
  public Car getCar() {
    return car;
  }
}

public class Car {
  private Insurance insurance;
  public Insurance getInsurance() {
    return insurance;
  }
}

public class Insurance {
  private String name;
  public String getName() {
    return name;
  }

}
```

다음 코드에서 어떤 문제가 발생할까?

```java
public String getCarInsuranceName(Person person) {
        return person.getCar().getInsurance().getName();
    }
}
```

person 객체가 null 이면, getCar() 참조가 null이면 NullpointerException이 발생한다.

## 보수적인 자세로 NullPointerException 줄이기

```java
public String getCarInsuranceName2(Person person) {
  if (person != null) {
    Car car = person.getCar();
    if (car != null) {
      Insurance insurance = car.getInsurance();
      if (insurance != null) {
        return insurance.getName();
      }
    }
  }

  return "Unknown";
}
```

상식적으로는 모든 회사의 이름이 있으므로 보험회사의 이름이 null인지는 확인하지 않았다. 우리가 확실히 알고 있는 영역을 모델링 할때는 이런 지식을 활용해서 null 확인을 생략할 수 있지만, 데이터를 자바 클래스로 모델링 할때는 이같은 사실을 단정하기 어렵다.

위 코드는 모든 변수가 null 인지 의심하므로 변수를 접근할 때마다 중첩된 if가 추가되면서 코드 들여쓰기 수준이 증가한다. 이와 같은 반복 패턴 코드를 깊은 의심(deep doubt)라 한다.

```java
public String getCarInsuranceName2(Person person) {
  if (person != null) {
    Car car = person.getCar();
    if (car != null) {
      Insurance insurance = car.getInsurance();
      if (insurance != null) {
        return insurance.getName();
      }
    }
  }

  return "Unknown";
}
```

다른 방법2 : 너무 많은 출구

```java
public String getCarInsuranceName3(Person person) {
  if (person == null) {
    return "Unknown";
  }

  final Car car = person.getCar();
  if (car == null) {
    return "Unknown";
  }

  final Insurance insurance = car.getInsurance();
  if (insurance == null) {
    return "Unknown";
  }

  return insurance.getName();
}


```

위 코드는 다른 방법으로 중첩 if블록을 없앴다. 즉, null 변수가 있으면 즉시 "Unknown"을 반환한다. 하지만 이것도 좋은 코드는 아님. 메서드에 네 개의 출구가 생겼기 때문이다. 출구 때문에 유지보수가 어려워 진다. 그리고 Unknown 문자열이 세곳에서 반복되기 때문에 오타등의 실수가 생길 수 있다.

## null 때문에 발생하는 문제

- 에러의 근원이다: NPE 에러
- 코드를 어지럽힌다: 중첩된 if문
- 아무의미가 없다: null은 아무 의미도 표현하지 못함. 값이 없음을 표현하는 방법으로 적절하지 않다.
- 자바 철학에 위배된다: 자바는 개발자로부터 모든 포인터를 숨겼다. 하지만 예외가 있는데 그것이 바로 null 포인터다.
- 형식시스템에 구멍을 만든다: null은 무형식이며 정보를 포함하고 있지 않으므로 모든 참조 형식에 null을 할당할 수 있다. 이런 식으로 null이 할당되기 시작하면서 시스템의 다른 부분으로 null이 퍼졌을 때 애초에 null이 어떤 의미로 사용되었는지 알 수 없다.

## Optional을 이용한 데이터 모델 재정의

```java
public class Person {
  private Optional<Car> car;
  public Optional<Car> getCar() {
    return car;
  }
}

public class Car {
  private Optional<Insurance> insurance;
  public Optional<Insurance> getInsurance() {
    return insurance;
  }
}

public class Insurance {
  private String name;
  public String getName() {
    return name;
  }
}
```

하스켈과 스칼라의 영향을 받아서 java.util.Optional<T> 라는 새로운 클래스를 제공함. Optional은 선택형 값을 캡슐화하는 클래스다. 값이 있으면 Optional 클래스는 값을 감싼다. 반면 값이 없으면 Optional.empty 메서드로 Optional을 반환한다.

Optional 클래스를 사용하면서 모델의 의미 semantic이 더 명확해졌다. 사람은 Optional<Car> 를 참조하며 자동차는 Optional<Insurance>를 참조하는데 이는 사람이 자동차를 소유했을 수도 아닐 수도 있으며, 자동차는 보험에 가입되어 있을 수도 아닐 수도 있음을 명확히 설명한다.

또한 보험회사 이름은 Optional<String> 이 아니라 String형식으로 선언되어 있는데 이는 보험회사는 반드시 이름을 가져야 함을 보여준다. 보험회사 이름을 참조할 때 NPE이 발생할수 도 있다는 정보를 확인할 수 있다.

하지만 보험회사 이름이 null인지 아닌지 확인하는 코드를 추가할 필요는 없다. 오히려 고쳐야 할 문제를 감추는 꼴이 되기 때문이다. 보험회사는 반드시 이름을 가져야 하며 이름이 없는 보험회사를 발견했다면 예외를 처리하는 코드를 추가하는 것이 아니라 보험회사 이름이 없는 이유가 무엇인지 밝혀서 문제를 해결해야 한다.

모든 null참조를 Optional로 대치하는 것은 바람직하지 않다. Optional의 역할은 더 이해하기 쉬운 API를 설계하도록 돕는 것이다. 즉, 메서드의 시그니처만 보고도 선택형 값인지 여부를 구별할 수 있다.

## optional로 자동차 보험회사 이름 찾기

```java
public String getCarInsuranceName(Optional<Person> person) {
  return person.flatMap(Person::getCar)
    .flatMap(Car::getInsurance)
    .map(Insurance::getName)
    .orElse("Unknown");
}
```

> Optional 중첩에 따른 평준화 ? flatMap ?
> 평준화 과정이란 이론적으로 두 Optional을 합치는 기능을 수행하면서 둘중 하나라도 null이면 빈 Optional을 생성하는 연산이다. flatMap을 빈 Optional에 호출하면 아무 일도 일어나지 않고 그대로 반환된다.

> 도메인 모델에 Optional을 사용했을 때 데이터를 직렬화 할 수 없는 이유
>
> 자바 언어 아키텍트인 브라이언 고츠는 Optional의 용도가 선택형 반환값을 지원하는 것이라고 명확하게 이야기했다.
>
> Optional 클래스는 필드 형식으로 사용할 것을 가정하지 않았으므로 Serializable 인터페이스를 구현하지 않는다. 따라서 우리 도메인 모델에 Optional을 사용한다면 직렬화 모델을 사용하는 도구나 프레임워크에서 문제가 생길 수 있다. 이와 같은 단점에도 불구하고 여전히 Optional을 사용해서 도메인 모델을 구성하는 것이 바람직하다고 생각한다. 직렬화 모델이 필요하다면 다음 예제에서 보여주는 것처럼 Optional로 값을 반환 받을 수 있는 메서드를 추가하는 방식을 권장한다.
>
> ```java
> public class Person {
>   private Car car;
>   private Optional<Car> getCarAsOptional(){
>     return Optional.ofNullable(car);
>   }
> }
> ```

## 디폴트 액션과 Optional 언랩

- get() 은 값을 읽는 가장 간단한 메서드이면서 동시에 가장 안전하지 않은 메서드다. 있으면 해당 값을 반환하고 없으면 NoSuchElementException을 발생시키다.
- orElse(T other)은 Optional이 값을 포함하지 않을 때 기본값을 제공한다.
- orElseGet(Supplier<? extends T> other) 는 orElse 메서드에 대응하는 게으른 버전의 메서드다. Optional에 값이 없을때만 Supplier가 실행되기 때문이다.
- orElseThrow(Supplier<? extends X> exceptionSupplier) 는 Optional이 비어있을때 예외를 발생시킨다는 점에서 get메서드와 비슷하다. 하지만 이 메서드는 발생시킬 예외의 종류를 선택할 수 있다.
- ifPresent(Consumer<? super T> consumer) 를 이용하면 값이 존재할 때 인수로 넘겨준 동작을 실행한다. 값이 없으면 아무일도 일어나지 않는다.

## Optional 을 사용한 실용예제

### 잠재적으로 null이 될 수 있는 대상을 Optional로 감사기

```java
Object value = map.get("key");

Optional<Object> value = Optional.ofNullable(map.get("key"));
```

### 예외와 Optional클래스

자바 API는 어떤 이유에서 값을 제공할 수 없을 때 null을 반환하는 대신 예외를 발생시킬때도 있다. 전형적인 예가 문자열을 정수로 변환하는 Integer.parseInt(String) 메서드다. 문자열을 정수로 바꾸지 못할 때 NUmberFormatException을 발생시킨다. 이것을Optional로 해결할 수 있다. (작은 유틸리티 클래스를 만들어서)

```java
public static Optional<Integer> stringToInt(String s){
  try {
    return Optional.of(Integer.parseInt(s));
  } catch (NumberFormatException e){
    return Optional.empty();
  }
}
```

### 기본형 Optional을 사용하지 말아야 하는이유

스트림처럼 Optional도 기본형으로 특화된 OptionalInt, OptionalLong, OptionalDouble등의 클래스를 제공한다. 스트림이 많은 요소를 가질때는 기본형 특화 스트림을 이용해서 성능을 향상시킬 수 있다고 했다.(박싱) 하지만 Optional의 최대요소수는 한개 이므로 Optional에서는 기본형 특화 클래스로 성능을 개선할 수 없다. 또한 기본형 특화 Optional로 생성한 결과는 다른 일반 Optional과 혼용할 수 없다.

### 응용

예를 들어 프로그램 설정 인수로 Properties를 전달한다고 가정하자.

```java
Properties properties = new Properties();
properties.setProperty("a", "5");
properties.setProperty("b", "true");
properties.setProperty("c", "-3");
```

이제 프로그램에서 Properties를 읽어서 값을 초 단위로 지속시간으로 해석한다. 다음과 같은 메서드 시그니처로 지속시간을 읽을 것이다.

```java
public int readDuration(Properties props, String name)
```

지속시간은 양수여야 하므로 문자열이 양의 정수를 가리키면 해당 정수를 반환하지만 그 외에는 0을 반환한다. 이를 다음 처럼Junit 어설션으로 구현할수 있다.

```java
assertEquals(5, readDuration(param, "a"));
assertEquals(0, readDuration(param, "b"));
assertEquals(0, readDuration(param, "c"));
assertEquals(0, readDuration(param, "d"));
```

- 프로퍼티 a는 양수로 변환할 수 있는 문자열을 포함하므로 readDuration메서드는 5를 반환
- 프로퍼티b는 숫자로 변환할 수 없는 문자열을 포함하므로 0을 반환.
- 프로퍼티c는 음수 문자열을 포함하므로 0을 반환
- 프로퍼티d는 이름의 프로퍼티는 없으므로 0을 반환

```java
public int readDuration(Properties props, String name){
  String value = props.getProperty(name);
  if(value != null){
    try{
     int i = Integer.parseInt(value) ;
      if (i > 0){
        return u;
      }
    }catch (NumberFormatException e){}
  }
  return 0;
}
```

이를 어떻게 개선할까?

```java
public int readDuration(Properties props, String name){
  return Optional.ofNullable(props.getProperty(name))
    .flatMap(OptionalUtility::stringToInt)
    .filter(i-> i>0)
    .orElse(0);
}
```

Properties의 값이 null 값일 수 있으므로 ofNullable 팩토리 메서드를 이용해서 Optional로 반환할 수 있도록 바꾸고, 앞에서 만든 Integer.parseInt(String) 을 Optional 로 처리한 것처럼 OptionalUtilty.stringToInt 메서드 참조를 전달해서 Optional<String>에서 Optional<Integer>로 바꾼다. 그리고 마지막으로 음수를 필터링한다. 그렇지 않은 경우 0을 반환한다.
