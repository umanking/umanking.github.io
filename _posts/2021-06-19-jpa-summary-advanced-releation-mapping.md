---
layout: post
title: JPA - 다양한 연관관계 매핑(4)
date: 2021-06-19 17:21 +0900
tags: [jpa, orm]
---
# 실무에서 필요한JPA - 다양한 연관관계매핑(4)

## 1. 들어가며

엔티티의 연관관계를 매핑할 때는 다음 3가지를 고려해야 한다.

-   다중성: 다대일, 일대다 등등
-   단방향, 양방향: 객체관계에서 한쪽만 참조할지, 양쪽을 참조할지 
-   연관관계의 주인: JPA는 두 객체 연관관계 중 하나를 정해서 데이터 베이스 외래키를 관리하는데 이것을 연관관계의 주인이라 한다.

## 2. 다대일 

### 2.1. 다대일 단방향[N:1]

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

### 2.2. 다대일 양방향[1:N, N:1]

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

## 3. 일대다❌

### 3.1. 일대다 단방향[1:N]

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

-  일대다 단방향 관계는 약간 특이한데, 보통 자신이 매핑한 테이블의 외래키를 관리하는데, 이매핑은 반대쪽 테이블에 있는 외래키를 관리한다. 그럴 수 밖에 없는 것이 일대다 관계에서 외래키는 항상 다쪽 테이블에 있다. 하지만 다쪽인 Member엔티티에는 외래키를 매핑할 수 있는 참조 필드가 없다. 대신에 반대쪽인 Team 엔티티에만 참조 필드인 members가 있다. 따라서 반대편 테이블의 외래키를 관리하는 특이한 모습이 나타난다.

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

### 3.2. 일대다 양방향[1:N, N:1]

-   일대다 양방향 매핑은 존재하지 않는다. 대신 다대일 양방향 매핑을 사용해야 한다. 
-   더 정확히 말해, 양방향 매핑에서 @OneToMany는 연관관계의 주인이 될 수 없다. RDB특성상 일대다, 다대일 관계는 항상 다 쪽에 외래키가 있다.
-   따라서 @OneToMany, @ManyToOne 둘중에 연관관계의 주인은 항상 다 쪽인 @ManyToOne을 사용한 곳이다. 이런이유로 @ManyToOne에는 mappedBy 속성이 없다. 
-   그렇다고 완전히 불가능 한 것은 아니다. 일대다 단방향 매핑 반대편에 같은 외래키를 사용하는 다대일 단방향 매핑을 읽기 전용으로 하나 추가하면된다.

```java
public class Team {

  @OneToMany
  @JoinColumn(name = "TEAM_ID")
  private List<Member> members = new ArrayList<>();
}
```

```java
public class Member {
  
  @ManyToOne
  @JoinColumn(name="TEAM_ID", insertable=false, updatable=false)
  private Team team;
}
```

-   일대다 단방향 매핑 반대편에 다대일 단방향 매핑을 추가했다. 이때 일대다 단방향 매핑과 같은 TEAM_ID 외래 키 컬럼을 매핑했다. 이렇게 되면 둘다 같은 키를 관리하므로 문제가 발생한다. 따라서 반대편인 다대일 쪽은 insertable, updatable을 false로 설정해서 읽기만 가능하게 했다. 
-   결론: 될 수 있으면 `다대일 양방향`을 사용하자!

## 4. 일대일[1:1]

-   일대일 관계는 양쪽이 서로 하나의 관계만 가진다. 
-   일대일 관계는 주테이블이나 대상 테이블 둘 중 어느곳이나 외래키를 가질 수 있다.
-   따라서 일대일 관계는 누가 외래키를 가질지 선택해야 한다.

### 4.1. 주테이블에 외래키 

-   주로 객체지향 개발자들이 선호

#### 4.1.1. 단방향 

-   회원(`주테이블`)과 사물함(`대상 테이블`) 일대일

```java
// 주테이블에 외래키가 존재하는 경우
public class Member {
  @OneToOne
  @JoinColumn(name = "LOCKER_ID")
  private Locker locker;
}
```



```java
public class Locker {...}
```



#### 4.1.2. 양방향 

```java
public class Member {
  @OneToOne
  @JoinColumn(name = "LOCKER_ID")
  private Locker locker;
}
```

```java
public class Locker {
  @OneToOne(mappedBy = "locker")
  private Member member;
}
```

양방향이므로 연관관계 주인을 정해야 한다. MEMBER 테이블이 외래키를 가지고 있으므로 Member엔티티에 있는 **<u>Member.locker가 연관관계의 주인이다.</u>** 따라서 반대 매핑인 사물함의 Locker.member는 mappedBy를 선언해서 반대편이 연관관계의 주인임을 나타낸다.

### 4.2. 대상 테이블에 외래키

이번에는 대상 테이블에 외래키가 있는 일대일 관계를 보자.

