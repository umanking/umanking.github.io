---
layout: post
title: TypeScript의 Partial, Omit, Pick 알아보기
date: 2023-08-04 21:32 +0900
image: https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/1200px-Typescript_logo_2020.svg.png
tags: [ts, typescript]
---
# TypeScript의 Partial, Omit, Pick에 대한 상세한 이해

## TypeScript의 Partial, Omit, Pick이란 무엇인가요?

TypeScript는 JavaScript에 타입을 추가하여 더욱 안전하고 가독성이 좋은 코드를 작성할 수 있게 해줍니다. Partial, Omit, Pick은 TypeScript에서 제공하는 유용한 타입 유틸리티입니다.

### 1. Partial:

Partial은 타입의 모든 속성을 선택적(optional)으로 만들어주는 유틸리티입니다. 즉, 해당 타입의 모든 속성을 옵셔널하게 변경합니다.

```typescript
type User = {
  id: number;
  name: string;
  age: number;
};

// 모든 속성이 옵셔널로 변경된 UserPartial 타입
type UserPartial = Partial<User>;
```

### 2. Omit:

Omit은 타입에서 지정된 속성을 제외한 새로운 타입을 생성하는 유틸리티입니다.

```typescript
type User = {
  id: number;
  name: string;
  age: number;
  email: string;
};

// email 속성을 제외한 UserType 타입
type UserType = Omit<User, 'email'>;
```

### 3. Pick:

Pick은 타입에서 지정된 속성만 선택하여 새로운 타입을 생성하는 유틸리티입니다.

```typescript
type User = {
  id: number;
  name: string;
  age: number;
  email: string;
};

// id와 name 속성만 선택한 UserPick 타입
type UserPick = Pick<User, 'id' | 'name'>;
```

## Partial, Omit, Pick의 사용 예제:

```typescript
type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

// Partial을 이용하여 모든 속성이 옵셔널인 TodoPartial 타입
type TodoPartial = Partial<Todo>;

// Omit을 이용하여 id 속성을 제외한 TodoWithoutId 타입
type TodoWithoutId = Omit<Todo, 'id'>;

// Pick을 이용하여 title 속성만 선택한 TodoTitle 타입
type TodoTitle = Pick<Todo, 'title'>;
```

## 활용 예제: 함수에서 Partial과 Omit 활용하기

```typescript
type Book = {
  id: number;
  title: string;
  author: string;
  year: number;
};

function updateBook(book: Book, updates: Partial<Omit<Book, 'id'>>) {
  // updates에는 id를 제외한 title, author, year 속성 중 하나 또는 여러 개가 포함될 수 있습니다.
  return { ...book, ...updates };
}

const myBook: Book = {
  id: 1,
  title: 'TypeScript in Action',
  author: 'Jane Doe',
  year: 2022,
};

const updatedBook = updateBook(myBook, { title: 'New Title', year: 2023 });
console.log(updatedBook);
// { id: 1, title: 'New Title', author: 'Jane Doe', year: 2023 }
```

## 마무리

이제 TypeScript의 Partial, Omit, Pick에 대해 상세하게 알아보았습니다. 이 유틸리티들은 타입을 유연하게 다루고 코드를 간결하고 안전하게 작성하는 데 도움을 줍니다. 활용 예제를 통해 함수에서도 어떻게 활용할 수 있는지 살펴보았습니다. TypeScript에서 이러한 유틸리티들을 자유롭게 활용하여 효율적이고 안정적인 코드를 작성해보세요. Happy coding!