---
layout: post
title: "[Spring]Bean에 대해서 알아보자"
date: 2019-04-12 09:09:47
 
categories: [spring]
tags: [spring]
---



모든 블로그의 github 소스는 [여기]() 에서 확인합니다.



## 학습목표 

- Bean이란 무엇인가? 
- Bean의 라이프 사이클
- 스프링에서 Bean을 등록하는 방법 
- 스프링에서 Bean 전처리 / 후처리 하는 방법 



## Bean 이란? 

빈(Bean)이란 스프링이 생명주기를 관리하는 객체이다. 왜 Beans라는 이름을 붙였을까? 



개발자가 빈의 scope를 지정할 수 있다. 따로 `@Scope()` 로 지정해주지 않는다면 기본(default)은 singleton이고 이외에도 다음과 같이 다양한 스코프가 존재한다. 

- singleton: Spring이 기동했을때, 오로지 하나의 객체로만 존재한다.
- prototype: 매요청마다 객체가 새로 생성이 된다. 
- request: 
- session: 



> 스프링은 흔히 IoC/DI Container라고도 부르는데, 각 Bean들에 대해서 의존관계를 외부(컨테이너)에서 주입해주기 때문에 이렇게 부른다. 빈을 이해하려면, 스프링 프레임워크의 특징도 이해해야 한다.



## Bean을 등록하는 방법

- `@Bean` 어노테이션을 통해서 Bean으로 등록한다. 

> note: 빈을 등록하기 위해서는 빈을 등록하는 클래스가 애플리케이션의 @ComponentScan의 대상이 되어야 한다. 이 말인 즉슨, ComponentScan의 대상이 되기 위해서는 클래스 레벨에 `@Component` `@Configuration` `@Repository` `@Service` 다음과 같은 어노테이션을 붙이면, 스프링이 해당 컴포넌트들을 스캔할 수 있다.

```java
@Component
public class BeanConfiguration {

    @Bean
    public String hello() {
        return "Hello world";
    }
}
```

`@Bean`을 통해서 Hello world를 리턴하는 hello라는 빈을 등록 했다. `@Bean` 프로퍼티로 아무것도 넣지 않으면 빈 네임은 해당 메서드 네임으로 들어간다. 여기에서는 hello라는 빈으로 등록이 된다.

```java
@Component
public class AppRunner implements ApplicationRunner {

    @Autowired
    private String hello;  // String타입의 hello 빈이 주입된다.

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println(hello);
    }
}
```

빈을 등록했으니, 다음은 `@AutoWired`를 통해서 등록된 빈을 사용해보자. 예제 에서는 ApplicationRunner를 구현함으로써 스프링 컨테이너가 동작할 때, `run()` 메서드가 실행되는 예제이다.

```
Hello world
```

콘솔창에 다음과 같이 찍힌다.

## 2\. 빈 생성 전처리/후처리 하는 방법

1. JSR-250 어노테이션 (@PostConstruct, @PreDestroy ... ) 사용
2. @Bean의 프로퍼티로 (initMethodName, destroyMethodName) 사용

### JSR-250 어노테이션 사용

JSR-250 어노테이션을 사용하면 쉽게 빈을 생성, 폐기 시점을 알 수 있다.

```java
@Service
public class BarService {

    @PostConstruct
    public void init() {
        // BarService 빈 생성 전에 동작
        System.out.println("Post Init bean");

    }

    @PreDestroy
    public void destroy() {
        // BarService 빈 폐기 전에 동작
        System.out.println("Pre Destroy bean");

    }
}
```

BarService를 `@Service`로 등록해주고, 빈의 생성 후, 폐기 전에 맞는 `@PostConstruct` 와 `@PreDestroy` 를 통해서 하고 싶은 작업을 할 수 있다. 애플리케이션을 실행하고, 종료하게 되면 다음과 같이 나온다. 실행할 때 이미 만들어진 빈들을 등록하기 때문에 따른 코드를 넣지 않아도 된다.

```
Post Init bean
> 애플리케이션 종료하게 되면
Pre Destroy bean
```

### @Bean 프로퍼티 initMethodName / destroyMethodName 를 통한 방법

```java
public class Foo {
    public void init() {
        // init logic
        System.out.println("Init Foo");
    }
}

public class Bar {
    public void cleanup() {
        // destory logic
        System.out.println("cleanup Bar");
    }
}
```

Foo, Bar 클래스에서 각각 빈의 초기화, 폐기 관련 작업을 할 메소드를 정의한다.

```java
@Configuration
public class AppConfig {

    @Bean(initMethod = "init")
    public Foo foo() {
        return new Foo();
    }

    @Bean(destroyMethod = "cleanup")
    public Bar bar() {
        return new Bar();
    }
}
```

빈을 등록하면서 해당 빈의 어트리뷰트에 위에서 작성했던 메서드명을 넘긴다. 인텔리J에는 해당 메서드의 리턴 타입에 따라서 메서드명을 자동으로 띄워준다.

### JSR-250 과 @Bean 프로퍼티를 동시에 사용하면 우선순위는 어떻게 될까?

```
PostConstruct Init bean  // JSR-250
Init Foo // @Bean의 프로퍼티
cleanup Bar // @Bean의 프로퍼티
PreDestroy bean // JSR-250
```

결과를 보면, JSR-250이 먼저 초기화되고, 그 다음에 `@Bean의 프로퍼티`가 그 다음 동작 한다.



## 맺음말

- 스프링에서 무심코 사용했던 Bean들에 대해서 알아봤다. 
- 왜 기본 Bean 스코프가 싱글턴인가? prototype으로 매 요청마다 생겼을 때 어떤 일들이 벌어질까?
- 전처리/후처리로 어떤 처리들을 자주,많이 할까?
