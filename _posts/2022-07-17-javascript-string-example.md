---
layout: post
title: Javascript - 문자열 포함여부 (indexOf, includes, startsWith, endsWith)
date: 2022-07-17 14:52 +0900
toc: true
tags:
- Javascript
categories:
- Javascript
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
description: Javascript - 문자열 포함여부 (indexOf, includes, startsWith, endsWith)
---
# Javascript - 문자열 포함여부 (indexOf, includes, startsWith, endsWith)

  - [1. String.indexOf(): 문자열에 어떤 문자열이 포함되어있는지 확인](#1-stringindexof-문자열에-어떤-문자열이-포함되어있는지-확인)
  - [2. String.includes(): 문자열에 어떤 문자열이 포함되어 있는지 확인](#2-stringincludes-문자열에-어떤-문자열이-포함되어-있는지-확인)
  - [3. String.startsWith(), String.endsWith(): 문자열이 어떤 문자열로 시작하거나 끝나는지 확인](#3-stringstartswith-stringendswith-문자열이-어떤-문자열로-시작하거나-끝나는지-확인)

자바스크립트에서 문자열이 포함되어있는지 확인하는 경우에 indexOf(), includes(), startWith(), endsWith()와 같은 메서드를 사용합니다. 



## 1. String.indexOf(): 문자열에 어떤 문자열이 포함되어있는지 확인

인자로 전달된 문자열이 존재한다면 그 문자열이 위치한 index를 리턴합니다. 존재하지 않는다면 -1를 리턴합니다. -1을 통해서 해당 문자열이 존재하는 지 않하는지 판단할 수 있습니다. 

```js
const str = 'Hello, World, Javascript';

if (str.indexOf('Hello') != -1) {
  console.log("exist Hello");
} else {
  console.log("not exist Hello");
}
```



Output:

```
exist Hello
```





## 2. String.includes(): 문자열에 어떤 문자열이 포함되어 있는지 확인

인자로 전달된 문자열이 문자열 안에 존재한다면 true가 리턴, 존재하지 않는다면 false를 리턴합니다.

```js
const str = 'Hello, World, Javascript';

if (str.includes('Hello')) {
  console.log("exist Hello");
} else {
  console.log("not exist Hello");
}
```



Output: 

```
exist Hello
```



## 3. String.startsWith(), String.endsWith(): 문자열이 어떤 문자열로 시작하거나 끝나는지 확인

startsWith()는 인자로 전달된 문자열로 시작할 때만 true를 리턴합니다. 그리고 반대로 endWith()는 인자로 전달된 문자열로 끝날때만 true를 리턴합니다. 

중간에 시작하는 문자열은 해당사항이 없습니다. 반드시 시작할때, 그리고 끝날때만 적용됩니다. 

```js
const str = 'Hello, World, Javascript';

console.log(str.startsWith('Hello'));     // true
console.log(str.startsWith('World'));     // false

console.log(str.endsWith('Javascript'));  // true
console.log(str.startsWith('World'));     // false
```

