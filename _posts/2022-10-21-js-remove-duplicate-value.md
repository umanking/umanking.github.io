---
layout: post
title: Javascript 에서 array 중복을 제거하는 방법
date: 2022-10-21 18:30 +0900
description: javascript 에서 array 중복을 제거하는 방법(remove duplicate value javascript)
image: 
tags: [js]
---

# Javascript 에서 array 중복을 제거하는 방법
다음과 같이 크게 4가지 방법이 존재한다. 
- Set 함수를 이용
- lodash 라이브러리를 이용
- filter, indexOf를 이용
- reduce를 이용



## 1. Set를 이용

다음과 같은 중복된 데이터가 존재할때 
```js
const array = ['a' , 1, 2, 'a' , 'a', 3];
```


```js
const result = [...new Set(array)]
```
- Set은 자료구조가 unique한 값만 저장하는 객체이기때문에
- Set 의 생성자에 해당 배열을 넘기고, Set 객체를 구조분해할당(…)를 통해서 새로운 배열에 담았다.

## 2. lodash 라이브러리 이용방법

```js
# lodash 이용
const result = [_.unique(array)]
```

## 3. filter와 indexOf를 이용한 방법

```js
const result = array.filter((item, index) => array.indexOf(item) === index);
```

- filter
    - 첫번째 인자는 해당 item
    - 두번째 인자는 해당 iterator의 index값
- indexOf(item) 은 item의 첫번째 인덱스를 리턴합니다.
- 해당 item의 첫번째 index 와 현재 인덱스가 같은 경우만 리턴합니다.

## 4. reduce를 이용한 방법

```js
const result = array.reduce((prev, item) => prev.includes(item) ? prev : [...prev, item], []);
```

- reducer 함수
    - prev: 이전까지 만들어진 데이터
    - item: 현재의 item값
- 초기값: 빈배열
- prev.includes(item) 조건을 통해서, 이전까지 만들어진 prev에 현재의 item이 있다면 → prev를 리턴
- 없다면 […prev, item] 새로운 item을 추가합니다.
- 그렇게해서 반복!

## 5. 결론

- 근데 속도가 Set를 이용한게 가장 빠르다고 한다! Set를 이용하자!
- filter랑 reduce는 매번 iteration을 돌면서 판단을 하기 때문이지 않을까?
