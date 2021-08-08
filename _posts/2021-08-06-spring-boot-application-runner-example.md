---
layout: post
title: SpringBoot CommandLineRunner, ApplicationRunner 초기화 방법
date: 2021-08-06 12:04 +0900
image: '/images/spring.png'
tags: [spring]
categories: [spring]
toc: true
description: ApplicationRunner,CommandLineRunner를 애플리케이션 구동시 사용하는 방법에 대해서 알아보자
---
## 1. 들어가며
Spring Boot를 시작할때, 초기화하는 용도로 ApplicationRunner, CommandLineRunner를 사용하는데, 어떻게 사용하는지, 둘의 차이점은 무엇인지, 실제 스프링에서 어떻게 구현했는지, 소스코드를 통해서 알아보자. 



## 2. 예제 코드

> 예제 코드는 [여기](https://github.com/umanking/spring-boot-initializing-example)에서 확인 가능합니다.



### 2.1. CommandLineRunner

CommandLineRunner는 `@FunctionInterface`이고, 단하나의 메서드를 가짐. run메서드는 String 배열을 파라미터로 받는다.

```java
@FunctionalInterface
public interface CommandLineRunner {
   void run(String... args) throws Exception;
}
```

### 2.2. ApplicationRunner

```java
@FunctionalInterface
public interface ApplicationRunner {
   void run(ApplicationArguments args) throws Exception;
}
```

ApplicationRunner도 `@FunctionalInterface`이고, 역시나 단하나의 run메서드를 가지고, ApplicationArguements 타입을 파라미터로 받는다. 



### 2.3. 방법 1

ApplicationRunner를 기준으로 설명하자면, `ApplicationRunner` 인터페이스를 구현하면 된다. 주의할 점은 `@Component`와 같은 스프링이 스캔할 수 있는 빈의 후보군이 되어야 한다. 

```java
@Component
public class MyRunner implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("hello MyRunner!");
    }
}
```

### 2.4. 방법 2 

사실 같은 유형이긴한데, 클래스를 만들기 귀찮다면 MainApplication 안에다가, 아래에다가 @Bean으로 어노테이션을 추가하고, ApplicationRunner 객체를 익명함수 형태로 만들어 줄수 있다. 

실제로 [joshlong](https://github.com/joshlong) 도 Session에서 간단한 예제를 보여주는 경우에, 클래스로 만들어서 빼는게 아니라, MainApplication안에 `@Bean`등을 등록하는 것을 볼 수 있다.

```java
@SpringBootApplication
public class SpringBootInitializingExampleApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringBootInitializingExampleApplication.class, args);
    }
  
@Bean
ApplicationRunner myApplicationRunner() {
    return new ApplicationRunner() {
        @Override
        public void run(ApplicationArguments args) throws Exception {
            System.out.println("hello applicationRunners");

        }
    };
}
```

### 2.5. 방법 3

방법3까지는 아니고, 방법2의 `익명함수 -> 람다식` 으로 간결하게 표현할 수 있다.

```java
@Bean
ApplicationRunner myApplicationRunner() {
    return args -> System.out.println("hello applicationRunners");
}
```

번외로 이게 가능한 이유는, ApplicationRunner가 오직 하나의 메서드를 가진 인터페이스이기 때문이다. 그렇기 때문에 불필요한 부분들을 제거하고 나면 남는건, 파라미터와 리턴하는 Body만 남게된다! 깔끔 하다.



### 2.6. ApplicationRunner, CommandLineRunner 우선 순위? 

동시에 두개를 등록했을때 어떤게 우선할까? 당연히 테스트를 해보면 된다. 아니면 실제 소스를 뒤져봐도 된다.

실제 소스를 뒤져보면 ApplicationRunner 인터페이스로 이동해서, run메서드를 클릭해서 따라가서 보면된다. 

해당 메서드는 `SpirngApplication.java` 파일안의 `callRunners` 메서드이다.



```java
private void callRunners(ApplicationContext context, ApplicationArguments args) {
   List<Object> runners = new ArrayList<>();
   runners.addAll(context.getBeansOfType(ApplicationRunner.class).values()); // ApplicationRunner
   runners.addAll(context.getBeansOfType(CommandLineRunner.class).values()); // CommandLineRunner
   AnnotationAwareOrderComparator.sort(runners);
   for (Object runner : new LinkedHashSet<>(runners)) {
      if (runner instanceof ApplicationRunner) {
         callRunner((ApplicationRunner) runner, args);
      }
      if (runner instanceof CommandLineRunner) {
         callRunner((CommandLineRunner) runner, args);
      }
   }
```

그러면 다음과 같이 callRunners 메서드에 다다르게 된다.  runners 에 addAll메서드를 호출해서 러너들을 추가해주는 순서가, ApplicationRunner와 그다음에 CommandLineRunner인것을 알 수 있다. 

저 말이 사실인지 확인하기 위해서 다음과 같이 2개의 러너를 등록해보자. 

```java
@Bean
public CommandLineRunner commandLineRunner() {
    return args -> System.out.println("hello commandLineRunner");
}

@Bean
public ApplicationRunner myApplicationRunner() {
    return args -> System.out.println("hello applicationRunners");
}
```



프로젝트를 실행하면 applicationRunner와 commandLineRunner순으로 나왔다. 

```
2021-08-06 11:47:33.732  INFO 36261 --- [           main] SpringBootInitializingExampleApplication : No active profile set, falling back to default profiles: default
2021-08-06 11:47:34.109  INFO 36261 --- [           main] SpringBootInitializingExampleApplication : Started SpringBootInitializingExampleApplication in 0.619 seconds (JVM running for 1.089)
hello applicationRunners
hello commandLineRunner
```



### 2.7. @Order 를 이용해서 순서를 바꿀 순 없나? 

`@Order`어노테이션의 value값은 작은값이 우선순위가 높다! `@Order`를 이용해서 빈이 등록되는 순서를 변경할 수 있지만, 위의 방법2,방법3이 아니라 클래스를 만들고, 클래스 레벨에 @Order 어노테이션을 적용해야지 적용되는 것을 확인할 수 있다. 

```java
@Order(1) //우선 순위 높음
@Component
public class MyCommandLineRunner implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Hello MyCommandLineRunner !");
    }
}
```



```java
@Order(100) //우선순위 낮음
@Component
public class MyApplicationRunner implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("Hello MyApplicationRunner !");
    }
}
```

프로젝트를 실행하면 다음과 같이 나온다. 

```
2021-08-06 11:55:00.061  INFO 36520 --- [           main] SpringBootInitializingExampleApplication : No active profile set, falling back to default profiles: default
2021-08-06 11:55:00.417  INFO 36520 --- [           main] SpringBootInitializingExampleApplication : Started SpringBootInitializingExampleApplication in 0.564 seconds (JVM running for 1.009)
Hello MyCommandLineRunner !
Hello MyApplicationRunner !
```



## 3. 정리

- ApplicationRunner, CommandLineRunner 별차이 없다. ApplicationRunner를 사용하자.
- 기왕이면 람다식으로 간결하게 표현한다. 
  - 보통은 프로젝트 시작시에 `ActiveProfiles`나 `서버 타임존` 이런것들에 대한 로깅용도로 사용한다. 
- `@Order`를 이용해 순서를 변경할 수 있다. 
  - 하지만 클래스로 빼야 한다. 
  - 그래서 `@Order` 를 이용해서 빈의 등록순서를 지정할 정도의 크리티컬한 상황은 없을 것 같다.