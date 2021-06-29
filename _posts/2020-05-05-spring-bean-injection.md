---
layout: post
title: "[Spring] 빈 주입하는 방법 && Best Practice "
date: 2020-05-05 17:01 +0900
 
categories: [spring]
#tags: [spring]
---

> 스프링 빈 주입하는 종류에 대해서 알아보고, Best Practice를 알아보자.

## 빈을 주입하는 방법 3가지

보통 Spring 빈 주입은 3가지가 있다.

- 필드 주입
- setter 주입
- 생성자 주입
<!-- more -->

## 1) 필드 주입

```java
@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;
}
```

필드 주입은 주입하려는 빈을 필드에 설정하고, `@Autowired` 어노테이션을 단다. 그러면 Spring에서 해당 빈을 외부에서 생성해서 주입(inject)해준다. 단점은 `MemberService` 를 테스트할 때 필드로 주입된 memberRepository가 강하게~~~ 결합되어 있어서(의존도가 있음) 테스트 할때 어려움이 있다.

## 2) Setter주입

setter 주입은 어떨까?

```java
public class MemberService {

    private MemberRepository memberRepository;

    public void setMemberRepository(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }
}
```

setter 주입은 필드 주입에 비해서, setter를 통해서 MemberRepository 말고도 다른 MockMemberRepository와 같은 목객체를 setter로 주입해서 테스트를 할 수 있다. 하지만, 런타임에 리플렉션을 통해서 누군가 해당 레포지토리를 변경할 수 있다는 단점이 있다.

## 3) 생성자 주입

생성자 주입은 어떨까?

```java
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }
}
```

생성자 주입은 생성 시점에 해당 Repository가 주입되기 때문에 변경할 수 있는 방법이 없다. 하나 더 나아가자면 `final` 키워드를 추가함으로써 컴파일 타임에 `MemberRepository` 까먹지 않고 주입시켜줄 수 있다. 또한, 애초에 MemberService에 대한 테스트를 작성할 때도 Mock객체와 같이 생성자를 통해서 주입가능 하기 때문에(의존도가 약해짐) 테스트 작성에서도 용이하다.

다음과 같이 여러 가지 다양한 구현체(Mock)을 통해서 주입할 수 있다.

```java
// 인프라 구현체를 jdbc로 mock객체를 주입
MemberService memberService = new MemberService(new MockJdbcMemberRepository());

// 인프라 구현체를 h2 인메모리DB로 mock객체를 주입
MemberService memberService = new MemberService(new MockInMemoryMemberRepository());
```

## 보너스: Lombok 사용시

3가지 중 생성자 주입이 👍 좋다는 것을 알았다. 실무에서 롬복을 사용하는 경우에 코드를 어떻게 줄일 수 있을까 ?

```java
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
}
```

`@AllArgsConstructor` 는 존재하는 필드에 대해서 생성자를 만들어 준다. 이것보다는 `@RequiredArgsConstructor`이것을 사용하는 것을 권장한다. 이렇게 하면 코드양이 줄고, 가독성이 올라갔다.

## ✋ 똑똑한 IntelliJ

보통은 습관적으로 코딩하게 되면 `@Autowired`로 필드 주입을 사용하게 된다. 현재 2019.3 버전 IntelliJ를 사용하게 되면 노란색으로 경고 표시가 나오고 필드 주입은 추천하지 않는다고 한다. ⌥ + ↵ (alt + enter) 를 누르면 자동으로 생성자 주입으로 변경해 준다.

![2020-05-05 16 56 06-min](https://user-images.githubusercontent.com/28615416/81078512-50c8f600-8f29-11ea-8e66-7e261fbf0c8b.gif)


## 정리

- 스프링에서 빈을 주입하는 방법에 대해서 알아봤다. 생성자 주입이 최고다. 이유는 의존도를 낮춤으로써 다양한 의존관계(mock)으로 대체할 수 있기 때문이다.
- 추가로 롬복을 사용하게 된다면, @RequiredArgsConstructor 어노테이션을 통해서 비교적 코드양을 줄일 수 있다.
- 생각해볼 것🤔:: 생성자 주입을 했을때 결국 생성자 필드에 엄청 많은 의존관계를 주입하게 된다면 코드도 지저분해지고 SRP를 지키지 않게 된다. 그러니 MemberService로 시작했지만, MemberUpdateService, MemberOrderService 와 같이 각 비즈니스가 하는 역할을 명확하게 표현할 수 있는 서비스로 나중에 쪼개야 한다. 생성자 주입시, 4개 이상을 넘어가지 않는게 좋은 것 같다!!!
