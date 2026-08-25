---
title: '[JPA] QueryDSL 설정방법'
description: >-
  JPA에서 QueryDsl를 사용하는 방법에 대해서 알아보자. QueryDSL은 쿼리 domain specific language로 도메인에
  맞게 쿼리를 프로그링 할 수 있다는 것이다.
date: '2019-04-12T00:00:00+09:00'
permalink: /2019/04/12/jpa-querydsl/
section: backend
hub: jpa
type: tutorial
level: 심화
tags:
  - jpa
  - querydsl
image: >-
  https://user-images.githubusercontent.com/20104232/64585171-96511580-d3d2-11e9-947d-8f1e98e46100.png
---

> JPA에서 QueryDsl를 사용하는 방법에 대해서 알아보자. QueryDSL은 쿼리 domain specific language로 도메인에 맞게 쿼리를 프로그링 할 수 있다는 것이다.

```java
List<Person> persons = queryFactory.selectFrom(person)
  .where(
    person.firstName.eq("John"),
    person.lastName.eq("Doe"))
  .fetch();
```

이런 느낌!😀

## 예제 코드

```java
@Entity
@Table
@Data
public class Account {

    @Id
    @GeneratedValue
    private Long id;
    private String firstName;
    private String lastName;
}
```

```java
public interface AccountRepository extends JpaRepository<Account, Long> {
}
```

id와 title만 있는 Account엔티티를 정의하고, 기본적으로 JpaReposiotry를 상속받는 레포지토리를 만든다.

```xml
    <dependency>
        <groupId>com.querydsl</groupId>
        <artifactId>querydsl-apt</artifactId>
        <scope>provided</scope>
    </dependency>

    <dependency>
        <groupId>com.querydsl</groupId>
        <artifactId>querydsl-jpa</artifactId>
    </dependency>
```

다음과 같이 의존성을 주입한다.

```xml
...
        <plugins>
            ...
            <plugin>
                <groupId>com.mysema.maven</groupId>
                <artifactId>apt-maven-plugin</artifactId>
                <version>1.1.3</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>process</goal>
                        </goals>
                        <configuration>
                            <outputDirectory>target/generated-sources/java</outputDirectory>
                            <processor>com.querydsl.apt.jpa.JPAAnnotationProcessor</processor>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
```

다음과 같은 플러그인을 주입한다. 해당 플러그인은 compile할 때, Post엔티티를 통해서 Query를 만들 수 있는 QAccount라는 클래스를 자동으로 생성해 주는 플러그인이다. 위를 보면, `outputDirectory`가 QAccount 라는 클래스들이 만들어지는 위치이다. 또한 사용하는 프로세서는 `JPAAnnotationProcessor` 를 사용한다.

이렇게 추가하고, console 창에 다음과 같이 입력한다.

```
$ mvn clean && compile
```

clean은 target 디렉토리를 비우는 것이고, compile을 통해서 우리가 원하는 QPost라는 클래스를 생성한다.

```java
/**
 * QAccount is a Querydsl query type for Account
 */
@Generated("com.querydsl.codegen.EntitySerializer")
public class QAccount extends EntityPathBase<Account> {

    private static final long serialVersionUID = 760879443L;

    public static final QAccount account = new QAccount("account");

    public final StringPath firstName = createString("firstName");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lastName = createString("lastName");

    public QAccount(String variable) {
        super(Account.class, forVariable(variable));
    }

    public QAccount(Path<? extends Account> path) {
        super(path.getType(), path.getMetadata());
    }

    public QAccount(PathMetadata metadata) {
        super(Account.class, metadata);
    }

}
```

QueryDsl를 사용하는 이유가 여러개 있겠지만, 결국 조건절에서 typeSafe하게 비교하는 문장을 만들 수 있기 때문에 사용한다.

```java
public interface AccountRepository extends JpaRepository<Account, Long>, QuerydslPredicateExecutor<Account> {
}
```

다음과 같이 `QueryDslPredicateExecutor<T>` 를 추가함으로써 Predicate 를 사용할 수 있다.

