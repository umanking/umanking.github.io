---
layout: post
title: "[JPA] 엔티티 설계시 주의사항들"
date: 2020-05-05 15:36 +0900
categories: [jpa]
tags: [jpa]
toc: true 
description: JPA에서 엔티티 설계시 주의사항들에 대한 요약본입니다.
---

> 엔티티 설계시 주의사항? 고려사항들을 알아본다. 관련내용은 김영한님의 인프런 강좌내용을 발췌했습니다!

## 1. setter를 사용하지 않는다.

객체에 대한 변경사항을 파악하기 어렵고, 유지보수하기 매우 힘들다.

## 2. 연관관계 설정은 lazy로 설정한다.

1.  EAGER는 예측이 어렵고, 어떤 SQL이 실행되는지 파악하기 힘들다, 특히 JPQL 을 실행할 때 N + 1 문제가 자주 발생한다.

    > order N: member 1 관계에서
    > select o from order; 이 결과 100개의 order 결과가 있으면, 해당 결과마다 member를 조회하는 쿼리가 100번 발생한다. 즉, order조회 쿼리 1 번에 따른 100번(N)번의 결과 값에 대한 쿼리가 추가로 발생한다. 해서 N+1 문제!!

2.  연관된 엔티티를 가져오고 싶으면 fetch join, 엔티티 그래프로 해결한다.

## 3. 컬렉션 초기화는 필드에서 초기화 한다.

컬렉션 초기화는 필드에서 바로 한다. null에 안전하다.

```java
public class Order {

    // 컬렉션은 필드 초기화 하는 것이 안전하다.
    public List<OrderItem> orderItems = new ArrayList<>();
}
```

하이버네이트는 엔티티를 영속화 할때, 컬렉션을 감싸서 하이버네이트가 제공하는 컬렉션으로 제공한다. 그렇기 때문에 컬렉션을 변경해서 사용하게 되면, 하이버네이트가 원하는 동작되로 되지 않을 가능성이 있다.

## 4. 테이블,컬럼명 생성전략

스프링 부트를 사용하게 되면 SpringPhsicalNamingStrategy로 camelcase -> uderscore 로 변경한다.

## 5. casecade = CasecadeType.ALL로 설정

1.  order에 여러개의 orderItems를 담고 있다면, casecade 설정을 하지 않는다면 orderItem1,2,3 각각을 persist()로 저장하고, order 엔티티도 persist()를 통해서 엔티티를 각각을 저장한다.
2.  CasecadeType.ALL로 하게되면, order엔티티만 저장해도, orderItem1,2,3 엔티티를 직접 저장하지 않아도 된다.

## 6. 연관관계 편의 메서드 작성

1.  객체에서 서로 참조되는 상황을 편의 메서드 형태로 만든다.
2.  주로 로직상 컨트롤하는 주도권을 가진 엔티티 클래스 하위에 편의메서드를 만든다.
3.  Member 1 : Order N 인 상황에서 Order 엔티티에서 setMember를 편의 메서드로 만들게 되면 다음과 같다.

```java
public class Order {
    //..생략..

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    // 연관관계 편의 메서드
    public void setMember(Member member){
        this.member = member;
        member.setOrder(this); // 반대편도 셋팅해준다.
    }
}
```
