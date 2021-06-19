---
layout: post
title: 테스트 위생(test hygiene), 테스트를 깔끔하게 유지하는 방법
date: 2021-05-27 12:27:53
category: [test]
tags: [test]
---


테스트 위생이란? 테스트 대상 코드 베이스뿐 아니라 **<u>테스트 코드도 깔끔하게 유지하며</u>** 유지보수 하고 개선해야 함을 의미한다. 



## 1. 테스트 이름짓기 

- 테스트를 만들려면 먼저 이름을 정해야한다. 
- 테스트 이름을 지을 때는 가독성, 유지보수성, 실행할 수 있는 문서의 역할을 고려한다. 
- 테스트 이름은 개념이 아니라, 동작을 묘사해야 한다. 
- 안티패턴이 존재함
  - test1처럼 말도 안되는 테스트 이름은 최악의 안티패턴 
  - file, document 처럼 개념이나 명사로 테스트 이름을 결정하는 것도 안티패턴 
  - 메서드명을 그대로 사용하는 것도 안티패턴 
- 모범 규칙 
  - 도메인용어사용: 문제 도메인을 설명하거나 응용프로그램에서 문제를 지칭할때 사용하는 용어를 테스트 이름에 사용한다. 
  - 자연어 사용: 모든 테스트 이름은 일반 문장처럼 쉽게 읽을 수 있어야 한다. 
  - 서술적: 코드는 한 번 구현하면 여러 번 읽게 된다. 나중에 쉽게 읽을 수 있도록 애초에 시간을 들여 서술적인 좋은 이름을 붙이자. 



## 2. 구현이 아닌 동작

- 클래스, 컴포넌트, 시스템 테스트를 구현할 때는 대상의 공개 동작(public behavior)만 테스트한다.
- 테스트는 객체의 내부 상태나 설계는 고려하지 않고 오직 공개 API메서드만 이용해 테스트를 수행해야 한다.
  - 세부 구현에 의존한 테스트는 구현이 바뀌면 결과가 실패로 바뀐다.



## 3. 중복배제 

- 많은 개발자가 응요프로그램 코드에는 중복 코드를 사용하지 않으려 애쓰지만, 테스트 코드의 중복 코드는 크게 신경쓰지 않는다. 



## 4. 오류 상황 테스트 

테스트를 개발하면서 가장 흔히 저지르는 실수 중 하나는 응용프로그램의 가장 아름답고, 중요하며 잘 동작하도록 예상된 경로만 검증하는 것이다. 다음과 같이 file을 import 하는 시스템에서 오류처리 테스트 케이스 이다. 

```java
// junit4
@Test(expected = FilenotFoundException.class)
public void shouldNotImportMissingFile() throws Exception {
  system.importFile("sample.txt");
}

@Test(expected = UnknownFileTypeException.class)
public void shouldNotImportUnkownFile() throws Exception {
  system.importFile(RESOURCES + "unknown.txt");
}

// junit 5
void shouldNotImportMissingFile()throw Exception {
	Assertions.assertThrows(FilenotFoundException.class, 
                          ()->  system.importFile("sample.txt"));
}
```



## 5. 상수 

자바에서는 C++ 처럼 const키워드는 없지만 대신 static final 키워로 상수를 표현한다. 테스트에서는 프로그램을 어떻게 사용해야 하는지 예를 포함하므로 많은 상수를 사용한다. 

```java 
private static final String RESOURCES = "scr" + File.separator + "test" + File.separator + "resources" + File.separator; 
private static final String LETTER = RESOURCES + "patient.letter";
private static final String REPORTER = RESOURCES + "patient.reporter";
private static final String XRAY = RESOURCES + "xray.jpg";
```



## 6. Comment🤔

- 테스트 커버리지를 100%를 만드는 것보다는, 의미있는 테스트와 문서로써의 역할을 하는 테스트 케이스를 만드는 것이 좋다고 생각함 
- 프로젝트를 시작할때 소스에 대한 구현 방법을 토의하지만 어떻게 테스트할지에 대해서는 구체적인 논의가 부족한듯. 이름을 어떻게 짓고,  Test suite는 어떻게 구성하고 등등 생각해볼것들이 많은것 같다.


> 출처: http://www.yes24.com/Product/goods/42773957