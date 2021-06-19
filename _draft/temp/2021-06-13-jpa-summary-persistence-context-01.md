---
layout: post
title: "[실무에 필요한 JPA] 영속성 관리(1)"
date: 2021-06-11 10:51:04
# image: 'https://huongdanjava.com/wp-content/uploads/2016/04/jpa.jpg'
tags: [JPA, ORM]
category: JPA
---


> 본 글은, [자바 ORM 표준 JPA 프로그래밍(김영한님)](http://www.yes24.com/Product/Goods/19040233) 책을 요약 정리한 포스팅입니다.

- [실무에서 필요한JPA - 영속성 관리(1)]({% post_url 2021-06-13-jpa-summary-persistence-context-01 %})
- 실무에서 필요한JPA - 엔티티 매핑(2)
- 실무에서 필요한JPA - 연관관계 매핑(기초)(3)
- 실무에서 필요한JPA - 다양한 연관관계매핑(4)
- 실무에서 필요한JPA - 프록시와 연관관계(5)
- 실무에서 필요한JPA - 값타입(6)
- 실무에서 필요한JPA - 객체지향 쿼리(7)
- 실무에서 필요한JPA - 스프링 데이터 JPA(8)
- 실무에서 필요한JPA - 컬렉션과 부가기능(9)
- 실무에서 필요한JPA - 고급주제와 성능 최적화(10)
- 실무에서 필요한JPA - 트랜잭션과 락 2차 캐시(11)


# 실무에서 필요한JPA - 영속성 관리(1)

## 학습목표

- EntityMangerFacotry와 EntityManager의 관계를 이해한다.
- PersistenceContext(영속성 컨텍스트)의 특징을 이해하고, CRUD에서 어떻게 동작하는지를 이해한다.
- 영속성 컨텍스트가 관리하는 엔티티의 생명주기를 이해한다.
- Flush에 대해서 알아본다.
- 준영속 상태의 특징을 이해한다.

## EntityManagerFactory와 EntityManager

- EntityManagerFactory는 EntityManager를 만드는 공장인데, 공장을 만드는 비용은 상당히 크다. 따라서 싱글턴으로 만들어서 웹 애플리케이션에서 공유하도록 설계되어있다. 
- EntityMangaer는 데이터베이스 연결이 꼭 필요한 시점까지 커넥션을 얻지 않는다. (Lazy). 트랜잭션을 시작할때 커넥션을 획득한다. 
- Hibernate를 포함한 JPA 구현체들은 EntityManagerFactory를 생성할 때 커넥션 풀도 만든다. 

## 영속성 컨텍스트(Persistence Context)

- JPA를 이해하는데 가장 중요한 핵심 
- 엔티티를 영구히 저장하는 환경정도라고 이해하면 된다. 
- EntityManager를 생성할때 영속성 컨텍스트가 만들어진다. 
- EntityManger를 통해서 영속성 컨텍스트에 접근하거나 관리할 수 있다. 

## 엔티티 생명주기

- 비영속 (new/transient): 전혀 관계가 없는 상태
- 영속(managed): 영속성 컨텍스트에 저장된 상태
- 준영속(detached): 저장되었다가 분리된 상태
- 삭제(remove): 삭제된 상태

<img src="https://media.vlpt.us/post-images/conatuseus/3861eed0-d482-11e9-9b0f-dd1a4f570095/image.png" style="zoom:50%;" />
*출처: 자바 JPA 프로그래밍(김영한)*

## 영속성 컨텍스트의 특징

- 영속성 컨텍스트는 엔티티를 식별자 값(@Id로 매핑한 값) 으로 구분한다. 영속상태는 식별자 값이 반드시 있어야 한다. 없으면 예외가 발생한다.
- 영속성 컨텍스트와 데이터 베이스 저장. JPA는 보통 트랜잭션을 커밋하는 순간, 영속성컨텍스트에 새로 저장된 엔티티를 데이터베이스에 반영한다(Flush)
- 영속성 컨텍스트의 장점
    - 1차 캐시
    - 동일성 보장 
    - 트랙잭션을 지원하는 쓰기 지연
    - 변경 감지
    - 지연 로딩

### 엔티티 조회

em.find(Member.class, “member1”)를 호출하고, 1차 캐시를 먼저 찾는다. 없으면 데이터베이스에서 조회하고, 조회한 데이터를 1차캐시에 저장한다. 이후에 member1로 조회하게되면 영속성 컨텍스트에서 식별자를 통해서 해당 엔티티를 반환한다. (캐쉬가 동작하는 원리)

### 엔티티 등록

- `em.persist(memberA)` 까지는 INSERT SQL문을 데이터베이스에 보내지 않는다. `transaciton.commit()` 커밋하는 순간에 보낸다. → 성능최적화에서 다룬다.✅
    - EntityManager는 트랜잭션을 커밋하기 직전까지 내부 쿼리 저장소에 INSERT SQL을 모아둔다. 그리고 트랜잭션을 커밋할때 모아둔 쿼리를 데이터베이스에 보내는데, 이를 트랜잭션을 지원하는  `쓰기 지연` 이라 한다.
- 트랜잭션을 커밋하면 EntityManger는 우선 영속성 컨텍스트를 Flush한다. **Flush는 영속성 컨텍스트의 변경 내용을 데이터베이스에 동기화 하는 작업이다.**

### 엔티티 수정(변경 감지)

- JPA로 엔티티를 수정할 때는 엔티티를 조회해서, 데이터만 변경하면 된다.이렇게 엔티티의 변경사항을 데이터베이스에 자동으로 반영하는 기능을 `변경감지`(Dirty checking) 
- JPA는 엔티티를 영속성 컨텍스트에 보관할 때, 최초 상태를 복사해서 저장해두는데 이것을 스냅샷이라고 한다. Flush 시점에 스냅샷과 엔티티를 비교해서 변경된 엔티티를 찾는다. 
- 변경감지는 영속성 컨텍스트가 관리하는 영속 상태의 엔티티에만 적용된다.
- JPA의 기본전략은 엔티티의 모든 필드를 업데이트 한다.
    - 모든 필드를 사용하면, 데이터 전송량이 증가하는 단점이 있지만 다음과 같은 장점으로 인해 모든 필드를 업데이트 한다.
        - 모든 필드를 사용하면 수정 쿼리는 항상 같다. 애플리케이션 로딩 시점에 수정 쿼리를 미리 생성해두고 재사용 가능하다.
        - 데이터베이스에 동일한 쿼리를 보내면 데이터베이스는 이전에 한 번 파싱된 쿼리를 재사용 할 수 있다.
- 만약에, 필드가 너무 많거나 저장되는 내용이 너무 크면 `수정된` 데이터만 사용해서 동적으로 UPDATE SQL를 생성하는 전략을 선택하면 된다. 이때는 하이버네이트 확장 기능을 사용해야 한다.

```java
@Entity
@org.hibernate.annotations.DynamicUpdate
@Table
public class Member {...}
```



### 엔티티 삭제

- 엔티티 등록과 비슷하게 삭제 쿼리를 쓰기 지연 SQL 저장소에 등록한다. 이후 트랜잭션 커밋해서, 플러시를 호출하면 실제 데이터베이스에 삭제 쿼리를 전달한다.

## 플러시(Flush)

- 플러시는 영속성 컨텍스트의 변경 내용을 데이터베이스에 반영한다.
- 영속성 컨텍스트를 플러시 하는 방법
    - em.flush()를 직접 호출한다. (거의 사용하지 않는다.)
    - 트랜잭션 커밋시 플러시가 자동 호출된다. (JPA는 트랜잭션을 커밋할때)
    - JPQL쿼리 실행 시 플러시가 자동 호출된다.
- 플러시 모드 옵션
    - javax.persistence.FlushModeType를 사용한다. 
        - `em.setFlusMode(FlushModeType.COMMIT)` 직접 설정
        - FlushModeType.AUTO: 커밋이나 쿼리를 실행할때 플러시(기본값)
        - FlushModeType.COMMIT: 커밋할 때만 플러시 

## 준영속

- 영속성 컨텍스트가 관리하는 영속상태의 엔티티가 영속성 컨텍스트에서 분리된 것을 준영속 상태라 한다. 준영속 상태 엔티티는 영속성 컨텍스트가 제공하는 기능을 사용할 수 없다.
- 준영속 상태로 만드는 방법 
    - em.detach(entity): 특정 엔티티만 준영속 상태로 전환한다.
    - em.clear(): 영속성 컨텍스트를 완전히 초기화한다.
    - em.close(): 영속성 컨텍스트를 종료한다.
        - 1차캐시, 쓰지지연 저장소등이 존재하지 않는다. 종료되었다.
- 준영속 상태의 특징
    - 거의 비영속 상태에 가깝다. 영속성 컨텍스트가 제공하는 1차 캐시, 쓰기 지연, 변경감지, 지연로딩 어떠한 기능도 동작하지 않음
    - 식별자 값을 가지고 있다.
    - 지연로딩을 할 수 없다.
- 병합: merge()
    - 준영속 상태의 엔티티를 다시 영속 상태로 변경하려면 병합을 사용하면 된다.

## 정리

- 엔티티 매니저는 엔티티 매니저 팩토리에서 생성한다. J2SE환경에서는 엔티티 매니저를 만들면 그 내부에서 영속성 컨텍스트도 함께 만들어진다.
- 영속성 컨텍스는 애플리케이션과 데이터베이스 사이에서 객체를 보관하는 가상의 데이터베이스 역할을 한다. 덕분에 `1차캐시`, `동일성 보장` 트랜잭션을 지원하는 `쓰기지연`, `변경 감지` , `지연로딩` 기능을 사용할 수 있다.
- 영속성 컨텍스트에 저장한 엔티티는 플러시 시점에 데이터베이스에 반영되는데, 일반적으로 트랜잭션을 커밋할 때 영속성 컨텍스트가 플러시 된다.
- 영속성 컨텍스트의 관리를 받지 못하는 엔티티를 `준영속 상태` 라 하고, 이는 영속성 컨텍스트가 제공하는 1차 캐시, 동일성 보장, 쓰기지연, 변경감지, 지연로딩 같은 기능을 사용할 수 없다.



# 실무에서 필요한JPA - 엔티티 매핑(2)

## 학습목표

- JPA의 핵심 엔티티와 테이블을 매핑하는 방법에대해서배운다.
- 다양한 매핑을 학습한다.

## 들어가며

- JPA를 사용하는 데  가장 중요한 일은 엔티티와 테이블을 정확히 매핑하는것 
- JPA는 다양한 매핑 어노테이션을 지원함. 크게 4가지로 분류 가능하다.
    - 객체와 테이블매핑: @Entity, @Table
    - 기본키 매핑: @Id
    - 필드와 컬럼 매핑: @Column
    - 연관관계 매핑: @ManyToOne, @JoinColumn

## @Entity

- JPA를 사용해서 테이블과 매핑할 클래스는 @Enitty 어노테이션을 필수로 붙여야 한다. @Entity 가 붙은 클래스는 JPA가 관리하는것으로 엔티티라 부른다. 
- 주의 사항
    - 기본 생성자는 필수이다.
    - final 클래스, enum, interface, inner 클래스에서는 사용할 수 없다.
    - 저장할 필드에 final을 사용하면 안된다.
- JPA가 엔티티 객체를 생성할 때 기본 생성자를 사용한다. 그래서 반드시 있어야 한다. 
    -  자바는 생성자가 하나도 없으면 기본으로 만들어 준다. 만약에 파라미터가 있는 다른 생성자가 있다면 자바는 기본 생성자를 만들어 주지 않는다. 이때는 기본 생성자를 만들어 준다. 

## @Table

- 엔티티와 매핑할 테이블을 지정한다. 생략하면 매핑한 엔티티 이름을 테이블 이름으로 사용한다.

## 다양한매핑 사용

- @Enumerated(EnumType.STRING): enum을 사용한다.
- @Temporal(TemporalType.TIMESTAMP): 자바의 날짜 타입을 사용한다.
- @Lob: 데이터베이스의 VARCHAR 타입대신 CLOB 타입을 저장해야 한다. @Lob를 사용하면 CLOB, BLOB 타입을 매핑할 수 있다.

## 데이터베이스 스키마 자동생성

- JPA는 데이터베이스 스키마를 자동으로 생성하는 기능을 지원한다. 
- 클래스의 매핑정보를 보면 어떤 테이블에 어떤 컬럼을 사용하는지 알 수 있고, 이는 JPA가 데이터베이스 방언을 사용해서 스키마를 생성한다.
- application.properties에서 `spring.jpa.hibernate.ddl-auto=create` 값을 추가하면 된다.
- 개발환경이나 매핑을 어떻게 해야 하는지 참고하는 정도로만 사용하자. 운영환경에서는 사용하지 않는다.⚠️

## DDL생성기능

- 회원이름은 필수이고, 10자를 초과하면 안되는 제약조건을 추가하는 경우

```java
@Column(name="NAME", nuallable = false, length=10)
private String username;
```

- 테이블의 유니크 제약조건을 추가하는 경우 

```java
@Entity
@Table(name="MEMBER", uniqueConstraints = {@UniqueConstraint(
  	name = "NAME_AGE_UNIQUE",
  	columnNames = ["NAME", "AGE"]
)})
public class Member {...}
```

다음과 같이 DDL이 생성된다. 

```
ALTER TABLE MEMBER ADD CONSTRAINT MEMBER_AGE_UNIQUE UNIQUE (NAME, AGE)
```

- 이 기능들은 DDL을 자동으로 생성할 때만 사용되고, JPA 실행로직에 영향을 주지 않는다. 직접 DDL를 만드는 경우 굳이 필요하지 않다. 하지만, 애플리케이션을 통해서 제약조건을 한눈에 확인할 수 있다는 장점도 있다.

## 기본 키 매핑

- JPA가 제공하는 데이터베이스 기본키 생성 전략
    - 직접할당: 기본키를 애플리케이션에 직접 할당한다. 
    - 자동생성: 대리키 사용 방식 
        - IDENTITY: 기본키 생성을 데이터베이스에 위임한다.
        - SEQUENCE: 데이터베이스 시퀀스를 사용해서 기본 키를 할당한다. 
        - TABLE: 키 생성 테이블을 사용한다.
    - 기본키를 직접 할당하려면 @Id만 사용하면 되고, 자동 생성 전략을 사용하려면 @Id에 @GeneratedValue를 추가하고 원하는 키 생성 전략을 선택하면 된다. 

### 기본키 직접 할당 전략

- @Id에 적용가능한 타입
    - 자바 기본형
    - 자바 Wrapper형

```java
Board board = new Board();
board.setId("id1"); // 기본키 직접 할당
em.persist(board);
```

### IDENTITY 전략 

- 기본키 생성을 데이터베이스에 위임하는 전략. 
- MySQL의 AUTO_INCREMENT 기능은 데이터베이스가 기본 키를 자동으로 생성해 준다. 
- IDENTITY 전략은 데이터베이스에 값을 저장하고 나서야 기본 키 값을 구할 수 있을 때 사용한다.

```java
@Entity
public class Board {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id; 
}
```

### SEQUENCE 전략 

- 시퀀스를 지원하는 오라클, PostgreSQL, DB2, H2 데이터베이스에서 사용할 수 있다. 

```java
@Entity
@SequenceGenerator(
  	name = "BOARD_SEQ_GENERATOR",
	  sequenceName = "BOARD_SEQ", 
	  initialValue = 1, allocationSize = 1)
public class Board {

  @Id @GeneratedValued(strategy = GenerationType.SEQUENCE, 
                       generator = "BOARD_SEQ_GENERATOR")
  // @SequnceGenerator를 여기에서도 사용가능하다
  private Long id;
}
```

- SEQUENCE 전략은 emp.persist()를 호출할 때 먼저 데이터베이스 시퀀스를 사용해서 식별자를 조회한다. 조회한 식별자를 엔티티에 할당한 후에 엔티티를 영속성 컨텍스트에 저장한다. 이후 트랜잭션을 커밋해서 플러시가 일어나면 엔티티를 데이터베이스에 저장한다. 반대로 IDENTITY 전략은 먼저 엔티티를 데이터베이스에 저장한 후에 식별자를 조회해서 엔티티의 식별자에 할당한다. 

### TABLE전략 

- 키 생성 전용 테이블을 하나 만들고 여기에 이름과 값으로 사용할 컬럼을 만들어 데이터베이스 시퀀스를 흉내내는 전략이다. 이 전략은 테이블을 사용하므로 모든 데이터베이스에 적용할 수 있다.

```java
@Entity
@TableGenerator(
  	name = "BOARD_SEQ_GENERATOR",
  	table = "MY_SEQUENCES",
  	pcColumnValue = "BOARD_SEQ", allocationSize = 1)
public class Board {

  @Id @GeneratedValued(strategy = GenerationType.TABLE, 
                       generator = "BOARD_SEQ_GENERATOR")
  private Long id;
```

### AUTO 전략 

-   데이터베이스의 종류도 많고 기본 키를 만드는 방법도 다양하다. GenerationType.AUTO는 선택한 데이터베이스 방언에 따라 IDENTITY, SEQUENCE, TABLE 전략중 하나를 자동으로 선택한다. 
-   AUTO 전략의 장점은 데이터베이스를 변경해도 코드를 수정할 필요가 없다는 것이다.
-   AUTO를 사용할때 SEQUENCE나 TABLE 전략이 선택되면 `시퀀스`나 `키 생성용 테이블`을 미리 만들어야 한다. 만약 스키마 자동생성을 사용한다면, 하이버네이트가 기본값을 사용해서 적절한 시퀀스나 키 생성용 테이블을 만들어 줄 것이다. 

### 기본키 매핑 정리 

-   직접 할당: em.persist()를 호출기 전에 직접 식별자 값을 할당해야 한다. 없으면 예외가 발생한다.
-   IDENTITY: 데이터베이스에서 엔티티를 저장해서 식별자 값을 획득한 후 영속성 컨텍스트에 저장한다.
-   SEQUENCE: 데이터베이스 시퀀스에서 식별자 값을 획득한 후, 영속성 컨텍스트에 저장한다. 
-   TABLE: 데이터베이스 시퀀스 생성용 테이블에서 식별자 값을 획득한 후, 영속성 컨텍스트에 저장한다. 

## 필드와 컬럼 매핑: 레퍼런스

### @Column 

-   객체 필드를 테이블 컬럼에 매핑한다. 
-   insertable, updatable 속성은 데이터베이스에 저장되어 있는 정보를 읽기만 하고 변경하는 것을 방지하고 싶을때 사용한다.

### @Enumerated

-   자바의 enum 타입을 매핑할 때 사용한다. 

```java
enum RoleType {
  ADMIN, USER
}
```

다음은 enum이름으로 매핑한다.

```java
@ENumerated(EnumType.STRING)
private RoleType roleType;
```

enum은 다음처럼 사용한다.

```java
member.setRoleType(RoleType.ADMIN); //DB에 문자 ADMIN으로 저장됨
```

>   ⚠️기본값은 EnumType.ORDINAL은 주의해서 사용해다 한다. 
>   enum이 하나 추가된 경우, 순서가 변경될 수 있기 때문에. 무조건 EnumType.STRING 으로 사용한다. 

### @Temporal

-   자바의 날짜 타입을 매핑할때 사용한다. 

```java
@Temporal(TemporalType.DATE)
private Date date; 

@Temporal(TemporalType.TIME)
private Date time;

@Temporal(TemporalType.TIMESTAMP)
private Date timestamp
```

-   자바의 Date 타입에는 년월일 시분초가 있지만 데이터베이스에는 date(날짜), time(시간), timestamp(날짜와 시간)이라는 세가지 타입이 별도로 존재한다. 
-   **자바8에서 지원하는 LocalDate, LocalDateTime을 사용할때는 생략 가능하다.(하이버네이트 지원)**

### @Lob

-   @Lob에는 속성이 없다. 대신 매핑할 필드 타입이 문자면 CLOB으로 나머지는 BLOB으로 매핑한다.
    -   CLOB: String, char[], java.sql.CLOB
    -   BLOB: byte[], java.sql.BLOB

### @Transient

-   이 필드는 매핑하지 않는다. 데이터베이스에 저장하지 않고, 조회하지도 않는다. 객체에 임시로 어떤 값을 보관하고 싶을 때 사용한다.

### @Access✅

-   JPA가 엔티티 데이터에 접근하는 방식을 지정한다. 
    -   필드접근: AccessType.FIELD로 지정한다. 필드에 직접 접근 한다. 필드 접근권한이 private 이어도 접근할 수 있다. 
    -   프로퍼티 접근: AccessType.PROPERTY로 지정한다. 접근자 getter를 사용한다.
-   @Access를 설정하지 않으면 @Id의 위치를 기준으로 접근방식이 설정된다. 

## 정리 

-   데이터베이스 스키마 자동생성 기능을 사용하면, 엔티티 객체를 먼저 만들고 테이블은 자동으로 생성할 수 있다. 
-   JPA는 다양한 기본키 맵핑 전략을 지원한다. 





# 실무에서 필요한JPA - 연관관계 매핑(기초)(3)

## 학습목표

-   단방향 연관관계 매핑을 이해한다.
-   양방향 연관관계 매핑을 이해한다. 
    -   연관관계의 주인을 이해한다.
    -   연관관계 편의메서드 작성을 이해한다.

## 들어가며

-   엔티티들은 다른 엔티티와 연관관계가 있다. 
-   객체는 참조(주소)를 사용해서 관계를 맺고, 테이블은 외래 키를 사용해서 관계를 맺는다. 이 둘은 완전히 다른 특징을 가진다. 
-   객체 관계 매핑(ORM) 에서 가장 어려운 부분이 객체 연관관계와 테이블을 매핑하는 일이다.
-   연관관계를 이해하기 위한 **핵심 키워드** 
    -   ✔︎방향: 방향은 객체관계에만 존재하고, 테이블 관계에서는 항상 양방향이다. 
    -   ✔︎다중성: 1:N과 같은 관계를 말한다.
    -   ✔︎연관관계의 주인: 객체를 양방향 연관관계로 만들면 연관관계의 주인을 정해야 한다. 

## 단방향 연관관계

-   회원(N): 팀(1)의 관계를 생각해보자. 
    -   객체 연관관계
        -   member -> team 으로 접근만 가능(단방향)
    -   테이블 연관관계
        -   회원테이블은 TEAM_ID 외래키 팀테이블과 연관관계를 맺는다. 
    -   객체 연관관계와 테이블 연관관계의 가장 큰 차이 
        -   객체간의 연관관계를 양방향으로 만들고 싶으면 반대쪽에도 필드를 추가해서 참조를 보관해야 한다.
        -   반명에 테이블은 외래키 하나로 양방향을 조인할 수 있다.

## 연관관계 사용

### 저장 

### 조회 

-   연관관계가 있는 엔티티를 조회하는 방법
    -   객체 그래프 탐색
    -   객체지향 쿼리 사용 JPQL 

### 연관된 엔티티 삭제 

-   연관된 엔티티를 삭제하려면, 기존에 있던 연관관계를 먼저 제거하고 삭제해야 한다. 

```java
member1.setTeam(null); // 회원1 연관관계 제거
member2.setTeam(null); // 회원2 연관관계 제거 
em.remove(team); // 팀삭제
```

## 양방향 연관관계

### 양방향 연관관계 매핑 

```java
@Entity 
public class Member {
  
	@Id 
  @Column(name="MEMBER_ID")
  private Long id;
  
  @ManyToOne 
  @JoinColumn(name="TEAM_ID")
  private Team team;

  // 연관관계 설정 
  public void setTeam(Team team){
    this.team = team;
  }
}
```

```java
@Entity 
public class Team {

  @Id 
  @Column(name = "TEAM_ID")
  private Long id;
  
  @OneToMany(mappedBy = "team")
  private List<Member> members = new ArrayList<>();
}
```

-   mappedBy 속성은 양방향 매핑일 때 사용하는데, 반대쪽 매핑의 필드 이름을 값으로 주면된다.  > `연관관계의 주인` 에서 자세한 설명 !! 

## 연관관계의 주인

-   @OneToMany에서 mappedBy 속성이 왜 필요할까? 
    -   객체에서 양방향은 사실 단방향 2개로 존재한. 테이블에서는 외래키 하나로 존재한다. 
    -   엔티티를 양방향 연관관계로 설정하면 객체의 참조는 둘인데 외래키는 하나다. 따라서 둘 사이에 차이가 발생한다. 이런 차이로 인해서 JPA는 두 객체 연관관계 중 하나를 정해서 테이블의 외래키를 관리해야 하는데 이것을 `연관관계의 주인` 이라 한다.

### 양방향 매핑의 규칙: 연관관계의 주인 

연관관계의 주인만이 데이터베이스 연관관계와 매핑되고 외래 키를 관리(등록, 수정,삭제)할 수 있다. 반면에 주인이 아닌 쪽은 읽기만 할 수 있다. 

-   주인은 mappedBy 속성을 사용하지 않는다.
-   주인이 아니면mappedBy 속성을 사용해서 속성의 값으로 연관관계의 주인을 지정해야 한다. 

### 연관관계의 주인은 외래키가 있는곳

연관관계의 주인은 테이블에 `외래키가 있는곳` 으로 정해야 한다. 

>    데이터베이스 테이블의 다대일, 일대다 관계에서 항상 `다` 쪽이 외래키를 가진다. 

## 양방향 연관관계 저장

```java
public void save() {
  Team team1 = new Team("team1", "팀1");
  em.persist(team1);
  
  // 회원1저장 
  Member member1 = new Member("member1", "회원1");
  member1.setTeam(team1); // 연관관계 설정 member1 > team1
  em.persist(member1);
  
  
  // 회원2저장 
  Member member2 = new Member("member2", "회원2");
  member2.setTeam(team1); // 연관관계 설정 member2 > team1
  em.persist(member2);
}
```

양방향 연관관계는 연관관계의 주인이 외래키를 관리한다. 따라서 **주인이 아닌 방향은 값을 설정하지 않아도 데이터베이스에 외래키 값이 정상 입력된다.**

```java
team1.getMembers().add(member1); //무시(연관관계의 주인이 아님)
team1.getMembers().add(member2); //무시(연관관계의 주인이 아님)
```

이런 코드가 추가로 있어야 할것 같지만 Team.members는 연관관계의 주인이 아니다. **주인이 아닌 곳에 입력된 값은 외래키에 영향을 주지 않는다.** 

## 양방향 연관관계의 주의점

-   가장 많이 하는 실수는 연관관계의 주인에는 값을 입력하지 않고, 주인이 아닌 곳에만 값을 입력하는 것이다. 외래키값이 정상적으로 저장되지 않으면 이것부터 의심해보자. 

### 순수한 객체까지 고려한 양방향 연관관계 

-   Q.  정말 연관관계의 주인에만 값을 저장하고, 주인이 아닌 곳에는 값을 저장하지 않아도 될까? 
    -   A. 사실은 **객체 관점에서 양쪽 방향 모두 값을 입력해 주는 것이 가장 안전하다.** 양쪽 방향 모두 값을 입력하지 않으면 JPA를 사용하지 않는 순수한 객체 상태에서 김각한 문제를 발생 할 수 있다.

### 연관관계 편의 메서드 

-   양방향 연관관계는 결국 양쪽 연관관계를 다 신경써야 한다. member.setTeam(team)과 team.getMembers().add(member) 를 각각 호출하다 보면 실수 할 수 있다. 
-   양방향 관계에서 두 코드는 하나인 것처럼 사용하는 것이 안전하다. 

```java
public class Member {
  private Team team;
  
  public void setTeam(Team team){
    this.team = team;
    team.getMembers().add(this);
  }
}
```

### 연관관계 편의 메서드 작성시 주의사항

-   연관관계를 변경할 때는 기존 팀이 있으면 기존 팀과 회원의 연관관계를 삭제하는 코드를 추가해야 한다. 

```java
public class Member {
  private Team team;

  public void setTeam(Team team){
    if (this.team != null){
      this.team.getMembers().remove(this)
    }
    this.team = team;
    team.getMembers().add(this);
  }
}
```

## 정리 

-   단방향 매핑에 비해, 양방향은 복잡하다. 연관관계의 주인(외래키가 있는곳)도 정해야 하고, 두개의 단방향 연관관계를 양방향으로 만들기 위해 로직도 잘 관리해야 한다.
-   단방향 매핑만으로 테이블과 객체의 연관관계 매핑은 이미 완료되었다.
-   단방향을 양방향으로 만들려면 반대방향으로 객체 그래프 탐색 기능이 추가된다.
-   양방향 연관관계를 매핑하려면 객체에서 양쪽 방향을 모두 관리해야 한다. 

# 실무에서 필요한JPA - 다양한 연관관계매핑(4)

## 들어가며

엔티티의 연관관계를 매핑할 때는 다음 3가지를 고려해야 한다.

-   다중성 
    -   다대일, 일대다, …
-   단방향, 양방향
    -   객체관계에서 한쪽만 참조할지, 양쪽을 참조할지 
-   연관관계의 주인
    -   JPA는 두 객체 연관관계 중 하나를 정해서 데이터 베이스 외래키를 관리하는데 이것을 연관관계의 주인이라 한다.



## 다대일 

### 다대일 단방향(N:1)

```java
public class Member {
  @ManyToOne
  @JoinColumn(name="TEAM_ID")
  private Team team;
}
```



```java
public class Team {...}
```

### 다대일 양방향

```java
public class Member {
  @ManyToOne
  @JoinColumn(name="TEAM_ID")
  private Team team;
  
  public void setTeam(Team team){
    this.team = team;
    
    // 무한 루프에 빠지지 않도록 체크
    if (!team.getMembers().contains(this)){
 	     team.getMembers().add(this);
    }
  }
}
```



```java
public class Team {
  
  @OneToMany(mappedBy="team") // 반대편이 연관관계의 주인이다.
  public List<Member> members = new ArrayList<>();
  
  public void addMember(Member member){
    this.members.add(member);
    // 무한 루프에 빠지지 않도록 체크
    if (member.getTeam() != this){
	      member.setTeam(this);
    }
  }
}
```

-   양방향 연관관계는 항상 서로 참조해야 한다.
    -   항상 서로 참조하기 위해서는 연관관계 편의 메서드를 작성하는 것이 좋은데, 편의 메서드는 어느 한 곳에만 작성하거나, 양쪽다 작성할 수 있다. 양쪽에 다 작성하면 무한루프에 빠지지 않도록 주의한다.

## 일대다❌

```java
public class Team {
  @OneToMany
  @JoinColumn(name = "TEAM_ID") // MEMBER 테이블의 TEAM_ID(FK)
  private List<Member> members = new ArrayList<>();
}
```

```java
public class Member {...}
```

-   일대다 단방향 관계는 약간 특이한데, 보통 자신이 매핑한 테이블의 외래키를 관리하는데, 이매핑은 반대쪽 테이블에 있는 외래키를 관리한다. 그럴 수 밖에 없는 것이 일대다 관계에서 외래키는 항상 다쪽 테이블에 있다. 하지만 다쪽인 Member엔티티에는 외래키를 매핑할 수 있는 참조 필드가 없다. 대신에 반대쪽인 Team 엔티티에만 참조 필드인 members가 있다. 따라서 반대편 테이블의 외래키를 관리하는 특이한 모습이 나타난다.

-   일대다 단방향 관계를 매핑할때는 @JoinColumn을 명시해야 한다. 그렇지 않으면 JPA는 연결 테이블을 중간에 두고 연관관계를 관리하는 조인테이블(JoinTable) 전략을 기본으로 사용해서 매핑한다. 

-   일대다 단방향 매핑의 단점
    -   매핑한 객체가 관리하는 외래 키가 다른 테이블에 있다는 점. 본인 테이블에 외래키가 있으면 엔티티의 저장과 연관관계 처리를 INSERT SQL 한번으로 끝낼 수 있지만, 다른 테이블에 외래키가 있으면 연관관계 처리를 위한 UPDATE SQL을 추가로 실행해야 한다. 
    -   일대다 단방향 매핑의 단점을 알아보자.

```java 
public void testSave(){
  
	Member member1 = new Member("member1");
  Member member2 = new Member("member2");
  
  Team team1 = new Team("team1");
  team1.getMembers().add(member1);
  team1.getMembers().add(member2);
  
  em.persist(member1); //insert - member1
  em.persist(member2); //insert - member2
  em.persist(team1);   //insert - team1, update - member1.fk, update- member2.fk
  
  tx.commit();
}
```

Member엔티티를 저장할때 MEMBER 테이블의 TEAM_ID 외래키에 아무값도 저장되지 않는다. 대신 Team 엔티티를 저장할때, Team.members 참조 값을 확인해서 회원 테이블에 있는 TEAM_ID 외래키를 업데이트 하는 쿼리가 나간다.

-   **일대다 단방향 매핑보다는 `다대일 양방향` 매핑을 사용하자. 💯**
    -   일대다 단방향 매핑을 사용하면 엔티티를 매핑한 테이블이 아닌 다른 테이블의 외래키를 관리해야한다. 성능의 문제도 있지만, 관리도 부담스럽다. 
    -   좋은 방법은 일대다 단방향 대신에 다대일 양방향 매핑을 사용하는것이다. 
    -   다대일 양방향은 관리해야 하는 외래 키가 본인 테이블에 있다. 

### 일대다 양방향

