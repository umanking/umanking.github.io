---
layout: post
title: Javascript Array to Object (ft, reduce)
date: 2022-05-05 09:49 +0900
toc: true
tags: [js]
categories: [js]
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
description: javascript array to object reduce를 사용해서 배열을 객체로 변환하는 방법
---



## 예시

다음과 같이 객체를 담은 배열이 존재한다.

```javascript
const items = [
  {id: 1, color: 'red'},
  {id: 2, color: 'blue'},
  {id: 3, color: 'red'}
]
```



다음과 같이 color를 key값을 갖는 객체로 만들어 보자. 

```javascript
{
  'red': [{id:1, color: 'red'}, {id:3, color: 'red'}]
  'blue': [{id:2, color: 'blue'}]
}
```



reduce를 사용해서 객체로 변환해 보자. 

```javascript
items.reduce((acc, item)=> {
  const {color}= item
  return {...acc, [color]: [...(acc[color] || []), item]}
}, {}) // 초기값을 빈객체로 reduce의 2번째 인자로 넘김
```



## 조금더 뜯어서 살펴보자

mdn에서 reduce를 살펴보자

**mdn정의에 따르면 reduce는 리듀서(reducer)함수를 실행하고, 하나의 결과값을 반환한다.** 

```
arr.reduce(callback[, initialValue])
```

첫번째 인자로 콜백을 받고, 2번째 인자에 초기값을 넘긴다. 

콜백은 4개의 인자를 받는다. 

1. 누산기 (acc)
2. 현재 값 (cur)
3. 현재 인덱스 (idx) (optional)
4. 원본 배열 (src) (optional)



다시 우리가 작성한 코드를 살펴보자, reduce안에 첫번째 인자로 넘긴 리듀서(reducer)를 살펴보자 

```javascript
(acc, item)=> {
  const {color}= item
  return {...acc, [color]: [...(acc[color] || []), item]}
}
```

앞에서 콜백의 4개의 인자중에 첫번째 누산기(acc), 두번째 현재값(item)

그리고 하나의 결과값을 만들어야 하기 때문에, return 를 한다. 

return 문을 조금더 살펴보자. 

```javascript
  return {...acc, [color]: [...(acc[color] || []), item]}
```

acc 누산기는 계속해서 이전에 누적된 값이다. 

그렇기 때문에, 기존 객체에 합쳐야 하기 때문에 ...spread 연산자를 사용해서, 이전의 결과값(acc)를 풀었다. 

그 다음은, 원래 우리가 할려고 했던 key: value 형태의 쌍을 구성하기 위한 작업이다. 

key를 구성할때 []안에 담아야지 key로 인식한다. 

그 다음에 value는 배열의 형태로 담겨야 하고, 기존의 acc에서 key값으로 찾는다.  `acc[color]`  값이 없다면 빈배열을 할당한다. 

역시나 value도 ...spread 연산자를 통해서 기존의 값들을 넣는다, 그리고 ,다음은 현재의 item 객체를 넣는다.

이런식으로 구성이 된다. 



reduce라는 사용방법과 spread 연산자, key값으로 지정하는 방법, || operator 등등

여러가지 개념이 혼재되어 있어서, 처음에 이해하지 못했다. 하지만 하나씩 뜯어서 살펴보면 어렵지 않다.

그리고 앞으로 비슷한 일들이 있을때, 사용하면 유용할것 같다. 