#### 4.2.1. 단방향

-   대상 테이블에 외래키가 있는 단방향 관계는 JPA는 지원하지 않는다. ❌

#### 4.2.2. 양방향 

```java
// 일대일 대상 테이블에 외래키, 양방향 예제코드 
public class Member {
  @OneToOne(mappedBy = "member")
  private Locker locker;
}
```

```java
public class Locker {
  @OneToOne
  @JoinColumn(name = "MEMBER_ID")
  private Member member;
}
```

일대일 매핑에서 대상 테이블에 외래 키를 두고 싶으면 이렇게 양방향으로 매핑한다.

## 5. 다대다[N:N]

-   관계형 데이터베이스는 정규화된 테이블 2개로 다대다 관계를 표현할 수 없다. 
-   다대다 관계를 일대다, 다대일 관계로 풀어내는 연결 테이블을 사용한다.
-   회원과 상품 테이블인경우 
    -   MEMBER, MEMBER_PRODUCT, PRODUCT 테이블과 같이 풀어낼수 있다. 
    -   하지만 객체는 테이블과 다르게 객체 2개로 다대다 관계를 만들 수 있다. 

### 5.1. 다대다:단방향

```java
public class Member {
  @ManyToMany
  @JoinTable(name = "MEMBER_PRODUCT", 
            joinColumns = @JoinColumn(name="MEMBER_ID"), 
            inverseJoinColumns = @JoinColumn(name = "PRODUCT_ID")
            )
  private List<Product> products = new ArrayList<>();
}
```

```java
public class Product {...}
```

-   다대다 관계를 저장하는 예제

```java
public void save(){
  Proudct productA = new Product();
  productA.setId("productA");
  productA.setName("상품A");
  em.persist(productA);
  
  Member member1 = new Member();
  member1.setId("member1");
  member1.setUsername("회원1");
  member1.getProducts().add(productA); // 연관관계 설정
  em.persist(member1);
}
```

이 코드를 실행하면 다음과 같이 SQL이 실행된다. 

```sql
INSERT INTO PRODUCT ...
INSERT INTO MEMBER ...
INSERT INTO MEMBER_PRODUCT ... // 연결테이블도 같이 저장이 된다.
```

저장후에 member.getProduct()를 호출하게 되면 다음 SQL이 실행된다.

```sql
SELECT * FROM MEMBER_PRODUCT MP 
INNER JOIN PRODUCT P ON MP.PRODUCT_ID = P.PRODUCT_ID
WHERE MP.MEMBER_ID =?
```

연결테이블인 MEMBER_PRODUCT와 상품테이블을 조인해서 연관된 상품을 조회한다.

### 5.2. 다대다:양방향

-   다대다 매핑이므로 역방향도 @ManyToMany를 사용한다. 양쪽 원하는 곳에 mappedBy로 연관관계의 주인을 지정한다. 

```java
public class Product {
  
  @ManyToMany(mappedBy="products") // 역방향 추가
  private List<Member> members; 
}
```

-   연관관계 편의 메서드를 추가해서 관리하는 것이 편리하다. 

```java
public class Member {
	...
    
  public void addProduct(Product product){
    products.add(product);
    product.getMembers().add(this);
  }
}

```

### 5.3. 다대다:매핑의 한계와 극복, 연결 엔티티 사용❌

-   @ManyToMany를 사용하면 연결 테이블을 자동으로 처리해주므로 편리하다. 하지만 실무에서 사용하기에는 한계가 있다. 
-   연결 테이블에 단순히 주문한 회원 아이디, 상품 아이디만 담고 끝나지 않는다. 보통 연결테이블에 주문 수량, 주문한 날짜와 같은 컬럼이 더 필요하다. 
-   여기서는 회원상품(MemberProduct)엔티티를 추가했다. 

```java
public class Member {
  
  @OneToMany(mappedBy = "member")
  private List<MemberProduct> memberProducts = new ArrayList<>();
}
```

```java
public class Product {
  ...
}
```

상품코드를 보면, `상품 엔티티`에서 `회원상품 엔티티`로 객체그래프 탐색 기능이 필요하지 않다고 판단해서 연관관계를 만들지 않았다. 

```java
@Entity
@IdClass(MemberProductId.class)
public class MemberProduct {
  
  @Id
  @ManyToOne
  @JoinColum(name = "MEMBER_ID")
  private Membmer member; // MemberProductId.member와 연결 
  
  @Id
  @ManyToOne
  @JoinColum(name = "PRODUCT_ID")
  private Product product; // MemberProductId.product와 연결 
  
  private int orderAmount;
  
}
```

```java
//회원 상품 식별자 클래스 
public class MemberProductId implements Serializable {
  
  private String member; //MemberProduct.member와 연결
  private String product; //MemberProduct.product와 연결
  
  //hashCode and equals
  
}
```

