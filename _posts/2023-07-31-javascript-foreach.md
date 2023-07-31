---
layout: post
title: Javascript foreach 사용예제
date: 2023-07-31 14:30 +0900
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
tags: [js]
---
JavaScript의 `forEach()`는 배열의 각 요소에 대해 주어진 함수를 호출하는 메서드입니다. `forEach()` 메서드를 사용하면 배열의 모든 요소를 반복하며, 각 요소에 대해 지정된 함수를 실행할 수 있습니다.

`forEach()` 메서드는 일반적으로 반복문(for 또는 while) 대신 사용하여 배열의 요소를 순회할 때 편리하게 사용됩니다. `forEach()` 메서드는 콜백 함수를 사용하여 각 요소를 처리합니다. 이 콜백 함수는 배열의 각 요소, 해당 요소의 인덱스, 그리고 원본 배열 자체에 접근할 수 있습니다.

## forEach() 메서드의 구문은 다음과 같습니다:

```javascript
array.forEach((currentValue, index, array) => {
  // 각 요소에 대해 수행할 작업
});
```

- `currentValue`: 배열의 현재 처리 중인 요소입니다.
- `index`: 현재 요소의 인덱스입니다.
- `array`: `forEach()` 메서드가 호출된 배열 자체입니다.


## 예시를 살펴봅시다:

```javascript
const fruits = ['apple', 'banana', 'orange'];

fruits.forEach((fruit, index) => {
  console.log(`Fruit at index ${index}: ${fruit}`);
});

// 출력 결과:
// Fruit at index 0: apple
// Fruit at index 1: banana
// Fruit at index 2: orange
```

위의 예시에서 `forEach()` 메서드를 사용하여 `fruits` 배열의 각 요소를 반복하고, 각 요소와 해당 인덱스를 출력했습니다.

`forEach()` 메서드는 반복문과 다르게 중간에 `break`문을 사용하여 루프를 중단할 수 없습니다. 만약 중간에 반복을 중단하고 싶다면 `forEach()` 메서드 대신 `for` 또는 `while` 반복문을 사용해야 합니다.

`forEach()` 메서드는 주로 배열 요소를 순회하면서 처리할 작업을 정의할 때 사용합니다. 배열의 각 요소를 수정하거나 새로운 배열을 반환하려면 `map()` 메서드를 사용해야 합니다.