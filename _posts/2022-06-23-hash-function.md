---
layout: post
title: 해시 함수와 해시 충돌(해결 방법)
date: 2022-06-23 12:34 +0900
toc: true
tags: [datastructure]
categories: []
image: https://images.velog.io/images/wupajw/post/4a7c55b1-fc4c-4479-af0e-e3d90d32ed0e/Untitled.png
description: 해시함수, 해시 충돌과 해시 충돌을 해결하는 방법인 open addresssing과 chaining에 대해서 알아보도록 하겠습니다.
---

오늘은 해시함수와 해시 충돌에 대해서 이야기하겠습니다. 개발하면서 해시라는 용어를 정말 많이 듣게되고, data structure 관련된 자료들을 보면서도 Hash가 참 많이 나오는데 이부분에 대해서 알아보도록 하겠습니다. 



## 해시 함수란? (Hash Function?)

wiki정의에 의하면 임의의 길이를 데이터로 매핑하는 함수 입니다. Hash 함수, Hash 알고리즘 등등 같은 용어로 불립니다. 원래 데이터의 값을 **키(Key)값**, 매핑후의 데이터의 값을 **해시값(hash value)**, 매핑하는 역할을 해싱한다**(hash function)** 라고 부릅니다. 



![img](https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Hash_table_4_1_1_0_0_1_0_LL.svg/240px-Hash_table_4_1_1_0_0_1_0_LL.svg.png)

hash function을 이야기할때 보통은 나머지(mod) 연산을 이야기 합니다.mod 연산은 나머지 연산인데. `key % 나머지연산 = 결과값`  의 식으로 완성됩니다. 결과값은 bucket에 들어간다고 생각하면 됩니다. 

어떤 숫자 배열 1~10까지 있는 경우에 나머지 연산 2를 하면 어떻게 될까요? 

1%2 = 1

2%2 = 0

3%2 = 1

4%2 = 0

... 

즉, 2라는 나머지 연산을 하게 되면, 결과값이 0또는 1 밖에 나오지 않습니다.

좋은 hash function이란? 데이터를 적절하게 분산하는게 목표입니다. 나머지 연산 2보다는 나머지 연산 10으로 하게되면 1...10까지 골고루 결과값을 얻게 됩니다. 하지만 아무리 잘 분산시키는 hash function을 짜더라도 결국에는 데이터가 같은 결과값이 나올 수 있습니다. 이를 해시함수 충돌(hash collision) 이라고 부르고 이를 해결하는 몇가지 방법에 대해서 알아보겠습니다.



## 해시 테이블 

![img](https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Hash_table_3_1_1_0_1_0_0_SP.svg/220px-Hash_table_3_1_1_0_1_0_0_SP.svg.png)

해시 충돌을 다루기 전에, 해시 테이블까지 간략하게 설명하고 넘어가겠습니다. 해시 테이블은 위으 hash function을 거쳐서 연산된 값(hash  값)을 키(key)값으로 하고, 그에 들어가는 데이터를 Value로 하는 테이블 형태를 만듭니다. 이게 바로 해시 테이블이라고 하고, 버킷 또는 슬롯이라고 표현합니다.

| key(hash value) | value(data) |
| --------------- | ----------- |
| 01              | 521-8976    |
| 02              | 521-1234    |
| ...             | ...         |

key-value 넵

key를 통해서 value값을 찾기 때문에 시간복잡도O(1) 입니다. INSERT하는 경우도 O(1) 입니다. 그래서 Java에서 Map의 구현체로 HashMap을 많이 쓰는 경우도 이 때문입니다. 



## 해시 충돌

### open addresssing

이름에서도 알 수 있듯이, 비어있는 버킷을 찾아값니다. 여기서도 여러가지 기법이 나옵니다. 비어있는 버킷을 어떻게 찾아갈래? 라는 질문에 답하기 위해서 다음과 같은 방법들이 나옵니다.

- Linear probing 
- Quadratic probing
- Dobule hashing 

리니어 프로빙을 살펴보면, 키값을 입력하고, hash function에 의해서 hash value값이 나왔습니다. 그 값을 key값으로 해시 테이블에 insert를 하려고 보니까, 이미 데이터가 있는 것입니다. 네 이 경우를 해시 충돌이라고 부른다고 했습니다. 이 경우에 리니어 프로빙은 다음 버킷이 비어있는지 하나씩 순차적으로 증가 하면서 빈 버킷을 찾는 행위를 합니다. 



![img](https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Hash_table_5_0_1_1_1_1_0_SP.svg/380px-Hash_table_5_0_1_1_1_1_0_SP.svg.png)

그림을 살펴보면, `John Smith`와 `Sandara Dee` 152번으로 동일한 값이 나옵니다. 이 경우에 다음 빈 버킷을 찾아서 153번으로 `Sandara Dee`가 들어간것을 확인 할 수 있습니다. 그러면 `Ted Baker` 이 친구도 153 에서 충돌이 발생해서 다음 빈 버킷인 154번으로 밀려났습니다. 당연히 가장 나이스한 경우는 바로 다음 버킷이 비어있는 경우고, 최악의 경우는 거의 끝까지 모든 버킷이 차있는 경우 입니다.



### chaining 

![img](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Hash_table_5_0_1_1_1_1_1_LL.svg/450px-Hash_table_5_0_1_1_1_1_1_LL.svg.png)

보통은 chaning 방식으로 해결을 많이 하는데, 이경우는 해시 충돌이 나면, 해당 버킷(노드)에 chaining 형태로 계속 뒤로 붙이는 경우입니다.   `John Smith`와 `Sandara Dee`가 152번에서 충돌이 났습니다. open addressing 기법과 다르게, 이 경우에는 `John Smith`의 체이닝형태로 뒤에 바로 `Sandara Dee`가 붙는 것을 확인할 수 있습니다.



## 마치며

오늘은 해시함수, 해시 테이블, 해시 충돌난 경우 해결하는 방법들에 대해서 알아보았습니다. 간략하게 개념적으로만 이렇다 정도로 봐주시면 될것 같습니다. 사실 이에 관해서는 더 깊은 내용이 있지만, 현업에서는 이정도의 개념만 익혀도 도움이 되는 것 같습니다. 끝까지 긴글 읽어주셔서 감사합니다. 

## 참고

- [https://en.wikipedia.org/wiki/Hash_table](https://en.wikipedia.org/wiki/Hash_table)
- [https://ratsgo.github.io/data%20structure&algorithm/2017/10/25/hash/](https://ratsgo.github.io/data%20structure&algorithm/2017/10/25/hash/)
- [https://ko.wikipedia.org/wiki/%ED%95%B4%EC%8B%9C_%ED%95%A8%EC%88%98](https://ko.wikipedia.org/wiki/%ED%95%B4%EC%8B%9C_%ED%95%A8%EC%88%98)
