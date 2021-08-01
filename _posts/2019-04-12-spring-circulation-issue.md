---
layout: post
title: "[Spring] bean circular dependencies (빈 순환 참조)"
date: 2019-04-12 09:10:25
image: '/images/spring.png'
toc: true
categories: [spring]
tags: [spring]
description: 빈 순환 참조가 왜 발생하는지, 해결 방식은 무엇인지에 대해서 알아보자
---

## 들어가며
스프링에서 프로젝트를 진행하면 종종 `빈 순환 참조`가 발생하는데, 이에 대한 해결책을 알아보자.
들어가기에 앞서, 빈 순환 참조는 생성자를 통해서 빈을 주입했을 때, Bean A -> Bean B -> Bean A ... 계속해서 순환 참조하는 것을 말한다.

## 1. 빈 순환 참조가 발생하는 상황

```java
@Component
public class CircularA {

    private CircularB circularB;

    public CircularA(CircularB circularB) {
        this.circularB = circularB;
    }
}
```

```java
@Component
public class CircularB {

    private CircularA circularA;

    public CircularB(CircularA circularA) {
        this.circularA = circularA;
    }
}
```

각각 @Component를 통해서 빈으로 등록시킨다. 상대방 빈을 생성자를 통해서 주입받는다. CircularA 컴포넌트는 빈으로 등록될 때CircularB를 참조하고 있고, CircularB 컴포넌트도 빈으로 등록할 때 Circular A를 참조한다.

```java
@SpringBootTest
@RunWith(SpringRunner.class)
public class CircularTest {

    @Test
    public void test() {
        // just spring context load
    }
}
```

애플리케이션을 띄우거나, 아무것도 작성되지 않은 테스트 케이스를 돌리게되면 다음과 같은 예외가 발생한다.

```
**************************
APPLICATION FAILED TO START
***************************

Description:

The dependencies of some of the beans in the application context form a cycle:

┌─────┐
|  circularA defined in file [/Users/andrew/workspace/spring-boot-practice/target/classes/com/example/demo/spring/circular/CircularA.class]
↑     ↓
|  circularB defined in file [/Users/andrew/workspace/spring-boot-practice/target/classes/com/example/demo/spring/circular/CircularB.class]
└─────┘
```

순환참조가 발생했고, 어떤 빈에서 순환 참조가 일어나는지 알려준다.

## 2. 해결 방법 1. @Lazy

여러 가지 해결 방법이 있지만, 기본적인 원리는 서로 빈이 생성되는 시기를 늦추거나 조율해서 동시에 참조하는게 아니라, 하나의 빈이 생성이 완료 된 후, 동작을 하게끔 만들어 주는게 키포인트!

```java
@Component
public class CircularA {

    private CircularB circularB;

    public CircularA(@Lazy CircularB circularB) {
        this.circularB = circularB;
    }
}
```

사실 여러 개의 블로그를 봤지만, **결국 빈 순환 참조가 난다는 것은 모델링 설계가 잘못되었음을 알려주는 것이라고 했다.** 그렇기 때문에 위에 방법들은 궁극적인 해결책 보다는 가벼운 임시 조치! 아니면 @Autowired, @Inject 어노테이션을 사용하는 것 뿐
