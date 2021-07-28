---
layout: post
title: 리눅스 Tree 명령어로 폴더 구조 보기
date: 2021-07-28 12:09 +0900
image: 'https://i.pinimg.com/originals/c7/b8/11/c7b8113247fecd83bd9b5ed5bd3f34d5.png'
tags: ['linux', 'tree']
toc: true
description: 리눅스 tree명령어를 통해서 폴더구조 보기
---
# 리눅스  Tree 명령어로 폴더 구조 보기 

## 1. tree 명령어 설치 

```shell
# 리눅스에서 설치
sudo yum install tree

# 맥에서 설치 (homebrew로 이용)
brew install tree
```



## 2. tree명령어

```shell
$ tree -L 2 
$ tree -L 2 -f 
```

폴더 Level을 2depth 까지만 설정해서 보겠다는 의미 

- `-f 옵션`: 파일의 전체 경로를 표시 
- `-d 옵션`: 디렉토리만 표시 (파일은 제외됨)
- `-L 옵션`: 폴더,파일 구조의 레벨 depth를 표시 



## 3. tree 사용 예제 

특정 spring-quartz 프로젝트 파일로 이동후, tree명령어 실행

```shell
$ spring-quartz tree -L 2 
.
├── HELP.md
├── mvnw
├── mvnw.cmd
├── pom.xml
├── spring-quartz.iml
├── src
│   ├── main
│   └── test
└── target
    ├── classes
    ├── generated-sources
    ├── generated-test-sources
    └── test-classes

8 directories, 5 files
```

- depth 2로 보여줘라



```shell
$ spring-quartz tree -L 2 -d -f 
.
├── ./src
│   ├── ./src/main
│   └── ./src/test
└── ./target
    ├── ./target/classes
    ├── ./target/generated-sources
    ├── ./target/generated-test-sources
    └── ./target/test-classes
```

- depth2로 보여주고, 디렉토리만, 파일의 전체 경로를 보여줘라
