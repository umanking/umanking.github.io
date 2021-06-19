---
layout: post
title: JPA - 연관관계 매핑(기초)(3)
date: 2021-06-19 17:20 +0900
tags: [JPA, ORM]
---
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

>  데이터베이스 테이블의 다대일, 일대다 관계에서 항상 `다` 쪽이 외래키를 가진다. 

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