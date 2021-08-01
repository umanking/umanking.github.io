---
layout: post
title: "[Java] 날짜,시간의 역사와 LocalDateTime 살펴보기"
date: 2020-05-09 12:19 +0900
categories: [java]
tags: [java, localdatetime]
image: '/images/java.png'
toc: true
description: Java의 날짜,시간관련된 역사를 알아보고, Java8버전에 추가된LocalDateTime, ZonedDateTime에 대해서 전방위적으로 살펴보자. 
---

## 1. 학습 목표

- 자바의 날짜, 시간과 관련된 History(역사에) 대해서 알아본다.
- Java 8버전에서 추가된 LocalDateTime 의 **기본 API 사용법**을 알아본다.
- `기간`을 표현하는 Duration, Period알아본다.
- 날짜를 변경하고, **Parsing, Formatting**에 대해서 알아본다.
- **ZoneId** (다양한 시간대)를 알아본다.


## 2. 자바 1.0 Date 클래스

자바 1.0 에서는 `java.util.Date` 클래스 하나로 날짜와 시간관련 기능을 제공했다. 날짜를 의미하는 Date라는 클래스의 이름과 달리 Date클래스의 이름과 달리 Date클래스는 특정 시점을 날짜가 아닌 밀리초 단위로 표현한다. 게다가 1900년을 기준으로 하는 오프셋, 0에서 시작하는 달 인덱스 등 모호한 설계로 유용성이 떨어졌다.

다음은 2017년 9월 21일을 가르키는 Date 인스턴스를 만드는 코드다.

```java
Date date = new Date(117, 8, 21);

// 출력 결과
// Thu Sep 21 00:00:00 KST 2017
```

**결과가 직관적이지 않다.** 또한 Date클래스의 toString으로 반환되는 문자열을 추가로 활용하기도 어렵다. 그렇다고 Date클래스가 자체적으로 시간대 정보를 알고 있는 것도 아니다.

## 3. 자바 1.1 Calendar 클래스

결과적으로 자바 1.1에서는 Date클래스의 여러 메서드를 deprecate시키고, `java.util.Calendar`라는 클래스를 대안으로 제공했다. **안타깝게도 Calendar 클래스 역시 쉽게 에러를 일으키는 설꼐 문제를 갖고 있다.** Calendar에서는 1900년도에서 시작하는 오프셋은 없앴지만 여전히 달의 인덱스는 0부터 시작했다. 더 안타까운점은 Date와 Calendar 두 가지 클래스가 등장하면서 개발자들에게 혼란이 가중된 것이다. 게다가 DateFormat 같은 일부 기능은 Date 클래스에서만 작동했다.

**DateFormat도 문제가 있다.** 스레드에 안전하지 않다. 즉, 두 스레드가 동시에 하나의 포매터로 날짜를 파싱할 때 예기치 못한 결과가 일어날 수 있다.

마지막으로 **Date, Calendar 모두 가변 클래스**다. 가변 클래스라는 설계 때문에 유지보수가 아주 어려워진다.

## 4. 자바 1.8 새로운 날짜 시간 등장!

