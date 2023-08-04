---
layout: post
title: JavaScript Promise 기본부터 고급 활용까지
date: 2023-08-04 21:25 +0900
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
tags: [js, promise]
---
# JavaScript Promise: 기본부터 고급 활용까지

## 기본 개념: Promise란 무엇인가요?

JavaScript Promise는 비동기 작업을 보다 편리하게 다룰 수 있도록 도와주는 객체입니다. 비동기 작업은 일반적으로 AJAX 요청, 파일 로딩, 데이터베이스 쿼리 등과 같이 시간이 오래 걸리는 작업을 말합니다. 이러한 작업들은 결과를 기다리지 않고 다음 코드가 실행되기 때문에, 작업이 완료되기 전에 결과를 다루는 것이 어려웠습니다.

Promise는 비동기 작업을 좀 더 쉽고 가독성 있게 다룰 수 있도록 도와줍니다. Promise는 세 가지 상태를 가질 수 있습니다:

1. Pending(대기 중): 비동기 작업이 진행 중인 상태입니다.
2. Fulfilled(이행됨): 비동기 작업이 성공적으로 완료되었고 결과 값이 존재하는 상태입니다.
3. Rejected(거부됨): 비동기 작업이 실패하거나 오류가 발생한 상태입니다.

## Promise의 사용 방법:

```javascript
const myPromise = new Promise((resolve, reject) => {
  // 비동기 작업 수행
  // 성공적으로 작업이 완료되면 resolve(value) 호출
  // 작업이 실패하면 reject(error) 호출
});
```

## Promise 체이닝: 비동기 작업 순차적으로 실행하기

Promise는 여러 개를 체이닝하여 순차적으로 비동기 작업을 수행할 수 있습니다. 예를 들어, 첫 번째 작업이 완료된 후에 두 번째 작업을 수행하고, 두 번째 작업이 완료된 후에 세 번째 작업을 수행하는 등의 작업을 순차적으로 연결할 수 있습니다.

```javascript
asyncTask1()
  .then(result1 => {
    // 첫 번째 작업 성공적으로 완료
    return asyncTask2(result1);
  })
  .then(result2 => {
    // 두 번째 작업 성공적으로 완료
    return asyncTask3(result2);
  })
  .then(result3 => {
    // 세 번째 작업 성공적으로 완료
    console.log("최종 결과:", result3);
  })
  .catch(error => {
    // 에러 처리
    console.error("오류 발생:", error);
  });
```

## Promise.all과 Promise.race: 여러 개의 Promise 동시에 실행하기

Promise.all은 여러 개의 Promise를 동시에 실행하고 모든 Promise가 이행될 때까지 기다렸다가 결과를 배열로 반환합니다. 만약 하나라도 거부(rejected)된 Promise가 있다면, Promise.all은 첫 번째 거절된 Promise의 에러를 반환합니다.

```javascript
const promises = [asyncTask1(), asyncTask2(), asyncTask3()];
Promise.all(promises)
  .then(results => {
    console.log("모든 작업 완료:", results);
  })
  .catch(error => {
    console.error("오류 발생:", error);
  });
```

Promise.race는 여러 개의 Promise를 동시에 실행하고 가장 먼저 이행(resolve)된 Promise의 결과를 반환합니다.

```javascript
const promises = [asyncTask1(), asyncTask2(), asyncTask3()];
Promise.race(promises)
  .then(result => {
    console.log("가장 빠른 작업 결과:", result);
  })
  .catch(error => {
    console.error("오류 발생:", error);
  });
```

## Async/Await: Promise를 더욱 간결하게 사용하기

ES2017에서 도입된 Async/Await은 비동기 작업을 더욱 간결하고 동기적으로 코드를 작성할 수 있도록 해줍니다.

```javascript
async function fetchData() {
  try {
    const data1 = await asyncTask1();
    const data2 = await asyncTask2(data1);
    const data3 = await asyncTask3(data2);
    console.log("최종 결과:", data3);
  } catch (error) {
    console.error("오류 발생:", error);
  }
}
```

## 마무리

이제 Promise에 대해 기본부터 고급 활용까지 다뤄보았습니다. Promise를 이용하면 비동기 작업을 더욱 효율적이고 가독성 좋게 처리할 수 있습니다. 또한, Async/Await을 함께 사용하면 더욱 간결한 코드를 작성할 수 있습니다. Promise와 Async/Await을 마음껏 활용하여 JavaScript 비동기 작업을 자유자재로 다루시기 바랍니다. Happy coding!