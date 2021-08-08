---
layout: post
title: '리눅스 SCP 파일복사'
tags: [linux]
image: 'https://blog.kakaocdn.net/dn/bEUX6s/btqAavSzerd/Q8tjjThKJ82PS4HrBFp5Sk/img.png'
categories: [linux]
description: 리눅스 SCP 명령어를 통한 리모트 서버로 파일복사 하는 방법
date: 2021-06-28 20:37 +0900
---
로컬에서 리모트 서버로 파일을 복사하는 SCP에 대해서 알아보자.



## 1. {로컬} to {리모트 서버}로 파일 복사하기 

```shell
# 기본 사용법
$ scp [옵션][현재경로] [리모트계정]@[리모트IP]:[리모트 디렉토리]

# 예제) 현재폴더 to AWS의 /home/centos 경로로 파일을 복사
$ scp -i ~/aws_key.pem -r ./ centos@123.123.123.88:/home/centos/ 
```

- `-r ` 옵션은 하위 폴더까지 복사
  > scp 옵션이 더 궁금하다면 
  > $ man  scp로 메뉴얼 문서를 읽자! 
- AWS Pem KEY가 존재한다면 `-i`옵션으로 pem파일 키 위치를 지정해준다. 



## 2. {리모트 서버} to {로컬}로 파일 복사하기

```shell
$ scp [옵션][리모트 계정]@[리모트 서버주소]:[디렉토리] [로컬 디렉토리]
# 예제) 리모터서버의 /home/centos하위의 모든 경로를 현재 로컬 디렉토리로 복사하기
$ scp -r centos@123.123.123.88:/home/centos ./
```



