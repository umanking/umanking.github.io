---
layout: post
title: "[Java] 리플렉션(Reflection)이란?"
date: 2019-08-24 23:36:46
categories: [java]
tags: [java, reflection, di-framework]
image: '/images/java.png'
description: Java에서 Reflection 사용하는 방법과 간단한 DI framework 만들기
---



## 1. 자바에서 리플렉션이란? 

Java에서 Runtime에 동적으로 값들을 가져오거나, 변경, 처리할 수 있는 기술을 의미한다. `java.lang.reflect` 패키지 하위에서 제공한다. 보통은 DI Framework를 만들거나, 라이브러리등을 만들때 사용한다. 주의할 것은, Runtime시점이기 때문에 성능상의 이슈도 있고, Runtime시점에서야 문제가 발생하는 경우도 있기 때문에 조심해서 사용해야 한다.



## 2. 기본적인 사용 방법

간단한 Member POJO를 만들어보자

```java
public class Member {
    private String name;
    private int age;
}
```



###  2.1. 클래스 정보 가져오기

3가지 방법으로 클래스에 접근할  수 있다.

```java
public static void main(String[] args){

  // 1. 인스턴스에서 가져오기
  Member member = new Member();
  Class<? extends Member> m1Class = member.getClass();

  // 2. 타입으로 접근하는 방법
  Class<Member> m2Class = Member.class;

  // 3. 패키지 경로로 가져오는 방법
  Class<?> m3Class = Class.forName("com.example.basicjava.reflection.Member");
}
```

자바의 Class라는 API를 통해서 클래스 정보를 가지고 올 수 있다. 클래스 정보를 통해서 `필드`, `메서드`, `구현한 클래스`, `인터페이스` 를 가지고 올 수 있다. 특히나, 메서드, 필드에 접근할 때는 접근제한자가 private인 경우에는 `getDeclaredxxx()` 시리즈의 메서드가 전부다 가지고 올 수 있다. 또한, 접근이 불가능한 필드에 대해서는 각각의 필드에 대해서 `setAccesible(true)` 값을 주면 접근이 가능해 진다.





### 2.2. 메서드 정보 출력

위에서 가져온 class정보를 바탕으로 다음과 같은 행동을 할 수 있다. 

```java
// 패키지 경로로 클래스에 접근해서 가져온다.
Class<?> aClass = Class.forName("com.example.basicjava.reflection.Member");

// 선언된 메서드 나열하기
Method[] methods = aClass.getMethods();
for (Method method : methods) {
  System.out.println("method = " + method.toString());
}
```



### 2.3. 필드값 셋팅 

```java
Class<?> aClass = Class.forName("com.example.basicjava.reflection.Member");

// newInstance 만들기
Member memberInstance = (Member) aClass.getDeclaredConstructor().newInstance();
memberInstance.setName("andrew");
memberInstance.setAge(32);
```

> 참고로, aClass.newInstance()메서드는 9버전 부터 Deprecate 되었다. 



### 2.4. 메서드 호출

Member클래스에 sayHello 메서드를 하나 만들었다. 

```java
public class Member {

  public void sayHello(){
    System.out.println("hello world");
  }
}
```



Member클래스에서 메서드를 가져와서, 호출(Invoke)해보자! 

```java
Class<?> aClass = Class.forName("com.example.basicjava.reflection.Member");

// method invoke 예제
Method sayHello = aClass.getMethod("sayHello");
sayHello.invoke(aClass.getDeclaredConstructor().newInstance()); // hello world
```

invoke의 파라미터로는 해당 메서드를 호출하는 `새롭게 만든 인스턴스`를 넘겨야 한다. 그래서 newInstance()메서드로 aClass를 새롭게 인스턴스화 시켰다. 



## 3. 어노테이션 사용하기

### 3.1. 어노테이션이란? 

```java
// annotation을 만든다.
public @interface CustomAnnotation {...}

// 다음과 같이 클래스, 필드, 메서드와 같은 곳에 사용한다. 
@CustomAnnotation
public class Member {...}
```

