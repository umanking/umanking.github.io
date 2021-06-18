---
layout: post
title: "[Java] String, StringBuffer, StringBuilder 차이점"
date: 2020-09-06 17:40:48
categories: [java]
tags: [java]
---

Java에서는 문자열을 다루는데 String, StringBuffer,StringBuilder를 사용합니다. 각각 어떤 상황에서 사용해야 하는지 알아보도록 하겠습니다.

<!-- more -->
### String Pool? 

```java
public static void main(String[] args){
    String s1 = "Cat";
    String s2 = "Cat";
    String s3 = new String("Cat");
    
    System.out.println(s1==s2); // true
    System.out.println(s1==s3); // false
                    
}
```

첫번째는 String Pool에 존재하게 되고, 두번째 new 연산자를 사용하게 되면 String pool에 올라가지 않습니다.

그래서 동일성(identity) 비교에서 다음과 같은 결과를 나타냅니다. 



![Journal Dev 발췌](https://cdn.journaldev.com/wp-content/uploads/2012/11/String-Pool-Java1.png)

> 왜 String Pool을 사용할까? Connection Pool, Thread Pool, 모든 풀을 사용하는 이유는 당연히 재활용하기 위해서입니다.



### String 클래스의 intern메서드는? 

>  if the pool already contains a string equal to this `String` object as determined by the [`equals(Object)`](https://docs.oracle.com/javase/7/docs/api/java/lang/String.html#equals(java.lang.Object)) method, then the string from the pool is returned. Otherwise, this `String` object is added to the pool and a reference to this `String` object is returned.

만약에 String pool에 존재하면 pool에서 바로 return 하고, String pool에 존재하지 않으면 pool에 추가하고, String 객체의 참조값을 리턴합니다. 그렇기 때문에 위의 예제에서 `s1 == s3.intern()` 다음과 같이 하게되면 true값을 리턴합니다. 



### String은 Immutable 불변 객체 입니다. 

불변이라는 말은, 매번 새롭게 만든다. 즉, 한번 만들어진 객체는 수정할 수 없다 라는 뜻입니다. 즉 concat이나 + 오퍼레이션을 통해서 문자열을 합치거나 가공할때 마다 그때 마다 매번 새로운 String 객체를 만든다고 생각하면 됩니다. 새로운 메모리 공간을 할당하고, 예전에 사용하지 않는 String은 GC에 의해서 수거를 합니다. 

만약에 엄청난 수의 문자열을 조작한다고 생각해보십시요. 사용하지도 않는 힙 메모리 영역들을 차지하게 되고(나중에 GC에 의해 수거하더라도) 메모리 Leak이 발생할 수 있습니다. 그래서 자바에서는 StringBuffer, StringBuilder를 제공하고 있습니다.



## StringBuilder, StringBuffer 는 mutable 합니다.

StringBuffer, StringBuilder는 String과 다르게 `mutable` 한 객체입니다. append(), insert(), delete() and substring() 이런 메서드들을 통해서 메모리에서 새롭게 할당하는 것이 아닌, 가변적으로 메모리를 늘려나갑니다.



## StringBuffer vs  StringBuilder의 차이는 무엇일까요 ?

StringBuffer는 모든 public 메서드에 `syncronized` 키워드가 붙어있습니다. 말인 즉슨, Thread-safe하다는 말입니다. 동시에 Thread-safe하다는 말은 자원을 선점할때 Lock를 걸기 때문에 그만큼의 성능 효율이 매우 안 좋다는 것을 의미합니다. 그래서 1.4때까지는 StringBuffer를 사용했지만, 그 이후 버전에는 StringBuilder를 사용하는 것입니다. StringBuilder는 그에 반해 당연히 성능이 좋습니다.



## 정리

- String은 `imutable`클래스 StringBuffer, StringBuilder는 `mutable`클래스
- `StringBuffer`는 thread-safe 하지만 성능이 느리다.
- `StringBuilder`는 thread-safe 하지 않지만, 성능은 빠르다.
- 그래서 멀티스레드 환경이 아닌, 문자열 연산이 많은 경우에는 → StringBuilder를 사용한다.
- 문자열 연산이 많이 없고, 단순히 값들만을 가져오는 경우에는 → String Pool에서 가져오므로 String 사용한다.

