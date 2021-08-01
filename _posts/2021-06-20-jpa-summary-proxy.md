---
layout: post
title: JPA - 프록시와 연관관계(5)
date: 2021-06-20 16:22 +0900
tags: [jpa, orm]
toc: true
description: 
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
  
# 실무에서 필요한JPA - 프록시와 연관관계(5)

## 1. 프록시

- JPA는 엔티티가 실제 사용될 때까지 데이터베이스 조회를 지연하는 방법을 제공하는데 이것을 지연로딩이라 한다.
- 그런데 지연 로딩 기능을 사용하려면 실제 엔티티 객체 대신에 데이터베이스 조회를 지연할 수 있는 가짜 객체가 필요한데 이를 `프록시 객체`라 한다.

> JPA 표준 명세는 지연로딩 구현 방법을 JPA구현체에 위임했다. 하이버네이트 구현체에 대한 내용이다. 
> 하이버네이트는 지연 로딩을 지원하기 위해 `프록시`를 사용하는 방법과 `바이트코드`를 수정하는 두 가지 방법을 제공한다. 

### 1.1. 프록시 기초 

- JPA에서 식별자로 엔티티 하나를 조회할때 EntityManager.find()를 사용한다. 
- 엔티티를 실제 사용 시점까지 데이터베이스 조회를 미루고 싶으면 EntityManager.getReference() 메서드를 사용하면 된다. 이 메서드를 호출할 때 JPA는 데이터베이스를 조회하지 않고 실제 엔티티 객체도 생성하지 않는다. 대신에 데이터베이스 접근을 위임한 프록시 객체를 반환한다.

- 프록시의 특징
  - 프록시 클래스는 실제 클래스를 `상속` 받아서 만들어지므로 실제 클래스와 겉 모양이 같다. 따라서 사용하는 입장에서 이것이 진짜 객체인지, 프록시 객체인지 구분하지 않고 사용하면 된다.
  - 프록시 객체는 실제 객체에 대한 참조(target)를 보관한다. 그리고 프록시 객체의 메서드를 호출하면 프록시 객체는 실제 객체의 메서드를 호출한다.
- 프록시 객체의 초기화 
  - 프록시 객체는 member.getName()처럼 실제 사용될 때 데이터베이스를 조회해서 실제 엔티티 객체를 생성하는데, 이것을 프록시 객체의 초기화라 한다. 
  ```java
  // MemberProxy 변환
  Member member = em.getReference(Member.class, "id1");
  member.getName();
  ```
  ```java
  // 프록시 클래스 예상 코드
  class MemberProxy extends Member {
    Member target = null; //실제 엔티티 참조
    public String getName(){
      if (target == null){
        // 초기화 요청
        // DB조회
        // 실제 엔티티 생성 및 참조 보관 
        this.target = ...; 
      }
      
      // target.getName();
      return target.getName();
    }
  }
  ```
1. 프록시 객체에 member.getName() 호출해서 실제 데이터를 조회한다.
2. 프록시 객체는 실제 엔티티가 생성되어 있지 않으면 영속성 컨텍스트에 실제 엔티티 생성을 요청하는데 이것을 초기화라 한다.
3. 영속성컨텍스트는 데이터베이스를 조회해서 실제 엔티티 객체를 생성한다.
4. 프록시 객체는 생성된 실제 엔티티 객체의 참조를 Member target 멤버 변수에 보관한다.
5. 프록시 객체는 실제 엔티티 객체의 getName()을 호출해서 결과를 반환한다. 



- 프록시의 특징
  - 프록시 객체는 처음 사용할 때 한번만 초기화 된다.
  - 프록시 객체가 초기화 되면 실제 엔티티에 접근할 수 있다.(위임)
  - 프록시 객체는 원본 엔티티를 상속받은 객체이므로 타입 체크시 주의해서 사용해야 한다.
  - 영속성 컨텍스에 찾는 엔티티가 이미 있으면 데이터베이스를 조회할 필요가 없으므로 em.getReference()를 호출해도 프록시가 아닌 실제 엔티티를 반환한다.
  - 초기화는 영속성 컨텍스트의 도움을 받아야 가능하다. 따라서 영속성 컨텍스트의 도움을 받을 수 없는 준영속 상태의 프록시를 초기화 하면 문제가 발생한다. 하이버네이트는 LazyInitializationException 예외를 발생시킨다. 
- 준영속 상태와 초기화 
  ```java
  Member member = em.getReference(Member.class, "id1");
  tx.commit();
  em.clse();
  member.getName(); // 준영속 상태 초기화 시도, LazyInitializationException 예외 발생
  ```


### 1.2. 프록시와 식별자 📖📖

### 1.3. 프록시 확인

- JPA가 제공하는 PersistenceUnitUtil.isLoaded(Object entity) 메서드를 사용하면 프록시 인스턴스의 초기화 여부를 확인할 수 있다. 
- 조회한 엔티티가 진짜 엔티티인지, 프록시로 조회한 것인지 확인할려면 클래스명을 직접 출력해보면 된다. ...javassist.. 라고 되어있으면 프록시이다.