부실한 날짜와 시간 라이브러리 때문에 많은 개발자는 [joda-time](https://www.joda.org/joda-time/) 같은 서드파티 날짜와 시간 라이브러리를 사용했다. 오라클은 좀 더 훌륭한 날짜와 시간 API를 제공하기로 정했다. 결국 자바 8에서는 **Joda-Time의 많은 기능을 java.time 패키지로 추가했다.**


## 5. LocalDate와 LocalTime 사용

- LocalDate 인스턴스는 시간을 제외한 날짜를 표현하는 `불변객체`이다. 
- 정적팩토리 메서드로 `of`로 LocalDate 인스턴스를 만들 수 있다.

```java
// 정적팩토리 메서드 of로 인스턴스를 만든다.
LocalDate date = LocalDate.of(2017, 9, 21); // 2017-09-21


// 각 항목들을 가져올 수 있다. 
int year = date.getYear(); //2017
Month month = date.getMonth(); // SEPTEMBER
int dayOfMonth = date.getDayOfMonth();// 21

DayOfWeek dayOfWeek = date.getDayOfWeek(); //THURSDAY
int len = date.lengthOfMonth(); // 30 (9월의 일 수)
boolean leapYear = date.isLeapYear(); // false (윤년 이냐?)
```



```java
// 현재 날짜를 얻는다.
LocalDate today = LocalDate.now(); 
```

다른 방법으로 정보를 얻을 수 있다. get메서드에 TemporalField를 전달해서 정보를 얻는 방법도 있다.

> `TemporalField` 시간 관련 객체에서 어떤 필드의 값에 접근할지 정의하는 인터페이스이다. enum 타입인 ChronoField는 TemporalField 인터페이스를 정의하므로 다음 코드에서 보여주는 것처럼 ChronoField 요소를 이용해서 원하는 정보를 얻을 수 있다.

```java
int year = date.get(ChronoField.YEAR);
int month = date.get(ChronoField.MONTH_OF_YEAR);
int day = date.get(ChronoField.DAY_OF_MONTH);
```

다음처럼 내장 메서드를 통해서 가독성을 높일 수 있다.

```java
int year = date.getYear();
int month = date.getMonthValue();
int dayOfMonth = date.getDayOfMonth();
```

마찬가지로 LocalTime을 통해서 14:23:30와 같은 시간을 표현할 수 있다. 정적 메서드 of로 LocalTime인스턴스를 만들 수 있다.!

```java
LocalTime time = LocalTime.of(14,23,30);
int hour = time.getHour();
int minute = time.getMinute();
int second = time.getSecond();
```

날짜와 시간 문자열로 LocalDate와 LocalTime 인스턴스를 만드는 방법도 있다. parse정적 메서드를 사용할 수 있다.

```java
LocalDate date = LocalDate.parse("2017-09-21");
LocalTime time = LocalTime.parse("14:23:30");
```

parse 메서드에서 DateTimeFormatter를 전달할 수 있다. `DateTimeFormatter`는 java.util.DateFormat 클래스를 대체하는 클래스다. 문자열을 LocalDate나 LocalTime으로 파싱할 수 없을 때 parse 메서드는 DateTimeParseException 을 일으킨다.

## 6. LocalDateTime 사용

LocalDateTime은 LocalDate와 LocalTime을 쌍으로 갖는 복합클래스다. 날짜와 시간 모두 표현할 수 있고, 다음처럼 직접 LocalDateTime를 만드는 방법도 있고 날짜와 시간을 조합하는 방법도 있다.

```java
LocalDateTime dt1 = LocalDateTime.of(2019, Month.SEPTEMBER,21, 13, 45, 20);
LocalDateTime dt2 = LocalDateTime.of(2019, 9 ,21, 13, 45, 20);
LocalDateTime dt3 = LocalDateTime.of(date, time);
LocalDateTime dt4 = date.atTime(13,45,20);
LocalDateTime dt5 = date.atTime(time);
LocalDateTime dt6 = time.atDate(date);
```

LocalDate의 atTime메서드에 시간을 제공하거나, LocalTime에 atDate 메서드에 날짜를 제공해서 LocalDateTime를 만드는 방법도 있다.

LocalDateTime의 `toLocalDate()`나 `toLocalTime()`메서드로 LocalDate나 LocalTime인스턴스를 추출할 수 있다.

```java
LocalDate date1 = dt1.toLocalDate(); // 2017-09-21
LocalTime time1 = dt1.toLocalTime(); // 13:45:20
```

## 7. Instant 클래스: 기계의 날짜와 시간

사람은 보통 주, 날짜, 시간으로 날짜와 시간을 계산한다. 하**지만 기계에서는 이와 같은 단위로 시간을 표현하기가 어렵다.** 기계의 관점에서 연속된 시간에서 특정 지점을 하나의 큰 수로 표현하는 것이 가장 자연스러운 시간 표현 방법이다. **새로운 java.time.Instant 클래스에서는 이와 같은 기계적인 관점에서 시간을 표현한다.** 즉, Instant 클래스는 **유닉스 에포크 시간** 을 기준으로 특정 지점까지의 시간을 초로 표현한다.

> ※에포크 시간(Unix Epoch time) : 1970년 1월 1일 0시 0분 0초 UTC)를 기준

팩토리 메서드 ofEpochSecond에 초를 넘겨줘서 Instant 클래스 인스턴스를 만들 수 있다. Instant 클래스는 나노초(10억분의 1초) 정밀도를 제공한다. 또한 오버로드된 ofEpochSecond메서드 버전에서는 두번째 인수를 이용해서 나노초 단위로 시간을 보정할 수 있다. 두번째 인수에서는 0에서 999,999,999 사이의 값을 지정할 수 있다.

