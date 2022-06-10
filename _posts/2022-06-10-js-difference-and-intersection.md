---
layout: post
title: Javascript 차집합, 교집합, 배타논리적 합
date: 2022-06-10 15:37 +0900
toc: true
tags: [js]
categories: [js]
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
description: Javascript 차집합, 교집합, 배타논리적 합
---
## Javascript 차집합, 교집합, 배타논리적 합
filter와 includes 함수를 이용해서 차집합, 교집합, 배타논리적 합을 구해보자! 

## 차집합

<img src="https://blog.kakaocdn.net/dn/b64VoL/btqwoobCkJx/Tc6xTLCoKpVk8rJkKZVn5K/img.png" alt="img" style="zoom:50%;" />

A-B = B를 제외한 A만 남겨야 함

```js
const arr1 = [1,2,3]
const arr2 = [3,4,5]

const result = arr1.filter(x => !arr2.includes(x)) //[1,2]
```



## 교집합 

<img src="https://blog.kakaocdn.net/dn/tmyaI/btqzx8j8ZFa/VK1XTAz4t4TqeqAR4dcKK0/img.png" alt="img" style="zoom:20%;" />

A와 B의 공통 부분만 남김 

```js
const arr1 = [1,2,3]
const arr2 = [3,4,5]

const result = arr1.filter(x => arr2.includes(x)) //[3]
```



## 배타 논리적 합

![img](https://blog.kakaocdn.net/dn/bwlEK4/btqzxMhkkoN/k3zoGk2GkOMLjrvp0FFHo0/img.png)

```js
const arr1 = [1,2,3]
const arr2 = [3,4,5]

const result = arr1
.filter(x => !arr2.includes(x))
.concat(arr2.filter(x => !arr1.includes(x))); // [1,2,4,5]
```

배타 논리적 합의 접근 방법은 `A-B의 차집합`  concat `B-A의 차집합` 으로 이루어진다. 
