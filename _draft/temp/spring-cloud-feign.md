---
layout: post
title: "[Spring Cloud] feign 기본 사용 방법"
date: 2020-10-28 15:27 +0900
tags: [spring cloud]
---

Spring Cloud feign에 대해서 알아보자. feign은 ~체하다 라는 뜻으로, netflix에서 개발한 일종의 restTemplate와 비슷하다고 본다. 
비교적 쉬운 설정으로 비즈니스 로직에만 집중할 수 있다는 장점이 있다.

<!-- more --> 

## 라이브러리 추가 

다음과 같이 라이브러리를 추가한다.

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-feign</artifactId>
  <version>1.4.7.RELEASE</version>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

이렇게 프로젝트를 시작하면 다음과 같은 에러가 날 수 있다.

```
java.lang.NoSuchMethodError: 'void org.springframework.boot.builder.SpringApplicationBuilder.<init>(java.lang.Object[])'
	at org.springframework.cloud.bootstrap.BootstrapApplicationListener.bootstrapServiceContext(BootstrapApplicationListener.java:161)
	at org.springframework.cloud.bootstrap.BootstrapApplicationListener.onApplicationEvent(BootstrapApplicationListener.java:102)
```

아마, boot 스타터 의존성을 물고 있고, boot 버전이 2.3.4인거에 비해서, `spring-cloud-starter-feign` 은 1.4.7 이기 때문이라는 것 같다. 

spring-cloud.version과 dependencyManagement를 추가한다.

```xml
<properties>
  <java.version>11</java.version>
  <spring-cloud.version>Hoxton.SR8</spring-cloud.version>
</properties>

... 생략...

<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-dependencies</artifactId>
      <version>${spring-cloud.version}</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```



## 예제

실제 api를 만드는 것은 수고스럽기 때문에, [jsonplaceholder](https://jsonplaceholder.typicode.com/) 에서 fake로 REST API를 call 할 수 있다.
https://jsonplaceholder.typicode.com/users 요청하면 Json형태로 정의된 오브젝트를 볼 수 있다. 

> ⚠️ 보기 불편하다면 크롬 익스텐션의 [jsonformatter](https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa) 이거를 설치
> 참고로 json 형식을 dto 오브젝트로 변환해 주는 사이트가 존재한다. 
> http://www.jsonschema2pojo.org/ 해당 사이트에서 json을 pojo dto로 변환하면 편하다! 
> 물론 IntelliJ plugin 에서도 제공한다. [Json2Pojo](https://plugins.jetbrains.com/plugin/8533-json2pojo)


#### @EnableFeignClient 추가

```java
@SpringBootApplication
@EnableFeignClients
public class DemoApplication {
  
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}

```

> ⚠️ feign client는 text-base HTTP API에만 사용되기 때문에, binary data와 같은 file upload , download에는 사용할 수 없다. 

#### 인터페이스 정의!! 

```java
@FeignClient(url ="https://jsonplaceholder.typicode.com/" , name = "USER-CLIENT")
public interface UserClient {

    @GetMapping("/users")
    List<UserResponse> findUsers();
}
```

main 클래스 @EnableFeignClient에 의해서 @FeingClient로 등록된 빈을 찾아서 등록한다. url은 endpoint의 baseURL이라고 생각하면 된다. 

실제 요청할 API가 `GET`방식의  `https://jsonplaceholder.typicode.com/users`  이기 때문에 그것에 맞춰 @GetMapping("/users")로 코드를 작성했다.



### 실제 컨트롤러 작성 

```java
@RestController
public class UserController {
  
    @Autowired
    private UserClient userClient;

    @GetMapping("/findAllUsers")
    public List<UserResponse> findAllUsers() {
        return userClient.findUsers();
    }
}
```

앞에서 작성했던 UserClient (인터페이스만 정의함)를 빈으로 주입해서, 우리의 컨트롤러에 적용한다. 

프로젝트를 실행하고 `http://localhost:8080/findAllUsers`를 요청하면 데이터가 제대로 나오는지 확인한다! 





## 더 알아볼것 

- header, parameter, pathvariable와 같은 endpoint 사용하는 방법
- restTemplate의 retry option, 실패시 처리에 관해서 

