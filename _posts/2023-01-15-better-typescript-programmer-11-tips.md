---
layout: post
title: "<번역>더 나은 타입 스크립트 프로그래머가 되기 위한 11가지 힌트"
date: 2023-01-15 16:03 +0900
description: <번역>더 나은 타입 스크립트 프로그래머가 되기 위한 11가지 힌트
image: https://velog.velcdn.com/images/real-bird/post/f930709b-b453-4499-9375-82c9481b1d97/image.png
tags: typescript
---
# <번역> 더 나은 타입 스크립트 프로그래머가 되기 위한 11가지 힌트

> 해당 글은 원문은 [https://dev.to/zenstack/11-tips-that-help-you-become-a-better-typescript-programmer-4ca1](https://dev.to/zenstack/11-tips-that-help-you-become-a-better-typescript-programmer-4ca1) 여기 있습니다. 

Learning Typescript는 많은 경우 재발견의 여정이 됩니다.당신의 첫인상은 꽤 기만적일 수 있다: 이것은 단지 Javascript에 주석을 달기 위한 방법이기 때문에 컴파일러가 잠재적인 버그를 찾는 데 도움이 되지 않을까?

[![img](https://res.cloudinary.com/practicaldev/image/fetch/s--Wpm4C5iv--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/r9798dpzbwp6j69buuqp.png)](https://papago.naver.net/apis/site/proxy?url=https%3A%2F%2Fres.cloudinary.com%2Fpracticaldev%2Fimage%2Ffetch%2Fs--Wpm4C5iv--%2Fc_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880%2Fhttps%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fr9798dpzbwp6j69buuqp.png)


r/mevlix@reddit 기준



비록 이 진술이 일반적으로 사실이지만, 여러분이 앞으로 나아갈 때, 여러분은 언어의 가장 놀라운 힘이 활자를 만들고, 추론하고, 조작하는 데 있다는 것을 알게 될 것입니다.

이 문서에서는 언어를 최대한 활용할 수 있는 몇 가지 힌트를 요약합니다.

## #1 {**Set}**에서의 생각

타입은 프로그래머에게 일상적인 개념이지만 간결하게 정의하기는 의외로 어렵다.대신 Set을 개념 모델로 *사용*하는 것이 도움이 됩니다.

예를 들어, 새로운 학습자는 타이프스크립트의 유형 구성 방식이 직관에 반한다는 것을 알게 됩니다.매우 간단한 예를 들어 보겠습니다.

```tsx
type Measure = { radius: number }; 
type Style = { color: string };  
// typed { radius: number; color: string } 
type Circle = Measure & Style; 
```



연산자를 해석하는 경우`&`논리적인 의미에서, 여러분은 아마 예상할 수 있을 것이다.`Circle`겹치는 필드가 없는 두 유형의 결합이기 때문에 더미 타입이 될 수 있습니다.이것은 타이프 스크립트가 작동하는 방식이 아닙니다.그 대신 세트 내에서 **생각**하는 것이 올바른 동작을 추론하는 것이 훨씬 쉽습니다.

- 모든 유형은 값 *집합*입니다.
- *일부* 집합은 무한입니다. 문자열, 개체, 일부 유한 집합: 부울, 정의되지 않음...
- `unknown`*는 Universal* Set(모든 값 포함)이며,`never`*는 Empty* Set(값 없음)입니다.
- 유형`Measure`는, 다음의 번호 필드를 포함한 모든 오브젝트의 Set 입니다.`radius`에 대해서도 마찬가지입니다.`Style`.
- 그`&`연산자가 **교차로**를 작성합니다.`Measure & Style`는, 양쪽 모두를 포함한 오브젝트 세트를 나타내고 있습니다.`radius`그리고.`color`필드 - 실질적으로 더 작은 집합이지만 일반적으로 사용할 수 있는 필드가 더 많습니다.
- 마찬가지로`|`연산자는 Union: **더** 큰 집합이지만 일반적으로 사용 가능한 필드가 적을 수 있습니다(두 개의 개체 유형이 구성된 경우).

*또한* 할당 가능성을 이해하는 데 도움이 됩니다. 할당은 값 유형이 대상 유형의 하위 집합인 경우에만 허용됩니다.

```tsx
type ShapeKind = 'rect' | 'circle';
let foo: string = getSomeString();
let shape: ShapeKind = 'rect';

// disallowed because string is not subset of ShapeKind
shape = foo;

// allowed because ShapeKind is subset of string
foo = shape;
```



## #2 선언형 및 압축형 이해

매우 강력한 타이프스크립트 기능 중 하나는 제어 흐름에 따른 자동 타이프 좁힘입니다.즉, 변수는 코드 위치의 특정 지점에서 선언 유형과 좁혀진 유형이라는 두 가지 유형이 연관되어 있습니다.

```tsx
function foo(x: string | number) {
  if (typeof x === 'string') {
    // x's type is narrowed to string, so .length is valid
    console.log(x.length);

    // assignment respects declaration type, not narrowed type
    x = 1;
    console.log(x.length); // disallowed because x is now number
  } else {
    ...
  }
}
```



## #3 옵션 필드 대신 차별 조합 사용

Shape와 같은 다형성 유형 세트를 정의하는 경우 다음과 같이 쉽게 시작할 수 있습니다.

```typescript
type Shape = {
  kind: 'circle' | 'rect';
  radius?: number;
  width?: number;
  height?: number;
}

function getArea(shape: Shape) {
  return shape.kind === 'circle' ? 
    Math.PI * shape.radius! ** 2
    : shape.width! * shape.height!;
}
```



null이 아닌 어설션(접근 시)`radius`,`width`,그리고.`height`필드)가 필요한 이유는 두 필드 사이에 확립된 관계가 없기 때문입니다.`kind`기타 필드입니다.대신 차별적 결합이 훨씬 더 나은 해결책입니다.

```tsx
type Circle = { kind: 'circle'; radius: number };
type Rect = { kind: 'rect'; width: number; height: number };
type Shape = Circle | Rect;

function getArea(shape: Shape) {
    return shape.kind === 'circle' ? 
        Math.PI * shape.radius ** 2
        : shape.width * shape.height;
}
```



활자수축은 강압의 필요성을 없앴다.

## #4 유형 술어를 사용하여 유형 어설션을 피한다.

올바른 방법으로 타이프 스크립트를 사용하는 경우, 명시적인 타이프 어설션을 사용하는 경우는 거의 없습니다(예:`value as SomeType`하지만 다음과 같은 자극을 느낄 수 있습니다.

```tsx
type Circle = { kind: 'circle'; radius: number };
type Rect = { kind: 'rect'; width: number; height: number };
type Shape = Circle | Rect;

function isCircle(shape: Shape) {
  return shape.kind === 'circle';
}

function isRect(shape: Shape) {
  return shape.kind === 'rect';
}

const myShapes: Shape[] = getShapes();

// error because typescript doesn't know the filtering
// narrows typing
const circles: Circle[] = myShapes.filter(isCircle);

// you may be inclined to add an assertion:
// const circles = myShapes.filter(isCircle) as Circle[];
```



좀 더 우아한 해결책은 변화를 주는 것이다.`isCircle`그리고.`isRect`Typescript가 Typescript의 유형을 더 좁히는 데 도움이 되도록 대신 type 술어를 반환합니다.`filter`호출:

```tsx
function isCircle(shape: Shape): shape is Circle {
    return shape.kind === 'circle';
}

function isRect(shape: Shape): shape is Rect {
    return shape.kind === 'rect';
}

...
// now you get Circle[] type inferred correctly
const circles = myShapes.filter(isCircle);
```



## #5 유니언 타입의 분배 방법을 제어한다.

타입 추론은 타입 스크립트의 본능입니다.대부분은 묵묵히 기능합니다.다만, 미묘한 애매한 경우는 개입할 필요가 있습니다.*분산 조건부* 유형은 이러한 경우 중 하나입니다.

예를 들어,`ToArray`입력 유형이 어레이 유형이 아닌 경우 어레이 유형을 반환하는 도우미 유형:

```tsx
type ToArray<T> = T extends Array<unknown> ? T: T[]; 
```



다음 유형에 대해 무엇을 추론해야 한다고 생각하십니까?

```tsx
type Foo = ToArray<string number>; 
```



그 대답은.`string[] number[]`근데 이게 애매해요.그거 좋지`(string number)[]`대신?

기본적으로는 typescript가 union type을 검출했을 때(`string number`여기서)는 범용 파라미터(`T`여기서) 각 구성 요소로 분배됩니다.그래서,`string[] number[]`이 동작은 특수한 구문과 래핑을 사용하여 변경할 수 있습니다.`T`한 쌍으로`[]`예를 들어 다음과 같습니다.

```tsx
type ToArray<T> = [T] extends [Array<unknown>] ? T : T[]; 
type Foo = ToArray<string   number>; 
```



지금이다`Foo`유형으로 추론됩니다.`(string number)[]`.

## #6 철저한 체크를 통해 컴파일 시 처리되지 않은 케이스 파악

열거형에서 스위치캐시징을 할 때는 다른 프로그래밍 언어에서와 같이 예기치 않은 경우에 대해 자동으로 무시하는 대신 적극적으로 오류를 범하는 것이 좋습니다.

```tsx
function getArea(shape: Shape) {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rect':
      return shape.width * shape.height;
    default:
      throw new Error('Unknown shape kind');
  }
}
```



[ Typescript ]를 사용하면, 스태틱타입 체크로 에러를 조기에 검출할 수 있습니다.`never`입력:

```tsx
function getArea(shape: Shape) {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rect':
      return shape.width * shape.height;
    default:
      // you'll get a type-checking error below          
      // if any shape.kind is not handled above
      const _exhaustiveCheck: never = shape;
      throw new Error('Unknown shape kind');
  }
}
```



이 기능을 통해 데이터 보호 기능을 업데이트하지 않고`getArea`새로운 쉐이프 종류를 추가할 때 기능합니다.

이 기술에 대한 근거는 다음과 같습니다.`never`유형에는 이외에는 아무것도 할당할 수 없습니다.`never`의 모든 후보자가`shape.kind`케이스 스테이트먼트에 의해 소진됩니다.유일한 타입이 도달합니다.`default`단, 대상이 되지 않는 후보가 있는 경우, 에 유출됩니다.`default`분기하면 잘못된 할당이 발생합니다.

## #7 선호`type`에 걸쳐서`interface`

타이프 스크립트에서는,`type`그리고.`interface`오브젝트 입력에 사용할 경우 매우 유사한 구성입니다.논란의 여지가 있을 수 있지만, 제가 추천하고 싶은 것은`type`대부분의 경우, 그리고 사용만`interface`다음 중 하나에 해당하는 경우:

- [머지](https://papago.naver.net/apis/site/proxy?url=https%3A%2F%2Fwww.typescriptlang.org%2Fdocs%2Fhandbook%2Fdeclaration-merging.html%23merging-interfaces) 기능을 이용하고 싶다.`interface`.
- 클래스/인터페이스 계층과 관련된 OO 스타일 코드를 가지고 있습니다.

그렇지 않으면 항상 보다 다양한 기능을 사용하여`type`보다 일관된 코드로 결과를 구성합니다.

## #8 필요에 따라 어레이보다 태플을 우선하다

객체 유형은 구조화된 데이터를 입력하는 일반적인 방법이지만, 경우에 따라 테서 표현을 원하는 대신 단순한 배열을 사용할 수 있습니다.예:`Circle`다음과 같이 정의할 수 있습니다.

```tsx
type Circle = (string   number)[]; 
const circle: Circle = ['circle', 1.0];  // [kind, radius] 
```



그러나 이 타이핑은 불필요하게 느슨하며, 다음과 같은 것을 생성함으로써 쉽게 오류를 범할 수 있습니다.`['circle', '1.0']`대신 Tuple을 사용하면 더 엄격해질 수 있습니다.

```tsx
type Circle = [string, number];  
// you'll get an error below 
const circle: Circle = ['circle', '1.0']; 
```



태플 사용의 좋은 예로는 React가 있습니다.`useState`.

```
const [name, setName] = useState(''); 
```



콤팩트하고 타입도 안전합니다.

## #9 추정유형의 일반성 또는 특정성 관리

Typescript는 유형 추론을 할 때 합리적인 기본 동작을 사용합니다. 이것은 일반적인 경우에서 코드를 쉽게 쓰는 것을 목적으로 합니다(따라서 유형에 명시적으로 주석을 달 필요가 없습니다).동작을 조정할 수 있는 몇 가지 방법이 있습니다.

- 사용하다`const`가장 구체적인 유형으로 좁히다

```tsx
let foo = { name: 'foo' }; // typed: { name: string }
let Bar = { name: 'bar' } as const; // typed: { name: 'bar' }

let a = [1, 2]; // typed: number[]
let b = [1, 2] as const; // typed: [1, 2]

// typed { kind: 'circle; radius: number }
let circle = { kind: 'circle' as const, radius: 1.0 };

// the following won't work if circle wasn't initialized
// with the const keyword
let shape: { kind: 'circle' | 'rect' } = circle
```



- 사용하다`satisfies`유추된 활자에 영향을 주지 않고 활자를 검사하다

다음 예를 생각해 보겠습니다.

```tsx
type NamedCircle = {
    radius: number;
    name?: string;
};

const circle: NamedCircle = { radius: 1.0, name: 'yeah' };

// error because circle.name can be undefined
console.log(circle.name.length);
```



에러가 발생했습니다.`circle`의 선언 유형`NamedCircle`,`name`변수 이니셜라이저가 문자열 값을 제공했더라도 필드는 실제로 정의되지 않을 수 없습니다.물론, 우리는 그것을 떨어뜨릴 수 있다.`: NamedCircle`annotation을 입력합니다.단, 이 경우 타입을 느슨하게 하고, 이 타입의 유효성을 확인합니다.`circle`물건.꽤 딜레마네요.

다행히도, Typescript 4.9는 새로운 기능을 도입했다.`satisfies`키워드를 지정하면, 추측된 타입을 변경하지 않고 타입을 확인할 수 있습니다.

```tsx
type NamedCircle = {
    radius: number;
    name?: string;
};

// error because radius violates NamedCircle
const wrongCircle = { radius: '1.0', name: 'ha' }
    satisfies NamedCircle;

const circle = { radius: 1.0, name: 'yeah' }
    satisfies NamedCircle;

// circle.name can't be undefined now
console.log(circle.name.length);
```



수정된 버전은 두 가지 이점을 모두 누릴 수 있습니다. 객체 리터럴은 다음 조건을 준수합니다.`NamedCircle`type, 그리고 추론된 type에는 type을 지정할 수 없습니다.`name`들판.

## #10 사용`infer`추가 범용 유형 매개 변수를 만듭니다.

유틸리티 함수나 타입을 설계할 때는 지정된 타입 파라미터에서 추출한 타입을 사용할 필요성을 느끼는 경우가 많습니다.그`infer`키워드는 이 상황에서 편리합니다.새로운 유형 매개변수를 즉시 추론할 수 있습니다.다음은 두 가지 간단한 예입니다.

```tsx
// gets the unwrapped type out of a Promise;
// idempotent if T is not Promise
type ResolvedPromise<T> = T extends Promise<infer U> ? U : T;
type t = ResolvedPromise<Promise<string>>; // t: string

// gets the flattened type of array T;
// idempotent if T is not array
type Flatten<T> = T extends Array<infer E> ? Flatten<E> : T;
type e = Flatten<number[][]>; // e: number
```



어떻게.`infer`키워드는 에서 기능합니다.`T extends Promise<infer U>`다음과 같이 이해할 수 있습니다.T가 인스턴스화된 범용 Promise 타입과 호환된다고 가정하면 타입 파라미터 U를 즉흥적으로 수정하여 동작시킵니다.그래서 만약에`T`로서 인스턴스화된다.`Promise<string>`, 솔루션`U`될 것이다`string`.

## #11 활자 조작으로 창의력을 발휘하여 건조함을 [유지](https://papago.naver.net/apis/site/proxy?url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FDon%27t_repeat_yourself)

Typescript는 강력한 유형 조작 구문과 코드 복제를 최소화하는 데 도움이 되는 유용한 유틸리티 세트를 제공합니다.다음은 임시방편의 몇 가지 예입니다.

- 필드 선언을 복제하는 대신:

```tsx
type User = {
    age: number;
    gender: string;
    country: string;
    city: string
};
type Demographic = { age: number: gender: string; };
type Geo = { country: string; city: string; };
```



,사용하다`Pick`유틸리티를 사용하여 새로운 유형을 추출합니다.

```tsx
type User = {
    age: number;
    gender: string;
    country: string;
    city: string
};
type Demographic = Pick<User, 'age'|'gender'>;
type Geo = Pick<User, 'country'|'city'>;
```



- 함수의 반환 유형을 복제하는 대신

```tsx
function createCircle() {
    return {
        kind: 'circle' as const,
        radius: 1.0
    }
}

function transformCircle(circle: { kind: 'circle'; radius: number }) {
    ...
}

transformCircle(createCircle());
```



,사용하다`ReturnType<T>`추출:

```tsx
function createCircle() {
    return {
        kind: 'circle' as const,
        radius: 1.0
    }
}

function transformCircle(circle: ReturnType<typeof createCircle>) {
    ...
}

transformCircle(createCircle());
```



- 2종류의 쉐이프(여기서는 설정 타입과 공장 출하시)를 동시에 동기하는 것이 아니라,

```tsx
type ContentTypes = 'news' | 'blog' | 'video';

// config for indicating what content types are enabled
const config = { news: true, blog: true, video: false }
    satisfies Record<ContentTypes, boolean>;

// factory for creating contents
type Factory = {
    createNews: () => Content;
    createBlog: () => Content;
};
```



[ [Mapped](https://papago.naver.net/apis/site/proxy?url=https%3A%2F%2Fwww.typescriptlang.org%2Fdocs%2Fhandbook%2F2%2Fmapped-types.html) [Type](https://papago.naver.net/apis/site/proxy?url=https%3A%2F%2Fwww.typescriptlang.org%2Fdocs%2Fhandbook%2F2%2Ftemplate-literal-types.html) ]및 [[Template](https://papago.naver.net/apis/site/proxy?url=https%3A%2F%2Fwww.typescriptlang.org%2Fdocs%2Fhandbook%2F2%2Ftemplate-literal-types.html) Literal Type]를 [사용](https://papago.naver.net/apis/site/proxy?url=https%3A%2F%2Fwww.typescriptlang.org%2Fdocs%2Fhandbook%2F2%2Fmapped-types.html)하여 설정 쉐이핑에 따라 적절한 공장 유형을 자동으로 추론합니다.

```tsx
type ContentTypes = 'news' | 'blog' | 'video';

// generic factory type with a inferred list of methods
// based on the shape of the given Config
type ContentFactory<Config extends Record<ContentTypes, boolean>> = {
    [k in string & keyof Config as Config[k] extends true
        ? `create${Capitalize<k>}`
        : never]: () => Content;
};

// config for indicating what content types are enabled
const config = { news: true, blog: true, video: false }
    satisfies Record<ContentTypes, boolean>;

type Factory = ContentFactory<typeof config>;
// Factory: {
//     createNews: () => Content;
//     createBlog: () => Content; 
// }
```



상상력을 발휘하면 탐험할 수 있는 무한한 잠재력을 발견할 수 있습니다.

## 정리하다

이 투고에서는, 타이프 스크립트 언어의 비교적 고도의 토픽을 다루었습니다.실제로 직접 적용하는 것은 일반적이지 않습니다.그러나 이러한 기술은 Typescript용으로 특별히 설계된 라이브러리(Prisma나 [tRPC](https://papago.naver.net/apis/site/proxy?url=https%3A%2F%2Ftrpc.io%2F) [등](https://papago.naver.net/apis/site/proxy?url=https%3A%2F%2Fprisma.io%2F))에서 많이 사용되고 있습니다.요령을 알면 이러한 도구들이 어떻게 마법을 부리는지 더 잘 이해할 수 있습니다.
