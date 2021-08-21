---
layout: post
title: shell 변경 방법(ft, bash테마 설치하기)
date: 2021-08-21 12:33 +0900
toc: true
tags: [shell]
categories: [shell]
image: 'https://iterm2.com/img/logo2x.jpg'
description: 
sitemap: true
published: true
---
## 1. shell 목록 확인 방법

```shell
cat /etc/shells
```

다음과 같이 shell목록들이 나온다.
```
/bin/bash
/bin/csh
/bin/dash
/bin/ksh
/bin/sh
/bin/tcsh
/bin/zsh
```



## 2. shell 변경 방법 

```shell
chsh -s /bin/bash
chsh -s /bin/zsh
```



## 3. 자신의 현재 shell 확인 방법

```shell
ps -p $$
```

`-p  {pid}` 로 process의 id를 넘긴다. $는 현재 프로세스의 pid를 리턴한다. 지금 현재 프로세스는 shell 이기 때문에 결과가 다음과 같이 나온다. 

```shell
  PID TTY           TIME CMD
35002 ttys008    0:00.37 -z
```



## 4. Bash 테마 변경 - Bash it 설치 방법

```shell
# clone library
git clone --depth=1 https://github.com/Bash-it/bash-it.git ~/.bash_it
# install library
~/.bash_it/install.sh
```

- git clone `--depth=1`  의 옵션은 여러개의 커밋중에 가장 최근꺼 1개만 커밋한다는 옵션