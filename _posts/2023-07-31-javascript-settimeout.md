---
layout: post
title: Javascript setTimeout 예제
date: 2023-07-31 14:34 +0900
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
tags: [js, settimeout]
---
`setTimeout()` 함수는 JavaScript에서 비동기적으로 특정 작업을 일정 시간 후에 실행하기 위해 사용되는 함수입니다. `setTimeout()` 함수를 사용하여 일정 시간이 지난 후에 지정된 작업을 실행하거나 함수를 호출할 수 있습니다.

## setTimeout() 함수의 구문은 다음과 같습니다:

```javascript
setTimeout(function, delay, arg1, arg2, ...);
```

- `function`: 실행할 함수 또는 코드 블록을 지정합니다.
- `delay`: 함수를 실행하기 전에 대기할 시간(밀리초)을 지정합니다.
- `arg1`, `arg2`, ...: 선택적으로 전달할 함수에 대한 인수(argument)들을 지정할 수 있습니다. (생략 가능)

## 예시를 살펴봅시다:

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

console.log("Start");
setTimeout(greet, 2000, "John"); // 2초(2000밀리초) 후에 greet 함수 실행
console.log("End");
```

위의 예시에서 `setTimeout()` 함수를 사용하여 `greet()` 함수를 2초 후에 호출합니다. 실행 결과는 다음과 같습니다:

```
Start
End
Hello, John!
```

`setTimeout()` 함수는 비동기적으로 작동하기 때문에 "Start"와 "End"가 먼저 출력되고, 2초 후에 "Hello, John!"이 출력됩니다.

또한, `setTimeout()` 함수를 변수에 할당하여 clearTimeout() 함수를 사용하여 타이머를 취소할 수도 있습니다. 이를 통해 특정 시간 이전에 실행되지 않도록 설정할 수 있습니다.

## 예시:

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

console.log("Start");

const timerId = setTimeout(greet, 2000, "John");

// 1초 후에 타이머 취소
setTimeout(() => {
  clearTimeout(timerId);
  console.log("Timer canceled!");
}, 1000);

console.log("End");
```

위의 예시에서는 "Start"와 "End"가 출력되고 1초 후에 타이머가 취소되어 "Timer canceled!"가 출력됩니다. 따라서 2초가 지나기 전에 `greet()` 함수는 실행되지 않습니다.