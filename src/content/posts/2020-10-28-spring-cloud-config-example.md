---
title: '[Spring Cloud] spring cloud config 간단 예제'
description: spring cloud config 의 간단한 예제를 살펴보자.
date: '2020-10-28T09:41:00+09:00'
permalink: /2020/10/28/spring-cloud-config-example/
section: backend
hub: spring
type: tutorial
level: 중급
tags:
  - spring
  - spring-cloud
image: >-
  https://lh3.googleusercontent.com/proxy/vp6-IkjoFSjoYPuX32vDEkgN4kGDmjylNXNQiOz-3l_LFL9hRTRy1Nmu8sxMovTLt7OEpgIgb3IQPGn-QWzgn5xkHKyXnll64fWWfCLCkh1OwW8Kj4USNGnfFjd3kq_TLVsFpvN0u7ZI7w
---

## 1. 들어가며 
MSA 시스템 특성상 여러개의 프로젝트를 관리하고 띄우다 보면, configuration 정보가 이곳저곳에 흩어져 있다보니까, 변경사항을 한눈에 파악하기가 힘들다. 그래서 Spring Cloud Config 라는 프로젝트가 나왔다. Spring Cloud Config 프로젝트를 통해서 간단한 예제를 살펴보자.


## 2. 구성 요소

구성요소는 다음과 같다.

- Git repository: 이곳에 config 정보를 한데 모아서 관리한다. git은 public하게 오픈되어 있기 때문에, 로컬에서 관리할 수도 있고, Secure 하게도 관리할 수 있다. 
- Config Server: 위의 git repository의 uri 설정을 통해서 설정한 정보들을 읽어온다. URL 요청을 통해서 json 형태로 파싱되어서 결과값을 얻을 수 있다. 이는 추후에 Config Client 측에서 데이터를 그대로 사용가능하다. 
- Config Client: url 에 Config Server 를 호출함으로써 정보를 읽어와서 사용할수 있다. 


## 3. 예제 코드
### 3.1. Git Repository (중앙으로 관리할 파일을 설정)

```
cd ~
mkdir configrepo
vi application.yml
```

원래는 git repository 를 하나 파서 해당 URL정보를 입력하지만, 여기에서는 로컬 파일로 실습한다.

로컬 파일 형태로, `application.yml` 파일을 하나 만들어보자.

```yml
my:
  greeting: hello world from config server
```



### 3.2. 서버 구성

spring-cloud-config-server 프로젝트를 만들고 다음 dependancy 를 추가한다.

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-config-server</artifactId>
  <version>2.2.5.RELEASE</version>
</dependency>
```



application.properties에 다음과 같이 추가한다. 여기서는 로컬 위치의 특정 파일을 대상으로 하지만, github에 public한 주소정보를 가져와서 할 수 있다. 물론 이런 비밀스런 정보를 public하게 오픈하는건 위험하다. 그와 관련된 [secure한 방법도 제공한다. 📖](https://cloud.spring.io/spring-cloud-config/reference/html/#_security)

```properties
spring.cloud.config.server.git.uri=${HOME}/dev/configrepo // 위에서 만들었던 로컬 레포지토리 장소를 지정한다!
server.port=8888
```

Main 클래스에 @EnableConfigServer 애노테이션을 붙여준다.

```java
@SpringBootApplication
@EnableConfigServer
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

}
```



프로젝트를 시작하게 되면 다음과 같이 나오면서, 로컬에 등록한 파일정보를 읽어 들인다. 

```xml
2020-10-27 17:44:12.599 INFO 11004 --- [on(2)-127.0.0.1] o.s.c.c.s.e.NativeEnvironmentRepository : Adding property source: file:/var/folders/92/4rgfccqd407gkj4j3mz9f8sw0000gn/T/config-repo-1752392757482350220/application.yml
```

url 조회 규칙은 다음과 같다.url 로 조회하게 되면 다음과 같다. 

```
/{application}/{profile}[/{label}]
/{application}-{profile}.yml
/{label}/{application}-{profile}.yml
/{application}-{profile}.properties
/{label}/{application}-{profile}.properties
```



`http://localhost:8888/application/default/` 이렇게 요청하면 다음과 같이 json 형식으로 출력된다.

```json
{"name":"application","profiles":["default"],"label":null,"version":"baaf27470656e4c05dd6f2beb3a0f220b2e38750","state":null,"propertySources":[{"name":"/Users/home/dev/configrepo/application.yml","source":{"my.greeting":"hello world from config server"}}]}
```





### 3.3. 클라이언트 구성

Spring-cloud-config-client 프로젝트를 만든다. 다음과 같은 dependency를 추가한다.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```



`application.yml` 파일에 다음과 같이 추가한다.

```yml
spring:
  cloud:
    config:
      uri: http://localhost:8888
```

여기서 설정한 spring.cloud.config.uri 정보는 2번에서 만든 config server에 대한 주소값이다. 그렇기 때문에 로컬에서 띄울때 포트가 충돌이 나서 서버는 8888, client는 8080(default)로 잡았다. 

프로젝트 실행을 하게 되면 다음과 같이 config server 정보를 fetch 해오고, 환경 정보를 읽어온다.

```
2020-10-28 09:07:56.245  INFO 12533 --- [on(1)-127.0.0.1] c.c.c.ConfigServicePropertySourceLocator : Fetching config from server at : http://localhost:8888
2020-10-28 09:07:56.293  INFO 12533 --- [on(1)-127.0.0.1] c.c.c.ConfigServicePropertySourceLocator : Located environment: name=application, profiles=[default], label=null, version=baaf27470656e4c05dd6f2beb3a0f220b2e38750, state=null
```



간단한 Contorller를 만들어서 JsonBody에 해당 값을 잘 불러오는지 테스트 해보자! 

```java
@RestController
public class GreetingController {

    @Value("${my.greeting}")
    private String greetingMessage;

    @GetMapping("/greeting")
    public String greeting() {
        return "my.greeting: " + greetingMessage;
    }
}
```



프로젝트를 다시 시작하고, `http://localhost:8888/greeting`요청하게 되면 다음과 같이 화면에 출력된다.

`my.greeting: hello world from config server` 

greetingMessage 필드에 담긴 메세지는 처음 로컬에서 만든 파일안에 지정했던 메세지로 잘 출력된 것을 확인했다. 



## 4. 정리

이번에는 MSA환경에서 각 프로젝트마다 필요한 config 정보를 한군데에서 관리하는 spring-cloud-config에 대해서 알아보았다. 

단순히 로컬에서 파일을 관리하는 예제였기 때문에 git으로 public하지 않은 공간에 관리하는 방법에 대해서 더 알아봐야겠다.
