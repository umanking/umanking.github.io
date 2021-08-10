---
layout: post
title: Spring Boot 서버 타임존 설정 방법
date: 2021-08-10 14:04 +0900
toc: true
tags: [spring, timezone]
categories: [spring, timezone]
image: '/images/spring.png'
description: Spring Boot 프로젝트내 서버 타임존 설정하는 방법
---
# Spring Boot 서버 타임존 설정 방법

## 1. 들어가며

보통은 아무것도 설정하지 않고, 스프링 프로젝트를 띄우면, 시스템 타임존설정이 Default값으로 셋팅이된다. 여긴 한국이니까 `Asia/Seoul`  (UTC + 9) 으로 설정이 된다. 



## 2. 예제 코드

> 예제 코드는 [여기](https://github.com/umanking/spring-boot-server-timezone)에서 확인 가능합니다.

간단한 HomeController를 만들고, 응답바디로 현재시간을 출력해본다. 

```java
@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        LocalDateTime now = DateTimeUtils.now();
        return now.toString();
    }
}
```

프로젝트를 띄우고 http://localhost:8080을 호출하면, 현재 KST시간이 표시된다. (내 컴퓨터 타임존 환경이 다음과 같이 `대한 민국 표준시` 로 설정되어있기 때문이다.)

![스크린샷 2021-08-10 오후 1 56 58](https://user-images.githubusercontent.com/28615416/128810970-5296cb7e-bf6b-43ad-9172-66515baf8fc2.png)



## 3. 타임존 설정방법

타임존 셋팅하는 방법 jvm argument로 넘기는 방법이 있지만, 여기서는 애플리케이션 코드 내부에 `@PostConstruct`를 이용하는 방법에 대해서 알아보자.

```java
@SpringBootApplication
public class SpringBootServerTimezoneApplication {

    @PostConstruct
    public void started() {
      // timezone UTC 셋팅
      TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }
    public static void main(String[] args) {       
      SpringApplication.run(SpringBootServerTimezoneApplication.class, args);
    }
}
```

> ※ JVM argument로 넘기는 방법
>
> ```bash
> java -Duser.timezone="Asia/Seoul" com.example.Main
> ```



### 3.1. 추가로 고려해야 할 상황 

애플리케이션의 서버 타임존을 UTC로 설정했기 때문에, 흔히 애플리케이션 코드에 녹아있는 LocalDateTime.now() 와 같이 현재시간을 출력하는 코드는 실제 서버가 배포되면 UTC기준으로 출력이 된다. 그렇기 때문에 다음과 같이 DateTimeUtil 클래스를 만들어서, now라는 시간에 +9 시간을 더해야 한다.

```java
public class DateTimeUtils {
  public static LocalDateTime now() {
        return LocalDateTime.now().plusHours(9);
    }
}
```

위의 코드의 문제점은 UTC +9 = KST 라는 사실을 알고 있어야 하는것과, 9라는 것이 하드코딩 되어있다는 것이다. 



### 3.2. 더 살펴볼 문제

```java
public class DateTimeUtils {
  ...
  public static LocalDateTime nowAtZone() {
    return LocalDateTime.now().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime();
  }

  public static LocalDateTime nowFromZone() {
    return ZonedDateTime.now(ZoneId.of("Asia/Seoul")).toLocalDateTime();
  }
}
```

이번에는 `plusHours(9)` 방식 외의 ZonedDateTime를 이용한 방법으로 똑같은 상황을 구현해 보자. 

2개의 현재시간의 LocalDateTime을 찍는 정적메서드이다. 확연한 차이가 존재한다. 

의도한 바는, KST 시간대로 현재의 LocalDateTim을 찍고 싶었던 경우이다. 

1. 첫번째 메서드는 UTC로 서버타임존이 설정(위의예제에서 그렇게 설정함) 되어있기 때문에, LocalDateTime.now() 를 했을때 UTC 시간으로 만들어진다. 그 이후에, atZone()으로 Asia/Seoul로 설정하더라도, UTC시간임에는 변함이 없다. 원래 의도한 경우에 어긋난다.❌
2. 두번째 메서드는 ZonedDateTime의 now메서드로 Zone을 Asia/Seoule로 현재 시간을 만든다. 그렇기 때문에 KST시간으로 출력된다. 이게 원래 의도한 경우이다. ⭕️



## 4. 정리
- 스프링 프로젝트 내에 서버 타임존을 @PostConstructor로 설정하는 방법을 알아보았다.
- 그리고 애플리케이션내에서 날짜를 사용하는 부분에 대해서 KST시간으로 처리하도록 Utility성 클래스를 만들어서 사용하는 방법을 알아보았다. 
- 끝으로 Zone설정을 잘못하게 되면, 원래 의도했던 대로 동작하지 않는 경우를 알아보았다.