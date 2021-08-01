---
layout: post
title: JPA - 값 타입(6)
date: 2021-06-20 17:04 +0900
tags: [jpa, orm]
toc: true
description: JPA의 값타입에 대해서 알아보자. 
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

# 실무에서 필요한JPA - 값타입(6)

## 1. 들어가며 

- JPA의 데이터 타입은 `엔티티 타입`과 `값 타입` 으로 나눌 수 있다. 
- 값 타입은 다음 3가지로 나눌 수 있다. 
  - 기본값 타입
    - 자바 기본 타입
    - 래퍼 클래스
    - String
  - 임베디드 타입
  - 컬렉션 값 타입



## 2. 기본값 타입 

```java
public class Member {
  @Id @GenetratedValue
  private Long id;

  private String name;  // 기본 값타입
  private int age;   // 기본 값타입
}
```

## 3. 임베디드 타입 

```java
public class Member {
  @Id @GenetratedValue
  private Long id;
  
  // 임베디드 타입
  @Embedded Address address;
}
```

```java
@Embeddable 
public class Address {
  private String city;
  private String street;
  private String zipcode;
}
```

- 임베디드 타입을 사용하려면 2가지 어노테이션이 필요하다.
  - @Embeddable: 값 타입을 정의하는 곳에 표시
  - @Embedded: 값 타입을 사용하는 곳에 표시
- 임베디드 타입 덕분에 객체와 테이블을 아주 세밀하게 매핑하는 것이 가능하다. 
- 잘 설계한 ORM 애플리케이션은 테이블 수보다 클래스 구가 더 많다. 
- @AttributeOverride: 속성 재정의 
  - 임베디드 타입에 정의한 매핑 정보를 재정의 하려면 엔티티에 @AttributeOverride를 사용하면 된다.
- 임베디드 타입이 null이면 매핑한 컬럼값은 모두 null이다.

## 4. 값 타입과 불변객체 

- 값 타입을 여러 엔티티에 공유하면 위험하다.  공유 참조를 하게 되면, 값이 같이 변하게된다. 
- 해결하기 위해서는 값을 복사해서 사용해야 한다. (clone() 메서드를 이용)
- 불변 객체를 구현하는 가장 간단한 방법 
  - setter를 만들지 않고, 생성자로만 만든다.

## 5. 값 타입 컬렉션

- 값 타입 하나 이상 저장하려면 컬렉션에 보관한다.  다음 어노테이션을 사용한다.
  - @ElementCollection
  - @CollectionTable

```java
public class Member {
  
  @ElementCollection
  @CollectionTable(name "FAVORITE_FOODS", 
                  joinColumns = @JoinColumn(name="MEMBER_ID"))
  @Column(name = "FOOD_NAME")
  private Set<String> favoriteFoods = new HashSet<>();
}
```

- 테이블에는 컬렉션을 저장할 방법이 없기 때문에, MEMBER 테이블과 FAVORITE_FOOD 테이블로 만들었다. 
- 값 타입 컬렉션을 사용할때, 부모 엔티티만 저장하면, JPA가 나머지도 실행해준다. 
- 값 타입 컬렉션은 영속성 전이 + 고아 객체 제거 기능을 필수로 가진다. 
- 값 타입의 컬렉션 제약사항 
  - 특정 엔티티 하나에 소속된 값 타입 컬렉션이 변경 되었을 때, 매핑된 테이블의 연관된 모든 데이터를 삭제하고, 현재 값 타입 컬렉션 객체에 있는 모든 값을 데이터베이스 다시 저장한다. 
  - 따라서 실무에서 값 타입 컬렉션이 매핑된 테이블에 데이터가 많다면 값 타입 컬렉션 대신에 일대다 관계를 고려해야 한다.

## 6. 정리 

- JPA는 `엔티티 타입`과 `값 타입`이 있다. 
- 엔티티 타입
  - 식별자 @Id가 있다. 
  - 생명주기가 있다. 
  - 공유할 수 있다.
    - 참조 값을 공유할 수 있다. 
- 값 타입
  - 식별자가 없다.
  - 생명주기를 엔티티에 의존한다. 
  - 공유하지 않는것이 안전하다. 
    - 불변객체로 만드는것이 안전하다.

