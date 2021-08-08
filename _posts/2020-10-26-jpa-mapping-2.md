---
layout: post
title: "[JPA] 연관관계 매핑 (연관관계 편의 메서드)"
date: 2020-10-26 22:25 +0900
categories: [jpa]
tags: [jpa]
image: 'https://user-images.githubusercontent.com/20104232/64585171-96511580-d3d2-11e9-947d-8f1e98e46100.png'
toc: true
---

## 1. 들어가며
JPA에서 양방향 연관관계를 매핑할때, 객체관점에서 `편의 메서드`를 작성하는 방법에 대해서 알아보자.
 **이번에는 양방향 매핑을 할때, 객체 관점에서 어떻게 처리할지?를 고민해보자.**

## 2. 예제 코드
Member (N) : Team(1) 의 관계를 생각해보자

```java
public class Member {
    @ManyToOne
    @JoinColumn(name="TEAM_ID")
    private Team team;
}
public class Team {
    @OneToMany(mappedBy="team")
    private List<Member> members = new ArrayList<>();
}
```

다음과 같이 team.getMembers() 컬랙션을 가지고 와서, 저장한 member를 add하면 어떻게 될까?

```java
Member member = new Member();
member.setName("andrew");
member.setAge(32);
memberRepository.save(member);

Team team = new Team();
team.setName("teamA");
team.getMembers().add(member);
teamRepository.save(team);

System.out.println(memberRepository.findById(member.getId()));
```

다음과 같이 team에 null 값이 나온다.

```java
Optional[Member(id=1, name=andrew, age=32, team=null)]
```

왜 이런 현상이 나올까? 

> 연관관계의 주인은 Member.team이다. 즉, Team.members(연관관계의 주인이 아닌)에 값을 저장 하면 안된다. 



## 3. 어떻게 하나?

정답은 연관관계의 주인쪽에만 값을 저장하냐? 안하냐? 이런 여부를 묻고 따지지 말고, 객체 관점에서 양쪽 방향에 모두 값을 입력해 주는 것이 실수를 미연에 방지할 수 있다. 

```java
public void setTeam(Team team) {
    // 기존의 team과 member의 관계를 끊는다.
    if (this.team != null) {
        this.team.getMembers().remove(this);
    }
    this.team = team;  // member -> team 
    team.getMembers().add(this); // team -> member
}
```





