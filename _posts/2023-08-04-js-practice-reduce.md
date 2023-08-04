---
layout: post
title: "JavaScript의 Reduce 메서드 이해하기"
date: 2023-08-04 21:14 +0900
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
tags: [js, reduce]
---
# JavaScript의 Reduce 메서드: 기초부터 심화까지

## Reduce 메서드란?

JavaScript의 배열 메서드 중에서 가장 강력하면서도 다소 난해한 메서드인 'reduce'에 대해 알아보겠습니다. Reduce 메서드는 배열의 각 요소를 순차적으로 처리하면서 배열을 단일 값으로 줄여주는 함수입니다. 이를 통해 배열의 합계, 평균, 최대값 또는 최소값 등을 구하는 데 유용하게 사용할 수 있습니다.

Reduce 메서드의 기본 구문은 다음과 같습니다:

```javascript
array.reduce(callback(accumulator, currentValue[, index[, array]])[, initialValue])
```

- `callback`: 각 요소를 처리하고 값을 반환하는 함수입니다. 다음 인자를 받습니다: `accumulator` (누산기), `currentValue` (현재 요소), `index` (현재 인덱스, 선택 사항), `array` (원본 배열, 선택 사항).
- `initialValue`: 누산기(accumulator)에 제공하는 초기 값으로 선택 사항입니다.

## Reduce 메서드의 활용 예제

### 1. 배열의 합계 구하기:

```javascript
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
console.log(sum); // 15
```

### 2. 배열의 평균 구하기:

```javascript
const scores = [85, 92, 78, 90, 88];
const average = scores.reduce((accumulator, currentValue, index, array) => {
  accumulator += currentValue;
  if (index === array.length - 1) {
    return accumulator / array.length;
  }
  return accumulator;
}, 0);
console.log(average); // 86.6
```

### 3. 최대값과 최소값 구하기:

```javascript
const values = [10, 42, 5, 67, 35];
const max = values.reduce((acc, val) => (val > acc ? val : acc), values[0]);
const min = values.reduce((acc, val) => (val < acc ? val : acc), values[0]);
console.log(max); // 67
console.log(min); // 5
```

### 4. 객체 배열에서 특정 속성의 합계 구하기:

```javascript
const items = [
  { name: 'apple', price: 1.5 },
  { name: 'banana', price: 0.9 },
  { name: 'orange', price: 1.2 },
];
const totalPrice = items.reduce((acc, item) => acc + item.price, 0);
console.log(totalPrice); // 3.6
```

## 마무리

이제 Reduce 메서드에 대해 기초부터 심화까지 알아보았습니다. Reduce는 강력한 함수이지만 처음 접할 때는 다소 어려울 수 있습니다. 하지만 다양한 예제와 함께 반복 학습하면서 익숙해지시길 바랍니다. Reduce를 자유자재로 활용하면 복잡한 데이터 처리를 더욱 효율적으로 수행할 수 있을 것입니다. 행복한 코딩되세요!