---
layout: post
title: Spring Sentry(에러 트래킹 서비스) 적용하기
date: 2020-05-13 08:47 +0900
image: 'https://pozafly.github.io/static/bf7a9491463863772f181d36c58051fa/7129a/sentry.png'
toc: true
categories: [spring]
tags: [spring]
description: 스프링 프로젝트에서 Sentry (에러 트래킹 서비스)를 연동하는 방법에 대해서 알아보자
---

# 스프링 부트 프로젝트 sentry 적용

## 1. 들어가며
Sentry는 에러트래킹 서비스로 Error,Exception(우리는 2개가 다르다는 것을 아니까)가 발생했을때 (편의상 에러라고 하겠다.) 에러에 대한 기록들을 트래킹하기 쉽게 모니터링을 제공해주는 서비스라고 생각하면 되겠다. 

javascript, java, python등 다양한 언어와 프레임워크를 지원하기 때문에 거의 모든 애플리케이션에서 (비용이 부담되지 않는 선에서) 사용하는 것이 좋다.

## 2. Sentry 프로젝트 셋팅
- project 생성시 platform JAVA, LogBack 선택
- SDK setup 탭에서 DSN 정보가 중요!
- sentry.properties 파일 생성
  - DSN (client Key) 값 등등 입력한다.

## 3. 애플리케이션에 dependency 추가
pom 파일에 sentry-logback 라이브러리 추가

  ```xml
  <dependency>
    <groupId>io.sentry</groupId>
    <artifactId>sentry-logback</artifactId>
    <version>1.7.30</version>
  </dependency>
  ```

`logback.xml` 파일 작성
  ```xml
<!-- appender 2개 추가 -->
<!-- 1. Console -->
<appender name="Console" class="ch.qos.logback.core.ConsoleAppender">
  <encoder>
    <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
  </encoder>
</appender>
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

<!-- INFO 이상의 로그는 아래 Appender를 통해 처리 되도록 -->
<root level="INFO">
  <appender-ref ref="STDOUT"/> <!-- 기존 logback 코드임 --> 
  <appender-ref ref="Console" />  <!-- Sentry를 위한 코드임 -->
  <appender-ref ref="Sentry" /> <!-- Sentry를 위한 코드임 -->
</root>
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
