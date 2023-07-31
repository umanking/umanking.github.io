---
layout: post
title: Javascript array sort(배열 정렬)
date: 2023-07-31 14:22 +0900
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
tags: [js, array, sort]
---
JavaScript에서 배열을 정렬하는 방법에 대해 설명드리겠습니다.

JavaScript에서는 `Array.prototype.sort()` 메서드를 사용하여 배열을 정렬할 수 있습니다. 이 메서드는 기본적으로 배열의 요소를 문자열로 변환한 후 Unicode 코드 포인트 순서로 정렬합니다. 따라서 숫자를 정렬할 때는 주의해야 합니다.

## 기본적인 배열 정렬:

```javascript
const fruits = ['banana', 'apple', 'orange', 'grape', 'kiwi'];
fruits.sort();
console.log(fruits); // ['apple', 'banana', 'grape', 'kiwi', 'orange']
```

## 숫자 배열 정렬:

```javascript
const numbers = [10, 2, 5, 8, 1];
numbers.sort();
console.log(numbers); // [1, 10, 2, 5, 8]
```

위의 예제에서 볼 수 있듯이 숫자 배열을 `sort()` 메서드로 정렬하면 제대로 정렬되지 않습니다. 이는 기본적으로 문자열로 변환되어 정렬되기 때문입니다.

## 숫자 배열 정렬하기 - 오름차순과 내림차순:

숫자 배열을 올바르게 정렬하려면 정렬 순서를 지정하는 비교 함수를 제공해야 합니다.

```javascript
const numbers = [10, 2, 5, 8, 1];

// 오름차순 정렬
numbers.sort((a, b) => a - b);
console.log(numbers); // [1, 2, 5, 8, 10]

// 내림차순 정렬
numbers.sort((a, b) => b - a);
console.log(numbers); // [10, 8, 5, 2, 1]
```

위의 예제에서 `sort()` 메서드의 인자로 사용된 비교 함수는 `a`와 `b`를 인자로 받고, `a - b`를 반환하여 오름차순으로 정렬하게 됩니다. 내림차순으로 정렬하기 위해서는 `b - a`를 반환하도록 하면 됩니다.

## 객체 배열 정렬하기:

객체의 특정 속성을 기준으로 배열을 정렬할 수도 있습니다.

```javascript
const people = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 },
  { name: 'Tom', age: 40 }
];

// 나이를 기준으로 오름차순 정렬
people.sort((person1, person2) => person1.age - person2.age);
console.log(people);
// [{ name: 'Jane', age: 25 }, { name: 'John', age: 30 }, { name: 'Tom', age: 40 }]
```

위의 예제에서는 `age` 속성을 기준으로 오름차순으로 정렬했습니다.

이와 같이 `sort()` 메서드를 사용하여 배열을 정렬할 수 있습니다. 필요에 따라 비교 함수를 사용하여 정렬 기준을 변경할 수 있습니다.