-   회원상품 엔티티를 보면 기본 키를 매핑하는 @Id와 외래키를 매핑하는 @JoinColumn을 동시에 사용해서 기본키 + 외래키를 한번에 매핑했다.
-   @IdClass를 사용해서 복합 기본키를 매핑했다.
-   복합 기본 키
    -   회원상품 엔티티는 기본키가 MEMBER_ID와 PRODUCT_ID로 이루진 복합 기본키다. 
    -   JPA는 복합키를 사용하려면 별도의 식별자 클래스를 만들어야 한다. 그리고 엔티티에 @IdClass를 사용해서 식별자 클래스를 지정하면된다.
    -   복합키를 위한 식별자 클래스는 다음과 같은 특징이 있다. 
        -   복합키는 별도의 식별자 클래스로 만들어야 한다,
        -   Serializable을 구현해야 한다.
        -   equals와 hashCode를 구현해야 한다.
        -   기본 생성자가 있어야한다.
        -   식별자 클래스가 public이어야한다.
        -   @IdClass를 사용하는 방법외에 @EmbeddedId를 사용하는 방법도 있다.
-   식별관계 
    -   회원상품은 회원과 상품의 기본키를 받아서 자신의 기본 키로 사용한다. 이렇게 부모 테이블의 기본키를 받아서 자신의 기본키 + 외래키로 사용하는 것을 DB용어로 식별관계라고 한다.
-   저장하는 예제

```java
public void save(){
  
  // 회원저장
  Member member1 = new Member();
  member1.setId("member1");
  member1.setUsername("회원1");
  em.persist(member1);

  // 상품저장
  Proudct productA = new Product();
  productA.setId("productA");
  productA.setName("상품A");
  em.persist(productA);
  
  // 회원상품 저장 
  MemberProduct memberProduct = new MemberProduct();
  memberProduct.setMember(member1); 	//주문 회원 - 연관관계 설정
  memberProduct.setProduct(productA);	//주문 상품 - 연관관계 설정
  memberProduct.setOrderAmount(2); 		//주문 수량
  
 	em.persist(memberProduct);
}
```

- 조회 코드 

```java
public void find(){
  // 기본키 값 생성
  MemberProductId memberProductId = new MemberProductId();
  memberProductId.setMember("member1");
  memberProductId.setProduct("productA");
  
  MemberProduct memberProduct = em.find(MemberProduct.class, memberProductId);
  
  Member member = memberProduct.getMember();
  Product product = memberProduct.getProduct();
}
```

- 복합키는 항상 식별자 클래스를 만들어야 한다. em.find()를 보면 생성한 식별자 클래스로 엔티티르 조회한다.
- 다음으로 복합키를 사용하지 않고 간단히 다대다 관계를 구성하는 방법을 알아보자.

### 5.4. 다대다:새로운 기본 키 사용

- 추천하는 기본 키 생성전략은 데이터베이스에서 자동으로 생성해주는 대리 키를 Long값으로 사용하는 것이다. 이것의 장점은 간편하고 거의 영구히 쓸수 있으며 비즈니스에 의존하지 않는다. 그리고 ORM 매핑시 복합키를 만들지 않아도 되므로 간단히 매핑을 완성할 수 있다.
- 이번에는 연결테이블에 새롱누 기본 키를 사용해보자. 회원상품(MemberProduct) 보다는 더 적절한 이름인 주문(Order)을 사용한다.

- ORDER_ID라는 새로운 기본 키를 하나 만들고, MEMBER_ID, PRODUCT_ID컬럼은 외래키로 사용한다.

```java
public class Order {
  @Id @GeneratedValue
  @Column(name = "ORDRE_ID")
  private Long id;
  
  @ManyToOne
  @JoinColumn(name = "MEMBER_ID")
  private Member member;
  
  @ManyToOne
  @JoinColumn(name = "PRODUCT")
  private Product product;
  
  private int orderAmount;
}
```

- 조회하는 코드 

```java
public void find(){
  Long orderId = 1L;
  Order order = em.find(Order.class, orderId);
  
  Member member = order.getMember();
  Product product = order.getProduct();
}
```

식별자 클래스를 사용하지 않아서 코드가 한결 단순해졌다. 

### 5.5. 다대다 연관관계 정리

- 다대다 관계를 일대다, 다대일 관계로 풀어내기 위해 연결테이블을 만들 때 식별자를 어떻게 구성할지 선택해야 한다.
  - 식별 관계: 받아온 식별자를 기본키 + 외래키로 사용한다.
  - 비식별 관계: 받아온 식별자는 외래키로만 사용하고 새로운 식별자를 추가한다.👍
- 객체 입장에서 2번처럼 비식별관계를 사용하는 것이 복합키를 위한 식별자 클래스를 만들지 않아도 되므로 단순하고 편리하게 ORM매핑을 사용할 수 있따. 이런 이유로 식별관계보다는 <u>**비식별 관계를 추천한다.**</u>