## 2. 즉시 로딩과 지연로딩

프록시 객체는 주로 연관된 엔티티를 지연로딩 할때 사용한다. 

- 즉시로딩: 엔티티를 조회할 때 연관된 엔티티도 함께 조회한다. 
  - 설정방법: @ManyToOne(fetch = FetchType.EAGER)
- 지연로딩: 연관된 엔티티를 실제 사용할 때 조회한다.
  - 설정방법: @ManyToOne(fetch = FetchType.LAZY)

### 2.1. 즉시로딩

- JPA 구현체는 즉시 로딩을 최적화 하기 위해 가능하면 조인 쿼리를 사용한다. 

```sql
SELECT 
... 
FROM MEMBER M LEFT OUTER JOIN TEAM T 
	ON M.TEAM_ID = T.TEAM_ID
WHERE 
	M.MEMBER_ID = 'member1'
```

> 즉시 로딩 실행 SQL에서 JPA가 INNER JOIN이 아닌 LEFT OUTER JOIN을 사용한다. 
> 현재 회원테이블의 TEAM_ID 외래키는 NULL값을 허용한다. 그렇기 때문에 팀에 소속되지 않은 회원이 있을 가능성이 있고, JPA는 이런 상황을 고려해서 외부조인을 사용한것이다. 
>
> Q. 성능최적화에 유리한 내부조인은 어떻게 해야할까? 
>
> A. 외래키에 NOT NULL 제약 조건을 설정하면 값이 있는 것을 보장한다. 따라서 이때는 내부 조인으로 사용된다. 
> JPA에게도 이런 사실을 알려야 한다.
>
> ```java
> public class Member {
> @ManyToOne(fetch = FetchType.EAGER)
> @JoinColum(name= "TEAM_ID", nullable = false) // nullable 속성값을 설정해야 한다.
> }
> ```
>
> 또는 @ManyToOne(optional= false)로 설정해도 내부 조인을 사용한다. 
> 결국 정리하면, JPA는 선택적 관계면 외부 조인을 사용하고, 필수관계면 내부 조인을 사용한다.

### 2.2. 지연로딩

- 지연로딩을 사용하려면 fetch의 속성을 FethType.LAZY로 설정한다. 

```java
Member member = em.find(Member.class, "member1");
Team team = member.getTeam(); // team멤버변수에 프록시 객체를 넣어둔다.
team.getName(); // 팀 객체 실제 사용
```

> 조회 대상이 영속성 컨텍스트에 이미 있으면 프록시 객체를 사용할 이유가 없다. 따라서 프록시 객체가 아닌 실제 객체를 사용한다.

### 2.3. 즉시로딩, 지연 로딩 정리 

- 즉시 로딩이 좋은지, 지연 로딩이 좋은지 상황에 따라 다르다. 
- 지연로딩: 연관된 엔티티를 프록시로 조회한다. 프록시를 실제 사용할 때 초기화하면서 데이터베이스를 조회한다.
- 즉시로딩: 연관된 엔티티를 즉시 조회한다. 하이버네이트는 가능하면 SQL조인을 사용해서 한번에 조회한다.

## 3. 영속성 전이:CASECAD

부모 엔티티를 저장할 때 자식 엔티티도 함께 저장할수 있다. 

```java
@Entity
public class Parent {
  
  @OneToMany(mappedBby = "parent", cascade = CascadeType.PERSIST)
  private List<Child> children = new ArrayList<>();
}
```

- 영속성 전이: 저장
  - 부모 엔티티만 저장하면, 연관된 엔티티도 같이 저장된다.
- 영속성 전이: 삭제
  - 부모 엔티티만 삭제하면 연관도니 자식 엔티티도 함께 삭제된다.
  - 삭제 순서는 외래키 제약 조건을 고려해서 자식을 먼저 삭제 하고, 부모를 삭제한다.
- CASCADE 종류 
  - ALL
  - PERSIST
  - MERGE 
  - REMOVE 
  - REFRESH
  - DETACH

## 4. 고아 객체 

- JPA는 부모 엔티티와 연관관계가 끊어진 자식 엔티티를 자동으로 삭제하는 기능을 제공하데 이를 고아 객체 제거라 한다. 

```java
@Entity
public class Parent {
  
  @OneToMany(mappedBby = "parent", orphanRemoval = true)
  private List<Child> children = new ArrayList<>();
}
```

## 5. 정리 

- JPA 구현체들은 객체 그래프를 마음껏 탐색할 수 있도록 지원하고 이 때 프록시 기술을 사용한다.
- 객체를 조회할때 즉시 로딩, 지연 로딩이 존재한다.
- 객체를 저장,삭제 할때 연관된 객체도 함께 저장, 삭제 할 수 있는데 이를 `영속성 전이` 라 한다.
- 부모 엔티티와 연관관계가 끊어진 자식 엔티티를 자동으로 삭제 하려면 고아 객체 제거 기능을 사용하면 된다.