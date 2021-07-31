---
layout: post
title: 리눅스 파일,폴더 권한 관리(feat. chmod)
date: 2021-07-15 17:09 +0900
image: 'https://i.pinimg.com/originals/c7/b8/11/c7b8113247fecd83bd9b5ed5bd3f34d5.png'
tags: [linux, chmod]
toc: true
description: 리눅스의 파일,폴더 권한 설정과 chmod를 명령어를 이용한 파일 권한 주는 방법에 대해서 알아본다.
---
# 리눅스 파일,폴더 권한 관리

리눅스는 멀티 유저 시스템이기 때문에, 파일과 폴더에 관한 권한 관리가 필요하다. 



## 1. 리눅스 권한에 대해서 알아보자!

디렉토리의 컨텐츠를 보는  `ls -al` 명령어로 아무 디렉토리를 검색해보자. 여기에서는 예제를 위해서 임의로 `hello.txt`파일을 만들었다. 

해당 디렉토리에 있는 모든 상세한 정보들이 다음과 같이 표시된다. 

```shell
$ ls -al
-rw-r--r--  1 root  root     0B  7 15 10:42 hello.txt
```

여기서 우리가 주목할 것은 해당 파일 맨 앞에 있는 `-rw-r--r--`  이렇게 생긴 부분이다. 

제일 앞에 한칸은 `-`  (파일) 혹은  `d`(디렉토리) 구성된다. 

그 다음에 이어지는  `rw-r--r--` 이 부분이 바로 **권한에 대한 부분** 이고, 우리가 다룰 부분이다. 



### 1.1. rwx가 무엇인지? 

일단 rwx는 **r**ead, **w**rite, **e**xecute의 첫 머릿글자를 따서 rwx라고 표기한다. (항상 순서도 rwx 순으로 표기한다.)



### 1.2. 어떻게 구성되어 있나? 

위에서 `rw-r--r--` 가 권한에 대한 부분이라고 했는데, 총 3개씩 끊어서 읽으면 된다.

 `rw-`/ `r--`/ `r--`  순서대로 `소유자(owner)`, `그룹(group)`, `다른사용자(other)` 로 각각 권한 여부를 설정한다. 

그렇다면 다음과 같이 각 소유자,그룹, 다은 사용자에게 어떤 권한들이 매핑되었는지 봅시다. 

- 소유자(owner):  rw- (읽기, 쓰기)
- 그룹(group): r-- (읽기)
- 다른 사용자(other): r-- (읽기)



## 2. 리눅스 파일/폴더 권한 변경하는 방법

이제 실제로 해당 파일의 권한을 변경하는 명령어인 `chmod` 사용 방법을 알아보자. 

> chmod 명령어는 파일의 권한을 변경하거나, access control lists를 변경하는 명령어



```shell
chmod 777 hello.txt 
```

여기서 777이라는 숫자가 바로 **권한 레벨**이고, 각 자리수는 (소유자의 권한)(그룹의 권한)(다른 사용자에 권한)을 나타낸다. 

### 2.1. 그렇다면 7이라는 숫자는 어떻게 나왔을까? 

먼저 7이라는 숫자는 **r**ead(4), **w**rite(2), **e**xecute(1)로 구성되어있다. 그렇기 때문에 읽기, 쓰기, 실행 권한을 다주게 되면 4+2+1 = 7이라는 숫자가 나온다. 읽기, 쓰기권한만 준다면 4 + 2 = 6이라는 숫자가 나온다.

> 여기에서 왜? 1,2,4 라는 숫자를 사용했을까? 
>
> 이건 한 번 생각해 보면 좋을 거 같다!!



아무튼 다음과 같이 hello.txt 파일에 권한을 rwx로 모든 권한을 주고,  `ls -al` 로 결과를 확인하면 다음과 같이. 소유자, 그룹, 다른사용자에게 모두 읽기, 쓰기, 실행 권한을 부여한 것을 알 수 있다. 

```shell
$ chmod 777 hello.txt
$ ls -al
-rwxrwxrwx   1 root  root    0  7 15 10:42 hello.txt 
```



### 2.2. 그렇다면, 주로 어디에 쓰이나? 

백엔드 작업을 주로 하는경우, shell script 실행을 하거나, AWS의 pem키 파일로 SSH 접속을 해야 하는 경우, 각 파일들에 실행 권한이 없어서, 실행이 되지 않는 경우가 있다. 이럴때, 다음에 나오는 `chmod` 명령어를 통해서 파일과 폴더의 권한 레벨을 설정할 수 있다. 