```java
Instant.ofEpochSecond(3);
Instant.ofEpochSecond(3, 0);
Instant.ofEpochSecond(2, 1_000_000_000); // 2초 이후의 1억나노초(1초)
Instant.ofEpochSecond(4, -1_000_000_000); // 4초 이전의 1억 나노초(1초)
```

Instant 클래스도 사람이 확인할 수 있도록 시간을 표시해주는 정적 팩토리 메서드 now를 제공한다. 하지만 **Instant는 기계전용의 유틸리티라는 점을 기억하자.** 즉, Instant 는 초와 나노초 정보를 포함한다. 따라서 Instant 는 사람이 읽을 수 있는 시간 정보를 제공하지 않는다.

```java
int day = Instant.now().get(ChronoField.DAY_OF_MONTH);
```

다음과 같은 예외를 일으킨다.

```
java.time.temporal.UnsupportedTemporalTypeException: Unsupported field: DayOfMonth
```

Instant에서는 Duration과 Period 클래스를 함께 활용할 수 있다.

## 8. Duration과 Period 정의

지금까지 살펴본 모든 클래스는 Temporal 인터페이스를 구현하는데, **<u>Temporal 인터페이스는 특정 시간을 모델링하는 객체의 값을 어떻게 읽고 조작할지 정의한다.</u>** 지금까지 다양한 Temporal 인스턴스를 만드는 방법을 살펴봤다.

이번에는 두 시간 객체 사이의 지속시간 duration을 만들어볼 차례다. Duration 클래스의 정적 팩토리 메서드는 between으로 두 시간 객체 사이의 지속시간을 만들 수 있다.

```java
Duration duration1 = Duration.between(time1, time2);
Duration duration2 = Duration.between(dateTime1, dateTime2);
Duration duration3 = Duration.between(instant1, instant2);
```

LocalDateTime은 사람이 사용하도록, Instant는 기계가 사용하도록 만들어진 클래스로 두 인스턴스는 서로 혼합할 수 없다. 

또한, Duration 클래스는 초와 나노초로 시간 단위를 표현하므로 between메서드에 LocalDate를 전달할수 없다. 

년,월,일 로 시간을 표현할때는 Period 클래스를 사용한다. 즉, Period 클래스의 팩토리 메서드 between을 이용하면 두 LocalDate의 차이를 확인할 수 있다.

```java
Period tenDays = Period.between(LocalDate.of(2017,9,11),
                                LocalDate.of(2017,9,21));
```

마지막으로 Duration과 Period 클래스는 자신의 인스턴스를 만들 수 있도록 다양한 팩토리 메서드를 제공한다.

```java
Duration threeMinutes = Duration.ofMinutes(3);
Duration threeMinutes = Duration.of(3, ChronoUnit.MINUTES);

Period tenDays = Period.ofDays(10);
Period threeWeeks = Period.ofWeeks(3);
Period twoYearsSixMonthsOneDay = Period.of(2,6,1);
```

지금까지 살펴본 모든 클래스는 `불변`이다. **불변 클래스는 함수형 프로그래밍 그리고 스레드 안전성과 도메인 모델의 일관성을 유지하는 데 좋은 특징이다.** 하지만 새로운 날짜와 시간 API에서는 변경된 객체 버전을 만들 수 있는 메서드를 제공한다.

## 9. 날짜 조정, 파싱, 포매팅

withAttribute 메서드로 기존의 LocalDate를 바꾼 버전을 직접 간단하게 만들 수 있다. 다음 코드에서는 바뀐 속성을 포함하는 새로운 객체를 반환하는 메서드를 보여준다.

```java
// 절대적인 방식으로 LocalDate의 속성을 바꾸기
LocalDate date1 = LocalDate.of(2017,9,21); // 2017-09-21
LocalDate date2 = date1.withYear(2011); // 2011-09-21
LocalDate date3 = date2.withDayOfMonth(25); // 2011-09-25
LocalDate date4 = date3.with(ChronoField.MONTH_OF_YEAR, 2); // 2011-02-25
```

```java
// 상대적인 방식으로 LocalDate 속성 바꾸기
LocalDate date1 = LocalDate.of(2017,9,21); // 2017-09-21
LocalDate date2 = date1.plusWeeks(1); // 2017-09-28
LocalDate date3 = date2.minusYears(6); // 2011-09-28
LocalDate date4 = date3.plus(6, ChronoUnit.MONTHS); // 2012-03-28
```

