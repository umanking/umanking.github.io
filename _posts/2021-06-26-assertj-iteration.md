---
layout: post
title:  AssertJ 자주 사용하는 것들 
date: 2021-06-26 12:21 +0900
tags: [assertj]
image: '/images/assert.png'
---

테스트 케이스 작성할때, 많이 사용하는 AssertJ에 대해서 알아보자.


자세한 사용법, 예제는 [AssertJ Guide 문서](https://assertj.github.io/doc/#assertj-core-assertions-guide) 를 확인하자!

## 1. Iteration

### 1.1. 컬렉션안에 값이 포함(contain)되어 있는지

```java
List<String> list = List.of("1", "1", "2", "3");

// 포함되어 있니
assertThat(list).contains("1", "2");
// 중복된 값도 반영됨
assertThat(list).containsOnly("2","1","3");
// 순서 까지 정확해야함
assertThat(list).containsExactly("1", "1", "2", "3");
// 순서 정확하지 않아도됨
assertThat(list).containsExactlyInAnyOrder("2", "3", "1", "1");
assertThat(list).contains("1").contains("1").containsSequence("2", "3");
// 오직 한번만 있는 값들
assertThat(list).containsOnlyOnce("2", "3");
assertThat(list).containsAnyOf("2");
```



### 1.2. User객체, Dummy데이터 생성

간단한 User 객체를 만들고, dummy 데이터를 넣어준다.

```java
@Data
public class User {
  private String name;
  private int age;
  private RoleType roleType;
  
  @Getter
  public enum RoleType {
      ADMIN, USER
  }
}
```

dummy 데이터를 생성

```java
protected List<User> getUsers() {
  return List.of(betty(), andrew(), sam());
}

protected User sam() {
  return new User("sam", 25, RoleType.USER);
}

protected User betty() {
  return new User("betty", 20, RoleType.USER);
}

protected User andrew() {
  return new User("andrew", 32, RoleType.ADMIN);
}

```

### 1.3. 조건들을 만족하는지(satisfy)

```java
List<User> users = getUsers();

// Consumer를 파라미터로 받는다.
// allSatisfy 모든 조건을 만족하는
assertThat(users).allSatisfy(user -> {
    assertThat(user.getName()).isNotEqualTo("mike");
    assertThat(user.getAge()).isGreaterThanOrEqualTo(20);
});

// 적어도 하나의 element 값을 충족시키는
assertThat(users).anySatisfy(user -> {
    assertThat(user.getName()).isEqualTo("andrew");
    assertThat(user.getAge()).isEqualTo(32);
});

// 어떤 조건도 만족하지 않는
assertThat(users).noneSatisfy(user -> {
    assertThat(user.getName()).isEqualTo("BTS");
});
```



### 1.4. Match 여부 

```java
// Predicate를 파라미터로 받는다.
assertThat(users).allMatch(user -> user.getName().length() > 0);
```

- allMatch, anyMatch 를 메서드 체이닝 형태로 이어 나갈 수 있다. 

### 1.5. Element 탐색

```java
List<User> users = getUsers();

// element의 방향을 탐색하는것
// 객체 간의 비교를 할때는 EqualsAndHashCode를 선언해줘야 한다.
assertThat(users).first().isEqualTo(betty());
assertThat(users).element(1).isEqualTo(andrew());
assertThat(users).last().isEqualTo(sam());
```

> 객체간의 비교는 Equals와 HashCode를 오버라이딩 해줘야 한다. 그렇지 않게 되면, 객체 동일성(참조값을 비교)하게 됨으로, 우리가 예상하는 같은 이름과 나이를 가진 객체간의 비교가 되지 않는다.



### 1.6. Filter 테스트

```java
// Filtering - Predicate
assertThat(users).filteredOn(user -> user.getName().startsWith("and"))
    .containsOnly(andrew());

// Filtering - Property(fieldName, value)
assertThat(users).filteredOn("name", "andrew")
    .containsOnly(andrew());

assertThat(users).filteredOn("name", in("andrew", "sam"))
    .containsOnly(andrew(), sam());

assertThat(users).filteredOn("name", notIn("mike", "nu"))
    .containsOnly(andrew(), sam(), betty());

// Property 를 메서드 레퍼런스로 표현가능하지만, not, in, notIn 오퍼레이터는 사용불가함
assertThat(users)
    .filteredOn(User::getName, "andrew")
    .filteredOn(User::getAge, 32)
    .containsOnly(andrew());


// null value 값을 찾는다.
assertThat(users).filteredOnNull("name").isEmpty();
```

- filteredOn()메서드는 인자로 받는 조건에 맞게 값을 Filtering 해준다. 그리고 값의 존재여부를 비교한다. 



### 1.7. Extracting single value

```java
List<User> users = getUsers();

// field or property
assertThat(users)
    .extracting("name")
    .contains("andrew", "betty", "sam");

// 람다 표현식 가능
assertThat(users)
    .extracting(User::getName)
    .contains("andrew", "betty", "sam");

// map으로 변환해서 가능
assertThat(users)
    .map(User::getName)
    .contains("andrew", "betty", "sam");

// 2번째 파라미터로 강력하게 타입을 지정해서 > 이렇게 할거면 람다표현식이 나은듯
assertThat(users)
    .extracting("name", String.class)
    .contains("andrew", "betty", "sam");
```

- User객체 안에 `name`필드로만 값들을 비교하고 싶을때, extract 메서드를 통해서 해당 컬렉션에서 필드값만 추출해서 비교가 가능하다. 
- extracting()메서드의 파라미터로 `필드명`을 입력해도 되고, `메서드 레퍼런스로`도 표현 가능하다. 
- map()으로 변환해서 포함되어있는지 확인도 가능하다. 

### 1.8. Extracting multiple value

```java
assertThat(users).extracting("name", "age")
  .contains(tuple("andrew", 32),
            tuple("betty", 20),
            tuple("sam", 25)
           );

assertThat(users).extracting(User::getName, User::getAge)
  .contains(tuple("andrew", 32),
            tuple("betty", 20),
            tuple("sam", 25)
           );
```

- 이번에는 하나의 값이 아닌, multiple value값을 추출한다. 
- tuple()메서드를 통해서 객체를 생성해준다. 당연히 extracting() 으로 넘긴 파라미터 필드 순서에 맞춰야 한다.



## 2. 정리

- 오늘은 테스트케이스를 작성할때 왕왕쓰이는 AssertJ의 Iteration 섹션을 알아봤다.
- 대충 이런게 있지 않을까 ? 찾아보면 웬만한건 있는듯 하다. 

## 3. 참고
- https://assertj.github.io/doc/#assertj-core-group-contains