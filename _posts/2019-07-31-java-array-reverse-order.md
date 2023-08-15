---
layout: post
title: "다양한 예제로 알아보는 자바(Java) 역순 정렬"
date: 2019-07-31 12:28:33
categories: [java]
tags: [java]
image: '/images/java.png'
---

# 다양한 예제로 알아보는 자바(Java) 역순 정렬

_자바(Java)의 역순 정렬을 다양한 예제를 통해 살펴보겠습니다. 각 예제를 통해 역순 정렬의 활용 방법을 자세히 알아보고 실제 코드로 확인해보세요._

## 목차

1. 숫자 배열 역순 정렬
2. 문자열 리스트 역순 정렬
3. 사용자 정의 객체 역순 정렬
4. 역순 정렬 시 주의사항

## 1. 숫자 배열 역순 정렬

```java
import java.util.Arrays;
import java.util.Collections;

public class ReverseOrderExample {

    public static void main(String[] args) {
        Integer[] numbers = {5, 2, 8, 1, 9, 3, 6};

        Arrays.sort(numbers, Collections.reverseOrder());

        System.out.println("역순 정렬된 숫자 배열: " + Arrays.toString(numbers));
    }
}
```

## 2. 문자열 리스트 역순 정렬

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ReverseOrderExample {

    public static void main(String[] args) {
        List<String> words = new ArrayList<>();
        words.add("apple");
        words.add("banana");
        words.add("cherry");
        words.add("grape");
        words.add("orange");

        Collections.sort(words, Collections.reverseOrder());

        System.out.println("역순 정렬된 문자열 리스트: " + words);
    }
}
```

## 3. 사용자 정의 객체 역순 정렬

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Student implements Comparable<Student> {
    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public int compareTo(Student other) {
        return Integer.compare(other.age, this.age);
    }

    @Override
    public String toString() {
        return name + " (" + age + "세)";
    }

    public static void main(String[] args) {
        List<Student> students = new ArrayList<>();
        students.add(new Student("철수", 25));
        students.add(new Student("영희", 22));
        students.add(new Student("민수", 27));

        Collections.sort(students);

        System.out.println("나이 역순 정렬된 학생 리스트: " + students);
    }
}
```

## 4. 역순 정렬 시 주의사항

- 역순 정렬을 사용할 때는 데이터의 타입에 맞는 비교 기준을 제공해야 합니다.
- 사용자 정의 객체의 경우 Comparable 인터페이스를 구현하여 비교 메서드를 재정의해야 합니다.

이제 다양한 예제를 통해 자바의 역순 정렬을 익혀보았습니다. 각 예제를 실행해보고 데이터를 역순으로 처리하는 방법을 익혀보세요! 
