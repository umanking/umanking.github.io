---
layout: post
title: Jackson, LocalDateTime Serialization, Deserialization 이슈
date: 2021-07-24 17:53 +0900
image: 'https://i1.wp.com/blog.fossasia.org/wp-content/uploads/2018/08/serialize.png?fit=706%2C367&ssl=1'
tags: [jackson, java, spring]
categories: [jackson]
toc: true
description: 스프링에서 자바 객체를 직렬화/역직렬화를 할때, 내부적으로 Jackson을 사용하는데, 자바8에 도입된 LocalDateTime 타입으로 직렬화, 역직렬화할때 이슈를 정리해보았다.
---

## 1. 들어가며 

스프링에서 자바 객체를 직렬화/역직렬화를 할때, 내부적으로 Jackson을 사용하는데, 자바8에 도입된 LocalDateTime 타입으로 직렬화, 역직렬화할때 이슈가 있어서 정리해 보았다.


### 1.1. 직렬화/역직렬화

먼저 직렬화, 역직렬화에 대해서 알아보자. 직렬화(Serialization), 역직렬화(Deserialization)으로 자바 객체를 JSON,XML,..다른 데이터 형식으로 변환하는 것을 `직렬화` 그 반대를 `역직렬화`라고 한다. 

여기서 알아볼 예제에서는 스프링에서 응답(Response)로 내보낼때 (자바 객체 -> JSON) 이를 `직렬화` 라고 하고, Client에서 요청에 담긴 (JSON 데이터를 ->  자바객체)로 변환하는걸 `역직렬화`라고 한다.



## 2. 상황

다음과 같은 3가지 상황을 알아보자. 

- @RequestParam 을 이용한 쿼리 스트링으로 LocalDateTime을 넘기는 상황  (역직렬화)
- @RequestBody로 객체안의 필드의 타입이 LocalDateTime 인 상황 (역직렬화)
- @ResponseBody로 객체를 리턴할때 객체안의 필드의 타입이 LocalDateTime 인 상황 (직렬화)

## 3. 예제 코드

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```
Spring Boot 버전 `2.5.3버전`에, `web` 모듈만 추가했을때, 스타터 종속성에 의하여 `jackson라이브러리`가 같이 추가된다. 

![스크린샷 2021-07-24 오후 5 45 33](https://user-images.githubusercontent.com/28615416/126863019-e2f01852-97ef-4362-9b7c-3b6e5ab15e7a.png)

간단한 Event POJO를 만든다.

```java
@Getter
@Setter
public class Event {
    private String name;
    private LocalDateTime eventDate;
}
```

위의 3가지 경우를 각각 만들어 보자! (어떤한 설정도 하지 않았다)

```java
@GetMapping("/") //1번째
public ResponseEntity<String> getParam(@RequestParam LocalDateTime currentDate) {
    log.info("currentDate = {} ", currentDate);
    return ResponseEntity.ok("SUCCESS");
} 

@PostMapping("/event") //2번째
public ResponseEntity<String> createEvent(@RequestBody Event event) {
    log.info("event = {} ", event);
    return ResponseEntity.ok("SUCCESS");
}

