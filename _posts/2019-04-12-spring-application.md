---
layout: post
title: "[Spring] @SpringBootAppllication 어노테이션에 대한 고찰"
date: 2019-04-12 09:11:00
image: '/images/spring.png'
toc: true
description: "@SpringBootApplication 어노테이션에 대해서 알아보자."
categories: [spring]
tags: [spring, spring-boot]
---

## 1. 들어가며
Spring Boot 프로젝트를 만들게 되면, 가장 먼저 눈에 보이는게 Main Application 위에 붙어있는 `@SpringBootApplication` 어노테이션이다. 이 어노테이션이 어떤 역할들을 하는지 알아보자. 



## 예제 코드
```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```
간단한 SpringBoot Application을 하나 만들었다. main 메서드 위에 @SpringBootApplication을 까보면 다음과 같이 크게 3가지의 어노테이션으로 구성되어 있다.

- `@SpringBootConfiguration`
- `@ComponentScan`
- `@EnableAutoConfiguration`

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration // 1
@EnableAutoConfiguration // 2
@ComponentScan(excludeFilters = {
        @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
        @Filter(type = FilterType.CUSTOM,
                classes = AutoConfigurationExcludeFilter.class) }) // 3
public @interface SpringBootApplication {
  ... 생략
```


`@SpringBootConfiguration`은 `@Configuration` 이다.

@ComponetScan은 컴포넌트 빈들을 스캐닝해서 빈으로 등록해주는 역할을 한다. 컴포넌트에 해당하는 빈들은 클래스 레벨에 `@RestController`, `@Service`, `@Repository`, `@Configuration`, `@Component` 와 같이 붙여준다.

마지막으로 제일 중요한 `@EnableAutoConfiguration` 은 `spring-boot-autoconfigure`라는 라이브러리에서 `spring.factories` 라는 메타정보에 기록된 AutoConfiguration 정보를 가지고 빈으로 등록한다.

```java
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration,\
org.springframework.boot.autoconfigure.security.oauth2.resource.reactive.ReactiveOAuth2ResourceServerAutoConfiguration,\
org.springframework.boot.autoconfigure.task.TaskExecutionAutoConfiguration,\
org.springframework.boot.autoconfigure.webservices.client.WebServiceTemplateAutoConfiguration
// ...
```

결국 스프링부트에서 빈을 등록하는 방법은 크게 2가지로 나뉜다.

1. 베이스 패키지 기반의 ComponentScan을 통해서 내가 정의한 컴포넌트(Repository, Controller, Service, Configuration, Component) 를 등록한다.
2. @EnableAutoConfiguration을 통해서 spring.factories에 정의되어 있는 Configuration빈들을 등록한다.

#### 1.0.1. 조금더 살펴보자

```java
@Configuration
@ConditionalOnWebApplication(type = Type.SERVLET)
@ConditionalOnClass({ Servlet.class, DispatcherServlet.class, WebMvcConfigurer.class })
@ConditionalOnMissingBean(WebMvcConfigurationSupport.class)
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE + 10)
@AutoConfigureAfter({ DispatcherServletAutoConfiguration.class,
        TaskExecutionAutoConfiguration.class, ValidationAutoConfiguration.class })
public class WebMvcAutoConfiguration {

  @Bean
    @ConditionalOnMissingBean(HiddenHttpMethodFilter.class)
    @ConditionalOnProperty(prefix = "spring.mvc.hiddenmethod.filter", name = "enabled",
            matchIfMissing = true)
    public OrderedHiddenHttpMethodFilter hiddenHttpMethodFilter() {
        return new OrderedHiddenHttpMethodFilter();
    }

  ...생략
}
```

위의 AutoConfiguration에서 WebMvcAutoConfiguration 클래스를 살펴보면 다음과 같다.

클래스 레벨, 메소드 레벨에 보이는게 @ConditionalOn xxx 이런 어노테이션이 많이 보인다. on뒤에 어떤 조건인 경우에서 Conditional하게 사용할 수 있다. 예를 들면 `@ConditionalOnMissingBean(HiddenHttpMethodFilter.class)` HiddenHttpMethodFilter가 빈으로 등록되어 있지 않으면, `return new OrderedHiddenHttpMethodFilter();` 새로운 필터를 만든다.
