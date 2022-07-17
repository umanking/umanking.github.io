---
layout: post
title: Javascript - 배열 합치기(concat, spread 연산자, push)
date: 2022-07-17 15:04 +0900
description: Javascript - 배열 합치기(concat, spread 연산자, push)
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
tags:
- Javascript
categories:
- Javascript
---




# Javascript - 배열 합치기(concat, spread 연산자, push)

Javascript에서 2개 이상의 배열을 하나의 배열로 만드는 방법에 대해서 알아보겠습니다. 

1. [1. concat()을 이용한 배열 합치기](#1-concat을-이용한-배열-합치기)
2. [2. Spread 연산자를 이용한 배열 합치기](#2-spread-연산자를-이용한-배열-합치기)
3. [3. push()를 이용한 배열 합치기](#3-push를-이용한-배열-합치기)



## 1. concat()을 이용한 배열 합치기

문법은 다음과 같습니다. 인자로 계속해서 배열을 넘겨서 합칠 수 있습니다. 

```
array.concat([value1[, value2[, ...[, valueN]]]])
```

```js
const arr1 = ['a', 'b', 'c'];
const arr2 = ['1', '2', '3'];
const arr3 = arr1.concat(arr2);
console.log(arr3);
```

output: 

```
['a', 'b', 'c', '1', '2', '3']
```



## 2. Spread 연산자를 이용한 배열 합치기

Spread 연산자는 `...` 와 같이 배열의 요소들을 나열하는 전개 연산자 입니다.

```js
const arr1 = ['a', 'b', 'c'];
const arr2 = ['1', '2', '3'];
const arr3 = [...arr1, arr2]
console.log(arr3);
```



output: 

```
['a', 'b', 'c', '1', '2', '3']
```



## 3. push()를 이용한 배열 합치기

새로운 배열을 만들고, 거거에 spread 연산자를 이용해서 해당 배열에 push(담아줍니다)

```js
const arr1 = ['a', 'b', 'c'];
const arr2 = ['1', '2', '3'];
const arr3 = [];
arr3.push(...arr1);
arr3.push(...arr2); 

console.log(arr3);
```

output: 

```
['a', 'b', 'c', '1', '2', '3']
```



만약에 spread 연산자를 사용하지 않고, 바로 push()를 하게 되면 다음과 같이 배열안에 배열이 중첩된 구조로 들어가게 됩니다. 주의하세요‼️

```js
const arr1 = ['a', 'b', 'c'];
const arr2 = ['1', '2', '3'];
const arr3 = [];
arr3.push(arr1);
arr3.push(arr2); 

console.log(arr3);
```

output: 

```
[ [ 'a', 'b', 'c' ], [ '1', '2', '3' ]]
```

