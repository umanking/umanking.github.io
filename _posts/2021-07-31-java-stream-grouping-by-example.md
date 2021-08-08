---
layout: post
title: "[Java] Stream 데이터 groupingBy 예제"
date: 2021-07-31 17:27 +0900
image: '/images/java.png'
tags: [java, stream, groupingby]
categories: [java]
toc: true
description: Java Stream의 groupingBy의 메서드를 살펴보고, 간단한 예제를 통해서 어떻게 사용하는지 살펴보자.
---


## 1. 들어가며 


Java의 Stream를 이용한 선언적인 프로그래밍을 할 수 있다. 특히나 groupingBy 메서드를 통해서 데이터를 가공,집계하는데 많이 사용한다. groupingBy의 메서드를 살펴보고, 간단한 예제를 통해서 어떻게 사용하는지 살펴보자.



## 2. groupingBy()

groupingBy는 영어 그대로에서도 알 수 있듯이, 특정 속성(property)값에 의해서 그룹핑을 짓는 것이다. 그렇기 때문에 결과값으로 항상 Map<K, V> 형태를 리턴하게 된다. SQL문에서도 사용하는 `group by` 를 생각하면 더 쉽게 이해할 수 있다. 

어쨋든, groupingBy 메서드는 최대 3가지 파라미터를 받는 메서드들로 구성되어 있다. 

1. classifier (Function<? super T,? extends K> ): 분류 기준을 나타낸다.
2. mapFactory (Supplier<M>) : 결과 Map 구성 방식을 변경할 수 있다.
3. downStream (Collector<? super T,A,D>): 집계 방식을 변경할 수 있다. 



## 3. 예제 코드 