## 10. TemporalAdjusters 사용하기

지금까지 살펴본 날짜 조정 기능은 비교적 간단한 편에 속한다. 때로는 다음주 일요일, 돌아오는 평일, 어떤달의 마지막날 등 좀 더 복잡한 날짜 조정 기능이 필요할 것이다. 이때는 오버로드된 버전의 `with메서드`에 좀 더 다양한 동작을 수행할 수 있도록 하는 기능을 제공하는 [TemporalAdjuster](https://docs.oracle.com/javase/8/docs/api/java/time/temporal/TemporalAdjusters.html)를 전달하는 방법으로 문제를 해결할 수 있다.

```java
LocalDate date1 = LocalDate.of(2014,3,18); // 2014-03-18
LocalDate date2 = date1.with(nextOrSame(DayOfWeek.SUNDAY)); // 2014-03-23
LocalDate date3 = date2.with(lasyDayOfMonth()); // 2014-030-31
```

![https://docs.oracle.com/javase/8/docs/api/java/time/temporal/TemporalAdjusters.htm](https://user-images.githubusercontent.com/28615416/81462658-15f7e400-91ef-11ea-9de1-fd439dc65fa1.png)
*TemporalAdjuster API*

TemporalAdjester를 이용하면 좀 더 복잡한 날짜 조정 기능을 직관적으로 해결할 수 있다. 그뿐만 아니라 필요한 기능이 정의되어 있지 않을때는 비교적 쉽게 커스텀 TemporalAdjuster 구현을 만들 수 있다. 실제로 TemporalAdjuster 인터페이스는 다음처럼 하나의 메서드만 정의한다. TemporalAdjuster 인터페이스 구현은 Temporal 객체를 다른 Temporal객체로 변환할지 정의한다. 결국 TemporalAdjuster 인터페이스를 UnaryOperator<Temporal>과 같은 형식으로 간주할 수 있다.

```java
@FunctionalInterface
public interface TemporalAdjuster {
    Temporal adjustInto(Temporal temporal);
}
```

> unaryOperator는 단항연산자로, 수학에서 나온개념인데, 자기자신을 파라미터로 받고, 자기 자신을 리턴하는 경우를 의미한다.

### 10.1. 커스텀 TemporalAdjusters 구현하기

TemporalAdjusters 인터페이스를 구현하는 NextWorkingDay 클래스를 구현한다. 이 클래스는 날짜를 하루씩 다음날로 바꾸는데, 토요일 일요일은 건너뛴다.

```java
date = date.with(new NextWorkingDay());
```

다음과 같이 구현할 수 있다.

```java
public class NextWorkingDay implements TemporalAdjuster {
    @Override
    public Temporal adjustInto(Temporal temporal) {
        DayOfWeek dayOfWeek = DayOfWeek.of(temporal.get(ChronoField.DAY_OF_WEEK));
        int dayToAdd = 1;
        if (dayOfWeek == DayOfWeek.FRIDAY) {
            dayToAdd = 3;
        } else if (dayOfWeek == DayOfWeek.SATURDAY) {
            dayToAdd = 2;
        }
        return temporal.plus(dayToAdd, ChronoUnit.DAYS);
    }
}
```

## 11. 날짜와 시간 객체 출력과 파싱

날짜와 시간 관련 작업에서 `Formatting`과 `Parsing`은 서로 떨어질수 없는 관계다. 심지어 포매팅과 파싱 전용 패키지인 java.time.format이 새로 추가되었다. 이 패키지에서 가장 중요한 클래스는 `DateTimeFormatter`다. 정적 팩토리 메서드와 상수를 이용해서 손쉽게 Formatter를 만들 수 있다. DateTimeFormatter클래스는 BASIC_ISO_DATE와 ISO_LOCAL_DATE 등 상수를 미리 정의하고 있다.

> - Formatting은 객체를 (정해진 format형식) -> String으로 변환함 
> - Parsing은 해당 문자열(String)값을 -> 객체로 변환함

```java
LocalDate date = LocalDate(2014, 3, 18);
String s1 = date.format(DateTimeFormatter.BASIC_ISO_DATE); // 20140318
String s2 = date.format(DateTimeFormatter.ISO_LOCAL_DATE); // 2014-03-18
```

반대로 날짜나 시간을 표현하는 문자열을 파싱해서 날짜 객체로 다시 만들 수 있다.

```java
LocalDate date1 = LocalDate.parse("20140318", DateTimeFormatter.BASIC_ISO_DATE);
LocalDate date2 = LocalDate.parse("2014-03-18", DateTimeFormatter.ISO_LOCAL_DATE);
```

> ✅ 기존의 java.util.DateFormat 클래스와 달리 모든 DateTimeFormatter는 스레드에서 안전하게 사용할 수 있는 클래스다.

또한, 다음 예제에서 처럼 DateTimeFormatter 클래스는 특정 패턴으로 포매터를 만들 수 있는 정적 팩터리 메서드를 제공한다.

```java
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
```

## 12. 다양한 시간대와 캘린더 활용 방법

지금까지 살펴본 모든 클래스에는 시간대와 관련한 정보가 없었다. 새로운 날짜와 시간 API의 큰 편리함중 하나는 시간대를 간단하게 처리할 수 있다는 점이다. **<u>기존의 java.util.TimeZone을 대체할 수 있는 java.time.ZoneId 클래스가 새롭게 등장했다.</u>** 새로운 클래스를 이용하면 서머타임 (Daylight saving time (DST)) 같은 복잡한 사항이 자동으로 처리된다. 날짜와 시간 API에서 제공하는 다른 클래스와 마찬가지로 ZoneId는 불변 클래스다.

## 13. 시간대 사용하기

표준 시간이 같은 지역을 묶어서 시간대(time zone) 규칙 집합을 정의한다. ZoneRules 클래스에는 약 40개정도의 시간대가 있다. ZoneId의 getRulse()를 이용해서 해당 시간대의 규정을 획득할 수 있다.

```java
ZoneId romeZone = ZoneId.of("Europe/Rome");
```

지역 ID는 ‘{지역}/{도시}’ 형식으로 이루어지며 [IANA Time Zone datebase](https://www.iana.org/time-zones) 에서 제공하는 지역집합 정보를 사용한다. 다음 코드에서 보여주는 것 처럼 ZoneId의 새로운 메서드인 toZoneId로 기존의 TimeZone 객체를 ZoneId 객체로 변환할 수 있다.

```java
ZoneId zoneId = TimeZone.getDefault().toZoneId();
```

다음 코드에서 보여주는 것처럼 ZoneId 객체를 얻은 다음에는 LocalDate, LocalDateTime, Instant 를 이용해서 ZonedDateTime인스턴스로 변환할 수 있다. ZonedDateTime은 지정한 시간대에 상대적인 시점을 표현한다.

```java
// 특정 시점에 시간대 적용
LocalDate date = LocalDate.of(2014, 3, 18);
ZonedDateTime zdt1 = date.atStartOfDay(romeZone);

LocalDateTime dateTime = LocalDateTime.of(2014,3,18,18,13,45);
ZonedDateTime zdt2 = dateTime.atZone(romeZone);

Instant instant = Instant.now();
ZonedDateTime zdt3 = instant.atZone(romeZone);
```

다음 그림처럼 ZonedDateTime 컴포넌트를 보면 LocalDate, LocalTime, LocalDateTime, ZoneId의 차이를 쉽게 이해할 수 있다.

![](https://user-images.githubusercontent.com/28615416/81462383-168f7b00-91ed-11ea-941e-8f3145112f65.png)

ZoneId를 이용해서 LocalDateTime을 Instant로 바꾸는 방법도 있다.

```java
Instant instant = Instant.now();
LocalDateTime timeFormInstant = LocalDateTime.ofInstant(instant, romeZone);
```

기존의 Date클래스를 처리하는 코드를 사용해야 하는 상황이 있을 수 있으므로 Instant로 작업하는 것이 유리하다. 폐기된 API와 새 날짜와 시간API 간의 동작에 도움이 되는 toInstant(), 정적메서드 fromInstant() 두개의 메서드가 있다.

## 14. 정리

- 자바의 1.0 Date, 1.1Calendar 의 잘못된 설계를 통한 history와 1.8새로운 날짜,시간 API등장
- 8버전의 새로운 날짜, 시간 API의 기본 사용방법에 대해서 알아보았다.
- Instant는 사람이 아닌, 기계의 날짜와 시간을 표현했다.
- Duration( 시간 간격), Period (날짜 간격) 을 표현했다.
- 날짜를 연산하고, 파싱, 포매팅하는 것을 알아봤다.
  - TemporalAdjuster를 사용하고, 커스터마이징 했다.
- 다양한 시간대를 직접 설정했다.
