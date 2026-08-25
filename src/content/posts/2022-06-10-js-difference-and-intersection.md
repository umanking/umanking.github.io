---
title: 'Javascript 차집합, 교집합, 배타논리적 합'
description: 'Javascript 차집합, 교집합, 배타논리적 합'
date: '2022-06-10T15:37:00+09:00'
permalink: /2022/06/10/js-difference-and-intersection/
section: web
hub: javascript
type: reference
level: 중급
tags:
  - javascript
image: '/images/posts/2e370a2c5aa3.png'
---
## Javascript 차집합, 교집합, 배타논리적 합
filter와 includes 함수를 이용해서 차집합, 교집합, 배타논리적 합을 구해보자! 

## 차집합

<img src="/images/posts/fed336021748.png" alt="img" style="zoom:50%;" />

A-B = B를 제외한 A만 남겨야 함

```js
const arr1 = [1,2,3]
const arr2 = [3,4,5]

const result = arr1.filter(x => !arr2.includes(x)) //[1,2]
```



## 교집합 

A와 B의 공통 부분만 남김 

```js
const arr1 = [1,2,3]
const arr2 = [3,4,5]

const result = arr1.filter(x => arr2.includes(x)) //[3]
```



## 배타 논리적 합

```js
const arr1 = [1,2,3]
const arr2 = [3,4,5]

const result = arr1
.filter(x => !arr2.includes(x))
.concat(arr2.filter(x => !arr1.includes(x))); // [1,2,4,5]
```

배타 논리적 합의 접근 방법은 `A-B의 차집합`  concat `B-A의 차집합` 으로 이루어진다. 
