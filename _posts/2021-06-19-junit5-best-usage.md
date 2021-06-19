---
layout: post
title: Junit5 - 기본 사용법
date: 2021-06-19 17:37 +0900
tags: [Junit5]
---

# JUnit5



## Maven 추가 

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-engine</artifactId>
    <version>5.1.0</version>
    <scope>test</scope>
</dependency>
```

이렇게 직접 추가해도 되고, SpringBoot를 사용한다면 `spring-boot-starter-test` 를 추가하면 junit-jupiter 모듈이 포함된다.





## 기본 어노테이션

### @BeforeAll, @BeforeEach

@BeforeAll 어노테이션이 붙은 놈은, 반드시 static이어야 한다. 단 한번만 실행되고, @BeforeEach 는 테스트 메서드 이전에 매번 실행된다.

```java
@BeforeAll
static void beforeAll() {
  System.out.println("한번만 실행됨 beforeAll");
}

@BeforeEach
void setUp() {
  System.out.println("매 테스트 마다 실행됨 ");
}
```



### @AfterAll, @AfterEach

@AfterAll 도 반드시 static이어야 한다. 단 한번만 실행된다. 마찬가지로 @AfterEach도 테스트 메서드 이후로 매번 실행된다.

```java
@AfterAll
static void afterAll() {
  System.out.println("한번만 실행됨 afterAll");
}

@AfterEach
void tearDown() {
  System.out.println("매 테스트 마다 실행됨 (afterEach)");
}

```



### JUnit4에서 사용하던 어노테이션명이 변경되었다.

- @BeforeClass → @BeforeAll : 테스트 실행전 딱 한번 실행함 (static 으로 만들어야 함)
- @Before → @BeforeEach : 모든 테스트 전에 실행함
- @AfterClass → @AfterAll : 테스트 실행 후 딱 한 번 실행함 (static 으로 만들어야 함)
- @After → @AfterEach : 모든 테스트 각각 종료 후에 실행함



### @DisplayName, @Disabled

각 테이트 케이스를 나타내는 이름을 세부적으로 표현할 수 있다.

```java
@Test
@DisplayName("테스트 1")
void test1() {
  System.out.println("test1");
}
```

@Disabled를 통해서 해당 테스트 케이스를 비활성화 할 수 있다. (JUnit4 에서는 `@Ignore` 과 동일하다.)

```java
@Test
@Disabled 
void test2() {
  System.out.println("test2");
}
```



### <u>@ParameterizedTest ⭐️</u>

@ParameterizedTest는 @Test를 대신해서 여러개의 파라미터 값들을 파라미터 값으로 주고, 각 항목들을 테스트 할 수 있다. 

```java
@ParameterizedTest
@ValueSource(ints = {2,4,6,8,9, Integer.MAX_VALUE})
void isEven(int number) {
  assertTrue(Numbers.isEven(number));
}
```

다음과 같이 `@ValueSource`를 검사하고자 하는 인자의 값을 입력하면, @ValueSource에 담은 파라미터 하나하나를 Junit이 테스트한다.



#### Null and Empty Source

```java
@ParameterizedTest
@NullSource
void null_source_test(String input) {
  assertThat(input).isNull();
}
```

- @NullSource -  input 파라미터값에 null값을 넣어준다. 

```java
@ParameterizedTest
@EmptySource
void empty_source_test(String input) {
  assertThat(input).isEmpty();
}
```

- @EmptySource -  input 파라미터값에 빈값(“”)을 넣어준다. 

```java
@ParameterizedTest
@NullAndEmptySource
void null_and_empty_source_test(String input) {
  assertThat(Strings.isBlank(input)).isTrue();
}
```

- @NullAndEmptySource - input 파라미터 값에 `null값` 또는 `빈값`을 넣어준다.



#### EnumSource

```java
public enum RoleType {
  ADMIN, USER
}
```

ADMIN과 USER 타입의 RoleType Enum이 있다.

```java
@ParameterizedTest
@EnumSource(RoleType.class)
void enum_test(RoleType roleType) {
  assertThat(RoleType.values()).contains(roleType);
}
```

RoleType Enum값을 파라미터 값으로 넘겨서 테스트 가능하다.

```java
@ParameterizedTest
// RoleType.ADMIN 값을 제외한 테스트 케이스
@EnumSource(value = RoleType.class, names = {"ADMIN"}, mode = Mode.EXCLUDE)
void enum_exclude_test(RoleType roleType) {
  assertThat(roleType).isEqualTo(RoleType.USER);
}
```

enum의 특정값을(RoleType.ADMIN) 값을 제외한 테스트 케이스

#### CSV Files

`src/test/resources/data.csv`

```
first,second
test,TEST
teSt,TEST
sprIng,SPRING
```



```java
@ParameterizedTest
@CsvFileSource(resources = "/data.csv", numLinesToSkip = 1)
void csv_file_test(String firstColumn, String secondColumn) {
  assertThat(firstColumn.toUpperCase()).isEqualTo(secondColumn);
}
```

- @CsvFileSource는 해당 csv파일을 resouce경로에서 파일을 읽어서, 파라미터 값으로 제공해 준다.



## Exception Test

이번에는 처음 짝수인지를 검증하는 메서드에 기능을 하나 추가 해보자.

```java
    public static boolean isEven(final int number) {
        if (number < 0) {
            throw new IllegalArgumentException();
        }
        return number % 2 == 0;
    }
```

0보다 작은 값이 들어온 경우에 `IllegalArgumentException`를 발생 시킨다.

```java
    @DisplayName("짝수 테스트: 음수값인 경우에 예외 발생")
    @ParameterizedTest
    @ValueSource(ints = {-1, -2})
    void isEven_negative_test(int number) {
        assertThatExceptionOfType(IllegalArgumentException.class)
                .isThrownBy(() -> Numbers.isEven(number));
    }
```

역시나 @ParameterizedTest와 `assertThatExceptionOfType`을 활용한다.
발생할 exception클래스를 적고 누구에 의해서 던져지는지(isThrownBy)를 명시한다. 다만 해당 메서드의 인자는 ThrowingCallable 이기 때문에 람다형태로 작성해 준다.



## 참고 

- https://www.baeldung.com/junit-5

- https://www.baeldung.com/parameterized-tests-junit-5

  





