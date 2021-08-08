---
layout: post
title: "[JPA] Custom Repository 만들기"
date: 2019-04-12 09:03:41
categories: [jpa]
tags: [jpa]
image: 'https://user-images.githubusercontent.com/20104232/64585171-96511580-d3d2-11e9-947d-8f1e98e46100.png'
image: 'https://user-images.githubusercontent.com/20104232/64585171-96511580-d3d2-11e9-947d-8f1e98e46100.png'
---

기존의 JpaRepository를 상속받아서 기본적인 CRUD 기능을 사용할 수 있지만, 내가 1)커스텀하게 만들어서 사용하고 싶은 경우와 이미 JpaReposptry에서 제공하는 메서드를 새롭게 2)오버라이딩해서 사용할 수 있는 경우에 대해서 알아보자 .



## 1\. 기본 Post 엔티티, 레포지토리

```java
@Data
@Entity
@Table
public class Post {

    @Id
    @GeneratedValue
    private Long id;
    private String title;
}
```

```java
public interface PostRepository extends JpaRepository<Post, Long> {
```

## 2\. 커스텀한 레포지토리 만들기

Custom한 레포지토리를 만든다. 이름은 상관이 없다 아무렇게나 만들어도 된다.  
`PostCustomRepository`라고 만듬. Post목록을 가지고 오는 findMyPost() 함수로 정의함

```java
public interface PostCustomRepository {

    List<Post> findMyPost();
}
```

## 3\. 커스텀한 레포지토리 구현하기

```java
@Repository
@Transactional
public class PostCustomRepositoryImpl implements PostCustomRepository {

    @Autowired
    EntityManager entityManager;

    @Override
    public List<Post> findMyPost() {
        System.out.println("===== Post Custom Repository ===="); // 확인하기 위해서 print
        List<Post> resultList = entityManager.createQuery("SELECT p FROM Post AS p", Post.class).getResultList();
        return resultList;
    }

}
```

`@Repository`, `@Transactional`를 이용해 빈으로 등록하고, 트랜잭션 활성화를 시켜준다. entityManger를 통해서 JPQL 쿼리를 만들었지만, JdbcTemplate를 이용해서 직접쿼리를 만들 수도 있다. 지금은 Type-safe 하지 않은 쿼리이지만 나중에QueryDsl를 통해서 쿼리문을 코딩하듯이 짤 수 있는 방법에 대해서 알아보자.

```java
public interface PostRepository extends JpaRepository<Post, Long>, PostCustomRepository {
}
```

기존에 PostRepository 인터페이스에 커스텀하게 만든 레포지토리를 추가한다. 이렇게 되면 JpaRepository를 통해서 기본적인 CRUD를 사용하는 것은 물론, 내가 새롭게 만든 `findMyPost()` 를 사용할 수 있다.

## 4\. 테스트 케이스

```java
@RunWith(SpringRunner.class)
@DataJpaTest
public class JpaTest {

    @Autowired
    private PostRepository postRepository;
        private Post createPost() {
        Post post = new Post();
        post.setTitle("new post");
        return postRepository.save(post);
    }

    @Test
    public void postCustomRepositoryTest() {
        Post post = createPost();
        // 커스텀하게 만든 메서드를 사용해 보자!
        List<Post> myPost = postRepository.findMyPost();
        System.out.println(myPost);
    }
}
```

테스트는 `@DataJpaTest` Jpa관련 빈들만 등록하는 슬라이싱 테스트를 한다.

```
...
===== Post Custom Repository ====
2019-03-30 13:24:22.088  INFO 53165 --- [           main] o.h.h.i.QueryTranslatorFactoryInitiator  : HHH000397: Using ASTQueryTranslatorFactory
Hibernate:
    insert
    into
        post
        (title, id)
    values
        (?, ?)
Hibernate:
    select
        post0_.id as id1_2_,
        post0_.title as title2_2_
    from
        post post0_

[Post(id=1, title=new post, comments=[])]
...
```

결과를 보면, 내가 만든 `findMyPost()`가 잘 동작하고 결과 까지 잘 가져오는 것을 확인 했다.



> 이번에는 기존에 JpaRepository가 제공하는 CRUD에서 내가 새롭게 오버라이딩 하고 싶은 경우에는 어떻게 하는지 알아 보자. 위의 예제를 그대로 활용한다.

## 1\. 커스텀 레포지토리에 오버라이딩 하고 싶은 메서드 추가

```java
public interface PostCustomRepository<T> {
    List<Post> findMyPost();
  	void delete(T entity);
}
```

delete 메서드를 추가해보자.

## 2\. 커스텀 레포지토리 구현

```java
@Repository
@Transactional
public class PostCustomRepositoryImpl implements PostCustomRepository<Post> {


        ...
    @Override
    public void delete(Post post) {
        System.out.println(" ===== Custom Repository delete ======");
        entityManager.remove(post);
    }

```

기존에 Generic 부분이 없었기 때문에, Post로 엔티티 타입을 설정한다.

```java
public interface PostRepository extends JpaRepository<Post, Long>, PostCustomRepository<Post> {}
```

역시나 똑같이 PostRepository에서 커스텀하게 만든 레포지토리를 상속받아서 사용한다. (Generic 추가)

## 3\. 테스트

```java
@RunWith(SpringRunner.class)
@DataJpaTest
public class JpaTest {

    @Autowired
    private PostRepository postRepository;

        private Post createPost() {
        Post post = new Post();
        post.setTitle("new post");
        return postRepository.save(post);
    }

    @Test
    public void postCustomRepositoryTest() {
        Post post = createPost();
      	postRepository.delete(post);
    }
}
```

```
...
===== Custom Repository delete ======
...
```

내가 정의한 메서드로 잘 오버라이딩 됨을 확인 할 수 있다.

> 기본적으로 커스텀한 레포지토리를 만들고, 구현할 때 impl 네이밍을 꼭지켜야 한다. 이 부분을 내가 원하는 값으로 바꾸는 방법에 대해서 알아보자.

어플리케이션 루트에서 `repositoryImplementationPostfix` 속성의 기본값이 `Impl` 로 되어 있다. 이 부분을 자기가 원하는 네이밍으로 고치면 된다. `Default`로 포스트픽스(접미어) 를 정했다.

```java
@SpringBootApplication
@EnableJpaRepositories(repositoryImplementationPostfix = "Default")
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

```

기존의 테스트 케이스 돌리면, 구현체의 네이밍 규칙을 어겼기 때문에 해당 프로퍼티를 찾을 수 없다는 예외가 난다.

```js
Caused by: org.springframework.data.mapping.PropertyReferenceException: No property findMyPost found for type Post!
```

기존의 `PostCustomRepositoryImpl` -> `PostCustomRepositoryDefault` 로 변경하면 테스트케이스가 정상 동작한다.

## 정리

커스텀하게 레포지토리를 만들고(인터페이스) 구현 하는 것을 정리했다. 구현은 네이밍규칙(default = Impl)를 지켜야 한다. 실무에서는 QueryDsl를 사용하기 때문에 실제 구현부에서 jpql이 아닌 querydsl로 만들어서 깔끔하게 정리할 수 있다.
