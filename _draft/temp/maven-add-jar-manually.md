---
layout: post
title: "Spring Boot 프로젝트에 외부 라이브러리(jar) 추가하기"
date: 2020-05-07 11:49 +0900
---

> 스프링 프로젝트에서 custom한 jar파일을 메뉴얼로 추가하는 방법에 대해서 알아보자 . 

Spring Boot 프로젝트에서 외부 jar 파일을 추가하는데, 로컬 레포지토리에(.m2폴더 하위) 기존의 라이브러리가 캐쉬되어있어서 새로운 버전이 적용이 되지 않았다. 

> ※  m2 Repository는 무엇? 
> maven은 3가지 타입의 레포지토리를 제공한다.
>
> - local: 개발자 컴퓨터의 로컬레포지토리
> - central: maven comunity에서 제공하는 레포지토리
> - remote: 사내 전사적으로 구성하기 위해서 외부에 설치한 레포지토리 
>
> 이중에 `.m2` 는 로컬 레포지토리의 폴더 이름이다.  경로는 `/Users/<user_name>/.m2/`



## 방법1) scope변경

```java
<dependency>
    <groupId>lgdacom</groupId>
    <artifactId>XPayClient</artifactId>
    <version>1.1.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/repo/lgdacom/XPayClient/1.1.0/XPayClient-1.1.0.jar</systemPath>
</dependency>
```

다음과 같이 scope와 SystemPath를 직접 설정했다. 하지만 문제는 jenkins를 통한 빌드를 할때, system scope로 빌드할때 해당 jar파일이 누락된다. 결국 적용할 수 없었다. 



## 방법 2) mvn install 커맨드 명령어로 직접 추가하는 방법

```shell
# 다음과 같은 형식으로 지정
$ mvn install:install-file -Dfile={projectRootPath} -DgroupId={groupId} -DgartifactId={artifactId} -Dversion={version} -Dpackaing=jar

# 실제 적용 코드 
$ mvn install:install-file -Dfile=repo/lgdacom/XPayClient/1.1.0/XPayClient-1.1.0.jar -DgroupId=lgdacom -DartifactId=XPayClient -Dversion=1.1.0 -Dpackaging=jar
```

이렇게 적용하게 되면,  다음과 같이 m2 폴더 하위로 install 된다.

```shell
[INFO] Installing /Users/geonguk/workspace/xxxx/repo/lgdacom/XPayClient/1.1.0/XPayClient-1.1.0.jar to /Users/geonguk/.m2/repository/lgdacom/XPayClient/1.1.0/XPayClient-1.1.0.jar

```

