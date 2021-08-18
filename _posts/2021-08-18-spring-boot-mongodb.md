---
layout: post
title: SpringBoot, MongoDB 시작하기
date: 2021-08-18 22:41 +0900
toc: true
tags: [spring, mongodb]
categories: [spring, mongodb]
image: 'https://media.vlpt.us/images/hanblueblue/post/3f9bafa6-7426-4118-af83-94e597516200/spring-data-mongodb.png'
description: SpringBoot, Mongodb, docker로 간단한 샘플 프로젝트를 만들어 보고, 주로 어디에 사용하는지에 대해서 알아보자.
---

## 1. Docker로 MongoDB 띄우기

프로젝트 루트에 `docker-compose.yml`  파일을 다음과 같이 만든다.

```yaml
version: "3"
services:
  mongodb:
    image: mongo
    ports:
      - "27017:27017"
    container_name: "docker-mongodb"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: root
```



다음 명령어를 통해서 docker로 mongodb를 띄운다.

```shell
$ docker-compose up -d 
```



## 2. Cli로 접속하기 

```shell
$ docker exec -it {containerId} /bin/sh
$ mongo -u root -p
> enter passsword: root 입력
```



## 3. Compass로 접속하기 

- Compass는 Mongodb 클라이언트 앱

- 다운로드: [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)

  



## 4. 예제 

> 예제 코드는 [여기](https://github.com/umanking/spring-mongo-starter-example) 에서 확인 가능합니다. 

다음과 같이 디펜던시를 추가한다.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
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



`application.properties`  파일에 접속 정보를 넣는다.

```properties
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=test
spring.data.mongodb.username=root
spring.data.mongodb.password=root
```

account 엔티티를 만든다.

```java
@Data
@Document(collection = "account")
public class Account {

    @Id
    private String id;
    private String name;
  	private int age;
}
```



MongoRepository를 상속받는 AccountRepository를 만든다.

```java
public interface AccountRepository extends MongoRepository<Account, String> {
}
```



간단한 account를 등록하는 API를 만든다. 

```java
@RestController
@RequestMapping("/account")
public class AccountController {

    @Autowired
    AccountRepository accountRepository;

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountRepository.save(account);
    }
  
}
```



다음과 같이 요청하면 성공한다.  

```shell
$ curl -X POST 'localhost:8080/account' \
-H 'Content-Type: application/json' \
-d '{
    "name" :"andrew",
    "age": 32
}'
```

```shell
$ curl -X POST 'localhost:8080/account' \
-H 'Content-Type: application/json' \
-d '{
    "name" :"betty",
    "age": 25
}'
```



애플리케이션을 띄울때, accountRepository의 모든 정보를 조회해서, 순차적으로 출력해보고, 어떻게 키값이 들어가는지 확인해 보자. 

```java
@Bean
public ApplicationRunner applicationRunner() {
    return args -> {
        List<Account> all = accountRepository.findAll();
        for (Account account : all) {
            System.out.println("account = " + account);
        }
    };
}
```

id값이 hash값으로 들어간다. 일반적인 RDBMS의 primary key처럼 `Long` 타입이 아니라, String 타입이어야 한다.

```
account = Account(id=611d0b6ebc18cc4de7fc3ef7, name=andrew, age=32)
account = Account(id=611d0b76bc18cc4de7fc3ef8, name=betty, age=25)
```



## 5. 왜 사용하는가 ?
<iframe title="카카오와 MongoDB" width="640" height="360" src="https://play-tv.kakao.com/embed/player/cliplink/414072595?service=player_share" allowfullscreen frameborder="0" scrolling="no" allow="autoplay; fullscreen; encrypted-media"></iframe>

사실 어떻게 사용하는가 보다, 왜 사용하는지가 어디에 사용할 수 있는지가 중요한것 같다. **풀영상은 카카오 세션**을 참고하자. 

### 5.1. Reliabilty(신뢰성)

monogodb는 primary1개와 secondary 2개로 구성이 된다. 주로 primary가 쓰기와 같은 작업을 담당하고, secondary는 primary를 기준으로 데이터를 복사한다. 만약 primary가 죽게 된다면, 자동으로 secondary중 한개를 primary로 지정하고, 관리자가 메뉴얼적으로 하나의 secondary를 추가해줄 수 있다. 어떠한 downtime도 존재하지 않는다. 

### 5.2. Scalability(확장성)

샤딩에 관련된 문제인데, 데이터 트래픽이 엄청나게 증가하거나 했을때, 자동으로 샤딩을 통해서 적절하게 데이터를 밸런싱 해준다.

### 5.3. Flexibility(유연성)

웹 개발자에게 익숙한 JSON포맷에, document방식으로 저장하기 때문에 다양한 데이터를 손쉽게 저장한다는 특징이 있다. 또한, 기능이 추가되거나 필요에 의해서 컬럼들을 추가해야 하는경우, RDB 처럼 스키마의 변경없이, JSON 객체로 그냥 저장하기만 하면 된다.

### 5.4. Index Support(인덱스 지원)

특정 필드를 검색하거나, 다양한 조건으로 빠른 데이터 검색이 가능하다. 

이러한  4가지의 큰 특징 때문에, MonogoDB를 사용한다고 한다. 특히나 카카오 모빌리티에서 `공간 인덱스` 를 복합키로 설정해서, 주변에 탑승이 가능한 차량을 검색하는데 사용하고, 로그와 같이 많은 데이터를 적재하고, 거기서 빠르게 검색할때도 monogodb를 사용한다고 한다. 





## 6. 추가 학습

- TTL 인덱스
- hash 인덱스 
- 컬럼별, 인덱스를 생성해서, 얼만큼 빠르게 조회하는지?