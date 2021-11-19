---
layout: post
title: "[알고리즘] 프로그래머스 - 기능개발(스택/큐)"
date: 2021-08-22 12:52 +0900
toc: true
tags: [algorithm]
categories: [algorithm]
image: 'https://programmers.co.kr/assets/img-meta-programmers-e00862a7c9acd8ef5164f8c85b3ab0127d083ab59b3a98d7219690bd3570bf35.png'
description: 
sitemap: true
published: true
---

문제: [https://programmers.co.kr/learn/courses/30/lessons/42586](https://programmers.co.kr/learn/courses/30/lessons/42586)


## 1. 방법

1. progresses 파라미터와 speeds 파라미터를 통해서, 각 작업 일수를 구하는 것. 

2. 위에서 구한 작업 일수를 통해서, 몇개의 기능이 배포되는지 구하기

```java
public static void main(String[] args) {
        System.out.println(Arrays.toString(
                solution(new int[]{93, 30, 55}, new int[]{1, 30, 5})));
    }

public static int[] solution(int[] progresses, int[] speeds) {
        Queue<Integer> q = new LinkedList<>();
        List<Integer> result = new ArrayList<>();

        for (int i = 0; i < progresses.length; i++) {
            // 1. 작업 일수를 구하는 부분 (7,3,9일이 나옴)
            int days = 1;
            while (progresses[i] + (speeds[i] * days) < 100) {
                days++;
            }

            // 2. 큐를 이용해서, 다음 날짜와 비교해서, 큐에 담고, 사이즈 만큼 결과를 만든다. 
            if (!q.isEmpty() && q.peek() < days) {
                result.add(q.size());
                q.clear();
            }
            q.offer(days);
        }

        result.add(q.size());


        // 3. 변환(List > Array)
        int[] array = new int[result.size()];
        for (int i = 0; i < result.size(); i++) {
            array[i] = result.get(i);
        }

        return array;
    }
```



1. 작업일수를 구하는 부분은 작업일수 남은 부분만큼 while문의 조건식을 이용해서, days를 구한다. 
2. 큐를 이용하는 이유는, 가장 먼저 넣은 값을 peek해서 비교해야 하기 때문에
   1. 초기에 큐가 비어있으니까, q.offer(7)값을 넣는다. 
   2. 두번째 루프에서 큐가 비어있지 않고, q.peek() 에서 나온값 7 과 days 3 값보다 작지 않기 때문에, if문을 타지 않고 q에 또 offer(3)을 한다. ..... 여기까지 q에 [7,3]이 2개가 들어가 있다. 
   3. 세번째 루프에서 큐는 비어있지 않고, q.peek()을 해서 나온값 7과 days 9값과 비교해서, if문의 true이기 때문에 result에 현재 큐의 사이즈 2 값을 넣고, 큐를 비운다. 
   4. 그리고 큐에 들어간 9, 단 한개의 값을 result에 담아넣는다. ....... 여기까지 result는 [2,1]이 들어왔다. 
3. 마지막으로 List<Integer> 를 int[] 로 변환하는 부분이다. 





## 2. 정리

- Queue를 만들고, peek(), isEmpty(), clear() 같은 메서드를 활용해서 결과값을 만들어 낼 수 있는지를 확인한다.