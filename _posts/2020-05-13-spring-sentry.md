---
layout: post
title: 스프링에서 sentry 적용하기
date: 2020-05-13 08:47 +0900
 
categories: [spring]
tags: [spring]
---

스프링 부트 프로젝트 sentry 적용

- 계정 생성

  - project 생성시 platform JAVA, LogBack 선택
  - SDK setup 탭에서 DSN 정보가 중요!

- sentry.properties 파일 생성

  - DSN (client Key) 값 등등 입력한다.

- pom 파일에 sentry-logback 라이브러리 추가

  ```xml
  <dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry-logback</artifactId>
    <version>1.7.30</version>
  </dependency>
  ```

* logback.xml 파일 작성

  ```xml
  ...
  
  <!-- appender 2개 추가 -->
  <!-- 1. Console -->
  <appender name="Console" class="ch.qos.logback.core.ConsoleAppender">
  	<encoder>
  		<pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
  	</encoder>
  </appender>
  
  ...
  
  <!-- 2. Sentry -->
  <appender name="Sentry" class="io.sentry.logback.SentryAppender">
  <!-- WARN이상인 경우 추가하도록 필터링 설정 -->
  	<filter class="ch.qos.logback.classic.filter.ThresholdFilter">
  		<level>WARN</level>
  	</filter>
  <!-- 로그 형식 기본 : Optionally add an encoder -->
  	<encoder>
  		<pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
  	</encoder>
  </appender>
  
  ...
  
  <!-- INFO 이상의 로그는 아래 Appender를 통해 처리 되도록 -->
  <root level="INFO">
  	<appender-ref ref="STDOUT"/> <-- *기존 logback 코드임 -->
  	<appender-ref ref="Console" /> <-- *Sentry를 위한 코드임 -->
  	<appender-ref ref="Sentry" /> <-- *Sentry를 위한 코드임 -->
  </root>
  
  ...
  ```

하지만 다음과 같이 exception이 났다.

![](https://user-images.githubusercontent.com/28615416/81380162-5d299a80-9145-11ea-8e8a-be43c141ba5f.png)

해당 exception으로 찾아보니 현재 프로젝트는 스프링 부트 버전이 `1.5.x` 이었다. maven dependency를 확인해 보니 다음과 같다.

![](https://user-images.githubusercontent.com/28615416/81380278-92ce8380-9145-11ea-9077-3305ab78fc76.png)

spring boot starter 의존성을 관리하는 부분때문에 기존의 logback 버전이 1.1.9로 매핑이 되어있었다. 다음과 같이 .`1.2.3` 버전을 추가하고 실행하니까 잘 동작한다!

```xml
<dependency>
  <groupId>ch.qos.logback</groupId>
  <artifactId>logback-core</artifactId>
  <version>1.2.3</version>
</dependency>
<dependency>
  <groupId>ch.qos.logback</groupId>
  <artifactId>logback-classic</artifactId>
  <version>1.2.3</version>
</dependency>
```
