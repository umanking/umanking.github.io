---
layout: post
title: "[JPA] 연관관계 매핑 기초(다대일, 연관관계 주인)"
date: 2019-04-12 09:05:25
categories: [jpa]
tags: [jpa]
---

## 들어가며

JPA 연관관계 매핑중, 실무에서 가장 많이 쓰이는 1:N (일대다) 매핑에 대해서 알아보자.  
일대다 매핑을 하기 위해서 하나의 팀에 여러명의 멤버가 속해있는, 1:N 관계를 생각해보자.  
관계 매핑에는 `방향성`과 `외래키의 주인` 두 가지 상황이 발생 한다.(객체와 테이블간의 패러다임 불일치 때문에)  
일반적으로 객체에서는 참조를 통해서 방향성을 갖는다.

### 객체에서 방향성이란?

```java
@Data
public class Member {
    private Team team;
}
```

memeber.getTeam() 을 통해서 team을 조회할 수 있다.  
즉, member -> team간의 단방향(방향성)을 갖지만, 반대의 방향성은 존재하지 않는다.  
만약에 반대 상황도 존재할려면

```java
@Data
public class Team {
    private List<Member> memberList;
}
```

이렇게 설정해야지만, team.getMemberList()를 통해서 접근 할 수 있다. 이렇게 객체간의 참조를 통해서 탐색하는 과정을 `객체 그래프 탐색`이라고 한다.

## 외래키의 주인? 

@OneToMany에서 mappedBy 속성이 존재한다. 외래키의 주인을 설정하는 속성이다. 


외래키의 주인을 왜 설정해야 하나? 

Entity의 양방향 매핑은 단방향 매핑2개로 존재한다. 
- Member -> Team (단방향)
- Team -> Member (단방향)

하지만, 엔티티가 아닌 테이블에서는 연관관계는 다음과 같이 한개만 존재한다.
- Member <-> Team (양방향)

그렇기 때문에 Entity의 관리포인트가 2군데이기 때문에 **연관관계의 주인**을 설정해줘야 한다. 

> 연관관계의 주인이면 무엇을 할수 있나? 
> 연관관계의 주인만이 데이터베이스 연관관계와 매핑되고 외래키를 관리(등록, 수정, 삭제) 할수 있다. 반면에 주인이 아닌 쪽은 읽기만 할 수 있다. 


#### 연관관계의 주인은 외래키가 있는곳!!!!!!!!!
```java
public class Member {
    @ManyToOne
    @JoinColumn(name="TEAM_ID")
    private Team team;
}
```

```java
public class Team {
    @OneToMany(mappedBy="team")
    private List<Member> members = new ArrayList<>();
}
```

다음과 같은 상황에서 연관관계의 주인은 mappedBy 속성의 반대에 있는 `Member.team` 을 갖는다.

> 데이터베이스 테이블에서 항상 다애일 관계에서 다(Many) 쪽이 외래키를 가진다. 그래서 @ManyToOne에는 mappedBy속성이 존재하지 않고, @OneToMany에만 mappedBy 속성이 존재한다.

# 2.예제 코드

```java
@Data
@Table(name = "MEMBER")
@Entity
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String name;
    private Long age;

    @ManyToOne
    @JoinColumn(name = "TEAM_ID")
    private Team team;

}
```

먼저 member -> team 의 단방향 관계를 살펴 보자.
Member(다) : Team(일) 관계를 갖는다. @JoinColumn 은 TEAM_ID를 갖는다.

```java
@Data
@Table(name = "TEAM")
@Entity
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String name;

    // 양방향 관계일 때만 설정함
    @OneToMany(mappedBy = "team")
    private List<Member> memberList;
}
```

Member과 Team간의 연관관계 매핑에서 핵심은

`@ManyToOne` 과 `@JoinColumn` 의 쌍으로 이루어진다. 특히나 JoinColumn은 표시하지 않아도 JPA가 자동으로 해당 필드(team)에 \_ID를 붙여서 자동으로 생성해 주지만, 실무에서는 명시적으로 사용하는 것을 권한다.


실제 테스트 케이스를 통해서 검증해보자.

```java
@RunWith(SpringRunner.class)
@SpringBootTest
@Rollback(false)
public class MemberTeamTests {

    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private TeamRepository teamRepository;

    @Test
    public void save() {
        // given
        Team team = new Team();
        team.setName("A팀");
        teamRepository.save(team); // team 저장

        Member member = new Member();
        member.setName("andrew");
        member.setAge(32L);
        member.setTeam(team); //member의 team setting
        memberRepository.save(member); //member 저장

        //when
        Optional<Member> optionalMember = memberRepository.findById(member.getId());

        //then
        Assert.assertEquals(optionalMember.get().getTeam().getName(), team.getName());
    }
}
```

```
Hibernate: call next value for hibernate_sequence
Hibernate: insert into team (name, id) values (?, ?)
Hibernate: call next value for hibernate_sequence
Hibernate: insert into member (age, name, team_id, id) values (?, ?, ?, ?)
Hibernate: select member0_.id as id1_0_0_, member0_.age as age2_0_0_, member0_.name as name3_0_0_, member0_.team_id as team_id4_0_0_, team1_.id as id1_1_1_, team1_.name as name2_1_1_ from member member0_ left outer join team team1_ on member0_.team_id=team1_.id where member0_.id=?
```

실제 나간 쿼리를 살펴보면, team 테이블에 데이터를 저장하고, member 테이블에 저장하고, 결과를 select해온다. 
기본 `left outer join` 키워드가 나간것을 주목하자! 
각각 Team과 Member가 저장되고, member.getTeam()를 통해서 객체 그래프 탐색까지 잘 되는 것을 확인할 수 있습니다.
