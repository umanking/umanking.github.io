---
layout: post
title: "Spring RequestMapping 깊게 살펴보기"
date: 2020-03-06 18:29 +0900
categories: [spring]
tags: [spring]
---

맨날 사용하는 Spring MVC 인데도 제대로 설명하지 못해서 한 번 정리 한다.

<!-- more -->

```java
@RestController
public class HomeController {

    @GetMapping
    public String home() {
        return "home";
    }

    @GetMapping("")
    public String home2() {
        return "home";
    }

    @GetMapping(value = "")
    public String home3() {
        return "home";
    }

    @GetMapping(value = "/")
    public String home4(HttpServletRequest request) {
        return "home";
    }
}
```

편의상 화면에서 home이라는 텍스트를 읽고 싶어서 `@ResponseBody`를 품고있는 `@RestController`를 클래스레벨에 두고, 말도 안되는 코드를 작성 했다.

## 첫번째 물음, 위의 4개의 경로는 동일 한가?

정답은 동일하다. `localhost:8080` 루트로 들어오면 위의 각기 다르게 작성한 `@GetmMapping` 이지만 동일한 패스로 인지한다.
다만 저 상태로 실행하면 Spring 에서는 Exception을 발생 시킨다.

> org.springframework.beans.factory.BeanCreationException:Error creating bean with name 'requestMappingHandlerMapping' defined in class path resource
> org/springframework/boot/autoconfigure/web/servlet
> /WebMvcAutoConfiguration\$EnableWebMvcConfiguration.class : Invocation of init method failed;
> nested exception is java.lang.IllegalStateException: Ambiguous mapping.

Ambiguous 매핑 이라고 한다. 개인적으로 공부할 때, 저런 exception은 너무 반갑다.
계속 디버깅을 하다 보니

![](https://user-images.githubusercontent.com/28615416/76073952-d2f67600-5fdd-11ea-831b-e9b62a492560.png)

AbstractHandlerMethodMapping 클래스의 `detectHandlerMethods` 메서드에서 예외가 발생한다. 해당 메서드가 하는 일은 핸들러 빈에서 핸들러 메서드를 찾는 것이다. 더 깊게 들어가 보면 `LinkedHashMap(자료구조)`를 통해서 데이터를 저장한다.

## 다시 본론

여기서 궁금한게 `@RequestMapping`을 자연스럽게 클래스 레벨에 항상 선언했고, 당연히 필수 인지 알았는데 없어도 동작했다.
[java doc](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestMapping.html)을 들어가서 읽어보니까

유연하게 메서드 레벨과 결합하여서 웹요청을 만들어 내는 어노테이션이라고 설명하고 있고
지정할 수 있는 target을 보아하니 Type, Method 두군데 가능하다. 아마 예전에는 `@RequestMapping(method = RequestMethod.GET)` 이런 식으로 많이 사용했을 것이다. 하지만, 문서에서도 저것 보다는 @GetMapping, @PostMapping.. 이런 애들을 더 선호 한다고 나와있다.

> Note: This annotation can be used both at the class and at the method level. In most cases, at the method level applications will prefer to use one of the HTTP method specific variants @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, or @PatchMapping.

또한, 추가적으로 AOP를 클래스 레벨에 적용할 때(Controller 인터페이스)에는 @RquestMapping, @SessionAttributes 어노테이션을 항상 붙이라고 한다. 구체 클래스가 아닌 인터페이스인 경우에

## 참조

[https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestMapping.html](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestMapping.html)
