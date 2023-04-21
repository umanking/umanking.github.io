---
layout: post
title: lodash differenceWith 사용방법
date: 2023-04-21 17:41 +0900
description: "`differenceWith` 함수는 두 개 이상의 배열 중 첫 번째 배열과 나머지 배열들 간의 차집합을 구하는 함수입니다."
image: 
tags: lodash
---


`differenceWith` 함수는 두 개 이상의 배열 중 첫 번째 배열과 나머지 배열들 간의 차집합을 구하는 함수입니다. 두 배열 간의 차집합을 계산할 때, 비교 함수를 사용하여 두 값이 같은지 다른지를 결정할 수 있습니다.

다음은 `differenceWith` 함수의 사용 예시입니다.

```javascript

const { differenceWith } = require('lodash');

const array1 = [{ x: 1, y: 2 }, { x: 2, y: 1 }];
const array2 = [{ x: 1, y: 2 }, { x: 3, y: 4 }];

function compareFunction(obj1, obj2) {
  return obj1.x === obj2.x && obj1.y === obj2.y;
}

const difference = differenceWith(array1, array2, compareFunction);

console.log(difference);
// Output: [ { x: 2, y: 1 } ]
```



위 예시에서는 `differenceWith` 함수를 사용하여 `array1`과 `array2` 배열 간의 차집합을 구했습니다. 두 배열 간의 차집합을 구할 때, `compareFunction` 함수를 사용하여 두 객체가 동일한지 여부를 판단했습니다. 결과적으로 `[ { x: 2, y: 1 } ]` 배열이 반환되었습니다. 이는 `array1`에는 존재하지만 `array2`에는 존재하지 않는 객체입니다.
