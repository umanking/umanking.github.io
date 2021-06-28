---
layout: post
title: "Java - 파일 입출력(BufferedWriter, BufferedReader, Files)"
date: 2021-06-25 17:13 +0900
tags: [java]
image: '/images/java.png'
---

Java에서 Directory를 만들고, 간단한 파일 쓰기, 읽기를 알아본다. 

## 1. 디렉토리 만들기

```java
File directory = new File("test/test");
if (!directory.exists()) {
    boolean mkdirs = directory.mkdirs();
    log.info("mkdirs = {}", mkdirs);
} else {
    log.info("Already exist directory");
}
```

- mkdir() : 현재 폴더를 생성 
- mkdirs(): 폴더 계층상 존재하지 않는 상위 부모 폴더까지 생성해줌



## 2. 파일 쓰기(BufferedWriter)

```java
File file = new File("example.txt");
BufferedWriter bufferedWriter = new BufferedWriter(new FileWriter(file));
bufferedWriter.write("hello\nworld");
bufferedWriter.flush();
bufferedWriter.close();
```

- 여기에서 주의할 것이, File 생성자의 값으로 특정경로를 포함하는 파일명을 넘겼을 때, 해당 디렉토리가 존재하지 않으면 `java.io.FileNotFoundException` 을 발생한다. 
- FileWriter(File file, boolean append) 2번째 인자로 true값을 주면, 해당 File값에 append로 계속해서 데이터를 추가할 수 있다. 2번째 인자를 넘기지 않으면 새로운 파일을 만든다.



## 3. 파일 읽기 (BufferedReader)

```java
File file = new File("example.txt");
BufferedReader bufferedReader = new BufferedReader(new FileReader(file));
String data = bufferedReader.lines().collect(Collectors.joining("\n"));
```



## 4. 파일 읽기 Files (Java NIO)

### 4.1. Files.readAllLines(작은 파일을 읽을 때) - JDK1.7

```java
Path path = Paths.get("example.txt");
// jdk 1.7, java nio pacakge
// Files.readAllLines  (small file)
List<String> list = Files.readAllLines(path);
String collect = list.stream().collect(Collectors.joining(System.lineSeparator()));
System.out.println(collect);
```



### 4.2. Files.newBufferedReader(큰 파일을 읽을 때) - JDK1.7

```java
// Files.newBufferedReader (large file)
BufferedReader bufferedReader = Files.newBufferedReader(path);
StringBuilder builder = new StringBuilder();
String line = bufferedReader.readLine();
while (line != null) {
  builder.append(line);
  builder.append(System.lineSeparator());
  line = bufferedReader.readLine();
}
String result = builder.toString();
```



### 4.3. Files.lines() - JDK1.8

```java
String result = Files.lines(path)
  .collect(Collectors.joining(System.lineSeparator()));
```

- lines메서드는 파일의 모든 라인들을 읽어서 ->  Stream<String> 으로 리턴한다.

## 참조 
- https://www.baeldung.com/reading-file-in-java