자바에서 어노테이션은 `@interface` 으로 만들어서 사용할 수 있다. 하지만 `CustomAnnotation` 은 아무 기능도 하지 않는다. 그저 **주석의 역할**일 뿐, java파일이 compile이 되고 class파일까지 갔을때, 해당 어노테이션이 남아있긴 하지만, 바이트코드가 JVM에서 로딩이 되어 동작할때 까지 유지되지 않는다. 애노테이션의 기본이 `@Retention(RetentionPolicy.CLASS)` 이기 때문에 클래스파일 까지만 유지(Retaion)된다. `@Retention(RetentionPolicy.RUNTIME)` 으로 바꾸면 그제서야, 리플렉션을 통해서 접근할 수 있다.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface MyAnnotation{...}

@MyAnnotaion
public class Member{...}
```



```java
Class<?> aClass = Class.forName("com.example.basicjava.reflection.Member");

// 클래스에 선언된 어노테이션 정보를 가져온다.
Annotation[] annotations = aClass.getAnnotations();
for (Annotation annotation : annotations) {
  System.out.println("annotation = " + annotation);
}
```

이렇게 클래스에서 어노테이션 정보를 가지고 와서 사용할 수 있다.



## 4. 간단한 DI 프레임 워크 만들어보기 

Spring과 같이 빈들을 주입해주는 Container를 직접 만들어 보기전에, 실제 어떤 식으로 동작할지 미리 코드를 살펴보자!

다음과 같이 HelloController에서 HelloService빈을 @InjectAnnotation으로 필드 주입해준다. 

그리고 주입 받은 helloService에서 sayHello()메서드를 호출한다.

```java
public class HelloController {

    @InjectAnnotation
    private HelloService helloService;

    public void sayHello() {
        helloService.sayHello();
    }
}
```

```java
public class HelloService {
    public void sayHello() {
        System.out.println("hi, hello~ ");
    }
}
```



InjectAnnotation를 하나 만든다. 실제 스프링에서 `@Autowired`  처럼 동작할 것이다.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface InjectAnnotation {}
```



### 4.1. 만들어야 할것

- Container를 만들어서, 해당 클래스의 필드에 `@InjectAnnotation` 이 붙은 필드들을 대상으로한다. 
- 그 필드들의 타입의 인스턴스를 만들어서(HelloService) -> 그 필드에 set해준다. 



코드는 다음과 같다. 조금 복잡해 보이지만, 위에서 설명한 그대로를 만들었다. 

```java
public class Container {
  public static <T> T getObject(Class<T> clazz) {
    T instance = createNewInstance(clazz);
    // 클래스내에 선언된 필드들 중에서 어노테이션이 있는것
    Field[] fields = clazz.getDeclaredFields();
    for (Field field : fields) {
      if (field.isAnnotationPresent(InjectAnnotation.class)) {
        // 해당 필드의 타입을 새로 만들고
        Object fieldInstance = createNewInstance(field.getType());
        // 필드의 접근 제어가 private인 경우 수정이 가능하도록 변경
        field.setAccessible(true);
        try {
          // 인스턴스에 생성된 필드를 주입한다.
          field.set(instance, fieldInstance);
        } catch (IllegalAccessException e) {
          e.printStackTrace();
        }
      }
    }
    return instance;
  }

  // 반복되는 instance를 만드는 걸 메서드로 추출했다.
  public static <T> T createNewInstance(Class<T> clazz) {
    try {
      return clazz.getDeclaredConstructor().newInstance();
    } catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
      throw new RuntimeException(e);
    }
  }
}
```



실제 Client에서 사용하는 코드는 다음과 같다. 

```java
 public static void main(String[] args) {
   HelloController helloController = Container.getObject(HelloController.class);
   helloController.sayHello(); // hi, hello~ 출력됨
 }
```

HelloController만 Container에 넘겨줬지만, HelloService 빈을 생성해서, helloService 필드에 주입해 주고, 메서드까지 잘 호출한 것을 볼 수 있다. 

이런 LOW한 레벨의 프레임 워크를 만들거나 할때, 자바 리플렉션이 필요하다!!! 

