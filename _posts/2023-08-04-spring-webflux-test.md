---
layout: post
title: Spring WebFlux 테스트 방법
date: 2023-08-04 22:02 +0900
image: https://velog.velcdn.com/images/nowod_it/post/ed1b5a5a-f075-48e6-b5b7-01e76e3c003d/image.png
tags: [spring, webflux, test]
---
# 제목: Spring WebFlux 테스트 방법: 실전 가이드

## 소개

이 블로그에서는 Spring WebFlux의 테스트 방법에 대해 자세히 알아보겠습니다. Spring WebFlux는 Spring Framework 5에서 도입된 리액티브 프로그래밍 모델로서, 비동기적인 웹 애플리케이션을 개발할 수 있게 해줍니다. WebFlux의 컨트롤러, 라우터 함수 등을 테스트하는 방법을 살펴보고, 실전 예제를 통해 효과적으로 테스트하는 방법을 배워보겠습니다.

## 환경 설정

Spring Boot 프로젝트를 생성하고, Maven 또는 Gradle을 이용하여 Spring WebFlux 라이브러리를 추가합니다.

```xml
<!-- pom.xml -->

<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>

    <!-- 테스트 라이브러리 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## 테스트 애노테이션

Spring WebFlux 테스트를 위해 주로 사용되는 애노테이션들을 살펴보겠습니다.

1. `@WebFluxTest`: WebFlux 컨트롤러를 테스트하기 위한 애노테이션입니다. 해당 컨트롤러와 관련된 빈들만 로드하여 테스트를 진행합니다.

2. `@AutoConfigureWebTestClient`: 테스트를 위한 WebTestClient를 자동으로 설정해주는 애노테이션입니다.

3. `@MockBean`: 테스트 시에 사용할 가짜 빈(Mock 빈)을 생성합니다. 실제 빈과 동일한 타입으로 Mock 객체를 주입하여 테스트를 진행할 수 있습니다.

## 실전 예제: WebFlux 컨트롤러 테스트

간단한 To-Do 리스트를 관리하는 WebFlux 컨트롤러를 테스트해보겠습니다.

### 1. 도메인 모델과 컨트롤러 작성

```java
// Todo.java

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Todo {
    private String id;
    private String title;
    private boolean completed;
}
```

```java
// TodoController.java

import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/todos")
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping
    public Flux<Todo> getAllTodos() {
        return todoService.getAllTodos();
    }

    @GetMapping("/{id}")
    public Mono<Todo> getTodoById(@PathVariable String id) {
        return todoService.getTodoById(id);
    }

    @PostMapping
    public Mono<Todo> createTodo(@RequestBody Todo todo) {
        return todoService.createTodo(todo);
    }

    @PutMapping("/{id}")
    public Mono<Todo> updateTodo(@PathVariable String id, @RequestBody Todo todo) {
        return todoService.updateTodo(id, todo);
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteTodo(@PathVariable String id) {
        return todoService.deleteTodoById(id);
    }
}
```

### 2. TodoService 작성

```java
// TodoService.java

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface TodoService {
    Flux<Todo> getAllTodos();
    Mono<Todo> getTodoById(String id);
    Mono<Todo> createTodo(Todo todo);
    Mono<Todo> updateTodo(String id, Todo todo);
    Mono<Void> deleteTodoById(String id);
}
```

```java
// TodoServiceImpl.java

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class TodoServiceImpl implements TodoService {

    private final List<Todo> todoList = new ArrayList<>();

    @Override
    public Flux<Todo> getAllTodos() {
        return Flux.fromIterable(todoList);
    }

    @Override
    public Mono<Todo> getTodoById(String id) {
        return Mono.justOrEmpty(todoList.stream()
                .filter(todo -> todo.getId().equals(id))
                .findFirst()
                .orElse(null));
    }

    @Override
    public Mono<Todo> createTodo(Todo todo) {
        todoList.add(todo);
        return Mono.just(todo);
    }

    @Override
    public Mono<Todo> updateTodo(String id, Todo todo) {
        return getTodoById(id)
                .flatMap(existingTodo -> {
                    existingTodo.setTitle(todo.getTitle());
                    existingTodo.setCompleted(todo.isCompleted());
                    return Mono.just(existingTodo);
                });
    }

    @Override
    public Mono<Void> deleteTodoById(String id) {
        return getTodoById(id)
                .flatMap(existingTodo -> {
                    todoList.remove(existingTodo);
                    return Mono.empty();
                });
    }
}
```

### 3. 테스트 클래스 작성

```java
// TodoControllerTest.java

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.mockito.Mockito.*;

@WebFluxTest(TodoController.class)
public class TodoControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private TodoService todoService;

    @Test
    public void getAllTodos_shouldReturnAllTodos() {
        Todo todo1 = new Todo("1", "Todo 1", false);
        Todo todo2 = new Todo("2", "Todo 2", true);

        when(todoService.getAllTodos()).thenReturn(Flux.just(todo1, todo2));

        webTestClient.get()
                .uri("/todos")
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Todo.class)
                .hasSize(2)
                .contains(todo1, todo2);

        verify(todoService, times(1)).getAllTodos();
    }

    // 기타 다른 테스트 케이스 작성
    // getTodoById(), createTodo(), updateTodo(),

 deleteTodo() 등...
}
```

## 테스트 실행

테스트를 실행하기 위해 `./mvnw test` 명령어를 사용하거나 IDE의 테스트 실행 기능을 사용할 수 있습니다. 정의한 테스트 케이스들이 성공적으로 실행되며 Spring WebFlux 컨트롤러가 제대로 작동하는지 확인할 수 있습니다.

## 결론

이 블로그에서는 Spring WebFlux 테스트 방법에 대해 다루었습니다. WebFlux 컨트롤러와 서비스를 테스트하기 위해 `@WebFluxTest`, `@AutoConfigureWebTestClient`, `@MockBean` 등의 애노테이션을 사용하는 방법을 배웠습니다. 효과적인 테스트 코드를 작성하여 신뢰성 높은 웹 애플리케이션을 개발하는데 도움이 되기를 바랍니다. Happy coding!