```java
public interface QuerydslPredicateExecutor<T> {

    /**
     * Returns a single entity matching the given {@link Predicate} or {@link Optional#empty()} if none was found.
     *
     * @param predicate must not be {@literal null}.
     * @return a single entity matching the given {@link Predicate} or {@link Optional#empty()} if none was found.
     * @throws org.springframework.dao.IncorrectResultSizeDataAccessException if the predicate yields more than one
     *           result.
     */
    Optional<T> findOne(Predicate predicate);

    /**
     * Returns all entities matching the given {@link Predicate}. In case no match could be found an empty
     * {@link Iterable} is returned.
     *
     * @param predicate must not be {@literal null}.
     * @return all entities matching the given {@link Predicate}.
     */
    Iterable<T> findAll(Predicate predicate);

    /**
     * Returns all entities matching the given {@link Predicate} applying the given {@link Sort}. In case no match could
     * be found an empty {@link Iterable} is returned.
     *
     * @param predicate must not be {@literal null}.
     * @param sort the {@link Sort} specification to sort the results by, may be {@link Sort#empty()}, must not be
     *          {@literal null}.
     * @return all entities matching the given {@link Predicate}.
     * @since 1.10
     */
    Iterable<T> findAll(Predicate predicate, Sort sort);

    /**
     * Returns all entities matching the given {@link Predicate} applying the given {@link OrderSpecifier}s. In case no
     * match could be found an empty {@link Iterable} is returned.
     *
     * @param predicate must not be {@literal null}.
     * @param orders the {@link OrderSpecifier}s to sort the results by.
     * @return all entities matching the given {@link Predicate} applying the given {@link OrderSpecifier}s.
     */
    Iterable<T> findAll(Predicate predicate, OrderSpecifier<?>... orders);

    /**
     * Returns all entities ordered by the given {@link OrderSpecifier}s.
     *
     * @param orders the {@link OrderSpecifier}s to sort the results by.
     * @return all entities ordered by the given {@link OrderSpecifier}s.
     */
    Iterable<T> findAll(OrderSpecifier<?>... orders);

    /**
     * Returns a {@link Page} of entities matching the given {@link Predicate}. In case no match could be found, an empty
     * {@link Page} is returned.
     *
     * @param predicate must not be {@literal null}.
     * @param pageable may be {@link Pageable#unpaged()}, must not be {@literal null}.
     * @return a {@link Page} of entities matching the given {@link Predicate}.
     */
    Page<T> findAll(Predicate predicate, Pageable pageable);

    /**
     * Returns the number of instances matching the given {@link Predicate}.
     *
     * @param predicate the {@link Predicate} to count instances for, must not be {@literal null}.
     * @return the number of instances matching the {@link Predicate}.
     */
    long count(Predicate predicate);

    /**
     * Checks whether the data store contains elements that match the given {@link Predicate}.
     *
     * @param predicate the {@link Predicate} to use for the existence check, must not be {@literal null}.
     * @return {@literal true} if the data store contains elements that match the given {@link Predicate}.
     */
    boolean exists(Predicate predicate);
}

```

테스트 케이스를 작성해보자.

```java
@DataJpaTest
@RunWith(SpringRunner.class)
public class AccountRepositoryTest {

    @Autowired
    private AccountRepository accountRepository;

    @Test
    public void crud() {

        Account account = new Account();
        account.setFirstName("alice");
        account.setLastName("han");
        accountRepository.save(account);

        QAccount qAccount = QAccount.account;
        Optional<Account> alice = accountRepository.findOne(qAccount.firstName.eq("alice"));

        Account result = alice.get();
        Assert.assertEquals(result.getFirstName(), "alice");


    }
}

```

Account 하나를 만들어서 저장하고, QAccount형의 필드 qAccount를 만들어 놓고, 아래와 같이 typeSafe하게 접근해서 사용할 수 있다. 예제에서는 account의 firstName이 "alice"인 조건절을 찾는 메서드 이다.

```
...// 생략
Hibernate:
    select
        account0_.id as id1_0_,
        account0_.first_name as first_na2_0_,
        account0_.last_name as last_nam3_0_
    from
        account account0_
    where
        account0_.first_name=?

```

쿼리뭔을 보면, where 조건절의 first_name으로 찾는 것을 확인할 수 있다.
