---
layout: post
title: Spring과 MongoDB 연동 실전 가이드
date: 2023-08-04 21:58 +0900
image: https://miro.medium.com/v2/resize:fit:399/0*arJ82E5eU-0jnT4J.jpg
tags: [springboot, spring, mongodb]
---
# 제목: Spring과 MongoDB 연동: 실전 가이드

## 소개

이 블로그에서는 Spring 프레임워크와 MongoDB를 연동하는 방법에 대해 자세히 알아보겠습니다. MongoDB는 NoSQL 데이터베이스로서 데이터를 JSON 형태의 BSON(Binary JSON) 문서로 저장하는데, Spring 프레임워크를 활용하여 MongoDB와 원활하게 연동하면 데이터베이스 작업을 쉽고 효율적으로 처리할 수 있습니다.

## 환경 설정

### 1. MongoDB 설치 및 실행

먼저 MongoDB를 설치하고 실행해야 합니다. MongoDB 공식 웹사이트에서 MongoDB Community Edition을 다운로드하고 설치한 후, MongoDB 서버를 실행합니다.

### 2. Spring Boot 프로젝트 생성

Spring Boot 프로젝트를 생성하고, Maven 또는 Gradle을 이용하여 MongoDB와 Spring Data MongoDB 라이브러리를 추가합니다.

```xml
<!-- pom.xml -->

<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- MongoDB Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-mongodb</artifactId>
    </dependency>
</dependencies>
```

## MongoDB 연동 설정

Spring Boot는 기본적으로 MongoDB와의 연동을 지원합니다. application.properties 또는 application.yml 파일을 사용하여 MongoDB 연결 설정을 추가합니다.

```properties
# application.properties

spring.data.mongodb.uri=mongodb://localhost:27017/mydb
```

## 도메인 모델과 레포지토리 생성

### 1. 도메인 모델 생성

MongoDB 컬렉션과 매핑되는 도메인 모델을 생성합니다.

```java
// User.java

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String name;
    private int age;

    // 생성자, getter, setter 생략
}
```

### 2. 레포지토리 생성

MongoDB와의 데이터 작업을 위한 레포지토리를 생성합니다.

```java
// UserRepository.java

import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

}
```

## 서비스 레이어 생성

비즈니스 로직을 처리하는 서비스 레이어를 생성합니다.

```java
// UserService.java

import java.util.List;

public interface UserService {
    User createUser(User user);
    List<User> getAllUsers();
    User getUserById(String id);
    void deleteUserById(String id);
}
```

```java
// UserServiceImpl.java

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }
}
```

## 컨트롤러 생성

웹 요청을 처리하는 컨트롤러를 생성합니다.

```java
// UserController.java

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteUserById(@PathVariable String id) {
        userService.deleteUserById(id);
    }
}
```

## 테스트

이제 Spring Boot 애플리케이션을 실행하고 POSTMAN 등의 API 클라이언트를 사용하여 서비스를 테스트할 수 있습니다. /users 엔드포인트를 통해 사용자를 생성하고, /users GET 엔드포인트를 통해 사용자 목록을 가져오고, /users/{id} GET 엔드포인트를 통해 특정 사용자를 조회하며, /users/{id} DELETE 엔드포인트를 통해 사용자를 삭제할 수 있습니다.

## 결론

이 블로그에서는 Spring Boot와 MongoDB를 연동하는 방법에 대해

 상세히 알아보았습니다. MongoDB의 NoSQL 데이터베이스와 Spring Data MongoDB를 활용하여 간단한 사용자 관리 시스템을 구현해보았습니다. Spring Boot의 강력한 기능과 MongoDB의 유연성을 결합하여 다양한 웹 애플리케이션을 구축할 수 있습니다. Spring Boot와 MongoDB를 활용하여 다양한 프로젝트를 개발해보고, 더욱 발전된 기술과 애플리케이션을 만들어 나가길 바랍니다. Happy coding!