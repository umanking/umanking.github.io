---
layout: post
title: Javascript - 문자열 자르기(split, substr, substring, slice)
date: 2022-07-17 14:32 +0900
toc: true
tags:
- Javascript
categories:
- Javascript
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
description: Javascript - 문자열 자르기(split, substr, substring, slice)
---

Javascript 문자열 자르기는 `split()`, `substr()`, `substring()`, `slice()`를 사용할 수 있습니다.
각 함수들이 어떻게 사용되는지 알아보도록 하겠습니다.

1. [1. split(): 구분자(seperator)로 문자열 분리하여 배열로 리턴](#1-split-구분자seperator로-문자열-분리하여-배열로-리턴)
   1. [1.1. 구분자로만 인자 전달한 경우](#11-구분자로만-인자-전달한-경우)
   2. [1.2. 구분자와 limit을 전달한 경우](#12-구분자와-limit을-전달한-경우)
   3. [1.3. 구분자와 limit을 전달하지 않는 경우](#13-구분자와-limit을-전달하지-않는-경우)
2. [2. substr(): 특정 index에서 원하는 길이만큼 잘라서 문자열로 리턴](#2-substr-특정-index에서-원하는-길이만큼-잘라서-문자열로-리턴)
   1. [2.1. start가 음수일때](#21-start가-음수일때)
3. [3. substring(): 시작 index에서 끝 index전까지 문자열 잘라서 리턴](#3-substring-시작-index에서-끝-index전까지-문자열-잘라서-리턴)
4. [4. slice(): substring과 비슷하지만 살짝 다른 메서드](#4-slice-substring과-비슷하지만-살짝-다른-메서드)

## 1. split(): 구분자(seperator)로 문자열 분리하여 배열로 리턴

문법은 아래와 같습니다. `sperator(구분자)`와, 분리할 `문자열의 개수 limit`을 인자로 받습니다. limit은 optional한 값입니다.

```js
str.split([separator[, limit]])
```



### 1.1. 구분자로만 인자 전달한 경우

```js
const string = 'hello, world, javascript';
console.log(string.split(','));
```



output:

```js
['hello', 'world', 'javascript']
```



### 1.2. 구분자와 limit을 전달한 경우

limit은 구분자로 분리할 문자열의 개수를 나타낸다. 0을 전달하면 빈배열을 리턴하며, 1을 전달하면 구분자로 1개의 문자열만 잘라서 배열을 리턴한다.

```js
const string = 'hello, world, javascript';
console.log(string.split(',', 0));
console.log(string.split(',', 1));
console.log(string.split(',', 2));
console.log(string.split(',', 3));
```



output: 

```js
[],
['hello',]
['hello', 'world']
['hello', 'world', 'javascript']
```



### 1.3. 구분자와 limit을 전달하지 않는 경우

아무

```js
const string = 'hello, world, javascript';
console.log(string.split());
```

output:

```js
['hello', 'world', 'javascript']
```





## 2. substr(): 특정 index에서 원하는 길이만큼 잘라서 문자열로 리턴

문법은 다음과 같고, start는 index이고, length길이만큼 잘라서 문자열로 리턴합니다.

```
str.substr(start[, length])
```

substr(5)이면 start 인덱스 부터 문자열의 마지막까지 잘라서 리턴합니다. 



```js
let str = 'HelloWorldJavascript';

let a = str.substr(5);
let b = str.substr(0, 5);
let c = str.substr(0, 10);

console.log(a);
console.log(b);
console.log(c);
```

output: 

```js
WorldJavascript //5번째 인덱스 부터 문자열 마지막까지
Hello //0번째 인덱스 부터, 길이 5만큼
HelloWorld // 0번째 인덱스 부터, 길이 10만큼
```



### 2.1. start가 음수일때

start 인덱스가 음수이면, 뒤에서 부터 숫자를 셉니다. 아래 예제에서 -6인덱스는 뒤에서 부터 -6인 인덱스고, 15 인덱스가 됩니다.

```js
let str = 'HelloWorldJavascript';

let a = str.substr(-6);
let b = str.substr(-6, 3);
let c = str.substr(-6, 5);

console.log(a);
console.log(b);
console.log(c);
```



Output: 

```
script
scr
scrip
```



## 3. substring(): 시작 index에서 끝 index전까지 문자열 잘라서 리턴

start 는 inclusive(포함), end는exclusive (미포함)입니다. 예를 들어 `str.substring(0,4)` 이면 0번째 인덱스 부터 4번째는 포함되지 않는 인덱스 까지 즉, 0~3까지의 문자열을 잘라서 리턴합니다( 인덱스4는 포함하지 않으므로)

```text
str.substring(start, end)
```



```js
let str = 'Hello World Javascript';

let a = str.substring(6); //6번째 인덱스 부터 끝까지
let b = str.substring(6, 8); //6번째 인덱스 부터 7번째 까지

console.log(a);
console.log(b);
```



Output: 

```
World Javascript
Wo
```





## 4. slice(): substring과 비슷하지만 살짝 다른 메서드

substring과 문법이 똑같습니다.

```
arr.slice([begin[, end]])
```



하지만 차이점은 인자로 음수가 전달되었을 때, `substring()`은 빈 문자열을 리턴합니다. 하지만 slice()는 음수 Index를 적용하여 문자열을 자릅니다.

```js
let str = 'Hello World Javascript';

let a = str.substring(0, -6);
let b = str.slice(0, -6);

console.log(a);
console.log(b);
```

Output: 

```
 //빈문자열 리턴함
Hello World Java //뒤에서부터 -6 인덱스 적용
```

