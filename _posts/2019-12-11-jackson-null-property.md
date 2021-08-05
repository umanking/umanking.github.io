---
layout: post
title: Jackson, null 필드 무시하기
date: 2019-12-11 22:25 +0900
toc: true 
description: jackson에서 null값인 필드를 보여주지 않도록 지역적, 전역적으로 설정하는 방법에 대해서 알아보자
---

## 들어가며 
API를 만들때,백단에서 프론트단에 데이터를ㄹ 넘길 때, 객체 필드값이 null인 경우에 해당 필드를 보여주지 않아야 하는 경우가 있다. 이 경우에서 지역적으로 혹은 전역적으로 설정하는 방법에 대해서 알아보자!

## 1. 예제 코드

```java
public class Account {
    private String name;
    private int age;
}
```

```java
public void create_account_null_test(){
    Account account = new Account();
    account.setName(null);
    account.setAge(32);

    System.out.println(objectMapper.writeValueAsString(account));
}
```

다음과 같이 null 값의 해당하는 `name` 프로퍼티가 결과로 나온다.

```java
{"name":null,"age":32}
```

## 2. 지역적으로 처리

```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Account {

    //@JsonInclude(JsonInclude.Include.NON_NULL) //클래스 또는 해당 프로퍼티에 붙여준다.
    private String name;
    private int age;
}
```

## 3. 전역적으로 설정하는 방법

```java
@Configuration
public class JacksonConfiguration {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        return objectMapper;
    }
}
```

## 4. 참조

- [practical jackson configuration](https://stubbornjava.com/posts/practical-jackson-objectmapper-configuration)
