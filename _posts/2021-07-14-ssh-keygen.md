---
layout: post
title: SSH 키 생성하고, 원격서버에 접속하는 방법
date: 2021-07-14 23:13 +0900
image: 'https://www.abobwhite.com/content/images/2019/06/ssh.jpg'
tags: [ssh, git, ssh-keygen]
toc: true
description: SSH 키생성하고, 원격서버에 접속하는 방법, 공개키 인증 방식에 대해서도 알아본다.
---
# SSH 키 생성하고, 원격서버에 접속하는 방법

## 1. SSH는 뭘까요? 

SSH는 (Secure Shell)로 원격지에 있는 서버(인스턴스, 컴퓨터)에 접속하는 안전한 프로토콜이다. 

WireShark라는 패킷 프로그램을 통해서 중간에 가로쳐서 패킷을 열어보면, 사람이 이해할 수 없는 내용으로 패킷을 주고 받는다. 암튼, 리모트로 접속하는데 비교적 안전한(Secure)한 방법을 제공한다. 

## 2. SSH 원격 접속하기

**다음에는 실제 `AWS나 클라우드의 서버환경`에 접속하는 방법을 알아보자!**
AWS를 기준으로 인스턴스에 접속할 수 있는 `AWS_KEY.pem` 파일이 존재하고, 이를 로컬에 가지고 있다. 

2가지 방식이 존재하는데, 첫번째는 단일한 커맨드를 사용해서 접속하는 방법이고, 2번째는 config 파일로써 여러개의 접속정보를 한 파일(config)파일에서 관리하는 방법이 있다. 

### 2.1. 사전 준비 작업

`AWS_KEY.pem`파일에는 `chmod +x`를 통해서 실행가능한 상태로 변경해줘야 한다. 

```shell
$ chmod +x ~/.ssh/AWS_KEY.pem 
```



### 2.2. 방법 1) ssh 커맨드로 접속하는 방법

```shell
$ ssh -i pem키경로 사용자명@도메인(또는 IP주소)

# 실제 예제 
$ ssh -i ~/.ssh/AWS_KEY.pem centos@123.123.112.22
```

ssh 명령은 기본 SSH 키로 `~/.ssh/id_rsa` 요놈을 사용한다. 그러니 다른키를 사용하는 거면(우리처럼 AWS의 키를 사용하는 거라면) `-i`옵션을 주어서 사용할 키를 지정한다. 



> #### 📌ssh 메뉴얼 문서 
>
> -i identity_file
> Selects a file from which the identity (private key) for public key authentication is read.  The default is ~/.ssh/id_dsa, ~/.ssh/id_ecdsa, ~/.ssh/id_ed25519 and ~/.ssh/id_rsa.



### 2.3. 방법 2) config 파일로 접속 정보 관리

`vi ~/.ssh/config` config 파일을 만들어서 접속 정보를 넣어준다.

```shell
Host 호스트명
    HostName 호스트IP
    User 호스트사용자명
    IdentityFile pem키
```

실제 다음과 같이 여러개의 접속 정보를 호스트명을 달리해서 넣어줄 수 있다. 

```shell
Host dev1
	HostName 123.123.112.22
	User centos
	IdentityFile ~/.ssh/AWS_KEY.pem
Host alpha1
	HostName 123.123.112.23
	User centos
	IdentityFile ~/.ssh/AWS_KEY.pem
Host product1
	HostName 123.123.112.24
	User centos
	IdentityFile ~/.ssh/AWS_KEY.pem
```



실제 접속 명령어는 다음과 같다.

```shell
$ ssh dev1
$ ssh alpha1
$ ssh product1
```



> 주의할점은 IdentityFile 의 경로에 pem키 말고, 로컬에서 생성한 경우, id_rsa (private) 키를 등록한다. pub키가 아니다!!!!!!!!!



## 3. ssh 파일 만들기 

ssh-keygen을 통해서 SSH 키를 생성할 수 있다. 

```shell
$ ssh-keygen -t rsa
Generating public/private rsa key pair.
# 저장할 경로 없으면 기본 경로로 엔터
Enter file in which to save the key (/Users/home/.ssh/id_rsa):
# 그냥 엔터
Enter passphrase (empty for no passphrase):
# 그냥 엔터
Enter same passphrase again:
Your identification has been saved in /Users/home/.ssh/id_rsa.
Your public key has been saved in /Users/home/.ssh/id_rsa.pub.
The key fingerprint is:
SHA256:Ur22RxkXhl5MYB0WCpcsOQDSMqDyp+mrF3Szg+F2Ci4 home@aaaaaa.local
The key's randomart image is:
+---[RSA 3072]----+
|  .........o+BBo |
| .  o..  .+++++. |
|o    o  . .+o..  |
|..o o  .   ..+   |
| o.+.o. S o o    |
|. =++  . . o     |
|.oo+ .    . .    |
|Eoo        .     |
|ooo.             |
+----[SHA256]-----+
```

`-t`옵션으로 어떤 알고리즘을 적용할지를 선택한다. 

- dsa | ecdsa | ed25519 | rsa  (메뉴얼 문서에 다음과 같은 알고리즘이 존재한다.)
- 저장할 경로를 선택하고, passphrase를 입력하는데 둘다 default로 `엔터`를 쳤다.
- 다음과 같이 2개의 키 쌍이 생성이 된다. 
  - 개인키: ~/.ssh/id_rsa 
  - 공개키: ~/.ssh/id_rsa.pub





## 4. Github 공개키 🔑 등록

### 4.1. 왜? 

일단은 github를 사용한다는 건, 원격지에 소스를 push하고 pull 받는다. github에서는 https와 ssh 2가지 방식의 프로토콜로 접속하는 방법이 있다. https는 기본 username/password와 같은 방식을 사용하고, ssh는 공개키 인증방식을 사용해서 SSH이름에 걸맞게 안전하게(Secure하게) 접속한다. 

그렇기 때문에 위에서 생성한 공개키(is_rsa.pub)는 외부에 공개해도 상관이 없다. 그래서 Github 자신의 계정에 공개키를 등록하고, SSH통신을 할때, 자신의 로컬서버에 있는 개인키를 가지고, Github서버와 통신을 시도한다, Github 서버에는 개인키와 쌍이 되는 공개키가 이미 등록되어있기 때문에, 쌍을 확인한다. 매칭되는 정보가 없으면, 접속정보(인증)에 실패하게 된다. 

>  id_rsa(private)키는 절대로 절대로‼️‼️ 공개되면 안된다.



### 4.2. Github 에 공개키 등록하는 방법

- URL로 대신: [https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)