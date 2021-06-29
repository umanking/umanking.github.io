---
layout: post
title: "CompletableFuture 사용방법"
date: 2020-10-15 21:07 +0900
categories: [java]
#tags: [java]
image: '/images/java.png'
---

Future 인터페이스는 java5부터 `java.util.concurrency` 패키지에서 비동기의 결과값을 받는 용도로 사용했다. 하지만 **비동기의 결과값을 조합**하거나, **error를 핸들링할 수가 없었다.**

자바8부터 CompletableFuture 인터페이스가 소개되었고, Future 인터페이스를 구현함과 동시에 CompletionStage 인터페이스를 구현한다. CompletionStage는 비동기 연산 Step을 제공해서 계속 체이닝 형태로 조합이 가능하다. 

<!-- more --> 

## 기본적인 사용방법

```java
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> "Hello");
cf.get(); // Hello
```

supplyAsync 정적 메서드는 `Supplier` 타입의 파라미터를 넘긴다. 값을 제공해주기때문에 CompletableFuture에 담을 수 있다. get()을 통해서 담긴 값을 꺼내올 수 있다. 



```java
CompletableFuture.runAsync(()->log.info("runAsync"));
```

반면 runAsync는 `Runnable` 타입을 파라미터로 전달한다. 당연히 Runnable은 어떤 결과값을 담지 않는다. run 메서드의 리턴 타입이 void이기 때문이다. 

>  Runnable은 run메서드 void를 가지는 Functional Interface이다. 



```java
CompletableFuture.supplyAsync(() -> {
    log.info("supplyAsync");
    return "Hello";
}).thenApplyAsync(s -> {
    log.info("thenApplyAsync : {}", s);
    return s + "world";
}).thenAcceptAsync(s -> {
    log.info("thenAccept: {}", s);
});
```

다음과 같이 체이닝 형태로 작성할 수 있다. 

- supplyAsync는 ForkJoinPool.commonPool()을 사용해서 비동기로 CompletableFuture 값을 리턴한다.
- thenApplyAsync는 apply 메서드명을 통해서 알수 있듯이, Function<T,U> 함수형 인터페이스를 파라미터로 갖는다. T타입을 U타입으로 변환하고 CompletionStage 타입을 리턴한다.
- thenAccept는 파라미터로 Consumer를 넘긴다. 



```
20:54:25.578 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.practice.CFutureEx1 - supplyAsync
20:54:25.583 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.practice.CFutureEx1 - thenApplyAsync : Hello
20:54:25.586 [ForkJoinPool.commonPool-worker-1] INFO com.example.demo.practice.CFutureEx1 - thenAccept: Hello world
```

모두다 xxxAsync가 붙은 메서드는 기본 ForkJoinPool. commonPool()을 사용하고, 기존의 thread를 활용하는 것을 볼 수 있다. 



### 다른 Executor 넘기기

기본 제공해주는 ForkJoinPool의 commonPool 말고, 우리가 정의한 Executor를 넘길려면 각 메서드의 2번째 인자로 넘길수 있다. 

```java
ExecutorService es = Executors.newFixedThreadPool(10);

CompletableFuture.supplyAsync(() -> {
    log.info("supplyAsync");
    return "Hello";
}, es).thenApplyAsync(s -> {
    log.info("thenApplyAsync : {}", s);
    return s + " world";
}, es).thenAcceptAsync(s -> {
    log.info("thenAccept: {}", s);
}, es);
```

```
21:07:24.057 [pool-1-thread-1] INFO com.example.demo.practice.CFutureEx1 - supplyAsync
21:07:24.063 [pool-1-thread-2] INFO com.example.demo.practice.CFutureEx1 - thenApplyAsync : Hello
21:07:24.065 [pool-1-thread-3] INFO com.example.demo.practice.CFutureEx1 - thenAccept: Hello world
```

스레드 풀을 만들어서, 각각 비동기로 처리했기 때문에 각각 다른 스레드에서 처리한 것을 볼 수 있다.





## thenApply vs thenCompose

흔히 두개의 메서드를 헷갈리는데, 결국에는 CompletableFuture를 return하고, 파라미터로 Function<T,U> 타입을 받는다. 흔히, [thenApply는 스트림의 map에 비유하고, thenCompose는 flatMap에 비유한다.](https://stackoverflow.com/questions/43019126/completablefuture-thenapply-vs-thencompose) 아래 실제 CompletableFuture에 정의되어있는 메서드 2개를 살펴보자.

```java
public <U> CompletableFuture<U> thenApply(
    Function<? super T,? extends U> fn) {
    return uniApplyStage(null, fn);
}

public <U> CompletableFuture<U> thenCompose(
    Function<? super T, ? extends CompletionStage<U>> fn) {
    return uniComposeStage(null, fn);
}
```

다른점은 파라미터로 받는 Function에 T타입을 -> U타입으로 변환할때, thenCompose같은 경우에는 CompletionStage 타입으로만 변환을 해야한다. 그렇기 때문에 다음과 같이 작성하면 IDE에서 컴파일 에러가 난다. 올바르게 작성할려면 completedFuture 메서드로 새로운 CompletableFuture 객체를 만들어야 한다.

```java
//OK
CompletableFuture.supplyAsync(() -> 1)
    .thenApply(i -> i + 1)
    .thenAccept(System.out::println);

// 컴파일에러
CompletableFuture.supplyAsync(() -> 1)
    .thenCompose(i -> i * 3) // compile 에러
    .thenAccept(System.out::println);

// OK
CompletableFuture.supplyAsync(() -> 1)
    .thenCompose(i -> CompletableFuture.completedFuture(i * 3))
    .thenAccept(System.out::println);
```



## 에러 핸들링

처음에 이야기했던 Future에서 에러를 핸들링 할수 없었던 문제를 CompletableFuture에서는 어떻게 해결했을까? 

```java
CompletableFuture.supplyAsync(() -> {
    if (1 == 1) throw new RuntimeException();
    log.info("supplyAsync");
    return "Hello";
}).thenApplyAsync(s -> {
    log.info("thenApplyAsync : {}", s);
    return s + " world";
}).thenAcceptAsync(s -> {
    log.info("thenAccept: {}", s);
}).exceptionally(e -> {
    log.error("error handling :{} ", e);
    return null;
});
```

supplyAsync, thenApplyAsync, thenAcceptAsync 메서드 중에서 에러가 발생하면 exceptionally() 메서드를 통해서 에러를 핸들링할 수 있다. 