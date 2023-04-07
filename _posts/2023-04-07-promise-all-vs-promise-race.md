---
layout: post
title: "Promise.all과 Promise.race의 차이점"
date: 2023-04-07 17:03 +0900
description: "Promise.all과 Promise.race는 JavaScript에서 `Promise` 객체를 다룰 때 사용되는 두 가지 메소드로, 비동기 작업을 다루는 데에 유용합니다. 이 둘의 차이점은 다음과 같습니다"
image: 'https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png'
tags: [js, promise, async]
---



`Promise.all`과 `Promise.race`는 JavaScript에서 `Promise` 객체를 다룰 때 사용되는 두 가지 메소드로, 비동기 작업을 다루는 데에 유용합니다. 이 둘의 차이점은 다음과 같습니다:

1. 반환 값: `Promise.all`은 여러 개의 `Promise` 객체를 받아 모든 `Promise`가 성공적으로 완료될 때까지 기다린 다음, 그 결과를 배열 형태로 반환합니다. 이는 모든 비동기 작업이 모두 완료되어야만 최종 결과를 얻을 수 있을 때 유용하게 사용됩니다. 예를 들면, 여러 개의 API 요청이 모두 성공해야만 웹 페이지가 완전히 로딩되는 경우에 `Promise.all`을 사용할 수 있습니다.

```js
const promises = [
  fetch('https://api.example.com/data1'),
  fetch('https://api.example.com/data2'),
  fetch('https://api.example.com/data3')
];

Promise.all(promises)
  .then(results => {
    // 모든 비동기 작업이 완료된 후 결과를 처리
    console.log(results);
  })
  .catch(error => {
    // 하나라도 실패할 경우 에러 처리
    console.error(error);
  });
```

반면, `Promise.race` 메소드는 여러 개의 `Promise` 객체를 받아 가장 먼저 완료된 `Promise`의 결과를 반환합니다. 이는 여러 개의 비동기 작업 중에서 가장 빨리 결과를 얻고자 할 때 유용하게 사용됩니다. 예를 들면, 여러 개의 이미지를 동시에 로딩하고 가장 빨리 로딩된 이미지를 먼저 표시하고자 할 때 `Promise.race`를 사용할 수 있습니다.

```js
const promises = [
  fetch('https://api.example.com/image1'),
  fetch('https://api.example.com/image2'),
  fetch('https://api.example.com/image3')
];

Promise.race(promises)
  .then(result => {
    // 가장 먼저 완료된 비동기 작업의 결과를 처리
    console.log(result);
  })
  .catch(error => {
    // 첫 번째로 완료된 작업이 실패할 경우 에러 처리
    console.error(error);
  });
```

1. 처리 시점: `Promise.all`은 모든 `Promise`가 완료될 때까지 기다리므로, 모든 `Promise`가 성공 또는 실패할 때까지 시간이 걸릴 수 있습니다. 반면, `Promise.race`는 가장 빨리 완료된 `Promise`의 결과를 반환하므로, 가장 빠른 작업이 완료되면 즉시 결과를 얻을 수 있습니다.



요약하면, `Promise.all`은 모든 `Promise`가 완료될 때까지 기다려서 결과를 배열 형태로 반환하고, `Promise.race`는 가장 빨리 완료된 `Promise`의 결과를 반환합니다. 또한, `Promise.all`은 모든 `Promise`가 성공 또는 실패할 때까지 기다리므로 시간이 걸릴 수 있지만, `Promise.race`는 가장 빠른 작업이 완료되면 즉시 결과를 얻을 수 있습니다.

이처럼 `Promise.all`과 `Promise.race`는 비동기 작업을 다룰 때 다양한 상황에 따라 각각의 특성을 활용할 수 있습니다. 적절한 상황에 적절한 메소드를 선택하여 비동기 작업을 효과적으로 처리할 수 있도록 활용해보세요.
