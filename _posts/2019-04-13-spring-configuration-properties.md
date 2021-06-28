---
layout: post
title: "[Spring] application.properties값 → 클래스로 관리하는 방법"
date: 2019-04-13 22:04:37
 
categories: [spring]
tags: [spring]
---

> 일반 적으로 스프링 설정파일인 `application.properties` 에서 값들을 `@Value` 를 통해서 가져올 수 있다. 하지만 여전히 개별 값들을 일일히 매핑해야 되고, 혹여나 하드 코딩으로 제대로 된 값들을 가져 올 수 있다. 또한, 값을 제대로 가져왔는 지 아닌지 Runtime외에는 알 길이 없다. 이런 문제들을 해결 해 줄 수 있는 방법에 대해서 알아보자!
## 예제

한 개인에 대한 정보를 담고 있는 `application.properties` 를 살펴보자

```properties
andrew.name=andrew
andrew.age=${random.int(20,40)} //랜덤한 값으로 설정됨
andrew.fullName=${andrew.name} Han //문자열을 추가해도 됨
```

`andrew` 라는 prefix로 설정하고, `name`, `age`, `fullName` 속성의 값을 설정했다. 실제 코드에서 사용할 때는 다음과 같다.

```java
@Value("${andrew.name}")
private String name;

@Value("${andrew.age}")
private int age;

@Value("${andrew.fullName}")
private String fullName;
// 생략
```

여기에서는 의미없는 andrew라는 prefix를 사용했지만, datasource의 url, user-name 등등 다양한 값들이 필요할 수 있다.

## 실제 외부 클래스로 빼는 방법

관리할 property를 정의할 class를 만들고, 해당 클래스가 빈으로 등록될 수 있도록 `@Component` 와`@ConfigurationProperties` 어노테이션을 클래스 레벨에 붙였다.

```java
@ConfigurationProperties(prefix = "andrew")
@Component
public class AndrewConfiguration {

    String name;
    int age;
    String fullName;

  	// getter, setter
}
```

이렇게만 설정하면 **Spring Boot Configuration Annotaition Processor not found in classpath** 와 같은 문구가 뜬다. 관련된 링크를 클릭하면 Configuration Anotation Processor를 찾을 수 없다고 나온다.
다음과 같이 어노테이션 프로세서를 `pom.xml` 에 추가한다.

```xml
<dependency>
  	<groupId>org.springframework.boot</groupId>
  	<artifactId>spring-boot-configuration-processor</artifactId>
  	<optional>true</optional>
</dependency>
```

## 실제 적용

이제 기존의 `@Value(${andrew.name})` 이런 코드들 대신, 해당 `AndrewConfiguration` 빈을 주입받아서 getter를 통해서 접근할 수 있다.

```java
@Component
public class Runner implements ApplicationRunner {

	 // 불필요한 코드
   /* @Value("${andrew.name}")
    private String name;

    @Value("${andrew.age}")
    private int age;

    @Value("${andrew.fullName}")
    private String fullName;*/

    // 빈으로 주입 받았다.
    @Autowired
    private AndrewConfiguration andrew;


    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("=========================================");
        System.out.println("name: " + andrew.getName());
        System.out.println("age: " + andrew.getAge());
        System.out.println("fullName: " + andrew.getFullName());
        System.out.println("=========================================");
    }
}
```

이렇게 해당 값을 `@Value` 어노테이션으로 하드 코딩해서 가져오는 게 아니라, 클래스로 관리 하기 때문에 휴먼 에러를 줄여주고, 특히나 여러 군데서 사용하게 되었을 때 캡슐화의 장점이 살아난다. 관리 포인트가 해당 클래스 하나만 관리 하면 되기 때문이다. 또한, `andrew.lastName` 이라는 property를 새롭게 추가하는 경우에도 AndrewConfiguration클래스에서 필드 하나만 추가하면 된다.

## 정리

`application.properties`에서 관리하는 값들이 많을 때, 기존의 `@Value` 가 아닌, 클래스로 properties에 속성을 정의해서 빈으로 등록하고 사용하는 방법에 대해서 알아보았다.
