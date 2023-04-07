---
layout: post
title: lodash 사용예제 (map, filter, reduce, sortBy)
date: 2023-04-07 16:14 +0900
description: lodash는 JavaScript 개발자들이 자주 사용하는 유용한 라이브러리 중 하나입니다. 이번 글에서는 lodash의 몇 가지 사용 예제를 소개하겠습니다.
image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Lodash.svg/1200px-Lodash.svg.png"
tags: [lodash, js]
---
안녕하세요! lodash는 JavaScript 개발자들이 자주 사용하는 유용한 라이브러리 중 하나입니다. 이번 글에서는 lodash의 몇 가지 사용 예제를 소개하겠습니다.

## 1. _.map

_.map은 컬렉션의 각 요소에 함수를 적용하고, 그 결과를 새로운 배열로 반환합니다. 예를 들어, 다음과 같은 배열이 있다고 가정해봅시다.

```js
const numbers = [1, 2, 3, 4, 5];
```

이 배열의 모든 요소를 제곱하여 새로운 배열을 만들고 싶다면 다음과 같이 _.map을 사용할 수 있습니다.

```js
const squaredNumbers = _.map(numbers, (n) => n ** 2);
console.log(squaredNumbers); // [1, 4, 9, 16, 25]
```

## 2. _.filter

_.filter는 컬렉션에서 특정 조건을 만족하는 요소만을 추출하여 새로운 배열로 반환합니다. 예를 들어, 다음과 같은 배열이 있다고 가정해봅시다.

```js
const numbers = [1, 2, 3, 4, 5];
```

이 배열에서 짝수만 추출하여 새로운 배열을 만들고 싶다면 다음과 같이 _.filter를 사용할 수 있습니다.

```js
const evenNumbers = _.filter(numbers, (n) => n % 2 === 0);
console.log(evenNumbers); // [2, 4]
```

## 3. _.reduce

_.reduce는 컬렉션의 요소들을 하나씩 순회하면서, 지정된 함수를 적용하여 하나의 값을 반환합니다. 예를 들어, 다음과 같은 배열이 있다고 가정해봅시다.

```js
const numbers = [1, 2, 3, 4, 5];
```

이 배열의 모든 요소를 더한 값을 구하고 싶다면 다음과 같이 _.reduce를 사용할 수 있습니다.

```js
const sum = _.reduce(numbers, (acc, n) => acc + n, 0);
console.log(sum); // 15
```

## 4. _.sortBy

_.sortBy는 컬렉션의 요소들을 지정된 기준에 따라 정렬하여 새로운 배열로 반환합니다. 예를 들어, 다음과 같은 배열이 있다고 가정해봅시다.

```js
const users = [
  { name: 'Alice', age: 28 },
  { name: 'Bob', age: 35 },
  { name: 'Charlie', age: 22 },
];
```

이 배열을 나이순으로 정렬하고 싶다면 다음과 같이 _.sortBy를 사용할 수 있습니다.

```js
const usersSortedByAge = _.sortBy(users, 'age');
console.log(usersSortedByAge);
// [
//   { name: 'Charlie', age: 22 },
//   { name: 'Alice', age: 28 },
//   { name: 'Bob
```