@GetMapping("/event") //3번째
@ReponseBody
public Event getEvent() {
    return new Event("event", LocalDateTime.now());
} 
```
1번째는 `@RequestParam` 으로 LocalDateTime 타입을 받는다.

2번째는 `@RequestBody`에 Event객체를 매핑해서, 역직렬화한다. 

그리고 3번재는 `@ResponseBody`를 통해서 Event객체를 Json형식으로 직렬화 하는 예제이다.  


## 4. 실패하는 경우?
위의 3가지 경우에서, `첫번째만 케이스만 실패한다.` 

예외 메세지는 다음과 같다. 

> Resolved [org.springframework.web.method.annotation.MethodArgumentTypeMismatchException: Failed to convert value of type 'java.lang.String' to required type 'java.time.LocalDateTime'; nested exception is org.springframework.core.convert.ConversionFailedException: Failed to convert from type [java.lang.String] to type [@org.springframework.web.bind.annotation.RequestParam java.time.LocalDateTime] for value '2021-07-24T00:00:00'; nested exception is java.lang.IllegalArgumentException: Parse attempt failed for value [2021-07-24T00:00:00]]

말인 즉슨, String 타입을 LocalDateTime 타입으로 변환할 수 없다고 한다.

## 5. 해결책
해당 예외에는 해결책에는 `두가지 방법`이 존재한다. 

첫번째 방법은 `@DateTimeFormat` 어노테이션으로 해당 데이터 타입을 지정해주는 방법이고, 

두번째 방법은 `String` 타입으로 받아서, Controller나 Service레이어에서 String to LocalDateTime으로 파싱해서 사용하는 방법이다.

여기서 우리는 `첫번째 방법`을 사용한다. 

> 해당 내용은 [Stack overflow](https://stackoverflow.com/questions/40274353/how-to-use-localdatetime-requestparam-in-spring-i-get-failed-to-convert-string) 에 있다.

```java
@GetMapping("/event")
public ResponseEntity<String> getParam(@RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime currentDate) {
  log.info("currentDate = {} ", currentDate);
  return ResponseEntity.ok("SUCCESS");
}
```
`@DateTimeFormat`은 스프링에서 제공해주는 어노테이션이다. `@JsonFormat` 어노테이션도 자주 등장하는데 @JsonFormat은 Jackson에서 제공하는 어노테이션이다. 



## 6. 진짜 문제는 objectMapper를 재정의 하는 순간 ‼️‼️‼️

다음과 같이 objectmapper를 보통 싱글턴 빈으로 만들어서 사용하는데, 아무런 설정없이 빈을 만드는 경우 위의 케이스를 다시 살펴 보자. 

```java
@Configuration
public class JacksonConfig {
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper;
    }
}
```

기본 빈으로 objectmapper를 빈으로 설정했다. 

```java
@GetMapping("/event") //2번째 
public Event getEvent() {
    return new Event("event", LocalDateTime.now());
} 

@PostMapping("/event") //3번째
public ResponseEntity<String> createEvent(@RequestBody Event event) {
    log.info("event = {} ", event);
    return ResponseEntity.ok("SUCCESS");
}
```
이번에는 2번재, 3번째모두 실패한다. 예외 메세지는 다음과 같다. 


> com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Java 8 date/time type `java.time.LocalDateTime` not supported by default: add Module "com.fasterxml.jackson.datatype:jackson-datatype-jsr310" to enable handling...

default는 자바8의 LocalDateTime 타입을 지원하지 않는다. 그렇기 때문에 핸들링 할 수 있게 `jsr-310` 모듈을 추가하라고 한다. 

> ※ [jsr-310](https://jcp.org/aboutJava/communityprocess/pfd/jsr310/JSR-310-guide.html)? 
>
> JSR(Java Specification Request)로 자바플랫폼의 자바 사양을 정의한 문서와 같다. 이중에서 310은 날짜와 시간에 관련된 API를 정의한다. 

처음에는 jsr-310 dependency 라이브러리를 추가하는 줄 알았는데, spring-boot-starter-json 스타터 의존성에 의해서 jsr310 디펜던시가 이미 추가되어있었다. 그래서 다른 방법을 찾아보았다.

```java
@Bean
public ObjectMapper objectMapper() {
  ObjectMapper objectMapper = new ObjectMapper();
  objectMapper.registerModule(new JavaTimeModule());
  objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
  return objectMapper;
}
```

JavaTimeModule을 추가해주고 , DATE를 TimeStamp로 찍는 직렬화 기능을 disable로 추가해준다. 그리고 다시 요청을 보내면 성공한다. 

**소스 코드는 [여기](https://github.com/umanking/jackson-datetime-serialization)에서 확인 가능**

## 7. 정리

- `스프링 부트 2.5.3 버젼`에서는 ObjectMapper 빈을 설정하지 않는다면, 기본 LocalDateTime으로 직렬화/역직렬화 문제없다.
  - 스프링 부트가 기본으로 ObjectMapper에 어떤 항목들을 default값으로 셋팅하는지는 살펴봄직하다. 
- `@ReuquestParam`을 LocalDateTime 타입으로 역직렬화를 하고 싶다면 `@DateTimeFormat 어노테이션`을 사용하자
- ObjectMapper를 빈으로 등록했다면 `JavaTimeModule`을 추가하는 설정을 따로 해줘야 한다. 

