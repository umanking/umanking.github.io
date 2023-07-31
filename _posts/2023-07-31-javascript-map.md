---
layout: post
title: Javascript map 사용방법
date: 2023-07-31 14:27 +0900
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
tags: [js, map]
---
JavaScript의 `map()`은 배열의 모든 요소에 대해 주어진 함수를 호출하여 새로운 배열을 생성하는 메서드입니다. `map()` 메서드를 사용하면 기존 배열의 각 요소를 변형하여 새로운 배열을 만들 수 있습니다. 이렇게 생성된 새 배열은 원본 배열과 같은 크기를 가지며, 각 요소들은 주어진 함수에 의해 반환된 값으로 구성됩니다.

`map()` 메서드는 배열의 모든 요소에 대해 순차적으로 반복하며 새 배열을 생성합니다. 원본 배열은 변경되지 않습니다.

## map() 메서드의 구문은 다음과 같습니다:

```javascript
const newArray = array.map((currentValue, index, array) => {
  // 변형할 작업 수행
  return transformedValue;
});
```

- `currentValue`: 배열의 현재 처리 중인 요소입니다.
- `index`: 현재 요소의 인덱스입니다.
- `array`: `map()` 메서드가 호출된 배열 자체입니다.
- `transformedValue`: 현재 요소를 변형하여 새로운 값으로 반환합니다. 이 값은 새로운 배열에 추가됩니다.

## 예시를 살펴봅시다:

```javascript
const numbers = [1, 2, 3, 4, 5];

const squaredNumbers = numbers.map((num) => num * num);

console.log(squaredNumbers); // [1, 4, 9, 16, 25]
```

위의 예시에서 `map()` 메서드를 사용하여 `numbers` 배열의 각 요소를 제곱하여 `squaredNumbers` 배열을 만들었습니다. 각 요소에 대해 제곱 연산이 수행되어 새로운 배열이 생성됩니다.

`map()` 메서드는 배열의 각 요소에 적용되는 변형 작업을 수행하는데 유용합니다. 예를 들어, 객체 배열에서 특정 속성의 값을 추출하거나, 문자열 배열에서 각 요소를 대문자로 변환하는 등의 작업에 사용할 수 있습니다. 이는 배열의 요소를 변형하여 새로운 배열을 만들어야 할 때 매우 유용한 메서드입니다.