**예제 소스 코드는 [여기🔗](https://github.com/umanking/java-stream-grouping-by) 에서 확인 가능합니다.** 

간단하게 `주문` 도메인의 `dumm 데이터`를 만들어 보자. 

```java
public class Order {
    private String itemName;     //주문아이템 이름
    private Integer amount;      //주문 금액
    private OrderType orderType; //주문 타입
    private String orderBy;      //주문자 이름
}
```

```java
public enum OrderType {
    PICKUP("포장"),
    DELIVERY("배달"),
    PRESENT("선물하기");

    private final String text;

    OrderType(String text) {
        this.text = text;
    }
}
```

```java
private static List<Order> orders() {
    return List.of(
        new Order("후라이드 치킨", 17_000, OrderType.DELIVERY, "Andrew"),
        new Order("양념 치킨", 18_000, OrderType.DELIVERY, "Andrew"),
        new Order("피자", 18_000, OrderType.PICKUP, "Andrew"),
        new Order("돈가스", 10_000, OrderType.PICKUP, "Andrew"),
        new Order("모둠초밥", 13_000, OrderType.PRESENT, "Andrew")
    );
}
```



### 3.1. 단일 키로 groupingBy

```java
Map<OrderType, List<Order>> collect = 
  orders.stream().collect(groupingBy((Order::getOrderType)));
```

OrderType으로 groupBy를 했고,  Map의 키값이 OrderType으로 된것을 확인할 수 있다. 

### 3.2. 복합 키로 groupingBy

```java
Map<OrderTuple, List<Order>> collect1 = 
  orders.stream().collect(groupingBy(order -> new OrderTuple(order.getItemName(), order.getOrderType())));
```

이번에는 OrderTuple이라는 복합 키를 가진 객체를 하나 만들고, OrderTuple로 groupBy를 했다. 

```java
@AllArgsConstructor
public class OrderTuple {

    private String itemName;
    private OrderType orderType;
}
```



### 3.3. groupingBy 집계 변경 (toSet())

```java
Map<OrderType, Set<Order>> collect2 = 
  orders.stream().collect(groupingBy(Order::getOrderType, toSet()));
```

groupingBy의 2번째 인자는 downStream(Collector)으로 집계방식을 변경할 수 있다. 

### 3.4. groupingBy 안의 groupingBy(중첩, multiple fields)

```java
Map<String, Map<OrderType, List<Order>>> collect3 = 
  orders.stream().collect(groupingBy(Order::getOrderBy, groupingBy(Order::getOrderType)));
```

처음에 orderBy(주문자)를 통해서 groupingBy를 하고, 그 다음에 orderType(주문방식)을 통해서 한번더 groupingBy를 진행했다. 결과 의 타입을 보면 Map안에 키-밸류가 있고, 그 밸류값이 또하나의 Map으로 구성되어있다. 

### 3.5. groupingBy 통계 데이터 얻어오기

#### 3.5.1. sum 합계

```java
Map<OrderType, Integer> collect4 = 
  orders.stream().collect(groupingBy(Order::getOrderType, summingInt(Order::getAmount)));
```

2번째 인자는 downStream으로 집계방식을 summingInt()메서드를 통해서 합계를 value값으로 얻어올 수 있다. 

#### 3.5.2. average 평균 

```java
Map<OrderType, Double> collect5 = 
  orders.stream().collect(groupingBy(Order::getOrderType, averagingDouble(Order::getAmount)));
```

2번째 인자는 downStream으로 집계방식을 averagingDouble()메서드를 통해서 평균값을 얻어올 수 있다.



#### 3.5.3. maximum 최대값, minumum 최소값

```java
Map<OrderType, Optional<Order>> collect6 = 
  orders.stream().collect(groupingBy(Order::getOrderType, maxBy(Comparator.comparingInt(Order::getAmount))));

Map<OrderType, Optional<Order>> collect6 = 
  orders.stream().collect(groupingBy(Order::getOrderType, minBy(Comparator.comparingInt(Order::getAmount))));
```

OrderType으로 그룹핑을 하고, 주문가격이 가장 큰값(최소값) 으로 Value값을 얻어온다. 없을 수도 있기 때문에 Optional로 Wrapping 된 결과를 얻는다. 뭐 당연히 가격이 같은 값이 이었어도, Optional안에는 하나의 값만 들어가기 때문에, 내부적으로 제일 첫번재 데이터를 얻어온다.

maxBy(), minBy() 의 파라미터로는 Comparator 인터페이스를 받는다. Comparator의 정적 메서드를 통해서 비교자를 넘길 수 있다. 

#### 3.5.4. summary 정보

```java
Map<OrderType, IntSummaryStatistics> collect7 = 
  orders.stream().collect(groupingBy(Order::getOrderType, summarizingInt(Order::getAmount)));
```

역시나 2번째 인자 downStream으로 IntSummaryStatistics (통계정보)를 얻어올 수 있다. 통계 정보에는 다음과 같이 합계, min, max, count값들이 포함되어있다.

```java
public class IntSummaryStatistics implements IntConsumer {
    private long count;
    private long sum;
    private int min = Integer.MAX_VALUE;
    private int max = Integer.MIN_VALUE;
```

### 3.6. Map의 value값을 다른 타입으로 리턴하기 

```java
Map<OrderType, String> collect8 = 
  orders.stream().collect(groupingBy(Order::getOrderType, mapping(Order::getItemName, joining(",", "[", "]"))));
```

- 2번째 인자 downStream 집계 방식을 mapping() 메서드를 사용해서, value값을 String으로 리턴한다.
- mapping()메서드는 Function 타입의 `mapper`와 Collector 타입의 `downstream`으로 구성된다.  
  - 첫번째 파라미터: mapper는 order 객체를 -> order.getItemName 으로 변환
  - 두번째 파라미터: joining()메서드를 통해서 집계를 한다. 

### 3.7. Map를 다른 타입으로 리턴하기

```java
EnumMap<OrderType, List<Order>> collect9 = 
  orders.stream().collect(groupingBy(Order::getOrderType, () -> new EnumMap<>(OrderType.class), toList()));
```

마지막으로 위의 모든 예제는 Map타입으로 리턴을 하고, 대부분 groupingBy의 classfier, downStream 예제만 살펴봤다. 이번에는 mapFacotry를 통해서 Map타입이 아닌 EnumMap타입으로 리턴하는 예제를 살펴보자. 

이때까지, 2번째 파라미터는 downStream(Collector)이었지만, 총3개의 파라미터를 사용할때는 2번째인자는 mapFactory이고, 3번째 인자가 downStream 이다. mapFactory는 Supplier 형이기 때문에 람다 형식으로 넘겨서 구성했다. 

> ※ EnumMap vs HashMap 
>
> EnumMap은 key값을 무조건 Enum 타입인 경우만 사용가능한 Map 구현체이고, HashMap은 key값으로 Enum타입은 물론 어떤 Object도 가능하다. 

## 4. 정리 
- Java Stream의 groupingBy 메서드를 살펴보고, 예제를 만들어 보았다. 