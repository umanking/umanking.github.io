---
layout: post
title: JPA - 엔티티 매핑(2)
date: 2021-06-19 17:19 +0900
#tags: [jpa, orm]
---
> 본 글은, [자바 ORM 표준 JPA 프로그래밍(김영한님)](http://www.yes24.com/Product/Goods/19040233) 책을 요약 정리한 포스팅입니다.

- [실무에서 필요한JPA - 영속성 관리(1)]({% post_url 2021-06-19-jpa-summary-persistence-context %})
- [실무에서 필요한JPA - 엔티티 매핑(2)]({% post_url 2021-06-19-jpa-summary-entity-mapping %})
- [실무에서 필요한JPA - 연관관계 매핑(기초)(3)]({% post_url 2021-06-19-jpa-summary-basic-releation-mapping %})
- [실무에서 필요한JPA - 다양한 연관관계매핑(4)]({% post_url 2021-06-19-jpa-summary-advanced-releation-mapping %})
- [실무에서 필요한JPA - 프록시와 연관관계(5)]({% post_url 2021-06-20-jpa-summary-proxy %})
- [실무에서 필요한JPA - 값타입(6)]({% post_url 2021-06-20-jpa-summary-value-type %})
- 실무에서 필요한JPA - 객체지향 쿼리(7)
- 실무에서 필요한JPA - 스프링 데이터 JPA(8)
- 실무에서 필요한JPA - 컬렉션과 부가기능(9)
- 실무에서 필요한JPA - 고급주제와 성능 최적화(10)
- 실무에서 필요한JPA - 트랜잭션과 락 2차 캐시(11)

# 실무에서 필요한JPA - 엔티티 매핑(2)

## 1. 학습목표

- JPA의 핵심 엔티티와 테이블을 매핑하는 방법에대해서배운다.
- 다양한 매핑을 학습한다.

## 2. 들어가며

- JPA를 사용하는 데  가장 중요한 일은 엔티티와 테이블을 정확히 매핑하는것 
- JPA는 다양한 매핑 어노테이션을 지원함. 크게 4가지로 분류 가능하다.
  - 객체와 테이블매핑: @Entity, @Table
  - 기본키 매핑: @Id
  - 필드와 컬럼 매핑: @Column
  - 연관관계 매핑: @ManyToOne, @JoinColumn

## 3. @Entity

- JPA를 사용해서 테이블과 매핑할 클래스는 @Enitty 어노테이션을 필수로 붙여야 한다. @Entity 가 붙은 클래스는 JPA가 관리하는것으로 엔티티라 부른다. 
- 주의 사항
  - 기본 생성자는 필수이다.
  - final 클래스, enum, interface, inner 클래스에서는 사용할 수 없다.
  - 저장할 필드에 final을 사용하면 안된다.
- JPA가 엔티티 객체를 생성할 때 기본 생성자를 사용한다. 그래서 반드시 있어야 한다. 
  -  자바는 생성자가 하나도 없으면 기본으로 만들어 준다. 만약에 파라미터가 있는 다른 생성자가 있다면 자바는 기본 생성자를 만들어 주지 않는다. 이때는 기본 생성자를 만들어 준다. 

## 4. @Table

- 엔티티와 매핑할 테이블을 지정한다. 생략하면 매핑한 엔티티 이름을 테이블 이름으로 사용한다.

## 5. 다양한매핑 사용

- @Enumerated(EnumType.STRING): enum을 사용한다.
- @Temporal(TemporalType.TIMESTAMP): 자바의 날짜 타입을 사용한다.
- @Lob: 데이터베이스의 VARCHAR 타입대신 CLOB 타입을 저장해야 한다. @Lob를 사용하면 CLOB, BLOB 타입을 매핑할 수 있다.

## 6. 데이터베이스 스키마 자동생성

- JPA는 데이터베이스 스키마를 자동으로 생성하는 기능을 지원한다. 
- 클래스의 매핑정보를 보면 어떤 테이블에 어떤 컬럼을 사용하는지 알 수 있고, 이는 JPA가 데이터베이스 방언을 사용해서 스키마를 생성한다.
- application.properties에서 `spring.jpa.hibernate.ddl-auto=create` 값을 추가하면 된다.
- 개발환경이나 매핑을 어떻게 해야 하는지 참고하는 정도로만 사용하자. 운영환경에서는 사용하지 않는다.⚠️

## 7. DDL생성기능

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

## 8. 기본 키 매핑

- JPA가 제공하는 데이터베이스 기본키 생성 전략
  - 직접할당: 기본키를 애플리케이션에 직접 할당한다. 
  - 자동생성: 대리키 사용 방식 
    - IDENTITY: 기본키 생성을 데이터베이스에 위임한다.
    - SEQUENCE: 데이터베이스 시퀀스를 사용해서 기본 키를 할당한다. 
    - TABLE: 키 생성 테이블을 사용한다.
  - 기본키를 직접 할당하려면 @Id만 사용하면 되고, 자동 생성 전략을 사용하려면 @Id에 @GeneratedValue를 추가하고 원하는 키 생성 전략을 선택하면 된다. 

### 8.1. 기본키 직접 할당 전략

- @Id에 적용가능한 타입
  - 자바 기본형
  - 자바 Wrapper형

```java
Board board = new Board();
board.setId("id1"); // 기본키 직접 할당
em.persist(board);
```

### 8.2. IDENTITY 전략 

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

### 8.3. SEQUENCE 전략 

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

### 8.4. TABLE전략 

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

### 8.5. AUTO 전략 

-   데이터베이스의 종류도 많고 기본 키를 만드는 방법도 다양하다. GenerationType.AUTO는 선택한 데이터베이스 방언에 따라 IDENTITY, SEQUENCE, TABLE 전략중 하나를 자동으로 선택한다. 
-   AUTO 전략의 장점은 데이터베이스를 변경해도 코드를 수정할 필요가 없다는 것이다.
-   AUTO를 사용할때 SEQUENCE나 TABLE 전략이 선택되면 `시퀀스`나 `키 생성용 테이블`을 미리 만들어야 한다. 만약 스키마 자동생성을 사용한다면, 하이버네이트가 기본값을 사용해서 적절한 시퀀스나 키 생성용 테이블을 만들어 줄 것이다. 

### 8.6. 기본키 매핑 정리 

-   직접 할당: em.persist()를 호출기 전에 직접 식별자 값을 할당해야 한다. 없으면 예외가 발생한다.
-   IDENTITY: 데이터베이스에서 엔티티를 저장해서 식별자 값을 획득한 후 영속성 컨텍스트에 저장한다.
-   SEQUENCE: 데이터베이스 시퀀스에서 식별자 값을 획득한 후, 영속성 컨텍스트에 저장한다. 
-   TABLE: 데이터베이스 시퀀스 생성용 테이블에서 식별자 값을 획득한 후, 영속성 컨텍스트에 저장한다. 

## 9. 필드와 컬럼 매핑: 레퍼런스

### 9.1. @Column 

-   객체 필드를 테이블 컬럼에 매핑한다. 
-   insertable, updatable 속성은 데이터베이스에 저장되어 있는 정보를 읽기만 하고 변경하는 것을 방지하고 싶을때 사용한다.

### 9.2. @Enumerated

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

### 9.3. @Temporal

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

### 9.4. @Lob

-   @Lob에는 속성이 없다. 대신 매핑할 필드 타입이 문자면 CLOB으로 나머지는 BLOB으로 매핑한다.
    -   CLOB: String, char[], java.sql.CLOB
    -   BLOB: byte[], java.sql.BLOB

### 9.5. @Transient

-   이 필드는 매핑하지 않는다. 데이터베이스에 저장하지 않고, 조회하지도 않는다. 객체에 임시로 어떤 값을 보관하고 싶을 때 사용한다.

### 9.6. @Access✅

-   JPA가 엔티티 데이터에 접근하는 방식을 지정한다. 
    -   필드접근: AccessType.FIELD로 지정한다. 필드에 직접 접근 한다. 필드 접근권한이 private 이어도 접근할 수 있다. 
    -   프로퍼티 접근: AccessType.PROPERTY로 지정한다. 접근자 getter를 사용한다.
-   @Access를 설정하지 않으면 @Id의 위치를 기준으로 접근방식이 설정된다. 

## 10. 정리 

-   데이터베이스 스키마 자동생성 기능을 사용하면, 엔티티 객체를 먼저 만들고 테이블은 자동으로 생성할 수 있다. 
-   JPA는 다양한 기본키 맵핑 전략을 지원한다. 

