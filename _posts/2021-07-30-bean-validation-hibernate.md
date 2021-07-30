---
layout: post
title: Bean Validation 이슈 (Object Graph)
date: 2021-07-30 14:25 +0900
image: 'https://www.popit.kr/wp-content/uploads/2018/01/image2017-12-21_10-5-23.png'
tags: [bean-validation, hibernate, object-graph]
toc: true
description: API관련 작업을 하다가, @RequestBody로 매핑된 객체의 필드값을 validaiton하기 위해서 @Valid 어노테이션(JSR-303) 을 적용했지만, 제대로 적용이 되지 않았다. 이에 대한 해결책을 알아보자. 
---
## 1. 들어가며

API관련 작업을 하다가, @RequestBody로 매핑된 객체의 필드값을 Validation하기 위해서 `@Valid` 어노테이션(JSR-380) 을 적용했지만, 제대로 적용이 되지 않았다. 문제상황과 그 해결책을 알아 보자. 



## 2. JSR-380? 

들어가기에 앞서 JSR-380은 Bean Validation2.0으로써, Java Bean들에 대한 유효성(Validation)을 검증하는 Spec을 정의한다. 대표적으로 @Notnull, @Min, @Max와 같이 Java Bean들의 필드값들을 정의하는데 사용한다. 

관련 포스팅은 [여기(Spring Model Validaiton)]({% post_url 2019-12-12-spring-validation %})에서 확인 가능하다!



## 3. 예제 소스 코드 

web과 lombok를 추가한다.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
  <optional>true</optional>
</dependency>
```

**특히나 스프링부트 2.3버전 이후로는 `javax.validation.*`의 validation이 [기본이 포함되어 있지 않기 때문에](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.3-Release-Notes) 다음과 같이 starter-validation 모듈을 추가한다.**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```



```java
@RestController
@RequestMapping("/api/account")
public class AccountRestApi {

    @PostMapping
    public ResponseEntity<?> createAccount(@RequestBody @Valid Account account) {
        return ResponseEntity.ok(account);
    }

}
```
간단한 Account REST API를 작성한다. 
Account객체를 요청 바디로 지정하고, `/api/account`를 호출하면 객체 그자체를 응답하는 간단한 REST API 이다. 
여기서 `@Valid` 어노테이션으로 지정했기 때문에, 스프링에서 Account 객체의 필드값(property)에 대해서 validation을 체크한다.

```java
@Getter
@Setter
public class Account {
  
    @NotNull(message = "name must not be null")
    private String name; // 필수값

    @JsonUnwrapped //Composite 객체 풀어서
    private PersonalInfo personalInfo;
}
```
- Account는 다음과 같고, `name` 필드에는 반드시 필수값이어야 하는 `@Notnull` 어노테이션을 추가한다. 예외가 발생할 때 예외 메세지도 지정했다. 
- PersonalInfo의 `@JsonUnwrapped`를 한 이유는 요청을 보낼때, 중첩된 json형식이 아니라, 풀어서 Flat한 형식으로 보낼 수 있도록 하도록 어노테이션을 지정했다. 

```java
@Getter
@Setter
public class PersonalInfo {

    @NotNull(message = "email must not be null")
    private String email;
    private String address;
}
```
- PersonalInfo는 email과 address 필드로 구성된다. 
- 정리하면 name, email은 필수값, address는 선택값이다.

```json
{
  "name": "andrew", 
  "email": "umanking@gmail.com", 
  "address": "서울" 
}
```
실제 API 요청을 POST메서드, Body는 json형식으로 위와 같이 보낼 수 있다. 
이 상황에서 email값을 빼고 보내면, email은 필수값이기 때문에 @NotNull 어노테이션때문에 BadRequest가 나와야 한다. 
하지만 성공한다. **email 필드에 대한 validation이 제대로 되지 않았음을 의미한다.**


## 4. 문제상황

객체 상속이나, 포함관계로 구성하는 경우에는 해당 필드에 @Valid 어노테이션을 달라고 [문서](https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/#section-object-graph-validation)에 나와있다. 



## 5. 해결책

```java
@Getter
@Setter
public class Account {
    @NotNull(message = "name must not be null")
    private String name;

    @JsonUnwrapped
  	@Valid //얘를 추가해줘야 한다.
    private PersonalInfo personalInfo;
}
```

다음과 같이 포함관계로 구성된 필드에도 @Valid 어노테이션을 추가해줘야한다. 



## 6. 정리

- 한번 경험하면 간단한 내용인데, 요청바디로 전송하는 객체의 필드들이 다양하고, 리팩토링으로 객체를 쪼개면서 해당 이슈 상황이 발생했다. 
- 관련 키워드 검색은 hibernate, bean validation, object graph 정도로 검색해야지 해당 문서에서 확인 가능하다.



## 7. 참고

- [https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.3-Release-Notes](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.3-Release-Notes)
- [https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/#section-object-graph-validation](https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/#section-object-graph-validation)

